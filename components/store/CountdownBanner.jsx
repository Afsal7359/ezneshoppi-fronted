'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Zap, Headphones, Laptop, Smartphone, ArrowRight } from 'lucide-react';

export default function CountdownBanner({ deal }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const end = new Date(deal.endsAt).getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [deal.endsAt]);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-ink-900 via-brand-900 to-ink-800 shadow-2xl">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-peach-300/10 rounded-full blur-3xl" />

      <div className="relative grid lg:grid-cols-2 gap-0 items-stretch">
        {/* Left — Text + Timer */}
        <div className="p-7 sm:p-10 lg:p-12 text-white flex flex-col justify-center">
          {deal.tag && (
            <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
              <Zap size={11} /> {deal.tag}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-white">
            {deal.title}
          </h2>
          <p className="text-white/60 mt-2 text-sm sm:text-base">Grab it before the offer expires!</p>

          {/* Countdown */}
          <div className="flex gap-2 sm:gap-3 mt-6">
            {[
              { v: t.d, l: 'Days' },
              { v: t.h, l: 'Hrs' },
              { v: t.m, l: 'Min' },
              { v: t.s, l: 'Sec' },
            ].map((x, i) => (
              <div key={i} className="flex-1 sm:flex-initial sm:w-16 lg:w-20">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                    {String(x.v).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
                    {x.l}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {deal.ctaText && (
            <Link
              href={deal.ctaLink || '/shop'}
              className="mt-7 inline-flex items-center gap-2 bg-white text-ink-900 font-bold px-6 py-3 rounded-full hover:bg-peach-100 transition w-fit text-sm"
            >
              {deal.ctaText} <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {/* Right — Image or Fallback */}
        <div className="relative min-h-[220px] lg:min-h-0 flex items-center justify-center p-6 lg:p-8">
          {deal.image ? (
            <div className="relative w-full h-full min-h-[200px] animate-floaty">
              <Image
                src={deal.image}
                alt={deal.title}
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          ) : (
            <DealFallback />
          )}
        </div>
      </div>
    </div>
  );
}

function DealFallback() {
  return (
    <div className="animate-floaty w-full flex items-center justify-center">
      <div className="relative">
        {/* Glow behind main product */}
        <div className="absolute inset-0 bg-brand-400/30 rounded-full blur-3xl scale-150" />

        {/* Main product card */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-2xl border border-white/20">
          <Headphones size={70} className="text-white drop-shadow-lg" />

          {/* Sale badge */}
          <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-white">
            <div className="text-center">
              <p className="text-white text-[9px] font-bold leading-none">UP TO</p>
              <p className="text-white text-sm font-extrabold leading-none">40%</p>
              <p className="text-white text-[9px] font-bold leading-none">OFF</p>
            </div>
          </div>
        </div>

        {/* Floating mini cards */}
        <div className="absolute -left-10 top-6 w-11 h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg">
          <Laptop size={18} className="text-white" />
        </div>
        <div className="absolute -right-10 bottom-6 w-11 h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg">
          <Smartphone size={18} className="text-white" />
        </div>

        {/* Price tag */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-ink-900 px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          <span className="text-xs text-ink-400 line-through mr-1">₹14,999</span>
          <span className="text-sm font-extrabold text-brand-600">₹8,999</span>
        </div>
      </div>
    </div>
  );
}
