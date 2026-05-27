import React from 'react';

export function parseContent(text: string) {
  if (!text) return null;

  // Split by newlines first to handle block-level elements (headers, lists)
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: React.ReactNode[] = [];
  
  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} style={{ margin: '0.5rem 0 0.5rem 1.5rem', padding: 0 }}>{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (line: string, keyPrefix: string) => {
    // Basic inline markdown: bold (**text**) and links ([text](url))
    // We'll split by a combined regex
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = line.split(regex);
    
    return parts.map((part, i) => {
      const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
      if (boldMatch) {
        return <strong key={`${keyPrefix}-${i}`}>{boldMatch[1]}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return <a key={`${keyPrefix}-${i}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-pine-primary)', textDecoration: 'underline', fontWeight: 600 }}>{linkMatch[1]}</a>;
      }
      return <span key={`${keyPrefix}-${i}`}>{part}</span>;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for Headers
    const headerMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const content = parseInline(headerMatch[2], `h-${i}`);
      if (level === 1) elements.push(<h3 key={`h1-${i}`} style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--color-pine-dark)' }}>{content}</h3>);
      if (level === 2) elements.push(<h4 key={`h2-${i}`} style={{ fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-pine-dark)' }}>{content}</h4>);
      if (level === 3) elements.push(<strong key={`h3-${i}`} style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-pine-dark)' }}>{content}</strong>);
      continue;
    }
    
    // Check for Lists (bullet points starting with - or *)
    const listMatch = line.match(/^[\-\*]\s+(.*)$/);
    if (listMatch) {
      inList = true;
      listItems.push(<li key={`li-${i}`} style={{ marginBottom: '0.2rem' }}>{parseInline(listMatch[1], `li-${i}`)}</li>);
      continue;
    }
    
    // Check for bullet dot •
    const bulletMatch = line.match(/^•\s+(.*)$/);
    if (bulletMatch) {
      inList = true;
      listItems.push(<li key={`li-${i}`} style={{ marginBottom: '0.2rem', listStyleType: 'disc' }}>{parseInline(bulletMatch[1], `li-${i}`)}</li>);
      continue;
    }

    // Normal line
    flushList();
    if (line.trim() === '') {
      elements.push(<br key={`br-${i}`} />);
    } else {
      elements.push(
        <div key={`p-${i}`} style={{ minHeight: '1.2rem' }}>
          {parseInline(line, `p-${i}`)}
        </div>
      );
    }
  }
  flushList();

  return <div style={{ wordBreak: 'break-word' }}>{elements}</div>;
}

export function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
