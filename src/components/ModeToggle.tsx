interface ModeToggleProps {
  mode: 'percent' | 'dollar';
  onChange: (mode: 'percent' | 'dollar') => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={mode === 'percent' ? 'active' : ''}
        onClick={() => onChange('percent')}
      >
        %
      </button>
      <button
        className={mode === 'dollar' ? 'active' : ''}
        onClick={() => onChange('dollar')}
      >
        $
      </button>
    </div>
  );
}
