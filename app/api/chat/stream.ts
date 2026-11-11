/**
 * Parser for OpenRouter's Server-Sent Events stream, kept separate from the
 * route so it can be unit tested without a network call.
 *
 * Wire format, per OpenRouter's streaming documentation:
 *   - lines beginning with ":" are keepalive comments and carry no data
 *   - payload lines look like `data: {json}`
 *   - the stream ends with `data: [DONE]`
 *   - a mid-stream failure arrives as a top-level `error` field inside an
 *     otherwise successful 200 response, so it cannot be caught by status code
 *   - a final usage chunk may arrive with empty delta content
 *
 * Chunks from the network do not respect line boundaries, so partial lines are
 * buffered until a newline arrives.
 */

export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; finishReason: string | null; model: string | null }
  | { type: "error"; message: string };

type Chunk = {
  model?: unknown;
  error?: unknown;
  choices?: Array<{
    delta?: { content?: unknown };
    finish_reason?: unknown;
  }>;
};

function errorMessageFrom(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === "string" && message.trim()) return message;
  }
  return "The model stopped partway through.";
}

/**
 * Creates a parser that accepts decoded text chunks and returns the events
 * found in them. Call `flush()` once the network stream ends to surface a
 * trailing line that arrived without a final newline.
 */
export function createStreamParser() {
  let buffer = "";
  let finished = false;
  let model: string | null = null;
  let finishReason: string | null = null;

  function handleLine(line: string): StreamEvent[] {
    const trimmed = line.trim();

    // Blank separators and keepalive comments carry nothing.
    if (!trimmed || trimmed.startsWith(":")) return [];
    if (!trimmed.startsWith("data:")) return [];

    const payload = trimmed.slice("data:".length).trim();
    if (!payload) return [];

    if (payload === "[DONE]") {
      if (finished) return [];
      finished = true;
      return [{ type: "done", finishReason, model }];
    }

    let chunk: Chunk;
    try {
      chunk = JSON.parse(payload) as Chunk;
    } catch {
      // A single malformed line should not kill an otherwise good stream.
      return [];
    }

    if (chunk.error) {
      finished = true;
      return [{ type: "error", message: errorMessageFrom(chunk.error) }];
    }

    if (typeof chunk.model === "string" && chunk.model) model = chunk.model;

    const choice = chunk.choices?.[0];
    if (choice && typeof choice.finish_reason === "string") {
      finishReason = choice.finish_reason;
    }

    const content = choice?.delta?.content;
    if (typeof content === "string" && content.length > 0) {
      return [{ type: "delta", text: content }];
    }

    return [];
  }

  return {
    /** Feeds a decoded text chunk and returns any complete events it contained. */
    push(text: string): StreamEvent[] {
      buffer += text;
      const events: StreamEvent[] = [];
      let newline = buffer.indexOf("\n");

      while (newline !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        events.push(...handleLine(line));
        newline = buffer.indexOf("\n");
      }

      return events;
    },

    /** Handles a trailing partial line and guarantees a terminal event. */
    flush(): StreamEvent[] {
      const events: StreamEvent[] = [];

      if (buffer.trim()) {
        events.push(...handleLine(buffer));
        buffer = "";
      }

      if (!finished) {
        finished = true;
        events.push({ type: "done", finishReason, model });
      }

      return events;
    },

    get servedModel(): string | null {
      return model;
    },
  };
}

/**
 * The newline-delimited JSON this route sends to the browser. One object per
 * line, so the client can act on a mid-stream error or a truncated answer
 * rather than silently rendering a half sentence as if it were complete.
 */
export type ClientEvent =
  | { delta: string }
  | { error: string }
  | { done: true; truncated: boolean };

export function encodeClientEvent(event: ClientEvent): string {
  return `${JSON.stringify(event)}\n`;
}
