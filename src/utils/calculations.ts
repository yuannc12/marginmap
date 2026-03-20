import type { Product, Settings, Scenario, ScenarioResult, ProductResult, CashFlowPoint } from '../types';

export function calculateProductResult(
  product: Product,
  settings: Settings,
  scenario: Scenario
): ProductResult {
  const price = product.salePrice * scenario.priceMultiplier;
  const cost = product.unitCost * scenario.costMultiplier;
  const units = Math.round(product.unitsPerMonth * scenario.volumeMultiplier);

  const monthlyRevenue = price * units;
  const monthlyCOGS = cost * units;
  const monthlyFixed = product.fixedCosts;
  const platformFee = monthlyRevenue * (settings.platformFee / 100);
  const grossProfit = monthlyRevenue - monthlyCOGS - monthlyFixed - platformFee;
  const marginPercent = monthlyRevenue > 0 ? (grossProfit / monthlyRevenue) * 100 : 0;

  // Breakeven: fixed costs / (price - variable cost per unit)
  const contributionPerUnit = price - cost - price * (settings.platformFee / 100);
  const breakeven = contributionPerUnit > 0 ? Math.ceil(monthlyFixed / contributionPerUnit) : Infinity;

  const tax = grossProfit > 0 ? grossProfit * (settings.taxRate / 100) : 0;
  const netProfit = grossProfit - tax;

  return {
    productId: product.id,
    revenue: monthlyRevenue,
    cogs: monthlyCOGS + monthlyFixed + platformFee,
    grossProfit,
    marginPercent,
    breakeven,
    netProfit,
  };
}

export function calculateScenarioResult(
  products: Product[],
  settings: Settings,
  scenario: Scenario
): ScenarioResult {
  const productResults = products.map((p) => calculateProductResult(p, settings, scenario));

  const totalRevenue = productResults.reduce((s, r) => s + r.revenue, 0);
  const totalCosts = productResults.reduce((s, r) => s + r.cogs, 0);
  const totalProfit = productResults.reduce((s, r) => s + r.netProfit, 0);
  const avgMargin = totalRevenue > 0
    ? productResults.reduce((s, r) => s + r.grossProfit, 0) / totalRevenue * 100
    : 0;

  const cashFlow = generateCashFlow(totalRevenue, totalCosts, totalProfit, settings.forecastMonths);

  return {
    scenarioId: scenario.id,
    totalRevenue,
    totalCosts,
    totalProfit,
    avgMargin,
    products: productResults,
    cashFlow,
  };
}

function generateCashFlow(
  monthlyRevenue: number,
  monthlyCosts: number,
  monthlyProfit: number,
  months: number
): CashFlowPoint[] {
  const now = new Date();
  const points: CashFlowPoint[] = [];
  let cumulative = 0;

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    cumulative += monthlyProfit;

    points.push({
      month: i + 1,
      label,
      revenue: monthlyRevenue,
      costs: monthlyCosts,
      profit: monthlyProfit,
      cumulative,
    });
  }

  return points;
}

export function formatCurrency(value: number, symbol: string): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${value.toFixed(0)}`;
}

export function getMarginColor(margin: number): string {
  if (margin >= 60) return '#4A7A5B';
  if (margin >= 40) return '#8B8F44';
  if (margin >= 20) return '#C4A35A';
  if (margin >= 0) return '#C47A3A';
  return '#C44A4A';
}

export function getMarginLabel(margin: number): string {
  if (margin >= 60) return 'Excellent';
  if (margin >= 40) return 'Healthy';
  if (margin >= 20) return 'Fair';
  if (margin >= 0) return 'Thin';
  return 'Loss';
}
