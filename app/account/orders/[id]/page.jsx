'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { API } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Check, Package, Truck, Home, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { key: 'pending', label: 'Placed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

function ReviewForm({ productId, productName, onDone }) {
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.createReview({ product: productId, ...form });
      toast.success('Review submitted!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 pt-3 border-t border-ink-900/10">
      <p className="text-sm font-medium mb-2">Review: <span className="text-ink-500">{productName}</span></p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setForm({ ...form, rating: i })}>
            <Star size={22} fill={i <= form.rating ? '#f59e0b' : 'none'} stroke={i <= form.rating ? '#f59e0b' : '#cbd5e1'} />
          </button>
        ))}
      </div>
      <input
        className="field mb-2 text-sm"
        placeholder="Review title (optional)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        className="field mb-2 text-sm"
        rows={2}
        placeholder="Share your experience…"
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        required
      />
      <div className="flex gap-2">
        <button className="btn-primary text-xs py-1.5 px-4" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit'}
        </button>
        <button type="button" className="text-xs text-ink-500 hover:text-ink-800 transition" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null); // productId
  const [reviewedItems, setReviewedItems] = useState(new Set()); // productIds already reviewed this session

  useEffect(() => {
    API.getOrder(id).then(({ data }) => setOrder(data.order));
  }, [id]);

  if (!order) return <div>Loading…</div>;
  const stepIndex = steps.findIndex((s) => s.key === order.status);
  const isPaid = order.paymentStatus === 'paid';

  const handleReviewDone = (productId) => {
    setReviewingItem(null);
    setReviewedItems((prev) => new Set([...prev, productId]));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-ink-500 mb-6 text-sm">{new Date(order.createdAt).toLocaleString()}</p>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <div className="card p-4 md:p-6 mb-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[300px]">
            {steps.map((s, i) => (
              <div key={s.key} className="flex-1 flex flex-col items-center relative">
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full grid place-items-center z-10 ${i <= stepIndex ? 'bg-brand-600 text-white' : 'bg-ink-900/5 text-ink-400'}`}>
                  <s.icon size={16} />
                </div>
                <p className="text-xs mt-2 text-center">{s.label}</p>
                {i < steps.length - 1 && (
                  <div className={`absolute top-[18px] md:top-5 left-1/2 w-full h-0.5 ${i < stepIndex ? 'bg-brand-600' : 'bg-ink-900/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_320px] gap-5">
        {/* Items */}
        <div className="card p-5 md:p-6">
          <h2 className="font-bold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((it, i) => {
              const pid = String(it.product);
              const isReviewing = reviewingItem === pid;
              const alreadyReviewed = reviewedItems.has(pid);
              return (
                <div key={i}>
                  <div className="flex gap-3 items-start">
                    <div className="relative w-16 h-16 rounded-lg bg-ink-900/5 overflow-hidden shrink-0">
                      {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {it.slug ? (
                        <Link href={`/product/${it.slug}`} className="font-medium text-sm hover:text-brand-600 transition line-clamp-2">
                          {it.name}
                        </Link>
                      ) : (
                        <p className="font-medium text-sm line-clamp-2">{it.name}</p>
                      )}
                      <p className="text-xs text-ink-500 mt-0.5">{it.quantity} × {formatPrice(it.price)}</p>
                      {/* Write review button */}
                      {isPaid && !alreadyReviewed && (
                        <button
                          onClick={() => setReviewingItem(isReviewing ? null : pid)}
                          className="mt-1.5 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition"
                        >
                          {isReviewing ? (
                            <><X size={11} /> Cancel</>
                          ) : (
                            <><Star size={11} /> Write a Review</>
                          )}
                        </button>
                      )}
                      {alreadyReviewed && (
                        <p className="mt-1.5 text-xs text-green-600 font-medium">Review submitted ✓</p>
                      )}
                    </div>
                    <p className="font-semibold text-sm shrink-0">{formatPrice(it.price * it.quantity)}</p>
                  </div>
                  {isReviewing && (
                    <ReviewForm
                      productId={pid}
                      productName={it.name}
                      onDone={() => handleReviewDone(pid)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 text-sm space-y-2">
            <h3 className="font-bold mb-2">Summary</h3>
            <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-ink-500">Shipping</span><span>{formatPrice(order.shippingPrice)}</span></div>
            {order.taxPrice > 0 && (
              <div className="flex justify-between"><span className="text-ink-500">Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
            )}
            <div className="h-px bg-ink-900/10 my-1" />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Shipping Address</h3>
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-ink-500">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p className="text-ink-500">{order.shippingAddress.line2}</p>}
            <p className="text-ink-500">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-ink-500 mt-1.5">📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Payment</h3>
            <p className="capitalize text-ink-700">{order.paymentMethod}</p>
            <p className={`mt-1.5 chip capitalize ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {order.paymentStatus}
            </p>
          </div>

          {order.trackingNumber && (
            <div className="card p-5 text-sm">
              <h3 className="font-bold mb-1">Tracking</h3>
              <p className="font-mono text-brand-600">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
