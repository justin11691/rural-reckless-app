import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-pine-dark)', margin: 0 }}>Contact Rural & Reckless</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '1rem' }}>Have questions? Reach out to us directly!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail style={{ color: 'var(--color-pine-primary)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Email</strong>
                <a href="mailto:justin121887@gmail.com" style={{ color: 'var(--color-pine-primary)', textDecoration: 'none' }}>
                  justin121887@gmail.com
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone style={{ color: 'var(--color-pine-primary)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Phone</strong>
                <a href="tel:1-928-368-3484" style={{ color: 'var(--color-pine-primary)', textDecoration: 'none' }}>1-928-368-3484</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin style={{ color: 'var(--color-pine-primary)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Company</strong>
                <span style={{ color: 'var(--color-text-muted)' }}>Rural and Reckless Media</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--color-bg-base)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', color: 'var(--color-pine-primary)', padding: '1rem 0' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Thank you!</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>We will get back to you shortly.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label htmlFor="contact-name" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label htmlFor="contact-email" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label htmlFor="contact-message" style={{ fontSize: '0.82rem', fontWeight: 600 }}>How can we help?</label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Send size={16} /> Send Message
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
