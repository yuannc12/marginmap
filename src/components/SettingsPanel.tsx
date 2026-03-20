import { ModeToggle } from './ModeToggle';
import type { Settings, CostEntry } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onAddCost: (cost: Omit<CostEntry, 'id'>) => void;
  onUpdateCost: (id: string, updates: Partial<CostEntry>) => void;
  onRemoveCost: (id: string) => void;
}

export function SettingsPanel({ settings, onUpdate, onAddCost, onUpdateCost, onRemoveCost }: SettingsPanelProps) {
  const sym = CURRENCY_SYMBOLS[settings.currency] || settings.currency;

  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">01</div>
        <div className="section-title">Settings</div>
        <div className="section-desc">
          Configure tax rates, overhead costs, and currency. These apply globally across all products and scenarios.
        </div>

        <div className="card motion-fade-up">
          {/* Tax + Currency row */}
          <div className="flex gap-12 mb-8" style={{ flexWrap: 'wrap' }}>
            <div className="field" style={{ minWidth: 160 }}>
              <div className="field-label">Tax Rate</div>
              <div className="field-row">
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => onUpdate({ taxRate: Number(e.target.value) })}
                  min={0}
                  style={{ width: 80 }}
                />
                <ModeToggle mode={settings.taxMode} onChange={(m) => onUpdate({ taxMode: m })} />
              </div>
            </div>

            <div className="field" style={{ minWidth: 100 }}>
              <div className="field-label">Currency</div>
              <select
                value={settings.currency}
                onChange={(e) => onUpdate({ currency: e.target.value })}
                style={{ width: 80 }}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Overhead Costs */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
            <div className="field-label" style={{ marginBottom: 16 }}>Overhead Costs</div>

            {settings.overheadCosts.map((cost) => (
              <div key={cost.id} className="cost-row">
                <input
                  type="text"
                  value={cost.name}
                  onChange={(e) => onUpdateCost(cost.id, { name: e.target.value })}
                  placeholder="Cost name"
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: 0, fontSize: '0.8125rem' }}
                />
                <div className="field-row">
                  <div className="relative">
                    {cost.mode === 'dollar' && (
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{sym}</span>
                    )}
                    <input
                      type="number"
                      value={cost.value}
                      onChange={(e) => onUpdateCost(cost.id, { value: Number(e.target.value) })}
                      min={0}
                      style={{ width: 100, paddingLeft: cost.mode === 'dollar' ? 22 : 10 }}
                    />
                  </div>
                  <ModeToggle mode={cost.mode} onChange={(m) => onUpdateCost(cost.id, { mode: m })} />
                  <button
                    className="btn--danger"
                    onClick={() => onRemoveCost(cost.id)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}

            <button
              className="btn btn--ghost"
              onClick={() => onAddCost({ name: '', value: 0, mode: 'dollar' })}
              style={{ marginTop: 8, fontSize: '0.5625rem' }}
            >
              + Add overhead cost
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
