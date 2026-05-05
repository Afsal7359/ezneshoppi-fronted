'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Star, Heart, ShoppingCart, Truck, RotateCcw, Shield,
  Check, Minus, Plus, ChevronLeft, ChevronRight, Share2, CheckCheck,
} from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { API } from '@/lib/api';
import { useCart, useWishlist, useAuth } from '@/store';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductDetail({ slug }) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [copied, setCopied] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const { add } = useCart();
  const wish = useWishlist();
  const { user } = useAuth();
  const autoTimerRef = useRef(null);
  const thumbsRef = useRef(null);

  const stopAuto = () => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  useEffect(() => {
    setProduct(null);
    setImg(0);
    setSelectedVariants({});
    stopAuto();
    API.product(slug).then(({ data }) => {
      const p = data.product;
      setProduct(p);
      // Auto-select any variant that has exactly one option
      const autoSelected = {};
      (p.variants || []).forEach((v) => {
        if (v.options.length === 1) autoSelected[v.name] = v.options[0];
      });
      if (Object.keys(autoSelected).length) setSelectedVariants(autoSelected);
      Promise.all([
        API.relatedProducts(p._id),
        API.productReviews(p._id),
      ]).then(([rel, rev]) => {
        setRelated(rel.data.items || []);
        setReviews(rev.data.items || []);
      });
    });
  }, [slug]);

  useEffect(() => {
    if (!user || !product) return;
    API.canReviewProduct(product._id)
      .then(({ data: rd }) => {
        setCanReview(rd.canReview);
        setAlreadyReviewed(rd.alreadyReviewed);
      })
      .catch(() => {});
  }, [user, product]);

  useEffect(() => {
    if (!product || (product.images?.length || 0) <= 1) return;
    autoTimerRef.current = setInterval(() => {
      setImg((prev) => (prev + 1) % product.images.length);
    }, 4000);
    return () => stopAuto();
  }, [product]);

  // Scroll thumbnail strip horizontally — never touches page scroll
  useEffect(() => {
    if (!thumbsRef.current) return;
    const strip = thumbsRef.current;
    const btn = strip.querySelectorAll('button')[img];
    if (!btn) return;
    const stripRect = strip.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const offset = btnRect.left - stripRect.left - (strip.clientWidth / 2) + (btnRect.width / 2);
    strip.scrollBy({ left: offset, behavior: 'smooth' });
  }, [img]);

  const goTo = useCallback((index) => { stopAuto(); setImg(index); }, []);
  const goNext = useCallback(() => {
    if (!product) return;
    stopAuto();
    setImg((prev) => (prev + 1) % product.images.length);
  }, [product]);
  const goPrev = useCallback(() => {
    if (!product) return;
    stopAuto();
    setImg((prev) => (prev - 1 + product.images.length) % product.images.length);
  }, [product]);

  if (!product) return <div className="container-x py-20 text-center">Loading…</div>;

  const images = product.images || [];
  const liked = wish.has(product._id);
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const isCssColor = (str) => {
    if (!str) return false;
    const s = new Option().style;
    s.color = str;
    return s.color !== '';
  };
  const isColorGroup = (name) => name.toLowerCase() === 'color' || name.toLowerCase() === 'colour';

  const allVariantsSelected = !hasVariants || variants.every((v) => selectedVariants[v.name]);

  const onAdd = () => {
    if (!allVariantsSelected) {
      const missing = variants.filter((v) => !selectedVariants[v.name]).map((v) => v.name);
      toast.error(`Please select: ${missing.join(', ')}`);
      return;
    }
    add(product, qty, hasVariants ? selectedVariants : null);
    const variantStr = hasVariants
      ? ' (' + Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ') + ')'
      : '';
    toast.success(`${qty} × ${product.name}${variantStr} added`);
  };

  const shareProduct = async () => {
    const url = window.location.href;
    const title = product.name;

    const priceStr = formatPrice(product.price);
    const discountLine = product.comparePrice > product.price
      ? `  Original price: ${formatPrice(product.comparePrice)} (${product.discountPercent}% OFF)`
      : '';
    const brandLine = product.brand ? `  Brand: ${product.brand}` : '';
    const ratingLine = product.numReviews > 0
      ? `  Rating: ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))} (${product.numReviews} reviews)`
      : '';
    const descLine = product.shortDescription ? `\n${product.shortDescription}` : '';

    const richText = [
      `🛍️ ${title}`,
      `💰 Price: ${priceStr}`,
      discountLine,
      brandLine,
      ratingLine,
      descLine,
      `\n🔗 ${url}`,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try {
        const imageUrl = images[img] || images[0];
        let shared = false;

        if (imageUrl && navigator.canShare) {
          try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const ext = blob.type.includes('png') ? 'png' : 'jpg';
            const file = new File([blob], `${title}.${ext}`, { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ title, text: richText, url, files: [file] });
              shared = true;
            }
          } catch {}
        }

        if (!shared) {
          await navigator.share({ title, text: richText, url });
        }
      } catch {}
    } else {
      await navigator.clipboard.writeText(richText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await API.createReview({ product: product._id, ...reviewForm });
      toast.success('Review submitted!');
      const r = await API.productReviews(product._id);
      setReviews(r.data.items || []);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setCanReview(false);
      setAlreadyReviewed(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="container-x py-6 md:py-10">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">

        {/* ── Gallery ── */}
        <div>
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-peach-50 to-ink-900/[0.02] overflow-hidden">
            {images[img] && (
              <Image
                key={img}
                src={images[img]}
                alt={product.name}
                fill
                className="object-contain p-4 md:p-8"
                priority
              />
            )}
            {product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 chip bg-brand-600 text-white text-xs">
                {product.discountPercent}% OFF
              </span>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm grid place-items-center shadow-md hover:bg-white transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm grid place-items-center shadow-md hover:bg-white transition"
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === img ? 'bg-brand-600 w-5' : 'bg-ink-900/25 w-1.5 hover:bg-ink-900/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div ref={thumbsRef} className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${img === i ? 'border-brand-600 shadow-md' : 'border-transparent hover:border-ink-200'}`}
                >
                  <Image src={im} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-2">{product.brand}</p>
          )}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i <= Math.round(product.rating) ? '#f59e0b' : 'none'}
                  stroke={i <= Math.round(product.rating) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <span className="text-xs text-ink-500">{product.rating} ({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl md:text-4xl font-extrabold">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-lg text-ink-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-3 text-sm md:text-base text-ink-600 leading-relaxed">{product.shortDescription}</p>
          )}

          <div className="mt-3 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <>
                <Check size={14} className="text-green-600" />
                <span className="text-green-700 font-medium">In stock</span>
                {product.stock <= product.lowStockThreshold && (
                  <span className="text-amber-600">· Only {product.stock} left!</span>
                )}
              </>
            ) : (
              <span className="text-red-600 font-medium">Out of stock</span>
            )}
          </div>

          {/* ── Variant selectors ── */}
          {hasVariants && (
            <div className="mt-5 space-y-4">
              {variants.map((v) => {
                const isColor = isColorGroup(v.name);
                const selected = selectedVariants[v.name];
                return (
                  <div key={v.name}>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm font-semibold text-ink-800">{v.name}</span>
                      {selected && (
                        <span className="text-xs text-ink-500">
                          {isColor ? (
                            <span className="flex items-center gap-1">
                              {isCssColor(selected) && (
                                <span className="w-3 h-3 rounded-full border border-black/10 inline-block"
                                  style={{ backgroundColor: selected }} />
                              )}
                              {selected}
                            </span>
                          ) : selected}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => {
                        const active = selected === opt;
                        if (isColor) {
                          const hasColor = isCssColor(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              title={opt}
                              onClick={() => setSelectedVariants((s) => ({ ...s, [v.name]: opt }))}
                              className={`relative w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                                active
                                  ? 'border-brand-600 shadow-md scale-110'
                                  : 'border-transparent hover:border-ink-300 hover:scale-105'
                              }`}
                            >
                              {hasColor ? (
                                <span className="w-7 h-7 rounded-full border border-black/10"
                                  style={{ backgroundColor: opt }} />
                              ) : (
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                  active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700'
                                }`}>{opt}</span>
                              )}
                              {active && hasColor && (
                                <Check size={12} className="absolute text-white drop-shadow-sm" />
                              )}
                            </button>
                          );
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedVariants((s) => ({ ...s, [v.name]: opt }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                              active
                                ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                                : 'border-ink-900/15 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-600'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center border border-ink-900/10 rounded-full bg-white">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-10 grid place-items-center hover:bg-ink-900/5 rounded-l-full transition"
              >
                <Minus size={13} />
              </button>
              <span className="w-9 text-center font-medium text-sm select-none">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-9 h-10 grid place-items-center hover:bg-ink-900/5 rounded-r-full transition"
              >
                <Plus size={13} />
              </button>
            </div>
            <button
              onClick={onAdd}
              disabled={product.stock === 0}
              className={`flex-1 sm:flex-none sm:min-w-[160px] flex items-center justify-center gap-2 btn-dark disabled:opacity-50 ${
                !allVariantsSelected && product.stock > 0 ? 'opacity-70' : ''
              }`}
            >
              <ShoppingCart size={16} />
              {!allVariantsSelected && product.stock > 0 ? 'Select Options' : 'Add to Cart'}
            </button>
            <button
              onClick={() => wish.toggle(product._id)}
              className={`w-10 h-10 rounded-full grid place-items-center border transition ${liked ? 'bg-red-500 text-white border-red-500' : 'border-ink-900/10 hover:border-red-300 hover:text-red-500'}`}
            >
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={shareProduct}
              className={`w-10 h-10 rounded-full grid place-items-center border transition ${copied ? 'bg-green-500 text-white border-green-500' : 'border-ink-900/10 hover:border-brand-300 hover:text-brand-600'}`}
              aria-label="Share product"
            >
              {copied ? <CheckCheck size={15} /> : <Share2 size={15} />}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
            {[
              { Icon: Truck, label: 'Free Shipping' },
              product.returnDays > 0 ? { Icon: RotateCcw, label: `${product.returnDays}-Day Returns` } : null,
              { Icon: Shield, label: '2-Yr Warranty' },
            ].filter(Boolean).map((x, i) => (
              <div key={i} className="p-3 rounded-xl bg-ink-900/[0.03] text-center">
                <x.Icon size={16} className="mx-auto text-brand-600 mb-1" />
                <p className="text-xs text-ink-600">{x.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-10 md:mt-16">
        <div className="flex gap-1 border-b border-ink-900/10 overflow-x-auto scrollbar-hide">
          {['description', 'specifications', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 font-medium capitalize border-b-2 -mb-px transition whitespace-nowrap text-sm ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-800'}`}
            >
              {t}{t === 'reviews' ? ` (${reviews.length})` : ''}
            </button>
          ))}
        </div>

        <div className="py-5 md:py-8">
          {tab === 'description' && (
            <div className="prose max-w-none text-ink-700 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
              {product.description || 'No description available.'}
            </div>
          )}

          {tab === 'specifications' && (
            <div className="grid sm:grid-cols-2 gap-2 max-w-2xl">
              {(product.specifications || []).length === 0 ? (
                <p className="text-ink-500 text-sm">No specifications listed.</p>
              ) : product.specifications.map((s, i) => (
                <div key={i} className="flex justify-between p-3 rounded-xl bg-ink-900/[0.03]">
                  <span className="text-ink-500 text-sm">{s.key}</span>
                  <span className="font-medium text-sm">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="max-w-3xl">
              {user && canReview && (
                <form onSubmit={submitReview} className="card p-5 md:p-6 mb-6">
                  <h4 className="font-semibold mb-3">Write a Review</h4>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button type="button" key={i} onClick={() => setReviewForm({ ...reviewForm, rating: i })}>
                        <Star
                          size={26}
                          fill={i <= reviewForm.rating ? '#f59e0b' : 'none'}
                          stroke={i <= reviewForm.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    ))}
                  </div>
                  <input
                    className="field mb-2"
                    placeholder="Review title"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  />
                  <textarea
                    className="field mb-3"
                    rows={3}
                    placeholder="Share your experience…"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                  />
                  <button className="btn-primary text-sm">Submit Review</button>
                </form>
              )}

              {user && alreadyReviewed && (
                <div className="rounded-xl p-4 mb-6 text-sm text-green-700 bg-green-50 border border-green-200">
                  You have already reviewed this product. Thank you for your feedback!
                </div>
              )}

              {user && !canReview && !alreadyReviewed && (
                <div className="rounded-xl p-4 mb-6 text-sm text-ink-500 bg-ink-900/[0.03] border border-ink-900/5">
                  Only customers who have purchased this product can write a review.
                </div>
              )}

              {!user && (
                <div className="rounded-xl p-4 mb-6 text-sm text-ink-500 bg-ink-900/[0.03] border border-ink-900/5">
                  Please sign in to write a review.
                </div>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-ink-500 text-center py-10 text-sm">No reviews yet. Be the first!</p>
                ) : reviews.map((r) => (
                  <div key={r._id} className="card p-4 md:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center font-bold text-sm shrink-0">
                        {r.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{r.name}</p>
                          {r.isVerifiedPurchase && (
                            <span className="chip bg-green-100 text-green-700 text-xs">Verified Purchase</span>
                          )}
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={12} fill={i <= r.rating ? '#f59e0b' : 'none'} stroke={i <= r.rating ? '#f59e0b' : '#cbd5e1'} />
                          ))}
                        </div>
                        {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                        <p className="text-ink-600 text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12 md:mt-20">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
