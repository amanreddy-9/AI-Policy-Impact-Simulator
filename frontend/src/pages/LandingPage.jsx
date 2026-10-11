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

          {(() => {
            const pillars = [
              {
                num: '01',
                icon: '📚',
                color: '#0284c7',
                title: t('layer1Title'),
                desc: t('layer1Desc'),
                tags: ['4,086 Schemes DB', 'Live Web Scraping', 'Gazette Citations']
              },
              {
                num: '02',
                icon: '🧮',
                color: '#059669',
                title: t('layer2Title'),
                desc: t('layer2Desc'),
                tags: ['Union Budget 24-25', 'Zero Hallucination', 'Dynamic Proofs']
              },
              {
                num: '03',
                icon: '🎲',
                color: '#d97706',
                title: t('layer3Title'),
                desc: t('layer3Desc'),
                tags: ['10,000 Iterations', '20 Quant Indicators', '95% CI (P10/P90)']
              },
              {
                num: '04',
                icon: '⚡',
                color: '#E31E2E',
                title: t('layer4Title'),
                desc: t('layer4Desc'),
                tags: ['Groq 120B Synthesis', 'Fiscal Profit/Loss', 'Dual Evidence Audit']
              }
            ];

            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px'
              }}>
                {pillars.map((pillar) => (
                  <div
                    key={pillar.num}
                    className="card"
                    style={{
                      padding: '24px 20px',
                      backgroundColor: isDark ? '#111c33' : '#ffffff',
                      borderRadius: '12px',
                      border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
                      borderTop: `4px solid ${pillar.color}`,
                      boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = isDark
                        ? `0 10px 24px rgba(0,0,0,0.5)`
                        : `0 10px 22px rgba(0,0,0,0.08)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 4px 18px rgba(0,0,0,0.4)'
                        : '0 4px 14px rgba(0,0,0,0.04)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: isDark ? `${pillar.color}25` : `${pillar.color}15`,
                          border: `1px solid ${pillar.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          {pillar.icon}
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.5px',
                          color: pillar.color,
                          background: isDark ? `${pillar.color}18` : `${pillar.color}10`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${pillar.color}30`
                        }}>
                          PILLAR {pillar.num}
                        </span>
                      </div>

                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isDark ? '#ffffff' : '#0c2340',
                        marginBottom: '10px',
                        lineHeight: 1.35,
                        minHeight: '40px'
                      }}>
                        {pillar.title}
                      </h4>

                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#cbd5e1' : '#64748b',
                        lineHeight: 1.6,
                        marginBottom: '18px'
                      }}>
                        {pillar.desc}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      paddingTop: '12px',
                      borderTop: isDark ? '1px solid #1e2e4a' : '1px solid #f1f5f9'
                    }}>
                      {pillar.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: isDark ? '#0b1324' : '#f8fafc',
                            color: isDark ? '#94a3b8' : '#475569',
                            border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'
                          }}
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

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
