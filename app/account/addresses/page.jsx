'use client';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { API } from '@/lib/api';
import { useAuth } from '@/store';
import toast from 'react-hot-toast';

export default function AddressesPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(null);

  const blank = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = form._id
        ? await API.updateAddress(form._id, form)
        : await API.addAddress(form);
      setUser({ ...user, addresses: res.data.addresses });
      setForm(null);
      toast.success('Saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this address?')) return;
    const res = await API.deleteAddress(id);
    setUser({ ...user, addresses: res.data.addresses });
    toast.success('Deleted');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Addresses</h1>
        <button onClick={() => setForm(blank)} className="btn-primary">
          <Plus size={16} /> Add
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="card p-6 mb-6 grid sm:grid-cols-2 gap-3">
          {['fullName', 'phone', 'postalCode', 'city', 'state', 'country'].map((k) => (
            <div key={k}>
              <label className="label capitalize">{k.replace(/([A-Z])/g, ' $1')}</label>
              <input required className="field" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <div className="sm:col-span-2"><label className="label">Line 1</label><input required className="field" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Line 2</label><input className="field" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} /></div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary">Save</button>
            <button type="button" onClick={() => setForm(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {user?.addresses?.length === 0 ? (
        <p className="text-ink-500">No addresses yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {user?.addresses?.map((a) => (
            <div key={a._id} className="card p-5 relative">
              {a.isDefault && <span className="chip bg-brand-50 text-brand-700 absolute top-4 right-4"><Star size={10} /> Default</span>}
              <p className="font-semibold">{a.fullName}</p>
              <p className="text-sm text-ink-500 mt-1">
                {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                {a.city}, {a.state} {a.postalCode}<br />
                {a.country} · {a.phone}
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setForm(a)} className="btn-outline text-xs px-3 py-1.5"><Edit2 size={12} /> Edit</button>
                <button onClick={() => del(a._id)} className="btn-outline text-xs px-3 py-1.5 text-red-600"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
