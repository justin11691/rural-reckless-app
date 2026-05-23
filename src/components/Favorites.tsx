import { useState, useEffect } from 'react';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export function Favorites() {
  const [activeTab, setActiveTab] = useState<'digital_product' | 'market_listing' | 'post'>('digital_product');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
      }
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchFavorites();
    }
  }, [currentUser, activeTab]);

  async function fetchFavorites() {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Get favorite mappings of activeTab type
      const { data: favs, error: favsError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('item_type', activeTab);

      if (favsError) throw favsError;

      if (!favs || favs.length === 0) {
        setItems([]);
        return;
      }

      const itemIds = favs.map(f => f.item_id);

      // 2. Fetch detailed items based on tab type
      if (activeTab === 'digital_product') {
        const { data: products, error } = await supabase
          .from('digital_products')
          .select('*')
          .in('id', itemIds);
        if (error) throw error;
        
        // Map back to include favorite id
        const mapped = favs.map(f => {
          const detail = products?.find(p => p.id === f.item_id);
          return detail ? { ...detail, favoriteId: f.id } : null;
        }).filter(Boolean);
        setItems(mapped);

      } else if (activeTab === 'market_listing') {
        const { data: listings, error } = await supabase
          .from('market_listings')
          .select('*')
          .in('id', itemIds);
        if (error) throw error;
        
        const mapped = favs.map(f => {
          const detail = listings?.find(l => l.id === f.item_id);
          return detail ? { ...detail, favoriteId: f.id } : null;
        }).filter(Boolean);
        setItems(mapped);

      } else if (activeTab === 'post') {
        const { data: posts, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (id, username, full_name, avatar_url)
          `)
          .in('id', itemIds);
        if (error) throw error;
        
        const mapped = favs.map(f => {
          const detail = posts?.find(p => p.id === f.item_id);
          return detail ? { ...detail, favoriteId: f.id } : null;
        }).filter(Boolean);
        setItems(mapped);
      }

    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(favoriteId: string) {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      // Update local state
      setItems(prev => prev.filter(i => i.favoriteId !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={28} style={{ fill: 'var(--color-rust)', color: 'var(--color-rust)' }} /> My Saved Items
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Your personal wishlist of digital goods, marketplace listings, and bookmarked posts.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('digital_product')}
          style={{
            padding: '0.5rem 1.25rem',
            background: activeTab === 'digital_product' ? 'var(--color-pine-primary)' : 'transparent',
            color: activeTab === 'digital_product' ? 'white' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: 'none',
            transform: 'none'
          }}
        >
          Apps & E-Books
        </button>
        <button
          onClick={() => setActiveTab('market_listing')}
          style={{
            padding: '0.5rem 1.25rem',
            background: activeTab === 'market_listing' ? 'var(--color-pine-primary)' : 'transparent',
            color: activeTab === 'market_listing' ? 'white' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: 'none',
            transform: 'none'
          }}
        >
          Marketplace Items
        </button>
        <button
          onClick={() => setActiveTab('post')}
          style={{
            padding: '0.5rem 1.25rem',
            background: activeTab === 'post' ? 'var(--color-pine-primary)' : 'transparent',
            color: activeTab === 'post' ? 'white' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: 'none',
            transform: 'none'
          }}
        >
          Saved Posts
        </button>
      </div>

      {/* Main Content area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading saved items...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', borderStyle: 'dashed' }}>
          <Heart size={44} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-pine-dark)' }}>No Saved Items</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {activeTab === 'digital_product' && 'You haven\'t saved any digital apps or e-books yet.'}
            {activeTab === 'market_listing' && 'You haven\'t saved any marketplace listings yet.'}
            {activeTab === 'post' && 'You haven\'t bookmarked any social posts yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              {/* Cover Thumbnail / Photo */}
              <div style={{ height: '140px', position: 'relative' }}>
                {activeTab === 'post' ? (
                  <div style={{ height: '100%', background: item.image_url ? `url(${item.image_url}) center/cover` : 'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))' }} />
                ) : (
                  <div style={{ height: '100%', background: item.cover_image_url ? `url(${item.cover_image_url}) center/cover` : 'linear-gradient(135deg, var(--color-wood-brown), var(--color-pine-light))' }} />
                )}
                
                {/* Trash Icon Button */}
                <button
                  onClick={() => removeFavorite(item.favoriteId)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    color: 'var(--color-rust)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'none',
                    transform: 'none',
                    minHeight: 'auto',
                    padding: 0
                  }}
                  title="Remove from saved"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Item Card Body */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Outfit, sans-serif', color: 'var(--color-pine-dark)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {activeTab === 'post' 
                      ? `Post by ${item.profiles?.full_name || item.profiles?.username || 'Anonymous'}` 
                      : item.title}
                  </h3>
                  
                  {activeTab !== 'post' && (
                    <span style={{ fontWeight: 700, color: 'var(--color-rust)', fontSize: '0.9rem', flexShrink: 0 }}>
                      {item.price_display || (item.price === 0 ? 'Free' : `$${item.price}`)}
                    </span>
                  )}
                </div>

                {activeTab === 'post' && item.profiles && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    By @{item.profiles.username}
                  </span>
                )}

                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, flexGrow: 1 }}>
                  {item.description || item.content}
                </p>

                {/* View Button */}
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  {activeTab === 'digital_product' && (
                    <Link
                      to={`/apps`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        color: 'var(--color-pine-primary)'
                      }}
                    >
                      View in Apps <ArrowRight size={14} />
                    </Link>
                  )}
                  {activeTab === 'market_listing' && (
                    <Link
                      to={`/market/listing/${item.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        color: 'var(--color-pine-primary)'
                      }}
                    >
                      View Product <ArrowRight size={14} />
                    </Link>
                  )}
                  {activeTab === 'post' && (
                    <Link
                      to={`/`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        color: 'var(--color-pine-primary)'
                      }}
                    >
                      View on Feed <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
