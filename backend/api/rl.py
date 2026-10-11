"""
RL API Router:
Exposes lightweight RL training, policy recommendation, scheme prediction,
and evaluation metrics endpoints for the Existing Reforms / Schemes Alignment section.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from backend.rl.lightweight_rl_agent import LightweightRLTrainer, predict_scheme_outcome, REPORT_PATH
import json

router = APIRouter()

class TrainRequest(BaseModel):
    steps: int = Field(5000, ge=1000, le=50000)

class PredictRequest(BaseModel):
    scheme_id: str = "mgnrega"
    baseline_budget_cr: float = 60000.0
    proposed_budget_change_pct: float = 0.0
    base_effectiveness: float = 78.5
    base_sustainability: float = 82.0
    disparity_score: float = 0.0
    data_nature: str = "observed"

@router.post("/rl/train")
def train(req: TrainRequest):
    trainer = LightweightRLTrainer(steps=req.steps)
    report = trainer.train()
    return {"status": "success", "report": report}

@router.post("/rl/predict")
def predict_outcome(req: PredictRequest):
    res = predict_scheme_outcome(
        scheme_id=req.scheme_id,
        baseline_budget_cr=req.baseline_budget_cr,
        proposed_budget_change_pct=req.proposed_budget_change_pct,
        base_effectiveness=req.base_effectiveness,
        base_sustainability=req.base_sustainability,
        disparity_score=req.disparity_score,
        data_nature=req.data_nature
    )
    return {"status": "success", **res}

@router.get("/rl/metrics")
def get_metrics():
    if REPORT_PATH.exists():
        with open(REPORT_PATH, 'r') as f:
            return {"status": "success", "report": json.load(f)}
    return {"status": "error", "message": "RL model evaluation report not found. Run training first."}

@router.get("/rl/recommend")
def recommendation(scheme_id: str = "mgnrega"):
    res = predict_scheme_outcome(scheme_id=scheme_id, baseline_budget_cr=60000.0, proposed_budget_change_pct=10.0)
    return {"status": "success", **res}
