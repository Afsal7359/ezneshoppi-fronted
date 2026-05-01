'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { API } from '@/lib/api';
import { formatPrice, relativeTime } from '@/lib/utils';
import Pagination from '@/components/admin/Pagination';

const statusColor = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  returned:   'bg-pink-100 text-pink-700',
};

const paymentMethodLabel = { razorpay: 'Razorpay', cod: 'COD', whatsapp: 'WhatsApp' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Always filter paymentStatus=paid — orders page only shows confirmed paid orders
    API.allOrders({ paymentStatus: 'paid', status, q, page, limit: 25 })
      .then(({ data }) => {
        setOrders(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [status, q, page]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Paid Orders</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {loading ? '…' : `${total} confirmed order${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/admin/transactions" className="btn-outline text-sm">
          View All Transactions →
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-3 flex-wrap items-center">
        <div className="flex-1 field-wrap min-w-[180px]">
          <Search size={15} className="icon-l" />
          <input className="field-il" placeholder="Search order #" value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select className="field max-w-[180px]" value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {Object.keys(statusColor).map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="p-3 pl-4">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-right pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-ink-500">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-ink-500">No paid orders found.</td></tr>
              ) : orders.map((o) => (
                <tr key={o._id} className="border-t border-ink-900/5 hover:bg-ink-900/[0.02]">
                  <td className="p-3 pl-4">
                    <Link href={`/admin/orders/${o._id}`} className="font-semibold hover:text-brand-600">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{o.user?.name || '—'}</p>
                    <p className="text-xs text-ink-400">{o.user?.email}</p>
                  </td>
                  <td className="p-3 text-ink-500 text-xs">{relativeTime(o.createdAt)}</td>
                  <td className="p-3">
                    <span className={`chip ${statusColor[o.status] || 'bg-ink-100 text-ink-600'} capitalize`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="chip bg-ink-100 text-ink-600 capitalize text-xs">
                      {paymentMethodLabel[o.paymentMethod] || o.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 pr-4 text-right font-bold text-green-700">{formatPrice(o.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
