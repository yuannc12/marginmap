import { useRef, useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { SettingsPanel } from './components/SettingsPanel';
import { ProductCards } from './components/ProductCards';
import { SankeyChart } from './components/SankeyChart';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { useStore } from './store/useStore';
import { exportToJson, importFromJson, decodeStateFromUrl } from './utils/sharing';

export default function App() {
  const store = useStore();
  const mainRef = useRef<HTMLDivElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const urlState = decodeStateFromUrl();
    if (urlState) {
      store.importState(urlState);
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
      <Hero onStart={scrollToMain} />

      <div ref={mainRef}>
        <TopBar onExport={handleExport} onImport={handleImport} />

        {importError && (
          <div
            className="page-shell"
            style={{
              padding: '12px 24px',
              background: 'rgba(196, 74, 74, 0.08)',
              color: 'var(--danger)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
            }}
          >
            {importError}
          </div>
        )}

        <SettingsPanel
          settings={store.settings}
          onUpdate={store.updateSettings}
          onAddCost={store.addOverheadCost}
          onUpdateCost={store.updateOverheadCost}
          onRemoveCost={store.removeOverheadCost}
        />

        <ProductCards
          products={store.products}
          settings={store.settings}
          onAdd={store.addProduct}
          onUpdate={store.updateProduct}
          onDelete={store.deleteProduct}
          onAddCost={store.addProductCost}
          onRemoveCost={store.removeProductCost}
        />

        <SankeyChart
          products={store.products}
          settings={store.settings}
          scenarios={store.scenarios}
        />

        <ScenarioBuilder
          products={store.products}
          settings={store.settings}
          scenarios={store.scenarios}
          onAdd={store.addScenario}
          onUpdate={store.updateScenario}
          onDelete={store.deleteScenario}
          onUpsertOverride={store.upsertProductOverride}
          onRemoveOverride={store.removeProductOverride}
        />

        {/* Footer */}
        <footer
          className="page-shell flex items-center justify-between"
          style={{
            padding: '24px',
            borderTop: '1px solid var(--border)',
            marginTop: 24,
          }}
        >
          <span style={{ color: 'var(--text-faint)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            MarginMap by yuann.cc
          </span>
          <button
            className="btn btn--outline"
            onClick={store.loadSampleData}
            style={{ fontSize: '0.5625rem' }}
          >
            Load Sample Data
          </button>
        </footer>
      </div>
    </div>
  );
}
