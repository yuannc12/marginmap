import { useRef, useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { SettingsPanel } from './components/SettingsPanel';
import { ProductTable } from './components/ProductTable';
import { CashFlowChart } from './components/CashFlowChart';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { ResultsDashboard } from './components/ResultsDashboard';
import { useStore } from './store/useStore';
import { exportToJson, importFromJson, decodeStateFromUrl } from './utils/sharing';

export default function App() {
  const store = useStore();
  const mainRef = useRef<HTMLDivElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Check for URL-encoded state on mount
  useEffect(() => {
    const urlState = decodeStateFromUrl();
    if (urlState) {
      store.importState(urlState);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToMain = () => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExport = () => {
    exportToJson({
      products: store.products,
      settings: store.settings,
      scenarios: store.scenarios,
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = await importFromJson(file);
        store.importState(data);
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed');
        setTimeout(() => setImportError(null), 3000);
      }
    };
    input.click();
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar
        onOpenSettings={scrollToMain}
        onExport={handleExport}
        onImport={handleImport}
      />

      <Hero onStart={scrollToMain} />

      <div ref={mainRef}>
        {importError && (
          <div
            className="px-8 py-3"
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          >
            {importError}
          </div>
        )}

        <SettingsPanel
          settings={store.settings}
          onUpdate={store.updateSettings}
        />

        <ProductTable
          products={store.products}
          settings={store.settings}
          onAdd={store.addProduct}
          onUpdate={store.updateProduct}
          onDelete={store.deleteProduct}
        />

        <CashFlowChart
          products={store.products}
          settings={store.settings}
          scenarios={store.scenarios}
        />

        <ScenarioBuilder
          scenarios={store.scenarios}
          onAdd={store.addScenario}
          onUpdate={store.updateScenario}
          onDelete={store.deleteScenario}
        />

        <ResultsDashboard
          products={store.products}
          settings={store.settings}
          scenarios={store.scenarios}
        />

        {/* Footer */}
        <footer
          className="px-8 py-6 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)', marginTop: '2rem' }}
        >
          <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            MarginMap by yuann.cc
          </span>
          <button
            className="btn btn--outline btn--sm"
            onClick={store.loadSampleData}
          >
            Load Sample Data
          </button>
        </footer>
      </div>
    </div>
  );
}
