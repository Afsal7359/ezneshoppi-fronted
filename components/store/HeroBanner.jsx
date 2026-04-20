'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Zap, Star, Headphones, Laptop, Smartphone, Camera, Watch } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function HeroBanner({ hero }) {
  return (
    <section className="relative bg-gradient-to-br from-peach-50 via-peach-100 to-peach-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-peach-300/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container-x relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-24">
        {/* Left — Text */}
        <div className="animate-fadeUp text-center lg:text-left order-2 lg:order-1">
          {hero.tag && (
            <span className="chip bg-white/80 backdrop-blur text-ink-700 shadow-soft mb-4 inline-flex">
              <Zap size={12} className="text-brand-600" /> {hero.tag}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight">
            {hero.title || 'Premium Electronics for Modern Life'}
          </h1>
          {hero.subtitle && (
            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-md mx-auto lg:mx-0">
              {hero.subtitle}
            </p>
          )}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-5">
            <Link href={hero.ctaLink || '/shop'} className="btn-dark">
              <ShoppingBag size={17} /> {hero.ctaText || 'Shop Now'}
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-gradient-to-br from-brand-300 to-brand-600" />
                ))}
              </div>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i <= (hero.rating || 4) ? 'text-amber-400' : 'text-ink-300'}
                      fill={i <= (hero.rating || 4) ? '#f59e0b' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-xs text-ink-500 mt-0.5">{hero.reviewsCount || 100}+ Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Image or Fallback */}
        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto lg:ml-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square">
            {hero.price && (
              <div className="absolute top-0 left-0 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-lift grid place-items-center text-center -translate-x-2 -translate-y-2">
                <div>
                  <p className="text-[9px] sm:text-[10px] text-ink-500 uppercase tracking-wide">From</p>
                  <p className="font-extrabold text-sm sm:text-lg leading-tight">{formatPrice(hero.price)}</p>
                </div>
              </div>
            )}

            {hero.image ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-peach-200/60 to-transparent rounded-full blur-3xl" />
                <div className="relative w-full h-full animate-floaty">
                  <Image
                    src={hero.image}
                    alt={hero.title || 'Hero Product'}
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </>
            ) : (
              <HeroFallback />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFallback() {
  return (
    <div className="relative w-full h-full animate-floaty">
      {/* Outer glow */}
      <div className="absolute inset-4 bg-gradient-to-br from-brand-200/40 to-peach-200/40 rounded-full blur-2xl" />

      {/* Main card */}
      <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white/90 to-peach-50/90 backdrop-blur-sm border border-white shadow-2xl flex flex-col items-center justify-center gap-4 p-6">

        {/* Top row — big central icon */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl">
          <Headphones size={44} className="text-white" />
        </div>

        {/* Category icons grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { Icon: Laptop, label: 'Laptops', from: 'from-violet-500', to: 'to-violet-700' },
            { Icon: Smartphone, label: 'Phones', from: 'from-cyan-500', to: 'to-cyan-700' },
            { Icon: Camera, label: 'Cameras', from: 'from-amber-500', to: 'to-amber-700' },
            { Icon: Watch, label: 'Wearables', from: 'from-green-500', to: 'to-green-700' },
            { Icon: Zap, label: 'Accessories', from: 'from-pink-500', to: 'to-pink-700' },
            { Icon: ShoppingBag, label: 'All', from: 'from-brand-500', to: 'to-brand-700' },
          ].map(({ Icon, label, from, to }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-md`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-medium text-ink-600">{label}</span>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 bg-ink-900 text-white px-4 py-2 rounded-full shadow-lg">
          <ShoppingBag size={13} />
          <span className="text-xs font-bold tracking-wide">1000+ Products Available</span>
        </div>
      </div>
    </div>
  );
}
