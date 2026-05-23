import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, Search, Menu, MessageSquare, ShoppingBag, LogOut, X, TreePine, Home } from 'lucide-react';
import './App.css';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { Marketplace } from './components/Marketplace';
import { MarketListingPage } from './components/MarketListingPage';
import { Apps } from './components/Apps';
import { Communities } from './components/Communities';
import { GroupPage } from './components/GroupPage';
import { Messages } from './components/Messages';
import { DiscoverUsers } from './components/DiscoverUsers';
import { CartModal } from './components/CartModal';
import { SearchResults } from './components/SearchResults';
import { TrendingSidebar } from './components/TrendingSidebar';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsAndConditions } from './components/TermsAndConditions';
import { GuestExplore } from './components/GuestExplore';
import { useCart } from './lib/cart';
import { supabase } from './lib/supabase';

import { SeedManager } from './components/SeedManager';
import { Landing } from './components/Landing';

// New Feature Components
import { Events } from './components/Events';
import { EventPage } from './components/EventPage';
import { Notifications } from './components/Notifications';
import { Favorites } from './components/Favorites';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState('/images/avatar_maker.png');
  const [activeTab, setActiveTab] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Real notifications count state
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Cookie banner state
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookies_accepted');
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setShowCookieBanner(false);
  };

  const fetchUnreadCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (!error && count !== null) {
        setUnreadNotificationsCount(count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUnreadCount(session.user.id);
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        if (data?.avatar_url) setUserAvatar(data.avatar_url);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUnreadCount(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    // Set up real-time listener for new notifications
    const channel = supabase
      .channel('navbar-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${session.user.id}`
      }, () => {
        fetchUnreadCount(session.user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Sync active tab from URL — use first path segment only
  useEffect(() => {
    const segment = location.pathname.split('/').filter(Boolean)[0] || 'home';
    setActiveTab(segment);
    setMobileNavOpen(false); // close nav on route change
  }, [location]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg, #1a2f23)',
        color: 'var(--color-text, #fcfcfc)',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <TreePine size={64} style={{ color: 'var(--color-pine-light, #2e7d32)', marginBottom: '1.5rem', animation: 'pulse 2s infinite' }} />
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-muted, #94a3b8)' }}>
          Loading your woodland retreat...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<GuestExplore />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/login" element={
          <div className="auth-wrapper">
            <div className="auth-hero">
              <h1>Rural &amp; Reckless</h1>
              <p>A marketplace for makers, crafters, and local communities.</p>
            </div>
            <Auth />
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navTo = (tab: string) => navigate(tab === 'home' ? '/' : `/${tab}`);

  const SidebarWithNav = () => (
    <Sidebar activeTab={activeTab} setActiveTab={navTo} avatar={userAvatar} />
  );

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)', width: '100%' }}>
      <div className="desktop-sidebar">
        <SidebarWithNav />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <footer style={{ padding: '1rem 2rem', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-card)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>&copy; 2026 Rural &amp; Reckless Media LLC. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <span>|</span>
            <Link to="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </footer>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <Link to="/" className="nav-brand" aria-label="Rural & Reckless home" style={{ textDecoration: 'none', color: 'white' }}>
          <TreePine size={22} />
          Rural &amp; Reckless
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <Search className="search-icon" size={18} aria-hidden />
          <input 
            type="text" 
            placeholder="Search Rural &amp; Reckless..." 
            aria-label="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="nav-actions" style={{ position: 'relative' }}>
          <button className="icon-button" onClick={() => setShowCart(!showCart)} aria-label="Cart" style={{ position: 'relative' }}>
            <ShoppingBag size={20} />
            {items.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-accent)', color: 'white', fontSize: '0.68rem', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {items.length}
              </span>
            )}
          </button>
          <button className="icon-button" onClick={() => navTo('messages')} aria-label="Messages"><MessageSquare size={20} /></button>
          <button
            className="icon-button"
            onClick={() => navTo('notifications')}
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-rust)', color: 'white', fontSize: '0.65rem', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <img
            src={userAvatar}
            alt="Your profile"
            className="avatar-small"
            style={{ cursor: 'pointer' }}
            onClick={() => navTo('profile')}
          />
          <button className="icon-button" onClick={handleLogout} aria-label="Log out">
            <LogOut size={18} />
          </button>
          {/* Mobile hamburger */}
          <button
            className="icon-button mobile-menu-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Drawer */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
      )}
      <div className={`mobile-nav-drawer ${mobileNavOpen ? 'open' : ''}`} aria-hidden={!mobileNavOpen}>
        <SidebarWithNav />
      </div>

      {/* Main Layout */}
      <main className="main-layout" style={{
        display: activeTab === 'home' ? 'grid' : 'block',
        padding: activeTab === 'home' ? undefined : '0',
      }}>
        <Routes>
          <Route path="/" element={
            <>
              <div className="desktop-sidebar"><SidebarWithNav /></div>
              <Feed />
              <TrendingSidebar />
            </>
          } />

          <Route path="/profile" element={
            <PageWrapper><Profile /></PageWrapper>
          } />

          <Route path="/profile/:id" element={
            <PageWrapper><Profile /></PageWrapper>
          } />

          <Route path="/communities" element={
            <PageWrapper><Communities /></PageWrapper>
          } />

          <Route path="/communities/:id" element={
            <PageWrapper><GroupPage /></PageWrapper>
          } />

          <Route path="/market" element={
            <PageWrapper><Marketplace /></PageWrapper>
          } />

          <Route path="/market/listing/:id" element={
            <PageWrapper><MarketListingPage /></PageWrapper>
          } />

          <Route path="/users" element={
            <PageWrapper><DiscoverUsers /></PageWrapper>
          } />

          <Route path="/apps" element={
            <PageWrapper><Apps /></PageWrapper>
          } />

          <Route path="/messages" element={
            <PageWrapper><Messages /></PageWrapper>
          } />

          <Route path="/search" element={
            <PageWrapper><SearchResults /></PageWrapper>
          } />

          <Route path="/events" element={
            <PageWrapper><Events /></PageWrapper>
          } />

          <Route path="/events/:id" element={
            <PageWrapper><EventPage /></PageWrapper>
          } />

          <Route path="/notifications" element={
            <PageWrapper><Notifications /></PageWrapper>
          } />

          <Route path="/favorites" element={
            <PageWrapper><Favorites /></PageWrapper>
          } />

          <Route path="/privacy" element={
            <PageWrapper><PrivacyPolicy /></PageWrapper>
          } />

          <Route path="/terms" element={
            <PageWrapper><TermsAndConditions /></PageWrapper>
          } />

          <Route path="/seed-manager" element={
            <PageWrapper><SeedManager /></PageWrapper>
          } />

          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/explore" element={<Navigate to="/" replace />} />

          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </main>
      {showCart && <CartModal onClose={() => setShowCart(false)} />}

      {showCookieBanner && (
        <div className="cookie-banner" role="dialog" aria-label="Cookie notice">
          <div className="cookie-banner-inner">
            <p>
              This site uses cookies for basic functionality and personalized advertising. 
              See our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link> for details.
            </p>
            <button className="cookie-accept" onClick={handleAcceptCookies}>
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
      <TreePine size={64} style={{ color: 'var(--color-rust)', marginBottom: '1.5rem' }} />
      <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>404 - Lost in the Woods</h1>
      <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-muted)', maxWidth: '400px', fontSize: '0.95rem' }}>
        The page you are looking for has either been moved, deleted, or never existed in the first place.
      </p>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-pine-dark)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>
        <Home size={16} /> Return Home
      </Link>
    </div>
  );
}

export default App;
