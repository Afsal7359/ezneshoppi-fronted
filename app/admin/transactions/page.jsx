'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, CheckCircle2, Clock, XCircle, RefreshCw, CreditCard } from 'lucide-react';
import { API } from '@/lib/api';
import { formatPrice, relativeTime } from '@/lib/utils';
import Pagination from '@/components/admin/Pagination';

const PAYMENT_TABS = [
  { id: '',         label: 'All',      icon: CreditCard,    color: 'text-ink-600',   bg: 'bg-ink-100' },
  { id: 'paid',     label: 'Paid',     icon: CheckCircle2,  color: 'text-green-700', bg: 'bg-green-100' },
  { id: 'pending',  label: 'Pending',  icon: Clock,         color: 'text-amber-700', bg: 'bg-amber-100' },
  { id: 'failed',   label: 'Failed',   icon: XCircle,       color: 'text-red-700',   bg: 'bg-red-100' },
  { id: 'refunded', label: 'Refunded', icon: RefreshCw,     color: 'text-purple-700',bg: 'bg-purple-100' },
];

const ORDER_STATUS_COLOR = {
  pending:    'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped:    'bg-indigo-50 text-indigo-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
  returned:   'bg-pink-50 text-pink-700',
};

const PAYMENT_BADGE = {
  paid:     'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

const METHOD_LABEL = { razorpay: 'Razorpay', cod: 'COD', whatsapp: 'WhatsApp' };

export default function TransactionsPage() {
  const [paymentTab, setPaymentTab] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  // Load tab counts once
  useEffect(() => {
    Promise.all(
      PAYMENT_TABS.slice(1).map((t) =>
        API.allOrders({ paymentStatus: t.id, limit: 1 })
          .then(({ data }) => ({ id: t.id, total: data.total || 0 }))
      )
    ).then((results) => {
      const c = {};
      results.forEach((r) => { c[r.id] = r.total; });
      setCounts(c);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { q, page, limit: 25 };
    if (paymentTab) params.paymentStatus = paymentTab;
    if (orderStatus) params.status = orderStatus;
    API.allOrders(params)
      .then(({ data }) => {
        setOrders(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [paymentTab, orderStatus, q, page]);

  const onTab = (id) => { setPaymentTab(id); setPage(1); };
  const onSearch = (v) => { setQ(v); setPage(1); };
  const onStatusFilter = (v) => { setOrderStatus(v); setPage(1); };

  const activeTab = PAYMENT_TABS.find((t) => t.id === paymentTab) || PAYMENT_TABS[0];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Transactions</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {loading ? '…' : `${total} transaction${total !== 1 ? 's' : ''}`}
            {paymentTab && ` · ${activeTab.label}`}
          </p>
        </div>
      </div>

      {/* Payment status tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {PAYMENT_TABS.map((t) => {
          const Icon = t.icon;
          const active = paymentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border ${
                active
                  ? `${t.bg} ${t.color} border-transparent shadow-sm`
                  : 'bg-white border-ink-900/10 text-ink-500 hover:bg-ink-50'
              }`}
            >
              <Icon size={14} />
              {t.label}
              {t.id && counts[t.id] !== undefined && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${active ? 'bg-white/60' : 'bg-ink-900/8'}`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-3 flex-wrap items-center">
        <div className="flex-1 field-wrap min-w-[180px]">
          <Search size={15} className="icon-l" />
          <input className="field-il" placeholder="Search order #" value={q}
            onChange={(e) => onSearch(e.target.value)} />
        </div>
        <select className="field max-w-[180px]" value={orderStatus} onChange={(e) => onStatusFilter(e.target.value)}>
          <option value="">All order statuses</option>
          {Object.keys(ORDER_STATUS_COLOR).map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="p-3 pl-4">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Order Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-right pr-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center text-ink-500">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="text-ink-400 text-sm">
                      <activeTab.icon size={32} className="mx-auto mb-2 opacity-40" />
                      No {activeTab.label.toLowerCase()} transactions found.
                    </div>
                  </td>
                </tr>
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
                  <td className="p-3 text-xs text-ink-500">{relativeTime(o.createdAt)}</td>
                  <td className="p-3">
                    <span className={`chip ${ORDER_STATUS_COLOR[o.status] || 'bg-ink-100 text-ink-600'} capitalize`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`chip ${PAYMENT_BADGE[o.paymentStatus] || 'bg-ink-100 text-ink-600'} capitalize`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="chip bg-ink-100 text-ink-600 text-xs">
                      {METHOD_LABEL[o.paymentMethod] || o.paymentMethod}
                    </span>
                  </td>
                  <td className={`p-3 pr-4 text-right font-bold ${o.paymentStatus === 'paid' ? 'text-green-700' : 'text-ink-700'}`}>
                    {formatPrice(o.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer summary for paid tab */}
        {paymentTab === 'paid' && orders.length > 0 && (
          <div className="px-4 py-3 bg-green-50 border-t border-green-100 flex justify-between items-center">
            <span className="text-sm text-green-700 font-medium">Page total</span>
            <span className="font-bold text-green-800">
              {formatPrice(orders.reduce((s, o) => s + o.totalPrice, 0))}
            </span>
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
