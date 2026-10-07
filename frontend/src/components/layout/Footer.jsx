import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { t } = useApp();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      backgroundColor: '#0a0a0a',
      color: '#e2e8f0',
      padding: '48px 0 24px',
      fontSize: '13px',
      borderTop: '1px solid #262626',
      position: 'relative'
    }}>
      <div className="container">

        {/* ── 1. Top Section: Content Sources, View on Mobile & Follow Us ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          paddingBottom: '36px',
          borderBottom: '1px solid #262626',
          alignItems: 'start'
        }}>

          {/* Column 1: Content Sources */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              {t('contentSources')}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  India Portal 2.0 Brochure
                </a>
              </li>
              <li>
                <a href="https://www.niti.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  NITI Aayog Policy Repository
                </a>
              </li>
              <li>
                <a href="https://www.mospi.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  MoSPI Statistics & Datasets
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: View on Mobile */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              {t('viewOnMobile')}
            </h4>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#171717',
              border: '2px solid #404040',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a3a3a3',
              fontSize: '10px',
              textAlign: 'center',
              padding: '6px'
            }}>
              <span style={{ fontSize: '28px', marginBottom: '2px' }}>📱</span>
              <span>Mobile Portal</span>
            </div>
          </div>

          {/* Column 3: Follow Us */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              {t('followUs')}
            </h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href="https://facebook.com/indiagovin"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#262626',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 800,
                  transition: 'background-color 0.2s ease'
                }}
              >
                f
              </a>
              <a
                href="https://twitter.com/Indiagovin"
                target="_blank"
                rel="noopener noreferrer"
                title="X (Twitter)"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#262626',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 800,
                  transition: 'background-color 0.2s ease'
                }}
              >
                𝕏
              </a>
            </div>
          </div>

        </div>

        {/* ── 2. Translation Disclaimer Box (Matching Image 5) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '24px 0',
          borderBottom: '1px solid #262626',
          flexWrap: 'wrap'
        }}>
          <div style={{
            backgroundColor: '#0c2340',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: '1px solid #1e3a8a',
            textAlign: 'center'
          }}>
            {t('translationDisclaimerTitle')}
          </div>
          <div style={{ flex: 1, minWidth: '280px', color: '#a3a3a3', fontSize: '12px', lineHeight: 1.6 }}>
            {t('translationDisclaimerText')}
          </div>
        </div>

        {/* ── 3. Bottom NIC (National Informatics Centre) Banner ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          paddingTop: '24px',
          flexWrap: 'wrap'
        }}>
          {/* Left: NIC Logo & Digital India Lockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '300px' }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#002b49', letterSpacing: '-0.5px' }}>
                NIC
              </span>
              <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '6px', fontSize: '8px', color: '#334155', lineHeight: 1.1 }}>
                एन आई सी<br />National<br />Informatics<br />Centre
              </div>
            </div>

            <p style={{ margin: 0, color: '#a3a3a3', fontSize: '11px', lineHeight: 1.5 }}>
              {t('nicText')}
            </p>
          </div>
        </div>

        {/* Review Timestamp */}
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#737373', fontSize: '11px' }}>
          {t('lastUpdated')}
        </div>

      </div>

      {/* ── 4. Floating Scroll-To-Top Button (Purple / Navy Glow) ── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Scroll back to top"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 24px rgba(67, 56, 202, 0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 900,
            zIndex: 99999,
            transition: 'all 0.2s ease',
            animation: 'fadeIn 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(67, 56, 202, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(67, 56, 202, 0.45)';
          }}
        >
          ↑
        </button>
      )}
    </footer>
  );
}
