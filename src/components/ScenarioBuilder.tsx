import { useMemo } from 'react';
import { ModeToggle } from './ModeToggle';
import type { Product, Settings, Scenario, SimulationResult } from '../types';
import { CURRENCY_SYMBOLS } from '../types';
import { simulate, formatCurrency } from '../utils/calculations';

interface ScenarioBuilderProps {
  products: Product[];
  settings: Settings;
  scenarios: Scenario[];
  onAdd: (scenario: Omit<Scenario, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Scenario>) => void;
  onDelete: (id: string) => void;
}

// Baseline is always: no price adjustment, 100% sell-through
const BASELINE_SCENARIO: Scenario = {
  id: '__baseline__',
  name: 'Current',
  priceAdjustment: 0,
  priceAdjustMode: 'percent',
  sellThrough: 100,
  productOverrides: [],
};

export function ScenarioBuilder({ products, settings, scenarios, onAdd, onUpdate, onDelete }: ScenarioBuilderProps) {
  const sym = CURRENCY_SYMBOLS[settings.currency] || settings.currency;

  // Always compute baseline from current inputs
  const baseline = useMemo(() => simulate(products, settings, BASELINE_SCENARIO), [products, settings]);

  // Compute each user scenario
  const scenarioResults = useMemo(() => {
    return scenarios.map((sc) => ({
      scenario: sc,
      result: simulate(products, settings, sc),
    }));
  }, [products, settings, scenarios]);

  // All results for comparison (baseline + user scenarios)
  const allResults: { name: string; result: SimulationResult; isBaseline: boolean }[] = [
    { name: 'Current', result: baseline, isBaseline: true },
    ...scenarioResults.map(({ scenario, result }) => ({
      name: scenario.name,
      result,
      isBaseline: false,
    })),
  ];

  const handleAdd = () => {
    onAdd({
      name: `Scenario ${scenarios.length + 1}`,
      priceAdjustment: 0,
      priceAdjustMode: 'percent',
      sellThrough: 100,
      productOverrides: [],
    });
  };

  const maxRevenue = Math.max(...allResults.map((r) => r.result.totalRevenue), 1);

  return (
    <section className="section">
      <div className="page-shell">
        <div className="flex items-baseline justify-between" style={{ marginBottom: 32 }}>
          <div>
            <div className="section-label">04</div>
            <div className="section-title">Scenarios</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, maxWidth: 400 }}>
              Your current numbers are shown as "Current". Add scenarios to see how changes affect profitability.
            </p>
          </div>
          <button className="btn btn--primary" onClick={handleAdd}>
            + Add Scenario
          </button>
        </div>

        {/* Comparison visual — always visible */}
        <div className="card" style={{ marginBottom: 16, padding: 24 }}>
          <div className="field-label" style={{ marginBottom: 20 }}>
            {scenarios.length > 0 ? 'Comparison' : 'Current Breakdown'}
          </div>

          {scenarios.length === 0 ? (
            /* No user scenarios: show waterfall breakdown of current state */
            <WaterfallBreakdown result={baseline} sym={sym} />
          ) : (
            /* Has scenarios: show comparison bars */
            <div className="flex flex-col gap-4">
              {allResults.map((item, idx) => {
                const revenueWidth = (item.result.totalRevenue / maxRevenue) * 100;
                const profitWidth = Math.max(0, (item.result.netProfit / maxRevenue) * 100);
                const deltaProfit = item.result.netProfit - baseline.netProfit;
                const deltaMargin = item.result.margin - baseline.margin;

                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: item.isBaseline ? 'var(--text-faint)' : 'var(--text-primary)',
                      }}>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="stat-value">{formatCurrency(item.result.netProfit, sym)}</span>
                        {!item.isBaseline && deltaProfit !== 0 && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            color: deltaProfit > 0 ? 'var(--accent-green)' : 'var(--danger)',
                          }}>
                            {deltaProfit > 0 ? '+' : ''}{formatCurrency(deltaProfit, sym)} ({deltaMargin > 0 ? '+' : ''}{deltaMargin.toFixed(1)}pp)
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'var(--border-subtle)', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${revenueWidth}%`,
                        background: item.isBaseline ? 'var(--border)' : 'rgba(0,0,0,0.12)',
                        transition: 'width 0.3s var(--ease)',
                      }} />
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${profitWidth}%`,
                        background: item.result.netProfit >= 0 ? '#8BC4A0' : 'var(--danger)',
                        opacity: item.isBaseline ? 0.5 : 1,
                        transition: 'width 0.3s var(--ease)',
                      }} />
                    </div>
                    <div className="flex justify-between" style={{ marginTop: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-faint)' }}>
                        Revenue {formatCurrency(item.result.totalRevenue, sym)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-faint)' }}>
                        Margin {item.result.margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User scenario cards */}
        {scenarios.length > 0 && (
          <div
            className="motion-stagger"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(scenarios.length, 3)}, 1fr)`,
              gap: 16,
            }}
          >
            {scenarioResults.map(({ scenario, result }) => {
              const deltaProfit = result.netProfit - baseline.netProfit;
              const deltaMargin = result.margin - baseline.margin;

              return (
                <div key={scenario.id} className="card">
                  <div className="card-header">
                    <input
                      className="input-inline"
                      type="text"
                      value={scenario.name}
                      onChange={(e) => onUpdate(scenario.id, { name: e.target.value })}
                      style={{ fontSize: '0.9375rem' }}
                    />
                    {scenarios.length > 1 && (
                      <button
                        className="btn--danger"
                        onClick={() => onDelete(scenario.id)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4" style={{ marginBottom: 20 }}>
                    <div className="field">
                      <div className="field-label">Price Adjustment</div>
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

                    <div className="field">
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

                  {/* Results with delta from baseline */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                    <div className="stat-row">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">{formatCurrency(result.totalRevenue, sym)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Net Profit</span>
                      <div className="flex items-center gap-2">
                        {deltaProfit !== 0 && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5625rem',
                            color: deltaProfit > 0 ? 'var(--accent-green)' : 'var(--danger)',
                          }}>
                            {deltaProfit > 0 ? '+' : ''}{formatCurrency(deltaProfit, sym)}
                          </span>
                        )}
                        <span
                          className="stat-value"
                          style={{ color: result.netProfit >= 0 ? 'var(--accent-green)' : 'var(--danger)' }}
                        >
                          {formatCurrency(result.netProfit, sym)}
                        </span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Margin</span>
                      <div className="flex items-center gap-2">
                        {deltaMargin !== 0 && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5625rem',
                            color: deltaMargin > 0 ? 'var(--accent-green)' : 'var(--danger)',
                          }}>
                            {deltaMargin > 0 ? '+' : ''}{deltaMargin.toFixed(1)}pp
                          </span>
                        )}
                        <span className="stat-value">{result.margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* Waterfall breakdown for current state (no scenarios added yet) */
function WaterfallBreakdown({ result, sym }: { result: SimulationResult; sym: string }) {
  const items = [
    { label: 'Revenue', value: result.totalRevenue, type: 'total' as const },
    { label: 'COGS', value: -result.totalCOGS, type: 'cost' as const },
    { label: 'Transport', value: -result.totalTransport, type: 'cost' as const },
    ...result.overheadCosts.map((c) => ({ label: c.name, value: -c.value, type: 'cost' as const })),
    { label: 'Tax', value: -result.tax, type: 'cost' as const },
    { label: 'Net Profit', value: result.netProfit, type: 'result' as const },
  ].filter((item) => item.value !== 0);

  const maxVal = Math.max(...items.map((i) => Math.abs(i.value)));

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const width = (Math.abs(item.value) / maxVal) * 100;
        const isPositive = item.value >= 0;
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
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: item.type === 'cost' ? 'var(--text-muted)' : (isPositive ? 'var(--accent-green)' : 'var(--danger)'),
              }}>
                {item.value < 0 ? '-' : ''}{formatCurrency(Math.abs(item.value), sym)}
              </span>
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
