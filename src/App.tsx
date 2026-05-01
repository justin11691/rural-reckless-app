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
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userAvatar, setUserAvatar] = useState('/images/avatar_maker.png');
  const [activeTab, setActiveTab] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  // Sync active tab from URL
  useEffect(() => {
    const tab = location.pathname.replace('/', '') || 'home';
    setActiveTab(tab);
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

        <div className="nav-actions">
          <button className="icon-button" onClick={() => navTo('messages')} aria-label="Messages"><MessageSquare size={20} /></button>
          <button className="icon-button" aria-label="Notifications"><Bell size={20} /></button>
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

          <Route path="/communities" element={
            <PageWrapper><Communities /></PageWrapper>
          } />

          <Route path="/communities/:id" element={
            <PageWrapper><GroupPage /></PageWrapper>
          } />

          <Route path="/market" element={
            <PageWrapper><Marketplace /></PageWrapper>
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
    </div>
  );
}

export default App;
