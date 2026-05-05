'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Star, Heart, Eye, GitCompare, ShoppingCart } from 'lucide-react';
import { useCart, useWishlist } from '@/store';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductCard({ product, priority = false }) {
  const router  = useRouter();
  const add     = useCart((s) => s.add);
  const ids     = useWishlist((s) => s.ids);
  const toggle  = useWishlist((s) => s.toggle);
  const liked   = ids.includes(product._id);

  const discountPct =
    product.discountPercent > 0
      ? product.discountPercent
      : product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    if (product.variants?.length > 0) {
      router.push(`/product/${product.slug}`);
      return;
    }
    add(product, 1);
    toast.success('Added to cart');
  };

  const onWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
    toast.success(liked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const onView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.slug}`);
  };

  const onCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(
      `${window.location.origin}/product/${product.slug}`
    ).then(() => toast.success('Product link copied!'))
     .catch(() => toast('Compare: ' + product.name, { icon: '📋' }));
  };

  const actions = [
    { icon: ShoppingCart, label: 'Add to cart',  onClick: onAdd,     active: false },
    { icon: Heart,        label: 'Wishlist',      onClick: onWish,    active: liked },
    { icon: Eye,          label: 'Quick view',    onClick: onView,    active: false },
    { icon: GitCompare,   label: 'Copy link',     onClick: onCompare, active: false },
  ];

  const ActionBtn = ({ icon: Icon, label, onClick, active }) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-9 h-9 rounded flex items-center justify-center text-white transition-colors duration-150 shadow
        ${active && label === 'Wishlist' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1a3c5e] hover:bg-brand-600'}`}
    >
      <Icon size={15} fill={label === 'Wishlist' && active ? 'white' : 'none'} />
    </button>
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {discountPct > 0 && (
          <span className="absolute top-2 left-2 z-10 text-[11px] font-bold text-white px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: '#8bc34a' }}>
            -{discountPct}%
          </span>
        )}

        {product.images?.[0] ? (
          <>
            {/* Primary image */}
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              priority={priority}
            />
            {/* Secondary image — stacked on top, fades in on hover to cover the first */}
            {product.images[1] && (
              <Image
                src={product.images[1]}
                alt={`${product.name} – alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-300">
            <ShoppingBag size={36} />
          </div>
        )}

      </div>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={12}
              fill={product.rating >= i ? '#f59e0b' : 'none'}
              stroke={product.rating >= i ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          ))}
          {product.numReviews > 0 && (
            <span className="text-[10px] text-gray-400 ml-1">({product.numReviews})</span>
          )}
        </div>

        <h3 className="text-[13px] text-gray-800 leading-snug line-clamp-3 min-h-[3.6em]">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-bold text-blue-700">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Action buttons — always visible on mobile, hover-only on desktop */}
        <div className="flex items-center gap-1.5 pt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          {actions.map((a) => <ActionBtn key={a.label} {...a} />)}
        </div>
      </div>
    </Link>
  );
}
