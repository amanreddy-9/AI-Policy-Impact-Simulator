import React, { useState } from 'react';
import { INDIA_STATES } from '../../data/statesData';
import StateImplementationModal from './StateImplementationModal';

export default function StateGridMap({
  effectivenessScore = 78.5,
  levers = {},
  baselineBudget = 94808,
  proposedBudget = 94808,
  netChange = 0,
  pctChange = 0,
  policyName = "Custom Policy Initiative",
  sectorName = "Welfare & Economic Development",
  isDark = true
}) {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedState, setSelectedState] = useState(null);

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        padding: '6px 10px',
        borderRadius: '8px',
        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
        fontSize: '11px',
        color: isDark ? '#94a3b8' : '#475569'
      }}>
        <span>👆 <strong>Click any state card</strong> to open the Grok AI Implementation & Fiscal Capacity Window</span>
        <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>28 States + UTs Live</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '6px',
        padding: '4px 0'
      }}>
        {INDIA_STATES.map((st) => {
          const simulatedGain = (12.0 * effMultiplier * (st.baselinePoverty / 15.0)).toFixed(1);
          const isHigh = parseFloat(simulatedGain) >= 15.0;

          return (
            <div
              key={st.id}
              onClick={() => setSelectedState({ ...st, simulatedGain })}
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
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.2)';
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
      {hoveredState && !selectedState && (
        <div style={{
          position: 'fixed',
          left: `${tooltipPos.x}px`,
          top: `${tooltipPos.y}px`,
          pointerEvents: 'none',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          lineHeight: 1.45,
          zIndex: 99999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.2)',
          minWidth: '220px'
        }}>
          <div style={{ fontWeight: 800, fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '4px', marginBottom: '6px', color: '#60a5fa' }}>
            {hoveredState.name} ({hoveredState.region})
          </div>
          <div>Population: <strong>{hoveredState.pop}M</strong></div>
          {hoveredState.sdg_score_2024 && (
            <div>SDG 2024 Score: <strong style={{ color: '#38bdf8' }}>{hoveredState.sdg_score_2024}</strong> ({hoveredState.sdg_category})</div>
          )}
          {hoveredState.gsdp_2024_25_be_cr && (
            <div>GSDP (24-25 BE): <strong>₹{(hoveredState.gsdp_2024_25_be_cr / 100000).toFixed(2)}L Cr</strong></div>
          )}
          {hoveredState.total_debt_2024_cr && (
            <div>Total Debt (2024): <strong style={{ color: '#f87171' }}>₹{hoveredState.total_debt_2024_cr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr</strong></div>
          )}
          {hoveredState.debt_to_gsdp_pct && (
            <div>Debt-to-GSDP: <strong>{hoveredState.debt_to_gsdp_pct}%</strong></div>
          )}
          <div>Baseline Poverty: <strong>{hoveredState.baselinePoverty}%</strong></div>
          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.15)', color: '#38bdf8', fontSize: '10.5px' }}>
            🖱️ <em>Click card to open Grok implementation dossier</em>
          </div>
        </div>
      )}

      {/* State Implementation Window Modal */}
      {selectedState && (
        <StateImplementationModal
          isOpen={!!selectedState}
          onClose={() => setSelectedState(null)}
          stateData={selectedState}
          currentLevers={levers}
          baselineBudget={baselineBudget}
          proposedBudget={proposedBudget}
          netChange={netChange}
          pctChange={pctChange}
          policyName={policyName}
          sectorName={sectorName}
          isDark={isDark}
        />
      )}
    </div>
  );
}
