'use client';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
import { useWishlist } from '@/store';
import { API } from '@/lib/api';

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setItems([]); setLoading(false); return; }
    Promise.all(ids.map((id) => API.product(id).then((r) => r.data.product).catch(() => null)))
      .then((r) => setItems(r.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">Your wishlist is empty.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
