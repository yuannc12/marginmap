import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import type { Product, Settings } from '../types';
import { CURRENCY_SYMBOLS } from '../types';
import { getMarginColor, getMarginLabel } from '../utils/calculations';

interface ProductTableProps {
  products: Product[];
  settings: Settings;
  onAdd: (product: Omit<Product, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  unitCost: 0,
  salePrice: 0,
  unitsPerMonth: 0,
  fixedCosts: 0,
};

export function ProductTable({ products, settings, onAdd, onUpdate, onDelete }: ProductTableProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Product>>({});

  const sym = CURRENCY_SYMBOLS[settings.currency] || settings.currency;

  const handleAdd = () => {
    if (!newProduct.name.trim()) return;
    onAdd(newProduct);
    setNewProduct(EMPTY_PRODUCT);
    setShowAdd(false);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditDraft(product);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editDraft);
      setEditingId(null);
      setEditDraft({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  return (
    <section className="px-8 py-8 section-border">
      <div className="flex items-center justify-between mb-6">
        <span className="label-mono">Products ({products.length})</span>
        <button className="btn btn--outline btn--sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} />
          Add Product
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card-static p-4 mb-4 motion-fade-up">
          <div className="grid grid-cols-5 gap-3 mb-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="label-mono" style={{ fontSize: '0.5625rem' }}>Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. SaaS Pro Plan"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label-mono" style={{ fontSize: '0.5625rem' }}>Unit Cost ({sym})</label>
              <input
                type="number"
                value={newProduct.unitCost || ''}
                onChange={(e) => setNewProduct({ ...newProduct, unitCost: Number(e.target.value) })}
                min={0}
                step={0.01}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label-mono" style={{ fontSize: '0.5625rem' }}>Sale Price ({sym})</label>
              <input
                type="number"
                value={newProduct.salePrice || ''}
                onChange={(e) => setNewProduct({ ...newProduct, salePrice: Number(e.target.value) })}
                min={0}
                step={0.01}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label-mono" style={{ fontSize: '0.5625rem' }}>Units/Month</label>
              <input
                type="number"
                value={newProduct.unitsPerMonth || ''}
                onChange={(e) => setNewProduct({ ...newProduct, unitsPerMonth: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <label className="label-mono" style={{ fontSize: '0.5625rem' }}>Fixed Costs/mo ({sym})</label>
              <input
                type="number"
                value={newProduct.fixedCosts || ''}
                onChange={(e) => setNewProduct({ ...newProduct, fixedCosts: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn--primary btn--sm" onClick={handleAdd}>Add</button>
            <button className="btn btn--outline btn--sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table header */}
      <div
        className="grid gap-3 py-2 px-3"
        style={{
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 60px',
          borderBottom: '1px solid var(--border-strong)',
        }}
      >
        <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Product</span>
        <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Unit Cost</span>
        <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Sale Price</span>
        <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Units/Mo</span>
        <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Fixed Costs</span>
        <span className="label-mono" style={{ fontSize: '0.5625rem' }}>Margin</span>
        <span />
      </div>

      {/* Product rows */}
      <div className="motion-stagger">
        {products.map((product) => {
          const isEditing = editingId === product.id;
          const margin = product.salePrice > 0
            ? ((product.salePrice - product.unitCost) / product.salePrice) * 100
            : 0;

          return (
            <div
              key={product.id}
              className="grid gap-3 py-3 px-3 table-row"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 60px',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background var(--duration-fast) var(--ease)',
              }}
            >
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editDraft.name ?? product.name}
                    onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                    style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                  />
                  <input
                    type="number"
                    value={editDraft.unitCost ?? product.unitCost}
                    onChange={(e) => setEditDraft({ ...editDraft, unitCost: Number(e.target.value) })}
                    style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                  />
                  <input
                    type="number"
                    value={editDraft.salePrice ?? product.salePrice}
                    onChange={(e) => setEditDraft({ ...editDraft, salePrice: Number(e.target.value) })}
                    style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                  />
                  <input
                    type="number"
                    value={editDraft.unitsPerMonth ?? product.unitsPerMonth}
                    onChange={(e) => setEditDraft({ ...editDraft, unitsPerMonth: Number(e.target.value) })}
                    style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                  />
                  <input
                    type="number"
                    value={editDraft.fixedCosts ?? product.fixedCosts}
                    onChange={(e) => setEditDraft({ ...editDraft, fixedCosts: Number(e.target.value) })}
                    style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                  />
                  <span />
                  <div className="flex items-center gap-1">
                    <button onClick={saveEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-green)' }}>
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                      <X size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {product.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {sym}{product.unitCost.toFixed(2)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {sym}{product.salePrice.toFixed(2)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {product.unitsPerMonth}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {sym}{product.fixedCosts.toFixed(0)}
                  </span>
                  <span
                    className="margin-chip"
                    style={{ color: getMarginColor(margin), background: `${getMarginColor(margin)}15` }}
                  >
                    {margin.toFixed(1)}% {getMarginLabel(margin)}
                  </span>
                  <div className="flex items-center gap-1 row-actions" style={{ opacity: 0, transition: 'opacity var(--duration-fast) var(--ease)' }}>
                    <button onClick={() => startEdit(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => onDelete(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center" style={{ color: 'var(--text-faint)' }}>
          <p style={{ fontSize: '0.875rem' }}>No products yet. Add your first product to start mapping margins.</p>
        </div>
      )}
    </section>
  );
}
