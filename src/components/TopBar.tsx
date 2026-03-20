interface TopBarProps {
  onExport: () => void;
  onImport: () => void;
}

export function TopBar({ onExport, onImport }: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between"
      style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}
    >
      <span
        className="font-display"
        style={{ fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.02em' }}
      >
        MarginMap
      </span>
      <div className="flex items-center gap-2">
        <button className="btn btn--ghost" onClick={onImport}>Import</button>
        <button className="btn btn--ghost" onClick={onExport}>Export</button>
      </div>
    </header>
  );
}
