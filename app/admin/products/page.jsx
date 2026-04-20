'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { API } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = () => {
    setLoading(true);
    API.products({ q, page, limit: 20, onlyActive: false })
      .then(({ data }) => { setProducts(data.items || []); setPages(data.pages || 1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [q, page]);

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    await API.deleteProduct(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary"><Plus size={16} /> Add Product</Link>
      </div>

      <div className="card p-4 mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="field pl-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-ink-500">Loading…</td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="border-t border-ink-900/5 hover:bg-ink-900/[0.02]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-ink-900/5 overflow-hidden shrink-0">
                        {p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-ink-500">{p.category?.name || '—'}</td>
                  <td className="p-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span className={`chip ${p.stock === 0 ? 'bg-red-50 text-red-700' : p.stock <= p.lowStockThreshold ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`chip ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Link href={`/admin/products/edit/${p._id}`} className="p-2 rounded-lg hover:bg-brand-50 text-brand-600"><Edit2 size={14} /></Link>
                      <button onClick={() => del(p._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
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
