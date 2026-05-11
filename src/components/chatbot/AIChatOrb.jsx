import { useEffect, useState, useRef, useCallback } from 'react';

export default function AIChatOrb({ isOpen, onOpen }) {
  const [visible,  setVisible]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const nudgedRef    = useRef(false);
  const collapseRef  = useRef(null);

  // Appear after 420px scroll
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // One-time attention nudge — auto-expand the pill then retract
  useEffect(() => {
    if (!visible || nudgedRef.current) return;
    nudgedRef.current = true;
    const show = setTimeout(() => {
      setExpanded(true);
      collapseRef.current = setTimeout(() => setExpanded(false), 4200);
    }, 1500);
    return () => { clearTimeout(show); clearTimeout(collapseRef.current); };
  }, [visible]);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpen]);

  const expand = useCallback(() => {
    clearTimeout(collapseRef.current);
    setExpanded(true);
  }, []);

  const scheduleCollapse = useCallback(() => {
    clearTimeout(collapseRef.current);
    collapseRef.current = setTimeout(() => setExpanded(false), 650);
  }, []);

  if (isOpen) return null;

  return (
    /* Mobile: above BottomNav. Desktop: vertically centred on right edge. */
    <div className="fixed z-40 right-4 bottom-28 lg:right-6 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
      <div style={{ position: 'relative' }}>

        {/* ── Pulse rings — always centred on the icon circle (right side) ── */}
        {visible && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              pointerEvents: 'none',
            }}
          >
            <span className="ai-orb-ring ai-orb-ring-1" />
            <span className="ai-orb-ring ai-orb-ring-2" />
            <span className="ai-orb-ring ai-orb-ring-3" />
          </div>
        )}

        {/* ── The expanding pill button ── */}
        <button
          onClick={onOpen}
          onMouseEnter={expand}
          onMouseLeave={scheduleCollapse}
          aria-label="Open AI chat (ctrl+k)"
          className={`ai-orb-btn focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
            visible ? 'ai-orb-visible' : 'ai-orb-hidden'
          }`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: 44,
            width: expanded ? 172 : 44,
            paddingLeft: expanded ? 16 : 0,
            paddingRight: 13,
            gap: 0,
            borderRadius: 999,
            overflow: 'hidden',
            backgroundColor: '#0c0c0f',
            border: `1px solid ${expanded ? 'rgba(245,158,11,0.6)' : 'rgba(245,158,11,0.35)'}`,
            boxShadow: expanded
              ? '0 0 36px rgba(245,158,11,0.2), inset 0 0 28px rgba(245,158,11,0.07), 0 6px 24px rgba(0,0,0,0.5)'
              : '0 0 22px rgba(245,158,11,0.09), inset 0 0 18px rgba(245,158,11,0.03)',
            transitionProperty: 'width, padding-left, border-color, box-shadow, transform, opacity',
            transitionDuration: '0.48s',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Label — slides in from the left */}
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              letterSpacing: '0.01em',
              color: '#a1a1aa',
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'left',
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-14px)',
              transition: expanded
                ? 'opacity 0.22s ease 0.18s, transform 0.22s ease 0.18s'
                : 'opacity 0.12s ease, transform 0.12s ease',
              paddingRight: 8,
            }}
          >
            ask sarwar ai
          </span>

          {/* Chevron separator — only when expanded */}
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              color: 'rgba(245,158,11,0.4)',
              flexShrink: 0,
              marginRight: 7,
              opacity: expanded ? 1 : 0,
              transition: expanded ? 'opacity 0.18s ease 0.28s' : 'opacity 0.1s ease',
            }}
          >
            ›
          </span>

          {/* >_ icon — always visible, always rightmost */}
          <span
            className="font-mono"
            style={{
              fontSize: 13,
              color: 'rgba(245,158,11,0.92)',
              letterSpacing: '-0.5px',
              textShadow: '0 0 14px rgba(245,158,11,0.65)',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            &gt;_
          </span>
        </button>

      </div>
    </div>
  );
}
