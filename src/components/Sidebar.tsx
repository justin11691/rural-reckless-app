import { Home, Users, ShoppingBag, MessageSquare } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  avatar: string;
}

export function Sidebar({ activeTab, setActiveTab, avatar }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a href="#" className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>
        <Home size={20} /> The Feed
      </a>
      <a href="#" className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
        <img src={avatar} alt="Profile" className="avatar-small" style={{width: 20, height: 20}} /> 
        My Profile
      </a>
      <a href="#" className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>
        <Users size={20} /> Discover Users
      </a>
      <a href="#" className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}>
        <MessageSquare size={20} /> Messages
      </a>
      
      <div className="sidebar-divider"></div>
      
      <h3 className="sidebar-heading">Communities</h3>
      <a href="#" className={`nav-item ${activeTab === 'communities' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('communities'); }}>
        <Users size={20} /> Communities Hub
      </a>
      
      <div className="sidebar-divider"></div>

      <h3 className="sidebar-heading">Marketplace</h3>
      <a href="#" className={`nav-item ${activeTab === 'market' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('market'); }}>
        <ShoppingBag size={20} /> Farmers Market
      </a>
      <a href="#" className={`nav-item ${activeTab === 'apps' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('apps'); }}>
        <ShoppingBag size={20} /> Digital Goods & Apps
      </a>
    </aside>
  );
}
