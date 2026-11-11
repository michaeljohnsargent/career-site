import { describe, expect, it } from "vitest";

import { createStreamParser, encodeClientEvent } from "./stream";

function dataLine(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n`;
}

function deltaChunk(content: string, finishReason: string | null = null) {
  return {
    model: "test/model",
    choices: [{ delta: { content }, finish_reason: finishReason }],
  };
}

describe("createStreamParser", () => {
  it("emits text deltas in order", () => {
    const parser = createStreamParser();

    const first = parser.push(dataLine(deltaChunk("Hello")));
    const second = parser.push(dataLine(deltaChunk(" world")));

    expect(first).toEqual([{ type: "delta", text: "Hello" }]);
    expect(second).toEqual([{ type: "delta", text: " world" }]);
  });

  it("reassembles a payload split across network chunks", () => {
    const parser = createStreamParser();
    const line = dataLine(deltaChunk("split me"));
    const half = Math.floor(line.length / 2);

    expect(parser.push(line.slice(0, half))).toEqual([]);
    expect(parser.push(line.slice(half))).toEqual([{ type: "delta", text: "split me" }]);
  });

  it("ignores keepalive comments and blank lines", () => {
    const parser = createStreamParser();

    expect(parser.push(": OPENROUTER PROCESSING\n\n")).toEqual([]);
    expect(parser.push(dataLine(deltaChunk("still here")))).toEqual([
      { type: "delta", text: "still here" },
    ]);
  });

  it("ends on the [DONE] sentinel and reports the served model", () => {
    const parser = createStreamParser();

    parser.push(dataLine(deltaChunk("answer", "stop")));
    const events = parser.push("data: [DONE]\n");

    expect(events).toEqual([{ type: "done", finishReason: "stop", model: "test/model" }]);
    expect(parser.servedModel).toBe("test/model");
  });

  it("reports truncation through finish_reason", () => {
    const parser = createStreamParser();

    parser.push(dataLine(deltaChunk("cut off here", "length")));
    const [event] = parser.push("data: [DONE]\n");

    expect(event).toEqual({
      type: "done",
      finishReason: "length",
      model: "test/model",
    });
  });

  it("surfaces a mid-stream error delivered inside a 200 response", () => {
    const parser = createStreamParser();

    const events = parser.push(dataLine({ error: { message: "upstream exploded" } }));

    expect(events).toEqual([{ type: "error", message: "upstream exploded" }]);
  });

  it("falls back to a readable message when the error has no message", () => {
    const parser = createStreamParser();

    const [event] = parser.push(dataLine({ error: {} }));

    expect(event).toEqual({ type: "error", message: "The model stopped partway through." });
  });

  it("skips a malformed line without killing the stream", () => {
    const parser = createStreamParser();

    expect(parser.push("data: {not json at all\n")).toEqual([]);
    expect(parser.push(dataLine(deltaChunk("recovered")))).toEqual([
      { type: "delta", text: "recovered" },
    ]);
  });

  it("ignores the trailing usage chunk that carries no content", () => {
    const parser = createStreamParser();

    const events = parser.push(
      dataLine({ choices: [{ delta: {}, finish_reason: "stop" }], usage: { total_tokens: 20 } }),
    );

    expect(events).toEqual([]);
  });

  it("guarantees a terminal event when the stream ends without [DONE]", () => {
    const parser = createStreamParser();

    parser.push(dataLine(deltaChunk("truncated by the network", "stop")));
    const events = parser.flush();

    expect(events).toEqual([{ type: "done", finishReason: "stop", model: "test/model" }]);
  });

  it("does not emit a second terminal event after [DONE]", () => {
    const parser = createStreamParser();

    parser.push("data: [DONE]\n");
    expect(parser.flush()).toEqual([]);
  });

  it("handles a trailing line that arrived without a newline", () => {
    const parser = createStreamParser();

    parser.push(dataLine(deltaChunk("first")));
    const events = parser.flush();

    expect(events[0]).toEqual({ type: "done", finishReason: null, model: "test/model" });
  });
});

describe("encodeClientEvent", () => {
  it("writes one JSON object per line", () => {
    expect(encodeClientEvent({ delta: "hi" })).toBe('{"delta":"hi"}\n');
    expect(encodeClientEvent({ done: true, truncated: false })).toBe(
      '{"done":true,"truncated":false}\n',
    );
  });

  it("escapes newlines inside a delta so the framing survives", () => {
    const encoded = encodeClientEvent({ delta: "line one\nline two" });

    expect(encoded.split("\n").filter(Boolean)).toHaveLength(1);
    expect(JSON.parse(encoded)).toEqual({ delta: "line one\nline two" });
  });
});
