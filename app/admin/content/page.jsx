'use client';
import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { API } from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';
import toast from 'react-hot-toast';

export default function AdminContent() {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.settings().then(({ data }) => setS(data.settings));
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await API.updateSettings(s);
      setS(data.settings);
      toast.success('Homepage content updated');
    } catch (err) { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  if (!s) return <div>Loading…</div>;
  const set = (section, patch) => setS({ ...s, [section]: { ...(s[section] || {}), ...patch } });

  return (
    <div>
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Homepage Content</h1>
          <p className="text-ink-500 mt-1">Edit every section of your homepage.</p>
        </div>
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* HERO */}
        <Section title="Hero Section">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Tag / Badge">
              <input className="field" value={s.hero?.tag || ''} onChange={(e) => set('hero', { tag: e.target.value })} />
            </Field>
            <Field label="CTA Text">
              <input className="field" value={s.hero?.ctaText || ''} onChange={(e) => set('hero', { ctaText: e.target.value })} />
            </Field>
            <Field label="Title" full>
              <input className="field" value={s.hero?.title || ''} onChange={(e) => set('hero', { title: e.target.value })} />
            </Field>
            <Field label="Subtitle" full>
              <input className="field" value={s.hero?.subtitle || ''} onChange={(e) => set('hero', { subtitle: e.target.value })} />
            </Field>
            <Field label="Price Badge">
              <input type="number" className="field" value={s.hero?.price || 0} onChange={(e) => set('hero', { price: +e.target.value })} />
            </Field>
            <Field label="CTA Link">
              <input className="field" value={s.hero?.ctaLink || ''} onChange={(e) => set('hero', { ctaLink: e.target.value })} />
            </Field>
            <Field label="Rating (1-5)">
              <input type="number" max={5} min={1} className="field" value={s.hero?.rating || 4} onChange={(e) => set('hero', { rating: +e.target.value })} />
            </Field>
            <Field label="Reviews Count">
              <input type="number" className="field" value={s.hero?.reviewsCount || 0} onChange={(e) => set('hero', { reviewsCount: +e.target.value })} />
            </Field>
            <Field label="Hero Image" full>
              <ImageUploader multiple={false} images={s.hero?.image || ''} onChange={(v) => set('hero', { image: v })} />
            </Field>
          </div>
        </Section>

        {/* DEAL BANNER */}
        <Section title="Countdown Deal Banner">
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={s.dealBanner?.enabled} onChange={(e) => set('dealBanner', { enabled: e.target.checked })} />
            Show deal banner on homepage
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Tag"><input className="field" value={s.dealBanner?.tag || ''} onChange={(e) => set('dealBanner', { tag: e.target.value })} /></Field>
            <Field label="CTA Text"><input className="field" value={s.dealBanner?.ctaText || ''} onChange={(e) => set('dealBanner', { ctaText: e.target.value })} /></Field>
            <Field label="Title" full><input className="field" value={s.dealBanner?.title || ''} onChange={(e) => set('dealBanner', { title: e.target.value })} /></Field>
            <Field label="Ends At"><input type="datetime-local" className="field" value={s.dealBanner?.endsAt ? new Date(s.dealBanner.endsAt).toISOString().slice(0, 16) : ''} onChange={(e) => set('dealBanner', { endsAt: e.target.value })} /></Field>
            <Field label="CTA Link"><input className="field" value={s.dealBanner?.ctaLink || ''} onChange={(e) => set('dealBanner', { ctaLink: e.target.value })} /></Field>
            <Field label="Image" full>
              <ImageUploader multiple={false} images={s.dealBanner?.image || ''} onChange={(v) => set('dealBanner', { image: v })} />
            </Field>
          </div>
        </Section>

        {/* ANNOUNCEMENT */}
        <Section title="Top Announcement Bar">
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={s.announcement?.enabled} onChange={(e) => set('announcement', { enabled: e.target.checked })} />
            Show announcement bar
          </label>
          <Field label="Text">
            <input className="field" value={s.announcement?.text || ''} onChange={(e) => set('announcement', { text: e.target.value })} />
          </Field>
        </Section>

        {/* HOMEPAGE TOGGLES */}
        <Section title="Homepage Sections">
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { k: 'showCategories', l: 'Categories Grid' },
              { k: 'showDealBanner', l: 'Deal Banner' },
              { k: 'showFeatured', l: 'Featured Products' },
              { k: 'showNewArrivals', l: 'New Arrivals' },
              { k: 'showBestSellers', l: 'Best Sellers' },
              { k: 'showBlog', l: 'Blog Section' },
              { k: 'showNewsletter', l: 'Newsletter CTA' },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2 p-3 rounded-xl bg-ink-900/[0.03] cursor-pointer">
                <input type="checkbox" checked={s.homepage?.[k] !== false} onChange={(e) => set('homepage', { [k]: e.target.checked })} />
                {l}
              </label>
            ))}
          </div>
        </Section>

        {/* ABOUT PAGE */}
        <Section title="About Page">
          <p className="text-sm text-ink-500 mb-4">This content appears on the /about page.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Hero Title" full>
              <input className="field" value={s.about?.heroTitle || ''} onChange={(e) => set('about', { heroTitle: e.target.value })} placeholder="Our Story" />
            </Field>
            <Field label="Hero Subtitle" full>
              <input className="field" value={s.about?.heroSubtitle || ''} onChange={(e) => set('about', { heroSubtitle: e.target.value })} placeholder="What makes us different..." />
            </Field>
            <Field label="Mission Title" full>
              <input className="field" value={s.about?.missionTitle || ''} onChange={(e) => set('about', { missionTitle: e.target.value })} placeholder="Electronics for Everyone" />
            </Field>
            <Field label="Mission Content" full>
              <textarea rows={3} className="field" value={s.about?.missionContent || ''} onChange={(e) => set('about', { missionContent: e.target.value })} placeholder="Describe your company mission..." />
            </Field>
            <div className="sm:col-span-2">
              <p className="label mb-2">Stats (shown as 4 highlight cards)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { vk: 'stat1Value', lk: 'stat1Label', vd: '50,000+', ld: 'Happy Customers' },
                  { vk: 'stat2Value', lk: 'stat2Label', vd: '200+', ld: 'Cities Served' },
                  { vk: 'stat3Value', lk: 'stat3Label', vd: '4.9/5', ld: 'Avg. Rating' },
                  { vk: 'stat4Value', lk: 'stat4Label', vd: '99%', ld: 'Satisfaction' },
                ].map(({ vk, lk, vd, ld }) => (
                  <div key={vk} className="card p-3 bg-ink-900/[0.02] space-y-2">
                    <input className="field text-sm font-bold" placeholder={vd} value={s.about?.[vk] || ''} onChange={(e) => set('about', { [vk]: e.target.value })} />
                    <input className="field text-xs" placeholder={ld} value={s.about?.[lk] || ''} onChange={(e) => set('about', { [lk]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* CONTACT PAGE */}
        <Section title="Contact Page">
          <p className="text-sm text-ink-500 mb-4">
            Contact info (email, phone, address) is managed under <strong>Settings → Contact</strong>. The map embed URL can also be set there.
          </p>
          <div className="bg-brand-50 text-brand-700 rounded-xl p-4 text-sm flex items-start gap-2">
            <span>📍</span>
            <span>Go to <strong>Settings → Contact</strong> tab to edit email, phone, address, and map embed URL. These automatically appear on the contact page.</span>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-4 card p-4 mt-6 flex justify-end max-w-4xl">
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Changes
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card p-6">
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
