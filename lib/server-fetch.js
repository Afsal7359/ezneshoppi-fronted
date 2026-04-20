/**
 * Server-side fetch with a hard timeout.
 * Prevents static page generation from hanging when the backend is unreachable
 * (e.g. during `next build` on Vercel before the API server is live).
 */
export async function serverFetch(url, opts = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null; // network error, timeout, or bad response — render with empty data
  } finally {
    clearTimeout(tid);
  }
}
