"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "What makes my experience different?",
  "Tell me about the six-week delivery.",
  "What have I built with AI?",
];

export default function TwinChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const feed = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || sending) return;

    const isRetry = messages.at(-1)?.role === "user" && messages.at(-1)?.content === content;
    const nextMessages = isRetry ? messages : [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setSending(true);
    requestAnimationFrame(() => feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12) }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== "string") {
        throw new Error(typeof data.error === "string" ? data.error : "Please try again in a moment.");
      }
      setMessages([...nextMessages, { role: "assistant", content: data.answer }]);
      requestAnimationFrame(() => feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Connection hiccup. Please try again.");
      setMessages(nextMessages);
    } finally {
      setSending(false);
      input.current?.focus();
    }
  }

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

  return (
    <section className="twin" id="digital-twin" aria-labelledby="twin-title">
      <div className="twin-inner">
        <div className="section-kicker twin-kicker"><span className="mark">06</span> ASK THE DIGITAL TWIN</div>
        <div className="twin-heading">
          <div><h2 id="twin-title">Good questions.<br /><span className="serif-word">Straight answers.</span></h2><p>Explore Michael’s career, projects, and engineering approach. The twin sticks to the résumé—and says when it doesn’t know.</p></div>
          <div className="twin-status"><span className="availability-dot" /> GROUNDED IN MICHAEL’S EXPERIENCE</div>
        </div>

        <div className="chat-window">
          <div className="chat-topline"><div className="chat-avatar">MS<span>.</span></div><div className="chat-heading"><strong>Michael’s career twin</strong><span>ENGINEERING · PROJECTS · EXPERIENCE</span></div><div className="chat-live"><i /> LIVE</div></div>
          <div className="chat-feed" ref={feed} aria-live="polite" aria-label="Conversation">
            <div className="chat-message assistant-message"><div className="message-avatar">MS</div><div className="message-bubble"><p>Hi there. Ask me anything about Michael’s career, the systems he’s built, or how he approaches engineering.</p><span className="message-time">MICHAEL’S CAREER TWIN</span></div></div>
            {messages.map((message, index) => <div className={`chat-message ${message.role === "user" ? "user-message" : "assistant-message"}`} key={`${index}-${message.role}`}>
              {message.role === "assistant" && <div className="message-avatar">MS</div>}
              <div className="message-bubble"><p>{message.content}</p><span className="message-time">{message.role === "user" ? "YOU" : "MICHAEL’S CAREER TWIN"}</span></div>
            </div>)}
            {sending && <div className="chat-message assistant-message"><div className="message-avatar">MS</div><div className="message-bubble typing-bubble"><span /><span /><span /><span className="sr-only">Writing a response</span></div></div>}
          </div>
          {messages.length === 0 && <div className="suggestion-row" aria-label="Try asking"><span>TRY ASKING</span>{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)}>{suggestion}<span aria-hidden="true">↗</span></button>)}</div>}
          {error && <div className="chat-error" role="alert">{error} <button type="button" onClick={() => void sendMessage(messages.at(-1)?.content ?? "")}>RETRY ↗</button></div>}
          <form className="chat-form" onSubmit={submit}><textarea ref={input} value={draft} onChange={(event) => setDraft(event.target.value.slice(0, 1500))} onKeyDown={onKeyDown} placeholder="Ask about my career, projects, or experience…" maxLength={1500} rows={1} aria-label="Your question" disabled={sending} /><span className="chat-hint">ENTER TO SEND · SHIFT + ENTER FOR A NEW LINE</span><button type="submit" aria-label="Send message" disabled={sending || !draft.trim()}><span aria-hidden="true">↑</span></button></form>
          <div className="chat-disclaimer">AI-GENERATED ANSWERS · BASED ON MICHAEL’S RÉSUMÉ</div>
        </div>
        <p className="twin-contact">Want to speak with Michael directly? <a href="mailto:michaeljohnsargent@gmail.com">Send him a note <span aria-hidden="true">↗</span></a></p>
      </div>
    </section>
  );
}
