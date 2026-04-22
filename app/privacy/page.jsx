import Link from 'next/link';
import { serverFetch } from '@/lib/server-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getSettings() {
  const data = await serverFetch(`${API_URL}/api/settings`, { next: { revalidate: 3600 } });
  return data?.settings || {};
}

export const metadata = { title: 'Privacy Policy' };

export default async function PrivacyPage() {
  const s = await getSettings();
  const siteName = s.siteName || 'ezoneshoppi';
  const email = s.contact?.email || 'support@ezoneshoppi.com';

  return (
    <div className="container-x py-12 sm:py-16 max-w-3xl">
      <Link href="/" className="text-sm text-brand-600 mb-6 inline-block">← Home</Link>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-ink-500 text-sm mb-8">Last updated: April 22, 2025</p>

      <div className="prose max-w-none space-y-6 text-ink-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">1. Information We Collect</h2>
          <p>
            When you use {siteName}, we collect information you provide directly to us, such as when you create an account,
            place an order, or contact us for support. This includes your name, email address, phone number, shipping address,
            and payment information.
          </p>
          <p className="mt-3">
            We also automatically collect certain information about your device and how you interact with our services,
            including IP address, browser type, pages visited, and purchase history.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations, updates, and shipping notifications</li>
            <li>Respond to your questions and provide customer support</li>
            <li>Send promotional communications (you can opt out at any time)</li>
            <li>Improve our products and services</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">3. Payment Processing – Razorpay</h2>
          <p>
            All online payments on {siteName} are securely processed by <strong>Razorpay Software Pvt. Ltd.</strong>,
            a PCI-DSS Level 1 certified payment gateway. When you make a payment, your card details, UPI ID, or banking
            credentials are entered directly on Razorpay's secure payment page and are never stored on our servers.
            We only receive a payment confirmation token and order ID from Razorpay.
          </p>
          <p className="mt-3">
            Razorpay may collect device and transaction data for fraud prevention. Your use of Razorpay's services is
            also governed by{' '}
            <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
              Razorpay's Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">4. Google Sign-In</h2>
          <p>
            We use <strong>Google OAuth 2.0</strong> for account authentication. When you sign in with Google,
            we receive your name, email address, and profile picture from Google. We do not receive or store your
            Google password. Your use of Google Sign-In is also governed by{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
              Google's Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">5. Sharing Your Information</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
            except as necessary to complete your transactions or as required by law. We share data with:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Razorpay</strong> – for processing payments securely.</li>
            <li><strong>Google</strong> – for account authentication via Google Sign-In.</li>
            <li><strong>Shipping partners</strong> – your name and address to fulfill and deliver your order.</li>
            <li><strong>Law enforcement</strong> – when required by applicable law or court order.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">6. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. All data in transit
            is encrypted using SSL/TLS. Payment data is handled exclusively by Razorpay's PCI-compliant infrastructure.
            We do not store credit/debit card numbers or CVV codes on our systems.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">7. Cookies & Local Storage</h2>
          <p>
            We use browser localStorage to keep you logged in and preserve your cart and wishlist between visits.
            We do not use third-party advertising cookies. You can clear your browser storage at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">8. Data Retention</h2>
          <p>
            Account data is retained as long as your account remains active. Order records are retained for 7 years
            for legal and accounting purposes. You may request deletion of your account by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">9. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time through your account settings.
            You may also contact us to request a copy of your data or to opt out of marketing communications.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-3">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href={`mailto:${email}`} className="text-brand-600 hover:underline">{email}</a>.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-8 border-t border-ink-900/10 flex flex-wrap gap-4 text-sm text-ink-500">
        <Link href="/terms" className="hover:text-brand-600 transition">Terms of Service</Link>
        <Link href="/returns" className="hover:text-brand-600 transition">Returns Policy</Link>
        <Link href="/shipping" className="hover:text-brand-600 transition">Shipping Policy</Link>
        <Link href="/contact" className="hover:text-brand-600 transition">Contact Us</Link>
      </div>
    </div>
  );
}
