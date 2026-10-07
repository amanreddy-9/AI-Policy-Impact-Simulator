import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SCHEMES } from '../data/schemesData';
import StateGridMap from '../components/simulator/StateGridMap';
import DemographicChart from '../components/simulator/DemographicChart';
import EvidencePipelinePanel from '../components/simulator/EvidencePipelinePanel';
import { useApp } from '../context/AppContext';

export default function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const schemeParam = searchParams.get('scheme');
  const { language, theme, t } = useApp();
  const isDark = theme === 'dark';

  /* ── Core State ── */
  const [mode, setMode] = useState(schemeParam ? 'existing' : 'custom');
  const [selectedSchemeId, setSelectedSchemeId] = useState(schemeParam || 'mgnrega');

  /* ── Categories State (for custom mode) ── */
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');

  /* ── Dynamic Levers ── */
  const [leverDefs, setLeverDefs] = useState([]);
  const [levers, setLevers] = useState({});
  const [loadingSliders, setLoadingSliders] = useState(false);

  /* ── Other ── */
  const [description, setDescription] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);

  /* ── Results State ── */
  const [results, setResults] = useState({
    effectiveness_score: 78.5,
    fiscal_cost_lakh_cr: 1.25,
    sustainability_score: 82.0,
    beneficiary_group: 'Small Farmers & SC/ST Families',
    sectoral: {
      gender: { women: 14.2, men: 11.5, female_participation_boost_pct: 6.8 },
      caste: { SC: 18.5, ST: 21.2, OBC: 12.8, General: 8.4 },
      children_family: {
        child_malnutrition_reduction_pct: 12.4,
        school_retention_increase_pct: 8.9,
        family_welfare_index: 76.5
      }
    },
    ai_guidance: {
      executive_verdict: "Select policy categories and configure levers, then click Analyze to generate AI-powered impact assessment.",
      fiscal_and_regional_risks: "Impact analysis will appear here after evaluation.",
      strategic_recommendations: [
        "Choose up to 3 policy categories in Custom mode",
        "Adjust lever values to model different policy scenarios",
        "Click the Analyze button to run LLM-powered evaluation"
      ]
    }
  });

  /* ── Fetch categories on mount ── */
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.categories) {
          setAllCategories(data.categories);
        }
      })
      .catch(err => console.warn('Could not fetch categories:', err));

    // Check Ollama status
    fetch('/api/status')
      .then(r => r.json())
      .then(data => setOllamaStatus(data))
      .catch(() => setOllamaStatus({ success: false }));
  }, []);

  /* ── Fetch dynamic sliders when categories change ── */
  const fetchSliders = useCallback(async (cats) => {
    if (!cats || cats.length === 0) {
      setLeverDefs([]);
      setLevers({});
      return;
    }
    setLoadingSliders(true);
    try {
      const res = await fetch('/api/policy/generate-sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: cats })
      });
      const data = await res.json();
      if (data.success && data.levers) {
        setLeverDefs(data.levers);
        const initial = {};
        data.levers.forEach(l => {
          initial[l.id] = l.defaultValue;
        });
        setLevers(initial);
      }
    } catch (err) {
      console.warn('Failed to fetch sliders:', err);
    } finally {
      setLoadingSliders(false);
    }
  }, []);

  /* ── Handle category toggle ── */
  const toggleCategory = (catId) => {
    setSelectedCategories(prev => {
      let next;
      if (prev.includes(catId)) {
        next = prev.filter(c => c !== catId);
      } else {
        if (prev.length >= 3) return prev; // Max 3
        next = [...prev, catId];
      }
      fetchSliders(next);
      return next;
    });
  };

  /* ── Handle mode changes ── */
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setEvaluationError(null);
    if (newMode === 'existing') {
      loadSchemeBaseline(selectedSchemeId);
    } else {
      setSelectedCategories([]);
      setLeverDefs([]);
      setLevers({});
      setDescription('');
    }
  };

  /* ── Load existing scheme ── */
  const loadSchemeBaseline = useCallback((schemeId) => {
    const scheme = SCHEMES.find(s => s.id === schemeId);
    if (!scheme) return;
    
    // Explicit scheme ID mappings to relevant policy categories
    const schemeSpecificCats = {
      jjm: ['water-reforms', 'sanitation-hygiene', 'rural-development'],
      mgnrega: ['rural-development', 'employment-labor', 'women-empowerment'],
      pmkisan: ['agriculture-farming', 'finance-banking', 'rural-development'],
      pmgkay: ['food-processing', 'child-welfare', 'sanitation-hygiene'],
      ayushman: ['healthcare', 'senior-citizens', 'disability-inclusion'],
      pmawasyojana: ['housing-urban-development', 'sanitation-hygiene', 'rural-development'],
      pmuy: ['women-empowerment', 'energy-power', 'environment-climate'],
      pmmy: ['loan-credit-assistance', 'finance-banking', 'employment-labor'],
      pmfby: ['crop-insurance', 'agriculture-farming', 'disaster-management'],
      pmposhan: ['education', 'child-welfare', 'food-processing']
    };

    const catMap = {
      rural: ['rural-development', 'employment-labor'],
      agriculture: ['agriculture-farming', 'crop-insurance'],
      food: ['food-processing', 'child-welfare'],
      health: ['healthcare'],
      housing: ['housing-urban-development'],
      women: ['women-empowerment', 'energy-power'],
      credit: ['loan-credit-assistance', 'finance-banking'],
      education: ['education', 'child-welfare'],
      infrastructure: ['water-reforms', 'digital-infrastructure']
    };

    const schemeCats = schemeSpecificCats[scheme.id] || catMap[scheme.category] || [scheme.category];
    setSelectedCategories(schemeCats);
    fetchSliders(schemeCats);
    
    const amend = scheme[`suggestedAmendment_${language}`] || scheme.suggestedAmendment;
    setDescription(amend);
  }, [language, fetchSliders]);

  useEffect(() => {
    if (mode === 'existing') {
      const targetScheme = schemeParam || selectedSchemeId || 'mgnrega';
      setSelectedSchemeId(targetScheme);
      loadSchemeBaseline(targetScheme);
    }
  }, [schemeParam, language, loadSchemeBaseline]);

  const handleSchemeSelectChange = (e) => {
    const schemeId = e.target.value;
    setSelectedSchemeId(schemeId);
    loadSchemeBaseline(schemeId);
  };

  const handleSliderChange = (leverId, val) => {
    setLevers(prev => ({
      ...prev,
      [leverId]: parseFloat(val)
    }));
  };

  /* ── Run LLM-Powered Evaluation ── */
  const runEvaluation = async () => {
    setIsEvaluating(true);
    setEvaluationError(null);
    const selectedSchemeObj = SCHEMES.find(s => s.id === selectedSchemeId);
    const policyName = mode === 'existing'
      ? (selectedSchemeObj ? selectedSchemeObj.fullName : 'Existing Scheme')
      : 'Custom Welfare Policy';

    try {
      const res = await fetch('/api/policy/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          policy_name: policyName,
          description: description.trim(),
          categories: selectedCategories,
          levers,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.simulation) {
          setResults({
            effectiveness_score: data.simulation.effectiveness_score || 75.0,
            fiscal_cost_lakh_cr: data.simulation.fiscal_cost_lakh_cr || 1.4,
            sustainability_score: data.simulation.sustainability_score || 72.0,
            beneficiary_group: data.simulation.beneficiary_group || 'Targeted Vulnerable Households',
            sectoral: data.simulation.sectoral || results.sectoral,
            ai_guidance: {
              executive_verdict: data.ai_guidance?.executive_verdict || "Policy evaluation completed.",
              fiscal_and_regional_risks: data.ai_guidance?.fiscal_and_regional_risks || "Standard cautions apply.",
              strategic_recommendations: data.ai_guidance?.strategic_recommendations || ["Monitor targets.", "Establish oversight."]
            }
          });
        } else if (!data.success) {
          throw new Error(data.error || 'Evaluation failed');
        }
      } else {
        throw new Error('API returned ' + res.status);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setEvaluationError(err.message || 'Failed to evaluate. Make sure Ollama is running.');
    } finally {
      setIsEvaluating(false);
    }
  };

  /* ── Optimize Levers via LLM ── */
  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/policy/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_levers: levers,
          categories: selectedCategories,
          objective: 'maximize_welfare_within_budget'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.optimal_levers) {
          // Only update levers that exist in our current definitions
          const updated = { ...levers };
          Object.entries(data.optimal_levers).forEach(([k, v]) => {
            if (updated.hasOwnProperty(k)) {
              updated[k] = v;
            }
          });
          setLevers(updated);
        }
      }
    } catch (err) {
      console.warn('Optimization failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  /* ── Filter categories for search ── */
  const filteredCategories = allCategories.filter(c => {
    const name = c[`name_${language}`] || c.name;
    return name.toLowerCase().includes(categorySearch.toLowerCase()) ||
           c.description?.toLowerCase().includes(categorySearch.toLowerCase());
  });

  return (
    <div style={{
      backgroundColor: isDark ? '#070d19' : '#f8fafc',
      paddingTop: '28px',
      paddingBottom: '60px',
      minHeight: '100vh',
      transition: 'background-color 0.25s ease'
    }}>
      <div className="container">

        {/* ── Breadcrumb & Title Bar ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px',
          backgroundColor: isDark ? '#111c33' : '#ffffff',
          padding: '16px 20px',
          borderRadius: '10px',
          border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>
              <Link to="/" style={{ color: isDark ? '#38bdf8' : '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>{t('home')}</Link>
              <span>/</span>
              <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 600 }}>{t('policyMaker')}</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
              {t('policyMaker')}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Ollama Status Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              backgroundColor: ollamaStatus?.success ? (isDark ? '#052e16' : '#dcfce7') : (isDark ? '#450a0a' : '#fef2f2'),
              color: ollamaStatus?.success ? '#16a34a' : '#dc2626',
              border: `1px solid ${ollamaStatus?.success ? '#16a34a40' : '#dc262640'}`
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: ollamaStatus?.success ? '#16a34a' : '#dc2626',
                animation: ollamaStatus?.success ? 'none' : 'pulse 2s infinite'
              }} />
              {ollamaStatus?.success ? '🤖 AI Online' : '⚠️ AI Offline'}
            </div>

            {/* Mode Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: isDark ? '#091122' : '#f1f5f9',
              padding: '4px',
              borderRadius: '8px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #cbd5e1'
            }}>
              <button
                onClick={() => handleModeChange('custom')}
                style={{
                  backgroundColor: mode === 'custom' ? (isDark ? '#38bdf8' : '#0c2340') : 'transparent',
                  color: mode === 'custom' ? (isDark ? '#000000' : '#ffffff') : (isDark ? '#94a3b8' : '#475569'),
                  border: 'none', borderRadius: '6px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                ✍️ {t('customMode')}
              </button>
              <button
                onClick={() => handleModeChange('existing')}
                style={{
                  backgroundColor: mode === 'existing' ? (isDark ? '#38bdf8' : '#0c2340') : 'transparent',
                  color: mode === 'existing' ? (isDark ? '#000000' : '#ffffff') : (isDark ? '#94a3b8' : '#475569'),
                  border: 'none', borderRadius: '6px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                🏛️ {t('existingMode')}
              </button>
              <button
                onClick={() => handleModeChange('pipeline')}
                style={{
                  backgroundColor: mode === 'pipeline' ? '#E31E2E' : 'transparent',
                  color: mode === 'pipeline' ? '#ffffff' : (isDark ? '#38bdf8' : '#1d4ed8'),
                  border: 'none', borderRadius: '6px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                🔬 Evidence Pipeline & Citations
              </button>
            </div>
          </div>
        </div>

        {/* If Pipeline Mode is Active: Render Evidence Pipeline Panel */}
        {mode === 'pipeline' ? (
          <EvidencePipelinePanel />
        ) : (
        /* ── Main Layout: 2 Columns ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 480px) 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>

          {/* ════ LEFT COLUMN ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Scheme/Category Selector */}
            <div className="card" style={{
              padding: '20px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
              boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)'
            }}>
              {mode === 'existing' ? (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '6px' }}>
                    {t('selectScheme')}
                  </label>
                  <select
                    value={selectedSchemeId}
                    onChange={handleSchemeSelectChange}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: isDark ? '1px solid #243755' : '1px solid #cbd5e1',
                      fontSize: '13.5px', fontWeight: 600,
                      color: isDark ? '#ffffff' : '#0f172a',
                      backgroundColor: isDark ? '#16243d' : '#f8fafc',
                      outline: 'none', cursor: 'pointer'
                    }}
                  >
                    {SCHEMES.map(s => {
                      const name = s[`name_${language}`] || s.name;
                      const ministry = s[`ministry_${language}`] || s.ministry;
                      return (
                        <option key={s.id} value={s.id}>
                          {name} — ({ministry})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                /* ── Custom Mode: Category Multi-Select ── */
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '6px' }}>
                    📂 {language === 'hi' ? 'नीति श्रेणियां चुनें (अधिकतम 3)' : language === 'ta' ? 'கொள்கை வகைகளைத் தேர்ந்தெடுக்கவும் (அதிகபட்சம் 3)' : 'Select Policy Categories (Max 3)'}
                  </label>

                  {/* Selected Pills */}
                  {selectedCategories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {selectedCategories.map(catId => {
                        const cat = allCategories.find(c => c.id === catId);
                        if (!cat) return null;
                        return (
                          <span key={catId} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
                            color: isDark ? '#93c5fd' : '#1e40af',
                            border: `1px solid ${isDark ? '#2563eb40' : '#93c5fd'}`
                          }}>
                            {cat.icon} {cat[`name_${language}`] || cat.name}
                            <button onClick={() => toggleCategory(catId)} style={{
                              background: 'none', border: 'none', color: 'inherit',
                              cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1
                            }}>×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Search Box */}
                  <input
                    type="text"
                    placeholder={language === 'hi' ? '🔍 श्रेणी खोजें...' : language === 'ta' ? '🔍 வகையைத் தேடுங்கள்...' : '🔍 Search categories...'}
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '8px',
                      border: isDark ? '1px solid #243755' : '1px solid #cbd5e1',
                      fontSize: '12.5px', outline: 'none',
                      backgroundColor: isDark ? '#16243d' : '#ffffff',
                      color: isDark ? '#ffffff' : '#0f172a',
                      marginBottom: '8px'
                    }}
                  />

                  {/* Category Grid */}
                  <div style={{
                    maxHeight: '260px', overflowY: 'auto',
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '6px', padding: '2px'
                  }}>
                    {filteredCategories.map(cat => {
                      const isSelected = selectedCategories.includes(cat.id);
                      const isDisabled = !isSelected && selectedCategories.length >= 3;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => !isDisabled && toggleCategory(cat.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 10px', borderRadius: '8px',
                            fontSize: '11.5px', fontWeight: isSelected ? 700 : 500,
                            textAlign: 'left', cursor: isDisabled ? 'not-allowed' : 'pointer',
                            border: isSelected
                              ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}`
                              : `1px solid ${isDark ? '#1e2e4a' : '#e2e8f0'}`,
                            backgroundColor: isSelected
                              ? (isDark ? '#0c2340' : '#eff6ff')
                              : (isDark ? '#0d1a2e' : '#fafbfc'),
                            color: isSelected
                              ? (isDark ? '#38bdf8' : '#1d4ed8')
                              : isDisabled
                                ? (isDark ? '#4a5568' : '#94a3b8')
                                : (isDark ? '#e2e8f0' : '#334155'),
                            opacity: isDisabled ? 0.5 : 1,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                          <span style={{ lineHeight: 1.2 }}>{cat[`name_${language}`] || cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description / Amendment */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '6px' }}>
                  {t('policyAmendmentPrompt')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('policyAmendmentPlaceholder')}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: isDark ? '1px solid #243755' : '1px solid #cbd5e1',
                    fontSize: '13px', lineHeight: 1.5, outline: 'none', fontFamily: 'inherit',
                    backgroundColor: isDark ? '#16243d' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a'
                  }}
                />
              </div>
            </div>

            {/* ── Dynamic Policy Levers ── */}
            <div className="card" style={{
              padding: '20px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
              boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                  🎛️ {t('configureLevers')}
                  {leverDefs.length > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#94a3b8' : '#64748b', marginLeft: '8px' }}>
                      ({leverDefs.length} {language === 'hi' ? 'पैरामीटर' : language === 'ta' ? 'அளவுருக்கள்' : 'parameters'})
                    </span>
                  )}
                </h3>
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing || leverDefs.length === 0}
                  style={{
                    backgroundColor: isDark ? '#162b48' : '#eff6ff',
                    border: isDark ? '1px solid #38bdf8' : '1px solid #93c5fd',
                    color: isDark ? '#38bdf8' : '#1d4ed8',
                    padding: '6px 12px', borderRadius: '6px',
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    opacity: leverDefs.length === 0 ? 0.5 : 1
                  }}
                  title="AI-optimized policy lever settings"
                >
                  ⚡ {isOptimizing ? (language === 'hi' ? 'अनुकूलन...' : 'Optimizing...') : t('optimizeBtn')}
                </button>
              </div>

              {loadingSliders ? (
                <div style={{
                  textAlign: 'center', padding: '40px 20px',
                  color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</div>
                  {language === 'hi' ? 'नीति स्लाइडर लोड हो रहे हैं...' : language === 'ta' ? 'கொள்கை ஸ்லைடர்கள் ஏற்றப்படுகின்றன...' : 'Loading policy levers...'}
                </div>
              ) : leverDefs.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px 20px',
                  color: isDark ? '#94a3b8' : '#64748b', fontSize: '13px'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
                  {mode === 'custom'
                    ? (language === 'hi' ? 'ऊपर से नीति श्रेणियां चुनें' : language === 'ta' ? 'மேலே கொள்கை வகைகளைத் தேர்ந்தெடுக்கவும்' : 'Select policy categories above to generate levers')
                    : (language === 'hi' ? 'एक योजना चुनें' : language === 'ta' ? 'ஒரு திட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Select a scheme to configure')
                  }
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {leverDefs.map(lever => {
                    const val = levers[lever.id] !== undefined ? levers[lever.id] : lever.defaultValue;
                    const name = lever[`name_${language}`] || lever.name;
                    const unit = lever[`unit_${language}`] || lever.unit;
                    const desc = lever[`description_${language}`] || lever.description;

                    return (
                      <div key={lever.id} style={{
                        borderBottom: isDark ? '1px solid #1e2e4a' : '1px solid #f1f5f9',
                        paddingBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                            {lever.icon} {name}
                          </span>
                          <span style={{
                            fontSize: '12.5px', fontWeight: 800,
                            color: isDark ? '#38bdf8' : '#0c2340',
                            backgroundColor: isDark ? '#16243d' : '#f1f5f9',
                            padding: '2px 8px', borderRadius: '4px'
                          }}>
                            {lever.prefix || ''}{val}{unit}
                          </span>
                        </div>
                        {desc && (
                          <p style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b', margin: '0 0 5px', lineHeight: 1.3 }}>
                            {desc}
                          </p>
                        )}
                        {lever.categoryName && (
                          <span style={{
                            fontSize: '9px', fontWeight: 600, color: isDark ? '#6b7280' : '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                          }}>
                            {lever.categoryName}
                          </span>
                        )}
                        <input
                          type="range"
                          min={lever.min}
                          max={lever.max}
                          step={lever.step}
                          value={val}
                          onChange={(e) => handleSliderChange(lever.id, e.target.value)}
                          style={{ width: '100%', accentColor: isDark ? '#38bdf8' : '#0c2340', cursor: 'pointer', marginTop: '2px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={runEvaluation}
                disabled={isEvaluating || leverDefs.length === 0}
                style={{
                  width: '100%', marginTop: '20px',
                  backgroundColor: isEvaluating ? '#94a3b8' : '#E31E2E',
                  color: '#ffffff', border: 'none', borderRadius: '8px',
                  padding: '14px 20px', fontSize: '14px', fontWeight: 800,
                  cursor: isEvaluating ? 'wait' : leverDefs.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: isEvaluating ? 'none' : '0 4px 14px rgba(227, 30, 46, 0.35)',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: leverDefs.length === 0 ? 0.5 : 1
                }}
              >
                {isEvaluating ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    <span>{language === 'hi' ? '🤖 AI विश्लेषण चल रहा है...' : language === 'ta' ? '🤖 AI பகுப்பாய்வு நடைபெறுகிறது...' : '🤖 AI Analyzing Policy Impact...'}</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>{t('analyzeBtn')}</span>
                  </>
                )}
              </button>

              {/* Error display */}
              {evaluationError && (
                <div style={{
                  marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
                  backgroundColor: isDark ? '#450a0a' : '#fef2f2',
                  border: `1px solid ${isDark ? '#dc262640' : '#fca5a5'}`,
                  color: isDark ? '#fca5a5' : '#dc2626',
                  fontSize: '12px', lineHeight: 1.5
                }}>
                  ⚠️ {evaluationError}
                  {!ollamaStatus?.success && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: isDark ? '#94a3b8' : '#6b7280' }}>
                      Make sure Ollama is running: <code style={{ padding: '2px 4px', borderRadius: '3px', backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>ollama serve</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ════ RIGHT COLUMN: RESULTS ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 4 KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div className="card" style={{ padding: '18px', backgroundColor: isDark ? '#111c33' : '#ffffff', borderRadius: '10px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('effectivenessScore')}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                  {results.effectiveness_score} / 100
                </div>
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                  {results.effectiveness_score > 70 ? '↑ High Impact' : results.effectiveness_score > 40 ? '→ Moderate Impact' : '↓ Low Impact'}
                </div>
              </div>

              <div className="card" style={{ padding: '18px', backgroundColor: isDark ? '#111c33' : '#ffffff', borderRadius: '10px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0', borderLeft: '4px solid #38bdf8' }}>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('fiscalOutlay')}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: isDark ? '#38bdf8' : '#1d4ed8', marginTop: '4px' }}>
                  ₹{results.fiscal_cost_lakh_cr} L Cr
                </div>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                  Est. Annual Budget
                </div>
              </div>

              <div className="card" style={{ padding: '18px', backgroundColor: isDark ? '#111c33' : '#ffffff', borderRadius: '10px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('sustainabilityScore')}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
                  {results.sustainability_score}%
                </div>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                  5-Yr Deficit Feasibility
                </div>
              </div>

              <div className="card" style={{ padding: '18px', backgroundColor: isDark ? '#111c33' : '#ffffff', borderRadius: '10px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0', borderLeft: '4px solid #a855f7' }}>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('beneficiaries')}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#c084fc' : '#6d28d9', marginTop: '8px', lineHeight: 1.3 }}>
                  {results.beneficiary_group}
                </div>
              </div>
            </div>

            {/* Sectoral Breakdown */}
            <div className="card" style={{
              padding: '22px',
              backgroundColor: isDark ? '#111c33' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
              boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '16px' }}>
                📊 {t('sectoralBreakdown')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: isDark ? '#16243d' : '#f8fafc', padding: '14px', borderRadius: '8px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#38bdf8' : '#1e293b', marginBottom: '8px' }}>
                    👩‍👧 {t('genderImpact')}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#e2e8f0' : '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Female Income Lift: <strong>+{results.sectoral.gender.women}%</strong></div>
                    <div>Male Income Lift: <strong>+{results.sectoral.gender.men}%</strong></div>
                    <div>Participation Boost: <strong>+{results.sectoral.gender.female_participation_boost_pct}%</strong></div>
                  </div>
                </div>
                <div style={{ backgroundColor: isDark ? '#16243d' : '#f8fafc', padding: '14px', borderRadius: '8px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#38bdf8' : '#1e293b', marginBottom: '8px' }}>
                    🚩 {t('casteImpact')}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#e2e8f0' : '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>SC Cohort Gain: <strong>+{results.sectoral.caste.SC}%</strong></div>
                    <div>ST Cohort Gain: <strong>+{results.sectoral.caste.ST}%</strong></div>
                    <div>OBC Cohort Gain: <strong>+{results.sectoral.caste.OBC}%</strong></div>
                  </div>
                </div>
                <div style={{ backgroundColor: isDark ? '#16243d' : '#f8fafc', padding: '14px', borderRadius: '8px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#38bdf8' : '#1e293b', marginBottom: '8px' }}>
                    🍲 {t('childFamilyImpact')}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#e2e8f0' : '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Malnutrition Reduction: <strong>-{results.sectoral.children_family.child_malnutrition_reduction_pct}%</strong></div>
                    <div>School Retention Gain: <strong>+{results.sectoral.children_family.school_retention_increase_pct}%</strong></div>
                    <div>Family Welfare Index: <strong>{results.sectoral.children_family.family_welfare_index}/100</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map & Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px', backgroundColor: isDark ? '#111c33' : '#ffffff', borderRadius: '12px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '12px' }}>
                  🗺️ {t('stateMapTitle')}
                </h4>
                <StateGridMap levers={levers} />
              </div>
              <div className="card" style={{ padding: '20px', backgroundColor: isDark ? '#111c33' : '#ffffff', borderRadius: '12px', border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '12px' }}>
                  📈 {t('demographicChartTitle')}
                </h4>
                <DemographicChart results={results} />
              </div>
            </div>

            {/* AI Advisor */}
            <div className="card" style={{
              padding: '24px',
              backgroundColor: '#0c2340',
              color: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(12, 35, 64, 0.35)',
              border: isDark ? '1px solid #38bdf8' : '1px solid #1e3a8a'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#E31E2E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '14px'
                }}>AI</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('aiAdvisorTitle')}
                </h3>
                {isEvaluating && (
                  <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>
                    ⏳ {language === 'hi' ? 'LLM विश्लेषण...' : 'Processing...'}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', marginBottom: '4px' }}>
                  📌 {t('executiveVerdict')}
                </div>
                <p style={{ fontSize: '13.5px', color: '#f1f5f9', lineHeight: 1.6, margin: 0 }}>
                  {results.ai_guidance.executive_verdict}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', marginBottom: '4px' }}>
                  ⚠️ {t('risksAndMitigations')}
                </div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                  {results.ai_guidance.fiscal_and_regional_risks}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', marginBottom: '6px' }}>
                  🎯 {t('strategicRecommendations')}
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {results.ai_guidance.strategic_recommendations.map((rec, idx) => (
                    <li key={idx} style={{ lineHeight: 1.5 }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
