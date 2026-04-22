import Link from 'next/link';
import { serverFetch } from '@/lib/server-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getSettings() {
  const data = await serverFetch(`${API_URL}/api/settings`, { next: { revalidate: 3600 } });
  return data?.settings || {};
}

export const metadata = { title: 'FAQ' };

const faqs = [
  {
    category: 'Orders & Payment',
    items: [
      { q: 'How do I place an order?', a: 'Browse our shop, add items to your cart, and proceed to checkout. You can pay via UPI, debit/credit card, or net banking.' },
      { q: 'Can I modify or cancel my order after placing it?', a: 'Orders can be cancelled within 1 hour of placement. After that, the order may already be dispatched. Contact our support team immediately.' },
      { q: 'What payment methods do you accept?', a: 'We accept UPI, all major credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular wallets.' },
      { q: 'Is it safe to save my card details?', a: 'Yes. We use industry-standard SSL encryption and do not store your full card details on our servers.' },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Metro cities: 1–2 days. Tier 2 cities: 2–4 days. Rest of India: 3–6 days. Express delivery is available at checkout.' },
      { q: 'How can I track my order?', a: 'Once shipped, you will receive a tracking link via email and SMS. You can also track from your account under My Orders.' },
      { q: 'Is there free shipping?', a: 'Yes! All orders above ₹999 get free standard shipping. Orders below ₹999 have a flat ₹49 shipping charge.' },
      { q: 'Do you deliver on weekends?', a: 'Our delivery partners deliver on Saturdays. Sunday delivery is available in select metro cities.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery for unused items in original packaging. See our Returns Policy for details.' },
      { q: 'How long does a refund take?', a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item.' },
      { q: 'What if I received a damaged or wrong item?', a: 'Contact us within 48 hours with photos of the item. We will arrange a free replacement or full refund immediately.' },
      { q: 'Who pays for return shipping?', a: 'If the return is due to our error (wrong/damaged item), we cover the shipping cost. For change-of-mind returns, shipping is the customer\'s responsibility.' },
    ],
  },
  {
    category: 'Products & Warranty',
    items: [
      { q: 'Are all products genuine?', a: 'Absolutely. We source all products directly from authorized distributors and manufacturers. Every product is 100% genuine.' },
      { q: 'Do products come with a warranty?', a: 'Yes, all electronics come with the manufacturer\'s warranty (typically 1–2 years). Warranty details are mentioned on each product page.' },
      { q: 'How do I claim a warranty?', a: 'Contact us with your order details and proof of defect. We will guide you through the manufacturer\'s warranty claim process.' },
      { q: 'Can I get a product demo or more details?', a: 'Our support team is happy to answer any product questions. Reach out via email, phone, or the contact form.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'Do I need an account to order?', a: 'You need an account to place orders. Creating one is free and takes less than a minute.' },
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page and we\'ll send a reset link to your registered email.' },
      { q: 'Can I have multiple delivery addresses?', a: 'Yes. You can save multiple addresses in your account under Address Book and choose one at checkout.' },
    ],
  },
];

export default async function FaqPage() {
  const s = await getSettings();
  const email = s.contact?.email || 'support@ezoneshoppi.com';

  return (
    <div className="container-x py-12 sm:py-16 max-w-4xl">
      <Link href="/" className="text-sm text-brand-600 mb-6 inline-block">← Home</Link>

      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Frequently Asked Questions</h1>
        <p className="text-ink-500 max-w-xl mx-auto">
          Everything you need to know about orders, shipping, returns, and more.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-bold mb-4 text-brand-700 border-b border-brand-100 pb-2">{section.category}</h2>
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <details key={i} className="card group">
                  <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none font-semibold text-ink-900 hover:text-brand-700 transition select-none">
                    {item.q}
                    <span className="shrink-0 ml-4 w-6 h-6 rounded-full bg-ink-900/[0.05] grid place-items-center text-ink-500 group-open:rotate-180 transition-transform duration-200 text-xs">
                      ▾
                    </span>
                  </summary>
                  <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-ink-600 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-12 card p-6 sm:p-8 text-center bg-gradient-to-br from-brand-50 to-peach-50 border border-brand-100">
        <h2 className="font-bold text-xl mb-2">Still have questions?</h2>
        <p className="text-ink-500 text-sm mb-5">Our support team is available Monday–Saturday, 9 AM – 6 PM.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/contact" className="btn-primary">Contact Us</Link>
          <a href={`mailto:${email}`} className="btn-ghost">{email}</a>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-ink-900/10 flex flex-wrap gap-4 text-sm text-ink-500">
        <Link href="/returns" className="hover:text-brand-600 transition">Returns Policy</Link>
        <Link href="/shipping" className="hover:text-brand-600 transition">Shipping Policy</Link>
        <Link href="/privacy" className="hover:text-brand-600 transition">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-brand-600 transition">Terms of Service</Link>
      </div>
    </div>
  );
}
