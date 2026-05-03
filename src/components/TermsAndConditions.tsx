import { Scale } from 'lucide-react';

export function TermsAndConditions() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
          <Scale size={32} style={{ color: 'var(--color-pine-primary)' }} />
          <h1 style={{ fontSize: '2rem', color: 'var(--color-pine-dark)', margin: 0 }}>Terms and Conditions</h1>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>1. Acceptance of Terms</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            By registering for an account, accessing, or using Rural & Reckless (the "Platform"), you agree to be bound by these Terms and Conditions. If you do not accept these terms, you are prohibited from using the Platform.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>2. User Content and Conduct</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            You are entirely responsible for the content you upload, post, or otherwise display on the Platform. All products, messages, listings, and about descriptions must strictly obey applicable laws. You agree not to distribute malicious code, engage in spam, or infringe intellectual property rights.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>3. Marketplace Rules and Liability</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            Rural & Reckless acts as a social directory and decentralized marketplace platform connecting buyers directly with makers. We never handle, process, or hold any financial transactions. Buyers and sellers transact entirely at their own risk using third-party systems like Stripe, PayPal, or crypto payment links.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>4. Termination</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            We reserve the absolute right to suspend, terminate, or limit access to any account or listing for any reason, including violations of these terms, copyright notices, or community guidelines.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--color-pine-dark)' }}>5. Governing Law</h3>
          <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            These Terms and Conditions are governed by and construed in accordance with the laws of Oregon, without giving effect to any principles of conflicts of law.
          </p>
        </section>
      </div>
    </div>
  );
}
