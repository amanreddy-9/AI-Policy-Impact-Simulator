"""Small synthetic/demo dataset for local development.
Replace this with real, documented Indian datasets before making empirical claims.
"""
from pathlib import Path
import pandas as pd

GROUPS = [
    ("Andhra Pradesh", "Marginal Farmer", "Rural", 0.24, 120000, 0.0),
    ("Bihar", "Marginal Farmer", "Rural", 0.31, 150000, 0.0),
    ("Punjab", "Small Farmer", "Rural", 0.16, 80000, 0.0),
    ("Maharashtra", "Small Farmer", "Rural", 0.19, 140000, 0.0),
    ("Karnataka", "Small Farmer", "Rural", 0.18, 100000, 0.0),
    ("Odisha", "Marginal Farmer", "Rural", 0.28, 90000, 0.0),
]

def load_demo_population():
    rows = []
    for state, group, residence, share, n, income in GROUPS:
        rows.append({
            "state": state, "group": group, "residence": residence,
            "population_share": share, "population": n,
            "baseline_income": 100000.0, "baseline_poverty": 0.30
        })
    return pd.DataFrame(rows)

if __name__ == "__main__":
    out = Path(__file__).resolve().parents[2] / "data" / "processed" / "demo_population.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    load_demo_population().to_csv(out, index=False)
    print(out)
