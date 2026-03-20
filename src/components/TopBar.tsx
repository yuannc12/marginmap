import { useState } from 'react';
import { Settings, Share2, Check, Download, Upload } from 'lucide-react';

interface TopBarProps {
  onOpenSettings: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function TopBar({ onOpenSettings, onExport, onImport }: TopBarProps) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = 'https://marginmap.yuann.cc';
  const title = 'MarginMap — Navigate your path to profitability';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { name: 'X / Twitter', url: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  return (
    <header
      className="flex items-center justify-between px-8 py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="font-display text-base font-semibold" style={{ letterSpacing: '-0.02em' }}>
          MarginMap
        </span>
      </div>
      <div className="flex items-center gap-4">
        {/* Import */}
        <button
          onClick={onImport}
          className="flex items-center gap-2 text-text-faint hover:text-text-primary"
          style={{ transition: 'color var(--duration-fast) var(--ease)' }}
        >
          <Upload size={15} />
          <span className="label-mono">Import</span>
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 text-text-faint hover:text-text-primary"
          style={{ transition: 'color var(--duration-fast) var(--ease)' }}
        >
          <Download size={15} />
          <span className="label-mono">Export</span>
        </button>

        {/* Share */}
        <div className="relative">
          <button
            onClick={() => setShowShare(!showShare)}
            className="flex items-center gap-2 text-text-faint hover:text-text-primary"
            style={{ transition: 'color var(--duration-fast) var(--ease)' }}
          >
            <Share2 size={16} />
            <span className="label-mono">Share</span>
          </button>
          {showShare && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowShare(false)} />
              <div
                className="absolute right-0 top-10 z-40 p-4 flex flex-col gap-2"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  minWidth: '200px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <div className="label-mono mb-1" style={{ fontSize: '0.5625rem' }}>Share MarginMap</div>
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm py-1.5 px-2 block"
                    style={{
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      textDecoration: 'none',
                      transition: 'background var(--duration-fast) var(--ease)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {link.name}
                  </a>
                ))}
                <button
                  onClick={handleCopy}
                  className="text-sm py-1.5 px-2 text-left flex items-center gap-2"
                  style={{
                    color: copied ? 'var(--accent-green)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    marginTop: '4px',
                  }}
                >
                  {copied ? <Check size={14} /> : null}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-text-faint hover:text-text-primary"
          style={{ transition: 'color var(--duration-fast) var(--ease)' }}
        >
          <Settings size={18} />
          <span className="label-mono">Settings</span>
        </button>
      </div>
    </header>
  );
}
