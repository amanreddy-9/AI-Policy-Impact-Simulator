import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setBackendStatus('online');
        else setBackendStatus('offline');
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  return (
    <header style={{
      backgroundColor: 'var(--bg-white)',
      borderBottom: '1px solid var(--border)',
      padding: '14px 0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          {/* State Emblem Lion Capital representation */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f4c81, #002b49)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(15,76,129,0.25)'
          }}>
            🏛️
          </div>
          <div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--clr-navy-dark)',
              letterSpacing: '-0.4px',
              lineHeight: 1.15
            }}>
              National Portal of India — PolicySim AI
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '2px',
              fontWeight: 500
            }}>
              Unified Public Policy Impact Simulator &amp; Welfare Optimization Engine
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--clr-saffron)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginTop: '1px'
            }}>
              NITI Aayog &amp; Ministry of Statistics (MoSPI) Alignment
            </div>
          </div>
        </Link>

        {/* Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: backendStatus === 'online' ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${backendStatus === 'online' ? '#bbf7d0' : '#fde68a'}`,
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          color: backendStatus === 'online' ? '#166534' : '#92400e',
          whiteSpace: 'nowrap'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: backendStatus === 'online' ? '#22c55e' : '#f59e0b',
            boxShadow: backendStatus === 'online' ? '0 0 8px #22c55e' : 'none'
          }} />
          <span>
            {backendStatus === 'online' ? 'FastAPI Engine — Connected' : 'Analytical Engine Ready'}
          </span>
        </div>
      </div>
    </header>
  );
}
