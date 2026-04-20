'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
} from 'lucide-react';
import { useAuth, useCart, useWishlist } from '@/store';
import { API } from '@/lib/api';

export default function Header({ settings: initialSettings }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const cart = useCart();
  const wish = useWishlist();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setMounted(true);
    // Fetch fresh settings so logo/name changes in admin reflect immediately
    API.settings()
      .then(({ data }) => { if (data.settings) setSettings(data.settings); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const nav = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearching(true);
      router.push(`/shop?q=${encodeURIComponent(search.trim())}`);
      setTimeout(() => setSearching(false), 1500);
    }
  };

  const siteName = settings?.siteName || 'ezoneshoppi';
  const displayMode = settings?.logoDisplayMode || 'logo_name';
  const showLogo = (displayMode === 'logo_name' || displayMode === 'logo_only') && !!settings?.logo;
  const showName = displayMode === 'logo_name' || displayMode === 'name_only' || !settings?.logo;

  return (
    <>
      {settings?.announcement?.enabled && (
        <div className="bg-ink-900 text-white text-xs py-2 overflow-hidden">
          <div className="marquee gap-16 whitespace-nowrap">
            {Array(4).fill(settings.announcement.text).map((t, i) => (
              <span key={i} className="px-4">✦ {t}</span>
            ))}
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all ${
          scrolled ? 'bg-white/90 backdrop-blur-lg shadow-soft' : 'bg-white'
        }`}
      >
        <div className="container-x flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {showLogo ? (
              <div className="w-9 h-9 relative rounded-xl overflow-hidden">
                <Image src={settings.logo} alt={siteName} fill className="object-contain" sizes="36px" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 grid place-items-center text-white font-bold shadow-lift shrink-0">
                {siteName[0]?.toUpperCase()}
              </div>
            )}
            {showName && (
              <span className="text-lg sm:text-xl font-bold tracking-tight">{siteName}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                  pathname === n.href
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-700 hover:bg-ink-900/5'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xs">
            <div className="field-wrap">
              {searching ? (
                <span className="icon-l w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              ) : (
                <Search size={16} className="icon-l" />
              )}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="field-il rounded-full bg-slate-50 focus:bg-white"
              />
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <Link
              href="/account/wishlist"
              className="relative p-2.5 rounded-full hover:bg-ink-900/5 transition"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {mounted && wish.ids.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
                  {wish.ids.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2.5 rounded-full hover:bg-ink-900/5 transition"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {mounted && cart.count() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold grid place-items-center">
                  {cart.count()}
                </span>
              )}
            </Link>

            {!mounted ? (
              <Link href="/login" className="hidden md:inline-flex btn-ghost text-sm">
                <User size={18} /> Sign In
              </Link>
            ) : user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-ink-900/5 transition text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} />
                </button>
                {userOpen && (
                  <div
                    onMouseLeave={() => setUserOpen(false)}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lift border border-ink-900/5 p-2 animate-fadeUp"
                  >
                    <Link href="/account/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ink-900/5 text-sm">
                      <User size={16} /> My Profile
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ink-900/5 text-sm">
                      <Package size={16} /> My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ink-900/5 text-sm">
                        <LayoutDashboard size={16} /> Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); router.push('/'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-sm"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden md:inline-flex btn-ghost text-sm">
                <User size={18} /> Sign In
              </Link>
            )}

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2.5 rounded-full hover:bg-ink-900/5"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-lift p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {showLogo ? (
                  <div className="w-8 h-8 relative rounded-lg overflow-hidden">
                    <Image src={settings.logo} alt={siteName} fill className="object-contain" sizes="32px" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 grid place-items-center text-white font-bold text-sm">
                    {siteName[0]?.toUpperCase()}
                  </div>
                )}
                {showName && <span className="text-xl font-bold">{siteName}</span>}
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-ink-900/5">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={onSearch} className="mb-4">
              <div className="field-wrap">
                {searching ? (
                  <span className="icon-l w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                ) : (
                  <Search size={16} className="icon-l" />
                )}
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="field-il rounded-full"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-4 py-3 rounded-xl hover:bg-ink-900/5 font-medium"
                >
                  {n.label}
                </Link>
              ))}
              <div className="h-px bg-ink-900/10 my-3" />
              {mounted && user ? (
                <>
                  <Link href="/account/profile" className="px-4 py-3 rounded-xl hover:bg-ink-900/5">My Profile</Link>
                  <Link href="/account/orders" className="px-4 py-3 rounded-xl hover:bg-ink-900/5">My Orders</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" className="px-4 py-3 rounded-xl hover:bg-ink-900/5">Admin Dashboard</Link>
                  )}
                  <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 text-left w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-primary text-center">Sign In</Link>
                  <Link href="/register" className="btn-outline mt-2 text-center">Create Account</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
