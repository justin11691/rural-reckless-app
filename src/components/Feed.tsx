import { useState, useEffect } from 'react';
import { ImageIcon, Video, Smile, MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchSessionAndPosts();
  }, []);

  async function fetchSessionAndPosts() {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
    }

    // Fetch live posts from the database with author profiles
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id ( username, avatar_url, tagline )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  async function handlePostSubmit() {
    if (!newPostContent.trim() || !currentUser) return;

    const { error } = await supabase
      .from('posts')
      .insert([
        { user_id: currentUser.id, content: newPostContent }
      ]);

    if (!error) {
      setNewPostContent('');
      fetchSessionAndPosts(); // Reload feed
    } else {
      console.error('Error creating post:', error);
    }
  }

  return (
    <div className="feed-container">
      {/* Create Post */}
      <div className="card create-post">
        <img src="/images/avatar_maker.png" alt="Profile" className="avatar-small" style={{width: 40, height: 40}} />
        <div className="post-input-wrapper">
          <textarea 
            className="post-input" 
            rows={2} 
            placeholder="What are you working on today?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          ></textarea>
          <div className="post-actions">
            <div className="action-buttons">
              <button className="action-btn"><ImageIcon size={18} /> Photo</button>
              <button className="action-btn"><Video size={18} /> Video</button>
              <button className="action-btn"><Smile size={18} /> Feeling</button>
            </div>
            <button onClick={handlePostSubmit} disabled={!newPostContent.trim()}>Post</button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading the town square...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No posts yet. Be the first to share something!</div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="card post-card">
            <div className="post-header">
              <div className="post-author">
                <img src={post.profiles?.avatar_url || "/images/avatar_woodworker.png"} alt={post.profiles?.username} className="avatar-small" style={{width: 40, height: 40}} />
                <div className="author-info">
                  <h4>{post.profiles?.username || 'Unknown Maker'}</h4>
                  <span className="post-time">{new Date(post.created_at).toLocaleTimeString()} · {post.profiles?.tagline || 'Member'}</span>
                </div>
              </div>
              <button className="icon-button" style={{color: 'var(--color-text-muted)'}}>
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <div className="post-content">
              <p className="post-text">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="Post attachment" className="post-image" />
              )}
            </div>

            <div className="post-footer">
              <button className="interaction-btn">
                <ThumbsUp size={18} /> {post.likes} Like
              </button>
              <button className="interaction-btn">
                <MessageCircle size={18} /> {post.comments} Comment
              </button>
              <button className="interaction-btn">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
