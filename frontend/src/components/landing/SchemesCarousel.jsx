import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SCHEMES } from '../../data/schemesData';

export default function SchemesCarousel() {
  const navigate = useNavigate();
  const { language, theme, t } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isDark = theme === 'dark';

  // Category labels with translation
  const categories = [
    { id: 'all', label: language === 'hi' ? `सभी योजनाएं (${SCHEMES.length})` : language === 'ta' ? `அனைத்து திட்டங்கள் (${SCHEMES.length})` : `All Schemes (${SCHEMES.length})` },
    { id: 'rural', label: language === 'hi' ? 'रोजगार एवं ग्रामीण' : language === 'ta' ? 'வேலைவாய்ப்பு & ஊரகம்' : 'Employment & Rural' },
    { id: 'agriculture', label: language === 'hi' ? 'कृषि एवं किसान' : language === 'ta' ? 'வேளாண்மை & விவசாயிகள்' : 'Agriculture & Farmers' },
    { id: 'food', label: language === 'hi' ? 'खाद्य सुरक्षा' : language === 'ta' ? 'உணவுப் பாதுகாப்பு' : 'Food Security' },
    { id: 'health', label: language === 'hi' ? 'स्वास्थ्य एवं बीमा' : language === 'ta' ? 'சுகாதாரம் & காப்பீடு' : 'Healthcare & Insurance' },
    { id: 'housing', label: language === 'hi' ? 'आवास एवं विकास' : language === 'ta' ? 'வீட்டுவசதி' : 'Housing & Infrastructure' },
    { id: 'women', label: language === 'hi' ? 'महिला एवं ऊर्जा' : language === 'ta' ? 'பெண்கள் & ஆற்றல்' : 'Women & Clean Energy' },
    { id: 'credit', label: language === 'hi' ? 'सूक्ष्म ऋण' : language === 'ta' ? 'குறுங்கடன்' : 'Micro-Credit & Startups' },
    { id: 'education', label: language === 'hi' ? 'शिक्षा एवं पोषण' : language === 'ta' ? 'கல்வி & ஊட்டச்சத்து' : 'Child Nutrition & Education' },
    { id: 'infrastructure', label: language === 'hi' ? 'जल एवं स्वच्छता' : language === 'ta' ? 'குடிநீர் & சுகாதாரம்' : 'Drinking Water' }
  ];

  const filteredSchemes = SCHEMES.filter(scheme => {
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const name = (scheme[`name_${language}`] || scheme.name).toLowerCase();
    const fullName = (scheme[`fullName_${language}`] || scheme.fullName).toLowerCase();
    const ministry = (scheme[`ministry_${language}`] || scheme.ministry).toLowerCase();
    const description = (scheme[`description_${language}`] || scheme.description).toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = name.includes(q) || fullName.includes(q) || ministry.includes(q) || description.includes(q);
    return matchesCategory && matchesSearch;
  });

  const totalCards = filteredSchemes.length;

  // Responsive cards visible per view
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1100) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, totalCards - cardsPerView);

  // Auto-advance dynamically every 5 seconds (5000ms)
  useEffect(() => {
    if (isPaused || totalCards <= cardsPerView) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex, totalCards, cardsPerView]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  };

  const handleSimulate = (schemeId) => {
    navigate(`/simulator?scheme=${schemeId}`);
  };

  return (
    <section
      id="national-schemes"
      style={{
        paddingTop: '50px',
        paddingBottom: '64px',
        backgroundColor: isDark ? '#070d19' : '#ffffff',
        overflow: 'hidden',
        transition: 'background-color 0.25s ease'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">

        {/* ── Section Title with Red Underline Accent ── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3.2vw, 34px)',
            fontWeight: 800,
            color: isDark ? '#ffffff' : '#0f172a',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {t('schemesTitle')}
          </h2>
          <div style={{
            width: '48px',
            height: '4px',
            backgroundColor: '#E31E2E',
            borderRadius: '3px',
            margin: '10px auto 14px'
          }} />
          <p style={{
            fontSize: '14px',
            color: isDark ? '#94a3b8' : '#64748b',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {t('schemesSubtitle')}
          </p>
        </div>

        {/* ── Category Tabs & Live Search Filter ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '28px'
        }}>
          {/* Categories Pill Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '75%' }}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentIndex(0);
                  }}
                  style={{
                    backgroundColor: isSelected
                      ? (isDark ? '#38bdf8' : '#0c2340')
                      : (isDark ? '#111c33' : '#ffffff'),
                    borderColor: isSelected
                      ? (isDark ? '#38bdf8' : '#0c2340')
                      : (isDark ? '#1e2e4a' : '#cbd5e1'),
                    color: isSelected
                      ? (isDark ? '#000000' : '#ffffff')
                      : (isDark ? '#cbd5e1' : '#475569'),
                    border: '1px solid',
                    borderRadius: '20px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '320px' }}>
            <input
              type="text"
              placeholder={t('filterSchemes')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '8px',
                border: isDark ? '1px solid #1e2e4a' : '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: isDark ? '#111c33' : '#ffffff',
                color: isDark ? '#ffffff' : '#0f172a'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>🔍</span>
          </div>
        </div>

        {/* ── Dynamic Sliding Track Carousel with Side Arrow Buttons ── */}
        <div style={{ position: 'relative', padding: '0 20px' }}>

          {/* Left Round Navigation Arrow Button */}
          <button
            onClick={handlePrev}
            title="Previous Scheme"
            style={{
              position: 'absolute',
              left: '-14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              border: isDark ? '1.5px solid #243755' : '1.5px solid #e2e8f0',
              boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.5)' : '0 6px 18px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 20,
              color: '#E31E2E',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E31E2E';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#111c33' : '#ffffff';
              e.currentTarget.style.color = '#E31E2E';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Sliding Viewport & Track */}
          <div style={{
            overflow: 'hidden',
            borderRadius: '16px',
            padding: '10px 4px 16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              transform: `translateX(calc(-${currentIndex} * (${100 / cardsPerView}% + ${20 / cardsPerView}px)))`,
              transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)'
            }}>
              {filteredSchemes.map((scheme) => {
                const name = scheme[`name_${language}`] || scheme.name;
                const fullName = scheme[`fullName_${language}`] || scheme.fullName;
                const ministry = scheme[`ministry_${language}`] || scheme.ministry;
                const categoryLabel = scheme[`categoryLabel_${language}`] || scheme.categoryLabel;
                const description = scheme[`description_${language}`] || scheme.description;
                const targetCohort = scheme[`targetCohort_${language}`] || scheme.targetCohort;
                const budget = scheme[`baselineBudget_${language}`] || scheme.baselineBudget;

                return (
                  <div
                    key={scheme.id}
                    style={{
                      flex: `0 0 calc(${100 / cardsPerView}% - ${(20 * (cardsPerView - 1)) / cardsPerView}px)`,
                      minWidth: '280px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 6px 20px rgba(0,0,0,0.08)',
                      border: isDark ? '1px solid #1e2e4a' : '1px solid rgba(226, 232, 240, 0.95)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                      cursor: 'pointer',
                      /* Brightened Vivid Scheme Background with Crisp Contrast */
                      background: isDark
                        ? `linear-gradient(180deg, rgba(13, 22, 42, 0.76) 0%, rgba(10, 18, 36, 0.88) 50%, rgba(7, 13, 25, 0.96) 100%), url("${scheme.bgImage || '/images/india_gate_hero.jpg'}") center center / cover no-repeat`
                        : `linear-gradient(180deg, rgba(255, 255, 255, 0.68) 0%, rgba(255, 255, 255, 0.78) 45%, rgba(255, 255, 255, 0.92) 100%), url("${scheme.bgImage || '/images/india_gate_hero.jpg'}") center center / cover no-repeat`,
                      backdropFilter: 'blur(3px)',
                      padding: '24px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = isDark ? '0 14px 32px rgba(0,0,0,0.7)' : '0 14px 30px rgba(0,0,0,0.14)';
                      e.currentTarget.style.borderColor = isDark ? '#38bdf8' : '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 6px 20px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = isDark ? '#1e2e4a' : 'rgba(226, 232, 240, 0.95)';
                    }}
                  >
                    <div>
                      {/* Top Header Strip: Category Badge + Official Portal */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <span style={{
                          backgroundColor: isDark ? 'rgba(30, 46, 74, 0.95)' : 'rgba(241, 245, 249, 0.95)',
                          color: isDark ? '#38bdf8' : '#0f4c81',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          border: isDark ? '1px solid #243755' : '1px solid #cbd5e1'
                        }}>
                          {categoryLabel}
                        </span>

                        <a
                          href={scheme.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '11px',
                            color: isDark ? '#60a5fa' : '#1d4ed8',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                          title={`Open ${scheme.name} Official Portal`}
                        >
                          {t('officialPortal')} ↗
                        </a>
                      </div>

                      {/* Scheme Name & Ministry */}
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        color: isDark ? '#ffffff' : '#0f172a',
                        margin: '0 0 4px',
                        lineHeight: 1.3,
                        textShadow: isDark ? '0 2px 6px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255,255,255,0.8)'
                      }}>
                        {name}
                      </h3>
                      <div style={{
                        fontSize: '12px',
                        color: isDark ? '#93c5fd' : '#0f4c81',
                        fontWeight: 700,
                        marginBottom: '10px'
                      }}>
                        {ministry}
                      </div>

                      {/* Description with High-Contrast Typography */}
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#e2e8f0' : '#1e293b',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        margin: '0 0 16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textShadow: isDark ? '0 1px 4px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.6)'
                      }}>
                        {description}
                      </p>

                      {/* Target & Budget Info Chips */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                        <div style={{
                          fontSize: '12px',
                          backgroundColor: isDark ? 'rgba(17, 28, 51, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                          border: isDark ? '1px solid #1e2e4a' : '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          color: isDark ? '#f1f5f9' : '#0f172a'
                        }}>
                          <strong style={{ color: isDark ? '#38bdf8' : '#0f4c81' }}>{t('targetCohort')}:</strong> {targetCohort}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          backgroundColor: isDark ? 'rgba(17, 28, 51, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                          border: isDark ? '1px solid #1e2e4a' : '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          color: isDark ? '#f1f5f9' : '#0f172a'
                        }}>
                          <strong style={{ color: isDark ? '#38bdf8' : '#0f4c81' }}>{t('budget')}:</strong> {budget}
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Simulate & Edit Scheme in Analyzer */}
                    <button
                      onClick={() => handleSimulate(scheme.id)}
                      style={{
                        width: '100%',
                        backgroundColor: isDark ? '#1e2e4a' : '#0c2340',
                        color: '#ffffff',
                        border: isDark ? '1px solid #38bdf8' : 'none',
                        borderRadius: '8px',
                        padding: '11px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#0284c7' : '#1e3a8a';
                        e.currentTarget.style.borderColor = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#1e2e4a' : '#0c2340';
                        e.currentTarget.style.borderColor = isDark ? '#38bdf8' : 'none';
                      }}
                    >
                      <span>⚙️</span> {t('simulateBtn')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Round Navigation Arrow Button */}
          <button
            onClick={handleNext}
            title="Next Scheme"
            style={{
              position: 'absolute',
              right: '-14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              border: isDark ? '1.5px solid #243755' : '1.5px solid #e2e8f0',
              boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.5)' : '0 6px 18px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 20,
              color: '#E31E2E',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E31E2E';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#111c33' : '#ffffff';
              e.currentTarget.style.color = '#E31E2E';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* ── Carousel Indicator Dots ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          marginTop: '26px'
        }}>
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '26px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentIndex === idx ? '#E31E2E' : (isDark ? '#243755' : '#cbd5e1'),
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* ── "View All" Reset Button ── */}
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setCurrentIndex(0);
            }}
            style={{
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '8px 24px',
              fontSize: '13px',
              fontWeight: 700,
              color: isDark ? '#f1f5f9' : '#334155',
              cursor: 'pointer',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#1e2e4a' : '#f8fafc';
              e.currentTarget.style.borderColor = isDark ? '#38bdf8' : '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#111c33' : '#ffffff';
              e.currentTarget.style.borderColor = isDark ? '#1e2e4a' : '#cbd5e1';
            }}
          >
            {t('viewAll')}
          </button>
        </div>

      </div>
    </section>
  );
}
