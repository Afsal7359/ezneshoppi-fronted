'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Heart, ShoppingCart, User,
  Menu, X, ChevronDown, LogOut,
  LayoutDashboard, Package, AlignLeft,
  Facebook, Instagram, Twitter, Youtube,
} from 'lucide-react';
import { useAuth, useCart, useWishlist } from '@/store';
import { API } from '@/lib/api';
import CategorySidebar from './CategorySidebar';

export default function Header({ settings: initialSettings }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuth();
  const cart      = useCart();
  const wish      = useWishlist();

  const [open,       setOpen]      = useState(false);   // right nav drawer
  const [catOpen,    setCatOpen]   = useState(false);   // left category drawer
  const [categories, setCategories]= useState([]);
  const [search,     setSearch]    = useState('');
  const [searching,  setSearching] = useState(false);
  const [userOpen,   setUserOpen]  = useState(false);
  const [scrolled,   setScrolled]  = useState(false);
  const [mounted,    setMounted]   = useState(false);
  const [settings,   setSettings]  = useState(initialSettings);

  useEffect(() => {
    setMounted(true);
    API.settings().then(({ data }) => { if (data.settings) setSettings(data.settings); }).catch(() => {});
    API.categories().then(({ data }) => setCategories(data.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setCatOpen(false); }, [pathname]);

  const nav = [
    { label: 'Home',    href: '/'        },
    { label: 'Shop',    href: '/shop'    },
    { label: 'About',   href: '/about'   },
    { label: 'Blog',    href: '/blog'    },
    { label: 'Contact', href: '/contact' },
  ];

  const onSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    router.push(`/shop?q=${encodeURIComponent(search.trim())}`);
    setTimeout(() => setSearching(false), 1500);
  };

  const siteName    = settings?.siteName || 'ezoneshoppi';
  const displayMode = settings?.logoDisplayMode || 'logo_name';
  const showLogo    = (displayMode === 'logo_name' || displayMode === 'logo_only') && !!settings?.logo;
  const showName    = displayMode === 'logo_name' || displayMode === 'name_only' || !settings?.logo;
  const social      = settings?.social || {};

  const socialLinks = [
    { key: 'facebook',  Icon: Facebook,  href: social.facebook  },
    { key: 'instagram', Icon: Instagram, href: social.instagram },
    { key: 'twitter',   Icon: Twitter,   href: social.twitter   },
    { key: 'youtube',   Icon: Youtube,   href: social.youtube   },
  ].filter((s) => s.href);

  return (
    <>
      {/* ── Announcement bar — scrolling marquee ── */}
      {settings?.announcement?.enabled && (
        <div
          className="overflow-hidden py-2.5 text-white text-xs font-medium select-none"
          style={{ backgroundColor: settings.announcement.bgColor || '#000000' }}
        >
          <div className="flex whitespace-nowrap w-max animate-marquee hover:[animation-play-state:paused]">
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="px-14">
                ✦&nbsp; {settings.announcement.text} &nbsp;✦
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Main header ── */}
      <header className={`sticky top-0 z-40 transition-all duration-200 border-b ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-gray-100' : 'bg-white border-transparent'
      }`}>
        <div className="container-x flex items-center h-16 sm:h-20 gap-3 sm:gap-4">

          {/* Left: category hamburger + logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCatOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition"
              aria-label="Categories"
            >
              <AlignLeft size={22} />
            </button>

            <Link href="/" className="flex items-center gap-2">
              {showLogo ? (
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={settings.logo} alt={siteName} fill className="object-contain" sizes="64px" />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 grid place-items-center text-white font-bold text-xl shadow-sm shrink-0">
                  {siteName[0]?.toUpperCase()}
                </div>
              )}
              {showName && (
                <span className="hidden sm:block text-lg sm:text-xl font-bold tracking-tight">{siteName}</span>
              )}
            </Link>
          </div>

          {/* Desktop nav — center */}
          <nav className="hidden lg:flex items-center gap-0.5 mx-auto">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                  pathname === n.href ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Search — desktop */}
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xs lg:max-w-sm ml-auto lg:ml-0">
            <div className="field-wrap">
              {searching
                ? <span className="icon-l w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                : <Search size={16} className="icon-l text-gray-400" />
              }
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="field-il rounded-full bg-gray-50 focus:bg-white text-sm" />
            </div>
          </form>

          {/* Right icons — ml-auto pushes to far right on mobile when nav/search are hidden */}
          <div className="flex items-center gap-0.5 shrink-0 ml-auto lg:ml-0">
            {/* Wishlist */}
            <Link href="/account/wishlist" className="relative p-2.5 rounded-full hover:bg-gray-100 transition" aria-label="Wishlist">
              <Heart size={20} />
              {mounted && wish.ids.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
                  {wish.ids.length}
                </span>
              )}
            </Link>

            {/* Cart — ShoppingCart icon */}
            <Link href="/cart" className="relative p-2.5 rounded-full hover:bg-gray-100 transition" aria-label="Cart">
              <ShoppingCart size={20} />
              {mounted && cart.count() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold grid place-items-center">
                  {cart.count()}
                </span>
              )}
            </Link>

            {/* User — icon only, no text */}
            {!mounted ? (
              <Link href="/login" className="p-2.5 rounded-full hover:bg-gray-100 transition hidden md:flex" aria-label="Sign In">
                <User size={20} />
              </Link>
            ) : user ? (
              <div className="relative hidden md:block">
                <button onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-gray-100 transition">
                  {user.avatar ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden">
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={14} />
                </button>
                {userOpen && (
                  <div onMouseLeave={() => setUserOpen(false)}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                    <div className="px-3 py-2 mb-1 border-b border-gray-100">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link href="/account/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm"><User size={15} /> My Profile</Link>
                    <Link href="/account/orders" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm"><Package size={15} /> My Orders</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm"><LayoutDashboard size={15} /> Admin</Link>
                    )}
                    <button onClick={() => { logout(); router.push('/'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-sm mt-1">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2.5 rounded-full hover:bg-gray-100 transition hidden md:flex" aria-label="Sign In">
                <User size={20} />
              </Link>
            )}

            {/* Mobile menu trigger (right) */}
            <button onClick={() => setOpen(true)} className="lg:hidden p-2.5 rounded-full hover:bg-gray-100" aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* LEFT — Category drawer */}
      <CategorySidebar open={catOpen} onClose={() => setCatOpen(false)} categories={categories} />

      {/* ══════════════════════════════════════
          RIGHT — Mobile nav drawer
      ══════════════════════════════════════ */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {showLogo && (
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden">
                    <Image src={settings.logo} alt={siteName} fill className="object-contain" sizes="36px" />
                  </div>
                )}
                <span className="font-bold text-lg">{siteName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
            </div>

            {/* Search */}
            <form onSubmit={onSearch} className="p-4 border-b border-gray-100">
              <div className="field-wrap">
                <Search size={15} className="icon-l text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…" className="field-il rounded-full text-sm" />
              </div>
            </form>

            <nav className="flex-1 overflow-y-auto p-3">
              {nav.map((n) => (
                <Link key={n.href} href={n.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition ${
                    pathname === n.href ? 'bg-brand-50 text-brand-600' : 'hover:bg-gray-50 text-gray-700'
                  }`}>
                  {n.label}
                </Link>
              ))}

              <div className="h-px bg-gray-100 my-3" />

              {mounted && user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-1">
                    {user.avatar ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                        <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/account/profile" className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 text-sm"><User size={15} /> My Profile</Link>
                  <Link href="/account/orders" className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 text-sm"><Package size={15} /> My Orders</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 text-sm"><LayoutDashboard size={15} /> Admin</Link>
                  )}
                  <button onClick={() => { logout(); router.push('/'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 text-sm text-left">
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-primary text-center w-full">Sign In</Link>
                  <Link href="/register" className="btn-outline mt-2 text-center w-full block">Create Account</Link>
                </>
              )}
            </nav>

            {/* Social icons at bottom of mobile menu */}
            {socialLinks.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center gap-3 justify-center">
                {socialLinks.map(({ key, Icon, href }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-600 grid place-items-center transition">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
