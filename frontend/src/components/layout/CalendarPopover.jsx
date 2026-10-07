import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function CalendarPopover({ isOpen, onClose }) {
  const { language } = useApp();
  const [selectedDate, setSelectedDate] = useState(6); // Default 6 October 2026
  const [hoveredDate, setHoveredDate] = useState(null);

  if (!isOpen) return null;

  const daysOfWeek = language === 'hi'
    ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
    : language === 'ta'
    ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const prevDays = [27, 28, 29, 30];
  const octDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const nextDays = [1, 2, 3, 4, 5, 6, 7];

  const holidays = [
    {
      date: 2,
      name: language === 'hi' ? 'महात्मा गांधी जयंती' : language === 'ta' ? 'மகாத்மா காந்தி ஜெயந்தி' : 'Mahatma Gandhi Jayanti',
      type: language === 'hi' ? 'राजपत्रित अवकाश' : language === 'ta' ? 'அரசு விடுமுறை' : 'Gazetted Holiday'
    },
    {
      date: 8,
      name: language === 'hi' ? 'वायु सेना दिवस' : language === 'ta' ? 'விமானப்படை தினம்' : 'Air Force Day',
      type: language === 'hi' ? 'समारोह' : language === 'ta' ? 'கொண்டாட்டம்' : 'Observance'
    },
    {
      date: 20,
      name: language === 'hi' ? 'महानवमी / दशहरा' : language === 'ta' ? 'மகா நவமி / தசரா' : 'Maha Navami / Dussehra',
      type: language === 'hi' ? 'राजपत्रित अवकाश' : language === 'ta' ? 'அரசு விடுமுறை' : 'Gazetted Holiday'
    },
    {
      date: 21,
      name: language === 'hi' ? 'विजयादशमी' : language === 'ta' ? 'விஜயதசமி' : 'Vijaya Dashami',
      type: language === 'hi' ? 'राजपत्रित अवकाश' : language === 'ta' ? 'அரசு விடுமுறை' : 'Gazetted Holiday'
    },
    {
      date: 31,
      name: language === 'hi' ? 'राष्ट्रीय एकता दिवस' : language === 'ta' ? 'தேசிய ஒற்றுமை தினம்' : 'National Unity Day (Rashtriya Ekta Diwas)',
      type: language === 'hi' ? 'समारोह' : language === 'ta' ? 'கொண்டாட்டம்' : 'Observance'
    }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '48px',
        right: '0',
        zIndex: 10000,
        width: '320px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
        border: '1px solid #cbd5e1',
        padding: '16px',
        color: '#1e293b'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0c2340' }}>
            {language === 'hi' ? 'अक्टूबर 2026' : language === 'ta' ? 'அக்டோபர் 2026' : 'October 2026'}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px', fontWeight: 600 }}>
            {language === 'hi' ? '(भारत सरकार)' : language === 'ta' ? '(இந்திய அரசு)' : '(Govt of India)'}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
          title="Close Calendar"
        >
          ✕
        </button>
      </div>

      {/* Week Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
        {daysOfWeek.map((d, i) => (
          <div
            key={d}
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: i === 0 ? '#dc2626' : '#2B6FA8',
              backgroundColor: '#f1f5f9',
              padding: '4px 0',
              borderRadius: '4px'
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {/* Previous Month Days */}
        {prevDays.map(d => (
          <div
            key={`prev-${d}`}
            style={{
              padding: '6px 0',
              fontSize: '11px',
              color: '#94a3b8',
              backgroundColor: '#f8fafc',
              borderRadius: '4px'
            }}
          >
            {d}
          </div>
        ))}

        {/* Current Month (October) Days */}
        {octDays.map(d => {
          const isSelected = selectedDate === d;
          const isHovered = hoveredDate === d;
          const isToday = d === 6;
          const isHoliday = holidays.some(h => h.date === d);

          return (
            <div
              key={d}
              onClick={() => setSelectedDate(d)}
              onMouseEnter={() => setHoveredDate(d)}
              onMouseLeave={() => setHoveredDate(null)}
              style={{
                padding: '6px 0',
                fontSize: '12px',
                fontWeight: isSelected || isToday ? 800 : 600,
                color: isSelected ? '#ffffff' : isHoliday ? '#b91c1c' : '#1e293b',
                backgroundColor: isSelected
                  ? '#2B6FA8'
                  : isHovered
                  ? '#e0f2fe'
                  : isToday
                  ? '#fef3c7'
                  : '#ffffff',
                border: isToday ? '1.5px solid #f59e0b' : isHoliday ? '1px solid #fca5a5' : '1px solid #f1f5f9',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              title={isHoliday ? holidays.find(h => h.date === d)?.name : `${d} October 2026`}
            >
              {d}
              {isHoliday && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626'
                }} />
              )}
            </div>
          );
        })}

        {/* Next Month Days */}
        {nextDays.map(d => (
          <div
            key={`next-${d}`}
            style={{
              padding: '6px 0',
              fontSize: '11px',
              color: '#94a3b8',
              backgroundColor: '#f8fafc',
              borderRadius: '4px'
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Selected Date & Holidays List */}
      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '11px' }}>
        <div style={{ fontWeight: 700, color: '#0c2340', marginBottom: '4px' }}>
          {language === 'hi' ? 'चयनित तिथि:' : language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட தேதி:' : 'Selected:'}{' '}
          <strong>{selectedDate} {language === 'hi' ? 'अक्टूबर 2026' : language === 'ta' ? 'அக்டோபர் 2026' : 'October 2026'}</strong>
        </div>
        {holidays.find(h => h.date === selectedDate) ? (
          <div style={{ color: '#dc2626', fontWeight: 600 }}>
            🎉 {holidays.find(h => h.date === selectedDate)?.name} ({holidays.find(h => h.date === selectedDate)?.type})
          </div>
        ) : (
          <div style={{ color: '#64748b' }}>
            {language === 'hi'
              ? 'आधिकारिक कार्य दिवस · भारत सरकार के प्रशासनिक कार्यालय खुले हैं'
              : language === 'ta'
              ? 'அலுவலக வேலை நாள் · அரசு நிர்வாக அலுவலகங்கள் திறக்கப்பட்டுள்ளன'
              : 'Official Working Day · Government Central Administrative Offices Open'}
          </div>
        )}
      </div>
    </div>
  );
}
