export default function AIChatMessage({ role, content, streaming }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div
          className="max-w-[82%] rounded-lg px-4 py-2.5"
          style={{
            backgroundColor: '#18181b',
            border: '1px solid rgba(63,63,70,0.9)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <span
            className="font-mono text-xs mr-2 select-none"
            style={{ color: 'rgba(245,158,11,0.7)' }}
          >
            $
          </span>
          <span className="font-mono text-sm" style={{ color: '#e4e4e7' }}>
            {content}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="font-mono text-xs" style={{ color: '#52525b' }}>sarwar@ai</span>
        <span className="font-mono text-xs" style={{ color: '#3f3f46' }}>~</span>
        <span className="font-mono text-xs" style={{ color: 'rgba(245,158,11,0.75)' }}>❯</span>
      </div>
      <p className="font-mono text-sm leading-relaxed ai-response-text" style={{ color: '#a1a1aa' }}>
        {content}
        {streaming && (
          <span
            className="ai-cursor inline-block align-middle ml-0.5"
            style={{
              width: 7,
              height: 13,
              backgroundColor: 'rgba(245,158,11,0.8)',
              verticalAlign: 'middle',
            }}
          />
        )}
      </p>
    </div>
  );
}
