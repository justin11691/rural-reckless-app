import { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Share2, Leaf, ShoppingCart, BookOpen, Cpu, Trash2, Send, Package, Box } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdSenseUnit } from './AdSenseUnit';

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
  'Software': <Cpu size={16} />, '3D Prints': <Box size={16} />, 'default': <ShoppingCart size={16} />,
};

const PAGE_SIZE = 10;

// ─── Social Tab ───────────────────────────────────────────────────────────────
function SocialFeed({ currentUser, currentUserProfile }: { currentUser: any; currentUserProfile: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [postCategory, setPostCategory] = useState<'General' | 'Life Event' | 'Recipe' | 'Day to Day'>('General');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [filterSocialCat, setFilterSocialCat] = useState<'All' | 'Life Event' | 'Recipe' | 'Day to Day'>('All');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts(0, true);
  }, [filterSocialCat]);

  async function fetchPosts(pageNum = 0, isInitial = false) {
    setError('');
    setLoading(true);
    if (isInitial) {
      setPosts([]);
      setPage(0);
      setHasMore(true);
    }

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (filterSocialCat !== 'All') {
      query = query.ilike('content', `%[#${filterSocialCat}]%`);
    }

    const { data: postsData, error: e, count } = await query;

    if (e) { setError('Could not load posts. Try refreshing.'); setLoading(false); return; }

    if (postsData) {
      const currentCount = (count !== null) ? count : 0;
      setHasMore((pageNum + 1) * PAGE_SIZE < currentCount);
    }

    const userIds = [...new Set((postsData || []).map((p: any) => p.user_id))];
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, tagline')
        .in('id', userIds);
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
    }

    const postIds = (postsData || []).map((p: any) => p.id);
    let likesMap: Record<string, { count: number, me: boolean }> = {};
    let commentsMap: Record<string, any[]> = {};
    
    if (postIds.length > 0) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      const { data: comments } = await supabase
        .from('post_comments')
        .select('id, post_id, user_id, content, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: true });

      const commentUserIds = [...new Set((comments||[]).map((c:any)=>c.user_id))];
      let commentProfileMap: Record<string,any> = {};
      if (commentUserIds.length > 0) {
        const { data: cProfiles } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', commentUserIds);
        (cProfiles||[]).forEach((p:any)=>{ commentProfileMap[p.id]=p; });
      }
      
      (likes || []).forEach(l => {
        if (!likesMap[l.post_id]) likesMap[l.post_id] = { count: 0, me: false };
        likesMap[l.post_id].count++;
        if (currentUser && l.user_id === currentUser.id) likesMap[l.post_id].me = true;
      });
      
      (comments || []).forEach((c:any) => {
        if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
        commentsMap[c.post_id].push({ ...c, profiles: commentProfileMap[c.user_id]||null });
      });
    }

    const fetchedPosts = (postsData || []).map((p: any) => ({
      ...p, 
      profiles: profileMap[p.user_id] || null,
      like_count: likesMap[p.id]?.count || 0,
      liked_by_me: likesMap[p.id]?.me || false,
      comments: commentsMap[p.id] || []
    }));

    if (pageNum === 0) {
      setPosts(fetchedPosts);
    } else {
      setPosts(prev => [...prev, ...fetchedPosts]);
    }
    setLoading(false);
  }

  async function submit() {
    if (!content.trim() || !currentUser) return;
    setPosting(true);
    // Leverage content/metadata to store category or add custom flags
    const bodyContent = postCategory !== 'General' ? `[#${postCategory}] ${content}` : content;
    const { error: e } = await supabase.from('posts').insert([{ user_id: currentUser.id, content: bodyContent }]);
    if (!e) { setContent(''); fetchPosts(0, true); }
    else setError('Could not post. Try again.');
    setPosting(false);
  }

  async function toggleLike(postId: string, currentlyLiked: boolean) {
    if (!currentUser) return;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, liked_by_me: !currentlyLiked, like_count: p.like_count + (currentlyLiked ? -1 : 1) };
      }
      return p;
    }));

    if (currentlyLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', currentUser.id);
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: currentUser.id }]);
    }
  }

  async function submitComment(postId: string) {
    if (!commentText.trim() || !currentUser) return;
    const { data, error } = await supabase.from('post_comments').insert([{ 
      post_id: postId, 
      user_id: currentUser.id, 
      content: commentText.trim() 
    }]).select('*, profiles:user_id(username, full_name, avatar_url)').single();
    
    if (!error && data) {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [...(p.comments || []), data] };
        }
        return p;
      }));
      setCommentText('');
    }
  }

  async function deletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setPosts(posts.filter(p => p.id !== postId));
    await supabase.from('posts').delete().eq('id', postId);
  }

  const filteredPosts = posts;

  return (
    <div className="feed-container">
      {/* Maker Spotlight of the Week Banner */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, var(--color-pine-dark), #1d2b21)', color: 'white', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }} aria-hidden>
          🌟
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Maker Spotlight of the Week</h4>
          <p style={{ margin: '0.1rem 0 0', fontSize: '0.82rem', color: '#eaeaea', lineHeight: 1.4 }}>
            Meet <strong>Arthur</strong> from Oregon. His hand-carved cherry wood bowls have just hit the marketplace and are stunning.
          </p>
        </div>
      </div>

      <AdSenseUnit slotId="feed_top_ad_318491" format="horizontal" style={{ marginBottom: '1.25rem' }} />

      {/* Category selector for social feed filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {(['All', 'Life Event', 'Recipe', 'Day to Day'] as const).map(c => (
          <button key={c} onClick={() => setFilterSocialCat(c)} style={{ padding: '0.45rem 1rem', background: filterSocialCat === c ? 'var(--color-pine-primary)' : 'var(--color-bg-base)', color: filterSocialCat === c ? 'white' : 'var(--color-text-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            {c}
          </button>
        ))}
      </div>

      {/* Compose */}
      <div className="card create-post">
        <img src={currentUserProfile?.avatar_url || '/images/avatar_maker.png'} alt="You" className="avatar-small" style={{ width: 40, height: 40, flexShrink: 0 }} />
        <div className="post-input-wrapper">
          <textarea className="post-input" rows={3} placeholder="Share a life event, a new recipe, or your day-to-day moments..."
            value={content} onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submit(); }}
            aria-label="Write a post" />
          <div className="post-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Type:</span>
              <select value={postCategory} onChange={e => setPostCategory(e.target.value as any)} style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'white', fontSize: '0.82rem' }}>
                <option value="General">General Post</option>
                <option value="Life Event">Life Event</option>
                <option value="Recipe">Recipe</option>
                <option value="Day to Day">Day to Day</option>
              </select>
            </div>
            <button onClick={submit} disabled={!content.trim() || posting} style={{ padding: '0.55rem 1.25rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
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
      ) : filteredPosts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Leaf size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-pine-dark)' }}>No posts under this category yet.</p>
          <p>Be the first to share your recipes and life updates.</p>
        </div>
      ) : (
        <>
          {filteredPosts.map(post => (
        <article key={post.id} className="card post-card">
          <div className="post-header">
            <div className="post-author">
              <img src={post.profiles?.avatar_url || '/images/avatar_maker.png'} alt={post.profiles?.username || 'Member'} className="avatar-small" style={{ width: 40, height: 40 }} />
              <div className="author-info">
                <h4>{post.profiles?.full_name || post.profiles?.username || 'Anonymous Maker'}</h4>
                <span className="post-time">{timeAgo(post.created_at)}{post.profiles?.tagline ? ` · ${post.profiles.tagline}` : ''}</span>
              </div>
            </div>
            {currentUser && currentUser.id === post.user_id && (
              <button onClick={() => deletePost(post.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }} title="Delete post">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="post-content">
            <p className="post-text">{post.content}</p>
            {post.image_url && <img src={post.image_url} alt="Post image" className="post-image" loading="lazy" />}
          </div>
          <div className="post-footer">
            <button className="interaction-btn" onClick={() => toggleLike(post.id, post.liked_by_me)} style={{ color: post.liked_by_me ? 'var(--color-accent)' : 'inherit' }}>
              <ThumbsUp size={18} fill={post.liked_by_me ? "currentColor" : "none"} /> {post.like_count ?? 0}
            </button>
            <button className="interaction-btn" onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}>
              <MessageCircle size={18} /> {post.comments?.length || 0}
            </button>
            <button className="interaction-btn"><Share2 size={18} /> Share</button>
          </div>
          
          {/* Comments Section */}
          {activeCommentPost === post.id && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {(post.comments || []).map((c: any) => (
                  <div key={c.id} style={{ display: 'flex', gap: '0.5rem' }}>
                    <img src={c.profiles?.avatar_url || '/images/avatar_maker.png'} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                    <div style={{ background: 'var(--color-bg-card)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{c.profiles?.full_name || c.profiles?.username}</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{c.content}</p>
                    </div>
                  </div>
                ))}
                {(!post.comments || post.comments.length === 0) && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>No comments yet. Be the first!</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="post-input" 
                  placeholder="Write a comment..." 
                  value={commentText} 
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitComment(post.id); }}
                  style={{ flex: 1, margin: 0, padding: '0.5rem 0.75rem' }} 
                />
                <button onClick={() => submitComment(post.id)} disabled={!commentText.trim()} style={{ background: 'var(--color-pine-dark)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 0.75rem', display: 'flex', alignItems: 'center' }}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchPosts(nextPage);
                }}
                disabled={loading}
                style={{ padding: '0.6rem 1.5rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', color: 'var(--color-pine-primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
        {loading && posts.length > 0 ? 'Loading more…' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── For You Tab (Blending Online & Local Goods) ──────────────────────────────
function ForYouFeed({ currentUser }: { currentUser: any }) {
  const [blendedProducts, setBlendedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBlendedRecommended(); }, []);

  async function fetchBlendedRecommended() {
    setLoading(true);

    // Step 1: find categories the user cares about (via their group memberships)
    let interests: string[] = [];
    if (currentUser) {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('communities:group_id(category)')
        .eq('user_id', currentUser.id)
        .eq('status', 'active');
      if (memberships) {
        interests = [...new Set(memberships.map((m: any) => m.communities?.category).filter(Boolean))];
      }
    }

    let userState = '';
    if (currentUser) {
      const { data: profile } = await supabase.from('profiles').select('location_state').eq('id', currentUser.id).single();
      if (profile?.location_state) userState = profile.location_state.toUpperCase();
    }

    // Step 2: fetch digital products matching interests, fallback to latest if none
    let digiQuery = supabase.from('digital_products').select('*');
    const { data: digitalItems } = await digiQuery.order('created_at', { ascending: false }).limit(20);

    // Step 3: fetch local handmade / rummage market listings
    let localQuery = supabase.from('market_listings').select('*').eq('is_active', true);
    const { data: localItems } = await localQuery.order('created_at', { ascending: false }).limit(20);

    // Step 4: Blend and filter with interest & location algorithm
    const blended = [...(digitalItems || []).map(i => ({ ...i, type: 'digital' })), ...(localItems || []).map(i => ({ ...i, type: 'local' }))];

    blended.sort((a, b) => {
      // 1. Proximity: Prioritize local items in the same state first
      const aInState = a.type === 'local' && a.location_state?.toUpperCase() === userState;
      const bInState = b.type === 'local' && b.location_state?.toUpperCase() === userState;
      if (aInState && !bInState) return -1;
      if (!aInState && bInState) return 1;

      // 2. Interests: Check category matching
      if (interests.length > 0) {
        const aInterest = interests.some(i => a.category?.toLowerCase().includes(i.toLowerCase()));
        const bInterest = interests.some(i => b.category?.toLowerCase().includes(i.toLowerCase()));
        if (aInterest && !bInterest) return -1;
        if (!aInterest && bInterest) return 1;
      }

      // 3. Recency: Fallback chronologically
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setBlendedProducts(blended.slice(0, 24));
    setLoading(false);
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
      <Leaf size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} /> Loading your personal algorithm…
    </div>
  );

  if (blendedProducts.length === 0) return (
    <div className="feed-container">
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
        <ShoppingCart size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-pine-dark)' }}>No items to recommend yet.</p>
        <p>Join communities to refine what you are interested in.</p>
      </div>
    </div>
  );

  return (
    <div className="feed-container">
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        📡 Blended recommendations based on your local, shippable, and online interests
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {blendedProducts.map(p => {
          const isFree = p.price_display?.toLowerCase() === 'free';
          const isLocal = p.type === 'local';
          return (
            <div key={p.id} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
              {p.cover_image_url
                ? <img src={p.cover_image_url} alt={p.title} style={{ width: 85, height: 85, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} loading="lazy" />
                : <div style={{ width: 85, height: 85, background: 'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                    {CAT_ICONS[p.category] ?? CAT_ICONS['default']}
                  </div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.05rem', fontWeight: 700 }}>{p.title}</h4>
                  <span style={{ fontWeight: 700, color: isFree ? 'var(--color-pine-primary)' : 'var(--color-accent)', flexShrink: 0 }}>{p.price_display}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {isLocal ? <Package size={13} /> : <Box size={13} />} {isLocal ? 'Local Pickup / Delivery' : 'Online Digital Good'}
                  </span>
                  <span style={{ color: 'var(--color-border)' }}>•</span>
                  <span style={{ fontSize: '0.75rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>{p.category}</span>
                </div>
                {p.description && <p style={{ margin: '0.45rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{p.description}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {isLocal ? (
                    p.payment_url ? (
                      <a href={p.payment_url} target="_blank" rel="noopener noreferrer" style={{ background: '#635BFF', color: 'white', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>💳 Buy Local</a>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)' }}>Message Seller to claim</span>
                    )
                  ) : (
                    <>
                      {isFree && p.file_url && <a href={p.file_url} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--color-pine-primary)', color: 'white', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>Free Download</a>}
                      {!isFree && p.payment_url && <a href={p.payment_url} target="_blank" rel="noopener noreferrer" style={{ background: '#635BFF', color: 'white', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>💳 Buy Online</a>}
                      {!isFree && p.crypto_url && <a href={p.crypto_url} target="_blank" rel="noopener noreferrer" style={{ background: '#F7931A', color: 'white', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>₿ Crypto</a>}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
