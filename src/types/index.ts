export interface CostEntry {
  id: string;
  name: string;
  value: number; // always $ per unit (products) or $ flat (overhead)
}

export interface Product {
  id: string;
  name: string;
  description: string;
  pricePerUnit: number;
  quantity: number;
  sellThrough: number; // 0-100% — expected baseline sell-through
  cogs: number; // $ per unit
  transportation: number; // $ per unit
  otherCosts: CostEntry[];
}

export interface Settings {
  overheadCosts: CostEntry[];
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
  priceAdjustment: number;
  priceAdjustMode: 'percent' | 'dollar';
  sellThrough: number; // 0-100%
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
  overheadCosts: [
    { id: 'roast', name: 'Roastery Lease', value: 1800 },
    { id: 'labor', name: 'Part-time Staff', value: 2400 },
    { id: 'mkt', name: 'Social & Ads', value: 650 },
    { id: 'platform', name: 'Shopify + Tools', value: 180 },
    { id: 'ins', name: 'Insurance', value: 220 },
  ],
};

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'House Blend 250g',
    description: 'Everyday medium roast — high volume, low margin',
    pricePerUnit: 12.5,
    quantity: 500,
    sellThrough: 95,
    cogs: 3.2,
    transportation: 1.1,
    otherCosts: [
      { id: 'label1', name: 'Label & Bag', value: 0.45 },
    ],
  },
  {
    id: '2',
    name: 'Single Origin Ethiopia',
    description: 'Specialty Yirgacheffe — premium, seasonal availability',
    pricePerUnit: 18.9,
    quantity: 200,
    sellThrough: 80,
    cogs: 6.8,
    transportation: 1.1,
    otherCosts: [
      { id: 'label2', name: 'Label & Bag', value: 0.45 },
      { id: 'card2', name: 'Tasting Card', value: 0.3 },
    ],
  },
  {
    id: '3',
    name: 'Discovery Gift Set',
    description: '3x100g tins + brew guide — high margin, gift market',
    pricePerUnit: 39.5,
    quantity: 80,
    sellThrough: 65,
    cogs: 9.5,
    transportation: 3.2,
    otherCosts: [
      { id: 'tin3', name: 'Tin Packaging', value: 2.8 },
      { id: 'guide3', name: 'Brew Guide Insert', value: 0.6 },
      { id: 'box3', name: 'Gift Box', value: 1.5 },
    ],
  },
];

export const DEFAULT_SCENARIOS: Scenario[] = [];

export const EMPTY_OVERRIDE: Omit<ProductOverride, 'productId'> = {
  priceAdjustment: 0,
  priceAdjustMode: 'percent',
  sellThrough: 100,
};

export const SYM = '$';
