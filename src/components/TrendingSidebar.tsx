import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Calendar, Users } from 'lucide-react';
import { AdSenseUnit } from './AdSenseUnit';

export function TrendingSidebar() {
  const [trending, setTrending] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [highlightCommunities, setHighlightCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  async function fetchSidebarData() {
    setLoading(true);
    try {
      // 1. Fetch Trending Makers (profiles)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, tagline, store_name')
        .limit(3);
      setTrending(usersData || []);

      // 2. Fetch Upcoming Events (next 3)
      const now = new Date().toISOString();
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_date,
          event_attendees (id, status)
        `)
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(3);

      if (eventsData) {
        const mappedEvents = eventsData.map(e => {
          const attendeeCount = e.event_attendees?.filter((a: any) => a.status === 'going').length || 0;
          return {
            id: e.id,
            title: e.title,
            event_date: e.event_date,
            attendeeCount
          };
        });
        setUpcomingEvents(mappedEvents);
      }

      // 3. Fetch Featured Communities (2-3) and their member counts
      const { data: commsData } = await supabase
        .from('communities')
        .select(`
          id,
          name,
          description,
          group_members (id)
        `)
        .limit(3);

      if (commsData) {
        const mappedComms = commsData.map(c => {
          const memberCount = c.group_members?.length || 0;
          return {
            id: c.id,
            name: c.name,
            description: c.description,
            memberCount
          };
        });
        setHighlightCommunities(mappedComms);
      }

    } catch (err) {
      console.error('Error fetching sidebar data:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  return (
    <aside className="sidebar right-sidebar" aria-label="Ecosystem sidebar">
      {/* Trending Makers */}
      <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        <h3 className="sidebar-heading" style={{ padding: 0, marginBottom: '1rem', color: 'var(--color-pine-dark)', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Trending Makers
        </h3>
        {loading ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Loading makers…</p>
        ) : trending.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>No trending makers yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trending.map(u => (
              <div key={u.id} className="trending-item" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img
                  src={u.avatar_url || '/images/avatar_maker.png'}
                  alt={u.username}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div className="trending-content" style={{ minWidth: 0, flex: 1 }}>
                  <Link to={`/profile/${u.id}`} style={{ textDecoration: 'none', color: 'var(--color-text-main)', display: 'block' }}>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>{u.store_name || u.full_name || u.username}</h5>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.tagline || 'Artisan & Maker'}
                    </p>
                  </Link>
                </div>
                <Link to={`/profile/${u.id}`} style={{ color: 'var(--color-pine-primary)' }} aria-label={`View ${u.username}'s storefront`}>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events Section [NEW] */}
      <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginTop: '1rem' }}>
        <h3 className="sidebar-heading" style={{ padding: 0, marginBottom: '1rem', color: 'var(--color-pine-dark)', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={16} /> Upcoming Events
        </h3>
        
        {loading ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Loading events…</p>
        ) : upcomingEvents.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>No upcoming events.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {upcomingEvents.map(e => (
              <div key={e.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <Link to={`/events/${e.id}`} style={{ textDecoration: 'none', color: 'var(--color-pine-dark)', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}>
                  {e.title}
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  <span>{formatDate(e.event_date)}</span>
                  <span style={{ background: 'var(--color-bg-base)', padding: '0.05rem 0.35rem', borderRadius: 4, fontWeight: 600 }}>{e.attendeeCount} going</span>
                </div>
              </div>
            ))}
            <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--color-pine-primary)', fontWeight: 700, textDecoration: 'underline', marginTop: '0.25rem' }}>
              View All Events <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Community Highlights Section [NEW] */}
      <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginTop: '1rem' }}>
        <h3 className="sidebar-heading" style={{ padding: 0, marginBottom: '1rem', color: 'var(--color-pine-dark)', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={16} /> Community Highlights
        </h3>
        
        {loading ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Loading communities…</p>
        ) : highlightCommunities.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>No communities found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {highlightCommunities.map(c => (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <Link to={`/communities/${c.id}`} style={{ textDecoration: 'none', color: 'var(--color-pine-dark)', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}>
                  {c.name}
                </Link>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-pine-primary)', fontWeight: 600 }}>
                  {c.memberCount} member{c.memberCount !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AdSense Unit */}
      <AdSenseUnit slotId="sidebar_ad_938472" format="rectangle" />
    </aside>
  );
}
