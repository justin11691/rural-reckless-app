import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, ShoppingBag, TreePine } from 'lucide-react';

// Sample listings — shown to guests to demonstrate the marketplace
const SAMPLE_LISTINGS = [
  {
    id: 'g1',
    title: 'Hand-Carved Walnut Bowl',
    seller_name: "Arthur's Woodshop",
    category: 'Woodworking',
    price_display: '$45.00',
    cover_image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600',
    description: 'Solid walnut, hand-turned, natural oil finish.',
    location_city: 'Asheville',
    location_state: 'NC',
  },
  {
    id: 'g2',
    title: 'Organic Raw Honey (16oz)',
    seller_name: 'Pine Valley Apiary',
    category: 'Farm & Garden',
    price_display: '$12.50',
    cover_image_url: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?auto=format&fit=crop&q=80&w=600',
    description: 'Wildflower honey, no heat treatment.',
    location_city: 'Blue Ridge',
    location_state: 'GA',
  },
  {
    id: 'g3',
    title: 'Hand-Stamped Leather Journal',
    seller_name: 'Prairie & Ink',
    category: 'Leather Goods',
    price_display: '$38.00',
    cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    description: 'Full-grain leather, hand-stitched, 200 pages.',
    location_city: 'Nashville',
    location_state: 'TN',
  },
  {
    id: 'g4',
    title: 'Vintage Cast Iron Skillet',
    seller_name: 'Dale W.',
    category: 'Kitchen',
    price_display: '$25.00',
    cover_image_url: 'https://images.unsplash.com/photo-1585325701956-60dd9c8e5aef?auto=format&fit=crop&q=80&w=600',
    description: 'Lodge 12", well seasoned, ready to use.',
    location_city: 'Knoxville',
    location_state: 'TN',
  },
  {
    id: 'g5',
    title: 'Beeswax Candles — Set of 4',
    seller_name: 'Hearthside Goods',
    category: 'Candles & Soaps',
    price_display: '$22.00',
    cover_image_url: 'https://images.unsplash.com/photo-1603905367-0cebbab68879?auto=format&fit=crop&q=80&w=600',
    description: 'Pure beeswax, cotton wick. Long, clean burn.',
    location_city: 'Brevard',
    location_state: 'NC',
  },
  {
    id: 'g6',
    title: 'Hand-Dyed Linen Tote Bag',
    seller_name: 'River & Root Studio',
    category: 'Textiles & Quilts',
    price_display: '$34.00',
    cover_image_url: 'https://images.unsplash.com/photo-1592917020925-53f3a7a1474c?auto=format&fit=crop&q=80&w=600',
    description: 'Natural indigo dye on 100% linen. One of a kind.',
    location_city: 'Boone',
    location_state: 'NC',
  },
];

const SAMPLE_COMMUNITIES = [
  { id: 'c1', name: 'Backyard Beekeepers', category: 'Homesteading', icon: '🐝', member_count: 47, description: 'Share hive updates, ask questions, swap local honey.' },
  { id: 'c2', name: 'Hand-Tool Woodworkers', category: 'Woodworking', icon: '🪵', member_count: 31, description: 'No power tools needed. Just sharp edges and patience.' },
  { id: 'c3', name: 'Rural Reads', category: 'Reading Club', icon: '📖', member_count: 22, description: 'A slow book club for people who like their reading like their coffee: unhurried.' },
  { id: 'c4', name: 'Seed Savers Collective', category: 'Farming', icon: '🌱', member_count: 58, description: 'Trade open-pollinated seeds, share growing notes, and keep varieties alive.' },
];

function SoftJoinBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1B3B2B 0%, #0c1a13 100%)',
      borderRadius: '12px',
      padding: '1.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '2rem',
    }}>
      <div>
        <p style={{ margin: 0, color: '#A1C79D', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
          You're browsing as a guest
        </p>
        <p style={{ margin: 0, color: '#FFFFFF', fontSize: '1rem', fontWeight: 600 }}>
          Join free to buy, sell, and participate.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/login" style={{
          textDecoration: 'none',
          background: '#2D5A27',
          color: '#FFFFFF',
          padding: '0.6rem 1.4rem',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          Create Free Account
        </Link>
        <Link to="/login" style={{
          textDecoration: 'none',
          background: 'transparent',
          color: '#A1C79D',
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.9rem',
          border: '1px solid rgba(161,199,157,0.3)',
        }}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: typeof SAMPLE_LISTINGS[0] }) {
  const [showPrompt, setShowPrompt] = useState(false);
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E8EDE6',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
      onClick={() => setShowPrompt(true)}
    >
      <img
        src={listing.cover_image_url}
        alt={listing.title}
        style={{ width: '100%', height: 180, objectFit: 'cover' }}
        loading="lazy"
      />
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <span style={{ fontSize: '0.7rem', color: '#6B8A6B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {listing.category}
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1B3B2B', lineHeight: 1.3, fontWeight: 700 }}>
            {listing.title}
          </h3>
          <span style={{ fontWeight: 800, color: '#2D5A27', flexShrink: 0, fontSize: '0.95rem' }}>
            {listing.price_display}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B8A6B' }}>by {listing.seller_name}</p>
        {(listing.location_city || listing.location_state) && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9FB89F', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <MapPin size={10} /> {[listing.location_city, listing.location_state].filter(Boolean).join(', ')}
          </p>
        )}
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#4A6741', lineHeight: 1.5 }}>
          {listing.description}
        </p>
      </div>

      {/* Soft join prompt — shows on click, not a hard wall */}
      {showPrompt && (
        <div
          style={{ padding: '0.9rem 1rem', background: '#f0f7ef', borderTop: '1px solid #d4e8d0' }}
          onClick={e => e.stopPropagation()}
        >
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: '#1B3B2B', fontWeight: 600 }}>
            Join free to message the seller or add to cart.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/login"
              style={{
                flex: 1, textAlign: 'center', background: '#2D5A27', color: 'white',
                padding: '0.5rem 0.75rem', borderRadius: '6px', textDecoration: 'none',
                fontSize: '0.82rem', fontWeight: 700,
              }}
            >
              Join Free
            </Link>
            <button
              onClick={() => setShowPrompt(false)}
              style={{
                background: 'transparent', border: '1px solid #c5dcc3', color: '#6B8A6B',
                padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community }: { community: typeof SAMPLE_COMMUNITIES[0] }) {
  const [showPrompt, setShowPrompt] = useState(false);
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E8EDE6',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: '#EEF5ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', flexShrink: 0,
        }}>
          {community.icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#1B3B2B', fontWeight: 700 }}>{community.name}</h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B8A6B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={11} /> {community.member_count} members · {community.category}
          </p>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '0.87rem', color: '#4A6741', lineHeight: 1.55 }}>
        {community.description}
      </p>
      {showPrompt ? (
        <div style={{ background: '#f0f7ef', borderRadius: '8px', padding: '0.85rem', border: '1px solid #d4e8d0' }}>
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: '#1B3B2B', fontWeight: 600 }}>
            Join free to participate in this community.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/login"
              style={{
                flex: 1, textAlign: 'center', background: '#2D5A27', color: 'white',
                padding: '0.5rem', borderRadius: '6px', textDecoration: 'none',
                fontSize: '0.82rem', fontWeight: 700,
              }}
            >
              Create Account
            </Link>
            <button
              onClick={() => setShowPrompt(false)}
              style={{
                background: 'transparent', border: '1px solid #c5dcc3', color: '#6B8A6B',
                padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button
            onClick={() => setShowPrompt(true)}
            style={{
              flex: 1, background: '#2D5A27', color: 'white', border: 'none',
              padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Join Community
          </button>
          <button
            onClick={() => setShowPrompt(true)}
            style={{
              background: 'transparent', border: '1px solid #D0DFD0', color: '#4A6741',
              padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Preview →
          </button>
        </div>
      )}
    </div>
  );
}

export function GuestExplore() {
  const [tab, setTab] = useState<'market' | 'communities'>('market');

  const tabBtn = (active: boolean) => ({
    padding: '0.55rem 1.3rem',
    background: active ? '#2D5A27' : 'transparent',
    color: active ? 'white' : '#6B8A6B',
    border: `1px solid ${active ? '#2D5A27' : '#D0DFD0'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F6FAF5',
      fontFamily: 'Outfit, Inter, sans-serif',
    }}>
      {/* Nav */}
      <header style={{
        background: 'linear-gradient(135deg, #1B3B2B 0%, #0c1a13 100%)',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'white' }}>
          <TreePine size={24} color="#4A7C43" />
          <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>Rural &amp; Reckless</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#A1C79D', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            Sign In
          </Link>
          <Link to="/login" style={{
            background: '#2D5A27', color: 'white', textDecoration: 'none',
            padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700,
          }}>
            Join Free
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
        <SoftJoinBanner />

        {/* Page title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.8rem', color: '#1B3B2B', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Browse Rural &amp; Reckless
          </h1>
          <p style={{ margin: 0, color: '#6B8A6B', fontSize: '1rem' }}>
            Handmade goods, local finds, and communities for makers. No account needed to look around.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button style={tabBtn(tab === 'market')} onClick={() => setTab('market')}>
            <ShoppingBag size={16} /> Marketplace
          </button>
          <button style={tabBtn(tab === 'communities')} onClick={() => setTab('communities')}>
            <Users size={16} /> Communities
          </button>
        </div>

        {tab === 'market' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#9FB89F', background: '#EEF5ED', padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #D4E8D0' }}>
                Showing sample listings — <Link to="/login" style={{ color: '#2D5A27', fontWeight: 700, textDecoration: 'none' }}>join free</Link> to see all real listings and post your own.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {SAMPLE_LISTINGS.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </>
        )}

        {tab === 'communities' && (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#9FB89F', background: '#EEF5ED', padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #D4E8D0', display: 'inline-block' }}>
                <Link to="/login" style={{ color: '#2D5A27', fontWeight: 700, textDecoration: 'none' }}>Join free</Link> to post, participate, and start your own group.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {SAMPLE_COMMUNITIES.map(c => <CommunityCard key={c.id} community={c} />)}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: '3rem',
          background: 'linear-gradient(135deg, #1B3B2B 0%, #0c1a13 100%)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          color: 'white',
        }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Ready to find your people?
          </h2>
          <p style={{ margin: '0 0 1.5rem', color: '#A1C79D', fontSize: '1rem' }}>
            Free to join. No algorithm. You keep what you earn.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#2D5A27', color: 'white', textDecoration: 'none',
              padding: '0.85rem 2rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700,
            }}
          >
            Create Your Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
