'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { API } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Check, Package, Truck, Home } from 'lucide-react';

const steps = [
  { key: 'pending', label: 'Placed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    API.getOrder(id).then(({ data }) => setOrder(data.order));
  }, [id]);

  if (!order) return <div>Loading…</div>;
  const stepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-ink-500 mb-6">{new Date(order.createdAt).toLocaleString()}</p>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.key} className="flex-1 flex flex-col items-center relative">
                <div className={`w-10 h-10 rounded-full grid place-items-center ${i <= stepIndex ? 'bg-brand-600 text-white' : 'bg-ink-900/5 text-ink-400'}`}>
                  <s.icon size={18} />
                </div>
                <p className="text-xs mt-2">{s.label}</p>
                {i < steps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 ${i < stepIndex ? 'bg-brand-600' : 'bg-ink-900/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="card p-6">
          <h2 className="font-bold mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((it, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="relative w-16 h-16 rounded-lg bg-ink-900/5 overflow-hidden shrink-0">
                  {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{it.name}</p>
                  <p className="text-sm text-ink-500">{it.quantity} × {formatPrice(it.price)}</p>
                </div>
                <p className="font-semibold">{formatPrice(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 text-sm space-y-2">
            <h3 className="font-bold mb-2">Summary</h3>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingPrice)}</span></div>
            {order.taxPrice > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>}
            <div className="h-px bg-ink-900/10 my-2" />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Ship to</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p className="text-ink-500">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p className="text-ink-500">{order.shippingAddress.line2}</p>}
            <p className="text-ink-500">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-ink-500 mt-2">📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Payment</h3>
            <p className="capitalize">{order.paymentMethod}</p>
            <p className={`mt-1 chip ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} capitalize`}>
              {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
