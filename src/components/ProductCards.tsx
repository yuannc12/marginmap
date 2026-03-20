import { ModeToggle } from './ModeToggle';
import type { Product, Settings, CostEntry } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

interface ProductCardsProps {
  products: Product[];
  settings: Settings;
  onAdd: (product: Omit<Product, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onAddCost: (productId: string, cost: Omit<CostEntry, 'id'>) => void;
  onRemoveCost: (productId: string, costId: string) => void;
}

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  description: '',
  pricePerUnit: 0,
  quantity: 0,
  cogs: 0,
  cogsMode: 'dollar',
  transportation: 0,
  transportMode: 'dollar',
  otherCosts: [],
};

export function ProductCards({ products, settings, onAdd, onUpdate, onDelete, onAddCost, onRemoveCost }: ProductCardsProps) {
  const sym = CURRENCY_SYMBOLS[settings.currency] || settings.currency;

  return (
    <section className="section">
      <div className="page-shell">
        <div className="flex items-baseline justify-between" style={{ marginBottom: 32 }}>
          <div>
            <div className="section-label">02</div>
            <div className="section-title">Products</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, maxWidth: 400 }}>
              Add your products with pricing, quantities, and per-unit costs.
            </p>
          </div>
          <button className="btn btn--primary" onClick={() => onAdd(EMPTY_PRODUCT)}>
            + Add Product
          </button>
        </div>

        <div className="flex flex-col gap-4 motion-stagger">
          {products.map((product) => (
            <div key={product.id} className="card">
              {/* Header */}
              <div className="card-header">
                <div style={{ flex: 1 }}>
                  <input
                    className="input-inline"
                    type="text"
                    value={product.name}
                    onChange={(e) => onUpdate(product.id, { name: e.target.value })}
                    placeholder="Product name"
                  />
                  <input
                    className="input-desc"
                    type="text"
                    value={product.description}
                    onChange={(e) => onUpdate(product.id, { description: e.target.value })}
                    placeholder="Short description"
                    style={{ marginTop: 2 }}
                  />
                </div>
                <button
                  className="btn--danger"
                  onClick={() => onDelete(product.id)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', cursor: 'pointer', background: 'none', border: 'none', alignSelf: 'flex-start' }}
                >
                  Remove
                </button>
              </div>

              {/* Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {/* Price */}
                <div className="field">
                  <div className="field-label">Price / Unit</div>
                  <div className="relative">
                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{sym}</span>
                    <input
                      type="number"
                      value={product.pricePerUnit || ''}
                      onChange={(e) => onUpdate(product.id, { pricePerUnit: Number(e.target.value) })}
                      min={0}
                      step={0.01}
                      style={{ width: '100%', paddingLeft: 22 }}
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="field">
                  <div className="field-label">Quantity</div>
                  <input
                    type="number"
                    value={product.quantity || ''}
                    onChange={(e) => onUpdate(product.id, { quantity: Number(e.target.value) })}
                    min={0}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* COGS */}
                <div className="field">
                  <div className="field-label">COGS</div>
                  <div className="field-row">
                    <div className="relative" style={{ flex: 1 }}>
                      {product.cogsMode === 'dollar' && (
                        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{sym}</span>
                      )}
                      <input
                        type="number"
                        value={product.cogs || ''}
                        onChange={(e) => onUpdate(product.id, { cogs: Number(e.target.value) })}
                        min={0}
                        step={0.01}
                        style={{ width: '100%', paddingLeft: product.cogsMode === 'dollar' ? 22 : 10 }}
                      />
                    </div>
                    <ModeToggle mode={product.cogsMode} onChange={(m) => onUpdate(product.id, { cogsMode: m })} />
                  </div>
                </div>

                {/* Transportation */}
                <div className="field">
                  <div className="field-label">Transport</div>
                  <div className="field-row">
                    <div className="relative" style={{ flex: 1 }}>
                      {product.transportMode === 'dollar' && (
                        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{sym}</span>
                      )}
                      <input
                        type="number"
                        value={product.transportation || ''}
                        onChange={(e) => onUpdate(product.id, { transportation: Number(e.target.value) })}
                        min={0}
                        step={0.01}
                        style={{ width: '100%', paddingLeft: product.transportMode === 'dollar' ? 22 : 10 }}
                      />
                    </div>
                    <ModeToggle mode={product.transportMode} onChange={(m) => onUpdate(product.id, { transportMode: m })} />
                  </div>
                </div>
              </div>

              {/* Other Costs */}
              {product.otherCosts.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="field-label" style={{ marginBottom: 8 }}>Other Costs</div>
                  {product.otherCosts.map((cost) => (
                    <div key={cost.id} className="cost-row">
                      <input
                        type="text"
                        value={cost.name}
                        onChange={(e) => {
                          const updated = product.otherCosts.map((c) =>
                            c.id === cost.id ? { ...c, name: e.target.value } : c
                          );
                          onUpdate(product.id, { otherCosts: updated });
                        }}
                        placeholder="Cost name"
                        style={{ flex: 1, border: 'none', background: 'transparent', padding: 0, fontSize: '0.8125rem' }}
                      />
                      <input
                        type="number"
                        value={cost.value || ''}
                        onChange={(e) => {
                          const updated = product.otherCosts.map((c) =>
                            c.id === cost.id ? { ...c, value: Number(e.target.value) } : c
                          );
                          onUpdate(product.id, { otherCosts: updated });
                        }}
                        min={0}
                        style={{ width: 80, fontSize: '0.8125rem' }}
                      />
                      <button
                        className="btn--danger"
                        onClick={() => onRemoveCost(product.id, cost.id)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => onAddCost(product.id, { name: '', value: 0, mode: 'dollar' })}
                  style={{ fontSize: '0.5625rem' }}
                >
                  + Add cost
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div
            className="card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-faint)',
              fontSize: '0.8125rem',
            }}
          >
            No products yet. Add your first product to start mapping margins.
          </div>
        )}
      </div>
    </section>
  );
}
