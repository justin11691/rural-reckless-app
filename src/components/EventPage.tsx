import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Trash2, Edit3, Share2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function EventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [userRSVP, setUserRSVP] = useState<any>(null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editMaxAttendees, setEditMaxAttendees] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
      }
    });
    
    fetchEventDetails();
  }, [id]);

  async function fetchEventDetails() {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch event info
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          communities (id, name),
          profiles:creator_id (id, username, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Populate edit fields
      setEditTitle(eventData.title);
      setEditDescription(eventData.description);
      setEditLocation(eventData.location);
      setEditDate(eventData.event_date ? new Date(eventData.event_date).toISOString().slice(0, 16) : '');
      setEditEndDate(eventData.end_date ? new Date(eventData.end_date).toISOString().slice(0, 16) : '');
      setEditMaxAttendees(eventData.max_attendees || '');

      // Fetch attendees
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('event_attendees')
        .select(`
          id,
          status,
          user_id,
          profiles:user_id (id, username, full_name, avatar_url)
        `)
        .eq('event_id', id);

      if (attendeesError) throw attendeesError;
      setAttendees(attendeesData || []);

      // Check current user RSVP
      if (currentUser) {
        const myRSVP = attendeesData?.find((a: any) => a.user_id === currentUser.id);
        setUserRSVP(myRSVP || null);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  }

  // Update user RSVP cache when currentUser is loaded asynchronously
  useEffect(() => {
    if (currentUser && attendees.length > 0) {
      const myRSVP = attendees.find((a: any) => a.user_id === currentUser.id);
      setUserRSVP(myRSVP || null);
    }
  }, [currentUser, attendees]);

  async function handleRSVP(status: 'going' | 'interested' | 'not_going') {
    if (!currentUser || !id) {
      alert('Please log in to RSVP.');
      return;
    }

    try {
      if (userRSVP) {
        if (userRSVP.status === status) {
          // Remove RSVP
          const { error } = await supabase
            .from('event_attendees')
            .delete()
            .eq('id', userRSVP.id);
          if (error) throw error;
        } else {
          // Update RSVP
          const { error } = await supabase
            .from('event_attendees')
            .update({ status })
            .eq('id', userRSVP.id);
          if (error) throw error;
        }
      } else {
        // Create RSVP
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: id,
            user_id: currentUser.id,
            status
          });
        if (error) throw error;
      }
      fetchEventDetails();
    } catch (err) {
      console.error('Error RSVPing:', err);
    }
  }

  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !currentUser || event.creator_id !== currentUser.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: editTitle,
          description: editDescription,
          location: editLocation,
          event_date: new Date(editDate).toISOString(),
          end_date: editEndDate ? new Date(editEndDate).toISOString() : null,
          max_attendees: editMaxAttendees ? parseInt(editMaxAttendees, 10) : null
        })
        .eq('id', event.id);

      if (error) throw error;
      setIsEditing(false);
      fetchEventDetails();
    } catch (err: any) {
      alert('Error updating event: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent() {
    if (!event || !currentUser || event.creator_id !== currentUser.id) return;
    if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;
      navigate('/events');
    } catch (err: any) {
      alert('Error deleting event: ' + err.message);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }

  function formatDateRange(startStr: string, endStr: string | null) {
    const start = new Date(startStr);
    const startFormatted = start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    if (!endStr) return startFormatted;

    const end = new Date(endStr);
    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
      return `${startFormatted} – ${end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })}`;
    } else {
      return `${startFormatted} – ${end.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}`;
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Calendar size={48} style={{ color: 'var(--color-rust)', marginBottom: '1rem' }} />
        <h2>Event Not Found</h2>
        <p>The event you are looking for does not exist or has been deleted.</p>
        <Link to="/events" style={{ textDecoration: 'underline', color: 'var(--color-pine-primary)', fontWeight: 600 }}>Back to Events</Link>
      </div>
    );
  }

  const isCreator = currentUser && event.creator_id === currentUser.id;
  const goingAttendees = attendees.filter(a => a.status === 'going');
  const interestedAttendees = attendees.filter(a => a.status === 'interested');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to All Events
      </Link>

      {!isEditing ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Cover Image */}
          <div style={{ height: '260px', background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover` : 'linear-gradient(135deg, var(--color-pine-dark), var(--color-pine-light))', position: 'relative' }}>
            {event.communities && (
              <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--color-wood-brown)', color: 'white', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-pine-dark)' }}>
                {event.communities.name}
              </span>
            )}
          </div>

          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header / Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
              <div>
                <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', color: 'var(--color-pine-dark)', fontSize: '2rem' }}>
                  {event.title}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Created by</span>
                  <Link to={`/profile/${event.profiles.id}`} style={{ color: 'var(--color-pine-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                    @{event.profiles.username || event.profiles.full_name}
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleShare}
                  style={{
                    background: 'white',
                    color: 'var(--color-text-main)',
                    border: '2px solid var(--color-border)',
                    boxShadow: 'none',
                    transform: 'none',
                    minHeight: '40px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Share2 size={15} /> Share
                </button>

                {isCreator && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: 'var(--color-wood-brown)',
                        color: 'white',
                        border: '2px solid var(--color-pine-dark)',
                        minHeight: '40px',
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Edit3 size={15} /> Edit
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      style={{
                        background: 'var(--color-rust)',
                        color: 'white',
                        border: '2px solid var(--color-pine-dark)',
                        minHeight: '40px',
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', background: 'var(--color-bg-base)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Clock size={20} style={{ color: 'var(--color-wood-brown)', marginTop: '0.1rem' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--color-pine-dark)', fontSize: '0.9rem' }}>Date & Time</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                    {formatDateRange(event.event_date, event.end_date)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={20} style={{ color: 'var(--color-wood-brown)', marginTop: '0.1rem' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--color-pine-dark)', fontSize: '0.9rem' }}>Location</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                    {event.location}
                  </p>
                </div>
              </div>
            </div>

            {/* RSVP Selection Panel */}
            {currentUser && (
              <div className="card" style={{ border: '2px solid var(--color-pine-dark)', background: '#fbf7f0', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: 'var(--color-pine-dark)' }}>Are you attending this event?</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>RSVP to let the creator know and add it to your calendar.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleRSVP('going')}
                    style={{
                      minHeight: '40px',
                      padding: '0.5rem 1.25rem',
                      background: userRSVP?.status === 'going' ? 'var(--color-pine-dark)' : 'white',
                      color: userRSVP?.status === 'going' ? 'white' : 'var(--color-text-main)',
                      border: '2px solid var(--color-pine-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    {userRSVP?.status === 'going' && <Check size={14} />} Going
                  </button>
                  <button
                    onClick={() => handleRSVP('interested')}
                    style={{
                      minHeight: '40px',
                      padding: '0.5rem 1.25rem',
                      background: userRSVP?.status === 'interested' ? 'var(--color-wood-brown)' : 'white',
                      color: userRSVP?.status === 'interested' ? 'white' : 'var(--color-text-main)',
                      border: '2px solid var(--color-wood-brown)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    {userRSVP?.status === 'interested' && <Check size={14} />} Interested
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 style={{ color: 'var(--color-pine-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginTop: 0 }}>Event Details</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>
                {event.description}
              </p>
            </div>

            {/* Attendees Section */}
            <div>
              <h3 style={{ color: 'var(--color-pine-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} /> Who's Going ({goingAttendees.length})
              </h3>
              
              {goingAttendees.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>No one has RSVP'd going yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {goingAttendees.slice(0, 20).map((a) => (
                    <Link
                      key={a.id}
                      to={`/profile/${a.profiles.id}`}
                      title={a.profiles.full_name || a.profiles.username}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.65rem 0.25rem 0.25rem', textDecoration: 'none', color: 'var(--color-text-main)' }}
                    >
                      <img
                        src={a.profiles.avatar_url || '/images/avatar_maker.png'}
                        alt={a.profiles.full_name}
                        style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{a.profiles.username || a.profiles.full_name}</span>
                    </Link>
                  ))}
                  {goingAttendees.length > 20 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
                      +{goingAttendees.length - 20}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interested Attendees */}
            {interestedAttendees.length > 0 && (
              <div>
                <h4 style={{ color: 'var(--color-pine-dark)', margin: '1rem 0 0.5rem' }}>Interested ({interestedAttendees.length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {interestedAttendees.slice(0, 20).map((a) => (
                    <Link
                      key={a.id}
                      to={`/profile/${a.profiles.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', color: 'var(--color-text-muted)' }}
                    >
                      <img
                        src={a.profiles.avatar_url || '/images/avatar_maker.png'}
                        alt={a.profiles.full_name}
                        style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.75rem' }}>{a.profiles.username}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontFamily: 'Outfit, sans-serif' }}>Edit Event</h2>
            <button
              onClick={() => setIsEditing(false)}
              style={{ background: 'none', border: 'none', boxShadow: 'none', padding: '0.2rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUpdateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Event Title *</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Description *</label>
              <textarea
                required
                rows={6}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Location *</label>
              <input
                type="text"
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Max Attendees (Optional)</label>
              <input
                type="number"
                min="1"
                placeholder="No limit"
                value={editMaxAttendees}
                onChange={(e) => setEditMaxAttendees(e.target.value)}
                style={{ width: '100%', maxWidth: '200px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-border)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  flex: 1,
                  background: 'white',
                  color: 'var(--color-text-main)',
                  border: '2px solid var(--color-pine-dark)',
                  boxShadow: 'none',
                  transform: 'none'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
