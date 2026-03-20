export interface Product {
  id: string;
  name: string;
  unitCost: number;
  salePrice: number;
  unitsPerMonth: number;
  fixedCosts: number;
}

export interface Settings {
  taxRate: number;
  platformFee: number;
  currency: string;
  forecastMonths: number;
  strategy: PricingStrategy;
}

export type PricingStrategy = 'custom' | 'cost-plus' | 'value-based' | 'competitive';

export interface Scenario {
  id: string;
  name: string;
  priceMultiplier: number;
  costMultiplier: number;
  volumeMultiplier: number;
}

export interface ProductResult {
  productId: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
  breakeven: number;
  netProfit: number;
}

export interface ScenarioResult {
  scenarioId: string;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  avgMargin: number;
  products: ProductResult[];
  cashFlow: CashFlowPoint[];
}

export interface CashFlowPoint {
  month: number;
  label: string;
  revenue: number;
  costs: number;
  profit: number;
  cumulative: number;
}

export interface AppState {
  products: Product[];
  settings: Settings;
  scenarios: Scenario[];
}

export const DEFAULT_SETTINGS: Settings = {
  taxRate: 21,
  platformFee: 0,
  currency: 'EUR',
  forecastMonths: 12,
  strategy: 'custom',
};

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'SaaS Pro Plan',
    unitCost: 12,
    salePrice: 49,
    unitsPerMonth: 200,
    fixedCosts: 2400,
  },
  {
    id: '2',
    name: 'API Credits Bundle',
    unitCost: 0.8,
    salePrice: 5,
    unitsPerMonth: 1500,
    fixedCosts: 800,
  },
  {
    id: '3',
    name: 'Enterprise License',
    unitCost: 250,
    salePrice: 1200,
    unitsPerMonth: 8,
    fixedCosts: 1200,
  },
  {
    id: '4',
    name: 'Onboarding Package',
    unitCost: 80,
    salePrice: 350,
    unitsPerMonth: 15,
    fixedCosts: 500,
  },
];

export const DEFAULT_SCENARIOS: Scenario[] = [
  { id: 'baseline', name: 'Baseline', priceMultiplier: 1, costMultiplier: 1, volumeMultiplier: 1 },
  { id: 'growth', name: 'Growth (+20% vol)', priceMultiplier: 1, costMultiplier: 1, volumeMultiplier: 1.2 },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '\u20AC',
  USD: '$',
  GBP: '\u00A3',
  JPY: '\u00A5',
};

export const STRATEGY_LABELS: Record<PricingStrategy, { name: string; description: string }> = {
  custom: { name: 'Custom', description: 'Set your own prices' },
  'cost-plus': { name: 'Cost-Plus', description: 'Unit cost + fixed markup %' },
  'value-based': { name: 'Value-Based', description: 'Price based on perceived value' },
  competitive: { name: 'Competitive', description: 'Match or undercut market rates' },
};
