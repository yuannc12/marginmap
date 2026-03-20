import type { Product, Settings, Scenario, SimulationResult, ProductResult, SankeyNode, SankeyLink } from '../types';

function resolveCost(value: number, mode: 'percent' | 'dollar', reference: number): number {
  return mode === 'percent' ? reference * (value / 100) : value;
}

function getOverrideForProduct(scenario: Scenario, productId: string): { priceAdjustment: number; priceAdjustMode: 'percent' | 'dollar'; sellThrough: number } {
  const override = scenario.productOverrides?.find((o) => o.productId === productId);
  if (override) return override;
  return { priceAdjustment: scenario.priceAdjustment, priceAdjustMode: scenario.priceAdjustMode, sellThrough: scenario.sellThrough };
}

export function simulate(
  products: Product[],
  settings: Settings,
  scenario: Scenario
): SimulationResult {
  const productResults: ProductResult[] = products.map((p) => {
    const params = getOverrideForProduct(scenario, p.id);

    let adjustedPrice = p.pricePerUnit;
    if (params.priceAdjustMode === 'percent') {
      adjustedPrice = p.pricePerUnit * (1 + params.priceAdjustment / 100);
    } else {
      adjustedPrice = p.pricePerUnit + params.priceAdjustment;
    }

    const unitsSold = Math.round(p.quantity * (params.sellThrough / 100));
    const revenue = adjustedPrice * unitsSold;

    const cogsPerUnit = resolveCost(p.cogs, p.cogsMode, adjustedPrice);
    const transportPerUnit = resolveCost(p.transportation, p.transportMode, adjustedPrice);

    const cogsTotal = cogsPerUnit * unitsSold;
    const transportTotal = transportPerUnit * unitsSold;

    let otherCostsTotal = 0;
    for (const c of p.otherCosts) {
      otherCostsTotal += resolveCost(c.value, c.mode, revenue);
    }

    const grossProfit = revenue - cogsTotal - transportTotal - otherCostsTotal;
    const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      productId: p.id,
      name: p.name,
      revenue,
      cogsTotal,
      transportTotal,
      otherCostsTotal,
      grossProfit,
      marginPercent,
    };
  });

  const totalRevenue = productResults.reduce((s, r) => s + r.revenue, 0);
  const totalCOGS = productResults.reduce((s, r) => s + r.cogsTotal, 0);
  const totalTransport = productResults.reduce((s, r) => s + r.transportTotal, 0);
  const totalProductOther = productResults.reduce((s, r) => s + r.otherCostsTotal, 0);
  const grossProfit = totalRevenue - totalCOGS - totalTransport - totalProductOther;

  // All overhead costs from the unified list
  const overheadCosts = settings.overheadCosts.map((c) => ({
    name: c.name,
    value: resolveCost(c.value, c.mode, totalRevenue),
  }));
  const totalOverhead = overheadCosts.reduce((s, c) => s + c.value, 0);

  const preTaxProfit = grossProfit - totalOverhead;
  const tax = preTaxProfit > 0
    ? resolveCost(settings.taxRate, settings.taxMode, preTaxProfit)
    : 0;
  const netProfit = preTaxProfit - tax;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    scenarioId: scenario.id,
    products: productResults,
    totalRevenue,
    totalCOGS,
    totalTransport,
    totalProductOther,
    grossProfit,
    overheadCosts,
    totalOverhead,
    preTaxProfit,
    tax,
    netProfit,
    margin,
  };
}

// Editorial palette — matches hero grid design
const PALETTE = {
  product: ['#8BAFEE', '#6B93D8', '#A8C4F0'],  // accent blues
  revenue: '#E8E7E3',    // warm light (visible on dark bg)
  gross: '#8BAFEE',      // accent blue
  cogs: '#9A9A9A',       // neutral gray
  transport: '#B0AFAB',  // mid gray
  net: '#8BC4A0',        // green (profit should read as positive)
  tax: '#D4C4BB',        // warm beige
  overhead: '#B0AFAB',   // warm gray
  cost: '#B0AFAB',       // mid gray
};

export function buildSankeyData(
  result: SimulationResult,
  products: Product[]
): { nodes: SankeyNode[]; links: SankeyLink[] } {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Product nodes
  products.forEach((p, i) => {
    nodes.push({ name: p.name, color: PALETTE.product[i % PALETTE.product.length] });
  });

  // Revenue node
  const revenueIdx = nodes.length;
  nodes.push({ name: 'Revenue', color: PALETTE.revenue });

  // Cost of goods node
  const cogsIdx = nodes.length;
  nodes.push({ name: 'COGS', color: PALETTE.cogs });

  // Gross profit node
  const grossIdx = nodes.length;
  nodes.push({ name: 'Gross Profit', color: PALETTE.gross });

  // Net profit
  const netIdx = nodes.length;
  nodes.push({ name: 'Net Profit', color: PALETTE.net });

  // Tax
  const taxIdx = nodes.length;
  nodes.push({ name: 'Tax', color: PALETTE.tax });

  // Overhead cost nodes (one per entry)
  const overheadStartIdx = nodes.length;
  result.overheadCosts.forEach((c) => {
    nodes.push({ name: c.name, color: PALETTE.overhead });
  });

  // Links: products → revenue
  result.products.forEach((pr, i) => {
    if (pr.revenue > 0) {
      links.push({ source: i, target: revenueIdx, value: pr.revenue, color: PALETTE.product[i % PALETTE.product.length] });
    }
  });

  // Revenue → COGS (total product costs)
  const totalDirectCosts = result.totalCOGS + result.totalTransport + result.totalProductOther;
  if (totalDirectCosts > 0) {
    links.push({ source: revenueIdx, target: cogsIdx, value: totalDirectCosts, color: PALETTE.cogs });
  }

  // Revenue → Gross Profit
  if (result.grossProfit > 0) {
    links.push({ source: revenueIdx, target: grossIdx, value: result.grossProfit, color: PALETTE.gross });
  }

  // Gross Profit → Net Profit
  if (result.netProfit > 0) {
    links.push({ source: grossIdx, target: netIdx, value: result.netProfit, color: PALETTE.net });
  }

  // Gross Profit → Tax
  if (result.tax > 0) {
    links.push({ source: grossIdx, target: taxIdx, value: result.tax, color: PALETTE.tax });
  }

  // Gross Profit → each overhead cost
  result.overheadCosts.forEach((c, i) => {
    if (c.value > 0) {
      links.push({ source: grossIdx, target: overheadStartIdx + i, value: c.value, color: PALETTE.overhead });
    }
  });

  return { nodes, links };
}

export function formatCurrency(value: number, symbol: string): string {
  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${Math.round(value).toLocaleString()}`;
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}
