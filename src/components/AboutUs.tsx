import { TreePine, Sparkles } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
          <TreePine size={32} style={{ color: 'var(--color-pine-primary)' }} />
          <h1 style={{ fontSize: '2rem', color: 'var(--color-pine-dark)', margin: 0 }}>About Rural & Reckless</h1>
        </div>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
          <strong>Rural & Reckless</strong> is a community-driven social and marketplace platform tailored explicitly for makers, artists, crafters, homesteaders, and rural creatives. Our mission is to blend independent social interaction with direct localized and digital commerce.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <Sparkles size={24} style={{ color: 'var(--color-wood-brown)', flexShrink: 0, marginTop: '0.2rem' }} />
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)' }}>Who We Are</h4>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              We are a passionate team of homesteaders and digital creatives who believe in the beauty of handmade goods, slow living, and self-reliance.
            </p>
          </div>
        </div>

        <h3 style={{ color: 'var(--color-pine-dark)', marginTop: '0.5rem' }}>Our Core Values</h3>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text-main)' }}>
          <li><strong>Makers First:</strong> We prioritize local creators and digital artists, ensuring they keep 100% of their earnings.</li>
          <li><strong>Building Connections:</strong> Beyond just a storefront, Rural & Reckless is about making friendships and finding like-minded groups.</li>
          <li><strong>Honesty and Integrity:</strong> We operate under a decentralized model where transparency is our highest priority.</li>
        </ul>

        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
          By establishing a welcoming environment, we empower creative rural entrepreneurs to succeed online.
        </p>
      </div>
    </div>
  );
}
