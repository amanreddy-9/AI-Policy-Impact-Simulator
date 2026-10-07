"""Optional EconML causal-forest adapter."""
def fit_causal_forest(X, T, Y):
    try:
        from econml.dml import CausalForestDML
    except ImportError as exc:
        raise ImportError("Install econml to use CausalForestDML") from exc
    model = CausalForestDML(n_estimators=200, random_state=42)
    model.fit(Y, T, X=X)
    return model
