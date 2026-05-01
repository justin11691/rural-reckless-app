import { useState, useEffect, useRef } from 'react';
import { Palette, PlaySquare, Music, UserPlus, ShoppingBag, Save, Edit3, Upload, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    username: '',
    tagline: '',
    about_me: '',
    music_url: '',
    etsy_url: '',
    pinterest_url: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileTheme, setProfileTheme] = useState({
    bgColor: '#1E2923',
    textColor: '#FDFBF7',
    accentColor: '#E86A33',
    bannerImg: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2074)',
  });

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }

    if (data) {
      setProfile(data);
      setProfileFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        tagline: data.tagline || '',
        about_me: data.about_me || '',
        music_url: data.music_url || '',
        etsy_url: data.etsy_url || '',
        pinterest_url: data.pinterest_url || '',
      });
      setProfileTheme({
        bgColor: data.theme_bg_color || '#1E2923',
        textColor: data.theme_text_color || '#FDFBF7',
        accentColor: data.theme_accent_color || '#E86A33',
        bannerImg: `url(${data.theme_banner_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2074'})`,
      });
    } else {
      setProfile({ id: session.user.id });
    }
  }

  async function saveTheme() {
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      theme_bg_color: profileTheme.bgColor,
      theme_text_color: profileTheme.textColor,
      theme_accent_color: profileTheme.accentColor,
    }, { onConflict: 'id' });
    if (!error) setIsEditingTheme(false);
    setSaving(false);
  }

  async function saveProfile() {
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase.from('profiles')
      .upsert({ id: profile.id, ...profileFormData }, { onConflict: 'id' });
    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      setProfile({ ...profile, ...profileFormData });
      setIsEditingProfile(false);
    }
    setSaving(false);
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Upload failed. Make sure you ran the Supabase storage SQL snippet.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function renderMusicPlayer() {
    if (!profile?.music_url) {
      return (
        <div className="music-player">
          <PlaySquare size={28} aria-hidden />
          <div>
            <strong>No current vibe set</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Add a Spotify link in Edit Profile</p>
          </div>
        </div>
      );
    }
    let embedUrl = profile.music_url;
    if (embedUrl.includes('spotify.com/track/')) embedUrl = embedUrl.replace('spotify.com/track/', 'spotify.com/embed/track/');
    else if (embedUrl.includes('spotify.com/playlist/')) embedUrl = embedUrl.replace('spotify.com/playlist/', 'spotify.com/embed/playlist/');
    else if (embedUrl.includes('spotify.com/album/')) embedUrl = embedUrl.replace('spotify.com/album/', 'spotify.com/embed/album/');
    return (
      <iframe
        style={{ borderRadius: '12px', border: 'none', width: '100%', height: '152px' }}
        src={embedUrl}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify player"
      />
    );
  }

  // Etsy orange, Pinterest red
  const etsyColor = '#F1641E';
  const pinterestColor = '#E60023';

  return (
    <div className="profile-container" style={{
      '--profile-bg': profileTheme.bgColor,
      '--profile-text': profileTheme.textColor,
      '--profile-accent': profileTheme.accentColor,
    } as React.CSSProperties}>

      {/* Banner */}
      <div className="profile-banner" style={{ backgroundImage: profileTheme.bannerImg }}>
        {isEditingTheme && (
          <button className="edit-banner-btn"><Palette size={16} aria-hidden /> Edit Banner</button>
        )}
      </div>

      {/* Header */}
      <div className="profile-header">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={profile?.avatar_url || '/images/avatar_maker.png'}
            alt="Profile photo"
            className="profile-avatar-large"
          />
          {isEditingProfile && (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'absolute', bottom: 8, right: 8, borderRadius: '50%', padding: '0.4rem', background: 'var(--color-pine-primary)', color: 'white', cursor: 'pointer', border: '2px solid white' }}
              disabled={uploadingAvatar}
              aria-label="Upload profile photo"
            >
              <Upload size={14} aria-hidden />
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" style={{ display: 'none' }} aria-hidden />
        </div>

        <div className="profile-title-area" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            {isEditingProfile ? (
              <input
                type="text"
                className="post-input"
                value={profileFormData.full_name}
                onChange={e => setProfileFormData({ ...profileFormData, full_name: e.target.value })}
                placeholder="Full Name"
                style={{ fontSize: '1.4rem', fontWeight: 'bold', flex: 1, marginRight: '0.5rem' }}
                aria-label="Full name"
              />
            ) : (
              <h1 style={{ margin: 0 }}>{profile?.full_name || profile?.username || 'Anonymous Maker'}</h1>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => isEditingProfile ? saveProfile() : setIsEditingProfile(true)}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isEditingProfile ? 'var(--color-pine-primary)' : 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                aria-label={isEditingProfile ? 'Save profile' : 'Edit profile'}
              >
                {isEditingProfile ? <><Save size={15} aria-hidden /> Save</> : <><Edit3 size={15} aria-hidden /> Edit Profile</>}
              </button>
              {!isEditingProfile && (
                <button className="follow-btn" aria-label="Follow this user">
                  <UserPlus size={15} aria-hidden /> Follow
                </button>
              )}
            </div>
          </div>

          {isEditingProfile ? (
            <input
              type="text"
              className="post-input"
              value={profileFormData.tagline}
              onChange={e => setProfileFormData({ ...profileFormData, tagline: e.target.value })}
              placeholder="Your tagline..."
              style={{ marginTop: '0.5rem', width: '100%' }}
              aria-label="Tagline"
            />
          ) : (
            <p className="profile-tagline">{profile?.tagline || 'A new member of Rural & Reckless'}</p>
          )}

          {/* External Links: Etsy & Pinterest */}
          {!isEditingProfile && (profile?.etsy_url || profile?.pinterest_url) && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {profile.etsy_url && (
                <a
                  href={profile.etsy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: etsyColor, color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
                  aria-label="View Etsy shop"
                >
                  <ExternalLink size={13} aria-hidden /> Etsy Shop
                </a>
              )}
              {profile.pinterest_url && (
                <a
                  href={profile.pinterest_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: pinterestColor, color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
                  aria-label="View Pinterest boards"
                >
                  <ExternalLink size={13} aria-hidden /> Pinterest
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="profile-content-grid">
        {/* Left: About, Links, Music */}
        <div className="profile-sidebar">
          <div className="profile-card about-card">
            <h3>About Me</h3>
            {isEditingProfile ? (
              <textarea
                className="post-input"
                value={profileFormData.about_me}
                onChange={e => setProfileFormData({ ...profileFormData, about_me: e.target.value })}
                placeholder="Write something about yourself..."
                style={{ minHeight: '100px', width: '100%', resize: 'vertical' }}
                aria-label="About me"
              />
            ) : (
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{profile?.about_me || "This maker hasn't written an about me yet!"}</p>
            )}

            <div className="profile-stats">
              <div className="stat"><strong>0</strong> Followers</div>
              <div className="stat"><strong>0</strong> Items Sold</div>
            </div>
          </div>

          {/* Social Links Edit Fields */}
          {isEditingProfile && (
            <div className="profile-card">
              <h3>External Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--profile-text)', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>
                    🛍️ Etsy Shop URL
                  </label>
                  <input
                    type="url"
                    className="post-input"
                    value={profileFormData.etsy_url}
                    onChange={e => setProfileFormData({ ...profileFormData, etsy_url: e.target.value })}
                    placeholder="https://etsy.com/shop/yourshop"
                    style={{ width: '100%', margin: 0 }}
                    aria-label="Etsy shop URL"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--profile-text)', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>
                    📌 Pinterest URL
                  </label>
                  <input
                    type="url"
                    className="post-input"
                    value={profileFormData.pinterest_url}
                    onChange={e => setProfileFormData({ ...profileFormData, pinterest_url: e.target.value })}
                    placeholder="https://pinterest.com/yourprofile"
                    style={{ width: '100%', margin: 0 }}
                    aria-label="Pinterest URL"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="profile-card music-card">
            <h3><Music size={16} aria-hidden /> Current Vibe</h3>
            {isEditingProfile && (
              <input
                type="text"
                className="post-input"
                value={profileFormData.music_url}
                onChange={e => setProfileFormData({ ...profileFormData, music_url: e.target.value })}
                placeholder="Paste a Spotify track, album, or playlist link"
                style={{ marginBottom: '1rem', width: '100%' }}
                aria-label="Spotify link"
              />
            )}
            {renderMusicPlayer()}
          </div>
        </div>

        {/* Right: Storefront & Posts */}
        <div className="profile-main">
          <div className="profile-card storefront-card">
            <div className="storefront-header">
              <h3><ShoppingBag size={18} aria-hidden /> Storefront</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="storefront-grid">
              <div className="store-item">
                <img src="/images/post_3d_print.png" alt="Geometric White Vase" />
                <div className="store-item-info">
                  <h4>Geometric White Vase</h4>
                  <span className="price">$24.99</span>
                </div>
              </div>
              <div className="store-item app-item">
                <div className="app-icon" aria-hidden>S3D</div>
                <div className="store-item-info">
                  <h4>Slice3D Config App</h4>
                  <p className="app-desc">My custom slicer settings</p>
                  <span className="price">$4.99</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Recent Posts</h3>
            <p style={{ color: 'var(--profile-text)', opacity: 0.6, fontSize: '0.9rem' }}>No posts yet.</p>
          </div>
        </div>
      </div>

      {/* Theme Palette Button */}
      <button
        className="theme-editor-toggle"
        onClick={() => setIsEditingTheme(!isEditingTheme)}
        aria-label="Customize profile colors"
        title="Customize theme"
      >
        <Palette size={22} aria-hidden />
      </button>

      {/* Theme Editor Panel */}
      {isEditingTheme && (
        <div className="theme-editor-panel" role="dialog" aria-label="Profile theme editor">
          <h4>Customize Profile</h4>
          {[
            { label: 'Background', key: 'bgColor' },
            { label: 'Text', key: 'textColor' },
            { label: 'Accent', key: 'accentColor' },
          ].map(({ label, key }) => (
            <div key={key} className="color-picker-row">
              <label htmlFor={`color-${key}`}>{label}</label>
              <input
                id={`color-${key}`}
                type="color"
                value={profileTheme[key as keyof typeof profileTheme]}
                onChange={(e) => setProfileTheme({ ...profileTheme, [key]: e.target.value })}
              />
            </div>
          ))}
          <button
            onClick={saveTheme}
            disabled={saving}
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={15} aria-hidden /> {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      )}
    </div>
  );
}
