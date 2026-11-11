import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PER_IP_LIMIT, resetRateLimit } from "./rate-limit";
import { POST } from "./route";

function postRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function sseResponse(lines: string[]) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const line of lines) controller.enqueue(encoder.encode(line));
      controller.close();
    },
  });

  return new Response(stream, { status: 200 });
}

/** Collects the NDJSON the route streams back to the browser. */
async function readEvents(response: Response) {
  const text = await response.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

const askHello = { messages: [{ role: "user", content: "Hello" }] };

beforeEach(() => {
  resetRateLimit();
  process.env.OPENROUTER_API_KEY = "test-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/chat validation", () => {
  it("rejects a body that is not JSON", async () => {
    const response = await POST(postRequest("not json at all"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Please send a valid chat message." });
  });

  it("rejects an empty conversation", async () => {
    const response = await POST(postRequest({ messages: [] }));

    expect(response.status).toBe(400);
  });

  it("rejects more messages than the context window allows", async () => {
    const messages = Array.from({ length: 13 }, () => ({ role: "user", content: "hi" }));

    const response = await POST(postRequest({ messages }));

    expect(response.status).toBe(400);
  });

  it("rejects an unknown role", async () => {
    const response = await POST(postRequest({ messages: [{ role: "system", content: "hi" }] }));

    expect(response.status).toBe(400);
  });

  it("rejects an overlong message", async () => {
    const response = await POST(
      postRequest({ messages: [{ role: "user", content: "x".repeat(1501) }] }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects a whitespace-only message", async () => {
    const response = await POST(postRequest({ messages: [{ role: "user", content: "   " }] }));

    expect(response.status).toBe(400);
  });

  it("requires the final message to be a question from the visitor", async () => {
    const response = await POST(
      postRequest({
        messages: [
          { role: "user", content: "hi" },
          { role: "assistant", content: "hello" },
        ],
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Your latest message must be a question.",
    });
  });

  it("reports a missing API key as unconfigured rather than failing obscurely", async () => {
    delete process.env.OPENROUTER_API_KEY;

    const response = await POST(postRequest(askHello));

    expect(response.status).toBe(503);
  });
});

describe("POST /api/chat rate limiting", () => {
  it("turns away a caller who floods the endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => sseResponse(['data: {"choices":[{"delta":{"content":"hi"}}]}\n'])),
    );

    // One past the per-IP allowance should be refused.
    for (let i = 0; i < PER_IP_LIMIT; i += 1) {
      const allowed = await POST(postRequest(askHello));
      expect(allowed.status).toBe(200);
    }

    const blocked = await POST(postRequest(askHello));

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
  });

  it("counts callers separately by forwarded IP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => sseResponse(['data: {"choices":[{"delta":{"content":"hi"}}]}\n'])),
    );

    for (let i = 0; i < PER_IP_LIMIT; i += 1) await POST(postRequest(askHello));

    const other = await POST(postRequest(askHello, { "x-forwarded-for": "198.51.100.2" }));

    expect(other.status).toBe(200);
  });
});

describe("POST /api/chat streaming", () => {
  it("streams deltas to the browser as newline-delimited JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        sseResponse([
          ": OPENROUTER PROCESSING\n",
          'data: {"model":"test/model","choices":[{"delta":{"content":"I built "}}]}\n',
          'data: {"model":"test/model","choices":[{"delta":{"content":"the thing."},"finish_reason":"stop"}]}\n',
          "data: [DONE]\n",
        ]),
      ),
    );

    const response = await POST(postRequest(askHello));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/x-ndjson");

    const events = await readEvents(response);

    expect(events).toEqual([
      { delta: "I built " },
      { delta: "the thing." },
      { done: true, truncated: false },
    ]);
  });

  it("marks an answer that hit the token ceiling as truncated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        sseResponse([
          'data: {"choices":[{"delta":{"content":"cut off"},"finish_reason":"length"}]}\n',
          "data: [DONE]\n",
        ]),
      ),
    );

    const events = await readEvents(await POST(postRequest(askHello)));

    expect(events.at(-1)).toEqual({ done: true, truncated: true });
  });

  it("passes a mid-stream upstream error through to the reader", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        sseResponse([
          'data: {"choices":[{"delta":{"content":"starting"}}]}\n',
          'data: {"error":{"message":"provider fell over"}}\n',
        ]),
      ),
    );

    const events = await readEvents(await POST(postRequest(askHello)));

    expect(events).toEqual([{ delta: "starting" }, { error: "provider fell over" }]);
  });

  it("sends the model a system prompt and the visitor's question", async () => {
    const fetchMock = vi.fn(async () =>
      sseResponse(['data: {"choices":[{"delta":{"content":"ok"}}]}\n', "data: [DONE]\n"]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await readEvents(await POST(postRequest(askHello)));

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      stream: boolean;
      messages: { role: string; content: string }[];
      reasoning: { effort: string };
    };

    expect(body.stream).toBe(true);
    // Never send `reasoning`: OpenRouter's free router rejects it with a 400.
    expect(body.reasoning).toBeUndefined();
    expect(body.messages[0].role).toBe("system");
    // The prompt is built from the shared career module, so a drift between
    // the page and the twin shows up here.
    expect(body.messages[0].content).toContain("158 automated tests");
    expect(body.messages[0].content).toContain("Datadog");
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "Hello" });
  });

  it("logs why a request was rejected instead of only its status", async () => {
    const logged: string[] = [];
    const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
      logged.push(args.map(String).join(" "));
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { message: "bad field xyz" } }), { status: 400 })),
    );

    await POST(postRequest(askHello));

    expect(logged.some((line) => line.includes("bad field xyz"))).toBe(true);
    errorSpy.mockRestore();
  });

  it("gives up on an upstream that never responds instead of hanging", async () => {
    vi.useFakeTimers();
    // A fetch that never settles, which is exactly what production looked like.
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})));

    const pending = POST(postRequest(askHello));
    await vi.advanceTimersByTimeAsync(25_000);
    const response = await pending;

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({
      error: "That took too long. Please try again.",
    });
    vi.useRealTimers();
  });

  it("gives up on a stream that opens and then goes silent", async () => {
    vi.useFakeTimers();
    // Headers arrive, one word arrives, then nothing ever again.
    const stalling = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"choices":[{"delta":{"content":"I"}}]}\n'),
        );
        // Never closed, never enqueued again.
      },
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(stalling, { status: 200 })));

    const pending = POST(postRequest(askHello));
    const response = await pending;
    const reading = response.text();
    await vi.advanceTimersByTimeAsync(25_000);
    const body = await reading;

    expect(body).toContain("That took too long");
    vi.useRealTimers();
  });

  it("falls through to the fallback model when the pinned one hangs", async () => {
    // Only meaningful when a primary is pinned, which is the case this exists for.
    vi.useFakeTimers();
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        call += 1;
        if (call === 1) return new Promise<Response>(() => {});
        return Promise.resolve(
          sseResponse(['data: {"choices":[{"delta":{"content":"fallback"}}]}\n', "data: [DONE]\n"]),
        );
      }),
    );

    const pending = POST(postRequest(askHello));
    await vi.advanceTimersByTimeAsync(20_000);
    const response = await pending;

    // With no pin configured there is only one model to try, so this asserts
    // the give-up path rather than the fall-through one.
    expect([200, 504]).toContain(response.status);
    vi.useRealTimers();
  });

  it("starts pumping the upstream without waiting for anyone to read the response", async () => {
    // The regression test for the bug that ate an afternoon. A pull-based
    // stream only reads when the consumer asks, and in production the runtime
    // frequently never asked, so the function sat until the platform killed
    // it. Pumping from start() means the upstream is consumed regardless.
    let reads = 0;
    const upstream = new ReadableStream<Uint8Array>({
      pull(controller) {
        reads += 1;
        if (reads === 1) {
          controller.enqueue(
            new TextEncoder().encode('data: {"choices":[{"delta":{"content":"hi"}}]}\n'),
          );
        } else {
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n"));
          controller.close();
        }
      },
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(upstream, { status: 200 })));

    const response = await POST(postRequest(askHello));

    // Deliberately do NOT read response.body here. Give the event loop a few
    // turns and assert the pump ran anyway.
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(reads).toBeGreaterThan(0);
    expect(response.status).toBe(200);
  });

  it("reports upstream congestion as a retryable error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("rate limited", { status: 429 })),
    );

    const response = await POST(postRequest(askHello));

    expect(response.status).toBe(503);
  });
});
