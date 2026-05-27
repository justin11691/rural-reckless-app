import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, X, CreditCard, Tag, Package, ExternalLink, Heart, Image as ImageIcon, Laptop, Sparkles, CheckCircle2, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { ThreeViewer } from './ThreeViewer';
import { parseContent } from '../lib/formatters';

const FARM_CATEGORIES = ['Woodworking','Pottery & Ceramics','Textiles & Quilts','Knitting Patterns','Candles & Soaps','Jewelry','Painting & Prints','Farm & Garden','Baked Goods','Leather Goods','Metalwork','Other Handmade'];
const RUMMAGE_CATEGORIES = ['Furniture','Tools','Clothing','Electronics','Books & Media','Toys & Games','Kitchen','Outdoor & Garden','Farm Equipment','Sporting Goods','Baby & Kids','Other'];
const DIGITAL_CATEGORIES = ['E-Books', '3D Models', 'Software', 'Digital Art', 'Other'];
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

const DIGITAL_SAMPLES = [
  { id:'d1', title:'Guide to Homesteading (E-Book)', seller_name:'Jane D.', category:'E-Books', price_display:'$15.00', cover_image_url:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', description:'A comprehensive 100-page guide to starting your homestead. \n\n**Contents:**\n- Planning your garden\n- Raising chickens\n- Composting basics', location_city:'', location_state:'', listing_type:'digital_goods', is_sample:true },
  { id:'d2', title:'Articulated Dragon (3D Model)', seller_name:'MakerJoe', category:'3D Models', price_display:'$5.00', cover_image_url:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600', description:'Fully articulated print-in-place dragon model. .STL included for your 3D printer.', location_city:'', location_state:'', listing_type:'digital_goods', is_sample:true }
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

// ── Modals ───────────────────────────────────────────────────────────────────
function ListModal({ onClose, onCreated, userId, type }: { onClose:()=>void; onCreated:()=>void; userId:string; type:'farmers_market'|'rummage' }) {
  const isFarm = type === 'farmers_market';
  const [form, setForm] = useState({ title:'', description:'', category: isFarm ? 'Woodworking' : 'Furniture', price_display:'', cover_image_url:'', payment_url:'', crypto_url:'', etsy_url:'', condition:'Good', location_city:'', location_state:'' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const S = { width:'100%', padding:'0.6rem 1rem', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', fontFamily:'inherit', fontSize:'0.95rem', background:'#fcfcfc', margin:0 };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, cover_image_url: publicUrl }));
    } catch (err: any) {
      alert('Failed to upload image: ' + err.message);
    } finally { setUploading(false); }
  }

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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
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
          <Field label="Photo" hint="Upload a photo of your item">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.6rem 1rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontWeight: 600 }}>
                <ImageIcon size={16} /> {uploading ? 'Uploading...' : 'Choose Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {form.cover_image_url && (
                <div style={{ position: 'relative', marginTop: '0.5rem', width: 'fit-content' }}>
                  <img src={form.cover_image_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, cover_image_url: '' }))} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border:'none', cursor:'pointer' }}>✕</button>
                </div>
              )}
            </div>
          </Field>
          <div style={{ background:'var(--color-bg-base)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', fontSize:'0.82rem', color:'var(--color-text-muted)' }}>
            💳 Payments go directly to you. Paste your Stripe, PayPal, or Etsy link below.
          </div>
          <Field label="💳 Card Payment Link"><input style={S} type="url" value={form.payment_url} onChange={e=>setForm({...form,payment_url:e.target.value})} placeholder="https://buy.stripe.com/..."/></Field>
          {isFarm && <Field label="🛍️ Etsy Link"><input style={S} type="url" value={form.etsy_url} onChange={e=>setForm({...form,etsy_url:e.target.value})} placeholder="https://etsy.com/shop/..."/></Field>}
          <button onClick={save} disabled={!form.title.trim()||!form.price_display.trim()||saving} style={{ width:'100%', padding:'0.85rem', fontSize:'1rem' }}>
            {saving ? 'Posting...' : '✅ Post Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DigitalPublishModal({ onClose, onCreated, userId }: { onClose:()=>void; onCreated:()=>void; userId:string }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title:'', category:'E-Books', price_display:'', payment_url:'', cover_image_url:'', raw_content:'', file_url:'' });
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiFinished, setAiFinished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const S = { width:'100%', padding:'0.6rem 1rem', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', fontFamily:'inherit', fontSize:'0.95rem', background:'#fcfcfc', margin:0 };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/digital_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      if (fileExt?.toLowerCase() === 'stl' || fileExt?.toLowerCase() === 'obj') {
        setForm(prev => ({ ...prev, file_url: publicUrl }));
      } else {
        setForm(prev => ({ ...prev, cover_image_url: publicUrl }));
      }
    } catch (err: any) {
      alert('Failed to upload file: ' + err.message);
    } finally { setUploading(false); }
  }

  function runAiFormatter() {
    if (!form.raw_content.trim()) return;
    setIsAiProcessing(true);
    // Simulate AI delay
    setTimeout(() => {
      // Basic mock formatting: Add Title, ensure paragraphs are spaced
      const formatted = `## ${form.title}\n\n*Edited with AI Assistant*\n\n${form.raw_content}`;
      setForm(prev => ({ ...prev, raw_content: formatted }));
      setIsAiProcessing(false);
      setAiFinished(true);
    }, 2500);
  }

  async function save() {
    if (!form.title.trim() || !form.price_display.trim()) return;
    const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', userId).single();
    const sellerName = profile?.full_name || profile?.username || 'Anonymous Creator';
    
    // We store the book text or the STL file url in the description for now
    const finalDescription = form.category === 'E-Books' ? form.raw_content : form.file_url ? `[3D_MODEL]${form.file_url}` : form.raw_content;

    const { error } = await supabase.from('market_listings').insert([{
      user_id: userId, seller_name: sellerName, title: form.title.trim(),
      description: finalDescription || null, category: form.category,
      price_display: form.price_display.trim(), cover_image_url: form.cover_image_url.trim() || null,
      payment_url: form.payment_url.trim() || null, listing_type: 'digital_goods'
    }]);
    
    if (error) alert('Could not publish: ' + error.message);
    else onCreated();
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div className="card" style={{ width:'100%', maxWidth:600, maxHeight:'92vh', overflowY:'auto', background:'var(--color-bg-card)', padding: '2rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ margin:0, display:'flex', alignItems:'center', gap:'0.5rem' }}><Laptop size={24}/> Self Publish Digital Goods</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={22}/></button>
        </div>

        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <Field label="What are you publishing?">
              <select style={S} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {DIGITAL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Title *"><input style={S} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Guide to Beekeeping"/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <Field label="Price *"><input style={S} value={form.price_display} onChange={e=>setForm({...form,price_display:e.target.value})} placeholder="$10.00"/></Field>
              <Field label="💳 Payment Link"><input style={S} type="url" value={form.payment_url} onChange={e=>setForm({...form,payment_url:e.target.value})} placeholder="Stripe/Gumroad link"/></Field>
            </div>
            
            <Field label="Cover Image">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.6rem 1rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <ImageIcon size={16} /> {uploading ? 'Uploading...' : 'Upload Cover'}
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </Field>

            <button onClick={() => setStep(2)} disabled={!form.title.trim()||!form.price_display.trim()} style={{ marginTop:'1rem', padding:'0.85rem' }}>Next Step →</button>
          </div>
        )}

        {step === 2 && form.category === 'E-Books' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div style={{ background:'var(--color-bg-base)', padding:'1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)' }}>
              <h4 style={{ margin:'0 0 0.5rem', display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--color-pine-dark)' }}><Sparkles size={16} color="var(--color-accent)"/> AI Assistant</h4>
              <p style={{ margin:0, fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Paste your rough draft below. Our AI will automatically format it, check spelling, and prepare it for publishing.</p>
            </div>
            <textarea 
              style={{ ...S, minHeight:'200px', resize:'vertical', fontFamily: aiFinished ? 'serif' : 'inherit' } as any} 
              value={form.raw_content} 
              onChange={e=>setForm({...form,raw_content:e.target.value})} 
              placeholder="Paste your chapter or entire book text here..."
              disabled={isAiProcessing}
            />
            {isAiProcessing && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--color-pine-primary)', fontWeight:600 }}>
                <div className="spinner" style={{ width:16, height:16, border:'2px solid var(--color-pine-primary)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                AI is formatting your book...
              </div>
            )}
            {aiFinished && !isAiProcessing && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#2e7d32', fontWeight:600 }}>
                <CheckCircle2 size={18}/> Formatting complete!
              </div>
            )}
            
            <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
              <button onClick={()=>setStep(1)} style={{ background:'transparent', color:'var(--color-text-main)', border:'1px solid var(--color-border)' }}>Back</button>
              {!aiFinished ? (
                <button onClick={runAiFormatter} disabled={isAiProcessing||!form.raw_content.trim()} style={{ flex:1, background:'var(--color-pine-dark)' }}><Sparkles size={16}/> Enhance with AI</button>
              ) : (
                <button onClick={save} style={{ flex:1 }}>Publish Book</button>
              )}
            </div>
          </div>
        )}

        {step === 2 && form.category !== 'E-Books' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <Field label="Upload Digital File">
              <div style={{ border:'2px dashed var(--color-border)', padding:'2rem', textAlign:'center', borderRadius:'var(--radius-lg)', background:'var(--color-bg-base)' }}>
                <UploadCloud size={32} color="var(--color-text-muted)" style={{ margin:'0 auto 1rem' }}/>
                <label style={{ display: 'inline-flex', cursor: 'pointer', padding: '0.6rem 1rem', background: 'var(--color-pine-primary)', color:'white', borderRadius: 'var(--radius-md)', fontWeight:600 }}>
                  Select File (.STL, .OBJ, .ZIP)
                  <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
                {uploading && <p style={{ marginTop:'1rem', fontSize:'0.85rem' }}>Uploading...</p>}
                {form.file_url && <p style={{ marginTop:'1rem', fontSize:'0.85rem', color:'#2e7d32', fontWeight:600 }}><CheckCircle2 size={16} style={{ verticalAlign:'middle' }}/> File attached successfully</p>}
              </div>
            </Field>
            <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
              <button onClick={()=>setStep(1)} style={{ background:'transparent', color:'var(--color-text-main)', border:'1px solid var(--color-border)' }}>Back</button>
              <button onClick={save} style={{ flex:1 }} disabled={!form.file_url}>Publish Item</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Cards ────────────────────────────────────────────────────────────────────
function ListingCard({ listing, currentUser, isFavorited, onToggleFavorite }: { listing:any; currentUser:any; isFavorited:boolean; onToggleFavorite:(id:string, currentlyFav:boolean)=>void }) {
  const isSample = listing.is_sample;
  const navigate = useNavigate();
  return (
    <div className="card" onClick={() => navigate(`/market/listing/${listing.id}`)} style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer', position:'relative' }}>
      {currentUser && !isSample && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id, isFavorited); }}
          style={{ position:'absolute', top:'0.5rem', right:'0.5rem', background:'rgba(255,255,255,0.9)', border:'none', color:isFavorited?'var(--color-rust)':'var(--color-text-muted)', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, padding:0 }}
        >
          <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
        </button>
      )}

      {listing.cover_image_url
        ? <img src={listing.cover_image_url} alt={listing.title} style={{ width:'100%', height:170, objectFit:'cover' }} loading="lazy"/>
        : <div style={{ height:120, background:'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' }}>🌿</div>
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
        
        {/* We parse description just enough for snippet */}
        {listing.description && !listing.description.startsWith('[3D_MODEL]') && <div style={{ margin:'0.15rem 0 0', fontSize:'0.82rem', color:'var(--color-text-main)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' } as any}>{listing.description.substring(0, 100)}...</div>}
        
        <div style={{ marginTop:'auto', paddingTop:'0.75rem', display:'flex', gap:'0.4rem', flexWrap:'wrap' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => {
              addToCart({ id:listing.id, title:listing.title, price_display:listing.price_display, price:parseFloat(listing.price_display?.replace(/[^0-9.]/g,'')||'0'), cover_image_url:listing.cover_image_url });
              alert(`Successfully added ${listing.title} to your cart!`);
            }}
            style={{ flex:1, minWidth:'100px', textAlign:'center', background:'var(--color-pine-primary)', color:'white', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', fontWeight:600, fontSize:'0.8rem', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.25rem' }}
          >
            <ShoppingBag size={12}/> Add to Cart
          </button>
          {isSample ? (
            <button onClick={() => navigate(`/market/listing/${listing.id}`)} style={{ flex:1, minWidth:'80px', textAlign:'center', background:'var(--color-bg-base)', color:'var(--color-text-main)', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', fontWeight:600, fontSize:'0.8rem', border:'1px solid var(--color-border)', cursor:'pointer' }}>Details</button>
          ) : (<>
            {listing.payment_url && <a href={listing.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex:1, minWidth:'70px', textAlign:'center', background:'#635BFF', color:'white', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-md)', textDecoration:'none', fontWeight:600, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}><CreditCard size={12}/> Buy</a>}
          </>)}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function Marketplace() {
  const [tab, setTab] = useState<'farmers_market'|'rummage'|'digital_goods'>('farmers_market');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  
  const [selectedListing, setSelectedListing] = useState<any|null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data:{session} }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) fetchFavorites(session.user.id);
    });
  }, []);

  async function fetchFavorites(userId: string) {
    const { data } = await supabase.from('favorites').select('item_id').eq('user_id', userId).eq('item_type', 'market_listing');
    if (data) setFavoritedIds(new Set(data.map(f => f.item_id)));
  }

  async function toggleFavorite(listingId: string, currentlyFav: boolean) {
    if (!currentUser) return;
    const newFavs = new Set(favoritedIds);
    if (currentlyFav) newFavs.delete(listingId); else newFavs.add(listingId);
    setFavoritedIds(newFavs);

    if (currentlyFav) await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('item_id', listingId).eq('item_type', 'market_listing');
    else await supabase.from('favorites').insert([{ user_id: currentUser.id, item_id: listingId, item_type: 'market_listing' }]);
  }

  useEffect(() => { fetchListings(); }, [tab]);

  async function fetchListings() {
    setLoading(true);
    setFilterCat('All');
    const { data } = await supabase.from('market_listings').select('*').eq('listing_type', tab).order('created_at', { ascending:false });
    setListings(data || []);
    setLoading(false);
  }

  const samples = tab === 'farmers_market' ? FARM_SAMPLES : tab === 'rummage' ? RUMMAGE_SAMPLES : DIGITAL_SAMPLES;
  const allListings = loading ? [] : (listings.length === 0 ? samples : listings);
  const filtered = allListings.filter(l => {
    const s = search.toLowerCase();
    const matchSearch = !search || l.title.toLowerCase().includes(s) || (l.seller_name||'').toLowerCase().includes(s) || (l.description||'').toLowerCase().includes(s);
    const matchCat = filterCat === 'All' || l.category === filterCat;
    return matchSearch && matchCat;
  });

  const cats = tab === 'farmers_market' ? FARM_CATEGORIES : tab === 'rummage' ? RUMMAGE_CATEGORIES : DIGITAL_CATEGORIES;

  const NavButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button 
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem',
        background: tab === id ? 'var(--color-pine-primary)' : 'transparent',
        color: tab === id ? 'white' : 'var(--color-pine-dark)',
        border: 'none', borderRadius: 'var(--radius-md)', textAlign: 'left',
        fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: tab === id ? 'var(--shadow-sm)' : 'none'
      }}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div style={{ flex: 1, padding: '2rem 1.5rem', overflowX: 'hidden' }}>
      <div className="communities-layout">
        
        {/* Left Sidebar */}
        <aside className="communities-left-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <NavButton id="farmers_market" icon={Package} label="Farmers Market" />
            <NavButton id="rummage" icon={Tag} label="Rummage Sale" />
            <NavButton id="digital_goods" icon={Laptop} label="Digital Goods" />
          </div>

          <button 
            onClick={() => {
              if(!currentUser){ alert('Sign in first!'); return; }
              if(tab === 'digital_goods') setShowDigitalModal(true);
              else setShowModal(true);
            }} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', background: 'var(--color-bg-card)', color: 'var(--color-pine-dark)', border: '2px solid var(--color-pine-dark)' }}
          >
            <Plus size={18} /> {tab === 'digital_goods' ? 'Publish Digital Item' : 'Post New Item'}
          </button>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button onClick={() => setFilterCat('All')} style={{ background:'transparent', border:'none', textAlign:'left', padding:'0.4rem 0.5rem', color: filterCat==='All'?'var(--color-pine-primary)':'var(--color-text-muted)', fontWeight:filterCat==='All'?700:500, cursor:'pointer' }}>All Categories</button>
              {cats.map(c => (
                <button key={c} onClick={() => setFilterCat(c)} style={{ background:'transparent', border:'none', textAlign:'left', padding:'0.4rem 0.5rem', color: filterCat===c?'var(--color-pine-primary)':'var(--color-text-muted)', fontWeight:filterCat===c?700:500, cursor:'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hero */}
            <div className="card" style={{ padding:'2rem', background:'var(--color-pine-dark)', color:'white' }}>
              <h1 style={{ display:'flex', alignItems:'center', gap:'1rem', margin:0, fontSize:'1.8rem' }}><ShoppingBag size={28}/> The Marketplace</h1>
              <p style={{ marginTop:'0.5rem', opacity:0.85, fontSize:'1rem' }}>
                {tab === 'farmers_market' ? '🌿 Handmade, homegrown, and hand-crafted goods from local artisans.' : 
                 tab === 'rummage' ? '🏡 Resell, rehome, and reclaim. List secondhand items for your neighbors.' :
                 '💻 Self-publish your E-Books, 3D models, and digital art directly to the community.'}
              </p>
            </div>

            {/* Search */}
            <div className="nav-search" style={{ background:'var(--color-bg-base)', position: 'relative' }}>
              <Search className="search-icon" size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}/>
              <input type="text" placeholder="Search titles, sellers..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width: '100%' }}/>
            </div>

            {/* Grid */}
            {loading ? (
              <p style={{ color:'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Loading items…</p>
            ) : filtered.length === 0 ? (
              <div className="card" style={{ textAlign:'center', padding:'2.5rem 1rem', color:'var(--color-text-muted)' }}>
                <p style={{ fontSize:'1.05rem', marginBottom:'0.5rem', color:'var(--color-pine-dark)' }}>Nothing found.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'1.25rem' }}>
                {filtered.map(l=><ListingCard key={l.id} listing={l} currentUser={currentUser} isFavorited={favoritedIds.has(l.id)} onToggleFavorite={toggleFavorite}/>)}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', zIndex:1000 }} onClick={() => setSelectedListing(null)}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-bg-base)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedListing(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.6rem' }}>{selectedListing.title}</h2>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>{selectedListing.price_display}</span>
            </div>
            
            {/* Media / 3D Viewer */}
            {selectedListing.description?.startsWith('[3D_MODEL]') ? (
              <ThreeViewer url={selectedListing.description.replace('[3D_MODEL]', '')} />
            ) : selectedListing.cover_image_url ? (
              <img src={selectedListing.cover_image_url} alt={selectedListing.title} style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
            ) : null}

            {/* Content */}
            <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              {selectedListing.description && !selectedListing.description.startsWith('[3D_MODEL]') ? (
                selectedListing.category === 'E-Books' ? (
                  parseContent(selectedListing.description)
                ) : (
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedListing.description}</p>
                )
              ) : null}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {selectedListing.payment_url && <a href={selectedListing.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: '200px', textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><CreditCard size={18}/> Buy Now</a>}
              {selectedListing.etsy_url && <a href={selectedListing.etsy_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F56400', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><ExternalLink size={18}/> View on Etsy</a>}
            </div>
          </div>
        </div>
      )}

      {showModal && currentUser && (
        <ListModal userId={currentUser.id} type={tab as any} onClose={()=>setShowModal(false)} onCreated={()=>{ setShowModal(false); fetchListings(); }}/>
      )}
      {showDigitalModal && currentUser && (
        <DigitalPublishModal userId={currentUser.id} onClose={()=>setShowDigitalModal(false)} onCreated={()=>{ setShowDigitalModal(false); fetchListings(); }}/>
      )}
    </div>
  );
}
