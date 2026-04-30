import { useState } from 'react';
import { Palette, PlaySquare, Music, UserPlus, ShoppingBag } from 'lucide-react';

export function Profile() {
  const [profileTheme, setProfileTheme] = useState({
    bgColor: '#1E2923', // Dark pine background
    textColor: '#FDFBF7',
    accentColor: '#E86A33',
    bannerImg: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2074)', // Forest canopy
  });

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="profile-container" style={{
      '--profile-bg': profileTheme.bgColor,
      '--profile-text': profileTheme.textColor,
      '--profile-accent': profileTheme.accentColor,
    } as React.CSSProperties}>
      
      <div className="profile-banner" style={{ backgroundImage: profileTheme.bannerImg }}>
        {isEditing && (
          <button className="edit-banner-btn"><Palette size={16} /> Edit Banner</button>
        )}
      </div>

      <div className="profile-header">
        <img src="/images/avatar_maker.png" alt="Jane Doe" className="profile-avatar-large" />
        <div className="profile-title-area">
          <div className="profile-name-row">
            <h1>Jane Doe</h1>
            <button className="follow-btn"><UserPlus size={16} /> Follow</button>
          </div>
          <p className="profile-tagline">3D Print Artist · Tech Enthusiast · "Making plastic cool again"</p>
        </div>
      </div>

      <div className="profile-content-grid">
        
        {/* Left Column: About & Music */}
        <div className="profile-sidebar">
          <div className="profile-card about-card">
            <h3>About Me</h3>
            <p>Hey! I'm Jane. I run a small 3D printing farm from my garage. I specialize in geometric vases and tabletop gaming miniatures. When I'm not tweaking printer settings, I'm out hiking in the pines.</p>
            
            <div className="profile-stats">
              <div className="stat"><strong>1,204</strong> Followers</div>
              <div className="stat"><strong>42</strong> Apps & Prints Sold</div>
            </div>
          </div>

          <div className="profile-card music-card">
            <h3><Music size={18} /> Current Vibe</h3>
            <div className="music-player">
              <PlaySquare size={32} />
              <div>
                <strong>Appalachian Spring</strong>
                <p>Aaron Copland</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feed / Storefront / Apps */}
        <div className="profile-main">
          
          <div className="profile-card storefront-card">
            <div className="storefront-header">
              <h3><ShoppingBag size={20} /> Jane's Storefront</h3>
              <button className="view-all-btn">View All</button>
            </div>
            
            <div className="storefront-grid">
              <div className="store-item">
                <img src="/images/post_3d_print.png" alt="Geometric Vase" />
                <div className="store-item-info">
                  <h4>Geometric White Vase</h4>
                  <span className="price">$24.99</span>
                </div>
              </div>
              
              <div className="store-item app-item">
                <div className="app-icon">S3D</div>
                <div className="store-item-info">
                  <h4>Slice3D Config App</h4>
                  <p className="app-desc">My custom slicer settings app</p>
                  <span className="price">$4.99</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Recent Posts</h3>
            <p style={{color: 'var(--profile-text)', opacity: 0.7}}>Jane hasn't posted anything specifically on her wall today.</p>
          </div>

        </div>
      </div>

      {/* Themer Floating Button */}
      <button 
        className="theme-editor-toggle" 
        onClick={() => setIsEditing(!isEditing)}
      >
        <Palette size={24} />
      </button>

      {/* Simple Theme Editor Panel */}
      {isEditing && (
        <div className="theme-editor-panel">
          <h4>Customize Profile</h4>
          <div className="color-picker-row">
            <label>Background</label>
            <input type="color" value={profileTheme.bgColor} onChange={(e) => setProfileTheme({...profileTheme, bgColor: e.target.value})} />
          </div>
          <div className="color-picker-row">
            <label>Text</label>
            <input type="color" value={profileTheme.textColor} onChange={(e) => setProfileTheme({...profileTheme, textColor: e.target.value})} />
          </div>
          <div className="color-picker-row">
            <label>Accent</label>
            <input type="color" value={profileTheme.accentColor} onChange={(e) => setProfileTheme({...profileTheme, accentColor: e.target.value})} />
          </div>
        </div>
      )}
    </div>
  );
}
