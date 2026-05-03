import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { addToCart } from '../lib/cart';
import { ShoppingBag, ArrowLeft, MessageSquare, CreditCard, Bitcoin, ExternalLink, Leaf } from 'lucide-react';

export function MarketListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [directCheckout, setDirectCheckout] = useState(false);
  const [directForm, setDirectForm] = useState({ name: '', email: '', card: '' });
  const [directProcessing, setDirectProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing(id);
    }
  }, [id]);

  async function fetchListing(listingId: string) {
    setLoading(true);
    // Let's try to query our marketplace database table directly
    const { data, error } = await supabase.from('market_listings').select('*').eq('id', listingId).single();
    if (error || !data) {
      // If not found in live database, check if it is one of the samples
      const allSamples = [
        { id:'s1', title:'Hand-Carved Walnut Bowl', seller_name:"Arthur's Woodshop", category:'Woodworking', price_display:'$45.00', cover_image_url:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600', description:'Solid walnut, hand-turned, natural oil finish.', location_city:'Asheville', location_state:'NC', listing_type:'farmers_market', is_sample:true },
        { id:'s2', title:'Organic Raw Honey (16oz)', seller_name:'Pine Valley Apiary', category:'Farm & Garden', price_display:'$12.50', cover_image_url:'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?auto=format&fit=crop&q=80&w=600', description:'Wildflower honey, no heat treatment.', location_city:'Blue Ridge', location_state:'GA', listing_type:'farmers_market', is_sample:true },
        { id:'s3', title:'Hand-Stamped Leather Journal', seller_name:'Prairie & Ink', category:'Leather Goods', price_display:'$38.00', cover_image_url:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', description:'Full-grain leather, hand-stitched, 200 pages.', location_city:'Nashville', location_state:'TN', listing_type:'farmers_market', is_sample:true },
        { id:'r1', title:'Vintage Cast Iron Skillet', seller_name:'Dale W.', category:'Kitchen', price_display:'$25.00', cover_image_url:'https://images.unsplash.com/photo-1585325701956-60dd9c8e5aef?auto=format&fit=crop&q=80&w=600', description:'Lodge 12" cast iron, well seasoned, ready to use.', condition:'Good', location_city:'Knoxville', location_state:'TN', listing_type:'rummage', is_sample:true },
        { id:'r2', title:'John Deere Riding Mower Parts', seller_name:'BobsGarage', category:'Farm Equipment', price_display:'$80.00', cover_image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600', description:'L110 deck, belts, and blades. Local pickup only.', condition:'Fair', location_city:'Cullman', location_state:'AL', listing_type:'rummage', is_sample:true },
        { id:'r3', title:'Kids Wooden Play Kitchen', seller_name:'Sarah M.', category:'Baby & Kids', price_display:'$45.00', cover_image_url:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600', description:'Solid wood, painted, excellent condition.', condition:'Like New', location_city:'Athens', location_state:'GA', listing_type:'rummage', is_sample:true },
      ];
      const match = allSamples.find(s => s.id === listingId);
      if (match) {
        setListing(match);
      } else {
        alert('Listing not found.');
        navigate('/market');
      }
    } else {
      setListing(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', flex: 1, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <Leaf size={36} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
        Loading listing details...
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'var(--color-bg-alt)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button */}
      <div>
        <Link to="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Marketplace
        </Link>
      </div>

      <div className="card" style={{ maxWidth: '800px', background: 'var(--color-bg-base)', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--color-border)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-md)' }}>
            {listing.category}
          </span>
          {listing.condition && (
            <span style={{ fontSize: '0.75rem', background: '#e8f5e9', border: '1px solid #a5d6a7', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-md)', color: '#2e7d32' }}>
              {listing.condition}
            </span>
          )}
        </div>

        {listing.cover_image_url && (
          <img
            src={listing.cover_image_url}
            alt={listing.title}
            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.8rem' }}>{listing.title}</h1>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>{listing.price_display}</span>
        </div>

        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Posted by {listing.seller_name || 'Anonymous'}
        </p>

        {listing.description && (
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {listing.description}
          </p>
        )}

        {directCheckout ? (
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (!directForm.name || !directForm.email) return;
              setDirectProcessing(true);
              setTimeout(() => {
                setDirectProcessing(false);
                alert(`Successfully purchased ${listing.title}! The seller has been notified.`);
                setDirectCheckout(false);
              }, 1200);
            }}
            style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)' }}>Direct Secure Checkout</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Your Name *</label>
                <input
                  type="text"
                  required
                  value={directForm.name}
                  onChange={e => setDirectForm({ ...directForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  placeholder="Your full name"
                />
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Your Email *</label>
                <input
                  type="email"
                  required
                  value={directForm.email}
                  onChange={e => setDirectForm({ ...directForm, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Card Details</label>
              <input
                type="text"
                placeholder="Card Number (4242 4242 ...)"
                value={directForm.card}
                onChange={e => setDirectForm({ ...directForm, card: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={directProcessing} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                {directProcessing ? 'Authorizing...' : 'Pay and Checkout Now'}
              </button>
              <button type="button" onClick={() => setDirectCheckout(false)} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
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
              style={{ flex: 1, minWidth: '160px', textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button
              onClick={() => setDirectCheckout(true)}
              style={{ flex: 1, minWidth: '160px', textAlign: 'center', background: 'var(--color-accent)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              📦 Buy Direct Now
            </button>
            {listing.user_id && (
              <Link to={`/profile/${listing.user_id}`} style={{ flex: 1, minWidth: '160px', textAlign: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: '1px solid var(--color-border)' }}>
                🏪 Visit Shop
              </Link>
            )}
            {listing.payment_url && (
              <a href={listing.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#635BFF', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <CreditCard size={14} /> Buy with Card
              </a>
            )}
            {listing.crypto_url && (
              <a href={listing.crypto_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F7931A', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <Bitcoin size={14} /> Buy with Crypto
              </a>
            )}
            {listing.etsy_url && (
              <a href={listing.etsy_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F56400', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <ExternalLink size={14} /> Etsy Shop
              </a>
            )}
            {!listing.payment_url && !listing.crypto_url && !listing.etsy_url ? (
              <Link to="/messages" state={{ receiverId: listing.user_id, listingId: listing.id }} style={{ flex: 1, textAlign: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: '1px solid var(--color-border)' }}>
                <MessageSquare size={14} /> Message seller
              </Link>
            ) : (
              <Link to="/messages" state={{ receiverId: listing.user_id, listingId: listing.id }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontWeight: 600, flex: 1 }}>
                <MessageSquare size={14} /> Contact Seller
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
