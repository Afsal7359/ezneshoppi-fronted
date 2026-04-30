import { cache } from 'react';
import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import AuthBoot from '@/components/layout/AuthBoot';
import { serverFetch } from '@/lib/server-fetch';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getSettings = cache(async () => {
  return serverFetch(`${API_URL}/api/settings`, { cache: 'no-store' });
});

export async function generateMetadata() {
  const data = await getSettings();
  const s = data?.settings || data;
  return {
    title: { default: s?.siteName || 'ezoneshoppi', template: `%s | ${s?.siteName || 'ezoneshoppi'}` },
    description: s?.tagline || s?.seo?.metaDescription || 'Premium electronics store',
    keywords: s?.seo?.metaKeywords || [],
    openGraph: { images: [s?.seo?.ogImage].filter(Boolean) },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function RootLayout({ children }) {
  const data = await getSettings();
  const settings = data?.settings || data;
  return (
    <html lang="en" className={jakarta.variable}>
      <body suppressHydrationWarning>
        <AuthBoot />
        <ConditionalLayout settings={settings}>
          {children}
        </ConditionalLayout>
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '9999px' } }} />
      </body>
    </html>
  );
}
