import { useState, useCallback, useEffect } from 'react';
import type { Product, Settings, Scenario, AppState } from '../types';
import { DEFAULT_SETTINGS, SAMPLE_PRODUCTS, DEFAULT_SCENARIOS } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'marginmap-data';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Products
  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setState((s) => ({
      ...s,
      products: [...s.products, { ...product, id: uuidv4() }],
    }));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      products: s.products.filter((p) => p.id !== id),
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, ...updates },
    }));
  }, []);

  // Scenarios
  const addScenario = useCallback((scenario: Omit<Scenario, 'id'>) => {
    setState((s) => ({
      ...s,
      scenarios: [...s.scenarios, { ...scenario, id: uuidv4() }],
    }));
  }, []);

  const updateScenario = useCallback((id: string, updates: Partial<Scenario>) => {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.map((sc) => (sc.id === id ? { ...sc, ...updates } : sc)),
    }));
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.filter((sc) => sc.id !== id),
    }));
  }, []);

  // Import full state
  const importState = useCallback((imported: AppState) => {
    setState(imported);
  }, []);

  const loadSampleData = useCallback(() => {
    setState({
      products: SAMPLE_PRODUCTS,
      settings: DEFAULT_SETTINGS,
      scenarios: DEFAULT_SCENARIOS,
    });
  }, []);

  return {
    ...state,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    addScenario,
    updateScenario,
    deleteScenario,
    importState,
    loadSampleData,
  };
}

export type Store = ReturnType<typeof useStore>;
