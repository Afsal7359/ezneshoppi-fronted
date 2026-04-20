'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { API } from '@/lib/api';
import { formatPrice, relativeTime } from '@/lib/utils';

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.allOrders({ status, q, page, limit: 20 })
      .then(({ data }) => { setOrders(data.items || []); setPages(data.pages || 1); })
      .finally(() => setLoading(false));
  }, [status, q, page]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="card p-4 mb-4 flex gap-3 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="field pl-10" placeholder="Order #" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="field max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.keys(statusColor).map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
              <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Payment</th><th className="p-3 text-right">Total</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-10 text-center text-ink-500">Loading…</td></tr> : orders.map((o) => (
                <tr key={o._id} className="border-t border-ink-900/5 hover:bg-ink-900/[0.02]">
                  <td className="p-3"><Link href={`/admin/orders/${o._id}`} className="font-medium hover:text-brand-600">{o.orderNumber}</Link></td>
                  <td className="p-3"><p>{o.user?.name}</p><p className="text-xs text-ink-400">{o.user?.email}</p></td>
                  <td className="p-3 text-ink-500">{relativeTime(o.createdAt)}</td>
                  <td className="p-3"><span className={`chip ${statusColor[o.status]} capitalize`}>{o.status}</span></td>
                  <td className="p-3"><span className={`chip ${o.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-ink-100'} capitalize`}>{o.paymentStatus}</span></td>
                  <td className="p-3 text-right font-semibold">{formatPrice(o.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-full text-sm ${page === i + 1 ? 'bg-ink-900 text-white' : 'bg-white border border-ink-900/10'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
