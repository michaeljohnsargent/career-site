/**
 * Minimal in-process rate limiting for the public chat endpoint.
 *
 * The endpoint is unauthenticated and every call spends the site owner's
 * OpenRouter quota, so an unthrottled public URL can be drained by a single
 * script. This keeps casual abuse out without adding a dependency.
 *
 * Known limits, stated plainly rather than discovered later:
 *   - state lives in process memory, so it resets on deploy or cold start
 *   - each serverless instance counts separately, so the effective ceiling is
 *     the limit multiplied by the number of warm instances
 *   - a caller rotating IP addresses is only stopped by the global ceiling
 *
 * For a personal site that trade is reasonable. If this ever needs to be
 * correct rather than merely useful, move the counters to Redis (Upstash's
 * free tier is the usual choice) and keep this interface.
 */

export const PER_IP_LIMIT = 10;
export const PER_IP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const GLOBAL_DAILY_LIMIT = 300;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "per-ip" | "global"; retryAfterSeconds: number };

type State = {
  hits: Map<string, number[]>;
  dayStartedAt: number;
  dayCount: number;
};

function freshState(now: number): State {
  return { hits: new Map(), dayStartedAt: now, dayCount: 0 };
}

// Module scope survives between requests on a warm instance, which is the
// whole point. It is deliberately not exported.
let state: State = freshState(Date.now());

/** Test seam: drops all counters. */
export function resetRateLimit(now: number = Date.now()): void {
  state = freshState(now);
}

/**
 * Derives a caller key from proxy headers. Azure App Service and most CDNs set
 * `x-forwarded-for`; the first entry is the original client.
 */
export function clientKeyFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  // Roll the global window over at the day boundary.
  if (now - state.dayStartedAt >= 24 * 60 * 60 * 1000) {
    state.dayStartedAt = now;
    state.dayCount = 0;
    state.hits.clear();
  }

  if (state.dayCount >= GLOBAL_DAILY_LIMIT) {
    const msLeft = state.dayStartedAt + 24 * 60 * 60 * 1000 - now;
    return {
      allowed: false,
      reason: "global",
      retryAfterSeconds: Math.max(1, Math.ceil(msLeft / 1000)),
    };
  }

  const cutoff = now - PER_IP_WINDOW_MS;
  const recent = (state.hits.get(key) ?? []).filter((at) => at > cutoff);

  if (recent.length >= PER_IP_LIMIT) {
    const oldest = recent[0] ?? now;
    const msLeft = oldest + PER_IP_WINDOW_MS - now;
    state.hits.set(key, recent);
    return {
      allowed: false,
      reason: "per-ip",
      retryAfterSeconds: Math.max(1, Math.ceil(msLeft / 1000)),
    };
  }

  recent.push(now);
  state.hits.set(key, recent);
  state.dayCount += 1;

  // Opportunistic pruning so the map cannot grow without bound on a long-lived
  // instance. Cheap because it only runs when the map is already large.
  if (state.hits.size > 5000) {
    for (const [existingKey, timestamps] of state.hits) {
      if (timestamps.every((at) => at <= cutoff)) state.hits.delete(existingKey);
    }
  }

  return { allowed: true };
}
