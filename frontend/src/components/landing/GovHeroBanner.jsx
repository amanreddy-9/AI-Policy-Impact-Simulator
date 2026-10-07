import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SCHEMES } from '../../data/schemesData';
import CalendarPopover from '../layout/CalendarPopover';
import MegaMenu from '../layout/MegaMenu';

export default function GovHeroBanner() {
  const navigate = useNavigate();
  const { language, toggleLanguage, theme, toggleTheme, t } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  // Key government schemes to show in hero banner pills
  const trendingSchemes = SCHEMES.slice(0, 6);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const target = document.getElementById('national-schemes');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSchemeClick = (schemeId) => {
    navigate(`/simulator?scheme=${schemeId}`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#071026' }}>

      {/* ── Background: Light Mode uses lightmodebg.png, Dark Mode uses night hero with reduced gradient ── */}
      <div style={{
        position: 'relative',
        background: isDark
          ? `
            linear-gradient(180deg, rgba(5, 10, 24, 0.35) 0%, rgba(8, 16, 38, 0.45) 50%, rgba(5, 10, 24, 0.80) 100%),
            url("/images/india_gate_hero.jpg") center center / cover no-repeat
          `
          : `
            linear-gradient(180deg, rgba(6, 18, 45, 0.32) 0%, rgba(6, 18, 45, 0.15) 45%, rgba(5, 15, 38, 0.52) 100%),
            url("/images/lightmodebg.png") center 30% / cover no-repeat
          `,
        minHeight: '560px',
        color: '#ffffff',
        padding: '18px 0 110px',
        boxShadow: isDark ? 'inset 0 -40px 60px rgba(5,10,24,0.85)' : 'inset 0 -40px 60px rgba(5,15,38,0.5)',
        transition: 'background 0.3s ease'
      }}>

        {/* ── Top Header Strip ── */}
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '24px'
        }}>

          {/* Top Left: Increased Prominent Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a
              href="https://www.india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              title="Government of India Official Portal"
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <img
                src="/images/govt_logo.png"
                alt="Government of India Logo"
                style={{
                  height: '62px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.6))'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </a>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.4px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {t('bharatSarkar')}
              </span>
              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {t('govIndia')}
              </span>
            </div>
          </div>

          {/* Top Right: Interactive Utility Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '13px',
            color: '#ffffff',
            position: 'relative'
          }}>

            {/* 1. Skip to Content */}
            <button
              title="Skip to Main Content"
              onClick={() => {
                const el = document.getElementById('content');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 15, 45, 0.45)',
                border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(6px)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px 9px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
              </svg>
            </button>

            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>

            {/* 2. Interactive Calendar Popover Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                title="Government Calendar & Holidays"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                style={{
                  background: isCalendarOpen
                    ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0, 15, 45, 0.75)')
                    : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 15, 45, 0.45)'),
                  border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(6px)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '7px 9px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>

              {/* Popover Calendar */}
              <CalendarPopover isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
            </div>

            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>

            {/* 3. Sun / Moon Dark-Light Mode Toggle Button */}
            <button
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              onClick={toggleTheme}
              style={{
                background: theme === 'dark' ? '#f59e0b' : 'rgba(0, 15, 45, 0.45)',
                border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(6px)',
                color: theme === 'dark' ? '#000000' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px 9px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {theme === 'light' ? (
                /* Moon Icon for Dark Mode */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                /* Sun Icon for Light Mode */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>

            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>

            {/* 4. Language Cycling Button (English -> Hindi -> Tamil -> English) */}
            <button
              title="Change Language: English ➔ हिन्दी ➔ தமிழ்"
              onClick={toggleLanguage}
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 15, 45, 0.45)',
                border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(6px)',
                color: '#ffb74d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{language === 'en' ? 'हिन्दी' : language === 'hi' ? 'தமிழ்' : 'English'}</span>
            </button>

            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>

            {/* 5. Tricolor Hamburger Menu */}
            <button
              title="National Portal Mega Menu"
              onClick={() => setIsMenuOpen(true)}
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 15, 45, 0.45)',
                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(6px)',
                borderRadius: '8px',
                padding: '7px 11px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '32px',
                width: '42px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ width: '100%', height: '3.5px', backgroundColor: '#F15B25', borderRadius: '2px' }} />
              <span style={{ width: '100%', height: '3.5px', backgroundColor: '#FFFFFF', borderRadius: '2px' }} />
              <span style={{ width: '100%', height: '3.5px', backgroundColor: '#046A38', borderRadius: '2px' }} />
            </button>

            {/* Mega Menu Drawer */}
            <MegaMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          </div>
        </div>

        {/* ── Center Branding & Typography ── */}
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '16px'
        }}>

          {/* Emblem Logo and Satyameva Jayate Script Image Lockup */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
            <img
              src="/images/firefly.png"
              alt="State Emblem of India"
              style={{
                height: '115px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.85)) brightness(1.15)',
                marginBottom: '0px'
              }}
              onError={(e) => {
                e.currentTarget.src = "/images/emblem.png";
              }}
            />
            <img
              src="/images/satyamev_script.png"
              alt="Satyameva Jayate"
              style={{
                height: '32px',
                width: 'auto',
                objectFit: 'contain',
                marginTop: '-2px',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8)) brightness(1.15)'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* india.gov.in translates to bharat.gov.in (in Hindi and Tamil script) when toggled */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(42px, 6.5vw, 70px)',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'baseline',
              gap: '2px',
              textShadow: '0 4px 18px rgba(0,0,0,0.75)',
              margin: '0 0 6px'
            }}>
              {language === 'en' ? (
                <>india<span style={{ color: '#ff9800' }}>.</span>gov<span style={{ color: '#ff9800' }}>.</span>in</>
              ) : language === 'hi' ? (
                <>bharat<span style={{ color: '#ff9800' }}>.</span>gov<span style={{ color: '#ff9800' }}>.</span>in</>
              ) : (
                <>bharat<span style={{ color: '#ff9800' }}>.</span>gov<span style={{ color: '#ff9800' }}>.</span>in</>
              )}
            </h1>

            {/* Native Script Translation Display (भारत.सरकार.इन / பாரதம்.அரசு.இன்) */}
            {language !== 'en' && (
              <div style={{
                fontSize: 'clamp(20px, 3.2vw, 30px)',
                fontWeight: 800,
                color: '#ffb74d',
                letterSpacing: '0.5px',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                marginBottom: '8px'
              }}>
                ({t('portalTitleScript')})
              </div>
            )}
          </div>

          {/* National Portal of India Badge */}
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            color: '#0f172a',
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            padding: '4px 22px',
            borderRadius: '24px',
            marginTop: '8px',
            borderBottom: '3.5px solid #F15B25',
            boxShadow: '0 4px 18px rgba(0,0,0,0.35)'
          }}>
            {t('nationalPortal')}
          </div>

          <p style={{
            fontSize: 'clamp(15px, 2.2vw, 22px)',
            color: 'rgba(255,255,255,0.95)',
            marginTop: '14px',
            fontWeight: 500,
            textShadow: '0 2px 8px rgba(0,0,0,0.7)'
          }}>
            {t('tagline')}
          </p>

          {/* ── Search Bar ── */}
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              width: '100%',
              maxWidth: '860px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
              marginTop: '26px',
              border: isDark ? '1px solid #1e2e4a' : 'none'
            }}
          >
            {/* Search Icon */}
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '18px', color: '#94a3b8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Text Input */}
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '16px 18px',
                fontSize: '16px',
                color: isDark ? '#ffffff' : '#1e293b',
                backgroundColor: 'transparent',
                fontFamily: 'inherit'
              }}
            />

            {/* All Categories Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                border: 'none',
                borderLeft: isDark ? '1.5px solid #1e2e4a' : '1.5px solid #e2e8f0',
                outline: 'none',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#e2e8f0' : '#475569',
                backgroundColor: isDark ? '#0d1527' : '#f8fafc',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="All Categories">{t('allCategories')}</option>
              <option value="schemes">{language === 'hi' ? 'योजनाएं एवं कल्याण' : language === 'ta' ? 'திட்டங்கள் & நலன்' : 'Schemes & Welfare'}</option>
              <option value="acts">{language === 'hi' ? 'अधिनियम एवं नियम' : language === 'ta' ? 'சட்டங்கள் & விதிகள்' : 'Acts & Rules'}</option>
              <option value="citizenengagements">{language === 'hi' ? 'नागरिक सहभागिता' : language === 'ta' ? 'குடிமக்கள் ஈடுபாடு' : 'Citizen Engagements'}</option>
              <option value="directory">{language === 'hi' ? 'सरकारी निर्देशिका' : language === 'ta' ? 'அரசு அடைவு' : 'Directory'}</option>
              <option value="governmentdatasets">{language === 'hi' ? 'सरकारी डेटासेट' : language === 'ta' ? 'அரசு தரவுத்தொகுப்புகள்' : 'Government Datasets'}</option>
              <option value="services">{language === 'hi' ? 'ऑनलाइन सेवाएं' : language === 'ta' ? 'ஆன்லைன் சேவைகள்' : 'Online Services'}</option>
            </select>

            {/* Bright Red Search Button */}
            <button
              type="submit"
              style={{
                backgroundColor: '#E31E2E',
                color: '#ffffff',
                border: 'none',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c30112'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E31E2E'; }}
            >
              {t('searchButton')}
            </button>
          </form>

          {/* ── Key Government Schemes Pills ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '22px',
            fontSize: '13px',
            color: '#ffffff'
          }}>
            <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
              {t('trendingSchemesLabel')}
            </span>
            {trendingSchemes.map((scheme) => {
              const label = scheme[`name_${language}`] || scheme.name;
              return (
                <button
                  key={scheme.id}
                  onClick={() => handleSchemeClick(scheme.id)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: '#ffffff',
                    padding: '5px 14px',
                    borderRadius: '18px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.32)';
                    e.currentTarget.style.borderColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Floating Prime Minister Quote Lockup ── */}
      <div id="content" className="container" style={{ position: 'relative', marginTop: '-55px', zIndex: 10 }}>
        <div style={{
          backgroundColor: isDark ? '#111c33' : '#ffffff',
          borderRadius: '14px',
          boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.14)',
          border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
          padding: '16px 24px 16px 20px',
          maxWidth: '920px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          transition: 'background-color 0.25s ease'
        }}>
          {/* PM Avatar with circle frame */}
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: isDark ? '3px solid #1e2e4a' : '3px solid #ffffff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            flexShrink: 0,
            backgroundColor: '#0c1527',
            marginTop: '-25px'
          }}>
            <img
              src="/images/pm_photo.jpg"
              alt="Hon'ble Prime Minister of India"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 15%'
              }}
              onError={(e) => {
                e.currentTarget.src = "https://static2.india.gov.in/npiprod/uploads/homepage_pm_1d70759837.jpg";
              }}
            />
          </div>

          {/* Quote Body */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '26px', lineHeight: 1, color: '#E31E2E', fontWeight: 900 }}>“</span>
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#f1f5f9' : '#334155',
                lineHeight: 1.55,
                margin: 0
              }}>
                {t('pmQuote')}
              </p>
              <span style={{ fontSize: '26px', lineHeight: 1, color: '#E31E2E', fontWeight: 900, alignSelf: 'flex-end' }}>”</span>
            </div>

            <div style={{ width: '40px', height: '2px', backgroundColor: '#E31E2E', margin: '8px 0 6px 14px' }} />

            <div style={{ paddingLeft: '14px' }}>
              <a
                href="https://www.pmindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#38bdf8' : '#1e293b', textDecoration: 'none' }}
              >
                {t('pmAttribution')}
              </a>
              <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginLeft: '6px' }}>
                · {t('pmDate')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6 Top Bar Quick Service Counters ── */}
      <div className="container" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px',
          backgroundColor: isDark ? '#111c33' : '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)',
          border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
          transition: 'background-color 0.25s ease'
        }}>
          {/* Item 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px' }}>
            <div style={{ fontSize: '28px' }}>💻</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1 }}>13,994</div>
              <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                {t('servicesCount')}
              </div>
            </div>
          </div>

          {/* Item 2 - Clickable to Scheme Simulator */}
          <div
            onClick={() => navigate('/simulator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px',
              cursor: 'pointer',
              borderRadius: '6px',
              backgroundColor: isDark ? '#1e2e4a' : '#eff6ff',
              border: isDark ? '1.5px solid #38bdf8' : '1.5px solid #93c5fd',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            title="Launch Policy & Scheme Simulator Workspace"
          >
            <div style={{ fontSize: '28px' }}>📋</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#38bdf8' : '#1d4ed8', lineHeight: 1 }}>5,731</div>
              <div style={{ fontSize: '11px', color: isDark ? '#38bdf8' : '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                {t('schemesCount')} ⚙️
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px' }}>
            <div style={{ fontSize: '28px' }}>🤝</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1 }}>2,356</div>
              <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                {t('citizenCount')}
              </div>
            </div>
          </div>

          {/* Item 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px' }}>
            <div style={{ fontSize: '28px' }}>🏛️</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1 }}>4,004</div>
              <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                {t('placesCount')}
              </div>
            </div>
          </div>

          {/* Item 5 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px' }}>
            <div style={{ fontSize: '28px' }}>🏷️</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1 }}>1,207</div>
              <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                {t('odopCount')}
              </div>
            </div>
          </div>

          {/* Item 6 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px' }}>
            <div style={{ fontSize: '28px' }}>📑</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1 }}>18</div>
              <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                {t('categoriesCount')}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
