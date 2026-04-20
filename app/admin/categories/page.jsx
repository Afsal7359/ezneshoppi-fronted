'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const blank = { name: '', description: '', icon: 'Package', sortOrder: 0, isActive: true };

  const load = () => API.categories({ active: false }).then(({ data }) => setItems(data.items || []));

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing._id) await API.updateCategory(editing._id, editing);
      else await API.createCategory(editing);
      toast.success('Saved');
      setEditing(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this category?')) return;
    await API.deleteCategory(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={16} /> Add Category</button>
      </div>

      {editing && (
        <div className="card p-5 mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Name</label><input className="field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label className="label">Icon (Lucide name)</label><input className="field" placeholder="Package" value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><input className="field" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div><label className="label">Sort Order</label><input type="number" className="field" value={editing.sortOrder || 0} onChange={(e) => setEditing({ ...editing, sortOrder: +e.target.value })} /></div>
            <label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active</label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="btn-primary"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
            <tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Products</th><th className="p-3">Order</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t border-ink-900/5">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-ink-500">{c.slug}</td>
                <td className="p-3">{c.productCount}</td>
                <td className="p-3">{c.sortOrder}</td>
                <td className="p-3"><span className={`chip ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-ink-100'}`}>{c.isActive ? 'Active' : 'Hidden'}</span></td>
                <td className="p-3 text-right">
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
  );
}
