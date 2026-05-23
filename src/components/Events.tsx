import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Clock, X, Image as ImageIcon, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export function Events() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
      }
    });

    fetchCommunities();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [tab, selectedCommunity]);

  async function fetchCommunities() {
    const { data } = await supabase
      .from('communities')
      .select('id, name')
      .order('name');
    if (data) setCommunities(data);
  }

  async function fetchEvents() {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      let query = supabase
        .from('events')
        .select(`
          *,
          communities (id, name),
          profiles:creator_id (id, username, full_name, avatar_url),
          event_attendees (id, user_id, status)
        `);

      if (tab === 'upcoming') {
        query = query.gte('event_date', now);
      } else {
        query = query.lt('event_date', now);
      }

      if (selectedCommunity !== 'all') {
        query = query.eq('community_id', selectedCommunity);
      }

      query = query.order('event_date', { ascending: tab === 'upcoming' });

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!currentUser) return;

    setUploadingImage(true);
    setFormError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      setCoverImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setFormError('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    if (!title || !description || !location || !eventDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const { error } = await supabase
        .from('events')
        .insert({
          creator_id: currentUser.id,
          title,
          description,
          location,
          event_date: new Date(eventDate).toISOString(),
          end_date: endDate ? new Date(endDate).toISOString() : null,
          community_id: communityId || null,
          cover_image_url: coverImageUrl || null,
          max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : null
        });

      if (error) throw error;

      // Reset form & close
      setTitle('');
      setDescription('');
      setLocation('');
      setEventDate('');
      setEndDate('');
      setCommunityId('');
      setCoverImageUrl('');
      setMaxAttendees('');
      setShowCreateModal(false);
      fetchEvents();
    } catch (err: any) {
      console.error('Error creating event:', err);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRSVP(eventId: string, currentRSVP: any, targetStatus: 'going' | 'interested' | 'not_going') {
    if (!currentUser) {
      alert('Please log in to RSVP.');
      return;
    }

    try {
      if (currentRSVP) {
        if (currentRSVP.status === targetStatus) {
          // Toggle off (delete RSVP)
          const { error } = await supabase
            .from('event_attendees')
            .delete()
            .eq('id', currentRSVP.id);
          if (error) throw error;
        } else {
          // Update status
          const { error } = await supabase
            .from('event_attendees')
            .update({ status: targetStatus })
            .eq('id', currentRSVP.id);
          if (error) throw error;
        }
      } else {
        // Insert new RSVP
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: currentUser.id,
            status: targetStatus
          });
        if (error) throw error;
      }
      fetchEvents();
    } catch (err) {
      console.error('Error handling RSVP:', err);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Header / Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', color: 'var(--color-pine-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={28} /> Community Events
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Find workshops, planting schedules, local pop-ups, and creator gatherings.
          </p>
        </div>

        {currentUser && (
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {/* Tabs and Filtering */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setTab('upcoming')}
            style={{
              padding: '0.5rem 1.25rem',
              background: tab === 'upcoming' ? 'var(--color-pine-primary)' : 'transparent',
              color: tab === 'upcoming' ? 'white' : 'var(--color-text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: 'none',
              transform: 'none'
            }}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTab('past')}
            style={{
              padding: '0.5rem 1.25rem',
              background: tab === 'past' ? 'var(--color-pine-primary)' : 'transparent',
              color: tab === 'past' ? 'white' : 'var(--color-text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: 'none',
              transform: 'none'
            }}
          >
            Past Events
          </button>
        </div>

        <div>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--color-pine-dark)',
              fontWeight: 600,
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Communities</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
          <Calendar size={48} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-pine-dark)' }}>No Events Found</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {tab === 'upcoming' 
              ? 'There are no upcoming events scheduled. Why not create one?' 
              : 'No past events found matching the filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {events.map((event) => {
            const userRSVP = currentUser ? event.event_attendees.find((a: any) => a.user_id === currentUser.id) : null;
            const goingCount = event.event_attendees.filter((a: any) => a.status === 'going').length;
            const interestedCount = event.event_attendees.filter((a: any) => a.status === 'interested').length;

            return (
              <article key={event.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Cover Image */}
                <div style={{ height: '160px', background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover` : 'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', position: 'relative' }}>
                  {event.communities && (
                    <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'var(--color-wood-brown)', color: 'white', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-pine-dark)' }}>
                      {event.communities.name}
                    </span>
                  )}
                </div>

                {/* Event Info */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>
                    <Link to={`/events/${event.id}`} style={{ color: 'var(--color-pine-dark)', textDecoration: 'none' }}>
                      {event.title}
                    </Link>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} style={{ color: 'var(--color-wood-brown)' }} />
                      {formatDate(event.event_date)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} style={{ color: 'var(--color-wood-brown)' }} />
                      {event.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={14} style={{ color: 'var(--color-wood-brown)' }} />
                      {goingCount} going • {interestedCount} interested
                    </span>
                  </div>

                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-main)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, flexGrow: 1 }}>
                    {event.description}
                  </p>

                  {/* RSVP & Details buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => handleRSVP(event.id, userRSVP, 'going')}
                      style={{
                        flex: 1,
                        minHeight: '36px',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        background: userRSVP?.status === 'going' ? 'var(--color-pine-dark)' : 'white',
                        color: userRSVP?.status === 'going' ? 'white' : 'var(--color-text-main)',
                        border: '2px solid var(--color-pine-dark)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transform: 'none',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      {userRSVP?.status === 'going' && <Check size={12} />} Going
                    </button>
                    <button
                      onClick={() => handleRSVP(event.id, userRSVP, 'interested')}
                      style={{
                        flex: 1,
                        minHeight: '36px',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        background: userRSVP?.status === 'interested' ? 'var(--color-wood-brown)' : 'white',
                        color: userRSVP?.status === 'interested' ? 'white' : 'var(--color-text-main)',
                        border: '2px solid var(--color-wood-brown)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transform: 'none',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      {userRSVP?.status === 'interested' && <Check size={12} />} Interested
                    </button>
                    <Link
                      to={`/events/${event.id}`}
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        background: 'var(--color-bg-base)',
                        color: 'var(--color-text-main)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600
                      }}
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 47, 35, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '1.75rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', padding: 4, cursor: 'pointer', boxShadow: 'none', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontFamily: 'Outfit, sans-serif' }}>Create New Event</h2>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homesteading & Sourdough Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell folks what the event is about, what to bring, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Show Low City Park, Pavilion 2 (or Online)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>Associated Community</label>
                  <select
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)', height: '40px' }}
                  >
                    <option value="">None (Independent)</option>
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>Max Attendees (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)', height: '40px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pine-dark)' }}>Cover Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      background: 'var(--color-bg-base)',
                      border: '2px solid var(--color-pine-dark)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <ImageIcon size={16} /> Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {uploadingImage && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Uploading...</span>}
                  {coverImageUrl && <span style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 600 }}>✓ Image uploaded!</span>}
                </div>
              </div>

              {formError && (
                <div style={{ color: 'var(--color-rust)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
