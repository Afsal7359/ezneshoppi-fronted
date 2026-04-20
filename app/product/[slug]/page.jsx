'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, Check, Minus, Plus } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { API } from '@/lib/api';
import { useCart, useWishlist, useAuth } from '@/store';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const { add } = useCart();
  const wish = useWishlist();
  const { user } = useAuth();
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    // Fetch product first (need _id for related/reviews), then parallel
    API.product(slug).then(({ data }) => {
      const p = data.product;
      setProduct(p);
      Promise.all([
        API.relatedProducts(p._id),
        API.productReviews(p._id),
      ]).then(([rel, rev]) => {
        setRelated(rel.data.items || []);
        setReviews(rev.data.items || []);
      });
    });
  }, [slug]);

  if (!product) return <div className="container-x py-20 text-center">Loading…</div>;
  const liked = wish.has(product._id);

  const onAdd = () => {
    add(product, qty);
    toast.success(`${qty} × ${product.name} added`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to review');
    try {
      await API.createReview({ product: product._id, ...reviewForm });
      toast.success('Review submitted');
      const r = await API.productReviews(product._id);
      setReviews(r.data.items || []);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container-x py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-peach-50 to-ink-900/[0.02] overflow-hidden">
            {product.images?.[img] && (
              <Image src={product.images[img]} alt={product.name} fill className="object-contain p-6" />
            )}
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 chip bg-brand-600 text-white">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {product.images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 ${img === i ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <Image src={im} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm text-ink-500 uppercase tracking-wider mb-2">{product.brand}</p>}
          <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} fill={i <= Math.round(product.rating) ? '#f59e0b' : 'none'} stroke={i <= Math.round(product.rating) ? '#f59e0b' : '#cbd5e1'} />
              ))}
            </div>
            <span className="text-sm text-ink-500">
              {product.rating} ({product.numReviews} reviews)
            </span>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <span className="text-4xl font-extrabold">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-xl text-ink-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          {product.shortDescription && <p className="mt-5 text-ink-700">{product.shortDescription}</p>}

          <div className="mt-5 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <>
                <Check size={16} className="text-green-600" />
                <span className="text-green-700 font-medium">In stock</span>
                {product.stock <= product.lowStockThreshold && (
                  <span className="text-amber-600">· Only {product.stock} left!</span>
                )}
              </>
            ) : (
              <span className="text-red-600 font-medium">Out of stock</span>
            )}
          </div>

          {/* Qty + CTA */}
          <div className="flex items-center gap-3 mt-7">
            <div className="flex items-center border border-ink-900/10 rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 grid place-items-center hover:bg-ink-900/5 rounded-l-full">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-11 grid place-items-center hover:bg-ink-900/5 rounded-r-full">
                <Plus size={14} />
              </button>
            </div>
            <button onClick={onAdd} disabled={product.stock === 0} className="btn-dark flex-1 sm:flex-initial disabled:opacity-50">
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button
              onClick={() => wish.toggle(product._id)}
              className={`w-11 h-11 rounded-full grid place-items-center border ${liked ? 'bg-red-500 text-white border-red-500' : 'border-ink-900/10'}`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Perks */}
          <div className={`grid gap-3 mt-8 ${product.returnDays === 0 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {[
              { i: Truck, t: 'Free Shipping', show: true },
              { i: RotateCcw, t: product.returnDays > 0 ? `${product.returnDays}-Day Returns` : null, show: product.returnDays !== 0 },
              { i: Shield, t: '2-Yr Warranty', show: true },
            ].filter(x => x.show && x.t).map((x, i) => (
              <div key={i} className="p-3 rounded-xl bg-ink-900/[0.03] text-center">
                <x.i size={18} className="mx-auto text-brand-600" />
                <p className="text-xs mt-1">{x.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-2 border-b border-ink-900/10">
          {['description', 'specifications', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 font-medium capitalize border-b-2 -mb-px transition ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-900'}`}
            >
              {t} {t === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'description' && (
            <div className="prose max-w-none text-ink-700 whitespace-pre-wrap">{product.description}</div>
          )}
          {tab === 'specifications' && (
            <div className="grid sm:grid-cols-2 gap-2 max-w-2xl">
              {product.specifications?.map((s, i) => (
                <div key={i} className="flex justify-between p-3 rounded-xl bg-ink-900/[0.03]">
                  <span className="text-ink-500">{s.key}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'reviews' && (
            <div>
              {user && (
                <form onSubmit={submitReview} className="card p-6 mb-8">
                  <h4 className="font-semibold mb-3">Write a review</h4>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setReviewForm({ ...reviewForm, rating: i })}
                      >
                        <Star size={22} fill={i <= reviewForm.rating ? '#f59e0b' : 'none'} stroke={i <= reviewForm.rating ? '#f59e0b' : '#cbd5e1'} />
                      </button>
                    ))}
                  </div>
                  <input
                    className="field mb-2"
                    placeholder="Title"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  />
                  <textarea
                    className="field mb-3"
                    rows={3}
                    placeholder="Your thoughts…"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                  <button className="btn-primary">Submit Review</button>
                </form>
              )}

              <div className="space-y-5">
                {reviews.length === 0 ? (
                  <p className="text-ink-500 text-center py-10">No reviews yet.</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r._id} className="card p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center font-bold">
                          {r.name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} size={12} fill={i <= r.rating ? '#f59e0b' : 'none'} stroke={i <= r.rating ? '#f59e0b' : '#cbd5e1'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {r.title && <p className="font-medium">{r.title}</p>}
                      <p className="text-ink-700 mt-1">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
