import React from 'react';
import { useNavigate } from 'react-router-dom';
import GovHeroBanner from '../components/landing/GovHeroBanner';
import SchemesCarousel from '../components/landing/SchemesCarousel';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  return (
    <div style={{ backgroundColor: isDark ? '#070d19' : '#ffffff', transition: 'background-color 0.25s ease' }}>
      {/* ── 1. Official Government Hero Section (Replicating India.gov.in) ── */}
      <GovHeroBanner />

      {/* ── 2. National Welfare Schemes Carousel Grid ── */}
      <SchemesCarousel />

      {/* ── 3. Core Methodology & 4-Layer Architecture ── */}
      <section id="architecture" style={{
        paddingTop: '50px',
        paddingBottom: '70px',
        backgroundColor: isDark ? '#091122' : '#f8fafc',
        transition: 'background-color 0.25s ease'
      }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
              {t('methodologyTitle')}
            </h2>
            <div style={{ width: '48px', height: '4px', backgroundColor: '#E31E2E', borderRadius: '3px', margin: '10px auto 14px' }} />
            <p className="section-sub" style={{ maxWidth: '720px', margin: '0 auto', color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
              {t('methodologySubtitle')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {/* Layer 1 */}
            <div className="card" style={{
              padding: '24px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
              borderTop: isDark ? '4px solid #38bdf8' : '4px solid #0c2340',
              boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isDark ? '#38bdf8' : '#0c2340',
                color: isDark ? '#000000' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 800,
                marginBottom: '14px'
              }}>
                1
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#0c2340', marginBottom: '8px' }}>
                {t('layer1Title')}
              </h4>
              <p style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.6 }}>
                {t('layer1Desc')}
              </p>
            </div>

            {/* Layer 2 */}
            <div className="card" style={{
              padding: '24px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
              borderTop: isDark ? '4px solid #38bdf8' : '4px solid #0c2340',
              boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isDark ? '#38bdf8' : '#0c2340',
                color: isDark ? '#000000' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 800,
                marginBottom: '14px'
              }}>
                2
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#0c2340', marginBottom: '8px' }}>
                {t('layer2Title')}
              </h4>
              <p style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.6 }}>
                {t('layer2Desc')}
              </p>
            </div>

            {/* Layer 3 */}
            <div className="card" style={{
              padding: '24px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
              borderTop: isDark ? '4px solid #38bdf8' : '4px solid #0c2340',
              boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isDark ? '#38bdf8' : '#0c2340',
                color: isDark ? '#000000' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 800,
                marginBottom: '14px'
              }}>
                3
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#0c2340', marginBottom: '8px' }}>
                {t('layer3Title')}
              </h4>
              <p style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.6 }}>
                {t('layer3Desc')}
              </p>
            </div>

            {/* Layer 4 */}
            <div className="card" style={{
              padding: '24px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
              borderTop: isDark ? '4px solid #38bdf8' : '4px solid #0c2340',
              boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isDark ? '#38bdf8' : '#0c2340',
                color: isDark ? '#000000' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 800,
                marginBottom: '14px'
              }}>
                4
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#0c2340', marginBottom: '8px' }}>
                {t('layer4Title')}
              </h4>
              <p style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.6 }}>
                {t('layer4Desc')}
              </p>
            </div>
          </div>

          {/* Large CTA Button */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={() => navigate('/simulator')}
              style={{
                backgroundColor: '#E31E2E',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(227, 30, 46, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c30112';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E31E2E';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {t('launchSimulatorBtn')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
