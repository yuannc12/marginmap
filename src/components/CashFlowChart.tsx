import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Product, Settings, Scenario } from '../types';
import { CURRENCY_SYMBOLS } from '../types';
import { calculateScenarioResult, formatCurrency } from '../utils/calculations';

interface CashFlowChartProps {
  products: Product[];
  settings: Settings;
  scenarios: Scenario[];
}

const SCENARIO_COLORS = ['#8BAFEE', '#4A7A5B', '#C4A35A', '#8B7BB5'];

export function CashFlowChart({ products, settings, scenarios }: CashFlowChartProps) {
  const sym = CURRENCY_SYMBOLS[settings.currency] || settings.currency;

  const chartData = useMemo(() => {
    if (products.length === 0) return [];

    const results = scenarios.map((sc) => calculateScenarioResult(products, settings, sc));
    const months = results[0]?.cashFlow.length ?? 0;

    return Array.from({ length: months }, (_, i) => {
      const point: Record<string, string | number> = { label: results[0].cashFlow[i].label };
      results.forEach((r, si) => {
        point[`revenue_${si}`] = Math.round(r.cashFlow[i].revenue);
        point[`profit_${si}`] = Math.round(r.cashFlow[i].profit);
        point[`cumulative_${si}`] = Math.round(r.cashFlow[i].cumulative);
      });
      return point;
    });
  }, [products, settings, scenarios]);

  if (products.length === 0) {
    return (
      <section className="px-8 py-8 section-border">
        <span className="label-mono mb-4 block">Cash Flow Forecast</span>
        <div
          className="card-static flex items-center justify-center"
          style={{ height: 320, color: 'var(--text-faint)', fontSize: '0.875rem' }}
        >
          Add products to see cash flow projections
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-8 section-border">
      <div className="flex items-center justify-between mb-6">
        <span className="label-mono">Cash Flow Forecast</span>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          {settings.forecastMonths} months
        </span>
      </div>

      <div className="card-static p-6">
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCurrency(v, sym)}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                borderRadius: 0,
              }}
              formatter={(value) => [formatCurrency(Number(value), sym), '']}
              labelStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-faint)' }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            />
            {scenarios.map((sc, i) => (
              <Area
                key={sc.id}
                type="monotone"
                dataKey={`cumulative_${i}`}
                name={`${sc.name} (cumulative)`}
                stroke={SCENARIO_COLORS[i % SCENARIO_COLORS.length]}
                fill={SCENARIO_COLORS[i % SCENARIO_COLORS.length]}
                fillOpacity={0.08}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: SCENARIO_COLORS[i % SCENARIO_COLORS.length], strokeWidth: 2, fill: 'var(--bg-elevated)' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
