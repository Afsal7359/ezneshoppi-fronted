'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { API } from '@/lib/api';
import { formatPrice, relativeTime } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.stats().then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  if (!stats) return <div className="p-6">Loading…</div>;

  const cards = [
    { t: 'Revenue', v: formatPrice(stats.revenue), i: DollarSign, c: 'from-green-500 to-emerald-600' },
    { t: 'Orders', v: stats.ordersCount, i: ShoppingBag, c: 'from-brand-500 to-brand-700' },
    { t: 'Products', v: stats.productsCount, i: Package, c: 'from-purple-500 to-fuchsia-600' },
    { t: 'Customers', v: stats.usersCount, i: Users, c: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div>
      <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-ink-500 mt-1">Welcome back — here's what's happening.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="card p-5 relative overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${c.c} opacity-20`} />
            <c.i size={20} className="text-ink-500 relative" />
            <p className="text-xs text-ink-500 mt-3 relative">{c.t}</p>
            <p className="text-2xl font-bold relative">{c.v}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><TrendingUp size={16} /> Revenue (30 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-4">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="sold" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-brand-600">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-500 uppercase">
                <tr><th className="py-2">Order</th><th>Customer</th><th>Status</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id} className="border-t border-ink-900/5">
                    <td className="py-3"><Link href={`/admin/orders/${o._id}`} className="font-medium hover:text-brand-600">{o.orderNumber}</Link><p className="text-xs text-ink-400">{relativeTime(o.createdAt)}</p></td>
                    <td>{o.user?.name || '—'}</td>
                    <td><span className="chip bg-ink-900/5 capitalize text-xs">{o.status}</span></td>
                    <td className="text-right font-semibold">{formatPrice(o.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Low Stock</h3>
          {stats.lowStock.length === 0 ? <p className="text-sm text-ink-500">All good!</p> : (
            <div className="space-y-2">
              {stats.lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-ink-900/5">
                  <span className="text-sm line-clamp-1">{p.name}</span>
                  <span className="chip bg-red-50 text-red-700 text-xs">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
