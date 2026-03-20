interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: 'auto 1fr 1fr auto',
        border: '1px solid var(--border)',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Row 1: Top bar spanning full width */}
      <div
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5625rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          Pricing & Margin Analysis
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            letterSpacing: '0.1em',
            color: 'var(--text-faint)',
          }}
        >
          yuann.cc
        </span>
      </div>

      {/* Row 2, Col 1-2: Main title area */}
      <div
        className="motion-fade-up"
        style={{
          gridColumn: '1 / 3',
          gridRow: '2 / 3',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '40px 40px 32px',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 600,
            lineHeight: 0.95,
            letterSpacing: '-0.05em',
            margin: 0,
            color: 'var(--text-primary)',
          }}
        >
          Margin
          <br />
          Map
        </h1>
      </div>

      {/* Row 2, Col 3: Abstract geometric — orbital rings */}
      <div
        style={{
          gridColumn: '3 / 4',
          gridRow: '2 / 3',
          background: 'var(--accent-blue)',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <svg viewBox="0 0 120 120" width="80%" height="80%" style={{ opacity: 0.3 }}>
          <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" />
          <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" transform="rotate(60 60 60)" />
          <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" transform="rotate(120 60 60)" />
          <circle cx="60" cy="60" r="3" fill="var(--text-primary)" />
        </svg>
      </div>

      {/* Row 2, Col 4: Abstract geometric — warped grid */}
      <div
        style={{
          gridColumn: '4 / 5',
          gridRow: '2 / 3',
          background: 'var(--text-primary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <svg viewBox="0 0 100 100" width="70%" height="70%">
          {/* Warped grid lines — horizontal */}
          {[20, 35, 50, 65, 80].map((y) => (
            <path
              key={`h${y}`}
              d={`M10,${y} Q35,${y + (y - 50) * 0.3} 50,${y + (y - 50) * 0.4} Q65,${y + (y - 50) * 0.3} 90,${y}`}
              fill="none"
              stroke="var(--bg-primary)"
              strokeWidth="0.8"
              opacity="0.4"
            />
          ))}
          {/* Warped grid lines — vertical */}
          {[20, 35, 50, 65, 80].map((x) => (
            <path
              key={`v${x}`}
              d={`M${x},10 Q${x + (x - 50) * 0.3},35 ${x + (x - 50) * 0.4},50 Q${x + (x - 50) * 0.3},65 ${x},90`}
              fill="none"
              stroke="var(--bg-primary)"
              strokeWidth="0.8"
              opacity="0.4"
            />
          ))}
        </svg>
      </div>

      {/* Row 3, Col 1: Small text block */}
      <div
        className="motion-fade-up"
        style={{
          gridColumn: '1 / 2',
          gridRow: '3 / 4',
          padding: '32px 24px',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          animationDelay: '60ms',
        }}
      >
        <p
          style={{
            fontSize: '0.8125rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            margin: 0,
          }}
        >
          Map your product costs, simulate pricing scenarios, and see where every euro flows.
        </p>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            marginTop: 24,
          }}
        >
          Revenue → Costs → Profit
        </div>
      </div>

      {/* Row 3, Col 2: Abstract geometric — flowing wave */}
      <div
        style={{
          gridColumn: '2 / 3',
          gridRow: '3 / 4',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <svg viewBox="0 0 120 80" width="85%" style={{ opacity: 0.35 }}>
          {[0, 8, 16, 24, 32, 40].map((offset) => (
            <path
              key={offset}
              d={`M0,${20 + offset} Q30,${10 + offset} 60,${20 + offset} Q90,${30 + offset} 120,${20 + offset}`}
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>

      {/* Row 3, Col 3: CTA button */}
      <div
        className="motion-fade-up"
        style={{
          gridColumn: '3 / 4',
          gridRow: '3 / 4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          animationDelay: '120ms',
        }}
      >
        <button
          className="btn"
          onClick={onStart}
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            border: '1px solid var(--text-primary)',
            padding: '14px 36px',
            fontSize: '0.6875rem',
          }}
        >
          Start Mapping
        </button>
      </div>

      {/* Row 3, Col 4: Abstract geometric — concentric diamond */}
      <div
        style={{
          gridColumn: '4 / 5',
          gridRow: '3 / 4',
          background: 'var(--accent-blue)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <svg viewBox="0 0 100 100" width="65%" height="65%" style={{ opacity: 0.3 }}>
          {[15, 25, 35, 45].map((size) => (
            <rect
              key={size}
              x={50 - size}
              y={50 - size}
              width={size * 2}
              height={size * 2}
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="1"
              transform={`rotate(45 50 50)`}
            />
          ))}
        </svg>
      </div>

      {/* Row 4: Bottom bar */}
      <div
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          From revenue to net profit
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            letterSpacing: '0.1em',
            color: 'var(--text-faint)',
          }}
        >
          v2.0
        </span>
      </div>
    </section>
  );
}
