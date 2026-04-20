'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Truck, Tag, Check } from 'lucide-react';
import { useCart, useAuth } from '@/store';
import { API } from '@/lib/api';
import { formatPrice, loadScript } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { user, token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [address, setAddress] = useState({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Please sign in');
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    API.settings().then(({ data }) => setSettings(data.settings));
  }, [token, items.length, router]);

  useEffect(() => {
    if (user) {
      const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (def) setAddress({ ...address, ...def, fullName: def.fullName || user.name, phone: def.phone || user.phone });
      else setAddress({ ...address, fullName: user.name, phone: user.phone || '' });
    }
  }, [user]);

  const applyCoupon = async () => {
    try {
      const { data } = await API.validateCoupon({ code: couponCode, subtotal: subtotal() });
      setCouponApplied({ code: data.coupon.code, discount: data.discount });
      toast.success(`Coupon applied! -${formatPrice(data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const sub = subtotal();
  const discount = couponApplied?.discount || 0;
  const afterDiscount = sub - discount;
  const tax = settings?.tax?.enabled ? Math.round(afterDiscount * (settings.tax.percent / 100)) : 0;
  const shipping = afterDiscount >= (settings?.shipping?.freeShippingThreshold || 0) ? 0 : (settings?.shipping?.flatRate || 0);
  const total = afterDiscount + tax + shipping;

  const validateAddress = () => {
    const req = ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'];
    for (const k of req) {
      if (!address[k]) { toast.error(`Please fill ${k}`); return false; }
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validateAddress()) return;
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity, variant: i.variant })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponApplied?.code,
      };
      const { data } = await API.createOrder(payload);

      if (paymentMethod === 'razorpay') {
        const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!ok) throw new Error('Razorpay SDK failed');

        const options = {
          key: data.razorpay.key,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          order_id: data.razorpay.id,
          name: settings?.siteName || 'ezoneshoppi',
          description: `Order ${data.order.orderNumber}`,
          prefill: {
            name: address.fullName,
            email: user?.email,
            contact: address.phone,
          },
          theme: { color: settings?.primaryColor || '#2563eb' },
          handler: async (resp) => {
            try {
              await API.verifyPayment({
                ...resp,
                orderId: data.order._id,
              });
              clear();
              toast.success('Payment successful!');
              router.push(`/account/orders/${data.order._id}`);
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        clear();
        toast.success('Order placed!');
        router.push(`/account/orders/${data.order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          {/* Address */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck size={18} /> Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input className="field" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
              </div>
              <div><label className="label">Phone</label><input className="field" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
              <div><label className="label">Postal Code</label><input className="field" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">Address Line 1</label><input className="field" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">Address Line 2 (optional)</label><input className="field" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} /></div>
              <div><label className="label">City</label><input className="field" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
              <div><label className="label">State</label><input className="field" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={18} /> Payment Method</h2>
            <div className="space-y-3">
              {settings?.payment?.razorpayEnabled !== false && (
                <PaymentOption selected={paymentMethod === 'razorpay'} onClick={() => setPaymentMethod('razorpay')} title="Razorpay" desc="Credit / Debit Card, UPI, Net Banking, Wallets" />
              )}
              {settings?.payment?.codEnabled && (
                <PaymentOption selected={paymentMethod === 'cod'} onClick={() => setPaymentMethod('cod')} title="Cash on Delivery" desc="Pay when you receive your order" />
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="card p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((it) => (
              <div key={it.key} className="flex gap-3 items-center">
                <div className="relative w-14 h-14 rounded-lg bg-ink-900/5 overflow-hidden shrink-0">
                  {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{it.name}</p>
                  <p className="text-xs text-ink-500">Qty: {it.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="mb-4">
            <label className="label flex items-center gap-1.5"><Tag size={14} /> Promo code</label>
            <div className="flex gap-2">
              <input className="field" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" />
              <button onClick={applyCoupon} className="btn-outline text-sm">Apply</button>
            </div>
            {couponApplied && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check size={12} /> {couponApplied.code} applied</p>
            )}
          </div>

          <div className="space-y-2 text-sm border-t border-ink-900/10 pt-4">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            {tax > 0 && <div className="flex justify-between"><span>{settings?.tax?.label || 'Tax'} ({settings?.tax?.percent}%)</span><span>{formatPrice(tax)}</span></div>}
          </div>
          <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-ink-900/10">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button onClick={placeOrder} disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-50">
            {loading ? 'Processing…' : `Place Order · ${formatPrice(total)}`}
          </button>
        </aside>
      </div>
    </div>
  );
}

function PaymentOption({ selected, onClick, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border text-left transition ${selected ? 'border-brand-600 bg-brand-50' : 'border-ink-900/10 hover:border-ink-900/30'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 grid place-items-center ${selected ? 'border-brand-600' : 'border-ink-300'}`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-ink-500">{desc}</p>
        </div>
      </div>
    </button>
  );
}
