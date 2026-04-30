import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TreePine } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the login link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // The router will automatically handle the redirect in App.tsx
      }
    } catch (error: any) {
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-base)',
      backgroundImage: 'url(https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=2070)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="card auth-card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-pine-primary)' }}>
          <TreePine size={48} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome to the Town Square</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {isSignUp ? 'Create your account to start sharing.' : 'Sign in to access your storefront and communities.'}
        </p>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            className="post-input"
            type="email"
            placeholder="Your email address"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="post-input"
            type="password"
            placeholder="Your password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem' }}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '1rem', color: 'var(--color-accent)', fontWeight: '500' }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="action-btn"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ display: 'inline', color: 'var(--color-pine-primary)', fontWeight: 'bold', marginLeft: '0.5rem', background: 'transparent' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
