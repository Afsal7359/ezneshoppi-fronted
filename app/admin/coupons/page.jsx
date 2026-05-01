'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';
import Pagination from '@/components/admin/Pagination';

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const blank = { code: '', description: '', type: 'percent', value: 10, minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, perUserLimit: 1, expiresAt: '', isActive: true };

  const load = () => {
    setLoading(true);
    API.coupons({ page, limit: 25 })
      .then(({ data }) => {
        setItems(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const save = async () => {
    try {
      const payload = { ...editing };
      if (payload.expiresAt === '') delete payload.expiresAt;
      if (editing._id) await API.updateCoupon(editing._id, payload);
      else await API.createCoupon(payload);
      toast.success('Saved');
      setEditing(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await API.deleteCoupon(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-sm text-ink-500 mt-0.5">{loading ? '…' : `${total} coupon${total !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={16} /> Add Coupon</button>
      </div>

      {editing && (
        <div className="card p-5 mb-6 grid sm:grid-cols-2 gap-3">
          <div><label className="label">Code</label><input className="field uppercase" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></div>
          <div><label className="label">Type</label>
            <select className="field" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div><label className="label">Value ({editing.type === 'percent' ? '%' : '₹'})</label><input type="number" className="field" value={editing.value} onChange={(e) => setEditing({ ...editing, value: +e.target.value })} /></div>
          <div><label className="label">Min Order ₹</label><input type="number" className="field" value={editing.minOrderAmount} onChange={(e) => setEditing({ ...editing, minOrderAmount: +e.target.value })} /></div>
          <div><label className="label">Max Discount ₹ (0 = none)</label><input type="number" className="field" value={editing.maxDiscount} onChange={(e) => setEditing({ ...editing, maxDiscount: +e.target.value })} /></div>
          <div><label className="label">Usage Limit (0 = ∞)</label><input type="number" className="field" value={editing.usageLimit} onChange={(e) => setEditing({ ...editing, usageLimit: +e.target.value })} /></div>
          <div><label className="label">Expires At</label><input type="date" className="field" value={editing.expiresAt ? editing.expiresAt.slice(0, 10) : ''} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })} /></div>
          <label className="flex items-center gap-2 mt-6 cursor-pointer"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> <span className="text-sm font-medium">Active</span></label>
          <div className="sm:col-span-2"><label className="label">Description</label><input className="field" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div className="sm:col-span-2 flex gap-2">
            <button onClick={save} className="btn-primary"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="p-3 pl-4">Code</th>
                <th className="p-3">Value</th>
                <th className="p-3">Used</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-ink-500">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-ink-500">No coupons yet.</td></tr>
              ) : items.map((c) => (
                <tr key={c._id} className="border-t border-ink-900/5 hover:bg-ink-900/[0.02]">
                  <td className="p-3 pl-4 font-mono font-bold">{c.code}</td>
                  <td className="p-3">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="p-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td className="p-3 text-ink-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                  <td className="p-3"><span className={`chip ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-ink-100 text-ink-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-3 pr-4 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(c)} className="p-2 rounded-lg hover:bg-brand-50 text-brand-600"><Edit2 size={14} /></button>
                      <button onClick={() => del(c._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
