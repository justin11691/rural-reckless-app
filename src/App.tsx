import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Menu, MessageSquare, ShoppingBag, BookOpen, Users, LogOut } from 'lucide-react';
import './App.css';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';

const MOCK_USER = {
  name: "Jane Doe",
  avatar: "/images/avatar_maker.png"
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update activeTab based on current route
  useEffect(() => {
    if (location.pathname === '/') setActiveTab('home');
    if (location.pathname === '/profile') setActiveTab('profile');
  }, [location]);

  // If we don't have a session, only allow the login route
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
          <input type="text" placeholder="Search Rural & Reckless..." />
        </div>

        <div className="nav-actions">
          <button className="icon-button"><MessageSquare size={20} /></button>
          <button className="icon-button"><Bell size={20} /></button>
          <img src={MOCK_USER.avatar} alt="Profile" className="avatar-small" />
          <button className="icon-button" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="main-layout" style={{ 
        display: activeTab === 'profile' ? 'block' : 'grid',
        maxWidth: activeTab === 'profile' ? '100%' : '1400px',
        padding: activeTab === 'profile' ? '0' : '2rem'
      }}>
        <Routes>
          <Route path="/" element={
            <>
              <Sidebar activeTab={activeTab} setActiveTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)} avatar={MOCK_USER.avatar} />
              <Feed />
              
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
            </>
          } />

          <Route path="/profile" element={
            <div style={{ display: 'flex' }}>
              <div style={{ width: '280px', padding: '2rem', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)', minHeight: '100vh' }}>
                 <Sidebar activeTab={activeTab} setActiveTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)} avatar={MOCK_USER.avatar} />
              </div>
              <div style={{ flex: 1 }}>
                <Profile />
              </div>
            </div>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
