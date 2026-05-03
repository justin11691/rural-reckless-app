import { Shield } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
          <Shield size={32} style={{ color: 'var(--color-pine-primary)' }} />
          <h1 style={{ fontSize: '2rem', color: 'var(--color-pine-dark)', margin: 0 }}>Privacy Policy</h1>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>1. Information We Collect</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            At Rural & Reckless, we collect information you directly provide us. This includes your name, username, email address, profile description, store location, and external marketplace links. We also collect content, like text, photos, and messages, you post to the platform.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>2. How We Use Information</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            We use your information to operate, personalize, and improve our platform. This includes processing search results, blending For You feeds with regional local listings, sending optional direct messages, and enabling secure checkout flows. We also use it to maintain a safe, respectful environment.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>3. Information Sharing</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            Rural & Reckless is a public platform. When you create listings, post in the social feed, or customize your profile, that content is visible to other users. We do not sell or rent your personal data to third parties. We may disclose your information to comply with legal obligations or enforce platform policies.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>4. Third-Party Services and Ads</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            We integrate third-party services to supply advertising units (such as Google AdSense). These third-party networks may use tracking tools such as cookies and beacons to optimize ad targeting according to your browsing behavior. You can opt out of personalized ad targeting via your individual Google Account.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>5. Your Privacy Rights</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            You have total control over your profile and can update, correct, or delete information at any time directly through the platform. If you wish to delete your account entirely, please contact us.
          </p>
        </section>
      </div>
    </div>
  );
}
