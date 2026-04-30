import { useState } from 'react';
import { Bell, Search, Menu, MessageSquare, ShoppingBag, BookOpen, Users } from 'lucide-react';
import './App.css';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';

const MOCK_USER = {
  name: "Jane Doe",
  avatar: "/images/avatar_maker.png"
};

function App() {
  const [activeTab, setActiveTab] = useState('profile'); // Defaulting to profile to show off the new feature

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
      <main className="main-layout" style={{ 
        display: activeTab === 'profile' ? 'block' : 'grid',
        maxWidth: activeTab === 'profile' ? '100%' : '1400px',
        padding: activeTab === 'profile' ? '0' : '2rem'
      }}>
        
        {activeTab === 'home' && (
          <>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} avatar={MOCK_USER.avatar} />
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
        )}

        {activeTab === 'profile' && (
          <div style={{ display: 'flex' }}>
            <div style={{ width: '280px', padding: '2rem', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)', minHeight: '100vh' }}>
               <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} avatar={MOCK_USER.avatar} />
            </div>
            <div style={{ flex: 1 }}>
              <Profile />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
