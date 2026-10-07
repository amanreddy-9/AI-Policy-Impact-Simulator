"""Difference-in-Differences helper.

This is an implementation scaffold. It accepts a panel DataFrame with
columns: outcome, treated, post, and optionally subgroup. Use real historical
policy data and inspect parallel trends before interpreting estimates.
"""
import pandas as pd
import statsmodels.formula.api as smf

def did_estimate(df: pd.DataFrame, outcome: str = "outcome"):
    required = {outcome, "treated", "post"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")
    model = smf.ols(
        f"{outcome} ~ treated + post + treated:post",
        data=df
    ).fit(cov_type="HC3")
    term = "treated:post"
    return {
        "estimate": float(model.params[term]),
        "std_error": float(model.bse[term]),
        "p_value": float(model.pvalues[term]),
        "ci_low": float(model.conf_int().loc[term, 0]),
        "ci_high": float(model.conf_int().loc[term, 1]),
    }
