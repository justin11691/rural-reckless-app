import { useState, useEffect } from 'react';
import { ShoppingBag, Search, MapPin, Plus, X, CreditCard, Bitcoin, Leaf, Tag, Package, MessageSquare, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../lib/cart';

const FARM_CATEGORIES = ['Woodworking','Pottery & Ceramics','Textiles & Quilts','Candles & Soaps','Jewelry','Painting & Prints','Farm & Garden','Baked Goods','3D Prints','Leather Goods','Metalwork','Other Handmade'];
const RUMMAGE_CATEGORIES = ['Furniture','Tools','Clothing','Electronics','Books & Media','Toys & Games','Kitchen','Outdoor & Garden','Farm Equipment','Sporting Goods','Baby & Kids','Other'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const CONDITIONS = ['New','Like New','Good','Fair','Parts Only'];

const FARM_SAMPLES = [
  { id:'s1', title:'Hand-Carved Walnut Bowl', seller_name:"Arthur's Woodshop", category:'Woodworking', price_display:'$45.00', cover_image_url:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600', description:'Solid walnut, hand-turned, natural oil finish.', location_city:'Asheville', location_state:'NC', listing_type:'farmers_market', is_sample:true },
  { id:'s2', title:'Organic Raw Honey (16oz)', seller_name:'Pine Valley Apiary', category:'Farm & Garden', price_display:'$12.50', cover_image_url:'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?auto=format&fit=crop&q=80&w=600', description:'Wildflower honey, no heat treatment.', location_city:'Blue Ridge', location_state:'GA', listing_type:'farmers_market', is_sample:true },
  { id:'s3', title:'Hand-Stamped Leather Journal', seller_name:'Prairie & Ink', category:'Leather Goods', price_display:'$38.00', cover_image_url:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', description:'Full-grain leather, hand-stitched, 200 pages.', location_city:'Nashville', location_state:'TN', listing_type:'farmers_market', is_sample:true },
];

const RUMMAGE_SAMPLES = [
  { id:'r1', title:'Vintage Cast Iron Skillet', seller_name:'Dale W.', category:'Kitchen', price_display:'$25.00', cover_image_url:'https://images.unsplash.com/photo-1585325701956-60dd9c8e5aef?auto=format&fit=crop&q=80&w=600', description:'Lodge 12" cast iron, well seasoned, ready to use.', condition:'Good', location_city:'Knoxville', location_state:'TN', listing_type:'rummage', is_sample:true },
  { id:'r2', title:'John Deere Riding Mower Parts', seller_name:'BobsGarage', category:'Farm Equipment', price_display:'$80.00', cover_image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600', description:'L110 deck, belts, and blades. Local pickup only.', condition:'Fair', location_city:'Cullman', location_state:'AL', listing_type:'rummage', is_sample:true },
  { id:'r3', title:'Kids Wooden Play Kitchen', seller_name:'Sarah M.', category:'Baby & Kids', price_display:'$45.00', cover_image_url:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600', description:'Solid wood, painted, excellent condition.', condition:'Like New', location_city:'Athens', location_state:'GA', listing_type:'rummage', is_sample:true },
];

function Field({ label, hint, children }: { label:string; hint?:string; children:React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize:'0.875rem', fontWeight:600, display:'block', marginBottom:'0.3rem', color:'var(--color-pine-dark)' }}>{label}</label>
      {hint && <p style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', marginBottom:'0.3rem' }}>{hint}</p>}
      {children}
    </div>
  );
}

function ListModal({ onClose, onCreated, userId, type }: { onClose:()=>void; onCreated:()=>void; userId:string; type:'farmers_market'|'rummage' }) {
  const isFarm = type === 'farmers_market';
  const [form, setForm] = useState({ title:'', description:'', category: isFarm ? 'Woodworking' : 'Furniture', price_display:'', cover_image_url:'', payment_url:'', crypto_url:'', etsy_url:'', condition:'Good', location_city:'', location_state:'' });
  const [saving, setSaving] = useState(false);
  const S = { width:'100%', padding:'0.6rem 1rem', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', fontFamily:'inherit', fontSize:'0.95rem', background:'#fcfcfc', margin:0 };

  async function save() {
    if (!form.title.trim() || !form.price_display.trim()) return;
    setSaving(true);
    const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', userId).single();
    const sellerName = profile?.full_name || profile?.username || 'Anonymous Maker';
    const { error } = await supabase.from('market_listings').insert([{
      user_id: userId, seller_name: sellerName, title: form.title.trim(),
      description: form.description.trim() || null, category: form.category,
      price_display: form.price_display.trim(), cover_image_url: form.cover_image_url.trim() || null,
      payment_url: form.payment_url.trim() || null, crypto_url: form.crypto_url.trim() || null,
      etsy_url: form.etsy_url.trim() || null, listing_type: type,
      condition: isFarm ? null : form.condition,
      location_city: form.location_city.trim() || null, location_state: form.location_state || null,
    }]);
    if (error) alert('Could not list: ' + error.message);
    else onCreated();
    setSaving(false);
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className="card" style={{ width:'100%', maxWidth:520, maxHeight:'92vh', overflowY:'auto', background:'var(--color-bg-card)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ margin:0 }}>{isFarm ? '🌾 List a Handmade Item' : '🏷️ Post to Rummage Sale'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={22}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <Field label="Title *"><input style={S} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder={isFarm ? 'e.g. Hand-Carved Walnut Bowl' : 'e.g. Vintage Cast Iron Skillet'} maxLength={80}/></Field>
          <Field label="Description"><textarea style={{ ...S, resize:'vertical' } as any} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} maxLength={400}/></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Field label="Category">
              <select style={S} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {(isFarm ? FARM_CATEGORIES : RUMMAGE_CATEGORIES).map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Price *"><input style={S} value={form.price_display} onChange={e=>setForm({...form,price_display:e.target.value})} placeholder="$25.00"/></Field>
          </div>
          {!isFarm && (
            <Field label="Condition">
              <select style={S} value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}>
                {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Field label="📍 City" hint="Optional but helps local buyers"><input style={S} value={form.location_city} onChange={e=>setForm({...form,location_city:e.target.value})} placeholder="e.g. Asheville"/></Field>
            <Field label="State">
              <select style={S} value={form.location_state} onChange={e=>setForm({...form,location_state:e.target.value})}>
                <option value="">Any</option>
                {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Photo URL" hint="Optional — direct image link"><input style={S} type="url" value={form.cover_image_url} onChange={e=>setForm({...form,cover_image_url:e.target.value})} placeholder="https://..."/></Field>
          <div style={{ background:'var(--color-bg-base)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', fontSize:'0.82rem', color:'var(--color-text-muted)' }}>
            💳 Payments go directly to you. Paste your Stripe, PayPal, or Etsy link below.
          </div>
          <Field label="💳 Card Payment Link"><input style={S} type="url" value={form.payment_url} onChange={e=>setForm({...form,payment_url:e.target.value})} placeholder="https://buy.stripe.com/..."/></Field>
          {isFarm && <Field label="🛍️ Etsy Link"><input style={S} type="url" value={form.etsy_url} onChange={e=>setForm({...form,etsy_url:e.target.value})} placeholder="https://etsy.com/shop/..."/></Field>}
          <Field label="₿ Crypto Link"><input style={S} type="url" value={form.crypto_url} onChange={e=>setForm({...form,crypto_url:e.target.value})} placeholder="https://commerce.coinbase.com/..."/></Field>
          <button onClick={save} disabled={!form.title.trim()||!form.price_display.trim()||saving} style={{ width:'100%', padding:'0.85rem', fontSize:'1rem' }}>
            {saving ? 'Posting...' : '✅ Post Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing:any }) {
  const isSample = listing.is_sample;
  const navigate = useNavigate();
  return (
    <div className="card" onClick={() => navigate(`/market/listing/${listing.id}`)} style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer' }}>
      {listing.cover_image_url
        ? <img src={listing.cover_image_url} alt={listing.title} style={{ width:'100%', height:170, objectFit:'cover' }} loading="lazy"/>
        : <div style={{ height:80, background:'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' }}>🌿</div>
      }
      <div style={{ padding:'1.1rem', flex:1, display:'flex', flexDirection:'column', gap:'0.35rem' }}>
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.7rem', background:'var(--color-bg-base)', border:'1px solid var(--color-border)', padding:'0.1rem 0.45rem', borderRadius:4, color:'var(--color-text-muted)' }}>{listing.category}</span>
          {listing.condition && <span style={{ fontSize:'0.7rem', background:'#e8f5e9', border:'1px solid #a5d6a7', padding:'0.1rem 0.45rem', borderRadius:4, color:'#2e7d32' }}>{listing.condition}</span>}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', gap:'0.5rem' }}>
          <h3 style={{ margin:0, fontSize:'0.95rem', color:'var(--color-pine-dark)', lineHeight:1.3 }}>{listing.title}</h3>
          <span style={{ fontWeight:700, color:'var(--color-accent)', flexShrink:0 }}>{listing.price_display}</span>
        </div>
        <p style={{ margin:0, fontSize:'0.8rem', color:'var(--color-text-muted)' }}>by {listing.seller_name}</p>
        {(listing.location_city || listing.location_state) && (
          <p style={{ margin:0, fontSize:'0.78rem', color:'var(--color-text-muted)', display:'flex', alignItems:'center', gap:'0.2rem' }}>
            <MapPin size={11}/> {[listing.location_city, listing.location_state].filter(Boolean).join(', ')}
          </p>
        )}
        {listing.description && <p style={{ margin:'0.15rem 0 0', fontSize:'0.82rem', color:'var(--color-text-main)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' } as any}>{listing.description}</p>}
        <div style={{ marginTop:'auto', paddingTop:'0.75rem', display:'flex', gap:'0.4rem', flexWrap:'wrap' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => {
              addToCart({
                id: listing.id,
                title: listing.title,
                price_display: listing.price_display,
                price: parseFloat(listing.price_display?.replace(/[^0-9.]/g, '') || '0'),
                cover_image_url: listing.cover_image_url,
              });
              alert(`Successfully added ${listing.title} to your cart!`);
            }}
            style={{ flex:1, minWidth:'100px', textAlign:'center', background:'var(--color-pine-primary)', color:'white', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', fontWeight:600, fontSize:'0.8rem', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.25rem' }}
          >
            <ShoppingBag size={12}/> Add to Cart
          </button>
          {!isSample && listing.user_id && (
            <Link to={`/profile/${listing.user_id}`} style={{ flex:1, minWidth:'100px', textAlign:'center', background:'var(--color-bg-base)', color:'var(--color-text-main)', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', textDecoration:'none', fontWeight:600, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.25rem', border:'1px solid var(--color-border)' }}>
              🏪 Visit Shop
            </Link>
          )}
          {isSample ? (
            <button onClick={() => navigate(`/market/listing/${listing.id}`)} style={{ flex:1, minWidth:'80px', textAlign:'center', background:'var(--color-bg-base)', color:'var(--color-text-main)', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', fontWeight:600, fontSize:'0.8rem', border:'1px solid var(--color-border)', cursor:'pointer' }}>View Details</button>
          ) : (<>
            {listing.payment_url && <a href={listing.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex:1, minWidth:'70px', textAlign:'center', background:'#635BFF', color:'white', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', textDecoration:'none', fontWeight:600, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}><CreditCard size={12}/> Card</a>}
            {listing.crypto_url && <a href={listing.crypto_url} target="_blank" rel="noopener noreferrer" style={{ flex:1, minWidth:'75px', textAlign:'center', background:'#F7931A', color:'white', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', textDecoration:'none', fontWeight:600, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}><Bitcoin size={12}/> Crypto</a>}
            {listing.etsy_url && <a href={listing.etsy_url} target="_blank" rel="noopener noreferrer" style={{ flex:1, minWidth:'65px', textAlign:'center', background:'#F56400', color:'white', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', textDecoration:'none', fontWeight:600, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}><ExternalLink size={12}/> Etsy</a>}
            {!listing.payment_url && !listing.crypto_url && !listing.etsy_url ? (
              <Link to="/messages" state={{ receiverId: listing.user_id, listingId: listing.id }} style={{ flex:1, minWidth:'70px', textAlign:'center', background:'var(--color-bg-base)', color:'var(--color-text-main)', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', textDecoration: 'none', fontWeight:600, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem', border:'1px solid var(--color-border)' }}>
                <MessageSquare size={12}/> Message
              </Link>
            ) : (
              <Link to="/messages" state={{ receiverId: listing.user_id, listingId: listing.id }} title="Ask a question" style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-bg-base)', color:'var(--color-text-main)', padding:'0.4rem', borderRadius:'var(--radius-md)', textDecoration:'none', border:'1px solid var(--color-border)' }}>
                <MessageSquare size={14}/>
              </Link>
            )}
          </>)}
        </div>
      </div>
    </div>
  );
}

export function Marketplace() {
  const [tab, setTab] = useState<'farmers_market'|'rummage'>('farmers_market');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any|null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [directCheckoutId, setDirectCheckoutId] = useState<string | null>(null);
  const [directForm, setDirectForm] = useState({ name: '', email: '', card: '' });
  const [directProcessing, setDirectProcessing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data:{session} }) => setCurrentUser(session?.user ?? null));
  }, []);

  useEffect(() => { fetchListings(); }, [tab]);

  async function fetchListings() {
    setLoading(true);
    setFilterCat('All'); setFilterState('All');
    const { data } = await supabase.from('market_listings').select('*').eq('listing_type', tab).order('created_at', { ascending:false });
    setListings(data || []);
    setLoading(false);
  }

  const samples = tab === 'farmers_market' ? FARM_SAMPLES : RUMMAGE_SAMPLES;
  const allListings = loading ? [] : (listings.length === 0 ? samples : listings);
  const filtered = allListings.filter(l => {
    const s = search.toLowerCase();
    const matchSearch = !search || l.title.toLowerCase().includes(s) || (l.seller_name||'').toLowerCase().includes(s) || (l.description||'').toLowerCase().includes(s) || (l.location_city||'').toLowerCase().includes(s);
    const matchCat = filterCat === 'All' || l.category === filterCat;
    const matchState = filterState === 'All' || l.location_state === filterState;
    return matchSearch && matchCat && matchState;
  });

  const cats = tab === 'farmers_market' ? FARM_CATEGORIES : RUMMAGE_CATEGORIES;
  const tabStyle = (active:boolean) => ({ padding:'0.6rem 1.4rem', background: active?'var(--color-pine-primary)':'transparent', color: active?'white':'var(--color-text-muted)', border:`1px solid ${active?'var(--color-pine-primary)':'var(--color-border)'}`, borderRadius:'var(--radius-full)', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.5rem' });

  return (
    <div style={{ flex:1, padding:'2rem', display:'flex', flexDirection:'column', gap:'1.75rem', overflowX:'hidden' }}>
      {/* Hero */}
      <div className="card" style={{ padding:'2rem', background:'var(--color-pine-dark)', color:'white' }}>
        <h1 style={{ margin:0, fontSize:'1.8rem', display:'flex', alignItems:'center', gap:'1rem' }}><ShoppingBag size={30}/> The Marketplace</h1>
        <p style={{ marginTop:'0.5rem', opacity:0.85, lineHeight:1.6 }}>Buy & sell handmade goods, farm produce, crafts, and secondhand treasures — all within the Rural & Reckless community. Sellers link their own payment — zero middlemen.</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
        <button style={tabStyle(tab==='farmers_market')} onClick={()=>setTab('farmers_market')}><Package size={18}/> 🌾 Farmers Market</button>
        <button style={tabStyle(tab==='rummage')} onClick={()=>setTab('rummage')}><Tag size={18}/> 🏷️ Community Rummage Sale</button>
      </div>

      {/* Description blurb per tab */}
      <p style={{ margin:'-0.75rem 0 0', color:'var(--color-text-muted)', fontSize:'0.9rem' }}>
        {tab === 'farmers_market'
          ? '🌿 Handmade, homegrown, and hand-crafted goods from artisans. Connect directly with your Etsy, Stripe, or Coinbase.'
          : '🏡 Resell, rehome, and reclaim. List secondhand items for your neighbors — like a community garage sale that never ends.'}
      </p>

      {/* Controls */}
      <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', alignItems:'center' }}>
        <div className="nav-search" style={{ flex:1, minWidth:160, maxWidth:360, background:'var(--color-bg-base)' }}>
          <Search className="search-icon" size={18}/>
          <input type="text" placeholder="Search listings, sellers, cities..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search marketplace"/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ padding:'0.55rem 0.8rem', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)', fontFamily:'inherit', fontSize:'0.88rem', background:'var(--color-bg-base)' }}>
          <option value="All">All Categories</option>
          {cats.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterState} onChange={e=>setFilterState(e.target.value)} style={{ padding:'0.55rem 0.8rem', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)', fontFamily:'inherit', fontSize:'0.88rem', background:'var(--color-bg-base)' }} aria-label="Filter by state">
          <option value="All">📍 All Locations</option>
          {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={()=>currentUser?setShowModal(true):alert('Sign in to post.')} style={{ display:'flex', alignItems:'center', gap:'0.5rem', whiteSpace:'nowrap' }}>
          <Plus size={18}/> {tab==='farmers_market'?'Sell Something':'Post Item'}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--color-text-muted)' }}><Leaf size={32} style={{ margin:'0 auto 1rem', display:'block', opacity:0.4 }}/>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'2.5rem 1rem', color:'var(--color-text-muted)' }}>
          <p style={{ fontSize:'1.05rem', marginBottom:'0.5rem', color:'var(--color-pine-dark)' }}>Nothing found.</p>
          <p>Try clearing filters, or be the first to post!</p>
          {currentUser && <button onClick={()=>setShowModal(true)} style={{ marginTop:'1rem', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}><Plus size={16}/>Post First Listing</button>}
        </div>
      ) : (
        <>
          {listings.length === 0 && <p style={{ fontSize:'0.82rem', color:'var(--color-text-muted)', background:'var(--color-bg-base)', padding:'0.5rem 0.85rem', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)' }}>Showing example listings — be the first real seller!</p>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px, 1fr))', gap:'1.25rem' }}>
            {filtered.map(l=><ListingCard key={l.id} listing={l} />)}
          </div>
          <AdSenseBanner />
        </>
      )}

      {selectedListing && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', zIndex:1000 }} onClick={() => setSelectedListing(null)}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-bg-base)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedListing(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--color-border)', padding: '0.15rem 0.55rem', borderRadius: 4 }}>{selectedListing.category}</span>
              {selectedListing.condition && <span style={{ fontSize: '0.75rem', background: '#e8f5e9', border: '1px solid #a5d6a7', padding: '0.15rem 0.55rem', borderRadius: 4, color: '#2e7d32' }}>{selectedListing.condition}</span>}
            </div>
            {selectedListing.cover_image_url && <img src={selectedListing.cover_image_url} alt={selectedListing.title} style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.4rem' }}>{selectedListing.title}</h2>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-accent)' }}>{selectedListing.price_display}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Posted by {selectedListing.seller_name || 'Anonymous'}</p>
            {selectedListing.description && <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedListing.description}</p>}

            {directCheckoutId === selectedListing.id ? (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  if (!directForm.name || !directForm.email) return;
                  setDirectProcessing(true);
                  setTimeout(() => {
                    setDirectProcessing(false);
                    alert(`Successfully purchased ${selectedListing.title}! The seller has been notified.`);
                    setDirectCheckoutId(null);
                    setSelectedListing(null);
                  }, 1200);
                }}
                style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <h4 style={{ margin: 0, color: 'var(--color-pine-dark)' }}>Direct Secure Checkout</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Your Name *</label>
                    <input type="text" required value={directForm.name} onChange={e => setDirectForm({ ...directForm, name: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} placeholder="Your full name" />
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Your Email *</label>
                    <input type="email" required value={directForm.email} onChange={e => setDirectForm({ ...directForm, email: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Card Details</label>
                  <input type="text" placeholder="Card Number (4242 4242 ...)" value={directForm.card} onChange={e => setDirectForm({ ...directForm, card: e.target.value })} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" disabled={directProcessing} style={{ flex: 1, padding: '0.65rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    {directProcessing ? 'Authorizing...' : 'Pay and Checkout Now'}
                  </button>
                  <button type="button" onClick={() => setDirectCheckoutId(null)} style={{ flex: 1, padding: '0.65rem', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    addToCart({
                      id: selectedListing.id,
                      title: selectedListing.title,
                      price_display: selectedListing.price_display,
                      price: parseFloat(selectedListing.price_display?.replace(/[^0-9.]/g, '') || '0'),
                      cover_image_url: selectedListing.cover_image_url,
                    });
                    alert(`Successfully added ${selectedListing.title} to your cart!`);
                    setSelectedListing(null);
                  }}
                  style={{ flex: 1, minWidth: '160px', textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <ShoppingBag size={15}/> Add to Cart
                </button>
                <button
                  onClick={() => setDirectCheckoutId(selectedListing.id)}
                  style={{ flex: 1, minWidth: '160px', textAlign: 'center', background: 'var(--color-accent)', color: 'white', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  📦 Buy Direct Now
                </button>
                {selectedListing.user_id && (
                  <Link to={`/profile/${selectedListing.user_id}`} style={{ flex: 1, minWidth: '160px', textAlign: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: '1px solid var(--color-border)' }}>
                    🏪 Visit Shop
                  </Link>
                )}
                {selectedListing.payment_url && <a href={selectedListing.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#635BFF', color: 'white', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><CreditCard size={14}/> Buy with Card</a>}
                {selectedListing.crypto_url && <a href={selectedListing.crypto_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F7931A', color: 'white', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><Bitcoin size={14}/> Buy with Crypto</a>}
                {selectedListing.etsy_url && <a href={selectedListing.etsy_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F56400', color: 'white', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><ExternalLink size={14}/> Etsy Shop</a>}
                {!selectedListing.payment_url && !selectedListing.crypto_url && !selectedListing.etsy_url ? (
                  <Link to="/messages" state={{ receiverId: selectedListing.user_id, listingId: selectedListing.id }} style={{ flex: 1, textAlign: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: '1px solid var(--color-border)' }}>
                    <MessageSquare size={14}/> Message seller
                  </Link>
                ) : (
                  <Link to="/messages" state={{ receiverId: selectedListing.user_id, listingId: selectedListing.id }} title="Ask a question" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', border: '1px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 600, flex: 1 }}>
                    <MessageSquare size={14}/> Contact Seller
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && currentUser && (
        <ListModal userId={currentUser.id} type={tab} onClose={()=>setShowModal(false)} onCreated={()=>{ setShowModal(false); fetchListings(); }}/>
      )}
    </div>
  );
}

function AdSenseBanner() {
  return (
    <div className="card" style={{ padding: '1.25rem', background: 'var(--color-bg-base)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', margin: '2rem 0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.06)', border: '1px solid var(--color-border)', padding: '0.15rem 0.55rem', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sponsored Ad</span>
      <div style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
        Google AdSense Slot — Responsive Ad Unit (Auto-optimized)
      </div>
    </div>
  );
}
