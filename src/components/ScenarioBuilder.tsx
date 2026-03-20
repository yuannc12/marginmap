import { Plus, Trash2 } from 'lucide-react';
import type { Scenario } from '../types';

interface ScenarioBuilderProps {
  scenarios: Scenario[];
  onAdd: (scenario: Omit<Scenario, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Scenario>) => void;
  onDelete: (id: string) => void;
}

const SCENARIO_COLORS = ['#8BAFEE', '#4A7A5B', '#C4A35A', '#8B7BB5'];

export function ScenarioBuilder({ scenarios, onAdd, onUpdate, onDelete }: ScenarioBuilderProps) {
  const handleAdd = () => {
    onAdd({
      name: `Scenario ${scenarios.length + 1}`,
      priceMultiplier: 1,
      costMultiplier: 1,
      volumeMultiplier: 1,
    });
  };

  return (
    <section className="px-8 py-8 section-border">
      <div className="flex items-center justify-between mb-6">
        <span className="label-mono">Scenarios ({scenarios.length})</span>
        {scenarios.length < 4 && (
          <button className="btn btn--outline btn--sm" onClick={handleAdd}>
            <Plus size={14} />
            Add Scenario
          </button>
        )}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(scenarios.length, 4)}, 1fr)` }}>
        {scenarios.map((scenario, i) => (
          <div key={scenario.id} className="card-static p-5">
            {/* Color bar */}
            <div
              style={{
                width: '100%',
                height: '3px',
                background: SCENARIO_COLORS[i % SCENARIO_COLORS.length],
                marginBottom: '16px',
              }}
            />

            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={scenario.name}
                onChange={(e) => onUpdate(scenario.id, { name: e.target.value })}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  width: '100%',
                  letterSpacing: '-0.02em',
                }}
              />
              {scenarios.length > 1 && (
                <button
                  onClick={() => onDelete(scenario.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Price multiplier */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Price</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: scenario.priceMultiplier === 1 ? 'var(--text-faint)' : 'var(--accent-blue)',
                  }}
                >
                  {scenario.priceMultiplier > 1 ? '+' : ''}{((scenario.priceMultiplier - 1) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={scenario.priceMultiplier}
                onChange={(e) => onUpdate(scenario.id, { priceMultiplier: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            {/* Cost multiplier */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Cost</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: scenario.costMultiplier === 1 ? 'var(--text-faint)' : 'var(--accent-orange, #C47A3A)',
                  }}
                >
                  {scenario.costMultiplier > 1 ? '+' : ''}{((scenario.costMultiplier - 1) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={scenario.costMultiplier}
                onChange={(e) => onUpdate(scenario.id, { costMultiplier: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            {/* Volume multiplier */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Volume</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: scenario.volumeMultiplier === 1 ? 'var(--text-faint)' : 'var(--accent-green)',
                  }}
                >
                  {scenario.volumeMultiplier > 1 ? '+' : ''}{((scenario.volumeMultiplier - 1) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.1}
                value={scenario.volumeMultiplier}
                onChange={(e) => onUpdate(scenario.id, { volumeMultiplier: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
