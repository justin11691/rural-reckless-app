import { useState, useEffect } from 'react';
import { Palette, PlaySquare, Music, UserPlus, ShoppingBag, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [saving, setSaving] = useState(false);

  // Default theme fallback
  const [profileTheme, setProfileTheme] = useState({
    bgColor: '#1E2923',
    textColor: '#FDFBF7',
    accentColor: '#E86A33',
    bannerImg: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2074)',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) console.error('Error fetching profile:', error);

    if (data) {
      setProfile(data);
      // Load their saved MySpace theme
      setProfileTheme({
        bgColor: data.theme_bg_color || '#1E2923',
        textColor: data.theme_text_color || '#FDFBF7',
        accentColor: data.theme_accent_color || '#E86A33',
        bannerImg: `url(${data.theme_banner_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2074'})`,
      });
    }
  }

  async function saveTheme() {
    if (!profile) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        theme_bg_color: profileTheme.bgColor,
        theme_text_color: profileTheme.textColor,
        theme_accent_color: profileTheme.accentColor
      })
      .eq('id', profile.id);

    if (!error) {
      setIsEditingTheme(false);
    }
    setSaving(false);
  }

  return (
    <div className="profile-container" style={{
      '--profile-bg': profileTheme.bgColor,
      '--profile-text': profileTheme.textColor,
      '--profile-accent': profileTheme.accentColor,
    } as React.CSSProperties}>
      
      <div className="profile-banner" style={{ backgroundImage: profileTheme.bannerImg }}>
        {isEditingTheme && (
          <button className="edit-banner-btn"><Palette size={16} /> Edit Banner</button>
        )}
      </div>

      <div className="profile-header">
        <img src={profile?.avatar_url || "/images/avatar_maker.png"} alt="Profile Avatar" className="profile-avatar-large" />
        <div className="profile-title-area">
          <div className="profile-name-row">
            <h1>{profile?.full_name || profile?.username || 'Anonymous Maker'}</h1>
            <button className="follow-btn"><UserPlus size={16} /> Follow</button>
          </div>
          <p className="profile-tagline">{profile?.tagline || 'A new member of Rural & Reckless'}</p>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Left Column: About & Music */}
        <div className="profile-sidebar">
          <div className="profile-card about-card">
            <h3>About Me</h3>
            <p>{profile?.about_me || "This maker hasn't written an about me yet!"}</p>
            
            <div className="profile-stats">
              <div className="stat"><strong>0</strong> Followers</div>
              <div className="stat"><strong>0</strong> Apps & Prints Sold</div>
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
              <h3><ShoppingBag size={20} /> Storefront</h3>
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
            <p style={{color: 'var(--profile-text)', opacity: 0.7}}>No posts from this user yet.</p>
          </div>

        </div>
      </div>

      {/* Themer Floating Button */}
      <button 
        className="theme-editor-toggle" 
        onClick={() => setIsEditingTheme(!isEditingTheme)}
      >
        <Palette size={24} />
      </button>

      {/* Simple Theme Editor Panel */}
      {isEditingTheme && (
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
          <button 
            onClick={saveTheme} 
            disabled={saving}
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      )}
    </div>
  );
}
