'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/store';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await API.login({ email: form.email.trim(), password: form.password });
      if (data.user.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }
      setAuth(data.user, data.token);
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}!`);
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl">
            e
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-white/40 text-sm mt-1">ezoneshoppi control panel</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold text-sm transition-all disabled:opacity-60 mt-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              : <><ShieldCheck size={16} /> Sign in to Admin</>
            }
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-6">
          Restricted to authorised administrators only
        </p>
      </div>
    </div>
  );
}
