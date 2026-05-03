import { useEffect } from 'react';

interface AdSenseUnitProps {
  slotId: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export function AdSenseUnit({ slotId, format = 'auto', className = '', style = {} }: AdSenseUnitProps) {
  useEffect(() => {
    try {
      // In production with standard scripts, push the adsbygoogle array
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense script initialization ignored or not loaded in dev mode.', e);
    }
  }, [slotId]);

  return (
    <div 
      className={`adsense-wrapper ${className}`} 
      style={{
        margin: '1.5rem 0',
        padding: '1rem',
        background: 'var(--color-bg-base)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100px',
        textAlign: 'center',
        ...style
      }}
    >
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
        Advertisement / Sponsored Unit
      </span>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Rural & Reckless Ad Unit ID: <code>{slotId}</code>
      </div>
    </div>
  );
}
