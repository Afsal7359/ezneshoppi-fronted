'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '@/store';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  if (!user) return <div className="container-x py-20 text-center">Loading…</div>;

  const links = [
    { href: '/account/profile', label: 'Profile', icon: User },
    { href: '/account/orders', label: 'Orders', icon: Package },
    { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="container-x py-10 grid lg:grid-cols-[260px_1fr] gap-8">
      <aside className="card p-5 h-fit">
        <div className="flex items-center gap-3 pb-4 border-b border-ink-900/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold text-lg">
            {user.name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-ink-500 truncate">{user.email}</p>
          </div>
        </div>
        <nav className="mt-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${pathname?.startsWith(l.href) ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-ink-900/5'}`}
            >
              <l.icon size={16} /> {l.label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>

      <div>{children}</div>
    </div>
  );
}
