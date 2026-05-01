import { useState, useEffect } from 'react';
import { ImageIcon, ThumbsUp, MessageCircle, Share2, Leaf, ShoppingCart, BookOpen, Cpu } from 'lucide-react';
import { supabase } from '../lib/supabase';

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  'E-Book': <BookOpen size={16} />, 'Short Story / Poetry': <BookOpen size={16} />,
  'Config File': <Cpu size={16} />, 'Design Files': <Cpu size={16} />,
  'Software': <Cpu size={16} />, 'default': <ShoppingCart size={16} />,
};

// ─── Social Tab ───────────────────────────────────────────────────────────────
function SocialFeed({ currentUser, currentUserProfile }: { currentUser: any; currentUserProfile: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setError('');
    const { data: postsData, error: e } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (e) { setError('Could not load posts. Try refreshing.'); setLoading(false); return; }

    // Fetch profile info separately for each unique user
    const userIds = [...new Set((postsData || []).map((p: any) => p.user_id))];
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, tagline')
        .in('id', userIds);
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
    }

    setPosts((postsData || []).map((p: any) => ({ ...p, profiles: profileMap[p.user_id] || null })));
    setLoading(false);
  }

  async function submit() {
    if (!content.trim() || !currentUser) return;
    setPosting(true);
    const { error: e } = await supabase.from('posts').insert([{ user_id: currentUser.id, content }]);
    if (!e) { setContent(''); fetchPosts(); }
    else setError('Could not post. Try again.');
    setPosting(false);
  }

  return (
    <div className="feed-container">
      {/* Compose */}
      <div className="card create-post">
        <img src={currentUserProfile?.avatar_url || '/images/avatar_maker.png'} alt="You" className="avatar-small" style={{ width: 40, height: 40, flexShrink: 0 }} />
        <div className="post-input-wrapper">
          <textarea className="post-input" rows={3} placeholder="Share what you're building."
            value={content} onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submit(); }}
            aria-label="Write a post" />
          <div className="post-actions">
            <button className="action-btn" disabled title="Photo upload coming soon" aria-label="Photo">
              <ImageIcon size={18} /> Photo
            </button>
            <button onClick={submit} disabled={!content.trim() || posting}>
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {error && <div role="alert" style={{ background: '#fff3f3', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '1rem', color: '#dc2626', textAlign: 'center' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Leaf size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
          Loading the feed…
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Leaf size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-pine-dark)' }}>Nothing posted yet.</p>
          <p>Be reckless. Start the first thing.</p>
        </div>
      ) : posts.map(post => (
        <article key={post.id} className="card post-card">
          <div className="post-header">
            <div className="post-author">
              <img src={post.profiles?.avatar_url || '/images/avatar_maker.png'} alt={post.profiles?.username || 'Member'} className="avatar-small" style={{ width: 40, height: 40 }} />
              <div className="author-info">
                <h4>{post.profiles?.full_name || post.profiles?.username || 'Anonymous Maker'}</h4>
                <span className="post-time">{timeAgo(post.created_at)}{post.profiles?.tagline ? ` · ${post.profiles.tagline}` : ''}</span>
              </div>
            </div>
          </div>
          <div className="post-content">
            <p className="post-text">{post.content}</p>
            {post.image_url && <img src={post.image_url} alt="Post image" className="post-image" loading="lazy" />}
          </div>
          <div className="post-footer">
            <button className="interaction-btn"><ThumbsUp size={18} /> {post.likes ?? 0}</button>
            <button className="interaction-btn"><MessageCircle size={18} /> {post.comment_count ?? 0}</button>
            <button className="interaction-btn"><Share2 size={18} /> Share</button>
          </div>
        </article>
      ))}
    </div>
  );
}

// ─── For You Tab ──────────────────────────────────────────────────────────────
function ForYouFeed({ currentUser }: { currentUser: any }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRecommended(); }, []);

  async function fetchRecommended() {
    setLoading(true);

    // Step 1: find categories the user cares about (via their group memberships)
    let interests: string[] = [];
    if (currentUser) {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('groups:group_id(category)')
        .eq('user_id', currentUser.id)
        .eq('status', 'active');
      if (memberships) {
        interests = [...new Set(memberships.map((m: any) => m.groups?.category).filter(Boolean))];
      }
    }

    // Step 2: fetch products matching interests, fallback to latest if none
    let query = supabase.from('digital_products').select('*').eq('is_active', true);
    if (interests.length > 0) {
      // Map group categories to product categories (loose match)
      const mapped = interests.flatMap(i => {
        const lower = i.toLowerCase();
        if (lower.includes('writing') || lower.includes('reading')) return ['E-Book', 'Short Story / Poetry'];
        if (lower.includes('wood') || lower.includes('craft')) return ['Design Files', 'Config File'];
        if (lower.includes('3d') || lower.includes('print')) return ['Config File', 'Design Files', 'Software'];
        if (lower.includes('music')) return ['Music'];
        return ['Other'];
      });
      query = query.in('category', [...new Set(mapped)]);
    }
    const { data } = await query.order('created_at', { ascending: false }).limit(20);
    setProducts(data || []);
    setLoading(false);
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
      <Leaf size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} /> Loading recommendations…
    </div>
  );

  if (products.length === 0) return (
    <div className="feed-container">
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
        <ShoppingCart size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-pine-dark)' }}>No recommendations yet.</p>
        <p>Join some communities to tune your feed, or check out the Digital Goods section directly.</p>
      </div>
    </div>
  );

  return (
    <div className="feed-container">
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
        📡 Recommended based on your community interests
      </p>
      {products.map(p => {
        const isFree = p.price_display?.toLowerCase() === 'free';
        return (
          <div key={p.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {p.cover_image_url
              ? <img src={p.cover_image_url} alt={p.title} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} loading="lazy" />
              : <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                  {CAT_ICONS[p.category] ?? CAT_ICONS['default']}
                </div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1rem' }}>{p.title}</h4>
                <span style={{ fontWeight: 700, color: isFree ? 'var(--color-pine-primary)' : 'var(--color-accent)', flexShrink: 0 }}>{p.price_display}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.category}</span>
              {p.description && <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{p.description}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {isFree && p.file_url && <a href={p.file_url} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--color-pine-primary)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, minHeight: 36, display: 'flex', alignItems: 'center' }}>Free Download</a>}
                {!isFree && p.payment_url && <a href={p.payment_url} target="_blank" rel="noopener noreferrer" style={{ background: '#635BFF', color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, minHeight: 36, display: 'flex', alignItems: 'center' }}>💳 Buy</a>}
                {!isFree && p.crypto_url && <a href={p.crypto_url} target="_blank" rel="noopener noreferrer" style={{ background: '#F7931A', color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, minHeight: 36, display: 'flex', alignItems: 'center' }}>₿ Crypto</a>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Feed with Tabs ──────────────────────────────────────────────────────
export function Feed() {
  const [tab, setTab] = useState<'social' | 'foryou'>('social');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        const { data } = await supabase.from('profiles').select('avatar_url, username').eq('id', session.user.id).single();
        setCurrentUserProfile(data);
      }
    });
  }, []);

  const tabStyle = (active: boolean) => ({
    padding: '0.6rem 1.5rem',
    background: active ? 'var(--color-pine-primary)' : 'transparent',
    color: active ? 'white' : 'var(--color-text-muted)',
    border: `1px solid ${active ? 'var(--color-pine-primary)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: 600 as const,
    fontSize: '0.9rem',
    transition: 'all 0.18s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0 0.25rem' }} role="tablist" aria-label="Feed tabs">
        <button style={tabStyle(tab === 'social')} onClick={() => setTab('social')} role="tab" aria-selected={tab === 'social'} aria-controls="tab-social">
          🌿 Social
        </button>
        <button style={tabStyle(tab === 'foryou')} onClick={() => setTab('foryou')} role="tab" aria-selected={tab === 'foryou'} aria-controls="tab-foryou">
          ✨ For You
        </button>
      </div>

      {/* Tab Panels */}
      <div id="tab-social" role="tabpanel" hidden={tab !== 'social'}>
        {tab === 'social' && <SocialFeed currentUser={currentUser} currentUserProfile={currentUserProfile} />}
      </div>
      <div id="tab-foryou" role="tabpanel" hidden={tab !== 'foryou'}>
        {tab === 'foryou' && <ForYouFeed currentUser={currentUser} />}
      </div>
    </div>
  );
}
