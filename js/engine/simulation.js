/**
 * simulation.js
 * Monte Carlo Simulation Engine — lightweight, no LLM calls.
 * Runs 1000 simulation rounds per execution using causal weights + noise.
 */

class SimulationEngine {

  constructor(policy, states, subgroups, objective = 'hdi') {
    this.policy = policy;
    this.states = states;
    this.subgroups = subgroups;
    this.objective = objective;
    this.rounds = 1000;
    this.results = null;
  }

  /**
   * Run full Monte Carlo simulation.
   * Returns aggregated results with distributions & confidence intervals.
   */
  run(onProgress = null) {
    const rounds = this.rounds;
    const states = this.states;
    const policy = this.policy;
    const subgroups = this.subgroups;

    // Accumulators: per-state, per-metric
    const stateAccum = {};
    states.forEach(st => {
      stateAccum[st.id] = {
        hdi:[], emp:[], income:[], health:[], pov:[], gini:[], lit:[],
      };
    });

    // Subgroup accumulators
    const subAccum = {};
    subgroups.forEach(sg => {
      subAccum[sg.id] = { hdi:[], emp:[], income:[], pov:[], gini:[] };
    });

    // National accumulators
    const nationalAccum = { hdi:[], emp:[], income:[], pov:[], gini:[], health:[], lit:[] };

    // Run rounds
    for (let r = 0; r < rounds; r++) {
      states.forEach(st => {
        const stResult = this._simulateState(st, policy, 'overall', 1.0);
        Object.keys(stResult).forEach(k => {
          if (stateAccum[st.id][k]) stateAccum[st.id][k].push(stResult[k]);
        });
        Object.keys(stResult).forEach(k => {
          if (nationalAccum[k]) nationalAccum[k].push(stResult[k]);
        });
      });

      subgroups.forEach(sg => {
        // National average for subgroup
        const stateResults = states.map(st => this._simulateState(st, policy, sg.id, sg.mult));
        const avg = {};
        ['hdi','emp','income','pov','gini'].forEach(k => {
          avg[k] = stateResults.reduce((s, r) => s + (r[k] || 0), 0) / stateResults.length;
        });
        Object.keys(avg).forEach(k => subAccum[sg.id][k].push(avg[k]));
      });

      if (onProgress && r % 100 === 0) onProgress(r / rounds);
    }

    // Aggregate
    this.results = {
      states:   this._aggregateStates(stateAccum, states),
      national: this._aggregateSeries(nationalAccum),
      subgroups: this._aggregateSubgroups(subAccum, subgroups),
      policy: { ...policy },
      objective: this.objective,
      timestamp: Date.now(),
    };

    if (onProgress) onProgress(1.0);
    return this.results;
  }

  /**
   * Simulate a single state for one Monte Carlo round.
   */
  _simulateState(state, policy, subgroupId, subgroupMult) {
    const b = state.b;
    const weights = INDIA_DATA.causalWeights;
    const baseline = INDIA_DATA.policyBaseline;
    const mult = typeof subgroupMult === 'object' ? subgroupMult : { mgnrega:subgroupMult||1, health:subgroupMult||1, education:subgroupMult||1, credit:subgroupMult||1, subsidy:subgroupMult||1 };

    // Compute policy-induced deltas for each outcome
    const deltas = { emp:0, income:0, health:0, hdi:0, pov:0, gini:0, lit:0 };

    Object.keys(policy).forEach(lever => {
      const pChange = (policy[lever] - baseline[lever]) / Math.max(baseline[lever], 0.01);
      const lw = weights[lever] || {};
      const m = mult[lever] || 1.0;
      const noiseScale = 0.02 + Math.abs(pChange) * 0.1;

      deltas.emp    += (lw.employment_rate   || 0) * pChange * m + this._noise(noiseScale);
      deltas.income += (lw.income_pc         || 0) * pChange * m + this._noise(noiseScale * 0.8);
      deltas.health += (lw.healthcare_access || 0) * pChange * m + this._noise(noiseScale * 0.6);
      deltas.hdi    += (lw.hdi               || 0) * pChange * m + this._noise(noiseScale * 0.5);
      deltas.pov    += (lw.poverty_rate      || 0) * pChange * m + this._noise(noiseScale * 0.7);
      deltas.gini   += (lw.gini              || 0) * pChange * m + this._noise(noiseScale * 0.4);
      deltas.lit    += (lw.lit               || 0) * pChange * m + this._noise(noiseScale * 0.3);
    });

    // Apply regional heterogeneity
    const regionFactor = this._getRegionFactor(state.region);

    return {
      emp:    this._clamp(b.emp    + deltas.emp    * regionFactor, 0.2, 0.95),
      income: Math.max(20, b.income * (1 + deltas.income * regionFactor)),
      health: this._clamp(b.health  + deltas.health  * regionFactor, 0.2, 0.99),
      hdi:    this._clamp(b.hdi     + deltas.hdi     * regionFactor, 0.3, 0.99),
      pov:    this._clamp(b.pov     + deltas.pov     * regionFactor, 0.01, 0.7),
      gini:   this._clamp(b.gini    + deltas.gini    * regionFactor, 0.2, 0.6),
      lit:    this._clamp(b.lit     + deltas.lit     * regionFactor, 0.3, 0.99),
    };
  }

  /**
   * Aggregate per-state results from all rounds.
   */
  _aggregateStates(stateAccum, states) {
    return states.map(st => {
      const acc = stateAccum[st.id];
      const agg = {};
      Object.keys(acc).forEach(k => {
        agg[k] = acc[k].length > 0 ? this._stats(acc[k]) : null;
      });
      return { ...st, simulated: agg };
    });
  }

  /**
   * Aggregate national series results.
   */
  _aggregateSeries(nationalAccum) {
    const agg = {};
    Object.keys(nationalAccum).forEach(k => {
      agg[k] = nationalAccum[k].length > 0 ? this._stats(nationalAccum[k]) : null;
    });
    return agg;
  }

  /**
   * Aggregate subgroup results.
   */
  _aggregateSubgroups(subAccum, subgroups) {
    return subgroups.map(sg => {
      const acc = subAccum[sg.id];
      const agg = {};
      Object.keys(acc).forEach(k => {
        agg[k] = acc[k].length > 0 ? this._stats(acc[k]) : null;
      });
      return { ...sg, simulated: agg };
    });
  }

  /**
   * Compute descriptive statistics from an array of numbers.
   */
  _stats(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = arr.reduce((s, v) => s + v, 0) / n;
    const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    return {
      mean,
      std,
      median: sorted[Math.floor(n / 2)],
      p5:  sorted[Math.floor(n * 0.05)],
      p25: sorted[Math.floor(n * 0.25)],
      p75: sorted[Math.floor(n * 0.75)],
      p95: sorted[Math.floor(n * 0.95)],
      min: sorted[0],
      max: sorted[n - 1],
      ci_lower: mean - 1.96 * std / Math.sqrt(n),
      ci_upper: mean + 1.96 * std / Math.sqrt(n),
      histogram: this._histogram(sorted, 20),
    };
  }

  /**
   * Build histogram buckets for distribution visualization.
   */
  _histogram(sorted, bins) {
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const width = (max - min) / bins || 0.01;
    const counts = new Array(bins).fill(0);
    sorted.forEach(v => {
      const idx = Math.min(bins - 1, Math.floor((v - min) / width));
      counts[idx]++;
    });
    return counts.map((count, i) => ({
      x: min + (i + 0.5) * width,
      y: count / sorted.length,
    }));
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Box-Muller normal random */
  _noise(scale) {
    const u = Math.random(), v = Math.random();
    return scale * Math.sqrt(-2 * Math.log(u + 1e-10)) * Math.cos(2 * Math.PI * v);
  }

  _clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  _getRegionFactor(region) {
    const map = { North:1.0, South:1.05, East:0.95, West:1.03, Central:0.97, Northeast:0.93 };
    return (map[region] || 1.0) * (0.97 + Math.random() * 0.06);
  }
}
