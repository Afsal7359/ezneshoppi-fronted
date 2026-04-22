'use client';
import { useEffect } from 'react';
import { useAuth } from '@/store';
import { API } from '@/lib/api';

export default function AuthBoot() {
  const { token, setUser, logout } = useAuth();
  useEffect(() => {
    if (!token) return;
    API.me()
      .then(({ data }) => setUser(data.user))
      .catch(() => logout());
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
