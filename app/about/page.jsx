import Link from 'next/link';
import { Award, Truck, Users, Heart, Mail, Phone, MapPin, ShoppingBag, Star, Shield } from 'lucide-react';
import { serverFetch } from '@/lib/server-fetch';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getSettings() {
  const data = await serverFetch(`${API_URL}/api/settings`, { cache: 'no-store' });
  return data?.settings || null;
}

export const metadata = { title: 'About Us' };

export default async function AboutPage() {
  const settings = await getSettings();
  const s = settings || {};
  const contact = s.contact || {};
  const about = s.about || {};

  const stats = [
    { icon: Users, value: about.stat1Value || '50,000+', label: about.stat1Label || 'Happy Customers' },
    { icon: Truck, value: about.stat2Value || '200+', label: about.stat2Label || 'Cities Served' },
    { icon: Award, value: about.stat3Value || '4.9/5', label: about.stat3Label || 'Avg. Rating' },
    { icon: Heart, value: about.stat4Value || '99%', label: about.stat4Label || 'Satisfaction' },
  ];

  const values = [
    { icon: ShoppingBag, title: 'Curated Selection', desc: 'Every product is hand-picked by our team of tech enthusiasts for quality and value.' },
    { icon: Shield, title: 'Trusted Quality', desc: 'All products come with warranty coverage and 30-day hassle-free returns.' },
    { icon: Star, title: 'Customer First', desc: 'Our support team is always here to help you find the right product.' },
    { icon: Truck, title: 'Fast Delivery', desc: `Free shipping on orders above ₹${s.shipping?.freeShippingThreshold || 999}. Same-day dispatch before 3 PM.` },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-peach-50 via-peach-100 to-white py-14 sm:py-20">
        <div className="container-x text-center">
          <span className="chip bg-brand-100 text-brand-700 mb-4">About {s.siteName || 'ezoneshoppi'}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mt-2">
            {about.heroTitle || 'Our Story'}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            {about.heroSubtitle || s.tagline || `${s.siteName || 'ezoneshoppi'} is built on a simple idea: premium electronics should be accessible to everyone — without the premium hassle.`}
          </p>
          <Link href="/shop" className="btn-dark mt-8 inline-flex">
            <ShoppingBag size={17} /> Shop Now
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="container-x py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((x, i) => (
            <div key={i} className="card p-5 sm:p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-3">
                <x.icon size={22} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{x.value}</p>
              <p className="text-xs sm:text-sm text-ink-500 mt-1">{x.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-ink-900/[0.02] py-12 sm:py-16">
        <div className="container-x">
          <div className="text-center mb-10">
            <span className="text-brand-600 text-sm font-semibold">Why Choose Us</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">
              Why {s.siteName || 'ezoneshoppi'}?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <div key={i} className="card p-5 sm:p-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mb-4">
                  <v.icon size={22} />
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container-x py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <span className="text-brand-600 text-sm font-semibold">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 mt-2">
              {about.missionTitle || 'Electronics for Everyone'}
            </h2>
            <p className="text-ink-700 leading-relaxed">
              {about.missionContent || 'From wireless headphones to cutting-edge laptops, every product we stock is hand-picked for quality. Our team of tech enthusiasts tests each device before it reaches our catalog — so you can shop with confidence.'}
            </p>
            {!about.missionContent && (
              <p className="text-ink-700 leading-relaxed mt-4">
                Fast shipping, honest prices, and a 30-day return policy. That's our promise to you.
              </p>
            )}
            <Link href="/shop" className="btn-primary mt-6 inline-flex">
              Browse Products
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-100 to-peach-100 flex items-center justify-center p-8">
              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { label: 'Products', value: '1,000+', color: 'from-brand-500 to-brand-700' },
                  { label: 'Brands', value: '50+', color: 'from-purple-500 to-purple-700' },
                  { label: 'Orders', value: '10K+', color: 'from-amber-400 to-orange-500' },
                  { label: 'Rating', value: '4.9★', color: 'from-green-500 to-green-700' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl bg-gradient-to-br ${item.color} p-4 text-white text-center shadow-lg`}>
                    <p className="text-xl font-extrabold">{item.value}</p>
                    <p className="text-xs opacity-80 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact info strip */}
      {(contact.email || contact.phone || contact.address) && (
        <section className="bg-ink-900 text-white py-12 sm:py-16">
          <div className="container-x text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Get In Touch</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-10">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-white/70 hover:text-white transition justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <span className="text-sm">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-white/70 hover:text-white transition justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <span className="text-sm">{contact.phone}</span>
                </a>
              )}
              {contact.address && (
                <div className="flex items-start gap-3 text-white/70 justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <span className="text-sm text-left">{contact.address}</span>
                </div>
              )}
            </div>
            <Link href="/contact" className="btn-primary mt-8 inline-flex">
              Contact Us
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
