import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Users, Search, MessageSquare, ExternalLink, MapPin, ShoppingBag } from 'lucide-react';

export function DiscoverUsers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterArtForm, setFilterArtForm] = useState('All');
  const [subTab, setSubTab] = useState<'makers' | 'storefronts'>('makers');

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('username', { ascending: true });
    setProfiles(data || []);
    setLoading(false);
  }

  // Parse custom metadata tokens if present in about_me
  const parsedProfiles = profiles.map(p => {
    let about = p.about_me || '';
    let artForm = 'General Artisan & Maker';

    if (about.includes('ART_FORM_JSON:')) {
      const parts = about.split('ART_FORM_JSON:');
      about = parts[0].trim();
      const stylePart = parts[1].split('PHYSICAL_STORE_JSON:')[0].split('PORTFOLIO_JSON:')[0].split('FRIENDS_JSON:')[0].trim();
      artForm = stylePart;
    }

    return { ...p, plain_about: about, art_form: artForm };
  });

  const filtered = parsedProfiles.filter(p => {
    const s = search.toLowerCase();
    const matchSearch =
      (p.full_name && p.full_name.toLowerCase().includes(s)) ||
      (p.username && p.username.toLowerCase().includes(s)) ||
      (p.plain_about && p.plain_about.toLowerCase().includes(s)) ||
      (p.tagline && p.tagline.toLowerCase().includes(s));

    if (filterArtForm === 'All') return matchSearch;
    return matchSearch && p.art_form === filterArtForm;
  });

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'var(--color-bg-alt)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={28} /> Discover Artisans & Makers
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Search, filter, and connect with creative people in the community.
          </p>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setSubTab('makers')}
          style={{ padding: '0.6rem 1.25rem', background: subTab === 'makers' ? 'var(--color-pine-primary)' : 'transparent', color: subTab === 'makers' ? 'white' : 'var(--color-text-main)', border: subTab === 'makers' ? 'none' : '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Users size={16} /> Artisans & Makers
        </button>
        <button
          onClick={() => setSubTab('storefronts')}
          style={{ padding: '0.6rem 1.25rem', background: subTab === 'storefronts' ? 'var(--color-pine-primary)' : 'transparent', color: subTab === 'storefronts' ? 'white' : 'var(--color-text-main)', border: subTab === 'storefronts' ? 'none' : '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ShoppingBag size={16} /> Browse Storefronts
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="post-input"
            placeholder="Search by name, username, or tagline..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', margin: 0, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
          />
        </div>
        {subTab === 'makers' && (
          <select
            className="post-input"
            value={filterArtForm}
            onChange={e => setFilterArtForm(e.target.value)}
            style={{ width: '220px', padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', margin: 0, border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', fontWeight: 600, color: 'var(--color-text-main)' }}
          >
            <option value="All">All Creative Styles</option>
            <option value="General">General Artisan & Maker</option>
            <option value="Pottery">Pottery & Ceramics</option>
            <option value="Tattoo">Tattoo & Flash Artist</option>
            <option value="Digital">Digital & 3D Print Art</option>
            <option value="Custom Painter">Fine Art & Custom Painter</option>
            <option value="Photography">Photography & Prints</option>
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <Users size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
          Gathering the makers...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.45rem', color: 'var(--color-pine-dark)' }}>No makers found.</p>
          <p>Try clearing your search terms or filters.</p>
        </div>
      ) : subTab === 'storefronts' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '0.85rem', border: '1px solid var(--color-border)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={p.avatar_url || '/images/avatar_maker.png'}
                  alt={p.username || 'User'}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-pine-dark)' }}>
                    {p.store_name || `${p.full_name || p.username}'s Storefront`}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    By {p.full_name || p.username}
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', minHeight: '38px', lineHeight: 1.4 }}>
                {p.tagline || 'Artisanal products & bespoke handmade goods directly from our workshop.'}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '0.85rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <Link to={`/profile/${p.id}`} style={{ flex: 1, textDecoration: 'none', background: 'var(--color-pine-primary)', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  🏪 Visit Storefront
                </Link>
                {p.website && (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <ExternalLink size={14} /> Official Shop Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '0.85rem', position: 'relative', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={p.avatar_url || '/images/avatar_maker.png'}
                  alt={p.username || 'User'}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-pine-light)' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-pine-dark)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {p.full_name || p.username || 'Artisan Maker'}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    @{p.username || 'anonymous'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', background: 'var(--color-pine-light)', border: '1px solid var(--color-border)', padding: '0.15rem 0.55rem', borderRadius: '12px', color: 'var(--color-pine-dark)', fontWeight: 600 }}>
                  🎨 {p.art_form}
                </span>
                {p.location_state && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.04)', border: '1px solid var(--color-border)', padding: '0.15rem 0.55rem', borderRadius: '12px', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={11} /> {p.location_state}
                  </span>
                )}
              </div>

              {p.tagline && (
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-main)', fontStyle: 'italic', borderLeft: '3px solid var(--color-pine-light)', paddingLeft: '0.5rem' }}>
                  "{p.tagline}"
                </p>
              )}

              {p.plain_about && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                  {p.plain_about}
                </p>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/profile/${p.id}`} style={{ flex: 1, textDecoration: 'none', background: 'var(--color-pine-primary)', color: 'white', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <ExternalLink size={14} /> View Profile
                </Link>
                <Link to="/messages" state={{ receiverId: p.id }} style={{ textDecoration: 'none', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
