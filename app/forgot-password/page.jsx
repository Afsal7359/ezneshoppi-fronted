'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { API } from '@/lib/api';
import { useAuth } from '@/store';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'password' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await API.forgotPassword(email);
      toast.success('OTP sent to your email');
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No account found with this email');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { toast.error('Enter the 6-digit OTP'); return; }
    setStep('password');
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await API.resetPassword({ email, otp, password });
      setStep('done');
      if (data.token && data.user) {
        setAuth(data.user, data.token);
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Try again.');
      setStep('otp');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center py-10 px-4 bg-gradient-to-br from-peach-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 grid place-items-center text-white font-bold text-xl mx-auto mb-4 shadow-lift">e</div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reset Password</h1>
          <p className="text-gray-500 mt-1 text-sm">We'll send a code to verify it's you</p>
        </div>

        <div className="card p-6 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['Email', 'OTP', 'Password'].map((label, i) => {
              const stepIndex = { email: 0, otp: 1, password: 2, done: 3 }[step];
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-xs font-bold grid place-items-center transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-brand-600 text-white' : 'bg-ink-900/10 text-ink-400'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? 'text-ink-800 font-medium' : 'text-ink-400'}`}>{label}</span>
                  {i < 2 && <div className="w-6 h-px bg-ink-900/15" />}
                </div>
              );
            })}
          </div>

          {/* Step: Email */}
          {step === 'email' && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <div className="field-wrap">
                  <Mail size={16} className="icon-l" />
                  <input className="field-il" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? <><Loader2 size={16} className="animate-spin inline mr-2" />Sending OTP…</> : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-ink-600">OTP sent to</p>
                <p className="font-semibold text-ink-900">{email}</p>
              </div>
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input className="field text-center text-2xl tracking-[0.5em] font-bold" maxLength={6}
                  placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required autoFocus />
              </div>
              <button type="submit" disabled={otp.length < 6} className="btn-primary w-full disabled:opacity-60">
                Verify OTP
              </button>
              <div className="text-center space-y-1">
                {countdown > 0 ? (
                  <p className="text-xs text-ink-500">Resend OTP in {countdown}s</p>
                ) : (
                  <button type="button" onClick={sendOtp} disabled={loading}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-60">
                    {loading ? 'Sending…' : 'Resend OTP'}
                  </button>
                )}
                <button type="button" onClick={() => { setStep('email'); setOtp(''); }}
                  className="block mx-auto text-xs text-ink-500 hover:text-ink-700">
                  ← Change email
                </button>
              </div>
            </form>
          )}

          {/* Step: New Password */}
          {step === 'password' && (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <div className="field-wrap">
                  <Lock size={16} className="icon-l" />
                  <input className="field-ilr" type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters" value={password}
                    onChange={(e) => setPassword(e.target.value)} required autoFocus />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="icon-r hover:text-ink-700">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <div className="field-wrap">
                  <Lock size={16} className="icon-l" />
                  <input className="field-il" type={showPass ? 'text' : 'password'}
                    placeholder="Repeat your password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              <button type="submit" disabled={loading || password !== confirmPassword || password.length < 6}
                className="btn-primary w-full disabled:opacity-60">
                {loading ? <><Loader2 size={16} className="animate-spin inline mr-2" />Resetting…</> : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 size={56} className="mx-auto text-green-500" />
              <div>
                <h3 className="font-bold text-lg text-ink-900">Password Reset!</h3>
                <p className="text-sm text-ink-500 mt-1">Redirecting you to the homepage…</p>
              </div>
            </div>
          )}

          {step !== 'done' && (
            <div className="mt-5 text-center">
              <Link href="/login" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
