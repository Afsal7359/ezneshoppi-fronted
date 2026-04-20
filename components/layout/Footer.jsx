'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { API } from '@/lib/api';

export default function Footer({ settings: initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    API.settings()
      .then(({ data }) => { if (data.settings) setSettings(data.settings); })
      .catch(() => {});
  }, []);

  const s = settings || {};
  const f = s.footer || {};
  const social = s.social || {};
  const siteName = s.siteName || 'ezoneshoppi';
  const displayMode = s.logoDisplayMode || 'logo_name';
  const showLogo = (displayMode === 'logo_name' || displayMode === 'logo_only') && !!s.logo;
  const showName = displayMode === 'logo_name' || displayMode === 'name_only' || !s.logo;

  return (
    <footer className="bg-ink-900 text-ink-400 mt-16 sm:mt-24">
      <div className="container-x py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Company info */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {showLogo ? (
                <div className="w-9 h-9 relative rounded-xl overflow-hidden bg-white/10">
                  <Image src={s.logo} alt={siteName} fill className="object-contain p-0.5" sizes="36px" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold text-sm shrink-0">
                  {siteName[0]?.toUpperCase()}
                </div>
              )}
              {showName && <span className="text-xl font-bold text-white">{siteName}</span>}
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-sm">{f.about}</p>
            <div className="space-y-2 text-sm">
              {s.contact?.email && (
                <a href={`mailto:${s.contact.email}`} className="flex items-center gap-2 hover:text-white transition">
                  <Mail size={14} className="shrink-0" /> {s.contact.email}
                </a>
              )}
              {s.contact?.phone && (
                <a href={`tel:${s.contact.phone}`} className="flex items-center gap-2 hover:text-white transition">
                  <Phone size={14} className="shrink-0" /> {s.contact.phone}
                </a>
              )}
              {s.contact?.address && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-1 shrink-0" /> <span>{s.contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer columns from settings */}
          {(f.columns || []).map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {(col.links || []).map((l, j) => (
                  <li key={j}>
                    <Link href={l.url || '#'} className="hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter + social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-3">Get exclusive deals.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 outline-none focus:border-brand-400 focus:bg-white/15 transition-all"
              />
              <button type="submit" className="px-3 py-2 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 shrink-0 transition">
                →
              </button>
            </form>
            {(social.facebook || social.instagram || social.twitter || social.youtube) && (
              <div className="flex flex-wrap gap-2 mt-5">
                {social.facebook && (
                  <a href={social.facebook} aria-label="Facebook" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <Facebook size={16} />
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} aria-label="Instagram" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <Instagram size={16} />
                  </a>
                )}
                {social.twitter && (
                  <a href={social.twitter} aria-label="Twitter" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <Twitter size={16} />
                  </a>
                )}
                {social.youtube && (
                  <a href={social.youtube} aria-label="YouTube" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <Youtube size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 sm:mt-16 pt-6 border-t border-white/10 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{f.copyright || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
