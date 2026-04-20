'use client';
import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { API } from '@/lib/api';
import { relativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');

  const load = () => API.users({ q }).then(({ data }) => setUsers(data.items || []));
  useEffect(() => { load(); }, [q]);

  const toggle = async (u, field) => {
    const val = field === 'role' ? (u.role === 'admin' ? 'customer' : 'admin') : !u.isActive;
    await API.updateUser(u._id, { [field]: val });
    toast.success('Updated');
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this user?')) return;
    await API.deleteUser(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      <div className="card p-4 mb-4 relative">
        <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-ink-400" />
        <input className="field pl-10" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
            <tr><th className="p-3">User</th><th className="p-3">Joined</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-ink-900/5">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold text-sm">
                      {u.name?.[0]}
                    </div>
                    <div><p className="font-medium">{u.name}</p><p className="text-xs text-ink-400">{u.email}</p></div>
                  </div>
                </td>
                <td className="p-3 text-ink-500">{relativeTime(u.createdAt)}</td>
                <td className="p-3">
                  <button onClick={() => toggle(u, 'role')} className={`chip ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-ink-100'}`}>{u.role}</button>
                </td>
                <td className="p-3">
                  <button onClick={() => toggle(u, 'isActive')} className={`chip ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => del(u._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
