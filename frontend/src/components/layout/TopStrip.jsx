import React from 'react';

export default function TopStrip() {
  return (
    <div style={{
      backgroundColor: 'var(--clr-strip)',
      color: '#ffffff',
      fontSize: '11px',
      padding: '6px 0',
      borderBottom: '3px solid var(--clr-saffron)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>🇮🇳</span>
          <span><strong>भारत सरकार</strong> | GOVERNMENT OF INDIA</span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#cbd5e1' }}>National AI Decision-Support Infrastructure</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#cbd5e1' }}>
          <a
            href="#main-content"
            style={{ color: '#e2e8f0', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('main-content');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Skip to Main Content
          </a>
          <span style={{ color: '#475569' }}>|</span>
          <span
            style={{ color: '#e2e8f0', cursor: 'pointer' }}
            onClick={() => alert('Accessibility Settings: GIGW 3.0 Compliant. High Contrast and Screen-Reader friendly.')}
          >
            Accessibility
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#ffb74d', fontWeight: 'bold' }}>English / हिन्दी</span>
        </div>
      </div>
    </div>
  );
}
