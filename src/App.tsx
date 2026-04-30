import { useState } from 'react';
import { 
  Home, Users, ShoppingBag, BookOpen, MessageSquare, 
  Bell, Search, Menu, Image as ImageIcon, Video, 
  Smile, ThumbsUp, MessageCircle, Share2, MoreHorizontal 
} from 'lucide-react';
import './App.css';

// Mock Data
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

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Menu size={24} />
          Rural & Reckless
        </div>
        
        <div className="nav-search">
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Search the town square..." />
        </div>

        <div className="nav-actions">
          <button className="icon-button"><MessageSquare size={20} /></button>
          <button className="icon-button"><Bell size={20} /></button>
          <img src={MOCK_USER.avatar} alt="Profile" className="avatar-small" />
        </div>
      </nav>

      {/* Main Layout */}
      <main className="main-layout">
        
        {/* Left Sidebar - Navigation */}
        <aside className="sidebar">
          <a href="#" className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={20} /> Town Square
          </a>
          <a href="#" className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <img src={MOCK_USER.avatar} alt="Profile" className="avatar-small" style={{width: 20, height: 20}} /> 
            My Profile
          </a>
          
          <div className="sidebar-divider"></div>
          
          <h3 className="sidebar-heading">Communities</h3>
          <a href="#" className="nav-item"><Users size={20} /> Woodworkers Guild</a>
          <a href="#" className="nav-item"><Users size={20} /> 3D Printing Hub</a>
          <a href="#" className="nav-item"><BookOpen size={20} /> Indie Authors</a>
          
          <div className="sidebar-divider"></div>

          <h3 className="sidebar-heading">Marketplace</h3>
          <a href="#" className="nav-item"><ShoppingBag size={20} /> Farmers Market</a>
          <a href="#" className="nav-item"><ShoppingBag size={20} /> Digital Goods & Apps</a>
        </aside>

        {/* Center - Social Feed */}
        <section className="feed-container">
          
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

        </section>

        {/* Right Sidebar - Trending/Storefronts */}
        <aside className="sidebar right-sidebar">
          <div className="card">
            <h3 className="sidebar-heading" style={{padding: 0, marginBottom: '1rem'}}>Trending Storefronts</h3>
            
            <div className="trending-item">
              <ShoppingBag size={32} style={{color: 'var(--color-pine-light)'}} />
              <div className="trending-content">
                <h5>Arthur's Woodshop</h5>
                <p>New handmade bowls added</p>
              </div>
            </div>

            <div className="trending-item">
              <BookOpen size={32} style={{color: 'var(--color-wood-light)'}} />
              <div className="trending-content">
                <h5>The Indie Press</h5>
                <p>3 new authors published</p>
              </div>
            </div>

            <div className="trending-item">
              <Users size={32} style={{color: 'var(--color-accent)'}} />
              <div className="trending-content">
                <h5>Jane's Digital Tools</h5>
                <p>New app available for download</p>
              </div>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}

export default App;
