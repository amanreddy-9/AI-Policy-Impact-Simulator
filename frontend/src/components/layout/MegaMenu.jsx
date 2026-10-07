import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function MegaMenu({ isOpen, onClose }) {
  const { language, t } = useApp();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 100000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(90vw, 460px)',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
          overflowY: 'auto',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#1e293b'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Menu Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #F15B25' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/images/emblem.png" alt="Emblem" style={{ height: '36px' }} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0c2340' }}>
                  {t('nationalPortal')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  PolicySim AI & Government Directory
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              ✕
            </button>
          </div>

          {/* Navigation Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#F15B25', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                {language === 'hi' ? 'एकल खिड़की उपकरण' : language === 'ta' ? 'ஒற்றைச் சாளர கருவிகள்' : 'Single Window Tools'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <Link
                    to="/simulator"
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      color: '#0c2340',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <span>⚙️ {t('policyMaker')}</span>
                    <span className="badge badge-saffron" style={{ background: '#F15B25', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>AI PPO</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="#national-schemes"
                    onClick={() => {
                      onClose();
                      const target = document.getElementById('national-schemes');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: '#334155',
                      fontWeight: 600,
                      textDecoration: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    📋 {t('schemesTitle')}
                  </a>
                </li>
                <li>
                  <a
                    href="#architecture"
                    onClick={() => {
                      onClose();
                      const target = document.getElementById('architecture');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: '#334155',
                      fontWeight: 600,
                      textDecoration: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    🔬 {t('methodologyTitle')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#046A38', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                {language === 'hi' ? 'राष्ट्रीय पोर्टल एवं डेटा' : language === 'ta' ? 'தேசிய போர்டல்கள் & தரவு' : 'National Portals & Alignment'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <li>
                  <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                    🌐 india.gov.in — National Portal of India
                  </a>
                </li>
                <li>
                  <a href="https://www.niti.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                    📊 NITI Aayog — Transforming India
                  </a>
                </li>
                <li>
                  <a href="https://www.mospi.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                    📈 MoSPI — Ministry of Statistics
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Menu Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
          <div>{t('bharatSarkar')} · {t('govIndia')}</div>
          <div style={{ marginTop: '4px' }}>Digital India Initiative</div>
        </div>
      </div>
    </div>
  );
}
