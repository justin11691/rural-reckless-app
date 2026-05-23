import { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, UserPlus, Calendar, ShoppingBag, Bell, BellOff, Check, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
      }
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  async function fetchNotifications() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  async function markAllAsRead() {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case 'like':
        return <ThumbsUp size={20} style={{ color: 'var(--color-wood-brown)' }} />;
      case 'comment':
        return <MessageCircle size={20} style={{ color: 'var(--color-pine-light)' }} />;
      case 'follow':
        return <UserPlus size={20} style={{ color: 'var(--color-pine-primary)' }} />;
      case 'event':
        return <Calendar size={20} style={{ color: 'var(--color-rust)' }} />;
      case 'listing':
        return <ShoppingBag size={20} style={{ color: 'var(--color-rust)' }} />;
      default:
        return <Bell size={20} style={{ color: 'var(--color-text-muted)' }} />;
    }
  }

  function groupNotifications(notifs: any[]) {
    const today: any[] = [];
    const yesterday: any[] = [];
    const earlier: any[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    
    const yest = new Date();
    yest.setDate(now.getDate() - 1);
    const yesterdayStr = yest.toDateString();

    notifs.forEach(n => {
      const date = new Date(n.created_at);
      const dateStr = date.toDateString();

      if (dateStr === todayStr) {
        today.push(n);
      } else if (dateStr === yesterdayStr) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (loading && notifications.length === 0) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading notifications...</div>;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const groups = groupNotifications(notifications);

  const renderSection = (title: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--color-pine-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                background: n.is_read ? 'var(--color-bg-card)' : '#fbf7f0',
                borderLeft: n.is_read ? '2px solid var(--color-pine-dark)' : '4px solid var(--color-rust)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.18s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: n.is_read ? 500 : 700, color: 'var(--color-text-main)' }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {n.body}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.2rem' }}>
                    {title === 'Earlier' ? `${formatDate(n.created_at)} at ` : ''}{formatTime(n.created_at)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-pine-primary)',
                      cursor: 'pointer'
                    }}
                    title="View details"
                  >
                    <Eye size={15} />
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    style={{
                      background: 'white',
                      border: '2px solid var(--color-pine-dark)',
                      color: 'var(--color-pine-dark)',
                      padding: 0,
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'none',
                      transform: 'none',
                      minHeight: 'auto'
                    }}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '720px', margin: '0 auto' }}>
      {/* Title / Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={28} /> Notifications
          </h1>
          {unreadCount > 0 ? (
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-rust)', fontSize: '0.9rem', fontWeight: 600 }}>
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}.
            </p>
          ) : (
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              You are all caught up!
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
              background: 'white',
              color: 'var(--color-pine-dark)',
              border: '2px solid var(--color-pine-dark)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: 'none',
              transform: 'none',
              minHeight: '40px'
            }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', borderStyle: 'dashed' }}>
          <BellOff size={48} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-pine-dark)' }}>No Notifications Yet</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            When someone likes or comments on your posts, or follows you, you'll see it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {renderSection('Today', groups.today)}
          {renderSection('Yesterday', groups.yesterday)}
          {renderSection('Earlier', groups.earlier)}
        </div>
      )}
    </div>
  );
}
