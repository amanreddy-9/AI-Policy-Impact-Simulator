"""Causal-effect interface.

The demo coefficients below are illustrative placeholders only. A production
run must load estimates produced from documented historical data and a valid
identification strategy.
"""
from dataclasses import dataclass
from typing import Dict

@dataclass
class Effect:
    outcome: str
    group: str
    elasticity: float
    ci_low: float
    ci_high: float

DEMO_EFFECTS = {
    "Marginal Farmer": {
        "income": Effect("income", "Marginal Farmer", 0.75, 0.50, 1.00),
        "poverty": Effect("poverty", "Marginal Farmer", -0.20, -0.35, -0.05),
    },
    "Small Farmer": {
        "income": Effect("income", "Small Farmer", 0.60, 0.35, 0.85),
        "poverty": Effect("poverty", "Small Farmer", -0.15, -0.28, -0.02),
    },
}

def get_effects() -> Dict[str, Dict[str, Effect]]:
    return DEMO_EFFECTS
