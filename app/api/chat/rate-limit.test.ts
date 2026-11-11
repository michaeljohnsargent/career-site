import { beforeEach, describe, expect, it } from "vitest";

import {
  GLOBAL_DAILY_LIMIT,
  PER_IP_LIMIT,
  PER_IP_WINDOW_MS,
  checkRateLimit,
  clientKeyFrom,
  resetRateLimit,
} from "./rate-limit";

const START = 1_700_000_000_000;

beforeEach(() => resetRateLimit(START));

describe("clientKeyFrom", () => {
  it("takes the first entry of x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" });

    expect(clientKeyFrom(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKeyFrom(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("returns a stable placeholder when no proxy headers are present", () => {
    expect(clientKeyFrom(new Headers())).toBe("unknown");
  });
});

describe("checkRateLimit", () => {
  it("allows requests up to the per-IP limit", () => {
    for (let i = 0; i < PER_IP_LIMIT; i += 1) {
      expect(checkRateLimit("1.1.1.1", START).allowed).toBe(true);
    }
  });

  it("blocks the request after the limit and says when to retry", () => {
    for (let i = 0; i < PER_IP_LIMIT; i += 1) checkRateLimit("1.1.1.1", START);

    const result = checkRateLimit("1.1.1.1", START);

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("per-ip");
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
      expect(result.retryAfterSeconds).toBeLessThanOrEqual(PER_IP_WINDOW_MS / 1000);
    }
  });

  it("keeps callers independent of one another", () => {
    for (let i = 0; i < PER_IP_LIMIT; i += 1) checkRateLimit("1.1.1.1", START);

    expect(checkRateLimit("1.1.1.1", START).allowed).toBe(false);
    expect(checkRateLimit("2.2.2.2", START).allowed).toBe(true);
  });

  it("lets a blocked caller back in once the window slides past", () => {
    for (let i = 0; i < PER_IP_LIMIT; i += 1) checkRateLimit("1.1.1.1", START);
    expect(checkRateLimit("1.1.1.1", START).allowed).toBe(false);

    const afterWindow = START + PER_IP_WINDOW_MS + 1;
    expect(checkRateLimit("1.1.1.1", afterWindow).allowed).toBe(true);
  });

  it("stops a distributed flood at the global daily ceiling", () => {
    for (let i = 0; i < GLOBAL_DAILY_LIMIT; i += 1) {
      // A fresh key each time, so the per-IP limit never trips.
      expect(checkRateLimit(`caller-${i}`, START).allowed).toBe(true);
    }

    const result = checkRateLimit("one-more", START);

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe("global");
  });

  it("rolls the global counter over at the day boundary", () => {
    for (let i = 0; i < GLOBAL_DAILY_LIMIT; i += 1) checkRateLimit(`caller-${i}`, START);
    expect(checkRateLimit("blocked", START).allowed).toBe(false);

    const nextDay = START + 24 * 60 * 60 * 1000 + 1;
    expect(checkRateLimit("blocked", nextDay).allowed).toBe(true);
  });
});
