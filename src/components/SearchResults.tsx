import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, User, FileText, ShoppingBag, Leaf, ExternalLink } from 'lucide-react';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) return;
    performSearch();
  }, [query]);

  async function performSearch() {
    setLoading(true);
    setError('');

    try {
      // 1. Search Users/Makers
      const { data: usersData, error: usersErr } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, tagline, location_state')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,tagline.ilike.%${query}%`)
        .limit(10);

      if (usersErr) throw usersErr;
      setUsers(usersData || []);

      // 2. Search Posts
      const { data: postsData, error: postsErr } = await supabase
        .from('posts')
        .select('id, content, created_at, user_id')
        .ilike('content', `%${query}%`)
        .limit(10);

      if (postsErr) throw postsErr;

      // Map profiles for posts
      if (postsData && postsData.length > 0) {
        const uIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: postsProfiles } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', uIds);
        
        const profileMap: Record<string, any> = {};
        postsProfiles?.forEach(p => { profileMap[p.id] = p; });

        setPosts(postsData.map(p => ({
          ...p,
          profiles: profileMap[p.user_id] || null
        })));
      } else {
        setPosts([]);
      }

      // 3. Search Marketplace Listings
      const { data: listingsData, error: listErr } = await supabase
        .from('market_listings')
        .select('id, title, description, price, category, location_state, seller_id, payment_url')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10);

      if (listErr) throw listErr;
      setListings(listingsData || []);

    } catch (err: any) {
      console.error(err);
      setError('Could not complete the search query. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="feed-container" style={{ padding: '1.5rem', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Search size={28} style={{ color: 'var(--color-pine-primary)' }} />
        <h2 style={{ margin: 0, color: 'var(--color-pine-dark)' }}>Search Results for "{query}"</h2>
      </div>

      {error && <div style={{ background: '#fff3f3', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Leaf size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} /> Searching…
        </div>
      ) : !query ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
          <Search size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
          <p>Please enter a keyword to search Rural & Reckless.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Section 1: Makers */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '0.4rem', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1rem' }}>
              <User size={20} /> Makers &amp; Artists ({users.length})
            </h3>
            {users.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No makers match your query.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {users.map(u => (
                  <div key={u.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <img src={u.avatar_url || '/images/avatar_maker.png'} alt={u.username} className="avatar-small" style={{ width: 48, height: 48, flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Link to={`/profile/${u.id}`} style={{ textDecoration: 'none', color: 'var(--color-pine-dark)', fontWeight: 700, display: 'block', fontSize: '1rem' }}>
                        {u.full_name || u.username || 'Maker'}
                      </Link>
                      {u.tagline && <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.tagline}</p>}
                      {u.location_state && <span style={{ fontSize: '0.75rem', color: 'var(--color-wood-brown)', fontWeight: 600 }}>📍 {u.location_state}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Marketplace Listings */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '0.4rem', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1rem' }}>
              <ShoppingBag size={20} /> Marketplace ({listings.length})
            </h3>
            {listings.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No items found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {listings.map(l => (
                  <div key={l.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-pine-dark)' }}>{l.title}</h4>
                      {l.description && <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{l.description}</p>}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-accent)' }}>{l.price}</span>
                        {l.category && (
                          <span style={{ fontSize: '0.75rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                            {l.category}
                          </span>
                        )}
                        {l.location_state && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>📍 {l.location_state}</span>}
                      </div>
                    </div>
                    {l.payment_url && (
                      <a href={l.payment_url} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--color-pine-primary)', color: 'white', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        View Item <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Feed Posts */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '0.4rem', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1rem' }}>
              <FileText size={20} /> Feed Posts ({posts.length})
            </h3>
            {posts.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No posts found matching the query.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {posts.map(p => (
                  <div key={p.id} className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <img src={p.profiles?.avatar_url || '/images/avatar_maker.png'} alt={p.profiles?.username} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-pine-dark)' }}>{p.profiles?.full_name || p.profiles?.username || 'Member'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>· {new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>{p.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
