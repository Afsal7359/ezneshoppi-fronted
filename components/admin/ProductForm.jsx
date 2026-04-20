'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { API } from '@/lib/api';
import ImageUploader from './ImageUploader';
import toast from 'react-hot-toast';

const blank = {
  name: '', description: '', shortDescription: '', brand: '', sku: '',
  category: '', images: [], price: 0, comparePrice: 0, cost: 0,
  stock: 0, lowStockThreshold: 5, trackInventory: true,
  returnDays: 30,
  tags: [], specifications: [],
  isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
  seoTitle: '', seoDescription: '',
};

export default function ProductForm({ initialData, productId }) {
  const router = useRouter();
  const [form, setForm] = useState(initialData || blank);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    API.categories().then(({ data }) => setCats(data.items || []));
  }, []);

  const set = (patch) => setForm({ ...form, ...patch });

  const addSpec = () => set({ specifications: [...(form.specifications || []), { key: '', value: '' }] });
  const updSpec = (i, k, v) => {
    const next = [...form.specifications];
    next[i] = { ...next[i], [k]: v };
    set({ specifications: next });
  };
  const delSpec = (i) => set({ specifications: form.specifications.filter((_, x) => x !== i) });

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set({ tags: [...form.tags, tagInput.trim()] });
    }
    setTagInput('');
  };

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

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold mb-4">Basic Info</h3>
            <div className="space-y-3">
              <div><label className="label">Name *</label><input required className="field" value={form.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div><label className="label">Brand</label><input className="field" value={form.brand} onChange={(e) => set({ brand: e.target.value })} /></div>
              <div><label className="label">Short Description</label><input className="field" value={form.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} /></div>
              <div><label className="label">Description</label><textarea rows={6} className="field" value={form.description} onChange={(e) => set({ description: e.target.value })} /></div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4">Images</h3>
            <ImageUploader images={form.images || []} onChange={(imgs) => set({ images: imgs })} />
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4">Specifications</h3>
            <div className="space-y-2">
              {(form.specifications || []).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Key" className="field" value={s.key} onChange={(e) => updSpec(i, 'key', e.target.value)} />
                  <input placeholder="Value" className="field" value={s.value} onChange={(e) => updSpec(i, 'value', e.target.value)} />
                  <button type="button" onClick={() => delSpec(i)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={addSpec} className="btn-outline text-sm"><Plus size={14} /> Add spec</button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4">SEO</h3>
            <div className="space-y-3">
              <div><label className="label">Meta Title</label><input className="field" value={form.seoTitle || ''} onChange={(e) => set({ seoTitle: e.target.value })} /></div>
              <div><label className="label">Meta Description</label><textarea rows={2} className="field" value={form.seoDescription || ''} onChange={(e) => set({ seoDescription: e.target.value })} /></div>
            </div>
          </div>
        </div>

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
                <p className="text-xs text-slate-400 mt-1">Set 0 to hide the return policy badge on product page.</p>
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
              <input className="field" placeholder="Add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              <button type="button" onClick={addTag} className="btn-outline"><Plus size={14} /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(form.tags || []).map((t) => (
                <button key={t} type="button" onClick={() => set({ tags: form.tags.filter((x) => x !== t) })} className="chip bg-brand-50 text-brand-700">
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
