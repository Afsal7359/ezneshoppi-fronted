import Link from 'next/link';
import { serverFetch } from '@/lib/server-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getSettings() {
  const data = await serverFetch(`${API_URL}/api/settings`, { next: { revalidate: 3600 } });
  return data?.settings || {};
}

export const metadata = { title: 'Terms of Service' };

export default async function TermsPage() {
  const s = await getSettings();
  const siteName = s.siteName || 'ezoneshoppi';
  const email = s.contact?.email || 'support@ezoneshoppi.com';

  return (
    <div className="container-x py-12 sm:py-16 max-w-3xl">
      <Link href="/" className="text-sm text-brand-600 mb-6 inline-block">← Home</Link>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-ink-500 text-sm mb-8">Last updated: January 1, 2025</p>

      <div className="prose max-w-none space-y-6 text-ink-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {siteName}, you agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use our services. We reserve the right to update these terms at any time,
            and continued use of the platform constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">2. Account Registration</h2>
          <p>
            To place orders, you must create an account with accurate and complete information. You are responsible for
            maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            Please notify us immediately of any unauthorized use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">3. Products and Pricing</h2>
          <p>
            We make every effort to display accurate product descriptions and pricing. However, we reserve the right to
            correct any errors and to cancel orders placed at incorrect prices. Product availability is subject to change
            without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">4. Orders and Payments</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All orders are subject to acceptance and product availability</li>
            <li>Payment must be made in full at the time of order</li>
            <li>We accept major credit/debit cards and UPI payments</li>
            <li>Prices are in Indian Rupees (INR) and inclusive of applicable taxes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">5. Shipping and Delivery</h2>
          <p>
            Delivery timeframes are estimates and not guaranteed. We are not responsible for delays caused by shipping
            carriers, customs, or circumstances beyond our control. Risk of loss passes to you upon delivery.
            See our <Link href="/shipping" className="text-brand-600 hover:underline">Shipping Policy</Link> for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">6. Returns and Refunds</h2>
          <p>
            We offer a 30-day return policy for most products. Items must be unused and in original packaging.
            See our <Link href="/returns" className="text-brand-600 hover:underline">Returns Policy</Link> for full details
            and instructions on how to initiate a return.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">7. Intellectual Property</h2>
          <p>
            All content on {siteName}, including text, images, logos, and software, is the property of {siteName} or its
            licensors and is protected by applicable intellectual property laws. You may not reproduce or use any content
            without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">8. Limitation of Liability</h2>
          <p>
            {siteName} shall not be liable for any indirect, incidental, or consequential damages arising from the use
            of our services. Our total liability shall not exceed the amount paid for the specific order giving rise to
            the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">9. Contact Us</h2>
          <p>
            For questions about these Terms of Service, contact us at{' '}
            <a href={`mailto:${email}`} className="text-brand-600 hover:underline">{email}</a>.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-8 border-t border-ink-900/10 flex flex-wrap gap-4 text-sm text-ink-500">
        <Link href="/privacy" className="hover:text-brand-600 transition">Privacy Policy</Link>
        <Link href="/returns" className="hover:text-brand-600 transition">Returns Policy</Link>
        <Link href="/shipping" className="hover:text-brand-600 transition">Shipping Policy</Link>
        <Link href="/contact" className="hover:text-brand-600 transition">Contact Us</Link>
      </div>
    </div>
  );
}
