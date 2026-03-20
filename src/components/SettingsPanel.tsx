import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Settings, PricingStrategy } from '../types';
import { STRATEGY_LABELS } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="px-8 py-8 section-border">
      <button
        className="flex items-center gap-2 w-full text-left mb-6"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="label-mono">Global Settings</span>
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-6 motion-fade-up" style={{ maxWidth: '640px' }}>
          {/* Tax Rate */}
          <div className="flex flex-col gap-1">
            <label className="label-mono" style={{ fontSize: '0.625rem' }}>Tax Rate (%)</label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => onUpdate({ taxRate: Number(e.target.value) })}
              min={0}
              max={100}
              step={0.5}
            />
          </div>

          {/* Platform Fee */}
          <div className="flex flex-col gap-1">
            <label className="label-mono" style={{ fontSize: '0.625rem' }}>Platform Fee (%)</label>
            <input
              type="number"
              value={settings.platformFee}
              onChange={(e) => onUpdate({ platformFee: Number(e.target.value) })}
              min={0}
              max={100}
              step={0.5}
            />
          </div>

          {/* Currency */}
          <div className="flex flex-col gap-1">
            <label className="label-mono" style={{ fontSize: '0.625rem' }}>Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => onUpdate({ currency: e.target.value })}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          {/* Forecast Period */}
          <div className="flex flex-col gap-1">
            <label className="label-mono" style={{ fontSize: '0.625rem' }}>Forecast (months)</label>
            <input
              type="number"
              value={settings.forecastMonths}
              onChange={(e) => onUpdate({ forecastMonths: Number(e.target.value) })}
              min={1}
              max={60}
            />
          </div>

          {/* Pricing Strategy */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="label-mono" style={{ fontSize: '0.625rem' }}>Pricing Strategy</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(STRATEGY_LABELS) as PricingStrategy[]).map((key) => (
                <button
                  key={key}
                  className="btn btn--sm"
                  style={{
                    background: settings.strategy === key ? 'var(--accent-blue)' : 'transparent',
                    color: settings.strategy === key ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderColor: settings.strategy === key ? 'var(--accent-blue)' : 'var(--border)',
                  }}
                  onClick={() => onUpdate({ strategy: key })}
                >
                  {STRATEGY_LABELS[key].name}
                </button>
              ))}
            </div>
            <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem', marginTop: '4px' }}>
              {STRATEGY_LABELS[settings.strategy].description}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
