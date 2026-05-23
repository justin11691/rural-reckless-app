import { Link } from 'react-router-dom';
import { TreePine, ShoppingBag, Users, ArrowRight, Leaf, Hammer, BookOpen } from 'lucide-react';

export function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1B3B2B 0%, #0c1a13 60%, #0c1a13 100%)',
      color: '#FFFFFF',
      fontFamily: 'Outfit, Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        padding: '1.5rem 1.5rem 0',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <TreePine size={28} color="#4A7C43" />
          <span style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Rural &amp; Reckless
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/explore" style={{
            textDecoration: 'none', color: '#A1C79D',
            fontSize: '0.9rem', fontWeight: 600,
          }}>
            Browse
          </Link>
          <Link to="/about" style={{
            textDecoration: 'none', color: '#A1C79D',
            fontSize: '0.9rem', fontWeight: 600,
          }}>
            About
          </Link>
          <Link to="/login" style={{
            textDecoration: 'none', color: '#FFFFFF',
            background: 'rgba(255,255,255,0.08)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            Sign In
          </Link>
          <Link to="/login" style={{
            textDecoration: 'none', color: '#FFFFFF',
            background: '#2D5A27',
            padding: '0.5rem 1.1rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
          }}>
            Join Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        padding: '4rem 1.5rem 3rem',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        gap: '3rem',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            background: 'rgba(74,124,67,0.18)', border: '1px solid rgba(74,124,67,0.32)',
            padding: '0.35rem 0.85rem', borderRadius: '999px',
            fontSize: '0.82rem', fontWeight: 600, color: '#A1C79D', width: 'fit-content',
          }}>
            <Leaf size={13} /> A calmer corner of the internet — for people who make things
          </div>

          {/* H1 */}
          <h1 style={{
            color: '#FFFFFF', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            lineHeight: 1.12, fontWeight: 800, margin: 0, letterSpacing: '-0.03em',
          }}>
            The internet used to{' '}
            <span style={{ color: '#4A7C43' }}>feel like a neighborhood.</span>
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: '1.1rem', lineHeight: 1.65,
            color: '#B2C4B8', margin: 0, maxWidth: '500px',
          }}>
            Rural &amp; Reckless is a marketplace and community for makers, crafters, growers,
            and local creators. Browse listings, join groups, sell your work —
            no algorithm, no fees, no noise.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <Link to="/explore" style={{
              textDecoration: 'none', color: '#FFFFFF',
              background: '#2D5A27', padding: '0.85rem 1.85rem',
              borderRadius: '10px', fontSize: '1rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 4px 20px rgba(45,90,39,0.4)',
            }}>
              Browse the Marketplace <ArrowRight size={18} />
            </Link>
            <Link to="/explore?tab=communities" style={{
              textDecoration: 'none', color: '#A1C79D',
              background: 'transparent', padding: '0.85rem 1.6rem',
              borderRadius: '10px', fontSize: '1rem', fontWeight: 600,
              border: '1px solid rgba(161,199,157,0.3)',
            }}>
              Explore Communities
            </Link>
          </div>

          {/* Micro trust line */}
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B8A6B' }}>
            Free to join · No platform fees · No algorithm
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {[
            {
              icon: <ShoppingBag size={22} color="#A1C79D" />,
              title: 'Sell your work directly.',
              body: 'List physical goods, digital downloads, or handmade items. Payments go straight to you — we take nothing.',
            },
            {
              icon: <Users size={22} color="#A1C79D" />,
              title: 'Find your people.',
              body: 'Join communities built around what you actually care about — beekeeping, woodworking, books, homesteading, and more.',
            },
            {
              icon: <Hammer size={22} color="#A1C79D" />,
              title: 'Built for makers, not metrics.',
              body: 'No viral pressure. No engagement farming. Just a place to share what you make with people who get it.',
            },
          ].map((card, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '1.3rem 1.5rem',
              borderRadius: '12px',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              <div style={{
                background: 'rgba(45,90,39,0.22)', border: '1px solid rgba(45,90,39,0.38)',
                borderRadius: '8px', width: 46, height: 46, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div>
                <h3 style={{ color: '#FFFFFF', fontSize: '0.97rem', margin: '0 0 0.3rem', fontWeight: 700 }}>
                  {card.title}
                </h3>
                <p style={{ color: '#B2C4B8', fontSize: '0.86rem', margin: 0, lineHeight: 1.5 }}>
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Who it's for section */}
      <section style={{
        background: 'rgba(255,255,255,0.025)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '3rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 1.5rem', color: '#6B8A6B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Who this is for
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🪵', label: 'Woodworkers & Crafters' },
              { icon: '🌱', label: 'Homesteaders & Growers' },
              { icon: '📖', label: 'Readers & Writers' },
              { icon: '🧵', label: 'Sewers & Textile Artists' },
              { icon: '🍯', label: 'Food Makers & Beekeepers' },
              { icon: '🏡', label: 'Local Shops & Small Businesses' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                background: 'rgba(255,255,255,0.03)',
                padding: '0.85rem 1rem', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                <span style={{ color: '#C8D8C4', fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ margin: '0 0 0.4rem', color: '#6B8A6B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Simple by design
        </p>
        <h2 style={{ margin: '0 0 2rem', color: '#FFFFFF', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { step: '1', icon: <BookOpen size={20} color="#A1C79D" />, title: 'Browse freely.', body: 'No account needed to look around. Browse listings and communities before you decide.' },
            { step: '2', icon: <Users size={20} color="#A1C79D" />, title: 'Find your people.', body: 'Join communities built around what you actually do — crafts, books, farming, and more.' },
            { step: '3', icon: <ShoppingBag size={20} color="#A1C79D" />, title: 'Sell directly.', body: 'List your work. Set your own price. Payments go straight to you — we take nothing.' },
          ].map(item => (
            <div key={item.step} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '1.5rem',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(45,90,39,0.25)', border: '1px solid rgba(45,90,39,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 800, color: '#A1C79D', marginBottom: '1rem',
              }}>
                {item.step}
              </div>
              <h3 style={{ color: '#FFFFFF', margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 700 }}>{item.title}</h3>
              <p style={{ color: '#B2C4B8', margin: 0, fontSize: '0.875rem', lineHeight: 1.55 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto 4rem', width: '100%',
        padding: '0 1.5rem', boxSizing: 'border-box',
      }}>
        <div style={{
          background: 'rgba(45,90,39,0.18)',
          border: '1px solid rgba(45,90,39,0.3)',
          borderRadius: '16px', padding: '2.5rem 2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.7rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Ready to find your people?
          </h2>
          <p style={{ margin: '0 0 1.5rem', color: '#A1C79D', fontSize: '1rem' }}>
            Free to join. Takes 60 seconds. No algorithm.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
              background: '#2D5A27', color: 'white', textDecoration: 'none',
              padding: '0.9rem 2.2rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700,
              boxShadow: '0 4px 20px rgba(45,90,39,0.45)',
            }}
          >
            Create Your Free Account <ArrowRight size={18} />
          </Link>
          <p style={{ marginTop: '1rem', color: '#6B8A6B', fontSize: '0.82rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#A1C79D', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '1.75rem 1.5rem',
        maxWidth: '1100px', margin: '0 auto', width: '100%',
        boxSizing: 'border-box',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        fontSize: '0.82rem', color: '#6B8A6B',
      }}>
        <div>© {new Date().getFullYear()} Rural &amp; Reckless Media LLC. A marketplace for makers and communities.</div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/explore" style={{ color: '#6B8A6B', textDecoration: 'none' }}>Browse</Link>
          <Link to="/about" style={{ color: '#6B8A6B', textDecoration: 'none' }}>About</Link>
          <Link to="/contact" style={{ color: '#6B8A6B', textDecoration: 'none' }}>Contact</Link>
          <Link to="/privacy" style={{ color: '#6B8A6B', textDecoration: 'none' }}>Privacy</Link>
          <Link to="/terms" style={{ color: '#6B8A6B', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 800px) {
          main { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 2.5rem 1.25rem 2rem !important; }
          header { flex-wrap: wrap; gap: 0.75rem; }
          footer { flex-direction: column !important; text-align: center !important; }
        }
        @media (max-width: 480px) {
          h1 { font-size: 2rem !important; }
          header a:nth-child(2), header a:nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
}
