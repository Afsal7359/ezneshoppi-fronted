'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Percent,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Palette,
  FolderTree,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/store';
import { API } from '@/lib/api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteName, setSiteName] = useState('ezoneshoppi');

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!token) return router.push('/admin/login');
    if (user && user.role !== 'admin') router.push('/');
  }, [token, user, router, pathname, isLoginPage]);

  useEffect(() => {
    API.settings()
      .then(({ data }) => { if (data.settings?.siteName) setSiteName(data.settings.siteName); })
      .catch(() => {});
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  // Render login page without admin chrome
  if (isLoginPage) return <>{children}</>;

  if (!user || user.role !== 'admin') {
    return <div className="h-screen grid place-items-center">Checking access…</div>;
  }

  const nav = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/users', label: 'Customers', icon: Users },
    { href: '/admin/coupons', label: 'Coupons', icon: Percent },
    { href: '/admin/blog', label: 'Blog', icon: FileText },
    { href: '/admin/content', label: 'Content (Homepage)', icon: Palette },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center font-bold shrink-0">
            {siteName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold truncate">{siteName}</p>
            <p className="text-xs text-white/50">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map((l) => {
          const active = pathname === l.href || (l.href !== '/admin/dashboard' && pathname?.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${active ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <l.icon size={17} /> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5">
          <ExternalLink size={16} /> View Store
        </Link>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-ink-900/[0.03]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-ink-900 text-white h-14 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center font-bold text-sm shrink-0">
            {siteName[0]?.toUpperCase()}
          </div>
          <span className="font-bold truncate">{siteName}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ink-900 text-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center font-bold shrink-0">
                  {siteName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold truncate">{siteName}</p>
                  <p className="text-xs text-white/50">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {nav.map((l) => {
                const active = pathname === l.href || (l.href !== '/admin/dashboard' && pathname?.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${active ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    <l.icon size={17} /> {l.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/10 space-y-1">
              <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5">
                <ExternalLink size={16} /> View Store
              </Link>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col bg-ink-900 text-white min-h-screen sticky top-0 max-h-screen">
          <SidebarContent />
        </aside>

        {/* Main content — padded top on mobile to clear fixed top bar */}
        <main className="pt-14 lg:pt-0 p-4 lg:p-8 min-w-0 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
