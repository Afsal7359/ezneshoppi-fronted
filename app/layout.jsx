import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import AuthBoot from '@/components/layout/AuthBoot';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.settings;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: { default: s?.siteName || 'ezoneshoppi', template: `%s | ${s?.siteName || 'ezoneshoppi'}` },
    description: s?.tagline || s?.seo?.metaDescription || 'Premium electronics store',
    keywords: s?.seo?.metaKeywords || [],
    openGraph: { images: [s?.seo?.ogImage].filter(Boolean) },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
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
