'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/store';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const isGoogle = !!user?.isGoogleUser;

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '', password: '' });
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (!isGoogle && form.password) payload.password = form.password;
      const { data } = await API.updateProfile(payload);
      setUser(data.user);
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <form onSubmit={save} className="card p-6 space-y-4 max-w-2xl">
        {/* Avatar */}
        {user?.avatar && (
          <div className="flex items-center gap-4 pb-2">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              {isGoogle && <p className="text-xs text-gray-400 mt-0.5">Signed in with Google</p>}
            </div>
          </div>
        )}

        <div>
          <label className="label">Name</label>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="field bg-ink-900/5" value={user?.email || ''} disabled />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 00000 00000" />
        </div>

        {!isGoogle && (
          <div>
            <label className="label">New Password (leave blank to keep)</label>
            <input type="password" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        )}

        <button disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
