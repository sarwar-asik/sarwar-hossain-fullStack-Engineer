import { useState, useRef, useCallback, useEffect } from 'react';

// ── Chat history storage ──────────────────────────────────
const STORE = {
  key:         'sarwar-ai-chat',
  version:     1,
  maxMessages: 30,
  ttlMs:       7 * 24 * 60 * 60 * 1000,
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE.key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== STORE.version) { localStorage.removeItem(STORE.key); return null; }
    if (!data.savedAt || Date.now() - data.savedAt > STORE.ttlMs) {
      localStorage.removeItem(STORE.key); return null;
    }
    const messages = Array.isArray(data.messages) ? data.messages.slice(-STORE.maxMessages) : [];
    return { messages, savedAt: data.savedAt };
  } catch { return null; }
}

function writeStore(messages, savedAt) {
  try {
    if (messages.length === 0) { localStorage.removeItem(STORE.key); return; }
    const clean = messages
      .filter(m => !m.streaming)
      .slice(-STORE.maxMessages)
      .map(({ role, content }) => ({ role, content }));
    localStorage.setItem(STORE.key, JSON.stringify({ v: STORE.version, savedAt: savedAt ?? Date.now(), messages: clean }));
  } catch {}
}

// ── Rate-limit / quota ────────────────────────────────────
const QUOTA = {
  key:       'sarwar-ai-quota',
  perMinute: 6,
  perDay:    25,
};

function readTimestamps() {
  try {
    const raw = localStorage.getItem(QUOTA.key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function pruneAndSave(timestamps) {
  const now   = Date.now();
  const fresh = timestamps.filter(t => now - t < 86_400_000);
  try { localStorage.setItem(QUOTA.key, JSON.stringify(fresh)); } catch {}
  return fresh;
}

function calcQuota(timestamps) {
  const now      = Date.now();
  const inMinute = timestamps.filter(t => now - t < 60_000);
  const inDay    = timestamps.filter(t => now - t < 86_400_000);

  const minuteBlocked = inMinute.length >= QUOTA.perMinute;
  const dayBlocked    = inDay.length    >= QUOTA.perDay;

  // Seconds until the oldest per-minute slot expires
  const minuteResetIn = minuteBlocked
    ? Math.max(1, Math.ceil((inMinute[0] + 60_000 - now) / 1000))
    : 0;

  return {
    dayUsed:      inDay.length,
    dayLimit:     QUOTA.perDay,
    minuteUsed:   inMinute.length,
    minuteLimit:  QUOTA.perMinute,
    minuteResetIn,
    minuteBlocked,
    dayBlocked,
    canSend: !minuteBlocked && !dayBlocked,
  };
}

// ── Hook ─────────────────────────────────────────────────
export function useChatbot() {
  // Single localStorage read on mount for chat history
  const initRef = useRef(null);
  if (!initRef.current) initRef.current = readStore() ?? { messages: [], savedAt: null };

  const [messages,    setMessages]    = useState(initRef.current.messages);
  const [input,       setInput]       = useState('');
  const [isStreaming, setIsStreaming]  = useState(false);
  const [error,       setError]       = useState(null);
  const [restoredAt,  setRestoredAt]  = useState(initRef.current.savedAt);
  const [quota,       setQuota]       = useState(() => calcQuota(readTimestamps()));

  const lastSendRef = useRef(0);
  const abortRef    = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Persist chat history only after streaming settles
  useEffect(() => {
    if (isStreaming) return;
    writeStore(messages, restoredAt);
  }, [messages, isStreaming, restoredAt]);

  // Tick the per-minute countdown every second while cooling down; auto-clear minute-limit error
  useEffect(() => {
    if (!quota.minuteBlocked) {
      setError(prev => prev === 'minute-limit' ? null : prev);
      return;
    }
    const id = setInterval(() => setQuota(calcQuota(readTimestamps())), 1000);
    return () => clearInterval(id);
  }, [quota.minuteBlocked]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    // Debounce: prevent accidental double-sends
    const now = Date.now();
    if (now - lastSendRef.current < 2500) return;

    // Quota gate: record usage and re-check atomically
    const prevTs  = readTimestamps();
    const freshTs = pruneAndSave([...prevTs, now]);
    const newQuota = calcQuota(freshTs);
    setQuota(newQuota);

    // Undo the timestamp we just recorded if over limit
    if (!newQuota.canSend) {
      pruneAndSave(prevTs); // rollback
      setQuota(calcQuota(prevTs));
      if (newQuota.dayBlocked) {
        setError('daily-limit');
      } else {
        setError('minute-limit');
      }
      return;
    }
    setError(null);

    lastSendRef.current = now;

    const history = messagesRef.current;
    const userMsg = { role: 'user', content: trimmed };

    setMessages(prev => [
      ...prev,
      userMsg,
      { role: 'assistant', content: '', streaming: true },
    ]);
    setInput('');
    setIsStreaming(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, userMsg]
            .slice(-8)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        setMessages(prev => prev.slice(0, -1));
        setError('groq-limit');
        return;
      }
      if (!res.ok) throw new Error('Request failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const chunk = JSON.parse(payload);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                next[next.length - 1] = { ...last, content: last.content + delta };
                return next;
              });
            }
          } catch {}
        }
      }

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], streaming: false };
        return next;
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages(prev => prev.slice(0, -1));
      setError('Connection lost. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setIsStreaming(false);
    setError(null);
    setRestoredAt(null);
    try { localStorage.removeItem(STORE.key); } catch {}
  }, []);

  return { messages, input, setInput, isStreaming, error, sendMessage, clear, restoredAt, quota };
}
