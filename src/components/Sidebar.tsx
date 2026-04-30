import { Home, Users, ShoppingBag, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  avatar: string;
}

export function Sidebar({ activeTab, setActiveTab, avatar }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a href="#" className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
        <Home size={20} /> Town Square
      </a>
      <a href="#" className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
        <img src={avatar} alt="Profile" className="avatar-small" style={{width: 20, height: 20}} /> 
        My Profile
      </a>
      
      <div className="sidebar-divider"></div>
      
      <h3 className="sidebar-heading">Communities</h3>
      <a href="#" className="nav-item"><Users size={20} /> Woodworkers Guild</a>
      <a href="#" className="nav-item"><Users size={20} /> 3D Printing Hub</a>
      <a href="#" className="nav-item"><BookOpen size={20} /> Indie Authors</a>
      
      <div className="sidebar-divider"></div>

      <h3 className="sidebar-heading">Marketplace</h3>
      <a href="#" className="nav-item"><ShoppingBag size={20} /> Farmers Market</a>
      <a href="#" className="nav-item"><ShoppingBag size={20} /> Digital Goods & Apps</a>
    </aside>
  );
}
