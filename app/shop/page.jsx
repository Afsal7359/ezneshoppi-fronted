'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, Search, Tag } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { API } from '@/lib/api';

/* ── Debounce hook ───────────────────────────────────────────── */
function useDebounce(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function ShopPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const q        = sp.get('q') || '';
  const category = sp.get('category') || '';
  const sort     = sp.get('sort') || 'newest';
  const urlMin   = sp.get('minPrice') || '';
  const urlMax   = sp.get('maxPrice') || '';

  const [cats, setCats]         = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);

  // Local price state — only hits API after user stops typing
  const [minPrice, setMinPrice] = useState(urlMin);
  const [maxPrice, setMaxPrice] = useState(urlMax);
  const dMin = useDebounce(minPrice, 600);
  const dMax = useDebounce(maxPrice, 600);

  // Keep track of whether debounced price differs from URL
  const priceRef = useRef({ min: urlMin, max: urlMax });

  /* ── URL helpers ──────────────────────────────────────────── */
  const push = (patch) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v == null) p.delete(k);
      else p.set(k, v);
    });
    p.delete('page');
    router.push(`/shop?${p.toString()}`, { scroll: false });
    setPage(1);
  };

  /* ── Sync price debounce → URL ────────────────────────────── */
  useEffect(() => {
    const prev = priceRef.current;
    if (dMin !== prev.min || dMax !== prev.max) {
      priceRef.current = { min: dMin, max: dMax };
      push({ minPrice: dMin, maxPrice: dMax });
    }
  }, [dMin, dMax]); // eslint-disable-line

  /* ── Sync URL price → local state (on browser back/fwd) ───── */
  useEffect(() => {
    setMinPrice(urlMin);
    setMaxPrice(urlMax);
    priceRef.current = { min: urlMin, max: urlMax };
  }, [urlMin, urlMax]);

  /* ── Load categories once ─────────────────────────────────── */
  useEffect(() => {
    API.categories({ active: true }).then(({ data }) => setCats(data.items || []));
  }, []);

  /* ── Fetch products ───────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    // Pass category _id when known (avoids slug→ID lookup on backend)
    const catObj = cats.find((c) => c.slug === category);
    const catParam = catObj?._id || category; // ID preferred, slug fallback
    API.products({ q, category: catParam, sort, minPrice: urlMin, maxPrice: urlMax, page, limit: 16 })
      .then(({ data }) => {
        setProducts(data.items || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [q, category, sort, urlMin, urlMax, page, cats]);

  /* ── Derived ──────────────────────────────────────────────── */
  const activeFilterCount = [category, urlMin, urlMax].filter(Boolean).length;
  const categoryName = cats.find((c) => c.slug === category)?.name;

  const clearAll = () => {
    push({ category: '', minPrice: '', maxPrice: '' });
    setMinPrice('');
    setMaxPrice('');
  };

  /* ── Pagination helpers ───────────────────────────────────── */
  const pageNums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1
  );

  return (
    <div className="container-x py-6 sm:py-10">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">
            {q ? `"${q}"` : categoryName || 'All Products'}
          </h1>
          <p className="text-ink-400 text-xs sm:text-sm mt-0.5">
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                Loading…
              </span>
            ) : (
              `${total} product${total !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden relative flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-900/10 text-sm font-medium hover:bg-ink-900/5 active:bg-ink-900/10 transition"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold grid place-items-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="field-wrap w-auto">
            <select
              value={sort}
              onChange={(e) => push({ sort: e.target.value })}
              className="field appearance-none text-sm pr-8 cursor-pointer min-w-[130px]"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low → High</option>
              <option value="priceDesc">Price: High → Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={14} className="icon-r pointer-events-none text-ink-400" />
          </div>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-brand-50 text-brand-700 font-medium px-3 py-1.5 rounded-full">
              <Tag size={11} />
              {categoryName}
              <button onClick={() => push({ category: '' })} className="ml-0.5 hover:text-brand-900">×</button>
            </span>
          )}
          {(urlMin || urlMax) && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-brand-50 text-brand-700 font-medium px-3 py-1.5 rounded-full">
              ₹{urlMin || '0'} – ₹{urlMax || '∞'}
              <button onClick={() => { push({ minPrice: '', maxPrice: '' }); setMinPrice(''); setMaxPrice(''); }} className="ml-0.5 hover:text-brand-900">×</button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs text-ink-400 hover:text-ink-700 px-2 py-1.5 underline underline-offset-2">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6 lg:gap-8">

        {/* ── Mobile filter drawer backdrop ─────────────────── */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* ── Sidebar / Filter drawer ───────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl
            flex flex-col transition-transform duration-300 ease-in-out
            lg:static lg:w-56 lg:shadow-none lg:z-auto lg:translate-x-0
            ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Drawer header (mobile only) */}
          <div className="flex items-center justify-between p-4 border-b border-ink-900/5 lg:hidden">
            <span className="font-bold text-base">Filters</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-ink-900/5 grid place-items-center"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable filter content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-6">

            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                ✕ Clear all filters
              </button>
            )}

            {/* Categories */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-2">Categories</p>
              <div className="space-y-0.5">
                <button
                  onClick={() => { push({ category: '' }); setDrawerOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    !category ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-700 hover:bg-ink-900/5'
                  }`}
                >
                  All Products
                </button>
                {cats.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => { push({ category: c.slug }); setDrawerOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                      category === c.slug ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-700 hover:bg-ink-900/5'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-ink-400 text-xs">{c.productCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-2">Price Range</p>
              <div className="space-y-2">
                <div className="field-wrap">
                  <span className="icon-l text-xs font-semibold text-ink-500 pointer-events-none">₹</span>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="field-il text-sm"
                    min={0}
                  />
                </div>
                <div className="field-wrap">
                  <span className="icon-l text-xs font-semibold text-ink-500 pointer-events-none">₹</span>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="field-il text-sm"
                    min={0}
                  />
                </div>
              </div>
              <p className="text-[11px] text-ink-400 mt-1.5">Results update automatically</p>
            </div>
          </div>

          {/* Mobile: Apply button */}
          <div className="p-4 border-t border-ink-900/5 lg:hidden">
            <button onClick={() => setDrawerOpen(false)} className="btn-primary w-full">
              Show {total} products
            </button>
          </div>
        </aside>

        {/* ── Product grid ──────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Skeleton (initial load only) */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-ink-900/[0.04] animate-pulse overflow-hidden">
                  <div className="aspect-square" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-2.5 bg-ink-900/[0.08] rounded-full w-1/3" />
                    <div className="h-3.5 bg-ink-900/[0.08] rounded-full w-4/5" />
                    <div className="h-3.5 bg-ink-900/[0.08] rounded-full w-3/5" />
                    <div className="h-5 bg-ink-900/[0.08] rounded-full w-2/5 mt-2" />
                    <div className="h-9 bg-ink-900/[0.08] rounded-xl mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-ink-900/5 grid place-items-center mb-4 text-ink-300">
                <Search size={26} />
              </div>
              <p className="font-semibold text-ink-700 text-lg">No products found</p>
              <p className="text-ink-400 text-sm mt-1 mb-6">
                {q ? `No results for "${q}"` : 'Try adjusting your filters'}
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="btn-outline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            /* Results — dim while re-fetching instead of full skeleton */
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {products.map((p, i) => (
                  <ProductCard key={p._id} product={p} priority={i < 4} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-8 flex-wrap">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-2 rounded-xl border border-ink-900/10 text-sm hover:bg-ink-900/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>

                  {pageNums.map((p, idx) => (
                    <div key={p} className="flex items-center gap-1.5">
                      {idx > 0 && pageNums[idx - 1] !== p - 1 && (
                        <span className="text-ink-400 text-sm px-1">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                          page === p ? 'bg-ink-900 text-white' : 'border border-ink-900/10 hover:bg-ink-900/5'
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  ))}

                  <button
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-2 rounded-xl border border-ink-900/10 text-sm hover:bg-ink-900/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
