'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart, useWishlist } from '@/store';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductCard({ product, priority = false }) {
  const add = useCart((s) => s.add);
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const liked = ids.includes(product._id);

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    add(product, 1);
    toast.success('Added to cart');
  };

  const onWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
    toast.success(liked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group card overflow-hidden flex flex-col"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gradient-to-br from-peach-50 to-ink-900/[0.02] overflow-hidden">
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 chip bg-brand-600 text-white text-[11px] px-2 py-0.5">
            -{product.discountPercent}%
          </span>
        )}

        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-300">
            <ShoppingBag size={32} />
          </div>
        )}

        {/* Wishlist — always visible, top-right corner */}
        <button
          onClick={onWish}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full grid place-items-center transition-all duration-200 shadow-sm ${
            liked
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 backdrop-blur-sm text-ink-400 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col gap-1 flex-1">
        {product.brand && (
          <p className="text-[11px] text-ink-400 uppercase tracking-wide font-medium truncate">
            {product.brand}
          </p>
        )}
        <h3 className="text-sm font-medium line-clamp-2 leading-snug text-ink-900">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={11}
                  fill={i <= Math.round(product.rating) ? '#f59e0b' : 'none'}
                  stroke={i <= Math.round(product.rating) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <span className="text-[11px] text-ink-400">({product.numReviews})</span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="font-bold text-base sm:text-lg leading-none">{formatPrice(product.price)}</span>
          {product.comparePrice > product.price && (
            <span className="text-xs text-ink-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        {/* Add to cart — always visible, no hover required */}
        <button
          onClick={onAdd}
          disabled={product.stock === 0}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            product.stock === 0
              ? 'bg-ink-900/5 text-ink-400 cursor-not-allowed'
              : 'bg-ink-900 text-white hover:bg-brand-600'
          }`}
        >
          <ShoppingBag size={13} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
