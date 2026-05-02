import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, PenLine, Plus, Trash2, X, Sparkles, ChevronRight, Save } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface BookData {
  chapters: Chapter[];
  ai_upgrade_enabled: boolean;
}

export function BookStudio({ userId, onPublished }: { userId: string; onPublished: () => void }) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  // Modal Creator States
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('E-Book');
  const [newPrice, setNewPrice] = useState('Free');
  const [newCover, setNewCover] = useState('');
  const [newPaymentUrl, setNewPaymentUrl] = useState('');
  const [newCryptoUrl, setNewCryptoUrl] = useState('');

  // Fetch only authored e-books
  async function fetchMyBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('digital_products')
      .select('*')
      .eq('owner_id', userId);

    if (!error && data) {
      // Filter items that are either E-books or explicitly our special format
      const myBooks = data.filter((item: any) =>
        item.category === 'E-Book' ||
        item.category === 'Short Story / Poetry' ||
        item.file_url?.startsWith('BOOK_JSON:')
      );
      setBooks(myBooks);
    }
    setLoading(false);
  }

  // Effect to load data
  useEffect(() => {
    fetchMyBooks();
  }, []);

  async function createBook() {
    if (!newTitle.trim() || !newPrice.trim()) return;
    setLoading(true);

    const initialBookData: BookData = {
      chapters: [
        { id: 'ch1', title: 'Chapter 1: Beginnings', content: 'Write your story here...' }
      ],
      ai_upgrade_enabled: false
    };

    const fileUrl = 'BOOK_JSON:' + JSON.stringify(initialBookData);

    const { data, error } = await supabase.from('digital_products').insert([{
      owner_id: userId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      price_display: newPrice.trim(),
      payment_url: newPaymentUrl.trim() || null,
      crypto_url: newCryptoUrl.trim() || null,
      cover_image_url: newCover.trim() || null,
      file_url: fileUrl
    }]).select();

    if (!error && data && data.length > 0) {
      setNewTitle('');
      setNewDesc('');
      setNewPrice('Free');
      setNewCover('');
      setNewPaymentUrl('');
      setNewCryptoUrl('');
      setShowCreator(false);
      setEditingBook(data[0]);
      fetchMyBooks();
      onPublished();
    } else if (error) {
      alert('Error creating book: ' + error.message);
    }
    setLoading(false);
  }

  if (editingBook) {
    return (
      <EditorInterface
        book={editingBook}
        onClose={() => { setEditingBook(null); fetchMyBooks(); onPublished(); }}
      />
    );
  }

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.4rem' }}>My Book Studio</h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Self-publish and write books or short stories with distraction-free tools.</p>
        </div>
        <button onClick={() => setShowCreator(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> New Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--color-pine-dark)' }} />
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-pine-dark)' }}>No e-books created yet.</p>
          <p style={{ margin: '0.25rem 0 1.25rem', fontSize: '0.875rem' }}>Draft your next novel, collection, or short story right here.</p>
          <button onClick={() => setShowCreator(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Get Started Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {books.map(b => {
            const hasDraft = b.file_url?.startsWith('BOOK_JSON:');
            return (
              <div key={b.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                      {b.category}
                    </span>
                    <span style={{ fontWeight: 700, color: b.price_display?.toLowerCase() === 'free' ? 'var(--color-pine-primary)' : 'var(--color-accent)' }}>
                      {b.price_display}
                    </span>
                  </div>
                  <h3 style={{ margin: '0.65rem 0 0.35rem', fontSize: '1.05rem', color: 'var(--color-pine-dark)', lineHeight: 1.3 }}>{b.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.description || 'No description provided.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setEditingBook(b)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <PenLine size={14} /> {hasDraft ? 'Edit Chapters' : 'Manage Book'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to delete this book listing?')) return;
                      await supabase.from('digital_products').delete().eq('id', b.id);
                      fetchMyBooks();
                      onPublished();
                    }}
                    style={{ background: 'transparent', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                    aria-label="Delete Book"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Creator Modal */}
      {showCreator && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowCreator(false)}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-pine-dark)' }}>Setup Your E-Book</h3>
              <button onClick={() => setShowCreator(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Book Title *</label>
                <input type="text" className="post-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Homestead Recipes & Stories" style={{ width: '100%', margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Summary / Blurb</label>
                <textarea className="post-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is the story about? Keep it engaging." style={{ width: '100%', margin: 0, resize: 'vertical' }} rows={2} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}>
                    <option value="E-Book">E-Book</option>
                    <option value="Short Story / Poetry">Short Story / Poetry</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Price *</label>
                  <input type="text" className="post-input" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Free or $4.99" style={{ width: '100%', margin: 0 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Cover Image URL (Optional)</label>
                <input type="url" className="post-input" value={newCover} onChange={e => setNewCover(e.target.value)} placeholder="https://..." style={{ width: '100%', margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Card Payment URL (Optional)</label>
                <input type="url" className="post-input" value={newPaymentUrl} onChange={e => setNewPaymentUrl(e.target.value)} placeholder="https://buy.stripe.com/..." style={{ width: '100%', margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Crypto Payment URL (Optional)</label>
                <input type="url" className="post-input" value={newCryptoUrl} onChange={e => setNewCryptoUrl(e.target.value)} placeholder="https://commerce.coinbase.com/..." style={{ width: '100%', margin: 0 }} />
              </div>

              <button onClick={createBook} disabled={!newTitle.trim() || !newPrice.trim() || loading} style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Creating...' : 'Launch Studio & Open Chapters'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorInterface({ book, onClose }: { book: any; onClose: () => void }) {
  const [title, setTitle] = useState(book.title || '');
  const [desc, setDesc] = useState(book.description || '');
  const [price, setPrice] = useState(book.price_display || '');
  const [cover, setCover] = useState(book.cover_image_url || '');

  // Payment urls
  const [paymentUrl, setPaymentUrl] = useState(book.payment_url || '');
  const [cryptoUrl, setCryptoUrl] = useState(book.crypto_url || '');

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [aiUpgradeEnabled] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Parse the stored chapters inside file_url
  useEffect(() => {
    if (book.file_url && book.file_url.startsWith('BOOK_JSON:')) {
      try {
        const parsed: BookData = JSON.parse(book.file_url.substring(10));
        setChapters(parsed.chapters || []);
      } catch (e) {
        setChapters([{ id: 'ch1', title: 'Chapter 1: Welcome', content: 'Write here...' }]);
      }
    } else {
      setChapters([{ id: 'ch1', title: 'Chapter 1: Welcome', content: 'Write here...' }]);
    }
  }, [book.file_url]);

  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  function addChapter() {
    const nextNum = chapters.length + 1;
    const newCh: Chapter = {
      id: 'ch' + Math.random().toString(36).substr(2, 6),
      title: `Chapter ${nextNum}: New Chapter`,
      content: 'Start drafting here...'
    };
    const nextChapters = [...chapters, newCh];
    setChapters(nextChapters);
    setActiveChapterIndex(nextChapters.length - 1);
  }

  function deleteChapter(idx: number) {
    if (chapters.length <= 1) return;
    const nextChapters = chapters.filter((_, index) => index !== idx);
    setChapters(nextChapters);
    setActiveChapterIndex(Math.max(0, idx - 1));
  }

  function updateChapterTitle(val: string) {
    const nextChapters = [...chapters];
    if (nextChapters[activeChapterIndex]) {
      nextChapters[activeChapterIndex].title = val;
      setChapters(nextChapters);
    }
  }

  function updateChapterContent(val: string) {
    const nextChapters = [...chapters];
    if (nextChapters[activeChapterIndex]) {
      nextChapters[activeChapterIndex].content = val;
      setChapters(nextChapters);
    }
  }

  async function saveBook(markPublished: boolean) {
    setSaving(true);
    const bookData: BookData = {
      chapters,
      ai_upgrade_enabled: aiUpgradeEnabled
    };

    const fileUrl = 'BOOK_JSON:' + JSON.stringify(bookData);

    const { error } = await supabase.from('digital_products').update({
      title: title.trim(),
      description: desc.trim(),
      price_display: price.trim(),
      payment_url: paymentUrl.trim() || null,
      crypto_url: cryptoUrl.trim() || null,
      cover_image_url: cover.trim() || null,
      file_url: fileUrl,
      is_active: markPublished
    }).eq('id', book.id);

    if (error) {
      alert('Error updating book: ' + error.message);
    } else {
      alert(markPublished ? 'Book successfully published!' : 'Book saved as draft.');
      onClose();
    }
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-main)', fontSize: '0.85rem' }}>
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.25rem', lineHeight: 1.2 }}>{title || 'Draft E-Book'}</h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Draft and self-publish directly in Rural &amp; Reckless.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => saveBook(false)} disabled={saving} style={{ padding: '0.55rem 1rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            Save Draft
          </button>
          <button onClick={() => saveBook(true)} disabled={saving} style={{ padding: '0.55rem 1rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Save size={16} /> Publish Changes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem', minHeight: '520px' }}>
        {/* Left Side: Sidebar navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-bg-card)', flexShrink: 0 }}>
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={16} /> Chapters &amp; Outline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '240px', overflowY: 'auto' }}>
              {chapters.map((ch, idx) => {
                const isActive = idx === activeChapterIndex;
                return (
                  <div key={ch.id} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <button onClick={() => setActiveChapterIndex(idx)} style={{ flex: 1, padding: '0.55rem 0.75rem', textAlign: 'left', background: isActive ? 'var(--color-pine-light)' : 'transparent', border: isActive ? '1px solid var(--color-pine-primary)' : '1px solid transparent', borderRadius: 'var(--radius-sm)', color: isActive ? 'var(--color-pine-dark)' : 'var(--color-text-main)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ch.title}
                    </button>
                    {chapters.length > 1 && (
                      <button onClick={() => deleteChapter(idx)} style={{ background: 'transparent', border: 'none', color: '#dc2626', opacity: 0.6, cursor: 'pointer', padding: '0.35rem' }} aria-label="Delete chapter"><Trash2 size={14} /></button>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={addChapter} style={{ width: '100%', padding: '0.55rem', border: '1px dashed var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-pine-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Plus size={14} /> Add Chapter
            </button>
          </div>

          {/* AI Expansion Promotion Block */}
          <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} /> AI Creator Add-on
            </h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534', lineHeight: 1.4 }}>
              Unlock advanced book outlining, paragraph expansion, and spelling fixes for a small fee.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem' }}>
              <input 
                type="text" 
                className="post-input" 
                value={aiPrompt} 
                onChange={e => setAiPrompt(e.target.value)} 
                placeholder="Brief summary or scene ideas..." 
                style={{ width: '100%', margin: 0, fontSize: '0.78rem', padding: '0.4rem 0.6rem' }} 
              />
              <button 
                onClick={async () => {
                  if (!aiPrompt.trim()) return;
                  const nextChapters = [...chapters];
                  if (nextChapters[activeChapterIndex]) {
                    nextChapters[activeChapterIndex].content += `\n\n[AI Prompt Drafted]: ${aiPrompt}\nOnce upon a time in a stubborn wood, our characters stood up to their greatest challenges. They persisted because they knew their true community awaited them...`;
                    setChapters(nextChapters);
                    setAiPrompt('');
                    alert('AI Co-Author expanded your chapter outline!');
                  }
                }}
                style={{ background: 'var(--color-accent)', color: 'white', border: 'none', padding: '0.45rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
              >
                AI Co-Author Expand
              </button>
            </div>
          </div>

          {/* Book Metadata Block */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.88rem' }}>Book Properties</h4>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Book Title</label>
              <input type="text" className="post-input" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Blurb / Description</label>
              <textarea className="post-input" value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Price</label>
                <input type="text" className="post-input" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Cover Image</label>
                <input type="text" className="post-input" value={cover} onChange={e => setCover(e.target.value)} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Card Payment Link</label>
              <input type="text" className="post-input" value={paymentUrl} onChange={e => setPaymentUrl(e.target.value)} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Crypto Payment Link</label>
              <input type="text" className="post-input" value={cryptoUrl} onChange={e => setCryptoUrl(e.target.value)} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
            </div>
          </div>
        </div>

        {/* Right Side: Chapter Editor */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', border: '1px solid var(--color-border)', flex: 1 }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input type="text" className="post-input" value={activeChapter?.title || ''} onChange={e => updateChapterTitle(e.target.value)} placeholder="Chapter Title" style={{ flex: 1, margin: 0, fontWeight: 700, fontSize: '1.2rem', padding: '0.65rem 1rem', borderBottom: '2px solid var(--color-pine-primary)', borderRadius: 0, background: 'none' }} />
          </div>

          <textarea className="post-input" value={activeChapter?.content || ''} onChange={e => updateChapterContent(e.target.value)} placeholder="Once upon a time in a very stubborn wood..." style={{ flex: 1, width: '100%', margin: 0, padding: '1rem', fontSize: '1rem', lineHeight: 1.7, resize: 'none', border: 'none', outline: 'none', background: '#fafafa', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
}
