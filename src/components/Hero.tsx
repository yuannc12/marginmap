import { ArrowDown } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <section
      className="flex flex-col items-center justify-center text-center px-8"
      style={{ minHeight: 'calc(100vh - 61px)', position: 'relative' }}
    >
      {/* Grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <div className="motion-fade-up relative z-10">
        <span className="label-mono mb-6 block" style={{ color: 'var(--accent-blue)' }}>
          Pricing Intelligence
        </span>
        <h1
          className="font-display font-semibold"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
          }}
        >
          MarginMap
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.125rem',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: '0 auto 2.5rem',
          }}
        >
          Navigate your path to profitability. Analyze margins, simulate scenarios, and make data-driven pricing decisions.
        </p>
        <button className="btn btn--primary" onClick={onStart}>
          Start Mapping
        </button>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={onStart}
        className="absolute bottom-8"
        style={{
          color: 'var(--text-faint)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          animation: 'bounce 2s infinite',
        }}
      >
        <ArrowDown size={20} />
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </section>
  );
}
