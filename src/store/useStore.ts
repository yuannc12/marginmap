import { useState, useCallback, useEffect } from 'react';
import type { Product, Settings, Scenario, CostEntry, AppState, ProductOverride } from '../types';
import { DEFAULT_SETTINGS, SAMPLE_PRODUCTS, DEFAULT_SCENARIOS } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'marginmap-v4';

function isValidState(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.products) || !d.settings || !Array.isArray(d.scenarios)) return false;
  const s = d.settings as Record<string, unknown>;
  // Must have the new unified overheadCosts array
  if (!Array.isArray(s.overheadCosts)) return false;
  return true;
}

function migrateScenarios(scenarios: Scenario[]): Scenario[] {
  return scenarios.map((sc) => ({
    ...sc,
    productOverrides: sc.productOverrides ?? [],
  }));
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) {
        return { ...parsed, scenarios: migrateScenarios(parsed.scenarios) };
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* ignore */ }
  return {
    products: SAMPLE_PRODUCTS,
    settings: DEFAULT_SETTINGS,
    scenarios: DEFAULT_SCENARIOS,
  };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { saveState(state); }, [state]);

  // Products
  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setState((s) => ({ ...s, products: [...s.products, { ...product, id: uuidv4() }] }));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setState((s) => ({ ...s, products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  }, []);

  const addProductCost = useCallback((productId: string, cost: Omit<CostEntry, 'id'>) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === productId ? { ...p, otherCosts: [...p.otherCosts, { ...cost, id: uuidv4() }] } : p
      ),
    }));
  }, []);

  const removeProductCost = useCallback((productId: string, costId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === productId ? { ...p, otherCosts: p.otherCosts.filter((c) => c.id !== costId) } : p
      ),
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...updates } }));
  }, []);

  const addOverheadCost = useCallback((cost: Omit<CostEntry, 'id'>) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, overheadCosts: [...s.settings.overheadCosts, { ...cost, id: uuidv4() }] },
    }));
  }, []);

  const updateOverheadCost = useCallback((costId: string, updates: Partial<CostEntry>) => {
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        overheadCosts: s.settings.overheadCosts.map((c) => (c.id === costId ? { ...c, ...updates } : c)),
      },
    }));
  }, []);

  const removeOverheadCost = useCallback((costId: string) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, overheadCosts: s.settings.overheadCosts.filter((c) => c.id !== costId) },
    }));
  }, []);

  // Scenarios
  const addScenario = useCallback((scenario: Omit<Scenario, 'id'>) => {
    setState((s) => ({ ...s, scenarios: [...s.scenarios, { ...scenario, id: uuidv4() }] }));
  }, []);

  const updateScenario = useCallback((id: string, updates: Partial<Scenario>) => {
    setState((s) => ({ ...s, scenarios: s.scenarios.map((sc) => (sc.id === id ? { ...sc, ...updates } : sc)) }));
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setState((s) => ({ ...s, scenarios: s.scenarios.filter((sc) => sc.id !== id) }));
  }, []);

  const upsertProductOverride = useCallback((scenarioId: string, override: ProductOverride) => {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.map((sc) => {
        if (sc.id !== scenarioId) return sc;
        const existing = sc.productOverrides.findIndex((o) => o.productId === override.productId);
        const overrides = [...sc.productOverrides];
        if (existing >= 0) overrides[existing] = override;
        else overrides.push(override);
        return { ...sc, productOverrides: overrides };
      }),
    }));
  }, []);

  const removeProductOverride = useCallback((scenarioId: string, productId: string) => {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.map((sc) =>
        sc.id === scenarioId
          ? { ...sc, productOverrides: sc.productOverrides.filter((o) => o.productId !== productId) }
          : sc
      ),
    }));
  }, []);

  const importState = useCallback((imported: AppState) => { setState(imported); }, []);

  const loadSampleData = useCallback(() => {
    setState({ products: SAMPLE_PRODUCTS, settings: DEFAULT_SETTINGS, scenarios: DEFAULT_SCENARIOS });
  }, []);

  return {
    ...state,
    addProduct, updateProduct, deleteProduct,
    addProductCost, removeProductCost,
    updateSettings,
    addOverheadCost, updateOverheadCost, removeOverheadCost,
    addScenario, updateScenario, deleteScenario, upsertProductOverride, removeProductOverride,
    importState, loadSampleData,
  };
}

export type Store = ReturnType<typeof useStore>;
