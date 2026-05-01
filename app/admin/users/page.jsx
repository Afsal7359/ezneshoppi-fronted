'use client';
import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { API } from '@/lib/api';
import { relativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Pagination from '@/components/admin/Pagination';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.users({ q, page, limit: 25 })
      .then(({ data }) => {
        setUsers(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [q, page]);

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-sm text-ink-500 mt-0.5">{loading ? '…' : `${total} customer${total !== 1 ? 's' : ''}`}</p>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="field-wrap">
          <Search size={16} className="icon-l" />
          <input className="field-il" placeholder="Search by name or email" value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-ink-500">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-ink-500">No users found.</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-t border-ink-900/5 hover:bg-ink-900/[0.02]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold text-sm shrink-0">
                        {u.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-ink-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-ink-500">{relativeTime(u.createdAt)}</td>
                  <td className="p-3">
                    <button onClick={() => toggle(u, 'role')}
                      className={`chip cursor-pointer ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-ink-100 text-ink-600'}`}>
                      {u.role}
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggle(u, 'isActive')}
                      className={`chip cursor-pointer ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
