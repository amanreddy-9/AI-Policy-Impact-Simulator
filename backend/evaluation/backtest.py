"""Backtesting scaffold.
Compare simulated historical outcomes against observed outcomes once real data is loaded.
"""
import pandas as pd
from sklearn.metrics import mean_absolute_error

def evaluate_predictions(observed: pd.Series, predicted: pd.Series):
    return {"mae": float(mean_absolute_error(observed, predicted))}
