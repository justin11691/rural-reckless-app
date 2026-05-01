import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ArrowLeft, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export function Messages() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // If a user clicked "Message Seller", we pass state through the router
  const prefillReceiver = location.state?.receiverId || null;
  const prefillListing = location.state?.listingId || null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        loadConversations(session.user.id);
      } else {
        setLoadingChats(false);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations(userId: string) {
    // To get conversations, we get all messages where user is sender or receiver
    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id, full_name, username, avatar_url, store_name), receiver:receiver_id(id, full_name, username, avatar_url, store_name)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading messages:', error);
      setLoadingChats(false);
      return;
    }

    // Group into conversations by the "other" user
    const chatMap = new Map();
    
    (msgs || []).forEach(m => {
      const isSender = m.sender_id === userId;
      const otherUser = isSender ? m.receiver : m.sender;
      if (!otherUser) return;
      
      if (!chatMap.has(otherUser.id)) {
        chatMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: m,
          unread: !isSender && !m.is_read
        });
      }
    });

    const loadedChats = Array.from(chatMap.values());
    setConversations(loadedChats);
    setLoadingChats(false);

    // If we came from a "Message Seller" button, auto-open or create that chat
    if (prefillReceiver) {
      const existing = loadedChats.find(c => c.user.id === prefillReceiver);
      if (existing) {
        openChat(existing);
      } else {
        // Fetch the user's profile to create a temporary chat shell
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, store_name')
          .eq('id', prefillReceiver)
          .single();
          
        if (profile) {
          const newChat = { user: profile, lastMessage: null, unread: false, isNew: true };
          setConversations(prev => [newChat, ...prev]);
          openChat(newChat);
        }
      }
      // Clear location state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    } else if (loadedChats.length > 0 && window.innerWidth > 768) {
      // Auto-open first chat on desktop
      openChat(loadedChats[0]);
    }
  }

  async function openChat(chat: any) {
    setActiveChat(chat);
    if (!currentUser || chat.isNew) {
      setMessages([]);
      return;
    }

    const { data: thread } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${chat.user.id}),and(sender_id.eq.${chat.user.id},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });

    setMessages(thread || []);

    // Mark unread as read
    const unreadIds = (thread || []).filter(m => m.receiver_id === currentUser.id && !m.is_read).map(m => m.id);
    if (unreadIds.length > 0) {
      await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      // Update local state
      setConversations(prev => prev.map(c => c.user.id === chat.user.id ? { ...c, unread: false } : c));
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    const newMsgObj = {
      sender_id: currentUser.id,
      receiver_id: activeChat.user.id,
      listing_id: prefillListing || null, // attach listing context if coming from a "Buy" button
      content: msgText,
    };

    // Optimistic UI update
    const tempMsg = { ...newMsgObj, id: 'temp-' + Date.now(), created_at: new Date().toISOString(), is_read: false };
    setMessages(prev => [...prev, tempMsg]);

    const { data, error } = await supabase.from('messages').insert([newMsgObj]).select().single();
    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      // Refresh conversations list to update 'last message'
      loadConversations(currentUser.id);
    } else {
      alert('Failed to send message.');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  }

  if (!currentUser) {
    return (
      <div className="card" style={{ margin: '2rem auto', maxWidth: 400, textAlign: 'center', padding: '3rem 2rem' }}>
        <MessageSquare size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
        <h3>Sign in to Message</h3>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>You must be logged in to chat with sellers and community members.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <div className="card" style={{ flex: 1, display: 'flex', padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        
        {/* Chat List (Sidebar) */}
        <div style={{ width: 320, borderRight: '1px solid var(--color-border)', display: activeChat && window.innerWidth <= 768 ? 'none' : 'flex', flexDirection: 'column', background: 'var(--color-bg-base)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} /> Messages
            </h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingChats ? (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading chats...</p>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <MessageSquare size={32} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                <p>No messages yet.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Find something you like in the Marketplace and message the seller!</p>
              </div>
            ) : (
              conversations.map(chat => (
                <div 
                  key={chat.user.id}
                  onClick={() => openChat(chat)}
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--color-border)', 
                    cursor: 'pointer',
                    background: activeChat?.user.id === chat.user.id ? 'var(--color-bg-card)' : 'transparent',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    transition: 'background 0.2s'
                  }}
                >
                  <img src={chat.user.avatar_url || '/images/avatar_maker.png'} alt={chat.user.username} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: chat.unread ? 700 : 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {chat.user.full_name || chat.user.username || 'Anonymous'}
                      </span>
                    </div>
                    {chat.lastMessage && (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: chat.unread ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontWeight: chat.unread ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {chat.lastMessage.sender_id === currentUser.id ? 'You: ' : ''}{chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {chat.unread && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-accent)' }} />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Chat Area */}
        <div style={{ flex: 1, display: !activeChat && window.innerWidth <= 768 ? 'none' : 'flex', flexDirection: 'column', background: 'var(--color-bg-card)', position: 'relative' }}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="mobile-only" 
                  onClick={() => setActiveChat(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', padding: '0.5rem', display: window.innerWidth > 768 ? 'none' : 'block' }}
                >
                  <ArrowLeft size={20} />
                </button>
                <img src={activeChat.user.avatar_url || '/images/avatar_maker.png'} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{activeChat.user.full_name || activeChat.user.username || 'Anonymous'}</h3>
                  {(activeChat.user.store_name || activeChat.user.full_name) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Store size={12} /> {activeChat.user.store_name?.trim() || `${activeChat.user.full_name || activeChat.user.username}'s Shop`}
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fafafa' }}>
                {messages.map(msg => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isMine ? 'var(--color-pine-primary)' : 'white',
                        color: isMine ? 'white' : 'var(--color-text-main)',
                        boxShadow: 'var(--shadow-sm)',
                        border: isMine ? 'none' : '1px solid var(--color-border)'
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', background: 'white' }}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg-base)', fontFamily: 'inherit' }}
                />
                <button type="submit" disabled={!newMessage.trim()} style={{ borderRadius: '50%', width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: newMessage.trim() ? 'var(--color-accent)' : 'var(--color-border)', color: 'white', border: 'none' }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
