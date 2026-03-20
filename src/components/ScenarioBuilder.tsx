import { useMemo, useState } from 'react';
import { ModeToggle } from './ModeToggle';
import type { Product, Settings, Scenario, SimulationResult, ProductOverride } from '../types';
import { SYM, EMPTY_OVERRIDE } from '../types';
import { simulate, formatCurrency } from '../utils/calculations';

interface ScenarioBuilderProps {
  products: Product[];
  settings: Settings;
  scenarios: Scenario[];
  onAdd: (scenario: Omit<Scenario, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Scenario>) => void;
  onDelete: (id: string) => void;
  onUpsertOverride: (scenarioId: string, override: ProductOverride) => void;
  onRemoveOverride: (scenarioId: string, productId: string) => void;
}

const BASELINE_SCENARIO: Scenario = {
  id: '__baseline__',
  name: 'Current',
  priceAdjustment: 0,
  priceAdjustMode: 'percent',
  sellThrough: null as unknown as number, // null = use each product's baseline sell-through
  productOverrides: [],
};

export function ScenarioBuilder({
  products,
  settings,
  scenarios,
  onAdd,
  onUpdate,
  onDelete,
  onUpsertOverride,
  onRemoveOverride,
}: ScenarioBuilderProps) {
  const sym = SYM;

  const baseline = useMemo(() => simulate(products, settings, BASELINE_SCENARIO), [products, settings]);

  const scenarioResults = useMemo(() => {
    return scenarios.map((sc) => ({
      scenario: sc,
      result: simulate(products, settings, sc),
    }));
  }, [products, settings, scenarios]);

  const handleAdd = () => {
    onAdd({
      name: `Scenario ${scenarios.length + 1}`,
      priceAdjustment: 0,
      priceAdjustMode: 'percent',
      sellThrough: 100,
      productOverrides: [],
    });
  };

  return (
    <section className="section">
      <div className="page-shell">
        <div className="flex items-baseline justify-between" style={{ marginBottom: 32 }}>
          <div>
            <div className="section-label">04</div>
            <div className="section-title">Scenarios</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, maxWidth: 400 }}>
              Model pricing changes per product. Add overrides to fine-tune individual products within each scenario.
            </p>
          </div>
          <button className="btn btn--primary" onClick={handleAdd}>
            + Add Scenario
          </button>
        </div>

        {/* Scenario input cards */}
        {scenarios.length > 0 && (
          <div
            className="motion-stagger"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(scenarios.length, 2)}, 1fr)`,
              gap: 16,
              marginBottom: 24,
            }}
          >
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                products={products}
                canDelete={scenarios.length > 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onUpsertOverride={onUpsertOverride}
                onRemoveOverride={onRemoveOverride}
              />
            ))}
          </div>
        )}

        {/* Results comparison */}
        <ComparisonTable
          baseline={baseline}
          scenarioResults={scenarioResults}
          sym={sym}
          hasScenarios={scenarios.length > 0}
        />
      </div>
    </section>
  );
}

/* ── Scenario Card (inputs only) ─────────────────────── */

function ScenarioCard({
  scenario,
  products,
  canDelete,
  onUpdate,
  onDelete,
  onUpsertOverride,
  onRemoveOverride,
}: {
  scenario: Scenario;
  products: Product[];
  canDelete: boolean;
  onUpdate: (id: string, updates: Partial<Scenario>) => void;
  onDelete: (id: string) => void;
  onUpsertOverride: (scenarioId: string, override: ProductOverride) => void;
  onRemoveOverride: (scenarioId: string, productId: string) => void;
}) {
  const [expanded, setExpanded] = useState(scenario.productOverrides.length > 0);
  const overriddenIds = new Set(scenario.productOverrides.map((o) => o.productId));
  const availableProducts = products.filter((p) => !overriddenIds.has(p.id));

  return (
    <div className="card">
      <div className="card-header">
        <input
          className="input-inline"
          type="text"
          value={scenario.name}
          onChange={(e) => onUpdate(scenario.id, { name: e.target.value })}
          style={{ fontSize: '0.9375rem' }}
        />
        {canDelete && (
          <button
            className="btn--danger"
            onClick={() => onDelete(scenario.id)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Global defaults */}
      <div style={{ marginBottom: 12 }}>
        <div className="field-label" style={{ fontSize: '0.625rem', color: 'var(--text-faint)', marginBottom: 8 }}>
          Default (all products)
        </div>
        <div className="flex gap-4">
          <div className="field" style={{ flex: 1 }}>
            <div className="field-label">Price Adj.</div>
            <div className="field-row">
              <input
                type="number"
                value={scenario.priceAdjustment}
                onChange={(e) => onUpdate(scenario.id, { priceAdjustment: Number(e.target.value) })}
                style={{ flex: 1, fontSize: '0.8125rem' }}
              />
              <ModeToggle
                mode={scenario.priceAdjustMode}
                onChange={(m) => onUpdate(scenario.id, { priceAdjustMode: m })}
              />
            </div>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <div className="flex items-center justify-between">
              <div className="field-label">Sell-Through</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-blue)' }}>
                {scenario.sellThrough}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={scenario.sellThrough}
              onChange={(e) => onUpdate(scenario.id, { sellThrough: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Per-product overrides */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: 'var(--accent-blue)',
            padding: 0,
            letterSpacing: '0.04em',
          }}
        >
          {expanded ? '- Hide' : '+'} Product Overrides
          {scenario.productOverrides.length > 0 && ` (${scenario.productOverrides.length})`}
        </button>

        {expanded && (
          <div style={{ marginTop: 12 }}>
            {scenario.productOverrides.map((override) => {
              const product = products.find((p) => p.id === override.productId);
              if (!product) return null;
              return (
                <div
                  key={override.productId}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-elevated)',
                    marginBottom: 8,
                    borderLeft: '2px solid var(--accent-blue)',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 500 }}>
                      {product.name}
                    </span>
                    <button
                      onClick={() => onRemoveOverride(scenario.id, override.productId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.5625rem',
                        color: 'var(--danger)',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="field" style={{ flex: 1 }}>
                      <div className="field-label">Price Adj.</div>
                      <div className="field-row">
                        <input
                          type="number"
                          value={override.priceAdjustment}
                          onChange={(e) =>
                            onUpsertOverride(scenario.id, { ...override, priceAdjustment: Number(e.target.value) })
                          }
                          style={{ flex: 1, fontSize: '0.8125rem' }}
                        />
                        <ModeToggle
                          mode={override.priceAdjustMode}
                          onChange={(m) => onUpsertOverride(scenario.id, { ...override, priceAdjustMode: m })}
                        />
                      </div>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <div className="flex items-center justify-between">
                        <div className="field-label">Sell-Through</div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-blue)' }}>
                          {override.sellThrough}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={override.sellThrough}
                        onChange={(e) =>
                          onUpsertOverride(scenario.id, { ...override, sellThrough: Number(e.target.value) })
                        }
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {availableProducts.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    onUpsertOverride(scenario.id, {
                      productId: e.target.value,
                      ...EMPTY_OVERRIDE,
                    });
                  }
                }}
                style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)' }}
              >
                <option value="">+ Add product override...</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Comparison Table ─────────────────────────────────── */

function ComparisonTable({
  baseline,
  scenarioResults,
  sym,
  hasScenarios,
}: {
  baseline: SimulationResult;
  scenarioResults: { scenario: Scenario; result: SimulationResult }[];
  sym: string;
  hasScenarios: boolean;
}) {
  if (!hasScenarios) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div className="field-label" style={{ marginBottom: 20 }}>Current Breakdown</div>
        <WaterfallBreakdown result={baseline} sym={sym} />
      </div>
    );
  }

  const columns = [
    { name: 'Current', result: baseline, isBaseline: true },
    ...scenarioResults.map(({ scenario, result }) => ({
      name: scenario.name,
      result,
      isBaseline: false,
    })),
  ];

  const rows: { label: string; format: (r: SimulationResult) => string; deltaFn: (r: SimulationResult, b: SimulationResult) => number }[] = [
    {
      label: 'Revenue',
      format: (r) => formatCurrency(r.totalRevenue, sym),
      deltaFn: (r, b) => r.totalRevenue - b.totalRevenue,
    },
    {
      label: 'COGS',
      format: (r) => `-${formatCurrency(r.totalCOGS, sym)}`,
      deltaFn: (r, b) => -(r.totalCOGS - b.totalCOGS),
    },
    {
      label: 'Gross Profit',
      format: (r) => {
        const pct = r.totalRevenue > 0 ? ((r.grossProfit / r.totalRevenue) * 100).toFixed(1) : '0.0';
        return `${formatCurrency(r.grossProfit, sym)}  (${pct}%)`;
      },
      deltaFn: (r, b) => r.grossProfit - b.grossProfit,
    },
    {
      label: 'Net Profit',
      format: (r) => {
        const pct = r.totalRevenue > 0 ? ((r.netProfit / r.totalRevenue) * 100).toFixed(1) : '0.0';
        return `${formatCurrency(r.netProfit, sym)}  (${pct}%)`;
      },
      deltaFn: (r, b) => r.netProfit - b.netProfit,
    },
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="field-label" style={{ padding: '16px 20px 0' }}>Comparison</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {columns.map((col, i) => (
                <th key={i} style={{
                  ...thStyle,
                  textAlign: 'right',
                  color: col.isBaseline ? 'var(--text-faint)' : 'var(--text-primary)',
                  fontWeight: col.isBaseline ? 400 : 600,
                }}>
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td style={tdLabelStyle}>{row.label}</td>
                {columns.map((col, i) => {
                  const delta = col.isBaseline ? null : row.deltaFn(col.result, baseline);
                  const showDelta = delta !== null && Math.abs(delta) > 0.05;

                  return (
                    <td key={i} style={tdValueStyle}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        fontWeight: col.isBaseline ? 400 : 500,
                        color: row.label === 'Net Profit'
                          ? (col.result.netProfit >= 0 ? 'var(--accent-green)' : 'var(--danger)')
                          : 'var(--text-primary)',
                      }}>
                        {row.format(col.result)}
                      </span>
                      {showDelta && (
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.5625rem',
                          marginTop: 2,
                          color: delta > 0 ? 'var(--accent-green)' : 'var(--danger)',
                        }}>
                          {delta > 0 ? '+' : ''}
                          {formatCurrency(delta, sym)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual bar comparison for net profit */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div className="field-label" style={{ marginBottom: 12 }}>Net Profit</div>
        {(() => {
          const maxProfit = Math.max(...columns.map((c) => Math.abs(c.result.netProfit)), 1);
          return columns.map((col, i) => {
            const width = (Math.abs(col.result.netProfit) / maxProfit) * 100;
            const isPositive = col.result.netProfit >= 0;
            return (
              <div key={i} style={{ marginBottom: i < columns.length - 1 ? 8 : 0 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    color: col.isBaseline ? 'var(--text-faint)' : 'var(--text-primary)',
                  }}>
                    {col.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: isPositive ? 'var(--accent-green)' : 'var(--danger)',
                  }}>
                    {formatCurrency(col.result.netProfit, sym)}
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--border-subtle)' }}>
                  <div style={{
                    height: '100%',
                    width: `${width}%`,
                    background: isPositive
                      ? (col.isBaseline ? 'rgba(139,196,160,0.4)' : '#8BC4A0')
                      : 'var(--danger)',
                    transition: 'width 0.3s var(--ease)',
                  }} />
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontSize: '0.6875rem',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  textAlign: 'left',
  borderBottom: '1px solid var(--border-subtle)',
  fontWeight: 400,
  color: 'var(--text-faint)',
};

const tdLabelStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-secondary)',
  borderBottom: '1px solid var(--border-subtle)',
};

const tdValueStyle: React.CSSProperties = {
  padding: '10px 20px',
  textAlign: 'right',
  borderBottom: '1px solid var(--border-subtle)',
};

/* Waterfall breakdown for current state (no scenarios added yet) */
function WaterfallBreakdown({ result, sym }: { result: SimulationResult; sym: string }) {
  const rev = result.totalRevenue;
  const items = [
    { label: 'Revenue', value: result.totalRevenue, type: 'total' as const },
    { label: 'COGS', value: -result.totalCOGS, type: 'cost' as const },
    { label: 'Transport', value: -result.totalTransport, type: 'cost' as const },
    ...result.overheadCosts.map((c) => ({ label: c.name, value: -c.value, type: 'cost' as const })),
    { label: 'Net Profit', value: result.netProfit, type: 'result' as const },
  ].filter((item) => item.value !== 0);

  const maxVal = Math.max(...items.map((i) => Math.abs(i.value)));

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const width = (Math.abs(item.value) / maxVal) * 100;
        const isPositive = item.value >= 0;
        const pctOfRev = rev > 0 ? (Math.abs(item.value) / rev) * 100 : 0;
        const color = item.type === 'total'
          ? 'var(--border)'
          : item.type === 'result'
            ? (isPositive ? '#8BC4A0' : 'var(--danger)')
            : '#D4C4CC';

        return (
          <div key={i}>
            <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {item.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                {item.type !== 'total' && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    color: 'var(--text-faint)',
                  }}>
                    {pctOfRev.toFixed(1)}%
                  </span>
                )}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: item.type === 'cost' ? 'var(--text-muted)' : (isPositive ? 'var(--accent-green)' : 'var(--danger)'),
                  minWidth: 70,
                  textAlign: 'right',
                }}>
                  {item.value < 0 ? '-' : ''}{formatCurrency(Math.abs(item.value), sym)}
                </span>
              </div>
            </div>
            <div style={{ height: 6, background: 'var(--border-subtle)' }}>
              <div style={{
                height: '100%',
                width: `${width}%`,
                background: color,
                transition: 'width 0.3s var(--ease)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
