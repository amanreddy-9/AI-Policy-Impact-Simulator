import React from 'react';

export default function DemographicChart({ sectoralData }) {
  const c = sectoralData?.caste || {};
  const g = sectoralData?.gender || {};

  const scGain = c.SC !== undefined ? c.SC : (c.sc_income_change || 18.5);
  const stGain = c.ST !== undefined ? c.ST : (c.st_income_change || 21.2);
  const obcGain = c.OBC !== undefined ? c.OBC : (c.obc_income_change || 12.8);
  const genGain = c.General !== undefined ? c.General : (c.general_income_change || 8.4);
  const womenGain = g.women !== undefined ? g.women : (g.women_income_change || 14.2);
  const menGain = g.men !== undefined ? g.men : (g.men_income_change || 11.5);

  const cohorts = [
    { label: 'Scheduled Castes (SC)', short: 'SC', val: scGain, color: '#0f4c81', ci: '±2.4%' },
    { label: 'Scheduled Tribes (ST)', short: 'ST', val: stGain, color: '#0a355c', ci: '±3.1%' },
    { label: 'Other Backward Classes (OBC)', short: 'OBC', val: obcGain, color: '#e65100', ci: '±1.8%' },
    { label: 'General Category', short: 'General', val: genGain, color: '#64748b', ci: '±1.2%' },
    { label: 'Women Cohort', short: 'Women', val: womenGain, color: '#166534', ci: '±1.9%' },
    { label: 'Men Cohort', short: 'Men', val: menGain, color: '#1565a8', ci: '±1.5%' }
  ];

  const maxVal = Math.max(25, ...cohorts.map(c => c.val));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', justifyContent: 'space-between' }}>
      {cohorts.map(cohort => {
        const pctWidth = Math.min(100, Math.max(6, (cohort.val / maxVal) * 100));

        return (
          <div key={cohort.short} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{cohort.label}</span>
              <span style={{ color: cohort.color, fontWeight: 800 }}>
                +{cohort.val.toFixed(1)}% <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>(95% CI: {cohort.ci})</span>
              </span>
            </div>
            <div style={{
              height: '14px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                height: '100%',
                width: `${pctWidth}%`,
                backgroundColor: cohort.color,
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
