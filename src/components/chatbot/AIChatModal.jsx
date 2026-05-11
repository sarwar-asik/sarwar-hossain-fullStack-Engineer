import { useEffect, useRef, useState, useCallback } from "react";
import { useChatbot } from "../../hooks/useChatbot";
import AIChatMessage from "./AIChatMessage";

const INTRO = "I'm Sarwar's AI. Ask me about my experience, projects, stack, or how to work together.";

const CHIPS = [
  { label: "--experience", prompt: "Tell me about your work experience" },
  { label: "--projects",   prompt: "What are your most impressive projects?" },
  { label: "--skills",     prompt: "What are your core technical skills?" },
  { label: "--hire",       prompt: "Are you available for hire? How can I reach you?" },
];

function relativeTime(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)          return "just now";
  if (s < 3600)        return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)       return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7)   return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AIChatModal({ isOpen, onClose }) {
  const { messages, input, setInput, isStreaming, error, sendMessage, clear, restoredAt, quota } = useChatbot();
  const [introText, setIntroText] = useState("");
  const [introDone, setIntroDone] = useState(false);
  const hasOpenedRef = useRef(false);
  const scrollRef    = useRef(null);
  const inputRef     = useRef(null);

  // Typewriter intro — only animated on first open
  useEffect(() => {
    if (!isOpen) return;
    if (hasOpenedRef.current) { setIntroText(INTRO); setIntroDone(true); return; }
    hasOpenedRef.current = true;
    setIntroText("");
    setIntroDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setIntroText(INTRO.slice(0, i));
      if (i >= INTRO.length) { clearInterval(iv); setIntroDone(true); }
    }, 18);
    return () => clearInterval(iv);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, introText, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const submit = useCallback(() => {
    if (input.trim()) sendMessage(input);
  }, [input, sendMessage]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  const hasUserMessages = messages.some((m) => m.role === "user");
  const showSpinner     = isStreaming && messages.at(-1)?.content === "";
  const canSend         = !isStreaming && quota.canSend && !!input.trim();

  if (!isOpen) return null;

  return (
    <div
      className="ai-backdrop fixed inset-0 z-50 flex items-end lg:items-center justify-center px-3 pt-4 pb-[92px] lg:p-6"
      style={{ backdropFilter: "blur(14px) saturate(0.8)", backgroundColor: "rgba(0,0,0,0.78)" }}
      onClick={handleClose}
    >
      <div
        className="ai-terminal ai-modal-enter relative w-full max-w-xl sm:max-w-2xl flex flex-col rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--ai-bg)",
          maxHeight: "min(calc(100svh - 116px), 620px)",
          minHeight: 340,
          border: "1px solid var(--ai-border)",
          boxShadow:
            "0 0 0 1px rgba(245,158,11,0.06), " +
            "0 32px 80px rgba(0,0,0,0.85), " +
            "0 0 60px rgba(245,158,11,0.06)",
          animation: "ai-border-glow 4s ease-in-out infinite",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CRT scanline overlay */}
        <div className="ai-scanlines pointer-events-none absolute inset-0 z-10 rounded-2xl" />

        {/* ── Title bar ── */}
        <div
          className="relative flex items-center justify-between px-4 py-3 shrink-0 z-20"
          style={{
            backgroundColor: "var(--ai-titlebar-bg)",
            borderBottom: "1px solid var(--ai-titlebar-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              aria-label="Close"
              className="w-3 h-3 rounded-full transition-all duration-150 hover:brightness-125 focus:outline-none"
              style={{ backgroundColor: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.45)" }}
            />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(234,179,8,0.45)" }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.45)" }} />
            <span className="ml-3 font-mono text-xs hidden sm:inline" style={{ color: "var(--ai-text-meta)" }}>
              sarwar@portfolio — ai assistant
            </span>
          </div>

          <div className="flex items-center gap-3">
            {messages.length > 0 && !isStreaming && (
              <button
                onClick={clear}
                title="Clear conversation history"
                className="ai-clear-btn font-mono text-xs focus:outline-none"
                style={{ color: "var(--ai-text-dim)", letterSpacing: "0.02em" }}
              >
                clear
              </button>
            )}
            <span className="font-mono text-xs" style={{ color: "var(--ai-text-faint)" }}>
              llama-3.3-70b
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "rgba(245,158,11,0.65)" }}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: "#fbbf24",
                  boxShadow: "0 0 7px rgba(251,191,36,0.9)",
                  animation: "ai-blink 1.6s ease-in-out infinite",
                }}
              />
              live
            </span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 ai-scrollbar-hide relative z-20"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Intro */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="font-mono text-xs" style={{ color: "var(--ai-text-meta)" }}>sarwar@ai</span>
              <span className="font-mono text-xs" style={{ color: "var(--ai-text-dim)" }}>~</span>
              <span className="font-mono text-xs" style={{ color: "rgba(245,158,11,0.75)" }}>❯</span>
            </div>
            <span className="font-mono text-sm leading-relaxed ai-response-text" style={{ color: "var(--ai-text-body)" }}>
              {introText}
              {!introDone && (
                <span
                  className="ai-cursor inline-block align-middle ml-0.5"
                  style={{ width: 7, height: 13, backgroundColor: "rgba(245,158,11,0.7)" }}
                />
              )}
            </span>
          </div>

          {/* Suggestion chips — only before first user message */}
          {!hasUserMessages && introDone && (
            <div className="flex flex-wrap gap-2 mb-6">
              {CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => sendMessage(chip.prompt)}
                  className="ai-chip font-mono text-xs px-3 py-1.5 rounded-md transition-all duration-150 focus:outline-none"
                  style={{
                    backgroundColor: "var(--ai-chip-bg)",
                    border: "1px solid var(--ai-chip-border)",
                    color: "var(--ai-chip-color)",
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Restored session divider */}
          {restoredAt && messages.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1" style={{ borderTop: "1px solid var(--ai-divider)" }} />
              <span className="font-mono text-xs" style={{ color: "var(--ai-text-dim)", letterSpacing: "0.04em" }}>
                resumed · {relativeTime(restoredAt)}
              </span>
              <div className="flex-1" style={{ borderTop: "1px solid var(--ai-divider)" }} />
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <AIChatMessage key={i} role={msg.role} content={msg.content} streaming={msg.streaming} />
          ))}

          {/* Streaming spinner (while first token hasn't arrived yet) */}
          {showSpinner && (
            <div className="flex items-center gap-1.5 mb-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: "#fbbf24",
                    animation: `ai-bounce 0.9s ease-in-out ${i * 0.16}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Error / quota notices */}
          {error === "minute-limit" && (
            <div
              className="mb-4 font-mono text-xs px-3 py-2.5 rounded-lg"
              style={{
                color: "rgba(245,158,11,0.9)",
                backgroundColor: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.18)",
                lineHeight: 1.6,
              }}
            >
              <div>↺ per-minute limit reached · {quota.minuteResetIn}s cooldown</div>
              <div style={{ color: "rgba(245,158,11,0.5)", marginTop: 3 }}>
                you can send {quota.minuteLimit} messages per minute — try again shortly
              </div>
            </div>
          )}
          {error === "daily-limit" && (
            <div
              className="mb-4 font-mono text-xs px-3 py-2.5 rounded-lg"
              style={{
                color: "#fca5a5",
                backgroundColor: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.16)",
                lineHeight: 1.6,
              }}
            >
              <div>◼ daily limit reached · {quota.dayUsed}/{quota.dayLimit} messages used</div>
              <div style={{ color: "rgba(252,165,165,0.5)", marginTop: 3 }}>
                limit resets at midnight — feel free to come back tomorrow
              </div>
            </div>
          )}
          {error && error !== "minute-limit" && error !== "daily-limit" && (
            <div
              className="mb-4 font-mono text-xs px-3 py-2 rounded-lg"
              style={{
                color: "#fca5a5",
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
              }}
            >
              ✕ {error}
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div
          className="shrink-0 flex items-center gap-3 px-4 py-3 relative z-20"
          style={{
            borderTop: "1px solid var(--ai-inputbar-border)",
            backgroundColor: "var(--ai-inputbar-bg)",
          }}
        >
          <span className="font-mono text-sm shrink-0 select-none" style={{ color: "rgba(245,158,11,0.65)" }}>
            ❯
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
            }}
            disabled={isStreaming || !quota.canSend}
            placeholder={
              quota.dayBlocked   ? "Daily limit reached" :
              quota.minuteBlocked ? `Cooling down · ${quota.minuteResetIn}s` :
              "Ask anything..."
            }
            className="flex-1 bg-transparent font-mono text-sm outline-none disabled:opacity-40"
            style={{ color: "var(--ai-text-input)", caretColor: "rgba(245,158,11,0.9)" }}
          />
          <button
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className="ai-send-btn shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500/40 rounded-lg transition-all duration-150"
            style={{
              width: 34,
              height: 34,
              backgroundColor: canSend ? "rgba(245,158,11,0.12)" : "var(--ai-send-bg)",
              border: `1px solid ${canSend ? "rgba(245,158,11,0.35)" : "var(--ai-send-border)"}`,
              cursor: canSend ? "pointer" : "default",
            }}
          >
            {isStreaming ? (
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.6)",
                      animation: `ai-bounce 0.9s ease-in-out ${i * 0.16}s infinite`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{
                  color: canSend ? "rgba(245,158,11,0.9)" : "var(--ai-send-icon)",
                  transition: "color 0.15s ease",
                  transform: "rotate(90deg)",
                }}
              >
                <path
                  d="M7 1L7 13M7 1L2 6M7 1L12 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* ── Quota bar ── */}
        <div
          className="shrink-0 px-4 py-1.5 relative z-20"
          style={{ backgroundColor: "var(--ai-footer-bg)", borderTop: "1px solid var(--ai-footer-border)" }}
        >
          {quota.dayBlocked ? (
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: "#fca5a5" }}>
                ◼ daily limit reached · resets tomorrow
              </span>
              <span className="font-mono text-xs" style={{ color: "rgba(252,165,165,0.6)" }}>
                {quota.dayUsed}/{quota.dayLimit}
              </span>
            </div>
          ) : quota.minuteBlocked ? (
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: "rgba(245,158,11,0.85)" }}>
                ↺ cooling down · {quota.minuteResetIn}s
              </span>
              <span className="font-mono text-xs" style={{ color: "rgba(245,158,11,0.5)" }}>
                {quota.dayUsed}/{quota.dayLimit} today
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="flex-1 relative"
                style={{ height: 2, backgroundColor: "var(--ai-track)", borderRadius: 1 }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0, bottom: 0, left: 0,
                    width: `${Math.min((quota.dayUsed / quota.dayLimit) * 100, 100)}%`,
                    backgroundColor: quota.dayUsed >= quota.dayLimit * 0.8
                      ? "rgba(245,158,11,0.65)"
                      : "rgba(245,158,11,0.28)",
                    borderRadius: 1,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <span
                className="font-mono text-xs shrink-0"
                style={{
                  color: quota.dayUsed >= quota.dayLimit * 0.8
                    ? "rgba(245,158,11,0.6)"
                    : "var(--ai-text-dim)",
                }}
              >
                {quota.dayUsed}/{quota.dayLimit}
              </span>
            </div>
          )}
        </div>

        {/* ── Status bar ── */}
        <div
          className="shrink-0 flex items-center justify-between px-4 py-1 relative z-20"
          style={{
            backgroundColor: "var(--ai-footer-bg)",
            borderTop: "1px solid var(--ai-footer-border)",
          }}
        >
          <span className="font-mono text-xs" style={{ color: "var(--ai-text-faint)" }}>
            enter to send · esc to close · ctrl+k
          </span>
          <span className="font-mono text-xs" style={{ color: "var(--ai-text-faint)" }}>
            groq · e2e encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
