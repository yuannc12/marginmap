import type { Settings, CostEntry } from '../types';
import { SYM } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onAddCost: (cost: Omit<CostEntry, 'id'>) => void;
  onUpdateCost: (id: string, updates: Partial<CostEntry>) => void;
  onRemoveCost: (id: string) => void;
}

export function SettingsPanel({ settings, onAddCost, onUpdateCost, onRemoveCost }: SettingsPanelProps) {
  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">01</div>
        <div className="section-title">Overhead Costs</div>
        <div className="section-desc">
          Fixed monthly costs shared across all products — rent, staff, tools, etc.
        </div>

        <div className="card motion-fade-up">
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
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{SYM}</span>
                  <input
                    type="number"
                    value={cost.value}
                    onChange={(e) => onUpdateCost(cost.id, { value: Number(e.target.value) })}
                    min={0}
                    style={{ width: 100, paddingLeft: 22 }}
                  />
                </div>
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
            onClick={() => onAddCost({ name: '', value: 0 })}
            style={{ marginTop: 8, fontSize: '0.5625rem' }}
          >
            + Add overhead cost
          </button>
        </div>
      </div>
    </section>
  );
}
