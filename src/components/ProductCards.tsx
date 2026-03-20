import type { Product, CostEntry } from '../types';
import { SYM } from '../types';

interface ProductCardsProps {
  products: Product[];
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
  sellThrough: 100,
  cogs: 0,
  transportation: 0,
  otherCosts: [],
};

export function ProductCards({ products, onAdd, onUpdate, onDelete, onAddCost, onRemoveCost }: ProductCardsProps) {
  const sym = SYM;

  return (
    <section className="section">
      <div className="page-shell">
        <div className="flex items-baseline justify-between section-header-responsive" style={{ marginBottom: 32 }}>
          <div>
            <div className="section-label">02</div>
            <div className="section-title">Products</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, maxWidth: 460 }}>
              Add your products with pricing, quantities, and per-unit costs.
              Sell-through is the % of stock you expect to actually sell.
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
              <div className="product-fields">
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

                {/* Stock Qty */}
                <div className="field">
                  <div className="field-label">Stock Qty</div>
                  <input
                    type="number"
                    value={product.quantity || ''}
                    onChange={(e) => onUpdate(product.id, { quantity: Number(e.target.value) })}
                    min={0}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Sell-Through */}
                <div className="field">
                  <div className="field-label">Sell-Through</div>
                  <div className="relative">
                    <input
                      type="number"
                      value={product.sellThrough ?? 100}
                      onChange={(e) => onUpdate(product.id, { sellThrough: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      min={0}
                      max={100}
                      style={{ width: '100%', paddingRight: 24 }}
                    />
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>%</span>
                  </div>
                </div>

                {/* COGS */}
                <div className="field">
                  <div className="field-label">COGS / Unit</div>
                  <div className="relative">
                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{sym}</span>
                    <input
                      type="number"
                      value={product.cogs || ''}
                      onChange={(e) => onUpdate(product.id, { cogs: Number(e.target.value) })}
                      min={0}
                      step={0.01}
                      style={{ width: '100%', paddingLeft: 22 }}
                    />
                  </div>
                </div>

                {/* Transportation */}
                <div className="field">
                  <div className="field-label">Transport / Unit</div>
                  <div className="relative">
                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{sym}</span>
                    <input
                      type="number"
                      value={product.transportation || ''}
                      onChange={(e) => onUpdate(product.id, { transportation: Number(e.target.value) })}
                      min={0}
                      step={0.01}
                      style={{ width: '100%', paddingLeft: 22 }}
                    />
                  </div>
                </div>
              </div>

              {/* Other Costs */}
              {product.otherCosts.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="field-label" style={{ marginBottom: 8 }}>Other Costs <span style={{ fontWeight: 400, color: 'var(--text-faint)' }}>({sym} per unit)</span></div>
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
                      <div className="relative">
                        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.75rem' }}>{sym}</span>
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
                          step={0.01}
                          style={{ width: 90, fontSize: '0.8125rem', paddingLeft: 22 }}
                        />
                      </div>
                      <button
                        className="btn--danger"
                        onClick={() => onRemoveCost(product.id, cost.id)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => onAddCost(product.id, { name: '', value: 0 })}
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
