import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, ArrowLeft, Lock, Send, Trash2, TrendingUp,
  Settings, UserCheck, UserX, Mail, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ICONS: Record<string,string> = {
  'Woodworking':'🪵','3D Printing':'🧊','Arts & Crafts':'🎨','Homesteading':'🌱',
  'Reading Club':'📖','Farming':'🌾','Music':'🎸','Writing':'✍️','General':'🏡',
  'Recipes & Cooking':'🍳','Sewing & Patterns':'🧵','Livestock & Pets':'🐄','Other':'🤠'
};

function fmt(n:number) { return n>=1000?`${(n/1000).toFixed(1)}k`:String(n); }
function timeAgo(ts:string) {
  const d=Math.floor((Date.now()-new Date(ts).getTime())/1000);
  if(d<60) return 'just now';
  if(d<3600) return `${Math.floor(d/60)}m ago`;
  if(d<86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

// ── Manage Panel ──────────────────────────────────────────────────────────────
function ManagePanel({ group, currentUserId, onClose, onRefresh }: {
  group:any; currentUserId:string; onClose:()=>void; onRefresh:()=>void;
}) {
  const [members, setMembers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const { data } = await supabase
      .from('group_members')
      .select('id, group_id, user_id, role, status')
      .eq('group_id', group.id);
    if (data) {
      // Fetch profiles separately
      const uids = [...new Set(data.map((m:any)=>m.user_id))];
      let profileMap: Record<string,any> = {};
      if (uids.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', uids);
        (profs||[]).forEach((p:any)=>{ profileMap[p.id]=p; });
      }
      const withProfiles = data.map((m:any)=>({ ...m, profiles: profileMap[m.user_id]||null }));
      setMembers(withProfiles.filter((m:any) => m.status === 'active'));
      setPending(withProfiles.filter((m:any) => m.status === 'pending'));
    }
  }

  async function approve(id:string) { await supabase.from('group_members').update({status:'active'}).eq('id',id); loadMembers(); onRefresh(); }
  async function deny(id:string)    { await supabase.from('group_members').delete().eq('id',id); loadMembers(); onRefresh(); }
  async function remove(id:string)  { await supabase.from('group_members').delete().eq('id',id); loadMembers(); onRefresh(); }

  async function invite() {
    if (!inviteUsername.trim()) return;
    setInviting(true); setMsg('');
    const { data: prof } = await supabase.from('profiles').select('id').eq('username', inviteUsername.trim()).single();
    if (!prof) { setMsg('User not found.'); setInviting(false); return; }
    const { error } = await supabase.from('group_members').insert([{
      group_id:group.id, user_id:prof.id, role:'member', status:'invited', invited_by:currentUserId
    }]);
    if (error) setMsg(error.code==='23505'?'Already a member.':error.message);
    else { setMsg(`✅ Invite sent to @${inviteUsername}`); setInviteUsername(''); loadMembers(); }
    setInviting(false);
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:400,padding:'1rem'}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}} role="dialog" aria-modal="true" aria-label="Manage group">
      <div className="card" style={{width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',background:'var(--color-bg-card)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h2 style={{margin:0}}>Manage — {group.name}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)'}} aria-label="Close"><X size={22}/></button>
        </div>

        {/* Invite */}
        <section style={{marginBottom:'1.5rem'}}>
          <span style={{fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--color-text-muted)',marginBottom:'0.5rem',display:'block'}}>
            <Mail size={12} style={{verticalAlign:'middle',marginRight:'0.3rem'}}/>Invite by Username
          </span>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <input type="text" className="post-input" value={inviteUsername} onChange={e=>setInviteUsername(e.target.value)}
              placeholder="@username" style={{flex:1,margin:0}} onKeyDown={e=>{if(e.key==='Enter')invite();}}/>
            <button onClick={invite} disabled={!inviteUsername.trim()||inviting} style={{whiteSpace:'nowrap',padding:'0.5rem 1rem'}}>
              {inviting?'Sending…':'Send Invite'}
            </button>
          </div>
          {msg && <p style={{marginTop:'0.5rem',fontSize:'0.875rem',color:msg.startsWith('✅')?'var(--color-pine-primary)':'var(--color-accent)'}}>{msg}</p>}
        </section>

        {/* Pending */}
        {pending.length > 0 && (
          <section style={{marginBottom:'1.5rem'}}>
            <span style={{fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--color-text-muted)',marginBottom:'0.5rem',display:'block'}}>
              Join Requests ({pending.length})
            </span>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {pending.map((m:any)=>(
                <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem',background:'var(--color-bg-base)',borderRadius:'var(--radius-md)',gap:'0.5rem',flexWrap:'wrap'}}>
                  <span style={{fontWeight:500}}>{m.profiles?.full_name||m.profiles?.username||'Unknown'}</span>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button onClick={()=>approve(m.id)} style={{background:'var(--color-pine-primary)',color:'white',padding:'0.35rem 0.75rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                      <UserCheck size={14}/> Approve
                    </button>
                    <button onClick={()=>deny(m.id)} style={{background:'var(--color-accent)',color:'white',padding:'0.35rem 0.75rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                      <UserX size={14}/> Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Members */}
        <section>
          <span style={{fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--color-text-muted)',marginBottom:'0.5rem',display:'block'}}>
            Members ({members.length})
          </span>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {members.map((m:any)=>(
              <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem',background:'var(--color-bg-base)',borderRadius:'var(--radius-md)',gap:'0.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                  <img src={m.profiles?.avatar_url||'/images/avatar_maker.png'} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}} aria-hidden/>
                  <div>
                    <p style={{margin:0,fontWeight:500,fontSize:'0.9rem'}}>{m.profiles?.full_name||m.profiles?.username||'Member'}</p>
                    <p style={{margin:0,fontSize:'0.75rem',color:'var(--color-text-muted)'}}>{m.role==='admin'?'Admin':'Member'}</p>
                  </div>
                </div>
                {m.user_id!==currentUserId && (
                  <button onClick={()=>remove(m.id)} style={{background:'transparent',border:'1px solid var(--color-border)',color:'var(--color-text-muted)',padding:'0.3rem 0.65rem',fontSize:'0.8rem'}}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            {members.length===0 && <p style={{color:'var(--color-text-muted)',fontSize:'0.875rem'}}>No active members yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Group Post Card ───────────────────────────────────────────────────────────
function GroupPostCard({ post, currentUserId, onDelete }: { post:any; currentUserId:string|null; onDelete:(id:string)=>void }) {
  const canDelete = post.user_id === currentUserId;
  return (
    <div className="card" style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
        <img
          src={post.profile?.avatar_url||'/images/avatar_maker.png'}
          alt={post.profile?.full_name||'Member'}
          style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',flexShrink:0}}
        />
        <div style={{flex:1}}>
          <p style={{margin:0,fontWeight:600,fontSize:'0.95rem',color:'var(--color-pine-dark)'}}>
            {post.profile?.full_name||post.profile?.username||'A member'}
          </p>
          <p style={{margin:0,fontSize:'0.78rem',color:'var(--color-text-muted)'}}>{timeAgo(post.created_at)}</p>
        </div>
        {canDelete && (
          <button onClick={()=>onDelete(post.id)}
            style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:'0.25rem'}}
            aria-label="Delete post">
            <Trash2 size={16}/>
          </button>
        )}
      </div>
      <p style={{margin:0,lineHeight:1.6,color:'var(--color-text-main)',whiteSpace:'pre-wrap'}}>{post.content}</p>
      {post.image_url && (
        <img src={post.image_url} alt="Post attachment" style={{width:'100%',borderRadius:'var(--radius-md)',maxHeight:320,objectFit:'cover'}}/>
      )}
    </div>
  );
}

// ── Main Group Page ───────────────────────────────────────────────────────────
export function GroupPage() {
  const { id } = useParams<{id:string}>();
  const navigate = useNavigate();

  const [group, setGroup]             = useState<any>(null);
  const [posts, setPosts]             = useState<any[]>([]);
  const [members, setMembers]         = useState<any[]>([]);
  const [membership, setMembership]   = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [postText, setPostText]       = useState('');
  const [posting, setPosting]         = useState(false);
  const [managing, setManaging]       = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => {
      setCurrentUser(session?.user??null);
      loadAll(session?.user?.id ?? null);
    });
  }, [id]);

  async function loadAll(uid:string|null) {
    setLoading(true);
    // Load group
    const { data: g } = await supabase.from('communities').select('*').eq('id', id).single();
    setGroup(g);

    // Load posts for this group — gracefully handle missing group_id column
    const { data: rawPosts, error: postsErr } = await supabase
      .from('posts')
      .select('id, user_id, content, image_url, created_at, group_id')
      .eq('group_id', id)
      .order('created_at', { ascending: false });

    if (!postsErr && rawPosts && rawPosts.length > 0) {
      const userIds = [...new Set(rawPosts.map((p:any) => p.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id,full_name,username,avatar_url').in('id', userIds);
      const profileMap: Record<string,any> = {};
      (profiles||[]).forEach((p:any)=>{ profileMap[p.id]=p; });
      setPosts(rawPosts.map((p:any)=>({ ...p, profile:profileMap[p.user_id]||null })));
    } else {
      setPosts([]);
    }

    // Load members (preview — top 10 active) using separate profile fetch
    const { data: rawMem } = await supabase
      .from('group_members')
      .select('id, user_id, role, status')
      .eq('group_id', id)
      .eq('status', 'active')
      .limit(10);
    
    if (rawMem && rawMem.length > 0) {
      const memUids = [...new Set(rawMem.map((m:any)=>m.user_id))];
      const { data: memProfs } = await supabase.from('profiles').select('id,full_name,username,avatar_url').in('id', memUids);
      const memProfMap: Record<string,any> = {};
      (memProfs||[]).forEach((p:any)=>{ memProfMap[p.id]=p; });
      setMembers(rawMem.map((m:any)=>({ ...m, profiles: memProfMap[m.user_id]||null })));
    } else {
      setMembers([]);
    }

    // Membership status for current user
    if (uid) {
      const { data: myMem } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', id)
        .eq('user_id', uid)
        .single();
      setMembership(myMem||null);
    }

    setLoading(false);
  }

  async function joinOrRequest() {
    if (!currentUser) { alert('Sign in to join groups.'); return; }
    const newStatus = group.is_public ? 'active' : 'pending';
    await supabase.from('group_members').upsert([{
      group_id: id, user_id: currentUser.id, role:'member', status:newStatus
    }], { onConflict:'group_id,user_id' });
    loadAll(currentUser.id);
  }

  async function leave() {
    if (!currentUser) return;
    await supabase.from('group_members').delete().eq('group_id', id).eq('user_id', currentUser.id);
    setMembership(null);
    loadAll(currentUser.id);
  }

  async function acceptInvite() {
    if (!currentUser) return;
    await supabase.from('group_members').update({status:'active'}).eq('group_id', id).eq('user_id', currentUser.id);
    loadAll(currentUser.id);
  }

  async function submitPost() {
    if (!postText.trim()||!currentUser) return;
    setPosting(true);
    await supabase.from('posts').insert([{
      user_id: currentUser.id,
      content: postText.trim(),
      group_id: id,
    }]);
    setPostText('');
    loadAll(currentUser.id);
    setPosting(false);
  }

  async function deletePost(postId:string) {
    if (!confirm('Delete this post?')) return;
    await supabase.from('posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p=>p.id!==postId));
  }

  if (loading) {
    return (
      <div style={{flex:1,padding:'2rem',color:'var(--color-text-muted)'}}>Loading group…</div>
    );
  }

  if (!group) {
    return (
      <div style={{flex:1,padding:'2rem'}}>
        <p>Group not found.</p>
        <button onClick={()=>navigate('/communities')}>← Back to Communities</button>
      </div>
    );
  }

  const isOwner = group.owner_id === currentUser?.id;
  const isMember = membership?.status === 'active';
  const isPending = membership?.status === 'pending';
  const isInvited = membership?.status === 'invited';
  const canPost = isMember || isOwner;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',gap:'1.5rem',padding:'2rem',overflowX:'hidden',maxWidth:860,margin:'0 auto',width:'100%'}}>

      {/* Back */}
      <button
        onClick={()=>navigate('/communities')}
        style={{alignSelf:'flex-start',display:'flex',alignItems:'center',gap:'0.4rem',background:'transparent',border:'none',cursor:'pointer',color:'var(--color-text-muted)',fontWeight:500,padding:'0.25rem 0',fontSize:'0.9rem'}}
        aria-label="Back to Communities"
      >
        <ArrowLeft size={16}/> Communities Hub
      </button>

      {/* Group Header */}
      <div className="card" style={{padding:'2rem',background:'var(--color-pine-dark)',color:'white'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <div style={{width:56,height:56,background:'rgba(255,255,255,0.1)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',flexShrink:0}}>
              {group.icon||ICONS[group.category]||'🏡'}
            </div>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                <h1 style={{margin:0,fontSize:'1.6rem',color:'white'}}>{group.name}</h1>
                {!group.is_public && (
                  <span style={{display:'flex',alignItems:'center',gap:'0.2rem',fontSize:'0.72rem',background:'rgba(255,255,255,0.15)',padding:'0.15rem 0.5rem',borderRadius:4,color:'rgba(255,255,255,0.8)'}}>
                    <Lock size={10}/> Private
                  </span>
                )}
              </div>
              <p style={{margin:'0.25rem 0 0',opacity:0.8,fontSize:'0.9rem'}}>{group.category} · {fmt(members.length)} members</p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexShrink:0}}>
            {isOwner && (
              <button onClick={()=>setManaging(true)}
                style={{display:'flex',alignItems:'center',gap:'0.4rem',background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',color:'white',padding:'0.5rem 0.9rem',fontSize:'0.875rem'}}
                aria-label="Manage group">
                <Settings size={15}/> Manage
              </button>
            )}
            {isInvited && (
              <button onClick={acceptInvite}
                style={{background:'var(--color-accent)',border:'none',color:'white',padding:'0.5rem 1rem',fontSize:'0.875rem'}}>
                Accept Invite
              </button>
            )}
            {isPending && (
              <button disabled style={{background:'rgba(255,255,255,0.15)',border:'none',color:'rgba(255,255,255,0.7)',padding:'0.5rem 1rem',fontSize:'0.875rem',cursor:'not-allowed'}}>
                Request Pending
              </button>
            )}
            {!isOwner && !isMember && !isPending && !isInvited && (
              <button onClick={joinOrRequest}
                style={{background:'white',color:'var(--color-pine-dark)',border:'none',padding:'0.5rem 1.1rem',fontSize:'0.875rem',fontWeight:600}}>
                {group.is_public ? 'Join Group' : 'Request to Join'}
              </button>
            )}
            {isMember && !isOwner && (
              <button onClick={leave}
                style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',color:'white',padding:'0.5rem 0.9rem',fontSize:'0.875rem'}}>
                Leave
              </button>
            )}
          </div>
        </div>

        {group.description && (
          <p style={{margin:'1.25rem 0 0',opacity:0.85,lineHeight:1.6,fontSize:'0.95rem'}}>{group.description}</p>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:'1.5rem',alignItems:'start'}} className="group-layout">

        {/* Feed column */}
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          {/* Post Composer — members only */}
          {canPost ? (
            <div className="card" style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <p style={{margin:0,fontWeight:600,color:'var(--color-pine-dark)',fontSize:'0.95rem'}}>Share something with the group</p>
              <textarea
                className="post-input"
                rows={3}
                value={postText}
                onChange={e=>setPostText(e.target.value)}
                placeholder="What's on your mind?"
                style={{width:'100%',margin:0,resize:'vertical'}}
                aria-label="Write a group post"
              />
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button
                  onClick={submitPost}
                  disabled={!postText.trim()||posting}
                  style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 1.1rem'}}
                >
                  <Send size={15}/>{posting?'Posting…':'Post'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{padding:'1rem',textAlign:'center',color:'var(--color-text-muted)',fontSize:'0.9rem'}}>
              {isPending
                ? '⏳ Your join request is pending approval. Once accepted, you can post here.'
                : !group.is_public
                  ? '🔒 This is a private group. Request to join to see posts and participate.'
                  : '👋 Join this group to post and participate!'}
            </div>
          )}

          {/* Posts */}
          {(isMember || isOwner || group.is_public) ? (
            posts.length > 0 ? (
              posts.map(p=>(
                <GroupPostCard key={p.id} post={p} currentUserId={currentUser?.id??null} onDelete={deletePost}/>
              ))
            ) : (
              <div className="card" style={{textAlign:'center',padding:'2.5rem 1rem',color:'var(--color-text-muted)'}}>
                <p style={{fontSize:'1.05rem',marginBottom:'0.5rem',color:'var(--color-pine-dark)'}}>No posts yet!</p>
                <p>{canPost ? 'Be the first to share something with the group.' : 'Join the group to see posts.'}</p>
              </div>
            )
          ) : (
            <div className="card" style={{textAlign:'center',padding:'2rem',color:'var(--color-text-muted)'}}>
              <Lock size={24} style={{marginBottom:'0.75rem',color:'var(--color-pine-primary)'}}/><br/>
              Posts in this private group are only visible to members.
            </div>
          )}
        </div>

        {/* Members sidebar */}
        <aside>
          <div className="card">
            <h3 style={{margin:'0 0 1rem',display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'1rem',color:'var(--color-pine-dark)'}}>
              <Users size={16}/> Members
            </h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.65rem'}}>
              {members.map((m:any)=>(
                <div key={m.id} style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
                  <img src={m.profiles?.avatar_url||'/images/avatar_maker.png'} alt=""
                    style={{width:34,height:34,borderRadius:'50%',objectFit:'cover',flexShrink:0}} aria-hidden/>
                  <div style={{overflow:'hidden'}}>
                    <p style={{margin:0,fontWeight:500,fontSize:'0.88rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {m.profiles?.full_name||m.profiles?.username||'Member'}
                    </p>
                    {(m.role==='admin'||group.owner_id===m.user_id) && (
                      <p style={{margin:0,fontSize:'0.73rem',color:'var(--color-pine-primary)',fontWeight:600}}>Admin</p>
                    )}
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p style={{color:'var(--color-text-muted)',fontSize:'0.875rem'}}>No members yet.</p>
              )}
            </div>
            {members.length >= 10 && (
              <p style={{marginTop:'0.75rem',fontSize:'0.8rem',color:'var(--color-text-muted)',textAlign:'center'}}>
                <TrendingUp size={12} style={{verticalAlign:'middle',marginRight:'0.25rem'}}/> And more…
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Manage Panel modal */}
      {managing && currentUser && (
        <ManagePanel
          group={group}
          currentUserId={currentUser.id}
          onClose={()=>setManaging(false)}
          onRefresh={()=>loadAll(currentUser.id)}
        />
      )}
    </div>
  );
}
