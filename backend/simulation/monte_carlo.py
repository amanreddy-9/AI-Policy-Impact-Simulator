"""Comprehensive Monte Carlo policy simulator with multi-lever input, sectoral breakdowns, and fiscal calculations."""
import numpy as np
import pandas as pd
from typing import Dict, Any

DEFAULT_LEVER_BASELINES = {
    "financial_aid": 6000.0,       # ₹/yr
    "food_security": 5.0,          # kg/month
    "education_support": 10.0,     # % coverage
    "healthcare_coverage": 2.0,    # ₹ Lakh/family
    "tax_relief": 5.0,             # % exemption
    "employment_guarantee": 100.0, # Days/yr
    "women_empowerment": 3000.0,   # ₹/yr
    "sc_st_welfare": 10.0,         # % fund allocation
    "farmer_credit": 5.0,          # % MSP/credit support
    "pension_support": 1000.0      # ₹/month
}

LEVER_WEIGHTS = {
    "financial_aid":        {"income": 0.65, "poverty": -0.22, "hdi": 0.15, "fiscal_cost": 1.2},
    "food_security":         {"income": 0.40, "poverty": -0.35, "hdi": 0.20, "fiscal_cost": 0.8},
    "education_support":     {"income": 0.50, "poverty": -0.18, "hdi": 0.45, "fiscal_cost": 0.9},
    "healthcare_coverage":   {"income": 0.45, "poverty": -0.25, "hdi": 0.40, "fiscal_cost": 1.1},
    "tax_relief":            {"income": 0.35, "poverty": -0.08, "hdi": 0.10, "fiscal_cost": 0.7},
    "employment_guarantee":  {"income": 0.70, "poverty": -0.30, "hdi": 0.25, "fiscal_cost": 1.5},
    "women_empowerment":     {"income": 0.55, "poverty": -0.28, "hdi": 0.35, "fiscal_cost": 0.6},
    "sc_st_welfare":         {"income": 0.60, "poverty": -0.32, "hdi": 0.30, "fiscal_cost": 0.8},
    "farmer_credit":         {"income": 0.68, "poverty": -0.20, "hdi": 0.22, "fiscal_cost": 1.0},
    "pension_support":       {"income": 0.48, "poverty": -0.26, "hdi": 0.18, "fiscal_cost": 0.9}
}

DEMOGRAPHIC_GROUPS = {
    "Marginal Farmer":   {"caste_weight": {"SC": 0.30, "ST": 0.20, "OBC": 0.35, "General": 0.15}, "female_share": 0.48, "base_income": 85000},
    "Small Farmer":      {"caste_weight": {"SC": 0.20, "ST": 0.15, "OBC": 0.45, "General": 0.20}, "female_share": 0.42, "base_income": 120000},
    "Informal Worker":   {"caste_weight": {"SC": 0.35, "ST": 0.25, "OBC": 0.30, "General": 0.10}, "female_share": 0.52, "base_income": 95000},
    "Rural Landless":    {"caste_weight": {"SC": 0.40, "ST": 0.30, "OBC": 0.25, "General": 0.05}, "female_share": 0.55, "base_income": 70000},
    "Urban Salaried":    {"caste_weight": {"SC": 0.10, "ST": 0.05, "OBC": 0.35, "General": 0.50}, "female_share": 0.35, "base_income": 280000}
}

def simulate_comprehensive(
    levers: Dict[str, float] = None,
    description: str = "",
    mode: str = "custom",
    rounds: int = 1000,
    seed: int = 42
) -> Dict[str, Any]:
    rng = np.random.default_rng(seed)
    if not levers:
        levers = DEFAULT_LEVER_BASELINES.copy()

    # Calculate overall policy shift deltas
    total_income_delta = 0.0
    total_poverty_delta = 0.0
    total_hdi_delta = 0.0
    total_fiscal_cost = 0.0

    for lever, val in levers.items():
        base = DEFAULT_LEVER_BASELINES.get(lever, 1.0)
        p_change = (val - base) / max(base, 0.01)
        w = LEVER_WEIGHTS.get(lever, {"income": 0.1, "poverty": -0.05, "hdi": 0.05, "fiscal_cost": 0.5})

        total_income_delta += w["income"] * p_change * 0.1
        total_poverty_delta += w["poverty"] * p_change * 0.08
        total_hdi_delta += w["hdi"] * p_change * 0.05
        total_fiscal_cost += max(0, p_change * w["fiscal_cost"] * 0.45)

    # Base fiscal cost baseline ₹ 0.85 Lakh Crore
    fiscal_cost_lakh_cr = round(max(0.35, 0.85 + total_fiscal_cost), 2)
    
    # Calculate effectiveness index (0 to 100)
    effectiveness_score = round(min(98.5, max(15.0, 50.0 + total_income_delta * 120 - total_poverty_delta * 100 + total_hdi_delta * 150)), 1)
    
    # Calculate sustainability score (0 to 100)
    sustainability_score = round(min(96.0, max(20.0, 75.0 - (fiscal_cost_lakh_cr / 3.5) * 15 + total_hdi_delta * 80)), 1)

    # Subgroup simulation
    group_results = []
    for g_name, g_info in DEMOGRAPHIC_GROUPS.items():
        inc_samples = rng.normal(total_income_delta, 0.02, rounds)
        pov_samples = rng.normal(total_poverty_delta, 0.012, rounds)
        hdi_samples = rng.normal(total_hdi_delta, 0.01, rounds)

        mean_inc = float(np.mean(inc_samples))
        mean_pov = float(np.mean(pov_samples))
        mean_hdi = float(np.mean(hdi_samples))

        group_results.append({
            "group": g_name,
            "mean_income_change_pct": round(mean_inc * 100, 2),
            "income_p05": round(float(np.quantile(inc_samples, 0.05)) * 100, 2),
            "income_p95": round(float(np.quantile(inc_samples, 0.95)) * 100, 2),
            "mean_poverty_change_pct": round(mean_pov * 100, 2),
            "poverty_p05": round(float(np.quantile(pov_samples, 0.05)) * 100, 2),
            "poverty_p95": round(float(np.quantile(pov_samples, 0.95)) * 100, 2),
            "mean_hdi_change": round(mean_hdi, 3)
        })

    # Sectoral Breakdowns
    # 1. Gender Impact
    women_aid_val = levers.get("women_empowerment", 3000)
    women_boost = (women_aid_val - 3000) / 3000.0 * 0.12
    gender_impact = {
        "women": round(max(0.5, total_income_delta * 100 * 1.15 + women_boost * 100), 2),
        "men": round(max(0.3, total_income_delta * 100 * 0.92), 2),
        "female_participation_boost_pct": round(max(0.1, total_hdi_delta * 40 + women_boost * 25), 2)
    }

    # 2. Caste / Social Categories Impact
    sc_st_fund = levers.get("sc_st_welfare", 10)
    sc_st_boost = (sc_st_fund - 10) / 10.0 * 0.15
    caste_impact = {
        "SC": round(max(0.4, total_income_delta * 100 * 1.2 + sc_st_boost * 100), 2),
        "ST": round(max(0.4, total_income_delta * 100 * 1.25 + sc_st_boost * 110), 2),
        "OBC": round(max(0.3, total_income_delta * 100 * 1.05 + sc_st_boost * 40), 2),
        "General": round(max(0.2, total_income_delta * 100 * 0.85), 2)
    }

    # 3. Family & Children Welfare
    edu_val = levers.get("education_support", 10)
    food_val = levers.get("food_security", 5)
    children_impact = {
        "child_malnutrition_reduction_pct": round(max(0.2, abs(total_poverty_delta) * 80 + (food_val - 5) * 2.5), 1),
        "school_retention_increase_pct": round(max(0.1, (edu_val - 10) * 1.8 + total_hdi_delta * 50), 1),
        "family_welfare_index": round(min(99.0, max(20.0, 60.0 + total_hdi_delta * 120 + (food_val - 5) * 3)), 1)
    }

    return {
        "mode": mode,
        "effectiveness_score": effectiveness_score,
        "fiscal_cost_lakh_cr": fiscal_cost_lakh_cr,
        "sustainability_score": sustainability_score,
        "budget_feasibility": "High" if fiscal_cost_lakh_cr < 1.5 else ("Moderate" if fiscal_cost_lakh_cr < 2.5 else "High Fiscal Stress"),
        "overall_deltas": {
            "income_pct": round(total_income_delta * 100, 2),
            "poverty_pct": round(total_poverty_delta * 100, 2),
            "hdi_delta": round(total_hdi_delta, 3)
        },
        "groups": group_results,
        "sectoral": {
            "gender": gender_impact,
            "caste": caste_impact,
            "children_family": children_impact
        }
    }

def simulate(transfer: float, rounds: int = 1000, seed: int = 42):
    """Backwards compatible simulate function for existing single-transfer endpoint."""
    levers = DEFAULT_LEVER_BASELINES.copy()
    levers["financial_aid"] = transfer
    res = simulate_comprehensive(levers=levers, rounds=rounds, seed=seed)
    
    rows = []
    for g in res["groups"]:
        rows.append({
            "group": g["group"],
            "mean_income_change": g["mean_income_change_pct"] / 100.0,
            "income_p05": g["income_p05"] / 100.0,
            "income_p95": g["income_p95"] / 100.0,
            "mean_poverty_change": g["mean_poverty_change_pct"] / 100.0,
            "poverty_p05": g["poverty_p05"] / 100.0,
            "poverty_p95": g["poverty_p95"] / 100.0,
        })
    return pd.DataFrame(rows)
