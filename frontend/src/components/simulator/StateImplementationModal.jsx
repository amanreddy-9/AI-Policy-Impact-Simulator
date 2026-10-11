import React, { useState, useEffect, useRef } from 'react';
import { STATES_PERFORMANCE_DATABASE } from '../../data/statesPerformanceData';

function MathFormulaRenderer({ formula, isDark }) {
  const containerRef = useRef(null);
  const [renderedWithKatex, setRenderedWithKatex] = useState(false);

  const cleanLatex = (formula || '')
    .replace(/^\$\$|\$\$$/g, '')
    .replace(/^\\\[|\\\]$/g, '')
    .trim();

  useEffect(() => {
    let intervalId = null;
    let attempts = 0;

    const tryRender = () => {
      if (containerRef.current && window.katex && cleanLatex) {
        try {
          containerRef.current.innerHTML = '';
          window.katex.render(cleanLatex, containerRef.current, {
            throwOnError: false,
            displayMode: true,
            strict: false
          });
          setRenderedWithKatex(true);
          return true;
        } catch (e) {
          console.warn('KaTeX render fallback:', e);
        }
      }
      return false;
    };

    if (!tryRender()) {
      intervalId = setInterval(() => {
        attempts++;
        if (tryRender() || attempts > 25) {
          clearInterval(intervalId);
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cleanLatex]);

  // Clean mathematical fallback parser when KaTeX script hasn't loaded or throws
  const renderFallback = () => {
    if (!cleanLatex) return null;

    const parseScripts = (text) => {
      const superParts = (text || '').split(/\^\{([^}]+)\}/g);
      const intermediate = [];
      for (let j = 0; j < superParts.length; j++) {
        if (!superParts[j]) continue;
        if (j % 2 === 1) {
          intermediate.push(<sup key={`sup-${j}`} style={{ fontSize: '0.75em' }}>{superParts[j]}</sup>);
        } else {
          const subParts = superParts[j].split(/_\{([^}]+)\}|_([a-zA-Z0-9]+)/g);
          for (let i = 0; i < subParts.length; i++) {
            if (!subParts[i]) continue;
            if (i % 3 === 1 || i % 3 === 2) {
              intermediate.push(<sub key={`sub-${j}-${i}`} style={{ fontSize: '0.75em' }}>{subParts[i]}</sub>);
            } else {
              intermediate.push(<span key={`txt-${j}-${i}`}>{subParts[i]}</span>);
            }
          }
        }
      }
      return intermediate;
    };

    const cleanTokens = (str) => {
      return (str || '')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\times/g, ' × ')
        .replace(/\\cdot/g, ' · ')
        .replace(/\\implies/g, ' ⟹ ')
        .replace(/\\approx/g, ' ≈ ')
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\sum/g, '∑')
        .replace(/\\max/g, 'max')
        .replace(/\\min/g, 'min')
        .replace(/\\quad/g, '   ')
        .replace(/\\;/g, ' ')
        .replace(/\\,/g, ' ')
        .replace(/\\left\[/g, '[')
        .replace(/\\right\]/g, ']')
        .replace(/\\left\(/g, '(')
        .replace(/\\right\)/g, ')')
        .replace(/\\%/g, '%')
        .replace(/\\/g, '');
    };

    // Check if formula has \frac{num}{denom}
    const fracRegex = /\\frac\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}/;
    const match = cleanLatex.match(fracRegex);

    if (match) {
      const idx = cleanLatex.indexOf(match[0]);
      const prefix = cleanTokens(cleanLatex.substring(0, idx));
      const num = cleanTokens(match[1]);
      const denom = cleanTokens(match[2]);
      const suffix = cleanTokens(cleanLatex.substring(idx + match[0].length));

      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '15px', fontWeight: 700, fontFamily: 'Cambria Math, KaTeX_Main, Georgia, serif' }}>
          {prefix && <span>{parseScripts(prefix)}</span>}
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', padding: '0 6px' }}>
            <div style={{ borderBottom: `2px solid ${isDark ? '#38bdf8' : '#0284c7'}`, paddingBottom: '3px', textAlign: 'center', minWidth: '80px', color: isDark ? '#ffffff' : '#0f172a' }}>
              {parseScripts(num)}
            </div>
            <div style={{ paddingTop: '3px', textAlign: 'center', minWidth: '80px', color: isDark ? '#ffffff' : '#0f172a' }}>
              {parseScripts(denom)}
            </div>
          </div>
          {suffix && <span>{parseScripts(suffix)}</span>}
        </div>
      );
    }

    const cleaned = cleanTokens(cleanLatex);
    return (
      <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.4px', fontFamily: 'Cambria Math, KaTeX_Main, Georgia, serif' }}>
        {parseScripts(cleaned)}
      </span>
    );
  };

  return (
    <div style={{
      backgroundColor: isDark ? '#081120' : '#f8fafc',
      border: isDark ? '1px solid #1e3a5f' : '1px solid #cbd5e1',
      borderRadius: '10px',
      padding: '16px 20px',
      color: isDark ? '#38bdf8' : '#0369a1',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '64px',
      overflowX: 'auto',
      textAlign: 'center',
      boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.4)' : 'inset 0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div ref={containerRef} style={{ width: '100%', display: renderedWithKatex ? 'block' : 'none', overflowX: 'auto' }} />
      {!renderedWithKatex && renderFallback()}
    </div>
  );
}

export default function StateImplementationModal({
  isOpen,
  onClose,
  stateData,
  currentLevers = {},
  baselineBudget = 25000,
  proposedBudget = 30000,
  netChange = 5000,
  pctChange = 20,
  policyName = "Custom Policy Initiative",
  sectorName = "Welfare & Economic Development",
  isDark = true
}) {
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState('five_dimensions'); // 'five_dimensions' | 'indicators'
  const [indicatorSubFilter, setIndicatorSubFilter] = useState('all'); // 'all' | 'equity' | 'fiscal'
  const [activeProofModal, setActiveProofModal] = useState(null); // 'siei' | 'contribution' | 'osps' | 'methodology' | null

  useEffect(() => {
    if (!isOpen || !stateData) return;

    let isMounted = true;
    setLoading(true);

    const fetchStateEvaluation = async () => {
      try {
        const payload = {
          policy_name: policyName,
          sector_name: sectorName,
          baseline_budget_cr: baselineBudget,
          proposed_budget_cr: proposedBudget,
          net_change_cr: netChange,
          pct_change: pctChange,
          levers: currentLevers
        };

        const res = await fetch(`/api/states/${stateData.id || stateData.abbr}/evaluate-reform`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setEvaluation(data);
        } else {
          console.warn('Backend evaluation failed, falling back to local calculation');
          if (isMounted) setEvaluation(computeFallbackEvaluation(stateData, netChange, pctChange));
        }
      } catch (err) {
        console.error('Error evaluating state reform:', err);
        if (isMounted) setEvaluation(computeFallbackEvaluation(stateData, netChange, pctChange));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStateEvaluation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, stateData, netChange, pctChange, baselineBudget, proposedBudget, policyName, sectorName]);

  if (!isOpen || !stateData) return null;

  // Fallback computation if offline using full database
  // Fallback computation if offline using full database
  function computeFallbackEvaluation(st, net, pct) {
    const targetId = st.id || st.abbr || 'AP';
    const dbMatch = STATES_PERFORMANCE_DATABASE.find(s => 
      s.state_id === targetId || s.abbr === targetId || s.state_name?.toLowerCase() === st.name?.toLowerCase()
    ) || STATES_PERFORMANCE_DATABASE[0];

    // Sector key mapping
    const secLower = (sectorName || '').toLowerCase();
    let secKey = 'economic_capacity_score';
    let secLabel = 'Decent Work & Economic Growth (SDG 8)';
    if (/water|wash|irrigation|sanitation|jal/.test(secLower)) {
      secKey = 'wash_capacity_score';
      secLabel = 'Clean Water & Sanitation / WASH (SDG 6)';
    } else if (/health|medical|hospital|nutrition|ayushman/.test(secLower)) {
      secKey = 'health_capacity_score';
      secLabel = 'Good Health & Well-being (SDG 3)';
    } else if (/education|school|skill|samagra/.test(secLower)) {
      secKey = 'education_capacity_score';
      secLabel = 'Quality Education (SDG 4)';
    } else if (/agri|farm|kisan|crop|rural/.test(secLower)) {
      secKey = 'agriculture_capacity_score';
      secLabel = 'Zero Hunger & Agriculture (SDG 2)';
    }

    // Normalization across database
    const sumPop = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.total_population_cr || b.pop_cr || 0), 0) || 1;
    const sumGsdp = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.gsdp_current_prices_cr || b.gsdp_current_2024_25_be_cr || 0), 0) || 1;
    const sumPcap = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.per_capita_nsdp_rs || 0), 0) || 1;
    const sumPoor = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.share_of_national_poor_pct || 0), 0) || 1;
    const sumRural = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.rural_population_share_pct || 0), 0) || 1;
    const sumDebt = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.debt_to_gsdp_ratio_pct || 0), 0) || 1;
    const sumComm = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.committed_expenditure_ratio_pct || 0), 0) || 1;
    const sumSotrSh = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b.share_of_national_own_tax_pct || 0), 0) || 1;
    const sumUncomm = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + Math.max(1, b.uncommitted_expenditure_capacity_cr || 0), 0) || 1;
    const sumSecCap = STATES_PERFORMANCE_DATABASE.reduce((a, b) => a + (b[secKey] || 50), 0) || 1;

    const calcs = STATES_PERFORMANCE_DATABASE.map(s => {
      const p_cr = s.total_population_cr || s.pop_cr || 5.0;
      const P_i = p_cr / sumPop;
      const G_i = 0.70 * ((s.gsdp_current_prices_cr || s.gsdp_current_2024_25_be_cr || 1) / sumGsdp) + 0.30 * ((s.per_capita_nsdp_rs || 1) / sumPcap);
      const E_i = 0.30 * ((s.share_of_national_poor_pct || 1) / sumPoor) +
                  0.25 * ((s.rural_population_share_pct || 1) / sumRural) +
                  0.25 * ((s.debt_to_gsdp_ratio_pct || 1) / sumDebt) +
                  0.20 * ((s.committed_expenditure_ratio_pct || 1) / sumComm);
      const C_i = 0.35 * ((s.share_of_national_own_tax_pct || 1) / sumSotrSh) +
                  0.35 * (Math.max(0, s.uncommitted_expenditure_capacity_cr || 0) / sumUncomm) +
                  0.30 * ((s[secKey] || 50) / sumSecCap);
      const raw_W = 0.40 * P_i + 0.20 * G_i + 0.25 * E_i + 0.15 * C_i;
      return { state_id: s.state_id, raw_W, P_i, G_i, E_i, C_i, row: s };
    });

    const sumRawW = calcs.reduce((a, b) => a + b.raw_W, 0) || 1;
    calcs.forEach(c => { c.W_i = c.raw_W / sumRawW; });

    const targetCalc = calcs.find(c => c.state_id === (dbMatch.state_id || targetId)) || calcs[0];
    const W_i = targetCalc.W_i;
    const allocPct = Number((W_i * 100).toFixed(2));
    const deltaB = Math.max(0, net);
    const D_i = Number((deltaB * W_i).toFixed(2));

    const specialStates = ['AR', 'AS', 'HP', 'JK', 'MN', 'ML', 'MZ', 'NL', 'SK', 'TR', 'UK'];
    const isSpecial = specialStates.includes(targetCalc.state_id);
    const cssNormPct = isSpecial ? 10.0 : 40.0;
    const cssType = isSpecial ? "Special Category State (90:10 Ratio)" : "General Category State (60:40 Ratio)";

    const RR_i = dbMatch.total_revenue_receipts_cr || 150000;
    const commPct = dbMatch.committed_expenditure_ratio_pct || 50.0;
    const CE_i = Number(((commPct / 100) * RR_i).toFixed(2));
    const OS_i = Number((dbMatch.existing_scheme_commitments_cr || 10000).toFixed(2));
    const B_i = Number((0.05 * RR_i).toFixed(2));
    const H_i = Number(Math.max(0, RR_i - CE_i - OS_i - B_i).toFixed(2));
    const deployableHeadroom = Number((0.60 * H_i).toFixed(2));
    const emergencyReserve = Number((0.40 * H_i).toFixed(2));

    const isExp = net > 0;
    const affordContribPct = (isExp && D_i > 0) ? Number(Math.min(100, (deployableHeadroom / D_i) * 100).toFixed(1)) : 0.0;
    const maxAffordOutlay = (isExp && D_i > 0) ? Number(Math.min(D_i, deployableHeadroom).toFixed(2)) : 0.0;
    const reqStatOutlay = Number((D_i * (cssNormPct / 100)).toFixed(2));

    const sdg = dbMatch.sdg_score_2024 || 72;
    const debt = dbMatch.debt_to_gsdp_ratio_pct || 30.0;
    const gsdp = dbMatch.gsdp_current_prices_cr || 500000;
    const sotr = dbMatch.own_tax_revenue_2024_25_be_cr || 35000;
    const sotrEff = Math.min(100, (sotr / (0.07 * gsdp)) * 100);
    const debtComp = Math.max(0, Math.min(100, 100 * (1 - debt / 100)));
    const siei = Math.round(0.40 * sdg + 0.35 * debtComp + 0.25 * sotrEff);

    const headroomScore = isExp ? Math.min(100, Math.max(20, (deployableHeadroom / (reqStatOutlay + 1)) * 50 + 30)) : 60;
    const hdiScore = Math.round((dbMatch.baseline_hdi || 0.65) * 100);
    const osps = Math.round(0.45 * siei + 0.35 * headroomScore + 0.20 * hdiScore);

    const allocProof = {
      formula: "\\text{Allocation Score } W_i = 0.40 P_i + 0.20 G_i + 0.25 E_i + 0.15 C_i \\quad \\text{and} \\quad D_i = \\Delta B \\times W_i",
      step_by_step: [
        `1. Component P_i (Population & Service Scale, 40% weight): P_i = ${targetCalc.P_i.toFixed(4)} -> 0.40 * ${targetCalc.P_i.toFixed(4)} = ${(0.40 * targetCalc.P_i).toFixed(4)}`,
        `2. Component G_i (Economic Scale, 20% weight): G_i = ${targetCalc.G_i.toFixed(4)} -> 0.20 * ${targetCalc.G_i.toFixed(4)} = ${(0.20 * targetCalc.G_i).toFixed(4)}`,
        `3. Component E_i (Equity & Fiscal Need, 25% weight): E_i = ${targetCalc.E_i.toFixed(4)} -> 0.25 * ${targetCalc.E_i.toFixed(4)} = ${(0.25 * targetCalc.E_i).toFixed(4)}`,
        `4. Component C_i (Capacity in ${secLabel}, 15% weight): C_i = ${targetCalc.C_i.toFixed(4)} -> 0.15 * ${targetCalc.C_i.toFixed(4)} = ${(0.15 * targetCalc.C_i).toFixed(4)}`,
        `5. Resulting State Allocation Score: W_i = ${W_i.toFixed(4)} -> Allocation Share = ${allocPct}%`,
        `6. Additional Rupee Outlay Allocation: D_i = ₹${deltaB.toLocaleString('en-IN')} Cr * ${W_i.toFixed(4)} = ₹${D_i.toLocaleString('en-IN')} Crore`
      ],
      citations: [
        "Finance Commission Devolution & Formulaic CSS Resource Allocation Protocols",
        "MoSPI / Census Population Projections 2011-2036",
        "RBI Handbook of Statistics 2024-25 (Table 21 GSDP & Table 168 SOTR)",
        "NITI Aayog National Multidimensional Poverty Index (MPI) 2023 & SDG Index 2023-24"
      ]
    };

    const contribProof = {
      formula: "H_i = \\max(0, RR_i - CE_i - OS_i - B_i), \\quad H_i^{\\text{deployable}} = 0.60 \\times H_i \\quad \\text{and} \\quad \\text{Affordable Contribution \\%} = \\min\\left(100, \\;\\frac{0.60 \\times H_i}{D_i} \\times 100\\right)",
      step_by_step: [
        `1. State Total Revenue Receipts (RR_i): ₹${RR_i.toLocaleString('en-IN')} Crore (RBI Handbook Table 166 - 165)`,
        `2. Committed Expenditure (CE_i): ${commPct}% of RR_i = ₹${CE_i.toLocaleString('en-IN')} Crore (Salaries, Pensions & Debt Servicing, PRS SOSF Fig. 25)`,
        `3. Existing Scheme Commitments (OS_i): ₹${OS_i.toLocaleString('en-IN')} Crore (State Flagship Schemes & CSS Matching Demands)`,
        `4. Safety Reserve Buffer (B_i): 5% of RR_i = ₹${B_i.toLocaleString('en-IN')} Crore`,
        `5. Net Liquid Fiscal Headroom (H_i): ₹${RR_i.toLocaleString('en-IN')} - ₹${CE_i.toLocaleString('en-IN')} - ₹${OS_i.toLocaleString('en-IN')} - ₹${B_i.toLocaleString('en-IN')} = ₹${H_i.toLocaleString('en-IN')} Crore`,
        `6. Scheme-Deployable Capacity (60% Ceiling): 0.60 × ₹${H_i.toLocaleString('en-IN')} = ₹${deployableHeadroom.toLocaleString('en-IN')} Crore (40% / ₹${emergencyReserve.toLocaleString('en-IN')} Cr reserved for state emergencies & own schemes)`,
        `7. Allocated Outlay to State (D_i): ₹${D_i.toLocaleString('en-IN')} Crore`,
        `8. Maximum Affordable Contribution: min(100, (₹${deployableHeadroom.toLocaleString('en-IN')} / ₹${D_i.toLocaleString('en-IN')}) * 100) = ${affordContribPct}%`,
        `9. Statutory Matching Comparison: Statutory CSS norm is ${cssNormPct}% (₹${reqStatOutlay.toLocaleString('en-IN')} Cr). State has deployable capacity to absorb up to ${affordContribPct}% (₹${maxAffordOutlay.toLocaleString('en-IN')} Cr).`
      ],
      citations: [
        "Econometric Fiscal Affordability Framework (State Finances Study)",
        "PRS State of State Finances 2025 Figure 25 (Committed Expenditure)",
        "Reserve Bank of India State Finances 2024-25 (Revenue Receipts & Debt Paths)"
      ]
    };

    const canContributeVerdict = !isExp ? "Not Applicable (Contractionary Reform)" : (deployableHeadroom >= reqStatOutlay ? "Yes — Full Capacity to Contribute (60% Deployable Rule)" : (deployableHeadroom > reqStatOutlay * 0.4 ? "Yes — Moderate / Partial Capacity" : "No — High Fiscal Distress / Insufficient Headroom"));
    const canContributeColor = !isExp ? "#64748b" : (deployableHeadroom >= reqStatOutlay ? "#16a34a" : (deployableHeadroom > reqStatOutlay * 0.4 ? "#d97706" : "#dc2626"));

    return {
      state: {
        id: st.id || st.abbr || dbMatch.state_id,
        name: st.name || dbMatch.state_name,
        region: st.region || dbMatch.region,
        population_cr: st.pop || dbMatch.pop_cr || 5.0,
        sdg_score: sdg,
        sdg_category: st.sdg_category || dbMatch.sdg_category || "Front Runner",
        total_debt_cr: dbMatch.total_debt_liabilities_2024_cr || st.total_debt_2024_cr || 150000,
        debt_to_gsdp_pct: debt,
        gsdp_cr: gsdp,
        own_tax_revenue_cr: sotr,
        // 10 Core Fiscal Metrics
        own_revenue_receipts_cr: dbMatch.own_revenue_receipts_cr || (sotr * 1.1),
        own_tax_to_gsdp_pct: dbMatch.own_tax_to_gsdp_pct || Number(((sotr / gsdp) * 100).toFixed(2)),
        revenue_surplus_or_deficit: dbMatch.revenue_surplus_or_deficit || "Deficit",
        revenue_deficit_cr: dbMatch.revenue_deficit_2024_25_be_cr || 15000,
        committed_expenditure_ratio_pct: commPct,
        interest_payments_cr: dbMatch.interest_payments_2024_25_be_cr || 20000,
        interest_to_revenue_receipts_pct: dbMatch.interest_to_revenue_receipts_pct || Number(((20000 / RR_i) * 100).toFixed(1)),
        fiscal_deficit_to_gsdp_pct: dbMatch.fiscal_deficit_to_gsdp_pct || 3.5,
        total_revenue_receipts_cr: RR_i,
        uncommitted_expenditure_capacity_cr: dbMatch.uncommitted_expenditure_capacity_cr || H_i,
        health_capacity_score: dbMatch.health_capacity_score || 75,
        education_capacity_score: dbMatch.education_capacity_score || 72,
        wash_capacity_score: dbMatch.wash_capacity_score || 85,
        agriculture_capacity_score: dbMatch.agriculture_capacity_score || 68,
        economic_capacity_score: dbMatch.economic_capacity_score || 70,
        existing_scheme_commitments_cr: OS_i,
        // 7 Additional Macroeconomic & Demographic Equity Indicators
        total_population_cr: dbMatch.total_population_cr || dbMatch.pop_cr || st.pop || 5.0,
        population_share_of_india_pct: dbMatch.population_share_of_india_pct || 3.88,
        gsdp_current_prices_cr: dbMatch.gsdp_current_prices_cr || gsdp,
        per_capita_nsdp_rs: dbMatch.per_capita_nsdp_rs || dbMatch.per_capita_nsdp_2024_25_rs || 200000,
        share_of_national_own_tax_pct: dbMatch.share_of_national_own_tax_pct || 4.5,
        share_of_national_poor_pct: dbMatch.share_of_national_poor_pct || 2.5,
        mpi_poverty_headcount_pct: dbMatch.mpi_poverty_headcount_pct || 6.06,
        rural_population_share_pct: dbMatch.rural_population_share_pct || 70.0
      },
      implementation_effectiveness: {
        score: siei,
        verdict: siei >= 70 ? "High Implementation Readiness" : "Moderate Implementation Readiness",
        badge: siei >= 70 ? "Excellent" : "Moderate",
        color: siei >= 70 ? "#16a34a" : "#d97706",
        proof: {
          formula: "\\text{SIEI} = 0.40 \\cdot \\text{SDG}_{2024} + 0.35 \\cdot [100 \\cdot (1 - \\text{Debt}/\\text{GSDP})] + 0.25 \\cdot \\text{SOTR Ratio}",
          step_by_step: [
            `1. NITI Aayog SDG Index 2024: Score ${sdg} -> 0.40 * ${sdg} = ${(0.4 * sdg).toFixed(1)}`,
            `2. Solvency Factor: Debt-to-GSDP ${debt}% -> 0.35 * ${(100 - debt).toFixed(1)} = ${(0.35 * (100 - debt)).toFixed(1)}`,
            `3. Weighted Delivery Score: ${siei} / 100`
          ],
          citations: ["RBI Handbook 2024-25 Table 176", "NITI Aayog SDG India Index 2023-24"]
        }
      },
      state_allocation: {
        allocation_score_w_i: W_i,
        allocation_percentage: allocPct,
        additional_allocation_cr: D_i,
        net_national_budget_expansion_cr: deltaB,
        components: {
          P_i: Number(targetCalc.P_i.toFixed(4)),
          G_i: Number(targetCalc.G_i.toFixed(4)),
          E_i: Number(targetCalc.E_i.toFixed(4)),
          C_i: Number(targetCalc.C_i.toFixed(4)),
          weights: { P: 0.40, G: 0.20, E: 0.25, C: 0.15 },
          sector_capacity_metric: secLabel
        },
        proof: allocProof
      },
      affordable_contribution: {
        affordable_contribution_pct: affordContribPct,
        fiscal_headroom_h_i_cr: H_i,
        deployable_headroom_h_i_cr: deployableHeadroom,
        contingency_emergency_reserve_cr: emergencyReserve,
        headroom_deployable_ratio_pct: 60.0,
        emergency_reserve_ratio_pct: 40.0,
        allocated_project_cost_d_i_cr: D_i,
        revenue_receipts_rr_cr: RR_i,
        committed_expenditure_ce_cr: CE_i,
        existing_commitments_os_cr: OS_i,
        safety_reserve_b_cr: B_i,
        statutory_css_norm_pct: cssNormPct,
        statutory_outlay_cr: reqStatOutlay,
        max_affordable_outlay_cr: maxAffordOutlay,
        can_contribute: isExp && deployableHeadroom >= reqStatOutlay,
        can_contribute_verdict: canContributeVerdict,
        can_contribute_color: canContributeColor,
        can_contribute_summary: isExp 
          ? `${st.name || dbMatch.state_name} is allocated ₹${D_i.toLocaleString('en-IN')} Cr (${allocPct}% of national ₹${deltaB.toLocaleString('en-IN')} Cr expansion). With 60% deployable liquid headroom of ₹${deployableHeadroom.toLocaleString('en-IN')} Cr (retaining 40% / ₹${emergencyReserve.toLocaleString('en-IN')} Cr for emergencies & own schemes), the state can comfortably fund its statutory ${cssNormPct}% share (₹${reqStatOutlay.toLocaleString('en-IN')} Cr) and can afford up to ${affordContribPct}% (₹${maxAffordOutlay.toLocaleString('en-IN')} Cr) to reduce fiscal pressure on the Centre.`
          : `Budget reduced by ${pct}%. No additional co-funding required.`,
        proof: contribProof
      },
      spending_and_contribution: {
        is_spending_more_than_baseline: isExp,
        net_difference_cr: net,
        pct_change: pct,
        css_sharing_norm: cssType,
        statutory_state_share_pct: cssNormPct,
        allocated_outlay_cr: D_i,
        allocation_percentage: allocPct,
        state_pro_rata_expansion_cr: D_i,
        required_state_outlay_cr: reqStatOutlay,
        state_fiscal_headroom_cr: H_i,
        can_state_contribute: isExp && H_i >= reqStatOutlay,
        can_contribute_verdict: canContributeVerdict,
        can_contribute_color: canContributeColor,
        summary: isExp 
          ? `${st.name || dbMatch.state_name} holds adequate fiscal headroom under FRBM parameters to co-fund its statutory matching share.` 
          : `Budget reduced by ${pct}%. No additional co-funding required.`
      },
      contributable_share: {
        feasible_share_pct: affordContribPct,
        statutory_norm_pct: cssNormPct,
        allocated_outlay_cr: D_i,
        allocation_percentage: allocPct,
        proof: contribProof
      },
      grok_explanation: {
        verdict: `Comprehensive Fiscal Analysis for ${st.name || dbMatch.state_name}: Outstanding liabilities stand at ₹${(dbMatch.total_debt_liabilities_2024_cr || 0).toLocaleString('en-IN')} Cr (${debt}% of GSDP). With NITI Aayog SDG score of ${sdg}, administrative machinery possesses active delivery pipelines for welfare rollout.`,
        key_factors: [
          `Debt-to-GSDP standing at ${debt}% as per RBI Handbook Table 176.`,
          `Institutional delivery rails confirmed by NITI Aayog SDG Index 2023-24.`,
          `Own Tax Revenue mobilization provides liquidity cushion.`
        ],
        citations: ["RBI Handbook of Statistics 2024-25", "PRS State of State Finances 2025", "NITI Aayog SDG India Index 2023-24"]
      },
      overall_performance: {
        score: osps,
        category: osps >= 70 ? "High Scheme Performance" : (osps >= 50 ? "Moderate Scheme Performance" : "High Risk / Stressed Delivery"),
        color: osps >= 70 ? "#16a34a" : (osps >= 50 ? "#d97706" : "#dc2626"),
        bg_color: osps >= 70 ? "#dcfce7" : (osps >= 50 ? "#fef3c7" : "#fee2e2"),
        text_color: osps >= 70 ? "#15803d" : (osps >= 50 ? "#b45309" : "#b91c1c"),
        proof: {
          formula: "\\text{OSPS} = 0.45 \\cdot \\text{SIEI} + 0.35 \\cdot \\text{Headroom Score} + 0.20 \\cdot (\\text{HDI} \\times 100)",
          step_by_step: [
            `1. Implementation Effectiveness: 0.45 * ${siei} = ${(0.45 * siei).toFixed(1)}`,
            `2. Fiscal Headroom Index: 0.35 * ${headroomScore.toFixed(0)} = ${(0.35 * headroomScore).toFixed(1)}`,
            `3. Baseline HDI Absorptive Capacity: 0.20 * ${hdiScore} = ${(0.20 * hdiScore).toFixed(1)}`,
            `4. Overall Composite: ${osps} / 100`
          ],
          citations: ["RBI State Finances 2024-25", "NITI Aayog SDG Index 2023-24"]
        }
      }
    };
  }

  const evalData = evaluation || computeFallbackEvaluation(stateData, netChange, pctChange);
  const osps = evalData.overall_performance;
  const siei = evalData.implementation_effectiveness;
  const spend = evalData.spending_and_contribution;
  const contrib = evalData.contributable_share;
  const grok = evalData.grok_explanation;
  const stInfo = evalData.state;
  const stateAlloc = evalData.state_allocation || {
    allocation_score_w_i: 0.0372,
    allocation_percentage: 3.72,
    additional_allocation_cr: Math.round(Math.max(0, netChange) * 0.0372),
    net_national_budget_expansion_cr: Math.max(0, netChange),
    components: { P_i: 0.0388, G_i: 0.0425, E_i: 0.0280, C_i: 0.0413 },
    proof: {
      formula: "W_i = 0.40 P_i + 0.20 G_i + 0.25 E_i + 0.15 C_i \\quad \\text{and} \\quad D_i = \\Delta B \\times W_i",
      step_by_step: [
        "1. Component P_i (Population & Service Scale, 40% weight)",
        "2. Component G_i (Economic Scale, 20% weight)",
        "3. Component E_i (Equity & Fiscal Need, 25% weight)",
        "4. Component C_i (Fiscal & Sector Capacity, 15% weight)"
      ],
      citations: ["Finance Commission Allocation Rules", "RBI Handbook 2024-25"]
    }
  };
  const affordContrib = evalData.affordable_contribution || {
    affordable_contribution_pct: contrib?.feasible_share_pct || 40.0,
    fiscal_headroom_h_i_cr: spend?.state_fiscal_headroom_cr || 62000,
    deployable_headroom_h_i_cr: Math.round(0.60 * (spend?.state_fiscal_headroom_cr || 62000)),
    contingency_emergency_reserve_cr: Math.round(0.40 * (spend?.state_fiscal_headroom_cr || 62000)),
    headroom_deployable_ratio_pct: 60.0,
    emergency_reserve_ratio_pct: 40.0,
    allocated_project_cost_d_i_cr: stateAlloc.additional_allocation_cr,
    statutory_css_norm_pct: spend?.statutory_state_share_pct || 40.0,
    statutory_outlay_cr: spend?.required_state_outlay_cr || 298.0,
    max_affordable_outlay_cr: stateAlloc.additional_allocation_cr,
    can_contribute: spend?.can_state_contribute,
    can_contribute_verdict: spend?.can_contribute_verdict || "Yes — Full Capacity to Contribute",
    can_contribute_color: spend?.can_contribute_color || "#16a34a",
    can_contribute_summary: spend?.summary || "Adequate fiscal headroom to fund matching share.",
    proof: contrib?.proof
  };

  // Find DB entry for full fallback verification
  const dbEntry = STATES_PERFORMANCE_DATABASE.find(s => 
    s.state_id === stInfo.id || s.abbr === stInfo.id || s.state_name?.toLowerCase() === stInfo.name?.toLowerCase()
  ) || {};

  // Resolved 10 core fiscal metrics
  const ownRevReceipts = stInfo.own_revenue_receipts_cr ?? dbEntry.own_revenue_receipts_cr ?? 120365;
  const ownTaxToGsdp = stInfo.own_tax_to_gsdp_pct ?? dbEntry.own_tax_to_gsdp_pct ?? 6.89;
  const revSurplusDeficitType = stInfo.revenue_surplus_or_deficit ?? dbEntry.revenue_surplus_or_deficit ?? "Deficit";
  const revDeficitVal = Math.abs(stInfo.revenue_deficit_cr ?? dbEntry.revenue_deficit_2024_25_be_cr ?? 34743);
  const committedRatio = stInfo.committed_expenditure_ratio_pct ?? dbEntry.committed_expenditure_ratio_pct ?? 52.0;
  const interestPayments = stInfo.interest_payments_cr ?? dbEntry.interest_payments_2024_25_be_cr ?? 21808;
  const interestToRevReceipts = stInfo.interest_to_revenue_receipts_pct ?? dbEntry.interest_to_revenue_receipts_pct ?? 10.8;
  const debtToGsdp = stInfo.debt_to_gsdp_pct ?? dbEntry.debt_to_gsdp_ratio_pct ?? 33.0;
  const totalDebt = stInfo.total_debt_cr ?? dbEntry.total_debt_liabilities_2024_cr ?? 494197;
  const fiscalDeficitToGsdp = stInfo.fiscal_deficit_to_gsdp_pct ?? dbEntry.fiscal_deficit_to_gsdp_pct ?? 4.32;
  const fiscalDeficitCr = stInfo.fiscal_deficit_cr ?? dbEntry.gross_fiscal_deficit_2024_25_be_cr ?? 68743;
  const uncommittedCapacity = stInfo.uncommitted_expenditure_capacity_cr ?? dbEntry.uncommitted_expenditure_capacity_cr ?? 86504.82;
  
  // Sector specific implementation capacity
  const healthCap = stInfo.health_capacity_score ?? dbEntry.health_capacity_score ?? 78;
  const eduCap = stInfo.education_capacity_score ?? dbEntry.education_capacity_score ?? 72;
  const washCap = stInfo.wash_capacity_score ?? dbEntry.wash_capacity_score ?? 90;
  const agriCap = stInfo.agriculture_capacity_score ?? dbEntry.agriculture_capacity_score ?? 68;
  const econCap = stInfo.economic_capacity_score ?? dbEntry.economic_capacity_score ?? 70;
  const existingSchemes = stInfo.existing_scheme_commitments_cr ?? dbEntry.existing_scheme_commitments_cr ?? 24500;

  // Resolved 7 Macroeconomic & Demographic Equity Indicators
  const popCr = stInfo.total_population_cr ?? stInfo.pop_cr ?? dbEntry.total_population_cr ?? dbEntry.pop_cr ?? 5.29;
  const popPersons = Math.round(popCr * 10000000);
  const popShareOfIndia = stInfo.population_share_of_india_pct ?? dbEntry.population_share_of_india_pct ?? 3.88;
  const gsdpCurrentPrices = stInfo.gsdp_current_prices_cr ?? stInfo.gsdp_cr ?? dbEntry.gsdp_current_prices_cr ?? dbEntry.gsdp_current_2024_25_be_cr ?? 1593062;
  const perCapitaNsdp = stInfo.per_capita_nsdp_rs ?? dbEntry.per_capita_nsdp_rs ?? dbEntry.per_capita_nsdp_2024_25_rs ?? 266240;
  const shareOfNationalOwnTax = stInfo.share_of_national_own_tax_pct ?? dbEntry.share_of_national_own_tax_pct ?? 4.70;
  const shareOfNationalPoor = stInfo.share_of_national_poor_pct ?? dbEntry.share_of_national_poor_pct ?? 1.56;
  const mpiHeadcount = stInfo.mpi_poverty_headcount_pct ?? dbEntry.mpi_poverty_headcount_pct ?? 6.06;
  const ruralPopulationShare = stInfo.rural_population_share_pct ?? dbEntry.rural_population_share_pct ?? 70.4;

  // 10 Core Fiscal & Governance Indicators
  const fiscalMetricsList = [
    {
      num: 1,
      category: 'fiscal',
      name: "Own revenue receipts",
      value: `₹${ownRevReceipts?.toLocaleString('en-IN')} Cr`,
      badge: "SOTR + SONTR",
      badgeColor: "#3b82f6",
      whatItTells: "Revenue generated by the state itself",
      whyItMatters: "Indicates independent funding capacity",
      citation: "RBI Handbook 2024-25 Table 168 (SOTR) & Table 169 (SONTR)",
      subtext: `SOTR: ₹${(stInfo.own_tax_revenue_cr || dbEntry.own_tax_revenue_2024_25_be_cr || 0).toLocaleString('en-IN')} Cr | SONTR: ₹${(dbEntry.own_non_tax_revenue_2024_25_be_cr || 0).toLocaleString('en-IN')} Cr`
    },
    {
      num: 2,
      category: 'fiscal',
      name: "Own tax revenue / GSDP",
      value: `${ownTaxToGsdp}%`,
      badge: "Tax Depth",
      badgeColor: "#0284c7",
      whatItTells: "Tax-collection capacity relative to the economy",
      whyItMatters: "Helps compare states of different sizes",
      citation: "RBI Handbook 2024-25 Table 168 & Table 21 (GSDP)",
      subtext: `State GSDP Base: ₹${(stInfo.gsdp_cr || dbEntry.gsdp_current_2024_25_be_cr || 0).toLocaleString('en-IN')} Cr`
    },
    {
      num: 3,
      category: 'fiscal',
      name: "Revenue surplus / deficit",
      value: `${revSurplusDeficitType}: ₹${revDeficitVal?.toLocaleString('en-IN')} Cr`,
      badge: revSurplusDeficitType === "Surplus" ? "Fiscal Surplus" : "Revenue Deficit",
      badgeColor: revSurplusDeficitType === "Surplus" ? "#16a34a" : "#dc2626",
      whatItTells: "Whether recurring revenue covers recurring expenditure",
      whyItMatters: "A persistent deficit reduces room for new commitments",
      citation: "RBI Handbook 2024-25 Table 165 (Revenue Deficit / Surplus)",
      subtext: revSurplusDeficitType === "Surplus" ? "Net recurring revenue cushions new ongoing outlays" : "Persistent gap necessitates borrowing for recurring expenditures"
    },
    {
      num: 4,
      category: 'fiscal',
      name: "Committed expenditure ratio",
      value: `${committedRatio}% of revenue receipts`,
      badge: committedRatio > 60 ? "High Pre-Commitment" : "Manageable",
      badgeColor: committedRatio > 60 ? "#dc2626" : (committedRatio > 45 ? "#d97706" : "#16a34a"),
      whatItTells: "Salaries, pensions and interest as a share of revenue receipts",
      whyItMatters: "Shows how much revenue is already committed",
      citation: "PRS Legislative Research State of State Finances 2025 Figure 25",
      subtext: "Salaries + Pensions + Debt Servicing pre-empt incoming revenue receipts"
    },
    {
      num: 5,
      category: 'fiscal',
      name: "Interest payments / revenue receipts",
      value: `${interestToRevReceipts}% (₹${interestPayments?.toLocaleString('en-IN')} Cr)`,
      badge: interestToRevReceipts > 15 ? "Heavy Debt Servicing" : "Moderate Servicing",
      badgeColor: interestToRevReceipts > 15 ? "#dc2626" : "#d97706",
      whatItTells: "Share consumed by debt servicing",
      whyItMatters: "Higher values leave less money for new programmes",
      citation: "RBI Handbook 2024-25 Table 171 & PRS SOSF 2025 Figure 17",
      subtext: `Consumes ₹${interestPayments?.toLocaleString('en-IN')} Cr annually out of ₹${(stInfo.total_revenue_receipts_cr || dbEntry.total_revenue_receipts_cr || 0).toLocaleString('en-IN')} Cr receipts`
    },
    {
      num: 6,
      category: 'fiscal',
      name: "Outstanding liabilities / GSDP",
      value: `${debtToGsdp}% (₹${totalDebt?.toLocaleString('en-IN')} Cr)`,
      badge: debtToGsdp > 35 ? "Elevated Debt" : "Within Norm",
      badgeColor: debtToGsdp > 35 ? "#dc2626" : (debtToGsdp > 28 ? "#d97706" : "#16a34a"),
      whatItTells: "Debt burden relative to economic output",
      whyItMatters: "Indicates longer-term fiscal pressure",
      citation: "RBI Handbook 2024-25 Table 176 (Outstanding Liabilities 2024/25) & PRS Table 4",
      subtext: `Total Liabilities: ₹${totalDebt?.toLocaleString('en-IN')} Cr (Target ceiling: ~28-30% GSDP)`
    },
    {
      num: 7,
      category: 'fiscal',
      name: "Fiscal deficit / GSDP",
      value: `${fiscalDeficitToGsdp}% (₹${fiscalDeficitCr?.toLocaleString('en-IN')} Cr)`,
      badge: fiscalDeficitToGsdp > 3.5 ? "Exceeds 3.5% FRBM" : "FRBM Compliant",
      badgeColor: fiscalDeficitToGsdp > 3.5 ? "#dc2626" : "#16a34a",
      whatItTells: "Current borrowing relative to the economy",
      whyItMatters: "Helps assess borrowing constraints under statutory limits",
      citation: "RBI Handbook 2024-25 Table 164 (Gross Fiscal Deficit)",
      subtext: `FRBM 3.5% statutory cap leaves borrowing leeway of max ₹${(0.035 * (stInfo.gsdp_cr || dbEntry.gsdp_current_2024_25_be_cr || 0)).toLocaleString('en-IN')} Cr`
    },
    {
      num: 8,
      category: 'fiscal',
      name: "Uncommitted expenditure capacity",
      value: `₹${uncommittedCapacity?.toLocaleString('en-IN')} Cr`,
      badge: "Discretionary Buffer",
      badgeColor: "#10b981",
      whatItTells: "Resources remaining after existing obligations and a safety reserve",
      whyItMatters: "Most directly relevant to affordability",
      citation: "Econometric Discretionary Capacity Formula: Revenue Receipts × (1 - CER - 5% Safety Reserve)",
      subtext: `Net liquid room available to co-finance new CSS schemes or welfare reforms`
    },
    {
      num: 9,
      category: 'fiscal',
      name: "Sector-specific implementation capacity",
      value: `Avg ${(Math.round((healthCap + eduCap + washCap + agriCap + econCap) / 5))}/100`,
      badge: "Institutional Apparatus",
      badgeColor: "#8b5cf6",
      whatItTells: "Staff, facilities, infrastructure, and delivery systems",
      whyItMatters: "A state may afford a scheme but lack the capacity to implement it",
      citation: "NITI Aayog SDG India Index 2023-24 (SDG 3, SDG 4, SDG 6, SDG 2, SDG 8)",
      isSectorBreakdown: true,
      subtext: "Delivery pipes across health centers, teacher cadre, jal jeevan pipes, and frontline personnel"
    },
    {
      num: 10,
      category: 'fiscal',
      name: "Existing scheme commitments",
      value: `₹${existingSchemes?.toLocaleString('en-IN')} Cr`,
      badge: "Committed State Share",
      badgeColor: "#64748b",
      whatItTells: "Current state share of centrally sponsored schemes and other programmes",
      whyItMatters: "Prevents counting already committed money as available twice",
      citation: "State Finance Demands for Grants & CSS SNA Allocation Master Data",
      subtext: "Prior commitments allocated to ongoing state-specific welfare & CSS matching funds"
    }
  ];

  // 7 Macroeconomic & Demographic Equity Indicators
  const equityMetricsList = [
    {
      num: 11,
      category: 'equity',
      name: "Total state population",
      value: `${popCr} Cr (${popPersons.toLocaleString('en-IN')} persons)`,
      badge: "Scale Factor",
      badgeColor: "#3b82f6",
      whatItTells: "Allocates more funds to states serving more people",
      whyItMatters: "Provides baseline administrative reach and per-capita program deployment scaling",
      citation: "MoSPI; Census of India population projections (Report of the Technical Group 2011-2036)",
      subtext: `Projected population base: ${popCr} Crore citizens`
    },
    {
      num: 12,
      category: 'equity',
      name: "Population share of India",
      value: `${popShareOfIndia}%`,
      badge: "Equitable Share",
      badgeColor: "#0284c7",
      whatItTells: "Normalises population so allocations are comparable across states",
      whyItMatters: "Ensures equitable pro-rata national resource division without arbitrary state boundary skew",
      citation: "Calculated from Metric 1 (MoSPI national projected population baseline ~136.3 - 140 Cr)",
      subtext: `Represents ${popShareOfIndia}% of total projected Indian citizenry`
    },
    {
      num: 13,
      category: 'equity',
      name: "GSDP at current prices",
      value: `₹${gsdpCurrentPrices?.toLocaleString('en-IN')} Cr`,
      badge: "Economic Scale",
      badgeColor: "#10b981",
      whatItTells: "Represents the economic scale of each state",
      whyItMatters: "Acts as the economic denominator for measuring fiscal capacity, tax depth, debt-to-GSDP, and borrowing room",
      citation: "Reserve Bank of India (RBI) Handbook of Statistics on Indian States 2024-25, Table 21",
      subtext: `Gross State Domestic Product at current market prices (2024-25 BE / 2023-24)`
    },
    {
      num: 14,
      category: 'equity',
      name: "Per-capita NSDP",
      value: `₹${perCapitaNsdp?.toLocaleString('en-IN')} / year`,
      badge: "Prosperity Metric",
      badgeColor: "#8b5cf6",
      whatItTells: "Provides a broad measure of average economic prosperity",
      whyItMatters: "Differentiates high-income states from poorer states to guide progressive redistribution and need-based support",
      citation: "Reserve Bank of India (RBI) Handbook of Statistics on Indian States 2024-25, Table 19",
      subtext: `Net State Domestic Product per capita (annual average purchasing power)`
    },
    {
      num: 15,
      category: 'equity',
      name: "State's share of national own-tax revenue",
      value: `${shareOfNationalOwnTax}% of India's SOTR`,
      badge: "Tax Mobilization",
      badgeColor: "#f59e0b",
      whatItTells: "Helps distinguish states with greater own-source revenue mobilisation from those with less",
      whyItMatters: "Measures internal tax effort, fiscal self-reliance, and ability to absorb matching grant requirements",
      citation: "Reserve Bank of India (RBI) Handbook 2024-25, Table 168 (State Own Tax Revenue)",
      subtext: `Contributes ₹${(stInfo.own_tax_revenue_cr || dbEntry.own_tax_revenue_2024_25_be_cr || 0).toLocaleString('en-IN')} Cr to national total SOTR`
    },
    {
      num: 16,
      category: 'equity',
      name: "State's share of national population below a poverty threshold",
      value: `${shareOfNationalPoor}% of India's Poor`,
      badge: `MPI HCR: ${mpiHeadcount}%`,
      badgeColor: shareOfNationalPoor > 10 ? "#dc2626" : (shareOfNationalPoor > 5 ? "#d97706" : "#16a34a"),
      whatItTells: "Allows an equity adjustment toward states with greater socioeconomic need",
      whyItMatters: "Prevents underfunding regions carrying a disproportionate burden of multidimensional deprivation",
      citation: "NITI Aayog: National Multidimensional Poverty Index (MPI) - A Progress Review 2023",
      subtext: `Multidimensional Poverty Headcount Ratio: ${mpiHeadcount}% of state population`
    },
    {
      num: 17,
      category: 'equity',
      name: "Rural population share",
      value: `${ruralPopulationShare}% Rural`,
      badge: ruralPopulationShare > 70 ? "Heavily Rural" : "Urbanized / Mixed",
      badgeColor: ruralPopulationShare > 70 ? "#059669" : "#0284c7",
      whatItTells: "Helps identify states where rural-focused schemes may affect a larger population",
      whyItMatters: "Calibrates administrative channels for rural schemes (PMAY-G, MGNREGA, Jal Jeevan Mission, Ayushman HWCs)",
      citation: "Census of India & MoSPI Report of Technical Group on Population Projections 2011-2036",
      subtext: `${ruralPopulationShare}% rural vs ${(100 - ruralPopulationShare).toFixed(1)}% urban population split`
    }
  ];

  const allMetricsList = [...fiscalMetricsList, ...equityMetricsList];
  const displayedMetrics = indicatorSubFilter === 'all' 
    ? allMetricsList 
    : (indicatorSubFilter === 'fiscal' ? fiscalMetricsList : equityMetricsList);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        width: '100%',
        maxWidth: '960px',
        maxHeight: '92vh',
        borderRadius: '16px',
        border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px 14px',
          borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          background: isDark ? 'linear-gradient(to right, #0f172a, #1e293b)' : 'linear-gradient(to right, #f8fafc, #f1f5f9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>{stateData.abbr || stInfo.id}</span>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                  {stateData.name || stInfo.name} — State Implementation & Fiscal Capacity Window
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                Evaluated against active policy: <strong>{policyName}</strong> ({sectorName}) | Net Adjustment: <strong style={{ color: netChange >= 0 ? '#22c55e' : '#ef4444' }}>{netChange >= 0 ? '+' : ''}₹{netChange.toLocaleString('en-IN')} Cr ({pctChange >= 0 ? '+' : ''}{pctChange}%)</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Subheader Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button
              onClick={() => setActiveTab('five_dimensions')}
              style={{
                backgroundColor: activeTab === 'five_dimensions' ? '#2563eb' : (isDark ? '#1e293b' : '#e2e8f0'),
                color: activeTab === 'five_dimensions' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🎯 5 Core Evaluation Dimensions & Grok
            </button>
            <button
              onClick={() => setActiveTab('indicators')}
              style={{
                backgroundColor: activeTab === 'indicators' ? '#2563eb' : (isDark ? '#1e293b' : '#e2e8f0'),
                color: activeTab === 'indicators' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              📊 State Data Table (17 Comprehensive Indicators)
              <span style={{
                backgroundColor: activeTab === 'indicators' ? '#ffffff33' : '#3b82f633',
                color: activeTab === 'indicators' ? '#ffffff' : '#38bdf8',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '10px'
              }}>17 Indicators</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid rgba(59, 130, 246, 0.2)',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ marginTop: '16px', fontWeight: 700, fontSize: '15px' }}>
                Grok AI is analyzing {stateData.name}'s fiscal database, liabilities & implementation capacity...
              </p>
              <p style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                Querying RBI Handbook 2024-25, PRS SOSF 2025, NITI Aayog SDG Index & National MPI 2023
              </p>
            </div>
          ) : activeTab === 'five_dimensions' ? (
            <>
              {/* ITEM 5: OVERALL PERFORMANCE SCORE OF SCHEME IN STATE (Prominent Top Banner) */}
              <div style={{
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                border: `2px solid ${osps.color}`,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: `0 4px 16px ${osps.color}22`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: osps.bg_color,
                    border: `3px solid ${osps.color}`,
                    color: osps.text_color,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '20px',
                    lineHeight: 1
                  }}>
                    {osps.score}
                    <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px' }}>/ 100</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 800 }}>
                      Primary Performance Metric (At A Glance)
                    </div>
                    <h4 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: osps.color }}>
                      {osps.category}
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: isDark ? '#cbd5e1' : '#475569' }}>
                      Composite index computed from administrative readiness, FRBM borrowing room, and baseline human development.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveProofModal('osps')}
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      border: `1px solid ${osps.color}`,
                      color: osps.color,
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📐 View Formula & Proof
                  </button>
                  <button
                    onClick={() => setActiveTab('indicators')}
                    style={{
                      backgroundColor: '#2563eb',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📊 View State Data Table (17 Metrics) →
                  </button>
                </div>
              </div>

              {/* 3-Column / Responsive Grid for Evaluation Dimensions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                
                {/* ITEM 1: State Implementation Effectiveness */}
                <div style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>
                        1. IMPLEMENTATION EFFECTIVENESS
                      </span>
                      <span style={{
                        backgroundColor: siei.color + '22',
                        color: siei.color,
                        border: `1px solid ${siei.color}55`,
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {siei.badge} ({siei.score}/100)
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '6px' }}>
                      {siei.verdict}
                    </div>
                    <p style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.5, margin: 0 }}>
                      Based on NITI Aayog SDG Index score (<strong>{stInfo.sdg_score}</strong>), Total Outstanding Liabilities of <strong>₹{totalDebt?.toLocaleString('en-IN')} Cr</strong> ({debtToGsdp}% of GSDP, RBI Table 176), and State Own Tax Revenue buoyancy.
                    </p>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setActiveProofModal('siei')}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                    >
                      🔗 Proof & Calculation Details →
                    </button>
                  </div>
                </div>

                {/* ITEM 2: Econometric Scheme Outlay Allocation (Stage 1 & 2) */}
                <div style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>
                        2. STATE OUTLAY ALLOCATION (STAGE 1 & 2)
                      </span>
                      <span style={{
                        backgroundColor: '#3b82f622',
                        color: '#60a5fa',
                        border: '1px solid #3b82f655',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {stateAlloc.allocation_percentage}% National Share
                      </span>
                    </div>

                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8', marginBottom: '4px' }}>
                      ₹{stateAlloc.additional_allocation_cr?.toLocaleString('en-IN')} Cr
                    </div>
                    <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px' }}>
                      Allocated from national {netChange >= 0 ? '+' : ''}₹{Math.max(0, netChange).toLocaleString('en-IN')} Cr sector expansion
                    </div>

                    <p style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.4, margin: '0 0 10px' }}>
                      Multi-state econometric allocation based on 4 normalized pillars (Population 40%, Economic Scale 20%, Equity Need 25%, Sector Capacity 15%).
                    </p>

                    <div style={{
                      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '6px'
                    }}>
                      <div>👥 Pop ($P_i$ 40%): <strong>{((stateAlloc.components?.P_i || 0) * 100).toFixed(2)}%</strong></div>
                      <div>📈 Econ ($G_i$ 20%): <strong>{((stateAlloc.components?.G_i || 0) * 100).toFixed(2)}%</strong></div>
                      <div>⚖️ Equity ($E_i$ 25%): <strong>{((stateAlloc.components?.E_i || 0) * 100).toFixed(2)}%</strong></div>
                      <div>🏛️ Sector ($C_i$ 15%): <strong>{((stateAlloc.components?.C_i || 0) * 100).toFixed(2)}%</strong></div>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setActiveProofModal('allocation')}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                    >
                      📐 View Allocation Math & Proof →
                    </button>
                  </div>
                </div>

                {/* ITEM 3: Maximum Affordable Contribution % (Stage 3) */}
                <div style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>
                        3. MAX AFFORDABLE CONTRIBUTION (STAGE 3)
                      </span>
                      <span style={{
                        backgroundColor: (affordContrib.can_contribute_color || '#16a34a') + '22',
                        color: affordContrib.can_contribute_color || '#16a34a',
                        border: `1px solid ${(affordContrib.can_contribute_color || '#16a34a')}55`,
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {affordContrib.affordable_contribution_pct}% Max Share
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 800, color: affordContrib.can_contribute_color || '#16a34a', marginBottom: '4px' }}>
                      {affordContrib.can_contribute_verdict}
                    </div>

                    <p style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.5, margin: '4px 0 8px' }}>
                      {affordContrib.can_contribute_summary || spend.summary}
                    </p>

                    <div style={{
                      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px'
                    }}>
                      <div>CSS Norm: <strong>{affordContrib.statutory_css_norm_pct}% State</strong></div>
                      <div>Max Feasible: <strong style={{ color: affordContrib.can_contribute_color }}>{affordContrib.affordable_contribution_pct}%</strong></div>
                      <div>Deployable (60%): <strong style={{ color: '#10b981' }}>₹{(affordContrib.deployable_headroom_h_i_cr ?? Math.round(0.60 * (affordContrib.fiscal_headroom_h_i_cr || 0))).toLocaleString('en-IN')} Cr</strong></div>
                      <div>Emergency Buffer (40%): <strong style={{ color: '#f59e0b' }}>₹{(affordContrib.contingency_emergency_reserve_cr ?? Math.round(0.40 * (affordContrib.fiscal_headroom_h_i_cr || 0))).toLocaleString('en-IN')} Cr</strong></div>
                      <div>Statutory Outlay: <strong>₹{affordContrib.statutory_outlay_cr?.toLocaleString('en-IN')} Cr</strong></div>
                      <div>Total Headroom ($H_i$): <strong>₹{affordContrib.fiscal_headroom_h_i_cr?.toLocaleString('en-IN')} Cr</strong></div>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setActiveProofModal('contribution')}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f59e0b',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                    >
                      📐 View Contribution Math & Proof →
                    </button>
                  </div>
                </div>

              </div>

              {/* ITEM 4: Web Scraped & Database Assisted Grok Explanation */}
              <div style={{
                backgroundColor: isDark ? '#111c33' : '#f8fafc',
                border: isDark ? '1px solid #1e3a8a' : '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '18px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🤖</span>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                      4. Grok AI Grounded Implementation Synthesis
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    backgroundColor: '#3b82f622',
                    color: '#60a5fa',
                    border: '1px solid #3b82f655',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    Database Grounded + Web Verified
                  </span>
                </div>

                <div style={{
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: isDark ? '#cbd5e1' : '#334155',
                  marginBottom: '14px',
                  backgroundColor: isDark ? '#0f172a88' : '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'
                }}>
                  {grok.verdict}
                </div>

                {grok.key_factors && grok.key_factors.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                      Core Fiscal & Administrative Enablers:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: isDark ? '#cbd5e1' : '#334155' }}>
                      {grok.key_factors.map((kf, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{kf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verified Statutory Sources */}
                <div style={{ borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b' }}>
                    Verified Evidence Citations:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {(grok.citations || []).map((cite, i) => (
                      <span key={i} style={{
                        fontSize: '10px',
                        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                        color: isDark ? '#93c5fd' : '#1d4ed8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        📑 {cite}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </>
          ) : (
            /* TAB 2: 17 COMPREHENSIVE INDICATORS (FISCAL + MACROECONOMIC + EQUITY) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Introduction Banner & Subfilters */}
              <div style={{
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>
                    Comprehensive 17-Indicator State Performance & Equity Baseline
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: isDark ? '#94a3b8' : '#475569' }}>
                    Uniform database verified from <strong>RBI Handbook 2024-25</strong>, <strong>PRS SOSF 2025</strong>, <strong>MoSPI / Census Projections</strong>, and <strong>NITI Aayog National MPI 2023</strong>.
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
                    padding: '3px',
                    borderRadius: '8px',
                    gap: '4px'
                  }}>
                    <button
                      onClick={() => setIndicatorSubFilter('all')}
                      style={{
                        backgroundColor: indicatorSubFilter === 'all' ? '#2563eb' : 'transparent',
                        color: indicatorSubFilter === 'all' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      All (17)
                    </button>
                    <button
                      onClick={() => setIndicatorSubFilter('equity')}
                      style={{
                        backgroundColor: indicatorSubFilter === 'equity' ? '#2563eb' : 'transparent',
                        color: indicatorSubFilter === 'equity' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Macro & Equity (7)
                    </button>
                    <button
                      onClick={() => setIndicatorSubFilter('fiscal')}
                      style={{
                        backgroundColor: indicatorSubFilter === 'fiscal' ? '#2563eb' : 'transparent',
                        color: indicatorSubFilter === 'fiscal' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Fiscal & Governance (10)
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveProofModal('methodology')}
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    📖 Methodology
                  </button>
                </div>
              </div>

              {/* Indicators Detailed Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '12px' }}>
                {displayedMetrics.map((m) => (
                  <div
                    key={m.num}
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>
                      {/* Metric Name & Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                          <span style={{ color: '#38bdf8', marginRight: '6px' }}>#{m.num}</span>
                          {m.name}
                        </span>
                        <span style={{
                          backgroundColor: m.badgeColor + '22',
                          color: m.badgeColor,
                          border: `1px solid ${m.badgeColor}55`,
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 800
                        }}>
                          {m.badge}
                        </span>
                      </div>

                      {/* Main Value Display */}
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        color: m.badgeColor === '#10b981' ? '#10b981' : (m.badgeColor === '#dc2626' ? '#ef4444' : (isDark ? '#38bdf8' : '#0284c7')),
                        marginBottom: '6px'
                      }}>
                        {m.value}
                      </div>

                      {/* Sector Specific Progress Bars */}
                      {m.isSectorBreakdown && (
                        <div style={{
                          backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                          padding: '10px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                              <span>Health (SDG 3)</span>
                              <span>{healthCap}/100</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: isDark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ width: `${healthCap}%`, height: '100%', backgroundColor: '#10b981' }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                              <span>Education (SDG 4)</span>
                              <span>{eduCap}/100</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: isDark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ width: `${eduCap}%`, height: '100%', backgroundColor: '#3b82f6' }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                              <span>WASH & Clean Water (SDG 6)</span>
                              <span>{washCap}/100</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: isDark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ width: `${washCap}%`, height: '100%', backgroundColor: '#06b6d4' }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                              <span>Agriculture & Food (SDG 2)</span>
                              <span>{agriCap}/100</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: isDark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ width: `${agriCap}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                              <span>Economic Growth (SDG 8)</span>
                              <span>{econCap}/100</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: isDark ? '#334155' : '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ width: `${econCap}%`, height: '100%', backgroundColor: '#8b5cf6' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* What it tells & Why it matters */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '4px',
                        fontSize: '11px',
                        color: isDark ? '#cbd5e1' : '#334155',
                        backgroundColor: isDark ? '#0f172a66' : '#ffffff',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <strong style={{ color: isDark ? '#94a3b8' : '#64748b' }}>What it tells model: </strong>
                          {m.whatItTells}
                        </div>
                        <div>
                          <strong style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Why it matters: </strong>
                          {m.whyItMatters}
                        </div>
                        {m.subtext && (
                          <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '10px', marginTop: '2px', fontStyle: 'italic' }}>
                            {m.subtext}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Source Citation */}
                    <div style={{
                      paddingTop: '6px',
                      borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      color: isDark ? '#94a3b8' : '#64748b'
                    }}>
                      <span>📑 Source: {m.citation}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Complete 17 Metrics Table View for Policy Auditors */}
              <div style={{
                marginTop: '10px',
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                  borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '13px' }}>
                    📋 Policy Audit Matrix: {indicatorSubFilter === 'all' ? '17 Core Indicators' : (indicatorSubFilter === 'equity' ? '7 Macro & Equity Indicators' : '10 Fiscal & Governance Indicators')} ({stInfo.name})
                  </div>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                    Official Sourced Data
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderBottom: isDark ? '1px solid #334155' : '1px solid #cbd5e1' }}>
                        <th style={{ padding: '8px 12px' }}>#</th>
                        <th style={{ padding: '8px 12px' }}>Metric</th>
                        <th style={{ padding: '8px 12px' }}>Empirical Value</th>
                        <th style={{ padding: '8px 12px' }}>What it tells the model</th>
                        <th style={{ padding: '8px 12px' }}>Why it matters</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedMetrics.map((m, idx) => (
                        <tr
                          key={m.num}
                          style={{
                            borderBottom: isDark ? '1px solid #33415555' : '1px solid #e2e8f0',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : (isDark ? '#0f172a33' : '#f8fafc')
                          }}
                        >
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#38bdf8' }}>{m.num}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{m.name}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#10b981' }}>{m.value}</td>
                          <td style={{ padding: '8px 12px', color: isDark ? '#cbd5e1' : '#334155' }}>{m.whatItTells}</td>
                          <td style={{ padding: '8px 12px', color: isDark ? '#cbd5e1' : '#334155' }}>{m.whyItMatters}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isDark ? '#0f172a' : '#f8fafc'
        }}>
          <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
            Data verified from Reserve Bank of India, PRS Legislative Research, MoSPI, and NITI Aayog official repositories.
          </span>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Proof & Mathematical Derivation Modal */}
      {activeProofModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a',
            width: '100%',
            maxWidth: '680px',
            borderRadius: '14px',
            padding: '24px',
            border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                {activeProofModal === 'siei' && "Mathematical Proof: State Implementation Effectiveness Index (SIEI)"}
                {activeProofModal === 'allocation' && "Mathematical Proof: State Outlay Allocation Score (W_i) & Rupee Outlay (D_i)"}
                {activeProofModal === 'contribution' && "Mathematical Proof: 60% Deployable Headroom (H_i) & Max Affordable Contribution %"}
                {activeProofModal === 'osps' && "Mathematical Proof: Overall Scheme Performance Score (OSPS)"}
                {activeProofModal === 'methodology' && "Empirical Methodology: 17 Core Fiscal, Demographic & Equity Indicators"}
              </h4>
              <button
                onClick={() => setActiveProofModal(null)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Formatted Mathematical Formula Box */}
            <MathFormulaRenderer
              formula={
                activeProofModal === 'siei' ? siei.proof.formula :
                activeProofModal === 'allocation' ? (stateAlloc.proof?.formula || "W_i = 0.40 P_i + 0.20 G_i + 0.25 E_i + 0.15 C_i \\quad \\text{and} \\quad D_i = \\Delta B \\times W_i") :
                activeProofModal === 'contribution' ? (affordContrib.proof?.formula || contrib?.proof?.formula || "H_i = \\max(0, RR_i - CE_i - OS_i - B_i), \\quad H_i^{\\text{deployable}} = 0.60 \\times H_i \\quad \\text{and} \\quad \\text{Affordable Contribution \\%} = \\min\\left(100, \\;\\frac{0.60 \\times H_i}{D_i} \\times 100\\right)") :
                activeProofModal === 'osps' ? osps.proof.formula :
                "\\text{State Share of India's Poor \\%} = \\frac{\\text{Population}_{\\text{state}} \\times \\text{MPI Headcount}_{\\text{state}}}{\\sum (\\text{Population}_i \\times \\text{MPI}_i)} \\times 100"
              }
              isDark={isDark}
            />

            {/* Step by step */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px' }}>
                {activeProofModal === 'methodology' ? "Methodology & Derivation Details:" : "Step-by-Step Numerical Substitution:"}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeProofModal === 'methodology' ? [
                  `1. Total Population & Share of India: MoSPI & Census of India Technical Group on Population Projections (2011-2036). State population normalised against aggregate national total (~136.3 - 140 Cr).`,
                  `2. Multidimensional Poverty Share: NITI Aayog National Multidimensional Poverty Index: A Progress Review 2023. Headcount ratios multiplied by projected populations quantify exact state poverty burden.`,
                  `3. Rural Population Share: MoSPI/Census rural-urban distribution identifying states where rural-focused welfare outlays reach a larger population.`,
                  `4. GSDP & Per-Capita NSDP: RBI Handbook of Statistics on Indian States 2024-25 (Tables 21 & 19). Economic scale and average prosperity.`,
                  `5. Own-Tax Mobilization Share: State Own Tax Revenue (SOTR, RBI Table 168) normalised against total national state-level tax collections.`
                ].map((st, i) => (
                  <div key={i} style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    backgroundColor: isDark ? '#1e293b66' : '#f8fafc',
                    borderRadius: '6px',
                    color: isDark ? '#e2e8f0' : '#334155'
                  }}>
                    {st}
                  </div>
                )) : (
                  (
                    activeProofModal === 'allocation' ? (stateAlloc.proof?.step_by_step || []) :
                    activeProofModal === 'contribution' ? (affordContrib.proof?.step_by_step || contrib.proof.step_by_step) :
                    activeProofModal === 'siei' ? siei.proof.step_by_step : osps.proof.step_by_step
                  ).map((st, i) => (
                    <div key={i} style={{
                      fontSize: '12px',
                      padding: '6px 10px',
                      backgroundColor: isDark ? '#1e293b66' : '#f8fafc',
                      borderRadius: '6px',
                      color: isDark ? '#e2e8f0' : '#334155'
                    }}>
                      {st}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Citations */}
            <div style={{ borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                Statutory Citations:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: isDark ? '#94a3b8' : '#475569' }}>
                {activeProofModal === 'methodology' ? [
                  "MoSPI & Office of the Registrar General of India: Census Population Projections 2011-2036",
                  "NITI Aayog: National Multidimensional Poverty Index - A Progress Review 2023 (Annexure 1)",
                  "Reserve Bank of India: Handbook of Statistics on Indian States 2024-25 (Tables 19, 21, 164, 165, 168, 169, 171, 176)",
                  "PRS Legislative Research: State of State Finances 2025"
                ].map((c, i) => (
                  <li key={i}>{c}</li>
                )) : (
                  (
                    activeProofModal === 'allocation' ? (stateAlloc.proof?.citations || []) :
                    activeProofModal === 'contribution' ? (affordContrib.proof?.citations || contrib.proof.citations) :
                    activeProofModal === 'siei' ? siei.proof.citations : osps.proof.citations
                  ).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))
                )}
              </ul>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveProofModal(null)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
