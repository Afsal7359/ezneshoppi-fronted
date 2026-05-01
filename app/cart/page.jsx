'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, update, remove, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-ink-900/5 mx-auto grid place-items-center mb-4">
          <ShoppingBag size={28} className="text-ink-400" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-ink-500 mt-2">Add items to get started.</p>
        <Link href="/shop" className="btn-primary mt-6">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-6 md:py-10">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 md:mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 md:gap-8">
        <div className="space-y-3 md:space-y-4">
          {items.map((it) => (
            <div key={it.key} className="card p-3 sm:p-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-ink-900/5 shrink-0 overflow-hidden">
                  {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${it.slug}`} className="font-medium hover:text-brand-600 line-clamp-2 text-sm sm:text-base">
                    {it.name}
                  </Link>
                  <p className="text-base sm:text-lg font-bold mt-0.5">{formatPrice(it.price)}</p>
                  <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                    <div className="flex items-center border border-ink-900/10 rounded-full bg-white">
                      <button onClick={() => update(it.key, it.quantity - 1)} className="w-8 h-8 grid place-items-center rounded-l-full hover:bg-ink-900/5"><Minus size={12} /></button>
                      <span className="w-7 text-center text-sm">{it.quantity}</span>
                      <button onClick={() => update(it.key, it.quantity + 1)} className="w-8 h-8 grid place-items-center rounded-r-full hover:bg-ink-900/5"><Plus size={12} /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-sm sm:text-base">{formatPrice(it.price * it.quantity)}</p>
                      <button onClick={() => remove(it.key)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                        <Trash2 size={13} /> <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatPrice(subtotal())}</span></div>
            <div className="flex justify-between text-ink-500"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="flex justify-between text-ink-500"><span>Tax</span><span>Calculated at checkout</span></div>
          </div>
          <div className="h-px bg-ink-900/10 my-4" />
          <div className="flex justify-between font-bold text-lg mb-5">
            <span>Total</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full">
            Checkout <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="block text-center text-sm text-ink-500 hover:text-brand-600 mt-3">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
