import { useState } from 'react';
import { BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

export function BookReader({ product, onClose }: { product: any; onClose: () => void }) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  let chapters: Chapter[] = [];
  try {
    if (product.file_url && product.file_url.startsWith('BOOK_JSON:')) {
      const parsed = JSON.parse(product.file_url.substring(10));
      chapters = parsed.chapters || [];
    }
  } catch (e) {
    chapters = [];
  }

  // Fallback for single description if no JSON exists
  if (chapters.length === 0) {
    chapters = [
      { id: 'c1', title: product.title || 'Introduction', content: product.description || 'Welcome to this story.' }
    ];
  }

  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '1rem' }} onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={`Read ${product.title}`}>
      <div className="card" style={{ width: '100%', maxWidth: '820px', height: '90vh', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: '#fcfcfc', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BookOpen size={24} style={{ color: 'var(--color-pine-primary)' }} aria-hidden />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-pine-dark)', lineHeight: 1.2 }}>{product.title}</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Self-published direct directly on Rural &amp; Reckless.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem' }} aria-label="Close reader"><X size={24} /></button>
        </div>

        {/* Dynamic Reader Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: chapters.length > 1 ? '220px 1fr' : '1fr', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
          
          {/* Chapter Outline Sidebar */}
          {chapters.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderRight: '1px solid var(--color-border)', paddingRight: '1rem', overflowY: 'auto' }}>
              <h4 style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Table of Contents</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {chapters.map((ch, idx) => {
                  const isActive = idx === activeChapterIndex;
                  return (
                    <button key={ch.id} onClick={() => setActiveChapterIndex(idx)} style={{ textAlign: 'left', padding: '0.55rem 0.75rem', background: isActive ? 'var(--color-pine-light)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: isActive ? 'var(--color-pine-dark)' : 'var(--color-text-main)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ch.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reading Display Area */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem 2rem', lineHeight: 1.8, fontSize: '1.05rem', color: '#1e293b' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.25rem', color: 'var(--color-pine-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', fontSize: '1.3rem' }}>{activeChapter?.title}</h3>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{activeChapter?.content}</p>
            </div>

            {/* Navigation Bottom Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button disabled={activeChapterIndex === 0} onClick={() => setActiveChapterIndex(Math.max(0, activeChapterIndex - 1))} style={{ opacity: activeChapterIndex === 0 ? 0.35 : 1, cursor: activeChapterIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: '1px solid var(--color-border)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600 }}>
                <ChevronLeft size={16} /> Previous
              </button>

              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Page {activeChapterIndex + 1} of {chapters.length}</span>

              <button disabled={activeChapterIndex === chapters.length - 1} onClick={() => setActiveChapterIndex(Math.min(chapters.length - 1, activeChapterIndex + 1))} style={{ opacity: activeChapterIndex === chapters.length - 1 ? 0.35 : 1, cursor: activeChapterIndex === chapters.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: '1px solid var(--color-border)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600 }}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
