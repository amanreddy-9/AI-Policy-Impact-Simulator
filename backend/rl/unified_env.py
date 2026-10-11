"""
Unified Gymnasium Policy Environment:
Constructs a local RL environment using empirical scheme data from policy_repository.db
and synthetic policy change scenarios.
"""

import numpy as np
import sqlite3
import gymnasium as gym
from gymnasium import spaces
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

DB_PATH = Path(__file__).resolve().parents[1] / "data_store" / "policy_repository.db"

class UnifiedSchemePolicyEnv(gym.Env):
    """
    Gymnasium environment for policy funding & lever adjustments.
    State space: 10 continuous metrics
    Action space: 3 continuous policy actions [Budget Change %, Target Coverage %, Oversight %]
    """
    def __init__(self, db_path: Optional[Path] = None):
        super().__init__()
        self.db_path = db_path or DB_PATH

        # Observation space: 10 features
        # [budget_norm, proposed_change_norm, ben_count_norm, cost_per_ben_norm, base_eff, base_sust, disparity, admin_cost, data_nature_weight, sector_code]
        self.observation_space = spaces.Box(
            low=np.array([0.0, -1.0, 0.0, 0.0, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0], dtype=np.float32),
            high=np.array([10.0, 2.0, 10.0, 10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], dtype=np.float32),
            dtype=np.float32
        )

        # Action space: [budget_adj_pct (-50 to +100), ben_exp_pct (0 to +50), oversight_pct (0 to +30)]
        self.action_space = spaces.Box(
            low=np.array([-50.0, 0.0, 0.0], dtype=np.float32),
            high=np.array([100.0, 50.0, 30.0], dtype=np.float32),
            dtype=np.float32
        )

        self.current_state = None
        self.current_scheme = None
        self.episodes = 0
        self.load_dataset()

    def load_dataset(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT scheme_id, canonical_scheme_name, sector, latest_budget_allocation_cr, 
                   estimated_beneficiaries_count, cost_per_beneficiary_inr, 
                   effectiveness_score, fiscal_sustainability_score, data_nature
            FROM unified_schemes
            WHERE latest_budget_allocation_cr IS NOT NULL OR data_nature = 'observed'
            LIMIT 500
        """)
        self.schemes_data = cursor.fetchall()

        # Load synthetic policy simulation records for scenario augmentation
        cursor.execute("SELECT expected_spending_change_inr, observed_spending_change_inr, disparity_impact_score FROM policy_simulation_records LIMIT 500")
        self.scenarios_data = cursor.fetchall()
        conn.close()

        if not self.schemes_data:
            # Fallback default data
            self.schemes_data = [
                ("mgnrega", "MGNREGA", "Rural", 86000.0, 75000000.0, 1146.0, 78.5, 82.0, "observed"),
                ("pmkisan", "PM-KISAN", "Agriculture", 60000.0, 110000000.0, 545.0, 80.0, 85.0, "observed")
            ]

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.episodes += 1

        # Select a scheme record or generate synthetic scenario
        is_synthetic_scenario = (seed is not None and seed % 4 == 0) or (np.random.rand() < 0.25)
        
        if is_synthetic_scenario and len(self.scenarios_data) > 0:
            scen = self.scenarios_data[np.random.randint(0, len(self.scenarios_data))]
            exp_change, obs_change, disparity = scen
            budget_val = max(1000.0, abs(exp_change or 5000000.0) / 1e7)
            bens = max(10000.0, budget_val * 1e7 / 2000.0)
            cost_per_ben = 2000.0
            eff = np.random.uniform(50.0, 85.0)
            sust = np.random.uniform(50.0, 85.0)
            data_weight = 0.6 # synthetic scenario weight
            scheme_id = "synthetic_scenario"
            canon_name = "Synthetic Policy Scenario"
        else:
            idx = np.random.randint(0, len(self.schemes_data))
            sch = self.schemes_data[idx]
            scheme_id, canon_name, sector, budget_val, bens, cost_per_ben, eff, sust, nature = sch
            budget_val = float(budget_val or 15000.0)
            bens = float(bens or 10000000.0)
            cost_per_ben = float(cost_per_ben or 1500.0)
            eff = float(eff or 75.0)
            sust = float(sust or 75.0)
            data_weight = 1.0 if nature == 'observed' else 0.6
            disparity = 0.0

        self.current_scheme = {
            "scheme_id": scheme_id,
            "canonical_scheme_name": canon_name,
            "baseline_budget": budget_val,
            "baseline_bens": bens,
            "cost_per_ben": cost_per_ben,
            "base_eff": eff,
            "base_sust": sust,
            "disparity": disparity or 0.0,
            "data_weight": data_weight
        }

        # Build initial state vector
        budget_norm = float(np.log1p(budget_val) / 5.0)
        proposed_change_norm = 0.0
        ben_count_norm = float(np.log1p(bens) / 8.0)
        cost_per_ben_norm = float(cost_per_ben / 10000.0)
        base_eff = float(eff / 100.0)
        base_sust = float(sust / 100.0)
        disparity_norm = float(np.clip(disparity / 100.0, -1.0, 1.0))
        admin_cost_norm = 0.0
        sector_code = 0.5

        self.current_state = np.array([
            budget_norm, proposed_change_norm, ben_count_norm, cost_per_ben_norm,
            base_eff, base_sust, disparity_norm, admin_cost_norm, data_weight, sector_code
        ], dtype=np.float32)

        return self.current_state, {"scheme": self.current_scheme}

    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        budget_change_pct = float(action[0]) # -50 to +100
        target_exp_pct = float(action[1]) # 0 to 50
        oversight_pct = float(action[2]) # 0 to 30

        cs = self.current_scheme
        base_budget = cs["baseline_budget"]
        base_eff = cs["base_eff"]
        base_sust = cs["base_sust"]
        data_w = cs["data_weight"]

        # Compute proposed budget & beneficiary dynamics
        proposed_budget = base_budget * (1.0 + budget_change_pct / 100.0)
        effective_budget_boost = budget_change_pct * 0.4 + oversight_pct * 0.3
        
        # Predicted Effectiveness Delta
        delta_eff = (effective_budget_boost * 0.25) - (max(0, budget_change_pct - 35) * 0.15)
        predicted_eff = float(np.clip(base_eff + delta_eff, 10.0, 98.0))

        # Predicted Sustainability Delta (Budget increases over 20% reduce fiscal sustainability)
        fiscal_deficit_penalty = max(0.0, budget_change_pct - 15.0) * 0.6
        predicted_sust = float(np.clip(base_sust - fiscal_deficit_penalty + (oversight_pct * 0.2), 10.0, 99.0))

        # Predicted Beneficiary Coverage Change
        new_beneficiaries = cs["baseline_bens"] * (1.0 + (budget_change_pct * 0.3 + target_exp_pct * 0.7) / 100.0)

        # Multi-objective Reward
        eff_gain_reward = (predicted_eff - base_eff) * 0.35
        cov_reward = (target_exp_pct / 50.0) * 0.25 * 100.0
        sust_reward = (predicted_sust / 100.0) * 0.25 * 100.0
        deficit_penalty = fiscal_deficit_penalty * 0.30
        oversight_bonus = (oversight_pct / 30.0) * 10.0

        raw_reward = eff_gain_reward + cov_reward + sust_reward - deficit_penalty + oversight_bonus
        # Scale reward by data_nature provenance weight
        reward = float(raw_reward * data_w)

        # Environment step ends after 1 evaluation action
        terminated = True
        truncated = False

        next_state = self.current_state.copy()
        next_state[1] = float(budget_change_pct / 50.0)
        next_state[4] = float(predicted_eff / 100.0)
        next_state[5] = float(predicted_sust / 100.0)

        info = {
            "scheme_id": cs["scheme_id"],
            "canonical_scheme_name": cs["canonical_scheme_name"],
            "baseline_budget_cr": base_budget,
            "proposed_budget_cr": round(proposed_budget, 2),
            "budget_change_pct": round(budget_change_pct, 2),
            "predicted_effectiveness": round(predicted_eff, 2),
            "predicted_sustainability": round(predicted_sust, 2),
            "estimated_new_beneficiaries": int(new_beneficiaries),
            "data_nature": "observed" if data_w == 1.0 else "synthetic",
            "reward": round(reward, 3)
        }

        return next_state, reward, terminated, truncated, info
