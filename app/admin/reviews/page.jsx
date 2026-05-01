'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, Plus, Trash2, Pencil, X, Check, Search, BadgeCheck, Bot, ChevronLeft } from 'lucide-react';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';
import Pagination from '@/components/admin/Pagination';

/* ── Star picker ──────────────────────────────────────────────────── */
function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)}>
          <Star size={22} fill={i <= value ? '#f59e0b' : 'none'} stroke={i <= value ? '#f59e0b' : '#d1d5db'} />
        </button>
      ))}
    </div>
  );
}

/* ── Review form (add / edit) ─────────────────────────────────────── */
const EMPTY = { name: '', rating: 5, title: '', comment: '', isVerifiedPurchase: false, isApproved: true };

function ReviewForm({ productId, initial = null, onSaved, onCancel }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    rating: initial.rating || 5,
    title: initial.title || '',
    comment: initial.comment || '',
    isVerifiedPurchase: !!initial.isVerifiedPurchase,
    isApproved: initial.isApproved !== false,
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Reviewer name is required'); return; }
    if (!form.comment.trim()) { toast.error('Review comment is required'); return; }
    setLoading(true);
    try {
      if (initial) {
        await API.adminUpdateReview(initial._id, form);
        toast.success('Review updated');
      } else {
        await API.adminCreateReview({ product: productId, ...form });
        toast.success('Review added');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-brand-200 rounded-2xl p-5 space-y-4 shadow-sm">
      <h3 className="font-bold text-base text-ink-900">{initial ? 'Edit Review' : 'Add Custom Review'}</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Reviewer Name *</label>
          <input className="field" placeholder="e.g. Rahul Sharma" value={form.name}
            onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">Rating *</label>
          <StarPicker value={form.rating} onChange={(v) => set('rating', v)} />
        </div>
      </div>

      <div>
        <label className="label">Review Title</label>
        <input className="field" placeholder="e.g. Excellent product!" value={form.title}
          onChange={(e) => set('title', e.target.value)} />
      </div>

      <div>
        <label className="label">Review Comment *</label>
        <textarea className="field" rows={3} placeholder="Write the review details here…"
          value={form.comment} onChange={(e) => set('comment', e.target.value)} required />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 rounded accent-brand-600"
            checked={form.isVerifiedPurchase} onChange={(e) => set('isVerifiedPurchase', e.target.checked)} />
          <span className="text-sm font-medium text-ink-700">Verified Purchase</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 rounded accent-brand-600"
            checked={form.isApproved} onChange={(e) => set('isApproved', e.target.checked)} />
          <span className="text-sm font-medium text-ink-700">Show publicly (Approved)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading} className="btn-primary text-sm disabled:opacity-60">
          {loading ? 'Saving…' : initial ? 'Update Review' : 'Add Review'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm">Cancel</button>
      </div>
    </form>
  );
}

/* ── Single review card ───────────────────────────────────────────── */
function ReviewCard({ review, onEdit, onDelete, onToggleApprove }) {
  return (
    <div className={`card p-4 transition ${review.isApproved ? '' : 'opacity-60'}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center font-bold text-sm shrink-0">
          {review.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm text-ink-900">{review.name}</p>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <BadgeCheck size={11} /> Verified
              </span>
            )}
            {review.isCustom && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                <Bot size={11} /> Custom
              </span>
            )}
            {!review.isApproved && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Hidden</span>
            )}
          </div>
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={13} fill={i <= review.rating ? '#f59e0b' : 'none'} stroke={i <= review.rating ? '#f59e0b' : '#d1d5db'} />
            ))}
          </div>
          {review.title && <p className="text-sm font-medium text-ink-800 mb-0.5">{review.title}</p>}
          <p className="text-sm text-ink-600 leading-relaxed">{review.comment}</p>
          <p className="text-xs text-ink-400 mt-1">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onToggleApprove(review)} title={review.isApproved ? 'Hide review' : 'Show review'}
            className={`w-8 h-8 rounded-lg grid place-items-center transition ${review.isApproved ? 'text-green-600 hover:bg-green-50' : 'text-ink-400 hover:bg-ink-100'}`}>
            <Check size={15} />
          </button>
          <button onClick={() => onEdit(review)} className="w-8 h-8 rounded-lg grid place-items-center text-ink-500 hover:bg-ink-100 transition">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(review._id)} className="w-8 h-8 rounded-lg grid place-items-center text-red-500 hover:bg-red-50 transition">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function AdminReviewsPage() {
  // Product list state
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productQ, setProductQ] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Selected product + reviews state
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Load product list
  const loadProducts = (pg = productPage, q = productQ) => {
    setLoadingProducts(true);
    API.products({ q, page: pg, limit: 25, onlyActive: false })
      .then(({ data }) => {
        setProducts(data.items || []);
        setProductPages(data.pages || 1);
        setProductTotal(data.total || 0);
      })
      .finally(() => setLoadingProducts(false));
  };

  useEffect(() => { loadProducts(productPage, productQ); }, [productPage, productQ]);

  const onProductSearch = (v) => { setProductQ(v); setProductPage(1); };
  const onProductPageChange = (pg) => { setProductPage(pg); };

  // Load reviews for a product
  const loadReviews = async (pid) => {
    setLoadingReviews(true);
    try {
      const { data } = await API.adminListReviews(pid);
      setReviews(data.items || []);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const onProductSelect = (p) => {
    setProduct(p);
    setShowForm(false);
    setEditingReview(null);
    loadReviews(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onBack = () => {
    setProduct(null);
    setReviews([]);
    setShowForm(false);
    setEditingReview(null);
  };

  const onSaved = () => {
    setShowForm(false);
    setEditingReview(null);
    if (product) loadReviews(product._id);
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await API.deleteReview(id);
      toast.success('Review deleted');
      setReviews((r) => r.filter((x) => x._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const onToggleApprove = async (review) => {
    try {
      await API.adminUpdateReview(review._id, { isApproved: !review.isApproved });
      setReviews((rs) => rs.map((r) => r._id === review._id ? { ...r, isApproved: !r.isApproved } : r));
      toast.success(review.isApproved ? 'Review hidden' : 'Review approved');
    } catch {
      toast.error('Failed to update');
    }
  };

  const onEdit = (review) => {
    setEditingReview(review);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const avgRating = reviews.length
    ? (reviews.filter((r) => r.isApproved).reduce((s, r) => s + r.rating, 0) / (reviews.filter((r) => r.isApproved).length || 1)).toFixed(1)
    : null;

  /* ── Reviews view (product selected) ─────────────────────────────── */
  if (product) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-ink-900/5 transition text-ink-500">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Reviews</h1>
              <p className="text-sm text-ink-500 mt-0.5 truncate max-w-xs">{product.name}</p>
            </div>
          </div>
          {!showForm && !editingReview && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-2">
              <Plus size={15} /> Add Custom Review
            </button>
          )}
        </div>

        {/* Selected product card */}
        <div className="card p-4 flex items-center gap-3">
          {product.images?.[0] && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
              <Image src={product.images[0]} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink-900 truncate">{product.name}</p>
            <p className="text-xs text-ink-500">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              {avgRating ? ` · ★ ${avgRating} avg` : ''}
            </p>
          </div>
          <button onClick={onBack} className="text-ink-400 hover:text-ink-700 shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Add / Edit form */}
        {(showForm || editingReview) && (
          <ReviewForm
            productId={product._id}
            initial={editingReview}
            onSaved={onSaved}
            onCancel={() => { setShowForm(false); setEditingReview(null); }}
          />
        )}

        {/* Reviews list */}
        {loadingReviews ? (
          <div className="card p-10 text-center text-ink-400 text-sm">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="card p-10 text-center text-ink-400 text-sm">
            No reviews yet for this product.
            <button onClick={() => setShowForm(true)} className="block mx-auto mt-3 text-brand-600 font-medium text-sm hover:underline">
              Add the first review
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} onEdit={onEdit} onDelete={onDelete} onToggleApprove={onToggleApprove} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Product list view ────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Product Reviews</h1>
        <p className="text-sm text-ink-500 mt-0.5">Select a product to manage its reviews or add custom ones</p>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="field-wrap">
          <Search size={16} className="icon-l" />
          <input
            className="field-il"
            placeholder="Search products…"
            value={productQ}
            onChange={(e) => onProductSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product grid */}
      {loadingProducts ? (
        <div className="card p-10 text-center text-ink-500">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">No products found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-900/[0.03] text-left text-xs uppercase text-ink-500">
                <tr>
                  <th className="p-3 pl-4">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-ink-900/5 hover:bg-ink-900/[0.02] cursor-pointer"
                    onClick={() => onProductSelect(p)}>
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-ink-900/5 overflow-hidden shrink-0">
                          {p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-ink-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-ink-500">{p.category?.name || '—'}</td>
                    <td className="p-3 font-medium">{p.price ? `₹${p.price.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="p-3">
                      <span className={`chip ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); onProductSelect(p); }}
                        className="btn-outline text-xs">
                        Manage Reviews
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-ink-500">{productTotal} product{productTotal !== 1 ? 's' : ''} total</p>
      </div>

      <Pagination page={productPage} pages={productPages} onChange={onProductPageChange} />
    </div>
  );
}
