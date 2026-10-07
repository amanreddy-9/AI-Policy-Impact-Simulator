/**
 * rl_optimizer.js — v2 (Proposal-aligned)
 * RL Policy Optimizer — PPO-style framing with:
 * - Budget constraint reward penalty (fiscal feasibility)
 * - Rawlsian max-min welfare option
 * - Farmer-specific objective
 * - Stable-Baselines3-inspired interface comments
 */

class RLOptimizer {

  /**
   * @param {string} objective - 'hdi'|'employment'|'poverty'|'inequality'|'farmers'
   * @param {Array}  states - INDIA_DATA.states
   * @param {number} fiscalBudget - max additional spend (₹ lakh cr); 0 = unconstrained
   */
  constructor(objective = 'hdi', states = null, fiscalBudget = 0) {
    this.objective    = objective;
    this.states       = states || INDIA_DATA.states;
    this.levers       = KNOWLEDGE_GRAPH.levers;
    this.fiscalBudget = fiscalBudget;   // ₹ lakh crore; 0 = unconstrained

    // RL state: best policy found
    this.bestPolicy = null;
    this.bestReward = -Infinity;

    // Convergence history
    this.rewardHistory  = [];
    this.policyHistory  = [];
    this.fiscalHistory  = [];

    // PPO-style hyper-params
    this.epsilon    = 0.35;    // initial exploration probability
    this.alpha      = 0.06;    // learning rate / gradient step fraction
    this.decayRate  = 0.994;   // epsilon decay per round
    this.clip_ratio = 0.2;     // PPO clip (used conceptually for step bounding)
  }

  /**
   * Run optimization for N rounds (PPO-style environment interaction).
   * Environment = SimulationEngine (lightweight, no LLM).
   * @param {number}   rounds
   * @param {Function} onProgress - callback(pct)
   */
  optimize(rounds = 600, onProgress = null) {
    let currentPolicy = { ...INDIA_DATA.policyBaseline };
    let currentReward = this._computeReward(currentPolicy);
    let currentFiscal = this._computeFiscalCost(currentPolicy);

    this.rewardHistory = [];
    this.policyHistory = [];
    this.fiscalHistory = [];

    for (let r = 0; r < rounds; r++) {
      // ── Action selection (ε-greedy exploration) ─────────────────────────
      let candidate;
      if (Math.random() < this.epsilon) {
        candidate = this._randomPerturb(currentPolicy);       // explore
      } else {
        candidate = this._ppoGradientStep(currentPolicy);     // exploit
      }

      const candidateReward = this._computeReward(candidate);
      const candidateFiscal = this._computeFiscalCost(candidate);

      // ── Accept / reject (simulated annealing + PPO-style clipping) ──────
      const temperature = 0.08 * (1 - r / rounds);
      const delta = candidateReward - currentReward;
      if (delta > 0 || Math.random() < Math.exp(delta / (temperature + 1e-8))) {
        currentPolicy = candidate;
        currentReward = candidateReward;
        currentFiscal = candidateFiscal;
      }

      // Track best
      if (currentReward > this.bestReward) {
        this.bestReward  = currentReward;
        this.bestPolicy  = { ...currentPolicy };
        this.bestFiscal  = currentFiscal;
      }

      // Decay exploration (PPO: gradually shift to exploitation)
      this.epsilon = Math.max(0.02, this.epsilon * this.decayRate);

      // Record history (every 5 rounds to keep array manageable)
      if (r % 5 === 0) {
        this.rewardHistory.push({ round: r, reward: currentReward, best: this.bestReward });
        this.policyHistory.push({ round: r, policy: { ...currentPolicy } });
        this.fiscalHistory.push({ round: r, fiscal: currentFiscal });
      }

      if (onProgress && r % 50 === 0) onProgress(r / rounds);
    }

    if (onProgress) onProgress(1.0);
    return this.getResults();
  }

  /** Summarize optimization results */
  getResults() {
    const baseline = INDIA_DATA.policyBaseline;
    const changes  = {};

    if (this.bestPolicy) {
      this.levers.forEach(lever => {
        const k  = lever.id;
        changes[k] = {
          baseline:      baseline[k],
          recommended:   this.bestPolicy[k],
          change:        this.bestPolicy[k] - baseline[k],
          change_pct:    ((this.bestPolicy[k] - baseline[k]) / (baseline[k] + 1e-6)) * 100,
          fiscal_impact: this._leverFiscalImpact(lever, baseline[k], this.bestPolicy[k]),
        };
      });
    }

    return {
      bestPolicy:       this.bestPolicy,
      bestReward:       this.bestReward,
      bestFiscal:       this.bestFiscal || 0,
      rewardHistory:    this.rewardHistory,
      policyHistory:    this.policyHistory,
      fiscalHistory:    this.fiscalHistory,
      changes,
      convergenceRound: this._findConvergenceRound(),
      totalRounds:      this.rewardHistory.length * 5,
      improvementPct:   this._computeImprovement(),
      objective:        this.objective,
      fiscalBudget:     this.fiscalBudget,
      fiscalFeasible:   this.fiscalBudget === 0 || (this.bestFiscal || 0) <= this.fiscalBudget,
    };
  }

  // ── Reward Function ───────────────────────────────────────────────────────

  _computeReward(policy) {
    const weights  = INDIA_DATA.causalWeights;
    const baseline = INDIA_DATA.policyBaseline;
    let totalReward = 0;
    const subgroupRewards = [];

    this.states.forEach(st => {
      let objectiveVal = 0;

      this.levers.forEach(lever => {
        const k       = lever.id;
        const pChange = (policy[k] - baseline[k]) / (Math.abs(baseline[k]) + 1e-6);
        const lw      = weights[k] || {};
        const outKey  = this._objectiveWeightKey();
        // Invert effect for GST (higher rate = bad for outcomes)
        const sign    = lever.inverse ? -1 : 1;
        objectiveVal += sign * (lw[outKey] || 0) * pChange;
      });

      const baseVal = this._stateBaselineObjective(st);

      // Rawlsian: weight by inverse of baseline (help worst-off more)
      let stateWeight = 1;
      if (this.objective === 'inequality') stateWeight = 1 + (1 - baseVal);
      if (this.objective === 'farmers')    stateWeight = st.b.agri_share || 0.5;

      const reward = (baseVal + objectiveVal * baseVal) * stateWeight;
      totalReward += reward;
      subgroupRewards.push(reward);
    });

    const avgReward = totalReward / this.states.length;

    // Budget constraint penalty
    const fiscalCost   = this._computeFiscalCost(policy);
    const fiscalPenalty = this.fiscalBudget > 0
      ? Math.max(0, fiscalCost - this.fiscalBudget) * 0.05
      : 0;

    // Min-max reward bonus for inequality objective
    const minSubgroup = Math.min(...subgroupRewards);
    const rawlsBonus  = this.objective === 'inequality' ? minSubgroup * 0.3 : 0;

    return avgReward + rawlsBonus - fiscalPenalty;
  }

  _stateBaselineObjective(state) {
    switch (this.objective) {
      case 'hdi':        return state.b.hdi;
      case 'employment': return state.b.emp;
      case 'poverty':    return 1 - state.b.pov;
      case 'inequality': return 1 - state.b.gini;
      case 'farmers':    return state.b.hdi * (state.b.agri_share || 0.5);
      default:           return state.b.hdi;
    }
  }

  _objectiveWeightKey() {
    const map = { hdi:'hdi', employment:'employment_rate', poverty:'poverty_rate', inequality:'gini', farmers:'income_pc' };
    return map[this.objective] || 'hdi';
  }

  // ── Fiscal Cost ───────────────────────────────────────────────────────────

  _computeFiscalCost(policy) {
    const baseline = INDIA_DATA.policyBaseline;
    const costs    = INDIA_DATA.fiscalCost;
    let total = 0;  // ₹ crore

    this.levers.forEach(lever => {
      const k    = lever.id;
      const diff = policy[k] - baseline[k];
      const unit = costs[k] || 0;
      total += diff * unit;
    });

    return total / 100000;  // convert ₹ crore → ₹ lakh crore
  }

  _leverFiscalImpact(lever, baseVal, newVal) {
    const diff = newVal - baseVal;
    const costPerUnit = INDIA_DATA.fiscalCost[lever.id] || 0;
    return (diff * costPerUnit) / 100000;  // ₹ lakh crore
  }

  // ── Exploration & Exploitation ────────────────────────────────────────────

  _randomPerturb(policy) {
    const newPolicy = { ...policy };
    const lever     = this.levers[Math.floor(Math.random() * this.levers.length)];
    const range     = lever.max - lever.min;
    const delta     = (Math.random() - 0.5) * range * 0.20;
    newPolicy[lever.id] = Math.max(lever.min, Math.min(lever.max, policy[lever.id] + delta));
    return newPolicy;
  }

  /** PPO-style gradient step with clip ratio */
  _ppoGradientStep(policy) {
    const newPolicy     = { ...policy };
    let bestLever       = null;
    let bestGradient    = 0;
    const h = 0.5;  // finite difference step

    this.levers.forEach(lever => {
      const pPlus  = { ...policy, [lever.id]: Math.min(lever.max, policy[lever.id] + h) };
      const pMinus = { ...policy, [lever.id]: Math.max(lever.min, policy[lever.id] - h) };
      const grad   = (this._computeReward(pPlus) - this._computeReward(pMinus)) / (2 * h);

      if (Math.abs(grad) > Math.abs(bestGradient)) {
        bestGradient = grad;
        bestLever    = lever;
      }
    });

    if (bestLever) {
      // PPO clip: limit step size relative to policy ratio
      const rawStep  = this.alpha * Math.sign(bestGradient) * bestLever.step * 4;
      const clipped  = Math.max(-bestLever.step * 3, Math.min(bestLever.step * 3, rawStep));
      newPolicy[bestLever.id] = Math.max(
        bestLever.min,
        Math.min(bestLever.max, policy[bestLever.id] + clipped)
      );
    }
    return newPolicy;
  }

  // ── Convergence ───────────────────────────────────────────────────────────

  _findConvergenceRound() {
    const hist = this.rewardHistory;
    if (hist.length < 20) return (hist.length * 5);
    for (let i = 20; i < hist.length; i++) {
      const recent    = hist.slice(i - 10, i).map(h => h.best);
      const maxChange = Math.max(...recent) - Math.min(...recent);
      if (maxChange < 0.0005) return hist[i].round;
    }
    return hist[hist.length - 1].round;
  }

  _computeImprovement() {
    if (!this.rewardHistory.length) return 0;
    const initial = this.rewardHistory[0].reward;
    return ((this.bestReward - initial) / (Math.abs(initial) + 1e-8)) * 100;
  }
}
