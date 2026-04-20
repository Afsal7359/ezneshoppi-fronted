'use client';
import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.settings().then(({ data }) => setSettings(data.settings)).catch(() => {});
  }, []);

  const contact = settings?.contact || {};

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending — replace with real API call if available
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const infoCards = [
    contact.email && { icon: Mail, title: 'Email Us', value: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { icon: Phone, title: 'Call Us', value: contact.phone, href: `tel:${contact.phone}` },
    contact.address && { icon: MapPin, title: 'Office', value: contact.address, href: null },
    { icon: Clock, title: 'Support Hours', value: 'Mon–Sat, 9 AM – 6 PM', href: null },
  ].filter(Boolean);

  return (
    <div className="container-x py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <span className="text-brand-600 text-sm font-semibold">Contact</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">Get in Touch</h1>
        <p className="text-ink-500 mt-3 text-sm sm:text-base">We're here to help. Reach out anytime.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 max-w-5xl mx-auto">
        {/* Info cards */}
        <div className="space-y-3 sm:space-y-4">
          {infoCards.map((x, i) => (
            <div key={i} className="card p-4 sm:p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">
                <x.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-ink-500 mb-0.5">{x.title}</p>
                {x.href ? (
                  <a href={x.href} className="font-semibold hover:text-brand-600 transition text-sm sm:text-base break-all">
                    {x.value}
                  </a>
                ) : (
                  <p className="font-semibold text-sm sm:text-base">{x.value}</p>
                )}
              </div>
            </div>
          ))}

          {/* Map embed */}
          {contact.mapEmbed && (
            <div className="card overflow-hidden aspect-video">
              <iframe
                src={contact.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          )}
        </div>

        {/* Contact form */}
        <form onSubmit={submit} className="card p-5 sm:p-7 space-y-4">
          <h2 className="font-bold text-lg mb-2">Send a Message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Name</label>
              <input
                className="field"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="field"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Subject</label>
            <input
              className="field"
              placeholder="How can we help?"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              className="field resize-none"
              rows={5}
              required
              placeholder="Tell us more..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Sending…' : <><Send size={16} /> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
}
