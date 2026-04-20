'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { API } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [note, setNote] = useState('');

  const load = () => API.getOrder(id).then(({ data }) => {
    setOrder(data.order);
    setStatus(data.order.status);
    setTracking(data.order.trackingNumber || '');
  });

  useEffect(() => { load(); }, [id]);

  const updateOrder = async () => {
    try {
      await API.updateOrderStatus(id, { status, trackingNumber: tracking, note });
      toast.success('Updated');
      setNote('');
      load();
    } catch (err) { toast.error('Failed'); }
  };

  if (!order) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Order {order.orderNumber}</h1>
      <p className="text-ink-500 mb-6">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-bold mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((it, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-lg bg-ink-900/5 overflow-hidden">
                    {it.image && <Image src={it.image} alt="" fill className="object-cover" />}
                  </div>
                  <div className="flex-1"><p className="font-medium">{it.name}</p><p className="text-sm text-ink-500">{it.quantity} × {formatPrice(it.price)}</p></div>
                  <p className="font-semibold">{formatPrice(it.price * it.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-bold mb-4">Timeline</h2>
            <div className="space-y-3">
              {(order.timeline || []).map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-600 mt-2" />
                  <div>
                    <p className="font-medium capitalize">{t.status}</p>
                    <p className="text-xs text-ink-500">{t.note} · {new Date(t.at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-3">Update Status</h3>
            <label className="label">Status</label>
            <select className="field mb-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="label">Tracking #</label>
            <input className="field mb-2" value={tracking} onChange={(e) => setTracking(e.target.value)} />
            <label className="label">Note</label>
            <input className="field mb-3" value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={updateOrder} className="btn-primary w-full">Update Order</button>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Summary</h3>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingPrice)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Customer</h3>
            <p>{order.user?.name}</p>
            <p className="text-ink-500">{order.user?.email}</p>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Ship to</h3>
            <p>{order.shippingAddress?.fullName}</p>
            <p className="text-ink-500">{order.shippingAddress?.line1}</p>
            <p className="text-ink-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
            <p className="text-ink-500">📞 {order.shippingAddress?.phone}</p>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Payment</h3>
            <p className="capitalize">{order.paymentMethod}</p>
            <span className={`chip mt-1 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} capitalize`}>{order.paymentStatus}</span>
            {order.paymentResult?.razorpay_payment_id && (
              <p className="text-xs text-ink-400 mt-2 break-all">ID: {order.paymentResult.razorpay_payment_id}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
