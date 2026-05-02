import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export function TrendingSidebar() {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  async function fetchTrending() {
    setLoading(true);
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, tagline, store_name')
        .limit(4);

      setTrending(usersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="sidebar right-sidebar" aria-label="Trending storefronts">
      <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        <h3 className="sidebar-heading" style={{ padding: 0, marginBottom: '1rem', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Trending Makers
        </h3>
        {loading ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Loading makers…</p>
        ) : trending.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>No trending storefronts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trending.map(u => (
              <div key={u.id} className="trending-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img
                  src={u.avatar_url || '/images/avatar_maker.png'}
                  alt={u.username}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div className="trending-content" style={{ minWidth: 0, flex: 1 }}>
                  <Link to={`/profile/${u.id}`} style={{ textDecoration: 'none', color: 'var(--color-text-main)', display: 'block' }}>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>{u.store_name || u.full_name || u.username}</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.tagline || 'Talented Artisan & Maker'}
                    </p>
                  </Link>
                </div>
                <Link to={`/profile/${u.id}`} style={{ color: 'var(--color-pine-primary)' }} aria-label={`View ${u.username}'s storefront`}>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
