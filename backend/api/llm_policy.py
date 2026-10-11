"""
LLM Policy Evaluation Router: Evidence-Based Analysis using Local Unified Repository & Dynamic Web Research.
Integrates PipelineOrchestrator, PolicyRepository, Lightweight RL Agent, and LLM providers.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from backend.retrieval.pipeline_orchestrator import pipeline_orchestrator

router = APIRouter()

class PolicyEvaluateRequest(BaseModel):
    mode: str = "custom"
    policy_name: Optional[str] = "Custom Policy Initiative"
    scheme_id: Optional[str] = None
    description: str = ""
    categories: Optional[List[str]] = []
    levers: Dict[str, float] = {}
    language: Optional[str] = "en"

@router.post("/evaluate")
async def evaluate_policy(req: PolicyEvaluateRequest):
    """
    Evaluates policy impact using:
    - Unified Policy Repository (policy_repository.db) for scheme details & provenance
    - Deterministic Python budget calculation engine
    - Trained lightweight local PyTorch RL agent for predictions & evaluation metrics
    - Dynamic web research on approved domains for live citations
    - Contextual LLM synthesis
    """
    query_text = (req.description.strip() or req.policy_name or "National Welfare Policy").strip()
    scheme_id = req.scheme_id or (req.policy_name.lower() if req.mode == "existing" else None)

    result = await pipeline_orchestrator.execute_full_pipeline(
        user_policy_query=query_text,
        categories=req.categories,
        levers=req.levers,
        selected_scheme_id=scheme_id
    )

    return {
        "success": True,
        "status": "success",
        "scheme_provenance": result.get("scheme_provenance", {}),
        "rl_predictions": result.get("rl_predictions", {}),
        "simulation": result["simulation"],
        "proofs": result.get("proofs", {}),
        "ai_guidance": result["ai_guidance"],
        "budget_calculation": result.get("budget_calculation"),
        "report": result.get("report"),
        "metrics": result.get("metrics", []),
        "scenarios": result.get("scenarios", {}),
        "evidence": result.get("evidence_used", []),
        "approved_domains": result.get("approved_domains_used", []),
        "methodology": result.get("methodology", ""),
        "source_strategy": result.get("source_strategy", "")
    }
