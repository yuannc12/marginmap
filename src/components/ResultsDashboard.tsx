import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Product, Settings, Scenario } from '../types';
import { CURRENCY_SYMBOLS } from '../types';
import { calculateScenarioResult, formatCurrency, getMarginColor, getMarginLabel } from '../utils/calculations';

interface ResultsDashboardProps {
  products: Product[];
  settings: Settings;
  scenarios: Scenario[];
}

const PIE_COLORS = ['#8BAFEE', '#4A7A5B', '#C4A35A', '#8B7BB5', '#6B7A8D'];

export function ResultsDashboard({ products, settings, scenarios }: ResultsDashboardProps) {
  const sym = CURRENCY_SYMBOLS[settings.currency] || settings.currency;

  const baseResult = useMemo(() => {
    if (products.length === 0 || scenarios.length === 0) return null;
    return calculateScenarioResult(products, settings, scenarios[0]);
  }, [products, settings, scenarios]);

  if (!baseResult || products.length === 0) {
    return null;
  }

  const marginData = baseResult.products.map((pr) => {
    const product = products.find((p) => p.id === pr.productId);
    return {
      name: product?.name ?? 'Unknown',
      margin: Number(pr.marginPercent.toFixed(1)),
      revenue: pr.revenue,
      profit: pr.netProfit,
    };
  });

  const revenueData = baseResult.products.map((pr) => {
    const product = products.find((p) => p.id === pr.productId);
    return {
      name: product?.name ?? 'Unknown',
      value: pr.revenue,
    };
  });

  return (
    <section className="px-8 py-8 section-border">
      <span className="label-mono mb-6 block">Results Dashboard</span>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8 motion-stagger">
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(baseResult.totalRevenue, sym)}
          sub="Gross revenue"
        />
        <StatCard
          label="Monthly Profit"
          value={formatCurrency(baseResult.totalProfit, sym)}
          sub="After tax"
          color={baseResult.totalProfit >= 0 ? 'var(--accent-green)' : 'var(--danger)'}
        />
        <StatCard
          label="Avg Margin"
          value={`${baseResult.avgMargin.toFixed(1)}%`}
          sub={getMarginLabel(baseResult.avgMargin)}
          color={getMarginColor(baseResult.avgMargin)}
        />
        <StatCard
          label="Annual Projection"
          value={formatCurrency(baseResult.totalProfit * 12, sym)}
          sub="12-month net profit"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Margins by product */}
        <div className="card-static p-5">
          <span className="label-mono mb-4 block" style={{ fontSize: '0.5625rem' }}>Margin by Product</span>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={marginData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  borderRadius: 0,
                }}
                formatter={(value) => [`${value}%`, 'Margin']}
              />
              <Bar dataKey="margin" fill="var(--accent-blue)" barSize={20}>
                {marginData.map((entry, index) => (
                  <Cell key={index} fill={getMarginColor(entry.margin)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue breakdown */}
        <div className="card-static p-5">
          <span className="label-mono mb-4 block" style={{ fontSize: '0.5625rem' }}>Revenue Breakdown</span>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {revenueData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  borderRadius: 0,
                }}
                formatter={(value) => [formatCurrency(Number(value), sym), 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Margin Heatmap */}
      <div className="card-static p-5">
        <span className="label-mono mb-4 block" style={{ fontSize: '0.5625rem' }}>Margin Heatmap</span>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(products.length, 6)}, 1fr)` }}>
          {baseResult.products.map((pr) => {
            const product = products.find((p) => p.id === pr.productId);
            const color = getMarginColor(pr.marginPercent);
            return (
              <div
                key={pr.productId}
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem', marginBottom: '8px' }}>
                  {product?.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 600, color, letterSpacing: '-0.02em' }}>
                  {pr.marginPercent.toFixed(1)}%
                </div>
                <div className="label-mono" style={{ fontSize: '0.5625rem', color, marginTop: '4px' }}>
                  {getMarginLabel(pr.marginPercent)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-faint)', marginTop: '8px' }}>
                  BE: {pr.breakeven === Infinity ? '--' : `${pr.breakeven} units`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="card-static p-5">
      <span className="label-mono mb-2 block" style={{ fontSize: '0.5625rem' }}>{label}</span>
      <div
        className="font-display"
        style={{
          fontSize: '1.75rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: color ?? 'var(--text-primary)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <span style={{ color: 'var(--text-faint)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
        {sub}
      </span>
    </div>
  );
}
