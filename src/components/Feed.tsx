import { ImageIcon, Video, Smile, MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

const MOCK_USER = {
  name: "Jane Doe",
  avatar: "/images/avatar_maker.png"
};

const MOCK_POSTS = [
  {
    id: 1,
    author: {
      name: "Arthur Pendelton",
      avatar: "/images/avatar_woodworker.png",
      role: "Woodworker"
    },
    time: "2 hours ago",
    content: "Just finished turning this maple bowl. It took a while to get the finish just right, but I'm really happy with how the grain pops! I'll be listing it on my storefront later today.",
    image: "/images/post_wooden_bowl.png",
    likes: 24,
    comments: 5
  },
  {
    id: 2,
    author: {
      name: "Jane Doe",
      avatar: "/images/avatar_maker.png",
      role: "3D Print Artist"
    },
    time: "5 hours ago",
    content: "Experimenting with a new matte white PLA for these geometric vases. What do you guys think? Should I offer these in other colors or stick to the minimalist vibe?",
    image: "/images/post_3d_print.png",
    likes: 42,
    comments: 12
  }
];

export function Feed() {
  return (
    <div className="feed-container">
      {/* Create Post */}
      <div className="card create-post">
        <img src={MOCK_USER.avatar} alt="Profile" className="avatar-small" style={{width: 40, height: 40}} />
        <div className="post-input-wrapper">
          <textarea 
            className="post-input" 
            rows={2} 
            placeholder="What are you working on today, Jane?"
          ></textarea>
          <div className="post-actions">
            <div className="action-buttons">
              <button className="action-btn"><ImageIcon size={18} /> Photo</button>
              <button className="action-btn"><Video size={18} /> Video</button>
              <button className="action-btn"><Smile size={18} /> Feeling</button>
            </div>
            <button>Post</button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      {MOCK_POSTS.map(post => (
        <div key={post.id} className="card post-card">
          <div className="post-header">
            <div className="post-author">
              <img src={post.author.avatar} alt={post.author.name} className="avatar-small" style={{width: 40, height: 40}} />
              <div className="author-info">
                <h4>{post.author.name}</h4>
                <span className="post-time">{post.time} · {post.author.role}</span>
              </div>
            </div>
            <button className="icon-button" style={{color: 'var(--color-text-muted)'}}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="post-content">
            <p className="post-text">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post attachment" className="post-image" />
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
      ))}
    </div>
  );
}
