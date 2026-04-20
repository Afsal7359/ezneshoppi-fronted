'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { API } from '@/lib/api';
import { formatPrice, relativeTime } from '@/lib/utils';

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.myOrders()
      .then(({ data }) => setOrders(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-10 text-center">
          <Package size={32} className="mx-auto text-ink-400 mb-3" />
          <p className="text-ink-500">You have no orders yet.</p>
          <Link href="/shop" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o._id} href={`/account/orders/${o._id}`} className="card p-5 block hover:border-brand-200 border border-transparent">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-bold">{o.orderNumber}</p>
                  <p className="text-xs text-ink-500">{relativeTime(o.createdAt)} · {o.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(o.totalPrice)}</p>
                  <span className={`chip ${statusColor[o.status] || 'bg-ink-100'} mt-1 capitalize`}>{o.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
