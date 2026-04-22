'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ settings, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/register' || pathname === '/sso-callback';
  const showLayout = !isAdmin && !isAuth;

  if (showLayout) {
    return (
      <>
        <Header settings={settings} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer settings={settings} />
      </>
    );
  }
  return <>{children}</>;
}
