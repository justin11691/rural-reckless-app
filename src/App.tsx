import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, Search, Menu, MessageSquare, ShoppingBag, BookOpen, Users, LogOut, X, TreePine } from 'lucide-react';
import './App.css';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { Marketplace } from './components/Marketplace';
import { Apps } from './components/Apps';
import { Communities } from './components/Communities';
import { GroupPage } from './components/GroupPage';
import { Messages } from './components/Messages';
import { DiscoverUsers } from './components/DiscoverUsers';
import { CartModal } from './components/CartModal';
import { useCart } from './lib/cart';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userAvatar, setUserAvatar] = useState('/images/avatar_maker.png');
  const [activeTab, setActiveTab] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        if (data?.avatar_url) setUserAvatar(data.avatar_url);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync active tab from URL — use first path segment only
  useEffect(() => {
    const segment = location.pathname.split('/').filter(Boolean)[0] || 'home';
    setActiveTab(segment);
    setMobileNavOpen(false); // close nav on route change
  }, [location]);

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
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
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>
      <div className="desktop-sidebar">
        <SidebarWithNav />
      </div>
      {children}
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

        <div className="nav-search">
          <Search className="search-icon" size={18} aria-hidden />
          <input type="text" placeholder="Search Rural &amp; Reckless..." aria-label="Search" />
        </div>

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
          <button className="icon-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notifications"><Bell size={20} /></button>
          {notificationsOpen && (
            <div className="card" style={{ position: 'absolute', top: '50px', right: '40px', width: '280px', zIndex: 1000, padding: '1rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-pine-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                System & Maker Notifications
                <button onClick={() => setNotificationsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={14} /></button>
              </h4>
              <hr style={{ margin: '0.5rem 0', borderColor: 'var(--color-border)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.82rem', padding: '0.35rem 0' }}>
                  <strong>🌿 New Storefront Item:</strong> Arthur listed a new handmade bowl for sale.
                </div>
                <div style={{ fontSize: '0.82rem', padding: '0.35rem 0' }}>
                  <strong>📬 Friend Connected:</strong> Your friend request was approved.
                </div>
                <div style={{ fontSize: '0.82rem', padding: '0.35rem 0' }}>
                  <strong>🛒 Direct Sale Complete:</strong> Maker confirmed your transaction.
                </div>
              </div>
            </div>
          )}
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
              <aside className="sidebar right-sidebar" aria-label="Trending storefronts">
                <div className="card">
                  <h3 className="sidebar-heading" style={{ padding: 0, marginBottom: '1rem' }}>Trending Storefronts</h3>
                  <div className="trending-item">
                    <ShoppingBag size={32} style={{ color: 'var(--color-pine-light)', flexShrink: 0 }} aria-hidden />
                    <div className="trending-content">
                      <h5>Arthur's Woodshop</h5>
                      <p>New handmade bowls added</p>
                    </div>
                  </div>
                  <div className="trending-item">
                    <BookOpen size={32} style={{ color: 'var(--color-wood-light)', flexShrink: 0 }} aria-hidden />
                    <div className="trending-content">
                      <h5>The Indie Press</h5>
                      <p>3 new authors published</p>
                    </div>
                  </div>
                  <div className="trending-item">
                    <Users size={32} style={{ color: 'var(--color-accent)', flexShrink: 0 }} aria-hidden />
                    <div className="trending-content">
                      <h5>Jane's Digital Tools</h5>
                      <p>New app available for download</p>
                    </div>
                  </div>
                </div>
              </aside>
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

          <Route path="/users" element={
            <PageWrapper><DiscoverUsers /></PageWrapper>
          } />

          <Route path="/apps" element={
            <PageWrapper><Apps /></PageWrapper>
          } />

          <Route path="/messages" element={
            <PageWrapper><Messages /></PageWrapper>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </div>
  );
}

export default App;
