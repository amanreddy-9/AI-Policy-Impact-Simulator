/**
 * Mathematical Budget Engine (Express / Node.js):
 * Executes deterministic budget calculation:
 *   B_new = B_base * (1 + Delta / 100)
 */

const { POLICY_CATEGORIES } = require('./policyCategories');

class BudgetEngine {
  static validatePercent(val) {
    const f = parseFloat(val);
    if (isNaN(f) || !isFinite(f)) return 0.0;
    return Math.max(-50.0, Math.min(100.0, Math.round(f * 100) / 100));
  }

  static calculate(levers = {}, categories = []) {
    let activeCategories = [];
    if (categories && categories.length > 0) {
      activeCategories = POLICY_CATEGORIES.filter(c => categories.includes(c.id));
    }
    if (activeCategories.length === 0) {
      // Find categories that have levers present in levers map
      activeCategories = POLICY_CATEGORIES.filter(c => 
        (c.relatedLevers || []).some(l => levers[l.id] !== undefined)
      );
    }
    if (activeCategories.length === 0) {
      activeCategories = POLICY_CATEGORIES.slice(0, 3);
    }

    const sliderResults = [];
    const sectorResults = {};

    let totalBaseline = 0;
    let totalProposed = 0;
    let grossIncreases = 0;
    let grossReductions = 0;
    let parametersChanged = 0;

    activeCategories.forEach(cat => {
      let secBase = 0;
      let secProp = 0;
      let secInc = 0;
      let secDec = 0;
      let secUnchanged = 0;
      const secSliders = [];

      (cat.relatedLevers || []).forEach(lever => {
        const baseline = lever.baseline_budget || 0;
        const changePercent = this.validatePercent(levers[lever.id] !== undefined ? levers[lever.id] : lever.defaultValue || 0);

        const proposed = Math.round((baseline * (1 + changePercent / 100)) * 100) / 100;
        const diff = Math.round((proposed - baseline) * 100) / 100;

        secBase += baseline;
        secProp += proposed;

        if (diff > 0.01) {
          grossIncreases += diff;
          secInc++;
          parametersChanged++;
        } else if (diff < -0.01) {
          grossReductions += Math.abs(diff);
          secDec++;
          parametersChanged++;
        } else {
          secUnchanged++;
        }

        const sliderRes = {
          slider_id: lever.id,
          sector_id: cat.id,
          sector_name: cat.name,
          policy_name: lever.name,
          baseline_budget: baseline,
          change_percent: changePercent,
          proposed_budget: proposed,
          budget_difference: diff
        };

        sliderResults.push(sliderRes);
        secSliders.push(sliderRes);
      });

      const secDiff = Math.round((secProp - secBase) * 100) / 100;
      sectorResults[cat.id] = {
        sector_id: cat.id,
        sector_name: cat.name,
        ministry: cat.ministry || cat.name,
        baseline_budget: Math.round(secBase * 100) / 100,
        proposed_budget: Math.round(secProp * 100) / 100,
        budget_difference: secDiff,
        percent_change: secBase > 0 ? Math.round((secDiff / secBase * 100) * 100) / 100 : 0,
        sliders_increased: secInc,
        sliders_decreased: secDec,
        sliders_unchanged: secUnchanged,
        sliders: secSliders
      };

      totalBaseline += secBase;
      totalProposed += secProp;
    });

    const netChange = Math.round((totalProposed - totalBaseline) * 100) / 100;
    grossIncreases = Math.round(grossIncreases * 100) / 100;
    grossReductions = Math.round(grossReductions * 100) / 100;

    const agg = {
      total_baseline_budget: Math.round(totalBaseline * 100) / 100,
      total_proposed_budget: Math.round(totalProposed * 100) / 100,
      net_change: netChange,
      pct_change: totalBaseline > 0 ? Math.round((netChange / totalBaseline * 100) * 100) / 100 : 0,
      gross_increases: grossIncreases,
      gross_reductions: grossReductions,
      parameters_changed: parametersChanged,
      total_parameters_configured: sliderResults.length
    };

    return {
      per_slider: sliderResults,
      per_sector: sectorResults,
      aggregate: agg,
      macro_aggregate: agg
    };
  }
}

module.exports = BudgetEngine;
module.exports.BudgetEngine = BudgetEngine;
