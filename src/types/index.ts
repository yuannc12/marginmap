export interface CostEntry {
  id: string;
  name: string;
  value: number;
  mode: 'percent' | 'dollar';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  pricePerUnit: number;
  quantity: number;
  cogs: number;
  cogsMode: 'percent' | 'dollar';
  transportation: number;
  transportMode: 'percent' | 'dollar';
  otherCosts: CostEntry[];
}

export interface Settings {
  taxRate: number;
  taxMode: 'percent' | 'dollar';
  overheadCosts: CostEntry[];
  currency: string;
}

export interface ProductOverride {
  productId: string;
  priceAdjustment: number;
  priceAdjustMode: 'percent' | 'dollar';
  sellThrough: number; // 0-100%
}

export interface Scenario {
  id: string;
  name: string;
  // Global defaults (applied to products without an override)
  priceAdjustment: number;
  priceAdjustMode: 'percent' | 'dollar';
  sellThrough: number; // 0-100%
  // Per-product overrides
  productOverrides: ProductOverride[];
}

export interface ProductResult {
  productId: string;
  name: string;
  revenue: number;
  cogsTotal: number;
  transportTotal: number;
  otherCostsTotal: number;
  grossProfit: number;
  marginPercent: number;
}

export interface SimulationResult {
  scenarioId: string;
  products: ProductResult[];
  totalRevenue: number;
  totalCOGS: number;
  totalTransport: number;
  totalProductOther: number;
  grossProfit: number;
  overheadCosts: { name: string; value: number }[];
  totalOverhead: number;
  preTaxProfit: number;
  tax: number;
  netProfit: number;
  margin: number;
}

// Sankey node/link types
export interface SankeyNode {
  name: string;
  color: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color: string;
}

export interface AppState {
  products: Product[];
  settings: Settings;
  scenarios: Scenario[];
}

export const DEFAULT_SETTINGS: Settings = {
  taxRate: 21,
  taxMode: 'percent',
  overheadCosts: [
    { id: 'ops', name: 'Operations', value: 2000, mode: 'dollar' },
    { id: 'mkt', name: 'Marketing', value: 500, mode: 'dollar' },
    { id: 'rent', name: 'Office Rental', value: 1000, mode: 'dollar' },
    { id: 'tools', name: 'Digital Tools', value: 300, mode: 'dollar' },
  ],
  currency: 'EUR',
};

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Black Box S',
    description: 'Compact starter kit',
    pricePerUnit: 120,
    quantity: 100,
    cogs: 30,
    cogsMode: 'dollar',
    transportation: 0,
    transportMode: 'dollar',
    otherCosts: [],
  },
  {
    id: '2',
    name: 'Black Box M',
    description: 'Standard edition',
    pricePerUnit: 200,
    quantity: 80,
    cogs: 50,
    cogsMode: 'dollar',
    transportation: 10,
    transportMode: 'dollar',
    otherCosts: [],
  },
  {
    id: '3',
    name: 'Black Box XL',
    description: 'Premium bundle',
    pricePerUnit: 450,
    quantity: 40,
    cogs: 120,
    cogsMode: 'dollar',
    transportation: 25,
    transportMode: 'dollar',
    otherCosts: [],
  },
];

export const DEFAULT_SCENARIOS: Scenario[] = [];

export const EMPTY_OVERRIDE: Omit<ProductOverride, 'productId'> = {
  priceAdjustment: 0,
  priceAdjustMode: 'percent',
  sellThrough: 100,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '\u20AC',
  USD: '$',
  GBP: '\u00A3',
};
