"""Gymnasium environment for PM-KISAN-style policy optimization."""
import numpy as np
import gymnasium as gym
from gymnasium import spaces
from backend.simulation.monte_carlo import simulate

class PolicyEnv(gym.Env):
    def __init__(self, budget_limit=12000.0):
        super().__init__()
        self.budget_limit = budget_limit
        self.action_space = spaces.Box(low=np.array([4000.0], dtype=np.float32), high=np.array([12000.0], dtype=np.float32), dtype=np.float32)
        self.observation_space = spaces.Box(low=np.array([4000.0], dtype=np.float32), high=np.array([12000.0], dtype=np.float32), dtype=np.float32)
        self.transfer = 6000.0

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.transfer = 6000.0
        return np.array([self.transfer], dtype=np.float32), {}

    def step(self, action):
        self.transfer = float(np.clip(action[0], 4000, self.budget_limit))
        result = simulate(self.transfer, rounds=300)
        income = float(result["mean_income_change"].mean())
        poverty = float(result["mean_poverty_change"].mean())
        budget_penalty = max(0.0, self.transfer - self.budget_limit) / self.budget_limit
        reward = income - 0.8 * abs(poverty) - 0.5 * budget_penalty
        terminated = True
        return np.array([self.transfer], dtype=np.float32), reward, terminated, False, {
            "transfer": self.transfer, "income": income, "poverty": poverty
        }
