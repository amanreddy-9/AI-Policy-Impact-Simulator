/**
 * aggregator.js
 * Aggregation & Analytics: subgroup distributions, state rankings,
 * uncertainty bands, and recommended policy summary generation.
 */

class Aggregator {

  constructor(simResults, causalResults, rlResults = null) {
    this.sim = simResults;
    this.causal = causalResults;
    this.rl = rlResults;
  }

  /**
   * Compute KPI summary cards.
   */
  getKPIs() {
    const nat = this.sim ? this.sim.national : null;
    const baseline = INDIA_DATA.national;

    return [
      {
        label: 'National HDI',
        icon: '📊',
        value: nat ? nat.hdi.mean.toFixed(3) : baseline.hdi.toFixed(3),
        delta: nat ? ((nat.hdi.mean - baseline.hdi) / baseline.hdi * 100).toFixed(1) + '%' : '–',
        positive: nat ? nat.hdi.mean > baseline.hdi : false,
        color: 'cyan',
        sub: 'Human Development Index',
      },
      {
        label: 'Employment Rate',
        icon: '👷',
        value: nat ? (nat.emp.mean * 100).toFixed(1) + '%' : (baseline.employment_rate * 100).toFixed(1) + '%',
        delta: nat ? ((nat.emp.mean - baseline.employment_rate) / baseline.employment_rate * 100).toFixed(1) + '%' : '–',
        positive: nat ? nat.emp.mean > baseline.employment_rate : false,
        color: 'purple',
        sub: 'Workforce participation',
      },
      {
        label: 'Poverty Rate',
        icon: '📉',
        value: nat ? (nat.pov.mean * 100).toFixed(1) + '%' : (baseline.poverty_rate * 100).toFixed(1) + '%',
        delta: nat ? ((nat.pov.mean - baseline.poverty_rate) / baseline.poverty_rate * 100).toFixed(1) + '%' : '–',
        positive: nat ? nat.pov.mean < baseline.poverty_rate : false,
        lower_is_better: true,
        color: 'green',
        sub: 'Headcount ratio',
      },
      {
        label: 'Gini Coefficient',
        icon: '⚖️',
        value: nat ? nat.gini.mean.toFixed(3) : baseline.gini.toFixed(3),
        delta: nat ? ((nat.gini.mean - baseline.gini) / baseline.gini * 100).toFixed(1) + '%' : '–',
        positive: nat ? nat.gini.mean < baseline.gini : false,
        lower_is_better: true,
        color: 'orange',
        sub: 'Income inequality',
      },
      {
        label: 'Healthcare Access',
        icon: '🏥',
        value: nat ? (nat.health.mean * 100).toFixed(1) + '%' : '–',
        delta: nat ? ((nat.health.mean - 0.65) / 0.65 * 100).toFixed(1) + '%' : '–',
        positive: nat ? nat.health.mean > 0.65 : false,
        color: 'pink',
        sub: '% population covered',
      },
    ];
  }

  /**
   * Rank states by simulated objective metric.
   */
  getRankedStates(metric = 'hdi', top = 10, bottom = 5) {
    if (!this.sim || !this.sim.states) return { top: [], bottom: [], all: [] };

    const metricKey = Aggregator._metricToSimKey(metric);
    const ranked = this.sim.states
      .filter(s => s.simulated && s.simulated[metricKey])
      .map(s => ({
        ...s,
        score: s.simulated[metricKey].mean,
        baseline_score: s.b[Aggregator._metricToBaselineKey(metric)],
        change: s.simulated[metricKey].mean - s.b[Aggregator._metricToBaselineKey(metric)],
        pct_change: ((s.simulated[metricKey].mean - s.b[Aggregator._metricToBaselineKey(metric)]) / (s.b[Aggregator._metricToBaselineKey(metric)] + 0.001) * 100),
      }))
      .sort((a, b) => b.score - a.score);

    return {
      all: ranked,
      top: ranked.slice(0, top),
      bottom: ranked.slice(-bottom).reverse(),
      most_improved: [...ranked].sort((a, b) => b.pct_change - a.pct_change).slice(0, 5),
    };
  }

  /**
   * Get subgroup outcome table data.
   */
  getSubgroupTable(metric = 'hdi') {
    if (!this.sim || !this.sim.subgroups) return [];
    const metricKey = Aggregator._metricToSimKey(metric);

    return this.sim.subgroups.map(sg => ({
      label: sg.label,
      id: sg.id,
      mean: sg.simulated[metricKey] ? sg.simulated[metricKey].mean : 0,
      ci_lower: sg.simulated[metricKey] ? sg.simulated[metricKey].ci_lower : 0,
      ci_upper: sg.simulated[metricKey] ? sg.simulated[metricKey].ci_upper : 0,
      std:  sg.simulated[metricKey] ? sg.simulated[metricKey].std : 0,
    }));
  }

  /**
   * Generate policy recommendation card text.
   */
  generateRecommendation() {
    const rl = this.rl;
    const sim = this.sim;

    if (!rl || !rl.bestPolicy) {
      return {
        title: 'Run Simulation First',
        body: 'Click "▶ Run Simulation" to compute policy recommendations.',
        pills: [],
        score: null,
      };
    }

    const changes = rl.changes;
    const pills = [];
    const increases = [];
    const decreases = [];

    KNOWLEDGE_GRAPH.levers.forEach(lever => {
      const ch = changes[lever.id];
      if (!ch) return;
      if (ch.change_pct > 3) {
        increases.push(`${lever.label} (+${ch.change_pct.toFixed(0)}%)`);
        pills.push({ label: `${lever.icon} ${lever.label}: ${ch.recommended.toFixed(1)} ${lever.unit}`, type: 'cyan' });
      } else if (ch.change_pct < -3) {
        decreases.push(`${lever.label} (${ch.change_pct.toFixed(0)}%)`);
        pills.push({ label: `${lever.icon} ${lever.label}: ${ch.recommended.toFixed(1)} ${lever.unit}`, type: 'orange' });
      } else {
        pills.push({ label: `${lever.icon} ${lever.label}: ${ch.recommended.toFixed(1)} ${lever.unit}`, type: 'purple' });
      }
    });

    const objLabels = { hdi: 'HDI', employment: 'Employment Rate', poverty: 'Poverty Reduction', inequality: 'Inequality Reduction' };
    const objLabel = objLabels[rl.objective] || rl.objective;

    let body = `The RL optimizer converged after ${rl.convergenceRound} rounds with a ${rl.improvementPct.toFixed(1)}% reward improvement. `;
    if (increases.length) body += `To maximize ${objLabel}, increase ${increases.join(', ')}. `;
    if (decreases.length) body += `Consider reallocating from ${decreases.join(', ')} toward higher-impact levers.`;

    return {
      title: `Optimal Policy for: ${objLabel}`,
      body,
      pills: pills.slice(0, 5),
      score: rl.bestReward ? rl.bestReward.toFixed(4) : null,
      improvement: rl.improvementPct ? rl.improvementPct.toFixed(1) : '0',
      convergence: rl.convergenceRound,
    };
  }

  /**
   * Compute uncertainty bands for a time-series projection.
   */
  computeUncertaintyBands(projection, metric = 'hdi') {
    const series = projection[metric] || [];
    return series.map(pt => ({
      year: pt.year,
      mean: pt.value,
      lower: pt.lower,
      upper: pt.upper,
    }));
  }

  /**
   * Get top states by improvement (most impacted by policy change).
   */
  getMostImpacted(n = 6) {
    if (!this.sim || !this.sim.states) return [];
    return this.sim.states
      .map(st => ({
        id: st.id,
        name: st.name,
        abbr: st.abbr,
        change: st.simulated && st.simulated.hdi
          ? st.simulated.hdi.mean - st.b.hdi
          : 0,
        hdi_sim: st.simulated && st.simulated.hdi ? st.simulated.hdi.mean : st.b.hdi,
        hdi_base: st.b.hdi,
        pop: st.pop,
      }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, n);
  }

  // ── Static helpers ────────────────────────────────────────────────────────

  static _metricToSimKey(metric) {
    const map = { hdi:'hdi', employment:'emp', poverty:'pov', income:'income', gini:'gini', health:'health', literacy:'lit' };
    return map[metric] || metric;
  }

  static _metricToBaselineKey(metric) {
    const map = { hdi:'hdi', employment:'emp', poverty:'pov', income:'income', gini:'gini', health:'health', literacy:'lit' };
    return map[metric] || metric;
  }
}
