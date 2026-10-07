/**
 * causal_engine.js
 * Causal Inference Engine: DiD / PSM / Heterogeneous Treatment Effects.
 * Simulated statistically — no LLM calls.
 */

class CausalEngine {

  /**
   * Difference-in-Differences (DiD)
   * Compares outcomes before/after policy change in treatment vs control states.
   * @param {Object} policy - Current policy params
   * @param {Object} baseline - Baseline policy params
   * @param {Array}  states - INDIA_DATA.states
   * @returns {Object} DiD results per outcome
   */
  static computeDiD(policy, baseline, states) {
    const weights = INDIA_DATA.causalWeights;
    const outcomes = ['employment_rate','income','healthcare_access','hdi','poverty_rate','gini'];
    const results = {};

    outcomes.forEach(outcome => {
      let totalEffect = 0;
      let ci95 = 0;

      // Sum effects from all policy levers
      Object.keys(policy).forEach(lever => {
        const change = (policy[lever] - baseline[lever]) / baseline[lever]; // relative change
        const leverWeights = weights[lever] || {};
        const outcomeKey = CausalEngine._mapOutcomeKey(outcome, lever);
        const w = leverWeights[outcomeKey] || 0;
        totalEffect += w * change;
      });

      // Add statistical noise for realism
      const noise = (Math.random() - 0.5) * 0.04;
      totalEffect += noise;

      // 95% CI: based on effect size (smaller effects have wider CIs)
      ci95 = 0.01 + Math.abs(totalEffect) * 0.22 + Math.random() * 0.008;

      results[outcome] = {
        ate: totalEffect,               // Average Treatment Effect
        ci_lower: totalEffect - ci95,
        ci_upper: totalEffect + ci95,
        p_value: CausalEngine._computePValue(Math.abs(totalEffect), ci95),
        significant: Math.abs(totalEffect) > ci95 * 0.8,
        effect_label: CausalEngine._effectLabel(totalEffect),
      };
    });

    return results;
  }

  /**
   * Propensity Score Matching (PSM)
   * Matches treatment states (high-policy) to similar control states.
   * Returns ATT (Average Treatment effect on the Treated).
   */
  static computePSM(policy, states, primaryOutcome = 'hdi') {
    // Split states into high-policy (treated) and low-policy (control) based on HDI
    const sorted = [...states].sort((a, b) => a.b.hdi - b.b.hdi);
    const n = sorted.length;
    const treated = sorted.slice(Math.floor(n * 0.6)); // top 40% HDI = "treated"
    const control = sorted.slice(0, Math.floor(n * 0.6));

    const treatmentMean = treated.reduce((s, st) => s + st.b[CausalEngine._bKey(primaryOutcome)], 0) / treated.length;
    const controlMean   = control.reduce((s, st) => s + st.b[CausalEngine._bKey(primaryOutcome)], 0) / control.length;

    const policyMultiplier = CausalEngine._policyMultiplier(policy);
    const rawDiff = treatmentMean - controlMean;
    const att = rawDiff * policyMultiplier * (0.85 + Math.random() * 0.3);
    const se = Math.abs(att) * 0.18 + 0.005;

    return {
      att,
      se,
      ci_lower: att - 1.96 * se,
      ci_upper: att + 1.96 * se,
      n_treated: treated.length,
      n_control: control.length,
      matched_pairs: Math.min(treated.length, control.length),
      balance_achieved: 0.82 + Math.random() * 0.12,
    };
  }

  /**
   * Heterogeneous Treatment Effects (HTE)
   * Computes subgroup-specific treatment effects.
   * Approximates Causal Forests via subgroup multipliers.
   */
  static computeHTE(policy, baseline, subgroups, primaryOutcome = 'hdi') {
    const overallDiD = CausalEngine.computeDiD(policy, baseline, INDIA_DATA.states);
    const overallATE = overallDiD[CausalEngine._mapOutcomeKey2(primaryOutcome)] || {};

    const results = subgroups.map(subgroup => {
      const leverEffects = {};
      let totalEffect = 0;

      Object.keys(policy).forEach(lever => {
        const policyChange = (policy[lever] - baseline[lever]) / baseline[lever];
        const weights = INDIA_DATA.causalWeights[lever] || {};
        const outKey = CausalEngine._outcomeWeightKey(primaryOutcome);
        const baseEffect = (weights[outKey] || 0) * policyChange;
        const subMult = subgroup.mult[lever] || 1.0;
        const noise = (Math.random() - 0.5) * 0.015;
        leverEffects[lever] = baseEffect * subMult + noise;
        totalEffect += leverEffects[lever];
      });

      const noise = (Math.random() - 0.5) * 0.02;
      totalEffect += noise;
      const se = Math.abs(totalEffect) * 0.15 + 0.004;

      return {
        subgroup: subgroup.id,
        label: subgroup.label,
        ate: totalEffect,
        se,
        ci_lower: totalEffect - 1.96 * se,
        ci_upper: totalEffect + 1.96 * se,
        leverEffects,
        relative_to_overall: overallATE.ate ? totalEffect / overallATE.ate : 1,
        significant: Math.abs(totalEffect) > 1.65 * se,
      };
    });

    return results;
  }

  /**
   * Time-series projection: project outcomes over 5 years
   */
  static projectTimeSeries(policy, baseline, state, years = 5) {
    const outcomes = ['hdi','employment_rate','poverty_rate','income'];
    const projection = {};

    outcomes.forEach(metric => {
      const baseVal = state.b[CausalEngine._bKey(metric)] || 0;
      const policyChange = CausalEngine._policyMultiplier(policy) - 1;
      const elasticity = CausalEngine._getElasticity(metric);

      projection[metric] = Array.from({ length: years + 1 }, (_, yr) => {
        const trend = baseVal * (1 + policyChange * elasticity * (yr / years));
        const noise = baseVal * (Math.random() - 0.5) * 0.015;
        return {
          year: 2024 + yr,
          value: Math.max(0, Math.min(1, trend + noise)),
          lower: Math.max(0, trend + noise - baseVal * 0.025 * yr),
          upper: Math.min(1, trend + noise + baseVal * 0.025 * yr),
        };
      });
    });

    return projection;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  static _mapOutcomeKey(outcome, lever) {
    const map = {
      employment_rate: 'employment_rate',
      income: 'income_pc',
      healthcare_access: 'healthcare_access',
      hdi: 'hdi',
      poverty_rate: 'poverty_rate',
      gini: 'gini',
    };
    return map[outcome] || outcome;
  }

  static _mapOutcomeKey2(outcome) {
    const map = { hdi:'hdi', employment:'employment_rate', poverty:'poverty_rate', inequality:'gini' };
    return map[outcome] || 'hdi';
  }

  static _outcomeWeightKey(outcome) {
    const map = { hdi:'hdi', employment:'employment_rate', poverty:'poverty_rate', inequality:'gini' };
    return map[outcome] || 'hdi';
  }

  static _bKey(metric) {
    const map = { employment_rate:'emp', income:'income', healthcare_access:'health', hdi:'hdi', poverty_rate:'pov', gini:'gini' };
    return map[metric] || metric;
  }

  static _policyMultiplier(policy) {
    const baseline = INDIA_DATA.policyBaseline;
    let mult = 1;
    Object.keys(policy).forEach(k => {
      if (baseline[k]) mult += (policy[k] - baseline[k]) / baseline[k] * 0.12;
    });
    return Math.max(0.5, Math.min(2, mult));
  }

  static _getElasticity(metric) {
    const map = { hdi:0.35, employment_rate:0.42, poverty_rate:-0.48, income:0.38 };
    return map[metric] || 0.3;
  }

  static _computePValue(effect, ci) {
    const z = effect / (ci / 1.96 + 0.001);
    // Approximate two-tailed p-value
    if (z > 3.3) return 0.001;
    if (z > 2.58) return 0.01;
    if (z > 1.96) return 0.05;
    if (z > 1.65) return 0.10;
    return 0.25 + Math.random() * 0.2;
  }

  static _effectLabel(effect) {
    const abs = Math.abs(effect);
    if (abs < 0.02) return 'Negligible';
    if (abs < 0.06) return 'Small';
    if (abs < 0.12) return 'Moderate';
    if (abs < 0.20) return 'Large';
    return 'Very Large';
  }
}
