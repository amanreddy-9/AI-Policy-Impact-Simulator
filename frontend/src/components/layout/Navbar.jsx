import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{
      backgroundColor: 'var(--clr-navy-dark)',
      borderBottom: '3px solid var(--clr-saffron)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'stretch',
        overflowX: 'auto',
        gap: '2px'
      }}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-btn ${isActive && !location.hash ? 'active' : ''}`}
        >
          🏠 National Portal Home
        </NavLink>

        <NavLink
          to="/#national-schemes"
          className="nav-btn"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              handleScrollTo('national-schemes');
            }
          }}
        >
          📋 Schemes Directory (india.gov.in/schemes)
        </NavLink>

        <NavLink
          to="/simulator"
          className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
        >
          ⚙️ Policy Maker &amp; Scheme Analyzer
          <span className="badge" style={{
            backgroundColor: 'var(--clr-saffron)',
            color: '#fff',
            fontSize: '10px',
            padding: '2px 7px',
            marginLeft: '4px'
          }}>
            AI Tool
          </span>
        </NavLink>

        <NavLink
          to="/#architecture"
          className="nav-btn"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              handleScrollTo('architecture');
            }
          }}
        >
          🔬 4-Layer Causal-RL Architecture
        </NavLink>
      </div>
    </nav>
  );
}
