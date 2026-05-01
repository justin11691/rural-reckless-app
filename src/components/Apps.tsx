import { useState, useEffect } from 'react';
import { Search, Cpu, BookOpen, PenLine, Plus, X, CreditCard, Bitcoin, ChevronDown, ChevronUp, ExternalLink, ShoppingCart, MessageSquare, Book, Box } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { BookStudio } from './BookStudio';
import { BookReader } from './BookReader';
import { PrintStudio } from './PrintStudio';
import { PrintViewer } from './PrintViewer';

const PRODUCT_CATEGORIES = ['E-Book', 'Short Story / Poetry', 'Config File', 'Design Files', 'Software', 'Music', 'Art / Printables', 'Other'];

const SAMPLE_PRODUCTS = [
  { id: 's1', title: "Slice3D Pro Presets", owner_id: 'sample', category: "Config File", price_display: "$4.99", description: "My personal slicer presets for PLA, PETG, and TPU. Hundreds of hours of tuning.", cover_image_url: null, payment_url: '#', crypto_url: null },
  { id: 's2', title: "Woodcrafter's CAD Templates", owner_id: 'sample', category: "Design Files", price_display: "$15.00", description: "20 parametric templates for joints, dovetails, and box designs. Open in FreeCAD or Fusion 360.", cover_image_url: null, payment_url: '#', crypto_url: null },
  { id: 's3', title: "Root Cellar", owner_id: 'sample', category: "E-Book", price_display: "Free", description: "A quiet novel about land, loss, and a very stubborn goat. 310 pages.", cover_image_url: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=600", payment_url: null, crypto_url: null, file_url: '#' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'E-Book': <BookOpen size={22} />, 'Short Story / Poetry': <PenLine size={22} />,
  'Config File': <Cpu size={22} />, 'Design Files': <Cpu size={22} />,
  'Software': <Cpu size={22} />, 'Music': <span style={{ fontSize: '1.2rem' }}>🎵</span>,
  'Art / Printables': <span style={{ fontSize: '1.2rem' }}>🎨</span>,
  'Other': <ShoppingCart size={22} />,
};

function HowToGetPaid() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ borderLeft: '4px solid var(--color-pine-primary)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: 'var(--color-pine-dark)', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0, cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
        aria-expanded={open}
      >
        💡 How do I get paid?
        {open ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
      </button>
      {open && (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.92rem', color: 'var(--color-text-main)', lineHeight: 1.7 }}>
          <div>
            <strong>💳 Accept Debit / Credit Cards</strong>
            <ol style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
              <li>Go to <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-pine-primary)' }}>dashboard.stripe.com/payment-links</a> (free account)</li>
              <li>Click "Create a payment link" → set your product name and price</li>
              <li>Copy the link Stripe gives you (looks like <code>buy.stripe.com/abc123</code>)</li>
              <li>Paste that link into the "Card Payment Link" field when listing your product here</li>
            </ol>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>Stripe charges 2.9% + 30¢ per transaction. You keep the rest, paid directly to your bank.</p>
          </div>
          <div>
            <strong>₿ Accept Crypto (BTC, ETH, USDC, and more)</strong>
            <ol style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
              <li>Go to <a href="https://commerce.coinbase.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-pine-primary)' }}>commerce.coinbase.com</a> (free account)</li>
              <li>Create a new charge → set your price</li>
              <li>Copy the hosted payment URL</li>
              <li>Paste it into the "Crypto Payment Link" field here</li>
            </ol>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>Coinbase Commerce charges 1%. Funds go directly to your crypto wallet.</p>
          </div>
          <div>
            <strong>🆓 Free downloads</strong>
            <p style={{ margin: '0.25rem 0 0' }}>Upload your file to Google Drive or Supabase Storage, set it to public, and paste the direct download link into the "Download URL" field.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onReadClick, onViewPrintClick }: { product: any; onReadClick: (p: any) => void; onViewPrintClick: (p: any) => void }) {
  const isFree = product.price_display?.toLowerCase() === 'free';
  const isDirectBook = product.file_url?.startsWith('BOOK_JSON:') || product.category === 'E-Book';
  const isDirectPrint = product.file_url?.startsWith('PRINT_JSON:') || product.category === 'Design Files';

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {product.cover_image_url ? (
        <img src={product.cover_image_url} alt={product.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} loading="lazy" />
      ) : (
        <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '2.5rem' }} aria-hidden>
          {CATEGORY_ICONS[product.category] ?? <ShoppingCart size={36} />}
        </div>
      )}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {product.category}
          </span>
          <span style={{ fontWeight: 700, color: isFree ? 'var(--color-pine-primary)' : 'var(--color-accent)', flexShrink: 0 }}>
            {product.price_display}
          </span>
        </div>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-pine-dark)', lineHeight: 1.3 }}>{product.title}</h3>
        {product.description && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isDirectBook ? (
            <button onClick={() => onReadClick(product)} style={{ flex: 1, textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer', minHeight: '44px' }}>
              <Book size={14} /> Read E-Book
            </button>
          ) : isDirectPrint ? (
            <button onClick={() => onViewPrintClick(product)} style={{ flex: 1, textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer', minHeight: '44px' }}>
              <Box size={14} /> View 3D Model
            </button>
          ) : (
            <>
              {!isFree && (
                <button
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      title: product.title,
                      price_display: product.price_display,
                      price: parseFloat(product.price_display?.replace(/[^0-9.]/g, '') || '0'),
                      cover_image_url: product.cover_image_url,
                    });
                    alert(`Successfully added ${product.title} to your cart!`);
                  }}
                  style={{ flex: 1, minWidth: '120px', textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', minHeight: '44px' }}
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              )}
              {isFree && product.file_url && (
                <a href={product.file_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', minHeight: '44px' }} aria-label={`Download ${product.title} for free`}>
                  <ExternalLink size={14} aria-hidden /> Free Download
                </a>
              )}
              {product.payment_url && product.payment_url !== '#' && (
                <a href={product.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#635BFF', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', minHeight: '44px' }} aria-label={`Buy ${product.title} with card`}>
                  <CreditCard size={14} aria-hidden /> Card
                </a>
              )}
              {product.crypto_url && product.crypto_url !== '#' && (
                <a href={product.crypto_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F7931A', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', minHeight: '44px' }} aria-label={`Buy ${product.title} with crypto`}>
                  <Bitcoin size={14} aria-hidden /> Crypto
                </a>
              )}
              {!isFree && (product.owner_id === 'sample') && (
                <span style={{ flex: 1, textAlign: 'center', background: '#635BFF', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', opacity: 0.6, cursor: 'not-allowed' }}>
                  <CreditCard size={14} aria-hidden /> Buy — Card
                </span>
              )}
              {product.owner_id !== 'sample' && !product.payment_url && !product.crypto_url && (
                <Link to="/messages" state={{ receiverId: product.owner_id, listingId: product.id }} style={{ flex: 1, textAlign: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: '1px solid var(--color-border)', minHeight: '44px' }} aria-label={`Message seller about ${product.title}`}>
                  <MessageSquare size={14} aria-hidden /> Message
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ListProductModal({ onClose, onCreated, userId }: { onClose: () => void; onCreated: () => void; userId: string }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'E-Book', price_display: '', payment_url: '', crypto_url: '', cover_image_url: '', file_url: '' });
  const [saving, setSaving] = useState(false);
  const isFree = form.price_display.trim().toLowerCase() === 'free' || form.price_display.trim() === '0' || form.price_display.trim() === '$0';

  async function save() {
    if (!form.title.trim() || !form.price_display.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('digital_products').insert([{
      owner_id: userId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price_display: form.price_display.trim(),
      payment_url: form.payment_url.trim() || null,
      crypto_url: form.crypto_url.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      file_url: form.file_url.trim() || null,
    }]);
    if (error) {
      alert('Could not list product: ' + error.message);
    } else {
      onCreated();
    }
    setSaving(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-label="List a digital product">
      <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto', background: 'var(--color-bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>List a Product</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }} aria-label="Close"><X size={22} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <Field label="Title *">
            <input type="text" className="post-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. My Woodworking Templates Pack" style={{ width: '100%', margin: 0 }} maxLength={80} />
          </Field>

          <Field label="Description">
            <textarea className="post-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this include? Who is it for?" rows={3} style={{ width: '100%', margin: 0, resize: 'vertical' }} maxLength={500} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Category">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.95rem', background: '#fcfcfc' }}>
                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Price *">
              <input type="text" className="post-input" value={form.price_display} onChange={e => setForm({ ...form, price_display: e.target.value })} placeholder="$9.99 or Free" style={{ width: '100%', margin: 0 }} />
            </Field>
          </div>

          <Field label="Cover Image URL" hint="Optional — paste a direct image link">
            <input type="url" className="post-input" value={form.cover_image_url} onChange={e => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." style={{ width: '100%', margin: 0 }} />
          </Field>

          {isFree ? (
            <Field label="Download URL" hint="Where buyers get the file (Google Drive, Dropbox, etc.)">
              <input type="url" className="post-input" value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} placeholder="https://drive.google.com/..." style={{ width: '100%', margin: 0 }} />
            </Field>
          ) : (
            <>
              <Field label="💳 Card Payment Link" hint="Your Stripe or Lemon Squeezy checkout URL">
                <input type="url" className="post-input" value={form.payment_url} onChange={e => setForm({ ...form, payment_url: e.target.value })} placeholder="https://buy.stripe.com/..." style={{ width: '100%', margin: 0 }} />
              </Field>
              <Field label="₿ Crypto Payment Link" hint="Your Coinbase Commerce URL (optional)">
                <input type="url" className="post-input" value={form.crypto_url} onChange={e => setForm({ ...form, crypto_url: e.target.value })} placeholder="https://commerce.coinbase.com/..." style={{ width: '100%', margin: 0 }} />
              </Field>
            </>
          )}

          <div style={{ padding: '0.85rem 1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            💡 Payments go directly to you via Stripe or Coinbase. Rural &amp; Reckless doesn't handle the money.
          </div>

          <button onClick={save} disabled={!form.title.trim() || !form.price_display.trim() || saving} style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}>
            {saving ? 'Listing...' : 'Publish Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--color-pine-dark)' }}>{label}</label>
      {hint && <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>{hint}</p>}
      {children}
    </div>
  );
}

export function Apps() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showList, setShowList] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Tabs management
  const [activeTab, setActiveTab] = useState<'products' | 'studio' | 'prints'>('products');
  const [readingBook, setReadingBook] = useState<any | null>(null);
  const [viewingPrint, setViewingPrint] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setCurrentUser(session?.user ?? null));
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('digital_products').select('*').order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  }

  const allProducts = [...(loading ? [] : products.length === 0 ? SAMPLE_PRODUCTS : products)];
  const filtered = allProducts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowX: 'hidden' }}>
      
      {/* Hero */}
      <div className="card" style={{ padding: '2rem', background: 'var(--color-pine-dark)', color: 'white' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0, fontSize: '1.8rem', flexWrap: 'wrap', color: 'white' }}>
          <ShoppingCart size={30} aria-hidden /> Digital Goods &amp; Publishing
        </h1>
        <p style={{ marginTop: '0.5rem', opacity: 0.9, lineHeight: 1.6, color: 'white' }}>
          Sell your e-books, short stories, configs, templates, and tools — get paid directly by card or crypto.
        </p>
      </div>

      {/* Mode Sub-Tab Menu */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--color-border)', gap: '1.5rem', marginBottom: '-0.5rem' }}>
        <button onClick={() => setActiveTab('products')} style={{ background: 'none', border: 'none', borderBottom: activeTab === 'products' ? '3px solid var(--color-pine-primary)' : '3px solid transparent', padding: '0.65rem 1rem', fontSize: '1rem', fontWeight: activeTab === 'products' ? 700 : 500, color: activeTab === 'products' ? 'var(--color-pine-dark)' : 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '-2px' }}>
          Products &amp; Tools
        </button>
        <button onClick={() => setActiveTab('studio')} style={{ background: 'none', border: 'none', borderBottom: activeTab === 'studio' ? '3px solid var(--color-pine-primary)' : '3px solid transparent', padding: '0.65rem 1rem', fontSize: '1rem', fontWeight: activeTab === 'studio' ? 700 : 500, color: activeTab === 'studio' ? 'var(--color-pine-dark)' : 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '-2px' }}>
          Book Studio
        </button>
        <button onClick={() => setActiveTab('prints')} style={{ background: 'none', border: 'none', borderBottom: activeTab === 'prints' ? '3px solid var(--color-pine-primary)' : '3px solid transparent', padding: '0.65rem 1rem', fontSize: '1rem', fontWeight: activeTab === 'prints' ? 700 : 500, color: activeTab === 'prints' ? 'var(--color-pine-dark)' : 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '-2px' }}>
          3D Print Studio
        </button>
      </div>

      {activeTab === 'studio' ? (
        currentUser ? (
          <BookStudio userId={currentUser.id} onPublished={fetchProducts} />
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
            <PenLine size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--color-pine-dark)' }} />
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-pine-dark)' }}>Please sign in to access Book Studio.</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>Start composing and self-publishing your own stories.</p>
          </div>
        )
      ) : activeTab === 'prints' ? (
        currentUser ? (
          <PrintStudio userId={currentUser.id} onPublished={fetchProducts} />
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
            <Box size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--color-pine-dark)' }} />
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-pine-dark)' }}>Please sign in to access 3D Print Studio.</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>Construct and publish 3D prints directly.</p>
          </div>
        )
      ) : (
        <>
          {/* How to Get Paid */}
          <HowToGetPaid />

          {/* Search + Filters + List Button */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="nav-search" style={{ flex: 1, minWidth: '180px', maxWidth: '420px', background: 'var(--color-bg-base)' }}>
              <Search className="search-icon" size={18} aria-hidden />
              <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search digital goods" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.9rem', background: 'var(--color-bg-base)', cursor: 'pointer' }} aria-label="Filter by category">
              <option value="All">All Categories</option>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => currentUser ? setShowList(true) : alert('Sign in to list a product.')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', padding: '0.6rem 1.25rem' }} aria-label="List your product for sale">
              <Plus size={18} aria-hidden /> Sell Something
            </button>
          </div>

          {/* Product Grid */}
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading products...</p>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--color-pine-dark)' }}>Nothing here yet.</p>
              <p>Be the first to list a digital product — configs, templates, books, anything.</p>
              {currentUser && (
                <button onClick={() => setShowList(true)} style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={16} aria-hidden /> List Your First Product
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onReadClick={(p) => setReadingBook(p)}
                  onViewPrintClick={(p) => setViewingPrint(p)}
                />
              ))}
            </div>
          )}

          {/* List Modal */}
          {showList && currentUser && (
            <ListProductModal
              userId={currentUser.id}
              onClose={() => setShowList(false)}
              onCreated={() => { setShowList(false); fetchProducts(); }}
            />
          )}

          {/* Book Reading Modal */}
          {readingBook && (
            <BookReader
              product={readingBook}
              onClose={() => setReadingBook(null)}
            />
          )}

          {/* 3D Print Reading Modal */}
          {viewingPrint && (
            <PrintViewer
              product={viewingPrint}
              onClose={() => setViewingPrint(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
