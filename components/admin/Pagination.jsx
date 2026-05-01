export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  const getRange = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4)    return [1, 2, 3, 4, 5, '…', pages];
    if (page >= pages - 3) return [1, '…', pages-4, pages-3, pages-2, pages-1, pages];
    return [1, '…', page - 1, page, page + 1, '…', pages];
  };

  return (
    <div className="flex justify-center gap-2 mt-6 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-ink-900/10 disabled:opacity-40 hover:bg-ink-50">
        ← Prev
      </button>
      {getRange().map((pg, i) =>
        pg === '…' ? (
          <span key={`e${i}`} className="w-9 h-9 grid place-items-center text-sm text-ink-400">…</span>
        ) : (
          <button key={pg} onClick={() => onChange(pg)}
            className={`w-9 h-9 rounded-full text-sm transition ${page === pg ? 'bg-ink-900 text-white' : 'bg-white border border-ink-900/10 hover:bg-ink-50'}`}>
            {pg}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        className="px-3 py-1.5 rounded-lg text-sm border border-ink-900/10 disabled:opacity-40 hover:bg-ink-50">
        Next →
      </button>
    </div>
  );
}
