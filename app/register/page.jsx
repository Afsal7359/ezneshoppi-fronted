'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { API } from '@/lib/api';
import { useAuth } from '@/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      const { data } = await API.register(form);
      setAuth(data.user, data.token);
      toast.success('Account created!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center py-10 px-4 bg-gradient-to-br from-peach-50 to-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 grid place-items-center text-white font-bold text-xl mx-auto mb-4 shadow-lift">
            e
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">Create account</h1>
          <p className="text-ink-500 mt-1 text-sm">Join ezoneshoppi today</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="field-wrap">
                <User size={16} className="icon-l" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field-il"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="field-wrap">
                <Mail size={16} className="icon-l" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="field-il"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="field-wrap">
                <Phone size={16} className="icon-l" />
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="field-il"
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="field-wrap">
                <Lock size={16} className="icon-l" />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="field-ilr"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="icon-r hover:text-ink-700 transition-colors"
                  tabIndex={-1}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
