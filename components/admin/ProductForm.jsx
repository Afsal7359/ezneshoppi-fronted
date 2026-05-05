'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, X, Palette, Ruler } from 'lucide-react';
import { API } from '@/lib/api';
import ImageUploader from './ImageUploader';
import toast from 'react-hot-toast';

const blank = {
  name: '', description: '', shortDescription: '', brand: '', sku: '',
  category: '', images: [], price: 0, comparePrice: 0, cost: 0,
  stock: 0, lowStockThreshold: 5, trackInventory: true,
  returnDays: 30,
  tags: [], specifications: [], variants: [],
  isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
  seoTitle: '', seoDescription: '',
};

/* ── Inline option adder for each variant group ─── */
function OptionAdder({ onAdd, isColor }) {
  const [val, setVal] = useState('');
  const [color, setColor] = useState('#000000');

  const commit = () => {
    const trimmed = val.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setVal('');
  };

  return (
    <div className="flex gap-2 mt-2">
      {isColor && (
        <input
          type="color"
          value={color}
          onChange={(e) => { setColor(e.target.value); setVal(e.target.value); }}
          className="h-9 w-10 rounded-lg border border-slate-200 cursor-pointer shrink-0 p-0.5"
          title="Pick a color (optional)"
        />
      )}
      <input
        className="field text-sm"
        placeholder={isColor ? 'Color name or hex (e.g. Red, #FF5733)' : 'Option value (press Enter)'}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
      />
      <button type="button" onClick={commit} className="btn-outline text-sm shrink-0">
        <Plus size={14} /> Add
      </button>
    </div>
  );
}

export default function ProductForm({ initialData, productId }) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    ...blank,
    ...(initialData || {}),
    variants: initialData?.variants || [],
  }));
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    API.categories().then(({ data }) => setCats(data.items || []));
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  /* ── Specifications ── */
  const addSpec = () => set({ specifications: [...(form.specifications || []), { key: '', value: '' }] });
  const updSpec = (i, k, v) => {
    const next = [...form.specifications];
    next[i] = { ...next[i], [k]: v };
    set({ specifications: next });
  };
  const delSpec = (i) => set({ specifications: form.specifications.filter((_, x) => x !== i) });

  /* ── Tags ── */
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set({ tags: [...form.tags, tagInput.trim()] });
    }
    setTagInput('');
  };

  /* ── Variants ── */
  const addVariantGroup = (name = '', options = []) => {
    set({ variants: [...(form.variants || []), { name, options }] });
  };

  const updateVariantName = (vi, name) => {
    const next = [...form.variants];
    next[vi] = { ...next[vi], name };
    set({ variants: next });
  };

  const addOption = (vi, opt) => {
    const next = [...form.variants];
    const already = next[vi].options.map((o) => o.toLowerCase());
    if (!opt || already.includes(opt.toLowerCase())) return;
    next[vi] = { ...next[vi], options: [...next[vi].options, opt] };
    set({ variants: next });
  };

  const removeOption = (vi, oi) => {
    const next = [...form.variants];
    next[vi] = { ...next[vi], options: next[vi].options.filter((_, i) => i !== oi) };
    set({ variants: next });
  };

  const removeVariantGroup = (vi) => {
    set({ variants: form.variants.filter((_, i) => i !== vi) });
  };

  /* ── Submit ── */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, category: form.category?._id || form.category };
      if (productId) {
        await API.updateProduct(productId, payload);
        toast.success('Product updated');
      } else {
        await API.createProduct(payload);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const isColorGroup = (name) => name.toLowerCase() === 'color' || name.toLowerCase() === 'colour';

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">

          {/* Basic info */}
          <div className="card p-5">
            <h3 className="font-bold mb-4">Basic Info</h3>
            <div className="space-y-3">
              <div><label className="label">Name *</label><input required className="field" value={form.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div><label className="label">Brand</label><input className="field" value={form.brand} onChange={(e) => set({ brand: e.target.value })} /></div>
              <div><label className="label">Short Description</label><input className="field" value={form.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} /></div>
              <div><label className="label">Description</label><textarea rows={6} className="field" value={form.description} onChange={(e) => set({ description: e.target.value })} /></div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-5">
            <h3 className="font-bold mb-4">Images</h3>
            <ImageUploader images={form.images || []} onChange={(imgs) => set({ images: imgs })} />
          </div>

          {/* Variants */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold">Variants</h3>
            </div>
            <p className="text-xs text-ink-500 mb-4">Add size, color, or any other option customers can choose from.</p>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button type="button"
                onClick={() => addVariantGroup('Size', [])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-brand-400 text-brand-600 hover:bg-brand-50 transition">
                <Ruler size={13} /> + Add Size
              </button>
              <button type="button"
                onClick={() => addVariantGroup('Color', [])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-purple-400 text-purple-600 hover:bg-purple-50 transition">
                <Palette size={13} /> + Add Color
              </button>
              <button type="button"
                onClick={() => addVariantGroup('', [])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-ink-300 text-ink-500 hover:bg-ink-50 transition">
                <Plus size={13} /> Custom Variant
              </button>
            </div>

            {(form.variants || []).length === 0 ? (
              <div className="text-center py-6 border border-dashed border-ink-200 rounded-xl text-ink-400 text-sm">
                No variants added. Use the buttons above to add Size, Color, or a custom option.
              </div>
            ) : (
              <div className="space-y-4">
                {form.variants.map((v, vi) => {
                  const isColor = isColorGroup(v.name);
                  return (
                    <div key={vi} className="border border-ink-900/10 rounded-xl p-4 bg-ink-900/[0.01]">
                      {/* Group header */}
                      <div className="flex gap-2 items-center mb-3">
                        <div className="flex-1">
                          <input
                            className="field text-sm font-medium"
                            placeholder="Variant name (e.g. Size, Color, Material)"
                            value={v.name}
                            onChange={(e) => updateVariantName(vi, e.target.value)}
                          />
                        </div>
                        <button type="button" onClick={() => removeVariantGroup(vi)}
                          className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-red-500 hover:bg-red-50 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Options chips */}
                      {v.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {v.options.map((opt, oi) => (
                            <span key={oi}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-ink-900/15 text-ink-700">
                              {isColor && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: opt }}
                                />
                              )}
                              {opt}
                              <button type="button" onClick={() => removeOption(vi, oi)}
                                className="text-ink-400 hover:text-red-500 leading-none ml-0.5 transition">
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add option input */}
                      <OptionAdder onAdd={(opt) => addOption(vi, opt)} isColor={isColor} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="card p-5">
            <h3 className="font-bold mb-4">Specifications</h3>
            <div className="space-y-2">
              {(form.specifications || []).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Key" className="field" value={s.key} onChange={(e) => updSpec(i, 'key', e.target.value)} />
                  <input placeholder="Value" className="field" value={s.value} onChange={(e) => updSpec(i, 'value', e.target.value)} />
                  <button type="button" onClick={() => delSpec(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={addSpec} className="btn-outline text-sm"><Plus size={14} /> Add spec</button>
            </div>
          </div>

          {/* SEO */}
          <div className="card p-5">
            <h3 className="font-bold mb-4">SEO</h3>
            <div className="space-y-3">
              <div><label className="label">Meta Title</label><input className="field" value={form.seoTitle || ''} onChange={(e) => set({ seoTitle: e.target.value })} /></div>
              <div><label className="label">Meta Description</label><textarea rows={2} className="field" value={form.seoDescription || ''} onChange={(e) => set({ seoDescription: e.target.value })} /></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold mb-4">Pricing & Stock</h3>
            <div className="space-y-3">
              <div><label className="label">Price ₹ *</label><input type="number" required className="field" value={form.price} onChange={(e) => set({ price: +e.target.value })} /></div>
              <div><label className="label">Compare Price ₹</label><input type="number" className="field" value={form.comparePrice} onChange={(e) => set({ comparePrice: +e.target.value })} /></div>
              <div><label className="label">Cost ₹</label><input type="number" className="field" value={form.cost} onChange={(e) => set({ cost: +e.target.value })} /></div>
              <div><label className="label">Stock</label><input type="number" className="field" value={form.stock} onChange={(e) => set({ stock: +e.target.value })} /></div>
              <div><label className="label">Low-stock threshold</label><input type="number" className="field" value={form.lowStockThreshold} onChange={(e) => set({ lowStockThreshold: +e.target.value })} /></div>
              <div><label className="label">SKU</label><input className="field" value={form.sku || ''} onChange={(e) => set({ sku: e.target.value })} /></div>
              <div>
                <label className="label">Return Policy (days)</label>
                <div className="field-wrap">
                  <input type="number" min={0} className="field pr-14" value={form.returnDays ?? 30} onChange={(e) => set({ returnDays: +e.target.value })} />
                  <span className="icon-r text-xs text-slate-400 pointer-events-none">days</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Set 0 to hide the return policy badge.</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4">Category</h3>
            <select required className="field" value={form.category?._id || form.category || ''} onChange={(e) => set({ category: e.target.value })}>
              <option value="">Select…</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4">Tags</h3>
            <div className="flex gap-2 mb-2">
              <input className="field" placeholder="Add tag" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <button type="button" onClick={addTag} className="btn-outline"><Plus size={14} /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(form.tags || []).map((t) => (
                <button key={t} type="button" onClick={() => set({ tags: form.tags.filter((x) => x !== t) })}
                  className="chip bg-brand-50 text-brand-700 hover:bg-brand-100 transition">
                  {t} ×
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="font-bold">Visibility</h3>
            {[
              { k: 'isActive', l: 'Active (visible on store)' },
              { k: 'isFeatured', l: 'Featured' },
              { k: 'isNewArrival', l: 'New Arrival' },
              { k: 'isBestSeller', l: 'Best Seller' },
              { k: 'trackInventory', l: 'Track inventory' },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={(e) => set({ [k]: e.target.checked })} className="rounded" />
                {l}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 card p-4 flex justify-between items-center">
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
        <button disabled={loading} className="btn-primary disabled:opacity-60">
          <Save size={16} /> {loading ? 'Saving…' : (productId ? 'Update' : 'Create')} Product
        </button>
      </div>
    </form>
  );
}
