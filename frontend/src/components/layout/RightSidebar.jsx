import React, { useState } from 'react';

export default function RightSidebar() {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const items = [
    {
      id: 'feedback',
      title: 'Translation Feedback',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M12 8v3m0 3v.01"></path>
        </svg>
      ),
      action: () => alert('Translation Feedback: Citizen language feedback system (Bhashini AI / Anuvadak).')
    },
    {
      id: 'cpgrams',
      title: 'CPGRAMS Grievance Portal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      link: 'https://pgportal.gov.in/'
    },
    {
      id: 'calendar',
      title: 'Government Calendar & Holidays',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      action: () => alert('Government of India Gazetted & Restricted Holidays Calendar 2026.')
    },
    {
      id: 'share',
      title: 'Share Portal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      ),
      action: () => {
        if (navigator.share) {
          navigator.share({ title: 'National Portal of India', url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert('Portal URL copied to clipboard!');
        }
      }
    },
    {
      id: 'color',
      title: 'Theme & Contrast Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor"></path>
        </svg>
      ),
      action: () => alert('Accessibility Settings: GIGW 3.0 Standard Contrast Mode Active.')
    }
  ];

  return (
    <aside style={{
      position: 'fixed',
      right: 0,
      top: '55%',
      transform: 'translateY(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))'
    }}>
      {items.map((item) => {
        const isHovered = activeTooltip === item.id;
        const btnContent = (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRight: 'none',
              padding: '10px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: isHovered ? 'translateX(-8px)' : 'translateX(0)',
              backgroundColor: isHovered ? '#1e293b' : '#0f172a'
            }}
            onMouseEnter={() => setActiveTooltip(item.id)}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={item.action}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </div>
            {isHovered && (
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                marginLeft: '8px',
                whiteSpace: 'nowrap',
                color: '#ffb74d'
              }}>
                {item.title}
              </span>
            )}
          </div>
        );

        if (item.link) {
          return (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              {btnContent}
            </a>
          );
        }

        return <div key={item.id}>{btnContent}</div>;
      })}
    </aside>
  );
}
