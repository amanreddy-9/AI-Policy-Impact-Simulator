import React, { useState } from 'react';
import { INDIA_STATES } from '../../data/statesData';

export default function StateGridMap({ effectivenessScore = 78.5 }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const effMultiplier = effectivenessScore / 78.5;

  const handleMouseMove = (e, st) => {
    setHoveredState(st);
    setTooltipPos({
      x: e.clientX + 14,
      y: e.clientY + 14
    });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '6px',
        padding: '8px 0'
      }}>
        {INDIA_STATES.map((st) => {
          const simulatedGain = (12.0 * effMultiplier * (st.baselinePoverty / 15.0)).toFixed(1);
          const isHigh = parseFloat(simulatedGain) >= 15.0;

          return (
            <div
              key={st.id}
              onMouseMove={(e) => handleMouseMove(e, { ...st, simulatedGain })}
              onMouseLeave={handleMouseLeave}
              style={{
                aspectRatio: '1',
                borderRadius: '6px',
                backgroundColor: isHigh ? '#dcfce7' : '#e0f2fe',
                border: `1px solid ${isHigh ? '#86efac' : '#93c5fd'}`,
                color: isHigh ? '#166534' : '#0369a1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '2px',
                textAlign: 'center',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
                e.currentTarget.style.zIndex = '5';
              }}
              onMouseLeaveBack={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.zIndex = '1';
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1 }}>{st.abbr}</span>
              <span style={{ fontSize: '9px', marginTop: '2px', fontWeight: 600 }}>+{simulatedGain}%</span>
            </div>
          );
        })}
      </div>

      {/* Hover Floating Tooltip */}
      {hoveredState && (
        <div style={{
          position: 'fixed',
          left: `${tooltipPos.x}px`,
          top: `${tooltipPos.y}px`,
          pointerEvents: 'none',
          backgroundColor: 'var(--clr-strip)',
          color: '#ffffff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: 1.4,
          zIndex: 99999,
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <strong>{hoveredState.name}</strong> ({hoveredState.region})<br />
          Population: <strong>{hoveredState.pop}M</strong><br />
          Baseline HDI: <strong>{hoveredState.baselineHdi}</strong><br />
          Baseline Poverty: <strong>{hoveredState.baselinePoverty}%</strong><br />
          Projected Real Income Gain: <strong style={{ color: '#4ade80' }}>+{hoveredState.simulatedGain}%</strong>
        </div>
      )}
    </div>
  );
}
