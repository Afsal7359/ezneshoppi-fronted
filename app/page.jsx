import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, RotateCcw, Shield, Zap } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import CountdownBanner from '@/components/store/CountdownBanner';
import CategoryGrid from '@/components/store/CategoryGrid';
import HeroBanner from '@/components/store/HeroBanner';
import { serverFetch } from '@/lib/server-fetch';

// Force dynamic so Next.js doesn't try to SSG this at build time
// (settings uses cache:'no-store' which requires a live backend)
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const f = (path, opts) => serverFetch(`${API_URL}${path}`, opts);

export default async function HomePage() {
  const [settingsRes, productsRes, newArrivalsRes, categoriesRes, blogRes] = await Promise.all([
    f('/api/settings',                      { cache: 'no-store' }),
    f('/api/products?featured=true&limit=8',  { next: { revalidate: 120 } }),
    f('/api/products?newArrival=true&limit=8', { next: { revalidate: 120 } }),
    f('/api/categories?active=true',           { next: { revalidate: 120 } }),
    f('/api/blog?limit=3',                     { next: { revalidate: 120 } }),
  ]);

  const settings = settingsRes?.settings;
  const products = productsRes?.items || [];
  const newArrivals = newArrivalsRes?.items || [];
  const categories = categoriesRes?.items || [];
  const blogs = blogRes?.items || [];

  const hero = settings?.hero || {};
  const deal = settings?.dealBanner || {};

  return (
    <>
      {/* ============ HERO ============ */}
      <HeroBanner hero={hero} />

      {/* ============ FEATURES STRIP ============ */}
      <section className="border-y border-ink-900/5 bg-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-6 sm:py-8">
          {[
            { icon: Truck, t: 'Free Shipping', s: 'On orders ₹999+' },
            { icon: RotateCcw, t: '30-Day Returns', s: 'Hassle-free' },
            { icon: Shield, t: '2-Year Warranty', s: 'On all products' },
            { icon: Zap, t: 'Same-Day Dispatch', s: 'Before 3 PM' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">
                <f.icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">{f.t}</p>
                <p className="text-[11px] sm:text-xs text-ink-500">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      {settings?.homepage?.showCategories !== false && categories.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container-x">
            <SectionHead tag="Categories" title="Browse by Category" />
            <CategoryGrid categories={categories} />
          </div>
        </section>
      )}

      {/* ============ DEAL BANNER ============ */}
      {settings?.homepage?.showDealBanner !== false && deal.enabled && (
        <section className="container-x py-10">
          <CountdownBanner deal={deal} />
        </section>
      )}

      {/* ============ FEATURED PRODUCTS ============ */}
      {settings?.homepage?.showFeatured !== false && products.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container-x">
            <SectionHead
              tag="Our Products"
              title="Explore our Products"
              action={<Link href="/shop" className="btn-ghost text-sm">View all <ArrowRight size={14} /></Link>}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p, i) => <ProductCard key={p._id} product={p} priority={i < 4} />)}
            </div>
          </div>
        </section>
      )}

      {/* ============ NEW ARRIVALS ============ */}
      {settings?.homepage?.showNewArrivals !== false && newArrivals.length > 0 && (
        <section className="py-16 lg:py-20 bg-ink-900/[0.02]">
          <div className="container-x">
            <SectionHead tag="Just In" title="New Arrivals" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {newArrivals.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ============ BLOG ============ */}
      {settings?.homepage?.showBlog !== false && blogs.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container-x">
            <SectionHead tag="Insights" title="From the Blog" />
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <Link
                  key={b._id}
                  href={`/blog/${b.slug}`}
                  className="group card overflow-hidden"
                >
                  <div className="relative aspect-[16/10] bg-ink-900/5">
                    {b.coverImage && (
                      <Image src={b.coverImage} alt={b.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-ink-500 mb-1">{new Date(b.publishedAt || b.createdAt).toLocaleDateString()}</p>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">{b.title}</h3>
                    {b.excerpt && <p className="text-sm text-ink-500 mt-2 line-clamp-2">{b.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ NEWSLETTER ============ */}
      {settings?.homepage?.showNewsletter !== false && (
        <section className="container-x py-10 sm:py-16">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-ink-900 to-brand-900 p-7 sm:p-10 lg:p-16 text-center text-white">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Get exclusive deals first</h3>
              <p className="text-white/70 mb-6 text-sm sm:text-base">Subscribe to our newsletter and save up to 20% on your first order.</p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="email" placeholder="your@email.com" className="flex-1 min-w-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 outline-none focus:border-brand-400 focus:bg-white/15 transition-all" />
                <button className="btn-primary shrink-0">Subscribe</button>
              </form>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function SectionHead({ tag, title, action }) {
  return (
    <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4 flex-wrap">
      <div>
        {tag && (
          <span className="text-brand-600 text-sm font-semibold inline-flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-100 grid place-items-center"><span className="w-1.5 h-1.5 rounded-full bg-brand-600"/></span>
            {tag}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">{title}</h2>
      </div>
      {action}
    </div>
  );
}
