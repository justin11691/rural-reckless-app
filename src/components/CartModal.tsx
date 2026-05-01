import { useState } from 'react';
import { useCart } from '../lib/cart';
import { ShoppingBag, X, Trash2, Plus, Minus, CreditCard, Bitcoin, CheckCircle } from 'lucide-react';

export function CartModal({ onClose }: { onClose: () => void }) {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', card: '', expiry: '', cvc: '', paymentMethod: 'card' });

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || (form.paymentMethod === 'card' && !form.card)) return;
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      setSuccess(true);
      clearCart();
    }, 1200);
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 2000 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-bg-base)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20}/></button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={54} color="var(--color-pine-primary)" />
            <h2 style={{ margin: 0, color: 'var(--color-pine-dark)' }}>Thank you for your order!</h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>We have successfully collected the payment and notified the makers.</p>
            <button onClick={onClose} style={{ padding: '0.65rem 1.5rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>Continue Shopping</button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-pine-dark)' }}>Your cart is empty</h3>
            <p style={{ margin: 0 }}>Add some marketplace or artisan digital products to start the checkout process.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={24} color="var(--color-pine-dark)" />
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-pine-dark)' }}>Your Shopping Cart ({items.length} items)</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1rem 0', maxHeight: '35vh', overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} style={{ width: 55, height: 55, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    ) : (
                      <div style={{ width: 55, height: 55, background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🌿</div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>{item.title}</h4>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>{item.price_display}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-base)' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} aria-label="Decrease quantity"><Minus size={13}/></button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, padding: '0 0.5rem', color: 'var(--color-text-main)', minWidth: '22px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} aria-label="Increase quantity"><Plus size={13}/></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', opacity: 0.7 }} title="Remove item"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Estimated Total</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-accent)' }}>${total.toFixed(2)}</span>
            </div>

            {/* Check out form */}
            <form onSubmit={handleCheckout} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-pine-dark)' }}>Complete the Transaction</h3>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Full Name *</label>
                  <input type="text" className="post-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', margin: 0 }} placeholder="Your full name" />
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Email Address *</label>
                  <input type="email" className="post-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', margin: 0 }} placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>Payment Method</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <label style={{ flex: 1, minWidth: '130px', padding: '0.55rem 0.85rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: form.paymentMethod === 'card' ? 'rgba(99,91,255,0.06)' : 'var(--color-bg-base)', borderColor: form.paymentMethod === 'card' ? '#635BFF' : 'var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    <input type="radio" value="card" checked={form.paymentMethod === 'card'} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={{ display: 'none' }} />
                    <CreditCard size={15} color="#635BFF" /> Card Checkout
                  </label>
                  <label style={{ flex: 1, minWidth: '130px', padding: '0.55rem 0.85rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: form.paymentMethod === 'crypto' ? 'rgba(247,147,26,0.06)' : 'var(--color-bg-base)', borderColor: form.paymentMethod === 'crypto' ? '#F7931A' : 'var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    <input type="radio" value="crypto" checked={form.paymentMethod === 'crypto'} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={{ display: 'none' }} />
                    <Bitcoin size={15} color="#F7931A" /> Crypto Wallet
                  </label>
                </div>
              </div>

              {form.paymentMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.35rem' }}>Card Number *</label>
                    <input type="text" className="post-input" required placeholder="4242 4242 4242 4242" value={form.card} onChange={e => setForm({ ...form, card: e.target.value })} style={{ width: '100%', margin: 0 }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.35rem' }}>Expiry Date *</label>
                      <input type="text" className="post-input" required placeholder="MM/YY" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} style={{ width: '100%', margin: 0 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '0.35rem' }}>CVC Security *</label>
                      <input type="text" className="post-input" required placeholder="123" value={form.cvc} onChange={e => setForm({ ...form, cvc: e.target.value })} style={{ width: '100%', margin: 0 }} />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={checkingOut} style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {checkingOut ? 'Authorizing Payment...' : 'Pay and Checkout Now'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
