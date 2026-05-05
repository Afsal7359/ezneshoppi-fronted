export const formatPrice = (n, symbol = '₹') =>
  `${symbol}${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const loadScript = (src) =>
  new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export const formatVariant = (variant) => {
  if (!variant || typeof variant !== 'object') return null;
  const entries = Object.entries(variant).filter(([, v]) => v);
  if (!entries.length) return null;
  return entries.map(([k, v]) => `${k}: ${v}`).join(' · ');
};

export const relativeTime = (date) => {
  const d = new Date(date);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleDateString();
};
