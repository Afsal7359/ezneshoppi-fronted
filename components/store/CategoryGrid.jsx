'use client';
import Link from 'next/link';
import * as Icons from 'lucide-react';

export default function CategoryGrid({ categories }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {categories.map((c) => {
        const Icon = Icons[c.icon] || Icons.Package;
        return (
          <Link
            key={c._id}
            href={`/shop?category=${c.slug}`}
            className="group card p-3 sm:p-4 flex flex-col items-center text-center hover:bg-brand-50 hover:border-brand-200 border border-transparent"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-50 to-peach-100 group-hover:from-brand-600 group-hover:to-brand-400 grid place-items-center mb-2 sm:mb-3 transition-all">
              <Icon size={18} className="text-brand-600 group-hover:text-white transition" />
            </div>
            <p className="font-medium text-xs sm:text-sm leading-tight">{c.name}</p>
            <p className="text-[10px] sm:text-xs text-ink-400 mt-0.5">{c.productCount} items</p>
          </Link>
        );
      })}
    </div>
  );
}
