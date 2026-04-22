import Link from 'next/link';
import { RotateCcw, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';
import { serverFetch } from '@/lib/server-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getSettings() {
  const data = await serverFetch(`${API_URL}/api/settings`, { next: { revalidate: 3600 } });
  return data?.settings || {};
}

export const metadata = { title: 'Returns & Refunds' };

export default async function ReturnsPage() {
  const s = await getSettings();
  const siteName = s.siteName || 'ezoneshoppi';
  const email = s.contact?.email || 'support@ezoneshoppi.com';
  const phone = s.contact?.phone;

  const steps = [
    { n: '01', title: 'Initiate Return', desc: 'Contact us within 30 days of delivery via email or phone with your order number.' },
    { n: '02', title: 'Get Approval', desc: 'Our team will review your request and send you a return authorization within 24 hours.' },
    { n: '03', title: 'Ship the Item', desc: 'Pack the item securely in its original packaging and ship it to our return address.' },
    { n: '04', title: 'Receive Refund', desc: 'Once we receive and inspect the item, your refund will be processed within 5–7 business days.' },
  ];

  const eligible = [
    'Item received damaged or defective',
    'Wrong item delivered',
    'Item not as described on the product page',
    'Unused item in original packaging within 30 days',
  ];

  const notEligible = [
    'Items showing signs of use or wear',
    'Items without original packaging',
    'Customized or personalized products',
    'Consumable accessories (earbuds, cables used with sweat)',
    'Returns requested after 30 days',
  ];

  return (
    <div className="container-x py-12 sm:py-16">
      <Link href="/" className="text-sm text-brand-600 mb-6 inline-block">← Home</Link>

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-4">
          <RotateCcw size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Returns & Refunds</h1>
        <p className="text-ink-500 max-w-xl mx-auto">
          We want you to be completely satisfied with your purchase. If something isn't right, we'll make it right.
        </p>
      </div>

      {/* Steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {steps.map((step) => (
          <div key={step.n} className="card p-5">
            <span className="text-3xl font-black text-brand-100 leading-none">{step.n}</span>
            <h3 className="font-bold mt-2 mb-1">{step.title}</h3>
            <p className="text-sm text-ink-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Eligibility */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={20} className="text-green-600" />
            <h2 className="font-bold text-lg">Eligible for Return</h2>
          </div>
          <ul className="space-y-2.5">
            {eligible.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle size={20} className="text-red-500" />
            <h2 className="font-bold text-lg">Not Eligible for Return</h2>
          </div>
          <ul className="space-y-2.5">
            {notEligible.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Refund info */}
      <div className="card p-6 mb-10 bg-brand-50/50 border border-brand-100">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-brand-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-lg mb-2">Refund Timelines</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-ink-900">UPI / Wallet</p>
                <p className="text-ink-500">1–3 business days</p>
              </div>
              <div>
                <p className="font-semibold text-ink-900">Debit / Credit Card</p>
                <p className="text-ink-500">5–7 business days</p>
              </div>
              <div>
                <p className="font-semibold text-ink-900">Net Banking</p>
                <p className="text-ink-500">3–5 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-6 text-center">
        <h2 className="font-bold text-xl mb-2">Need Help?</h2>
        <p className="text-ink-500 text-sm mb-4">Contact our support team to initiate a return or get answers to your questions.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`mailto:${email}`} className="btn-primary">
            Email Support
          </a>
          {phone && (
            <a href={`tel:${phone}`} className="btn-ghost">
              <Phone size={15} /> {phone}
            </a>
          )}
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-ink-900/10 flex flex-wrap gap-4 text-sm text-ink-500">
        <Link href="/shipping" className="hover:text-brand-600 transition">Shipping Policy</Link>
        <Link href="/privacy" className="hover:text-brand-600 transition">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-brand-600 transition">Terms of Service</Link>
        <Link href="/contact" className="hover:text-brand-600 transition">Contact Us</Link>
      </div>
    </div>
  );
}
