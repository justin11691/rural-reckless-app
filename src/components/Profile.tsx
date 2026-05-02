import { useState, useEffect, useRef } from 'react';
import { Palette, PlaySquare, Music, UserPlus, ShoppingBag, Save, Edit3, Upload, ExternalLink, Trash2, MapPin, Image as ImageIcon, Camera, Plus, X, MessageSquare } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Profile() {
  const { id } = useParams<{ id?: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);

  // Portfolio / Art Showcase state
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [newArtTitle, setNewArtTitle] = useState('');
  const [newArtUrl, setNewArtUrl] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'storefront' | 'gallery' | 'friends'>('storefront');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [friendSearch, setFriendSearch] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    username: '',
    tagline: '',
    about_me: '',
    music_url: '',
    etsy_url: '',
    poshmark_url: '',
    ebay_url: '',
    pinterest_url: '',
    store_name: '',
    location_state: '',
    physical_store: '',
    art_form: 'General',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileTheme, setProfileTheme] = useState({
    bgColor: '#1E2923',
    textColor: '#FDFBF7',
    accentColor: '#E86A33',
    bannerImg: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2074)',
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => { fetchProfile(); }, [id]);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);

    const targetUserId = id || session?.user?.id;
    if (!targetUserId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }

    // Fetch user's listings
    const { data: physical } = await supabase.from('market_listings').select('*').eq('user_id', targetUserId);
    const { data: digital } = await supabase.from('digital_products').select('*').eq('owner_id', targetUserId);
    
    const combined = [
      ...(physical || []).map((i: any) => ({ ...i, isDigital: false })),
      ...(digital || []).map((i: any) => ({ ...i, isDigital: true }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setMyListings(combined);

    if (data) {
      setProfile(data);

      let aboutText = data.about_me || '';
      let parsedPortfolio: any[] = [];
      let parsedFriends: any[] = [];
      let parsedPhysicalStore = '';
      let parsedArtForm = 'General';

      if (aboutText.includes('ART_FORM_JSON:')) {
        const parts = aboutText.split('ART_FORM_JSON:');
        aboutText = parts[0].trim();
        parsedArtForm = parts[1].split('PHYSICAL_STORE_JSON:')[0].split('PORTFOLIO_JSON:')[0].split('FRIENDS_JSON:')[0].trim();
      }

      if (aboutText.includes('PHYSICAL_STORE_JSON:')) {
        const parts = aboutText.split('PHYSICAL_STORE_JSON:');
        aboutText = parts[0].trim();
        parsedPhysicalStore = parts[1].split('PORTFOLIO_JSON:')[0].split('FRIENDS_JSON:')[0].trim();
      }

      if (aboutText.includes('PORTFOLIO_JSON:')) {
        const parts = aboutText.split('PORTFOLIO_JSON:');
        aboutText = parts[0].trim();
        if (parts[1].includes('FRIENDS_JSON:')) {
          const subparts = parts[1].split('FRIENDS_JSON:');
          try { parsedPortfolio = JSON.parse(subparts[0]); } catch (e) {}
          try { parsedFriends = JSON.parse(subparts[1]); } catch (e) {}
        } else {
          try { parsedPortfolio = JSON.parse(parts[1]); } catch (e) {}
        }
      } else if (aboutText.includes('FRIENDS_JSON:')) {
        const parts = aboutText.split('FRIENDS_JSON:');
        aboutText = parts[0].trim();
        try { parsedFriends = JSON.parse(parts[1]); } catch (e) {}
      }

      setPortfolio(parsedPortfolio);
      setFriends(parsedFriends);

      const { data: usersData } = await supabase.from('profiles').select('id, full_name, username, avatar_url');
      setAllUsers(usersData || []);

      setProfileFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        tagline: data.tagline || '',
        about_me: aboutText,
        music_url: data.music_url || '',
        etsy_url: data.etsy_url || '',
        poshmark_url: data.poshmark_url || '',
        ebay_url: data.ebay_url || '',
        pinterest_url: data.pinterest_url || '',
        store_name: data.store_name || '',
        location_state: data.location_state || '',
        physical_store: parsedPhysicalStore,
        art_form: parsedArtForm,
      });
      setProfileTheme({
        bgColor: data.theme_bg_color || '#1E2923',
        textColor: data.theme_text_color || '#FDFBF7',
        accentColor: data.theme_accent_color || '#E86A33',
        bannerImg: `url(${data.theme_banner_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2074'})`,
      });
    } else {
      setProfile({ id: targetUserId });
    }
  }

  const isMyProfile = !id || id === currentUser?.id;

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

    const aboutToSave = profileFormData.about_me + 
      (profileFormData.art_form ? ' ART_FORM_JSON:' + profileFormData.art_form : '') +
      (profileFormData.physical_store ? ' PHYSICAL_STORE_JSON:' + profileFormData.physical_store : '') +
      (portfolio.length > 0 ? ' PORTFOLIO_JSON:' + JSON.stringify(portfolio) : '') +
      (friends.length > 0 ? ' FRIENDS_JSON:' + JSON.stringify(friends) : '');

    const { error } = await supabase.from('profiles')
      .upsert({ 
        id: profile.id, 
        ...profileFormData, 
        about_me: aboutToSave 
      }, { onConflict: 'id' });

    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      setProfile({ ...profile, ...profileFormData, about_me: aboutToSave });
      setIsEditingProfile(false);
    }
    setSaving(false);
  }

  async function deleteListing(id: string, isDigital: boolean) {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    const table = isDigital ? 'digital_products' : 'market_listings';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      setMyListings(myListings.filter(l => l.id !== id));
    } else {
      alert('Error deleting listing: ' + error.message);
    }
  }

  async function addPortfolioItem() {
    if (!newArtTitle.trim() || !newArtUrl.trim()) return;
    const updated = [...portfolio, { id: 'art-' + Date.now(), title: newArtTitle.trim(), url: newArtUrl.trim() }];
    setPortfolio(updated);

    if (profile?.id) {
      const aboutToSave = profileFormData.about_me + ' PORTFOLIO_JSON:' + JSON.stringify(updated);
      await supabase.from('profiles').update({ about_me: aboutToSave }).eq('id', profile.id);
    }
    setNewArtTitle('');
    setNewArtUrl('');
  }

  async function deletePortfolioItem(artId: string) {
    const updated = portfolio.filter(item => item.id !== artId);
    setPortfolio(updated);
    if (profile?.id) {
      const aboutToSave = profileFormData.about_me + (updated.length > 0 ? ' PORTFOLIO_JSON:' + JSON.stringify(updated) : '') + (friends.length > 0 ? ' FRIENDS_JSON:' + JSON.stringify(friends) : '');
      await supabase.from('profiles').update({ about_me: aboutToSave }).eq('id', profile.id);
    }
  }

  async function addFriend(friendObj: { id: string; full_name: string; username: string; avatar_url: string }) {
    if (friends.some(f => f.id === friendObj.id)) return;
    const updated = [...friends, friendObj];
    setFriends(updated);
    if (profile?.id) {
      const aboutToSave = profileFormData.about_me + (portfolio.length > 0 ? ' PORTFOLIO_JSON:' + JSON.stringify(portfolio) : '') + ' FRIENDS_JSON:' + JSON.stringify(updated);
      await supabase.from('profiles').update({ about_me: aboutToSave }).eq('id', profile.id);
    }
  }

  async function removeFriend(friendId: string) {
    const updated = friends.filter(f => f.id !== friendId);
    setFriends(updated);
    if (profile?.id) {
      const aboutToSave = profileFormData.about_me + (portfolio.length > 0 ? ' PORTFOLIO_JSON:' + JSON.stringify(portfolio) : '') + (updated.length > 0 ? ' FRIENDS_JSON:' + JSON.stringify(updated) : '');
      await supabase.from('profiles').update({ about_me: aboutToSave }).eq('id', profile.id);
    }
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
      alert('Upload failed. Check storage bucket config.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function renderMusicPlayer() {
    if (!profileFormData.music_url) {
      return (
        <div className="music-player">
          <PlaySquare size={28} aria-hidden />
          <div>
            <strong>No current vibe set</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Add a Spotify or YouTube link in Edit Profile</p>
          </div>
        </div>
      );
    }
    let embedUrl = profileFormData.music_url;
    if (embedUrl.includes('youtube.com/watch?v=')) {
      const vidId = embedUrl.split('v=')[1]?.split('&')[0];
      if (vidId) embedUrl = `https://www.youtube.com/embed/${vidId}`;
    } else if (embedUrl.includes('youtu.be/')) {
      const vidId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (vidId) embedUrl = `https://www.youtube.com/embed/${vidId}`;
    } else if (embedUrl.includes('spotify.com/track/')) {
      embedUrl = embedUrl.replace('spotify.com/track/', 'spotify.com/embed/track/');
    } else if (embedUrl.includes('spotify.com/playlist/')) {
      embedUrl = embedUrl.replace('spotify.com/playlist/', 'spotify.com/embed/playlist/');
    } else if (embedUrl.includes('spotify.com/album/')) {
      embedUrl = embedUrl.replace('spotify.com/album/', 'spotify.com/embed/album/');
    }
    return (
      <iframe
        style={{ borderRadius: '12px', border: 'none', width: '100%', height: '152px' }}
        src={embedUrl}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Music and video player"
      />
    );
  }

  // Branding colors for shop integrations
  const etsyColor = '#F1641E';
  const poshmarkColor = '#941B32';
  const ebayColor = '#0064D2';
  const pinterestColor = '#E60023';

  return (
    <div className="profile-container" style={{
      '--profile-bg': profileTheme.bgColor,
      '--profile-text': profileTheme.textColor,
      '--profile-accent': profileTheme.accentColor,
    } as React.CSSProperties}>

      {/* Banner */}
      <div className="profile-banner" style={{ backgroundImage: profileTheme.bannerImg }}>
        {isEditingTheme && isMyProfile && (
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
            {isMyProfile ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => isEditingProfile ? saveProfile() : setIsEditingProfile(true)}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isEditingProfile ? 'var(--color-pine-primary)' : 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  aria-label={isEditingProfile ? 'Save profile' : 'Edit profile'}
                >
                  {isEditingProfile ? <><Save size={15} aria-hidden /> Save</> : <><Edit3 size={15} aria-hidden /> Edit Profile</>}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="follow-btn" onClick={() => alert('Connected!')} aria-label="Follow this user" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  <UserPlus size={15} aria-hidden /> Connect / Follow
                </button>
                <Link to="/messages" state={{ receiverId: profile?.id }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                  <MessageSquare size={15} aria-hidden /> Message
                </Link>
              </div>
            )}
          </div>

          {isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                className="post-input"
                value={profileFormData.tagline}
                onChange={e => setProfileFormData({ ...profileFormData, tagline: e.target.value })}
                placeholder="Your tagline..."
                style={{ width: '100%' }}
                aria-label="Tagline"
              />
              <input
                type="text"
                className="post-input"
                value={profileFormData.location_state}
                onChange={e => setProfileFormData({ ...profileFormData, location_state: e.target.value })}
                placeholder="📍 Your location (State code e.g. GA, NC, CA)..."
                style={{ width: '100%' }}
                aria-label="Location state"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <p className="profile-tagline" style={{ margin: 0 }}>{profile?.tagline || 'A new member of Rural & Reckless'}</p>
              {profile?.location_state && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.12)', padding: '0.15rem 0.55rem', borderRadius: '12px' }}>
                  <MapPin size={11} /> {profile.location_state}
                </span>
              )}
            </div>
          )}

          {/* Featured Other Stores Integration */}
          {!isEditingProfile && (profile?.etsy_url || profile?.poshmark_url || profile?.ebay_url || profile?.pinterest_url) && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {profile.etsy_url && (
                <a href={profile.etsy_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: etsyColor, color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  <ExternalLink size={12} aria-hidden /> Etsy Shop
                </a>
              )}
              {profile.poshmark_url && (
                <a href={profile.poshmark_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: poshmarkColor, color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  <ExternalLink size={12} aria-hidden /> Poshmark
                </a>
              )}
              {profile.ebay_url && (
                <a href={profile.ebay_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: ebayColor, color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  <ExternalLink size={12} aria-hidden /> eBay Shop
                </a>
              )}
              {profile.pinterest_url && (
                <a href={profile.pinterest_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: pinterestColor, color: 'white', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  <ExternalLink size={12} aria-hidden /> Pinterest
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
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{profileFormData.about_me || "This maker hasn't written an about me yet!"}</p>
            )}

            <div className="profile-stats">
              <div className="stat"><strong>{myListings.length}</strong> Items Listed</div>
              <div className="stat"><strong>{profile?.location_state || 'Online'}</strong> Region</div>
            </div>

            {isEditingProfile ? (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', opacity: 0.8, display: 'block', marginBottom: '0.25rem' }}>🎨 Creative & Artisan Category</label>
                  <select
                    className="post-input"
                    value={profileFormData.art_form}
                    onChange={e => setProfileFormData({ ...profileFormData, art_form: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="General">General Artisan & Maker</option>
                    <option value="Pottery">Pottery & Ceramics</option>
                    <option value="Tattoo">Tattoo & Flash Artist</option>
                    <option value="Digital">Digital & 3D Print Art</option>
                    <option value="Custom Painter">Fine Art & Custom Painter</option>
                    <option value="Photography">Photography & Prints</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', opacity: 0.8, display: 'block', marginBottom: '0.25rem' }}>📍 Physical Storefront Address</label>
                  <input
                    type="text"
                    className="post-input"
                    value={profileFormData.physical_store}
                    onChange={e => setProfileFormData({ ...profileFormData, physical_store: e.target.value })}
                    placeholder="e.g. 123 Main St, Asheville, NC"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.82rem', color: 'var(--color-pine-dark)', opacity: 0.8 }}>🎨 Creative Style</h4>
                  <span style={{ fontSize: '0.85rem', background: 'var(--color-pine-light)', border: '1px solid var(--color-border)', padding: '0.25rem 0.65rem', borderRadius: '12px', color: 'var(--color-pine-dark)', fontWeight: 600, display: 'inline-block' }}>
                    {profileFormData.art_form || 'General Maker'}
                  </span>
                </div>
                {profileFormData.physical_store && (
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.82rem', color: 'var(--color-pine-dark)', opacity: 0.8 }}>📍 Physical Location</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-main)' }}>{profileFormData.physical_store}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Featured Stores Config Fields */}
          {isEditingProfile && (
            <div className="profile-card">
              <h3>Shop & External Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--profile-text)', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>🏪 Custom Storefront Name</label>
                  <input type="text" className="post-input" value={profileFormData.store_name} onChange={e => setProfileFormData({ ...profileFormData, store_name: e.target.value })} placeholder="e.g. My Craft Shop" style={{ width: '100%', margin: 0 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--profile-text)', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>🛍️ Etsy Shop URL</label>
                  <input type="url" className="post-input" value={profileFormData.etsy_url} onChange={e => setProfileFormData({ ...profileFormData, etsy_url: e.target.value })} placeholder="https://etsy.com/shop/..." style={{ width: '100%', margin: 0 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--profile-text)', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>🏷️ Poshmark URL</label>
                  <input type="url" className="post-input" value={profileFormData.poshmark_url} onChange={e => setProfileFormData({ ...profileFormData, poshmark_url: e.target.value })} placeholder="https://poshmark.com/closet/..." style={{ width: '100%', margin: 0 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--profile-text)', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>🛍️ eBay Shop URL</label>
                  <input type="url" className="post-input" value={profileFormData.ebay_url} onChange={e => setProfileFormData({ ...profileFormData, ebay_url: e.target.value })} placeholder="https://ebay.com/usr/..." style={{ width: '100%', margin: 0 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--profile-text)', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>📌 Pinterest Boards</label>
                  <input type="url" className="post-input" value={profileFormData.pinterest_url} onChange={e => setProfileFormData({ ...profileFormData, pinterest_url: e.target.value })} placeholder="https://pinterest.com/..." style={{ width: '100%', margin: 0 }} />
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
                placeholder="Paste a Spotify or YouTube video link"
                style={{ marginBottom: '1rem', width: '100%' }}
                aria-label="Spotify or YouTube link"
              />
            )}
            {renderMusicPlayer()}
          </div>
        </div>

        {/* Right: Personal Storefront & Art Gallery Tabbed Navigation */}
        <div className="profile-main">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveSubTab('storefront')}
              style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: activeSubTab === 'storefront' ? '2px solid var(--color-pine-primary)' : '1px solid var(--color-border)', background: activeSubTab === 'storefront' ? 'var(--color-pine-primary)' : 'rgba(255, 255, 255, 0.05)', color: activeSubTab === 'storefront' ? 'white' : 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}
            >
              <ShoppingBag size={18} /> Direct Storefront
            </button>
            <button
              onClick={() => setActiveSubTab('gallery')}
              style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: activeSubTab === 'gallery' ? '2px solid var(--color-pine-primary)' : '1px solid var(--color-border)', background: activeSubTab === 'gallery' ? 'var(--color-pine-primary)' : 'rgba(255, 255, 255, 0.05)', color: activeSubTab === 'gallery' ? 'white' : 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}
            >
              <Camera size={18} /> Art Gallery / Showcase
            </button>
            <button
              onClick={() => setActiveSubTab('friends')}
              style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: activeSubTab === 'friends' ? '2px solid var(--color-pine-primary)' : '1px solid var(--color-border)', background: activeSubTab === 'friends' ? 'var(--color-pine-primary)' : 'rgba(255, 255, 255, 0.05)', color: activeSubTab === 'friends' ? 'white' : 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer' }}
            >
              <UserPlus size={18} /> Connect Friends
            </button>
          </div>


          {activeSubTab === 'storefront' ? (
            <div className="profile-card storefront-card">
              <div className="storefront-header">
                <h3><ShoppingBag size={18} aria-hidden /> {profile?.store_name?.trim() || `${profile?.full_name || profile?.username || 'My'}'s Direct Storefront`}</h3>
              </div>
              <div className="storefront-grid">
                {myListings.length === 0 ? (
                  <p style={{ color: 'var(--profile-text)', opacity: 0.6, fontSize: '0.9rem', gridColumn: '1 / -1' }}>No listings are currently offered for sale.</p>
                ) : (
                  myListings.map(item => (
                    <div key={item.id} className={`store-item ${item.isDigital ? 'app-item' : ''}`}>
                      {item.isDigital ? (
                        <div className="app-icon" aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.title.substring(0, 3).toUpperCase()}
                        </div>
                      ) : (
                        item.cover_image_url ? (
                          <img src={item.cover_image_url} alt={item.title} style={{ height: 120, objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <div style={{ height: 120, background: 'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem' }}>🌿</div>
                        )
                      )}
                      <div className="store-item-info">
                        <h4 onClick={() => setSelectedProduct(item)} style={{ cursor: 'pointer', color: 'var(--color-pine-dark)', textDecoration: 'underline' }}>{item.title}</h4>
                        {item.isDigital && item.description && <p className="app-desc">{item.description}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="price">{item.price_display}</span>
                          {isEditingProfile && isMyProfile && (
                            <button onClick={() => deleteListing(item.id, item.isDigital)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: '0.2rem' }} title="Delete listing">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <button onClick={() => setSelectedProduct(item)} style={{ flex: 1, textAlign: 'center', background: 'var(--color-pine-primary)', color: 'white', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-md)', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>👁️ Details</button>
                          {item.payment_url && <a href={item.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#635BFF', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>💳 Buy</a>}
                          {item.crypto_url && <a href={item.crypto_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F7931A', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>₿ Crypto</a>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Product Popup Modal */}
              {selectedProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                  <div className="card" style={{ width: '100%', maxWidth: '520px', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative' }}>
                    <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
                    {selectedProduct.cover_image_url && <img src={selectedProduct.cover_image_url} alt={selectedProduct.title} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />}
                    <h3 style={{ margin: 0, color: 'var(--color-pine-dark)' }}>{selectedProduct.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Listing Price: {selectedProduct.price_display}</span>
                    <hr style={{ margin: '1rem 0', borderColor: 'var(--color-border)' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', minHeight: '60px' }}>{selectedProduct.description || 'No additional information listed.'}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                      {selectedProduct.payment_url && <a href={selectedProduct.payment_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#635BFF', color: 'white', padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600 }}>💳 Pay with Card</a>}
                      {selectedProduct.crypto_url && <a href={selectedProduct.crypto_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F7931A', color: 'white', padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600 }}>₿ Pay with Crypto</a>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeSubTab === 'gallery' ? (
            <div className="profile-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0 }}><ImageIcon size={18} /> Art Showcase &amp; Photo Gallery</h3>
              </div>
              
              {/* Add to Art Showcase block for owner */}
              {isMyProfile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem' }}>Add New Piece to Gallery</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input type="text" className="post-input" value={newArtTitle} onChange={e => setNewArtTitle(e.target.value)} placeholder="Title / Artwork description..." style={{ flex: 1, minWidth: '160px', margin: 0, padding: '0.45rem 0.75rem' }} />
                    <input type="url" className="post-input" value={newArtUrl} onChange={e => setNewArtUrl(e.target.value)} placeholder="Image URL..." style={{ flex: 1.5, minWidth: '200px', margin: 0, padding: '0.45rem 0.75rem' }} />
                    <button onClick={addPortfolioItem} disabled={!newArtTitle.trim() || !newArtUrl.trim()} style={{ background: 'var(--color-pine-primary)', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Plus size={16} /> Add Art
                    </button>
                  </div>
                </div>
              )}

              {portfolio.length === 0 ? (
                <p style={{ color: 'var(--profile-text)', opacity: 0.6, fontSize: '0.9rem' }}>No portfolio or showcase images uploaded yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  {portfolio.map(art => (
                    <div key={art.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-border)', height: '210px' }}>
                      <img src={art.url} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', padding: '0.75rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.title}</span>
                        {isMyProfile && (
                          <button onClick={() => deletePortfolioItem(art.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.2rem' }} title="Remove art">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="profile-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0 }}><UserPlus size={18} /> Connect Friends & Communities</h3>
              </div>

              {/* Add / Search Friends Block */}
              {isMyProfile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem' }}>Search & Follow People</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="post-input"
                      value={friendSearch}
                      onChange={e => setFriendSearch(e.target.value)}
                      placeholder="Search name or username..."
                      style={{ flex: 1, padding: '0.45rem 0.75rem' }}
                    />
                  </div>
                  {friendSearch.trim() && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem', maxHeight: '160px', overflowY: 'auto' }}>
                      {allUsers
                        .filter(u => u.id !== currentUser?.id && (u.full_name?.toLowerCase().includes(friendSearch.toLowerCase()) || u.username?.toLowerCase().includes(friendSearch.toLowerCase())))
                        .slice(0, 5)
                        .map(u => (
                          <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-base)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img src={u.avatar_url || '/images/avatar_maker.png'} alt={u.full_name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                              <div>
                                <h5 style={{ margin: 0, fontSize: '0.82rem' }}>{u.full_name || u.username}</h5>
                                <span style={{ fontSize: '0.74rem', opacity: 0.6 }}>@{u.username}</span>
                              </div>
                            </div>
                            {friends.some(f => f.id === u.id) ? (
                              <button onClick={() => removeFriend(u.id)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Unfollow</button>
                            ) : (
                              <button onClick={() => addFriend({ id: u.id, full_name: u.full_name, username: u.username, avatar_url: u.avatar_url })} style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Connect</button>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}

              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Connected Friends</h4>
              {friends.length === 0 ? (
                <p style={{ color: 'var(--profile-text)', opacity: 0.6, fontSize: '0.9rem' }}>No connected friends yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  {friends.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={f.avatar_url || '/images/avatar_maker.png'} alt={f.full_name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{f.full_name || f.username}</span>
                      </div>
                      {isMyProfile && (
                        <button onClick={() => removeFriend(f.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.2rem' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="profile-card">
            <h3>Direct Contact & Connect</h3>
            <p style={{ color: 'var(--profile-text)', opacity: 0.6, fontSize: '0.9rem' }}>Contact this maker or seller via internal messages to negotiate direct local delivery.</p>
          </div>
        </div>
      </div>

      {/* Theme Palette Button */}
      {isMyProfile && (
        <button
          className="theme-editor-toggle"
          onClick={() => setIsEditingTheme(!isEditingTheme)}
          aria-label="Customize profile colors"
          title="Customize theme"
        >
          <Palette size={22} aria-hidden />
        </button>
      )}

      {/* Theme Editor Panel */}
      {isEditingTheme && isMyProfile && (
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
