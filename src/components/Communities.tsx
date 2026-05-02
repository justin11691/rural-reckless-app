import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, TrendingUp, Plus, X, Lock, Settings, UserCheck, UserX, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['General','Woodworking','3D Printing','Arts & Crafts','Homesteading','Reading Club','Farming','Music','Writing','Recipes & Cooking','Sewing & Patterns','Livestock & Pets','Other'];
const ICONS: Record<string,string> = { 'Woodworking':'🪵','3D Printing':'🧊','Arts & Crafts':'🎨','Homesteading':'🌱','Reading Club':'📖','Farming':'🌾','Music':'🎸','Writing':'✍️','General':'🏡','Recipes & Cooking':'🍳','Sewing & Patterns':'🧵','Livestock & Pets':'🐄','Other':'🤠' };

function fmt(n:number) { return n>=1000?`${(n/1000).toFixed(1)}k`:String(n); }

// ── Manage Panel (admin view) ────────────────────────────────────────────────
function ManagePanel({ group, currentUserId, onClose }: { group:any; currentUserId:string; onClose:()=>void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from('group_members')
      .select('*, profiles:user_id(username, full_name, avatar_url)')
      .eq('group_id', group.id);
    if (data) {
      setMembers(data.filter((m:any) => m.status === 'active'));
      setPending(data.filter((m:any) => m.status === 'pending'));
    }
  }

  async function approve(memberId: string) {
    await supabase.from('group_members').update({ status:'active' }).eq('id', memberId);
    loadMembers();
  }
  async function deny(memberId: string) {
    await supabase.from('group_members').delete().eq('id', memberId);
    loadMembers();
  }
  async function remove(memberId: string) {
    await supabase.from('group_members').delete().eq('id', memberId);
    loadMembers();
  }

  async function invite() {
    if (!inviteUsername.trim()) return;
    setInviting(true); setMsg('');
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', inviteUsername.trim())
      .single();
    if (!profile) { setMsg('User not found. Check the username.'); setInviting(false); return; }
    const { error } = await supabase.from('group_members').insert([{
      group_id: group.id, user_id: profile.id,
      role: 'member', status: 'invited', invited_by: currentUserId
    }]);
    if (error) setMsg(error.code === '23505' ? 'That user is already in this group.' : error.message);
    else { setMsg(`✅ Invite sent to @${inviteUsername}.`); setInviteUsername(''); loadMembers(); }
    setInviting(false);
  }

  const S = { label:{ fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.05em', color:'var(--color-text-muted)', marginBottom:'0.5rem', display:'block' } };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Manage group">
      <div className="card" style={{ width:'100%', maxWidth:'480px', maxHeight:'90vh', overflowY:'auto', background:'var(--color-bg-card)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ margin:0 }}>Manage — {group.name}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)' }} aria-label="Close"><X size={22}/></button>
        </div>

        {/* Invite */}
        <section style={{ marginBottom:'1.5rem' }}>
          <span style={S.label}><Mail size={12} style={{ verticalAlign:'middle', marginRight:'0.3rem' }}/>Invite by Username</span>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <input type="text" className="post-input" value={inviteUsername} onChange={e=>setInviteUsername(e.target.value)}
              placeholder="@username" style={{ flex:1, margin:0 }} aria-label="Username to invite"
              onKeyDown={e=>{ if(e.key==='Enter') invite(); }} />
            <button onClick={invite} disabled={!inviteUsername.trim()||inviting} style={{ whiteSpace:'nowrap', padding:'0.5rem 1rem' }}>
              {inviting?'Sending…':'Send Invite'}
            </button>
          </div>
          {msg && <p style={{ marginTop:'0.5rem', fontSize:'0.875rem', color: msg.startsWith('✅')?'var(--color-pine-primary)':'var(--color-accent)' }}>{msg}</p>}
        </section>

        {/* Pending requests */}
        {pending.length > 0 && (
          <section style={{ marginBottom:'1.5rem' }}>
            <span style={S.label}>Join Requests ({pending.length})</span>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {pending.map((m:any) => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem', background:'var(--color-bg-base)', borderRadius:'var(--radius-md)', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:500 }}>{m.profiles?.full_name || m.profiles?.username || 'Unknown'}</span>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button onClick={()=>approve(m.id)} style={{ background:'var(--color-pine-primary)', color:'white', padding:'0.35rem 0.75rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.3rem' }} aria-label="Approve request">
                      <UserCheck size={14}/> Approve
                    </button>
                    <button onClick={()=>deny(m.id)} style={{ background:'var(--color-accent)', color:'white', padding:'0.35rem 0.75rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.3rem' }} aria-label="Deny request">
                      <UserX size={14}/> Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active members */}
        <section>
          <span style={S.label}>Members ({members.length})</span>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {members.map((m:any) => (
              <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem', background:'var(--color-bg-base)', borderRadius:'var(--radius-md)', gap:'0.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <img src={m.profiles?.avatar_url||'/images/avatar_maker.png'} alt="" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} aria-hidden />
                  <div>
                    <p style={{ margin:0, fontWeight:500, fontSize:'0.9rem' }}>{m.profiles?.full_name||m.profiles?.username||'Member'}</p>
                    <p style={{ margin:0, fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{m.role==='admin'?'Admin':'Member'}</p>
                  </div>
                </div>
                {m.user_id !== currentUserId && (
                  <button onClick={()=>remove(m.id)} style={{ background:'transparent', border:'1px solid var(--color-border)', color:'var(--color-text-muted)', padding:'0.3rem 0.65rem', fontSize:'0.8rem' }} aria-label={`Remove member`}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            {members.length===0 && <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>No active members yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group, currentUserId, membership, onAction }: { group:any; currentUserId:string|null; membership:any; onAction:()=>void }) {
  const [managing, setManaging] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const isOwner = group.owner_id === currentUserId;
  const status = membership?.status;

  async function joinOrRequest() {
    if (!currentUserId) { alert('Sign in to join groups.'); return; }
    setBusy(true);
    const newStatus = group.is_public ? 'active' : 'pending';
    await supabase.from('group_members').upsert([{ group_id:group.id, user_id:currentUserId, role:'member', status:newStatus }], { onConflict:'group_id,user_id' });
    onAction(); setBusy(false);
  }

  async function leave() {
    if (!currentUserId) return;
    setBusy(true);
    await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', currentUserId);
    onAction(); setBusy(false);
  }

  async function acceptInvite() {
    if (!currentUserId) return;
    setBusy(true);
    await supabase.from('group_members').update({ status:'active' }).eq('group_id', group.id).eq('user_id', currentUserId);
    onAction(); setBusy(false);
  }

  let actionBtn = null;
  if (group.owner_id === 'featured') {
    actionBtn = <button style={{ padding:'0.4rem 1rem', fontSize:'0.875rem' }}>Join</button>;
  } else if (status === 'invited') {
    actionBtn = <button onClick={acceptInvite} disabled={busy} style={{ padding:'0.4rem 1rem', fontSize:'0.875rem', background:'var(--color-accent)', color:'white', border:'none' }}>Accept Invite</button>;
  } else if (status === 'pending') {
    actionBtn = <button disabled style={{ padding:'0.4rem 1rem', fontSize:'0.875rem', opacity:0.6 }}>Requested</button>;
  } else if (status === 'active') {
    actionBtn = <button onClick={leave} disabled={busy} style={{ padding:'0.4rem 1rem', fontSize:'0.875rem', background:'transparent', color:'var(--color-text-muted)', border:'1px solid var(--color-border)' }}>Leave</button>;
  } else {
    actionBtn = (
      <button onClick={joinOrRequest} disabled={busy} style={{ padding:'0.4rem 1rem', fontSize:'0.875rem' }} aria-label={group.is_public?'Join group':'Request to join'}>
        {group.is_public ? 'Join' : 'Request to Join'}
      </button>
    );
  }

  return (
    <>
      <div className="card" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem' }}>
          <div style={{ width:48, height:48, background:'var(--color-bg-base)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }} aria-hidden>
            {group.icon || ICONS[group.category] || '🏡'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap' }}>
              <h3 style={{ margin:0, fontSize:'1.05rem', color:'var(--color-pine-dark)' }}>{group.name}</h3>
              {!group.is_public && <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', fontSize:'0.72rem', background:'var(--color-bg-base)', padding:'0.15rem 0.4rem', borderRadius:4, color:'var(--color-text-muted)', border:'1px solid var(--color-border)' }}><Lock size={10}/> Private</span>}
            </div>
            <p style={{ margin:'0.2rem 0 0', color:'var(--color-text-muted)', fontSize:'0.82rem' }}>{group.category} · {fmt(group.member_count||1)} members</p>
          </div>
        </div>
        <p style={{ margin:0, color:'var(--color-text-main)', lineHeight:1.5, fontSize:'0.9rem' }}>{group.description||'No description yet.'}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'0.75rem', borderTop:'1px solid var(--color-border)', flexWrap:'wrap', gap:'0.5rem' }}>
          {group.active > 0
            ? <span style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:'var(--color-pine-primary)', fontSize:'0.85rem' }}><TrendingUp size={14}/> {group.active} online</span>
            : <span style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Just getting started</span>
          }
          <div style={{ display:'flex', gap:'0.5rem' }}>
            {isOwner && (
              <button onClick={()=>setManaging(true)} style={{ padding:'0.4rem 0.6rem', background:'var(--color-bg-base)', color:'var(--color-text-muted)', border:'1px solid var(--color-border)', fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'0.3rem' }} aria-label="Manage group">
                <Settings size={14}/> Manage
              </button>
            )}
            {actionBtn}
            <button
              onClick={()=>navigate(`/communities/${group.id}`)}
              style={{ padding:'0.4rem 0.9rem', fontSize:'0.875rem', background:'var(--color-pine-primary)', color:'white', border:'none' }}
              aria-label={`View ${group.name}`}
            >
              View →
            </button>
          </div>
        </div>
      </div>
      {managing && <ManagePanel group={group} currentUserId={currentUserId!} onClose={()=>setManaging(false)} />}
    </>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function Communities() {
  const [groups, setGroups] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', category:'General', is_public:true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => setCurrentUser(session?.user??null));
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setLoading(true);
    const { data } = await supabase.from('communities').select('*').order('created_at', { ascending:false });
    setGroups(data||[]);
    if ((await supabase.auth.getSession()).data.session) {
      const uid = (await supabase.auth.getSession()).data.session!.user.id;
      const { data: mem } = await supabase.from('group_members').select('*').eq('user_id', uid);
      setMemberships(mem||[]);
    }
    setLoading(false);
  }

  async function createGroup() {
    if (!form.name.trim()||!currentUser) return;
    setCreating(true);
    const { error } = await supabase.from('communities').insert([{ owner_id:currentUser.id, name:form.name.trim(), description:form.description.trim(), category:form.category, is_public:form.is_public }]);
    if (!error) { setShowCreate(false); setForm({ name:'', description:'', category:'General', is_public:true }); fetchGroups(); }
    else alert('Could not create group: '+error.message);
    setCreating(false);
  }

  const getMembership = (groupId:string) => memberships.find((m:any)=>m.group_id===groupId);

  const filtered = groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.category||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex:1, padding:'2rem', display:'flex', flexDirection:'column', gap:'2rem', overflowX:'hidden' }}>
      {/* Hero */}
      <div className="card" style={{ padding:'2rem', background:'var(--color-pine-dark)', color:'white' }}>
        <h1 style={{ display:'flex', alignItems:'center', gap:'1rem', margin:0, fontSize:'2rem' }}><Users size={32}/> Communities Hub</h1>
        <p style={{ marginTop:'0.5rem', opacity:0.85, fontSize:'1.05rem' }}>Find your people. Join public groups or request access to private ones. Start your own club — no permission needed.</p>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
        <div className="nav-search" style={{ flex:1, minWidth:180, maxWidth:440, background:'var(--color-bg-base)' }}>
          <Search className="search-icon" size={18}/>
          <input type="text" placeholder="Search groups..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search communities"/>
        </div>
        {currentUser && (
          <button onClick={()=>setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', whiteSpace:'nowrap' }} aria-label="Create a group">
            <Plus size={18}/> Create Group
          </button>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:'1rem' }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowCreate(false); }} role="dialog" aria-modal="true">
          <div className="card" style={{ width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', background:'var(--color-bg-card)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ margin:0 }}>Start a Group</h2>
              <button onClick={()=>setShowCreate(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)' }}><X size={22}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label htmlFor="g-name" style={{ fontWeight:600, display:'block', marginBottom:'0.35rem', fontSize:'0.9rem' }}>Group Name *</label>
                <input id="g-name" type="text" className="post-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Backyard Beekeepers" style={{ width:'100%', margin:0 }} maxLength={60}/>
              </div>
              <div>
                <label htmlFor="g-desc" style={{ fontWeight:600, display:'block', marginBottom:'0.35rem', fontSize:'0.9rem' }}>Description</label>
                <textarea id="g-desc" className="post-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What is this group about?" rows={3} style={{ width:'100%', margin:0, resize:'vertical' }} maxLength={300}/>
              </div>
              <div>
                <label htmlFor="g-cat" style={{ fontWeight:600, display:'block', marginBottom:'0.35rem', fontSize:'0.9rem' }}>Category</label>
                <select id="g-cat" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{ width:'100%', padding:'0.6rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)', fontFamily:'inherit', fontSize:'1rem', background:'#fcfcfc' }}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                {[{val:true,label:'🌐 Public',desc:'Anyone can join'},{val:false,label:'🔒 Private',desc:'Approval required'}].map(({val,label,desc})=>(
                  <button key={String(val)} type="button" onClick={()=>setForm({...form,is_public:val})}
                    style={{ flex:1, padding:'0.75rem', background:form.is_public===val?'var(--color-pine-primary)':'var(--color-bg-base)', color:form.is_public===val?'white':'var(--color-text-muted)', border:`1px solid ${form.is_public===val?'var(--color-pine-primary)':'var(--color-border)'}`, borderRadius:'var(--radius-md)', cursor:'pointer', transition:'all 0.2s', textAlign:'center' }}
                    aria-pressed={form.is_public===val}>
                    <div style={{ fontWeight:600 }}>{label}</div>
                    <div style={{ fontSize:'0.78rem', marginTop:'0.2rem', opacity:0.8 }}>{desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={createGroup} disabled={!form.name.trim()||creating} style={{ width:'100%', padding:'0.85rem', fontSize:'1rem' }}>
                {creating?'Creating…':`Start "${form.name||'Group'}"`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meetups Board */}
      <div className="card" style={{ padding:'1.25rem 1.75rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🤝 Upcoming Community Meetups & Workshops</h3>
        <p style={{ marginTop: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Connect offline for local plant swaps, farmers market gatherings, or hands-on classes.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ flex: 1, minWidth: '220px', background: '#fbf7f0', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #efe4d3' }}>
            <span style={{ fontSize: '0.72rem', background: 'var(--color-pine-primary)', color: 'white', padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 700 }}>May 18</span>
            <h5 style={{ margin: '0.35rem 0 0.1rem', color: 'var(--color-pine-dark)', fontSize: '0.9rem' }}>Spring Seedling & Plant Swap</h5>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Blue Ridge Community Center · 10:00 AM</p>
          </div>
          <div style={{ flex: 1, minWidth: '220px', background: '#fbf7f0', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #efe4d3' }}>
            <span style={{ fontSize: '0.72rem', background: 'var(--color-pine-primary)', color: 'white', padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 700 }}>Jun 05</span>
            <h5 style={{ margin: '0.35rem 0 0.1rem', color: 'var(--color-pine-dark)', fontSize: '0.9rem' }}>Handmade Soapmaking Class</h5>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Artisan Collective Studio · 2:30 PM</p>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <p style={{ color:'var(--color-text-muted)' }}>Loading groups…</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'2.5rem 1rem', color:'var(--color-text-muted)' }}>
          <p style={{ fontSize:'1.05rem', marginBottom:'0.5rem', color:'var(--color-pine-dark)' }}>No groups found.</p>
          <p>Try a different search, or start one yourself.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.25rem' }}>
          {filtered.map(g=>(
            <GroupCard key={g.id} group={g} currentUserId={currentUser?.id??null} membership={getMembership(g.id)} onAction={fetchGroups}/>
          ))}
        </div>
      )}
    </div>
  );
}
