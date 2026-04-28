'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { X, Tag } from 'lucide-react';

export default function CategorySidebar({ open, onClose, categories }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-brand-600" />
            <h2 className="font-bold text-base">All Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 transition grid place-items-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* All Products */}
        <Link
          href="/shop"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-brand-50 hover:bg-brand-100 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-600 grid place-items-center shrink-0">
            <span className="text-white text-sm">🛍️</span>
          </div>
          <span className="font-semibold text-sm text-brand-700">All Products</span>
        </Link>

        {/* Category list */}
        <nav className="flex-1 overflow-y-auto flex flex-col">
          {categories.length === 0 ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map((cat) => {
              // cat.icon may be a word ("Package", "Natural") or an actual emoji ("📦")
              // Only use it as the icon if it contains no ASCII letters/digits
              const iconIsEmoji = cat.icon && !/[a-zA-Z0-9]/.test(cat.icon);
              const initial = cat.name?.[0]?.toUpperCase() || '?';

              return (
                <Link
                  key={cat._id}
                  href={`/shop?category=${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 active:bg-gray-100 transition border-b border-gray-50 last:border-0 w-full"
                >
                  {/* Icon / thumbnail */}
                  {cat.image ? (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="32px" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-brand-100 grid place-items-center shrink-0 text-brand-700 font-bold text-sm">
                      {iconIsEmoji ? cat.icon : initial}
                    </div>
                  )}

                  {/* Name — truncated to prevent overflow */}
                  <span className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0">
                    {cat.name}
                  </span>
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </div>,
    document.body
  );
}
