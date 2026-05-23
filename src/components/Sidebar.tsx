import { Home, Users, ShoppingBag, MessageSquare, Calendar, Heart, Bell } from 'lucide-react';

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
      
      <a href="#" className={`nav-item ${activeTab === 'market' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('market'); }}>
        <ShoppingBag size={20} /> Marketplace
      </a>

      <a href="#" className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>
        <Users size={20} /> Creators
      </a>

      <a href="#" className={`nav-item ${activeTab === 'communities' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('communities'); }}>
        <Users size={20} /> Communities
      </a>

      <a href="#" className={`nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('events'); }}>
        <Calendar size={20} /> Events
      </a>

      <a href="#" className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}>
        <MessageSquare size={20} /> Messages
      </a>

      <a href="#" className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('notifications'); }}>
        <Bell size={20} /> Notifications
      </a>

      <a href="#" className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('favorites'); }}>
        <Heart size={20} /> Favorites
      </a>

      <div className="sidebar-divider"></div>

      <a href="#" className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
        <img src={avatar || '/images/avatar_maker.png'} alt="Profile" className="avatar-small" style={{ width: 20, height: 20, borderRadius: '50%' }} /> 
        My Profile
      </a>
    </aside>
  );
}
