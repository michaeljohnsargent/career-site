"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string; truncated?: boolean };

/** Must match MAX_MESSAGES in app/api/chat/route.ts. */
const MAX_CONTEXT_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1500;

const suggestions = [
  "What makes your experience different?",
  "Tell me about the six-week delivery.",
  "What have you built with AI?",
];

type ClientEvent = Partial<{
  delta: string;
  error: string;
  done: boolean;
  truncated: boolean;
}>;

export default function TwinChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const feed = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const inFlight = useRef<AbortController | null>(null);

  // Abandon any request still running when the component goes away, so the
  // browser is not left holding a connection nobody is listening to.
  useEffect(() => {
    return () => inFlight.current?.abort();
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() =>
      feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" }),
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string, options: { retry?: boolean } = {}) => {
      const content = text.trim();
      if (!content || sending) return;

      // On a retry the question is already the last message in the thread, so
      // appending it again would duplicate it. Asking the same question twice
      // on purpose is a different thing and still adds a second message.
      const history = options.retry ? messages : [...messages, { role: "user" as const, content }];

      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setMessages(history);
      setDraft("");
      setError("");
      setSending(true);
      scrollToEnd();

      // The assistant's reply is appended empty and filled as tokens arrive.
      let answer = "";
      let opened = false;
      let failed = false;

      const openAnswer = () => {
        if (opened) return;
        opened = true;
        setMessages([...history, { role: "assistant", content: "" }]);
      };

      const updateAnswer = (truncated?: boolean) => {
        setMessages([...history, { role: "assistant", content: answer, truncated }]);
      };

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-MAX_CONTEXT_MESSAGES) }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data && typeof data.error === "string"
              ? data.error
              : "Please try again in a moment.",
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const handleLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          let event: ClientEvent;
          try {
            event = JSON.parse(trimmed) as ClientEvent;
          } catch {
            return;
          }

          if (typeof event.error === "string") {
            failed = true;
            setError(event.error);
            return;
          }

          if (typeof event.delta === "string") {
            openAnswer();
            answer += event.delta;
            updateAnswer();
            scrollToEnd();
            return;
          }

          if (event.done) {
            openAnswer();
            updateAnswer(event.truncated === true);
          }
        };

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let newline = buffer.indexOf("\n");
          while (newline !== -1) {
            handleLine(buffer.slice(0, newline));
            buffer = buffer.slice(newline + 1);
            newline = buffer.indexOf("\n");
          }
        }

        if (buffer.trim()) handleLine(buffer);

        // A stream that ended without producing a word is a failure, even
        // though every individual step reported success.
        if (!answer.trim() && !failed) {
          failed = true;
          setError("I could not get an answer just now. Please try again shortly.");
        }
      } catch (caught) {
        if (controller.signal.aborted) return;
        failed = true;
        setError(caught instanceof Error ? caught.message : "Connection hiccup. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          // Drop the empty placeholder if nothing ever arrived, so the feed
          // does not keep a blank bubble next to the error.
          if (failed && !answer.trim()) setMessages(history);
          setSending(false);
          inFlight.current = null;
          input.current?.focus();
        }
      }
    },
    [messages, scrollToEnd, sending],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  function retryLastQuestion() {
    const lastQuestion = [...messages].reverse().find((message) => message.role === "user");
    if (lastQuestion) void sendMessage(lastQuestion.content, { retry: true });
  }

  const canRetry = messages.some((message) => message.role === "user");
  const contextTrimmed = messages.length > MAX_CONTEXT_MESSAGES;

  return (
    <section className="twin" id="digital-twin" aria-labelledby="twin-title">
      <div className="twin-inner">
        <div className="section-kicker twin-kicker">
          <span className="mark">06</span> ASK THE DIGITAL TWIN
        </div>
        <div className="twin-heading">
          <div>
            <h2 id="twin-title">
              Good questions.
              <br />
              <span className="serif-word">Straight answers.</span>
            </h2>
            <p>
              Explore Michael&rsquo;s career, projects, and engineering approach. The twin sticks to
              the r&eacute;sum&eacute;, and says when it doesn&rsquo;t know.
            </p>
          </div>
          <div className="twin-status">
            <span className="availability-dot" /> GROUNDED IN MICHAEL&rsquo;S EXPERIENCE
          </div>
        </div>

        <div className="chat-window">
          <div className="chat-topline">
            <div className="chat-avatar">
              MS<span>.</span>
            </div>
            <div className="chat-heading">
              <strong>Michael&rsquo;s career twin</strong>
              <span>ENGINEERING &middot; PROJECTS &middot; EXPERIENCE</span>
            </div>
            <div className="chat-live">
              <i /> LIVE
            </div>
          </div>

          <div className="chat-feed" ref={feed} aria-live="polite" aria-label="Conversation">
            <div className="chat-message assistant-message">
              <div className="message-avatar">MS</div>
              <div className="message-bubble">
                <p>
                  Hi there. Ask me anything about my career, the systems I&rsquo;ve built, or how I
                  approach engineering.
                </p>
                <span className="message-time">MICHAEL&rsquo;S CAREER TWIN</span>
              </div>
            </div>

            {contextTrimmed && (
              <p className="chat-note">
                Only the last {MAX_CONTEXT_MESSAGES} messages stay in context, so earlier ones are
                no longer remembered.
              </p>
            )}

            {messages.map((message, index) => (
              <div
                className={`chat-message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                key={`${index}-${message.role}`}
              >
                {message.role === "assistant" && <div className="message-avatar">MS</div>}
                <div className="message-bubble">
                  {message.role === "assistant" && !message.content ? (
                    <span className="typing-bubble">
                      <span />
                      <span />
                      <span />
                      <span className="sr-only">Writing a response</span>
                    </span>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  {message.truncated && (
                    <span className="message-truncated">
                      This answer ran out of room before it finished.
                    </span>
                  )}
                  <span className="message-time">
                    {message.role === "user" ? "YOU" : "MICHAEL’S CAREER TWIN"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="suggestion-row" aria-label="Try asking">
              <span>TRY ASKING</span>
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)}>
                  {suggestion}
                  <span aria-hidden="true">&#8599;</span>
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="chat-error" role="alert">
              {error}{" "}
              {canRetry && (
                <button type="button" onClick={retryLastQuestion} disabled={sending}>
                  RETRY &#8599;
                </button>
              )}
            </div>
          )}

          <form className="chat-form" onSubmit={submit}>
            <textarea
              ref={input}
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, MAX_MESSAGE_CHARS))}
              onKeyDown={onKeyDown}
              placeholder="Ask about my career, projects, or experience&hellip;"
              maxLength={MAX_MESSAGE_CHARS}
              rows={1}
              aria-label="Your question"
              disabled={sending}
            />
            <span className="chat-hint">ENTER TO SEND &middot; SHIFT + ENTER FOR A NEW LINE</span>
            <button type="submit" aria-label="Send message" disabled={sending || !draft.trim()}>
              <span aria-hidden="true">&#8593;</span>
            </button>
          </form>

          <div className="chat-disclaimer">AI-GENERATED ANSWERS &middot; BASED ON MICHAEL&rsquo;S R&Eacute;SUM&Eacute;</div>
        </div>

        <p className="twin-contact">
          Want to speak with Michael directly?{" "}
          <a href="mailto:michaeljohnsargent@gmail.com">
            Send him a note <span aria-hidden="true">&#8599;</span>
          </a>
        </p>
      </div>
    </section>
  );
}
