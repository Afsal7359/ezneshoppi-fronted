'use client';
import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { API } from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('brand');

  useEffect(() => {
    API.settings().then(({ data }) => setS(data.settings));
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await API.updateSettings(s);
      setS(data.settings);
      toast.success('Settings saved');
    } catch (err) { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  if (!s) return <div>Loading…</div>;
  const set = (section, patch) => setS({ ...s, [section]: { ...(s[section] || {}), ...patch } });

  const tabs = [
    { k: 'brand', l: 'Brand' },
    { k: 'announcement', l: 'Announcement' },
    { k: 'hero', l: 'Hero Banner' },
    { k: 'contact', l: 'Contact' },
    { k: 'social', l: 'Social' },
    { k: 'footer', l: 'Footer' },
    { k: 'shipping', l: 'Shipping' },
    { k: 'tax', l: 'Tax' },
    { k: 'payment', l: 'Payment' },
    { k: 'seo', l: 'SEO' },
  ];

  return (
    <div>
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-ink-500 mt-1">Configure every aspect of your store.</p>
        </div>
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
        </button>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-ink-900/10">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ${tab === t.k ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-900'}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="card p-6 max-w-3xl">
        {tab === 'brand' && (
          <div className="space-y-4">
            <F label="Site Name"><input className="field" value={s.siteName || ''} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></F>
            <F label="Tagline"><input className="field" value={s.tagline || ''} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></F>

            <F label="Logo Image">
              <ImageUploader multiple={false} images={s.logo} onChange={(v) => setS({ ...s, logo: v })} />
            </F>

            <F label="Header / Footer Display">
              <p className="text-xs text-ink-500 mb-2">Choose what to show in the header and footer.</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'logo_name', l: '🖼️ Logo + Name', d: 'Show both logo image and site name text' },
                  { v: 'logo_only', l: '🖼️ Logo Only', d: 'Show only the logo image (requires logo)' },
                  { v: 'name_only', l: '🔤 Name Only', d: 'Show only the site name text' },
                ].map(({ v, l, d }) => (
                  <label
                    key={v}
                    className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition ${
                      (s.logoDisplayMode || 'logo_name') === v
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-ink-900/10 hover:border-ink-900/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="logoDisplayMode"
                      value={v}
                      checked={(s.logoDisplayMode || 'logo_name') === v}
                      onChange={() => setS({ ...s, logoDisplayMode: v })}
                      className="hidden"
                    />
                    <span className="font-medium text-sm">{l}</span>
                    <span className="text-xs text-ink-500">{d}</span>
                  </label>
                ))}
              </div>
            </F>

            <F label="Favicon"><ImageUploader multiple={false} images={s.favicon} onChange={(v) => setS({ ...s, favicon: v })} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Primary Color"><input type="color" className="field h-12" value={s.primaryColor || '#2563eb'} onChange={(e) => setS({ ...s, primaryColor: e.target.value })} /></F>
              <F label="Accent Color"><input type="color" className="field h-12" value={s.accentColor || '#f97316'} onChange={(e) => setS({ ...s, accentColor: e.target.value })} /></F>
            </div>
          </div>
        )}

        {tab === 'announcement' && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={s.announcement?.enabled ?? true}
                onChange={(e) => set('announcement', { enabled: e.target.checked })}
              />
              <span className="font-medium text-sm">Show Announcement Bar</span>
            </label>
            <F label="Announcement Text">
              <input
                className="field"
                value={s.announcement?.text || ''}
                onChange={(e) => set('announcement', { text: e.target.value })}
                placeholder="Free shipping on orders over ₹5999 • 2-day returns"
              />
            </F>
            <F label="Background Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-20 rounded-lg border border-ink-900/10 cursor-pointer"
                  value={s.announcement?.bgColor || '#000000'}
                  onChange={(e) => set('announcement', { bgColor: e.target.value })}
                />
                <input
                  className="field flex-1 font-mono text-sm"
                  value={s.announcement?.bgColor || '#000000'}
                  onChange={(e) => set('announcement', { bgColor: e.target.value })}
                  placeholder="#000000"
                />
              </div>
              {/* Preview */}
              <div
                className="mt-2 rounded-lg py-2 text-center text-xs text-white font-medium overflow-hidden"
                style={{ backgroundColor: s.announcement?.bgColor || '#000000' }}
              >
                ✦ &nbsp;{s.announcement?.text || 'Preview text here'}&nbsp; ✦
              </div>
            </F>
            <F label="Link (optional — wraps entire bar)">
              <input
                className="field"
                value={s.announcement?.link || ''}
                onChange={(e) => set('announcement', { link: e.target.value })}
                placeholder="e.g. /shop"
              />
            </F>
          </div>
        )}

        {tab === 'hero' && (
          <div className="space-y-4">
            <F label="Tag / Badge text">
              <input className="field" value={s.hero?.tag || ''} onChange={(e) => set('hero', { tag: e.target.value })} placeholder="Hot Deal in This Week" />
            </F>
            <F label="Title">
              <input className="field" value={s.hero?.title || ''} onChange={(e) => set('hero', { title: e.target.value })} placeholder="Main headline" />
            </F>
            <F label="Subtitle">
              <input className="field" value={s.hero?.subtitle || ''} onChange={(e) => set('hero', { subtitle: e.target.value })} placeholder="Supporting text" />
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Price Display (₹)">
                <input type="number" className="field" value={s.hero?.price || ''} onChange={(e) => set('hero', { price: +e.target.value })} />
              </F>
              <F label="Reviews Count">
                <input type="number" className="field" value={s.hero?.reviewsCount || ''} onChange={(e) => set('hero', { reviewsCount: +e.target.value })} />
              </F>
            </div>
            <F label="Rating (1–5)">
              <input type="number" min="1" max="5" step="0.1" className="field" value={s.hero?.rating || 4} onChange={(e) => set('hero', { rating: +e.target.value })} />
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Button Text">
                <input className="field" value={s.hero?.ctaText || ''} onChange={(e) => set('hero', { ctaText: e.target.value })} placeholder="Shop Now" />
              </F>
              <F label="Button Link">
                <input className="field" value={s.hero?.ctaLink || ''} onChange={(e) => set('hero', { ctaLink: e.target.value })} placeholder="/shop" />
              </F>
            </div>
            <F label="Hero Product Image">
              <ImageUploader multiple={false} images={s.hero?.image} onChange={(v) => set('hero', { image: v })} />
            </F>
          </div>
        )}

        {tab === 'contact' && (
          <div className="space-y-3">
            <F label="Email"><input type="email" className="field" value={s.contact?.email || ''} onChange={(e) => set('contact', { email: e.target.value })} /></F>
            <F label="Phone"><input className="field" value={s.contact?.phone || ''} onChange={(e) => set('contact', { phone: e.target.value })} /></F>
            <F label="Address"><textarea rows={3} className="field" value={s.contact?.address || ''} onChange={(e) => set('contact', { address: e.target.value })} /></F>
            <F label="Google Maps Embed URL"><input className="field" value={s.contact?.mapEmbed || ''} onChange={(e) => set('contact', { mapEmbed: e.target.value })} /></F>
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-3">
            {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin'].map((k) => (
              <F key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                <input className="field" placeholder={`https://`} value={s.social?.[k] || ''} onChange={(e) => set('social', { [k]: e.target.value })} />
              </F>
            ))}
            <F label="WhatsApp Number">
              <input
                className="field"
                placeholder="919876543210 (country code + number, no + or spaces)"
                value={s.social?.whatsapp || ''}
                onChange={(e) => set('social', { whatsapp: e.target.value })}
              />
              <p className="text-xs text-ink-400 mt-1">Include country code, e.g. 919876543210 for India +91</p>
            </F>
          </div>
        )}

        {tab === 'footer' && (
          <div className="space-y-3">
            <F label="About text"><textarea rows={3} className="field" value={s.footer?.about || ''} onChange={(e) => set('footer', { about: e.target.value })} /></F>
            <F label="Copyright"><input className="field" value={s.footer?.copyright || ''} onChange={(e) => set('footer', { copyright: e.target.value })} /></F>
            <div>
              <label className="label">Footer Columns</label>
              {(s.footer?.columns || []).map((col, ci) => (
                <div key={ci} className="card p-3 mb-2 bg-ink-900/[0.02]">
                  <div className="flex gap-2 mb-2">
                    <input placeholder="Column title" className="field" value={col.title} onChange={(e) => {
                      const cols = [...s.footer.columns];
                      cols[ci] = { ...col, title: e.target.value };
                      set('footer', { columns: cols });
                    }} />
                    <button type="button" onClick={() => {
                      const cols = s.footer.columns.filter((_, i) => i !== ci);
                      set('footer', { columns: cols });
                    }} className="p-2 text-red-500"><Trash2 size={14} /></button>
                  </div>
                  {(col.links || []).map((link, li) => (
                    <div key={li} className="flex gap-2 mb-1">
                      <input placeholder="Label" className="field" value={link.label} onChange={(e) => {
                        const cols = [...s.footer.columns];
                        const links = [...(col.links || [])];
                        links[li] = { ...link, label: e.target.value };
                        cols[ci] = { ...col, links };
                        set('footer', { columns: cols });
                      }} />
                      <input placeholder="URL" className="field" value={link.url} onChange={(e) => {
                        const cols = [...s.footer.columns];
                        const links = [...(col.links || [])];
                        links[li] = { ...link, url: e.target.value };
                        cols[ci] = { ...col, links };
                        set('footer', { columns: cols });
                      }} />
                      <button type="button" onClick={() => {
                        const cols = [...s.footer.columns];
                        cols[ci] = { ...col, links: col.links.filter((_, i) => i !== li) };
                        set('footer', { columns: cols });
                      }} className="p-2 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const cols = [...s.footer.columns];
                    cols[ci] = { ...col, links: [...(col.links || []), { label: '', url: '' }] };
                    set('footer', { columns: cols });
                  }} className="btn-outline text-xs mt-1"><Plus size={12} /> Add link</button>
                </div>
              ))}
              <button type="button" onClick={() => {
                set('footer', { columns: [...(s.footer?.columns || []), { title: 'New', links: [] }] });
              }} className="btn-outline text-sm"><Plus size={14} /> Add column</button>
            </div>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="space-y-3">
            <F label="Free Shipping Threshold ₹"><input type="number" className="field" value={s.shipping?.freeShippingThreshold || 0} onChange={(e) => set('shipping', { freeShippingThreshold: +e.target.value })} /></F>
            <F label="Flat Shipping Rate ₹"><input type="number" className="field" value={s.shipping?.flatRate || 0} onChange={(e) => set('shipping', { flatRate: +e.target.value })} /></F>
            <F label="COD Charge ₹"><input type="number" className="field" value={s.shipping?.codCharge || 0} onChange={(e) => set('shipping', { codCharge: +e.target.value })} /></F>
          </div>
        )}

        {tab === 'tax' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={s.tax?.enabled} onChange={(e) => set('tax', { enabled: e.target.checked })} /> Enable Tax</label>
            <F label="Label"><input className="field" value={s.tax?.label || 'GST'} onChange={(e) => set('tax', { label: e.target.value })} /></F>
            <F label="Percent %"><input type="number" className="field" value={s.tax?.percent || 0} onChange={(e) => set('tax', { percent: +e.target.value })} /></F>
          </div>
        )}

        {tab === 'payment' && (
          <div className="space-y-4">
            <p className="text-xs text-ink-500 mb-1">Enable the payment methods you want to offer at checkout. At least one should be active.</p>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-ink-900/10 cursor-pointer hover:bg-ink-900/[0.02]">
              <input type="checkbox" checked={s.payment?.razorpayEnabled ?? true} onChange={(e) => set('payment', { razorpayEnabled: e.target.checked })} />
              <div>
                <p className="font-medium text-sm">Razorpay</p>
                <p className="text-xs text-ink-400">Credit/Debit Card, UPI, Net Banking, Wallets</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-ink-900/10 cursor-pointer hover:bg-ink-900/[0.02]">
              <input type="checkbox" checked={s.payment?.codEnabled ?? true} onChange={(e) => set('payment', { codEnabled: e.target.checked })} />
              <div>
                <p className="font-medium text-sm">Cash on Delivery</p>
                <p className="text-xs text-ink-400">Customer pays when they receive the order</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-ink-900/10 cursor-pointer hover:bg-ink-900/[0.02]">
              <input type="checkbox" checked={s.payment?.whatsappEnabled ?? false} onChange={(e) => set('payment', { whatsappEnabled: e.target.checked })} />
              <div>
                <p className="font-medium text-sm">WhatsApp Order</p>
                <p className="text-xs text-ink-400">Order details sent to your WhatsApp number (configure number in Social tab)</p>
              </div>
            </label>
            <div className="h-px bg-ink-900/10" />
            <div className="grid grid-cols-2 gap-3">
              <F label="Currency"><input className="field" value={s.payment?.currency || 'INR'} onChange={(e) => set('payment', { currency: e.target.value })} /></F>
              <F label="Currency Symbol"><input className="field" value={s.payment?.currencySymbol || '₹'} onChange={(e) => set('payment', { currencySymbol: e.target.value })} /></F>
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="space-y-3">
            <F label="Meta Title"><input className="field" value={s.seo?.metaTitle || ''} onChange={(e) => set('seo', { metaTitle: e.target.value })} /></F>
            <F label="Meta Description"><textarea rows={3} className="field" value={s.seo?.metaDescription || ''} onChange={(e) => set('seo', { metaDescription: e.target.value })} /></F>
            <F label="Keywords (comma-separated)"><input className="field" value={(s.seo?.metaKeywords || []).join(', ')} onChange={(e) => set('seo', { metaKeywords: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} /></F>
            <F label="Open Graph Image"><ImageUploader multiple={false} images={s.seo?.ogImage} onChange={(v) => set('seo', { ogImage: v })} /></F>
          </div>
        )}
      </div>
    </div>
  );
}

function F({ label, children }) {
  return <div><label className="label">{label}</label>{children}</div>;
}
