import Link from 'next/link';
import { Truck, Clock, MapPin, Package, Shield } from 'lucide-react';
import { serverFetch } from '@/lib/server-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getSettings() {
  const data = await serverFetch(`${API_URL}/api/settings`, { next: { revalidate: 3600 } });
  return data?.settings || {};
}

export const metadata = { title: 'Shipping Policy' };

export default async function ShippingPage() {
  const s = await getSettings();
  const siteName = s.siteName || 'ezoneshoppi';
  const freeThreshold = s.shipping?.freeShippingThreshold || 999;
  const email = s.contact?.email || 'support@ezoneshoppi.com';

  const zones = [
    { zone: 'Metro Cities', cities: 'Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune', time: '1–2 business days' },
    { zone: 'Tier 2 Cities', cities: 'Jaipur, Lucknow, Surat, Ahmedabad, Kochi, Chandigarh', time: '2–4 business days' },
    { zone: 'Rest of India', cities: 'All other serviceable pin codes', time: '3–6 business days' },
    { zone: 'Remote Areas', cities: 'Northeast, J&K, Andaman & Nicobar, Lakshadweep', time: '5–10 business days' },
  ];

  return (
    <div className="container-x py-12 sm:py-16">
      <Link href="/" className="text-sm text-brand-600 mb-6 inline-block">← Home</Link>

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-4">
          <Truck size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Shipping Policy</h1>
        <p className="text-ink-500 max-w-xl mx-auto">
          Fast, reliable delivery across India. Free shipping on orders above ₹{freeThreshold}.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {[
          { icon: Package, title: 'Free Shipping', desc: `On all orders above ₹${freeThreshold}` },
          { icon: Clock, title: 'Same-Day Dispatch', desc: 'Orders placed before 3 PM on weekdays' },
          { icon: Shield, title: 'Insured Delivery', desc: 'All shipments are fully insured' },
          { icon: MapPin, title: 'Pan India', desc: `We deliver to 25,000+ pin codes` },
        ].map((item, i) => (
          <div key={i} className="card p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-3">
              <item.icon size={22} />
            </div>
            <h3 className="font-bold mb-1">{item.title}</h3>
            <p className="text-sm text-ink-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Shipping rates */}
      <div className="card p-6 mb-8">
        <h2 className="font-bold text-xl mb-4">Shipping Rates</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
            <div>
              <p className="font-semibold text-green-800">Free Shipping</p>
              <p className="text-sm text-green-700">Orders above ₹{freeThreshold}</p>
            </div>
            <span className="text-2xl font-black text-green-600">₹0</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-ink-900/[0.03] border border-ink-900/10">
            <div>
              <p className="font-semibold">Standard Shipping</p>
              <p className="text-sm text-ink-500">Orders below ₹{freeThreshold}</p>
            </div>
            <span className="text-2xl font-black">₹49</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-ink-900/[0.03] border border-ink-900/10">
            <div>
              <p className="font-semibold">Express Shipping</p>
              <p className="text-sm text-ink-500">Priority handling + faster delivery</p>
            </div>
            <span className="text-2xl font-black">₹99</span>
          </div>
        </div>
      </div>

      {/* Delivery zones */}
      <div className="card p-6 mb-8">
        <h2 className="font-bold text-xl mb-4">Estimated Delivery Times</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10">
                <th className="text-left py-3 pr-4 font-semibold">Zone</th>
                <th className="text-left py-3 pr-4 font-semibold text-ink-500">Includes</th>
                <th className="text-left py-3 font-semibold">Delivery Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {zones.map((z, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 font-medium">{z.zone}</td>
                  <td className="py-3 pr-4 text-ink-500">{z.cities}</td>
                  <td className="py-3 font-semibold text-brand-700">{z.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink-400 mt-3">* Delivery times are estimates and may vary due to external factors such as weather, holidays, or carrier delays.</p>
      </div>

      {/* FAQ */}
      <div className="card p-6 mb-10">
        <h2 className="font-bold text-xl mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I track my order?', a: 'Yes! Once your order is shipped, you will receive a tracking link via email and SMS.' },
            { q: 'What if my order is delayed?', a: 'If your order hasn\'t arrived within the estimated time, please contact our support team and we\'ll investigate immediately.' },
            { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. International shipping is coming soon.' },
            { q: 'What happens if an item is damaged during shipping?', a: 'All our shipments are insured. If you receive a damaged item, please contact us within 48 hours with photos and we will arrange a replacement or refund.' },
          ].map((item, i) => (
            <div key={i} className="border-b border-ink-900/5 last:border-0 pb-4 last:pb-0">
              <p className="font-semibold mb-1">{item.q}</p>
              <p className="text-sm text-ink-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="text-center">
        <p className="text-ink-500 text-sm mb-3">Have a shipping question? We're here to help.</p>
        <a href={`mailto:${email}`} className="btn-primary inline-flex">Contact Support</a>
      </div>

      <div className="mt-10 pt-8 border-t border-ink-900/10 flex flex-wrap gap-4 text-sm text-ink-500">
        <Link href="/returns" className="hover:text-brand-600 transition">Returns Policy</Link>
        <Link href="/privacy" className="hover:text-brand-600 transition">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-brand-600 transition">Terms of Service</Link>
        <Link href="/contact" className="hover:text-brand-600 transition">Contact Us</Link>
      </div>
    </div>
  );
}
