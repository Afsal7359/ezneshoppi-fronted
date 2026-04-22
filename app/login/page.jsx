'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/store';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

function useGoogleScript() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.google?.accounts) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function GoogleButton({ onSuccess }) {
  const googleReady = useGoogleScript();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (!googleReady || !window.google?.accounts) {
      toast.error('Google is loading, try again in a moment');
      return;
    }
    setLoading(true);
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: async (resp) => {
        if (resp.error) { toast.error('Google sign-in cancelled'); setLoading(false); return; }
        try {
          const { data } = await API.googleAuth(resp.access_token);
          onSuccess(data);
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Google sign-in failed');
          setLoading(false);
        }
      },
    });
    client.requestAccessToken();
  }, [googleReady, onSuccess]);

  return (
    <button type="button" onClick={handleClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all font-medium text-sm text-gray-700 shadow-sm disabled:opacity-60">
      {loading ? <Loader2 size={18} className="animate-spin" /> : (
        <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      )}
      {loading ? 'Signing in…' : 'Continue with Google'}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [redirect, setRedirect] = useState('/');
  useEffect(() => {
    setRedirect(new URLSearchParams(window.location.search).get('redirect') || '/');
  }, []);

  const onAuthSuccess = (data) => {
    setAuth(data.user, data.token);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    router.push(data.user.role === 'admin' ? '/admin/dashboard' : redirect);
  };

  return (
    <div className="min-h-screen grid place-items-center py-10 px-4 bg-gradient-to-br from-peach-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 grid place-items-center text-white font-bold text-xl mx-auto mb-4 shadow-lift">e</div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="card p-6 sm:p-8">
          <GoogleButton onSuccess={onAuthSuccess} />
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
