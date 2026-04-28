'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Truck, Tag, Check, MessageCircle } from 'lucide-react';
import { useCart, useAuth } from '@/store';
import { API } from '@/lib/api';
import { formatPrice, loadScript } from '@/lib/utils';
import toast from 'react-hot-toast';

const WA_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { user, token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [address, setAddress] = useState({
    fullName: '', phone: '', line1: '', line2: '',
    city: '', state: '', postalCode: '', country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState(null); // set after settings load
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { toast.error('Please sign in'); router.push('/login?redirect=/checkout'); return; }
    if (items.length === 0) { router.push('/cart'); return; }
    API.settings().then(({ data }) => {
      const s = data.settings;
      setSettings(s);
      // Pick first enabled method as default
      if (s?.payment?.razorpayEnabled) setPaymentMethod('razorpay');
      else if (s?.payment?.codEnabled) setPaymentMethod('cod');
      else if (s?.payment?.whatsappEnabled) setPaymentMethod('whatsapp');
    });
  }, [token, items.length, router]); // eslint-disable-line

  useEffect(() => {
    if (!user) return;
    const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    if (def) setAddress((a) => ({ ...a, ...def, fullName: def.fullName || user.name, phone: def.phone || user.phone }));
    else setAddress((a) => ({ ...a, fullName: user.name || '', phone: user.phone || '' }));
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

  const sub      = subtotal();
  const discount = couponApplied?.discount || 0;
  const after    = sub - discount;
  const tax      = settings?.tax?.enabled ? Math.round(after * (settings.tax.percent / 100)) : 0;
  const ship     = after >= (settings?.shipping?.freeShippingThreshold || 0) ? 0 : (settings?.shipping?.flatRate || 0);
  const total    = after + tax + ship;

  const validateAddress = () => {
    for (const k of ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode']) {
      if (!address[k]?.trim()) { toast.error(`Please fill in: ${k}`); return false; }
    }
    return true;
  };

  const buildWhatsAppMessage = (order) => {
    const lines = [
      `🛒 *New Order — ${settings?.siteName || 'ezoneshoppi'}*`,
      `📦 Order No: *${order.orderNumber}*`,
      ``,
      `👤 *Customer Details*`,
      `Name: ${address.fullName}`,
      `Phone: ${address.phone}`,
      ``,
      `📍 *Delivery Address*`,
      address.line1,
      address.line2 || null,
      `${address.city}, ${address.state} — ${address.postalCode}`,
      ``,
      `🛍️ *Items Ordered*`,
      ...items.map((it) => `• ${it.name} × ${it.quantity} — ${formatPrice(it.price * it.quantity)}`),
      ``,
      `💰 *Price Breakdown*`,
      `Subtotal: ${formatPrice(sub)}`,
      discount > 0 ? `Discount: -${formatPrice(discount)} (${couponApplied?.code})` : null,
      ship > 0 ? `Shipping: ${formatPrice(ship)}` : `Shipping: Free`,
      tax > 0 ? `${settings?.tax?.label || 'Tax'}: ${formatPrice(tax)}` : null,
      `*Total: ${formatPrice(total)}*`,
      ``,
      `Please confirm my order. Thank you!`,
    ].filter(Boolean).join('\n');
    return encodeURIComponent(lines);
  };

  const placeOrder = async () => {
    if (!validateAddress() || loading) return;
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
        if (!ok) throw new Error('Razorpay SDK failed to load');
        new window.Razorpay({
          key: data.razorpay.key,
          amount: data.razorpay.amount,
          currency: 'INR',
          order_id: data.razorpay.id,
          name: settings?.siteName || 'ezoneshoppi',
          description: `Order ${data.order.orderNumber}`,
          prefill: { name: address.fullName, email: user?.email, contact: address.phone },
          theme: { color: settings?.primaryColor || '#2563eb' },
          handler: async (resp) => {
            try {
              await API.verifyPayment({ ...resp, orderId: data.order._id });
              clear();
              toast.success('Payment successful!');
              router.push(`/account/orders/${data.order._id}`);
            } catch { toast.error('Payment verification failed'); }
          },
          modal: { ondismiss: () => setLoading(false) },
        }).open();
      } else if (paymentMethod === 'whatsapp') {
        const waNumber = (settings?.social?.whatsapp || '').replace(/\D/g, '');
        const waUrl = `https://wa.me/${waNumber}?text=${buildWhatsAppMessage(data.order)}`;
        clear();
        toast.success('Order placed! Opening WhatsApp…');
        window.open(waUrl, '_blank');
        router.push(`/account/orders/${data.order._id}`);
      } else {
        // COD
        clear();
        toast.success('Order placed!');
        router.push(`/account/orders/${data.order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  const p = settings?.payment || {};
  const methods = [
    p.razorpayEnabled && { id: 'razorpay', title: 'Razorpay', desc: 'Credit / Debit Card, UPI, Net Banking, Wallets' },
    p.codEnabled      && { id: 'cod',      title: 'Cash on Delivery', desc: 'Pay when you receive your order' },
    p.whatsappEnabled && { id: 'whatsapp', title: 'Order via WhatsApp', desc: 'We confirm your order on WhatsApp directly' },
  ].filter(Boolean);

  const isWhatsApp = paymentMethod === 'whatsapp';

  return (
    <div className="container-x py-8 md:py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-6">

          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck size={18} className="text-brand-600" /> Shipping Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input className="field" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="field" type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input className="field" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 1</label>
                <input className="field" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 2 <span className="text-ink-400 font-normal">(optional)</span></label>
                <input className="field" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="field" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              </div>
              <div>
                <label className="label">State</label>
                <input className="field" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {methods.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-brand-600" /> Payment Method
              </h2>
              <div className="space-y-3">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3 ${
                      paymentMethod === m.id ? 'border-brand-600 bg-brand-50' : 'border-ink-900/10 hover:border-ink-900/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${paymentMethod === m.id ? 'border-brand-600' : 'border-ink-300'}`}>
                      {paymentMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{m.title}</p>
                      <p className="text-xs text-ink-500">{m.desc}</p>
                    </div>
                    {m.id === 'whatsapp' && <span className="text-[#25D366]">{WA_ICON}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <aside className="card p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>

          <div className="space-y-3 mb-5">
            {items.map((it) => (
              <div key={it.key} className="flex gap-3 items-center">
                <div className="relative w-14 h-14 rounded-lg bg-ink-900/5 overflow-hidden shrink-0">
                  {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{it.name}</p>
                  <p className="text-xs text-ink-500">Qty: {it.quantity}</p>
                </div>
                <p className="text-sm font-semibold shrink-0">{formatPrice(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <label className="label flex items-center gap-1.5"><Tag size={13} /> Promo Code</label>
            <div className="flex gap-2">
              <input className="field" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" />
              <button onClick={applyCoupon} className="btn-outline text-sm shrink-0">Apply</button>
            </div>
            {couponApplied && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Check size={11} /> {couponApplied.code} applied — -{formatPrice(couponApplied.discount)}
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm border-t border-ink-900/10 pt-4">
            <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{formatPrice(sub)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-ink-500">Shipping</span><span>{ship === 0 ? <span className="text-green-600">Free</span> : formatPrice(ship)}</span></div>
            {tax > 0 && <div className="flex justify-between"><span className="text-ink-500">{settings?.tax?.label || 'Tax'}</span><span>{formatPrice(tax)}</span></div>}
          </div>
          <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-ink-900/10">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>

          {isWhatsApp ? (
            <>
              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: '#25D366' }}
              >
                {loading ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Processing…</>
                ) : (
                  <>{WA_ICON} Confirm Order on WhatsApp</>
                )}
              </button>
              <p className="text-center text-xs text-ink-400 mt-2">Opens WhatsApp with your order pre-filled</p>
            </>
          ) : (
            <button onClick={placeOrder} disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-50">
              {loading ? 'Processing…' : `Place Order · ${formatPrice(total)}`}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
