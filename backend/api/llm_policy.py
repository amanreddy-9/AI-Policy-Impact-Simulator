"""
LLM Policy Evaluation Router: Evidence-Based Analysis using Local Knowledge Base & Dynamic Web Research.
Integrates PipelineOrchestrator, MetricComputationService, and Llama 3.1 8B for publication-grade assessments.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from backend.retrieval.pipeline_orchestrator import pipeline_orchestrator

router = APIRouter()

class PolicyEvaluateRequest(BaseModel):
    mode: str = "custom"
    policy_name: Optional[str] = "Custom Policy Initiative"
    description: str = ""
    categories: Optional[List[str]] = []
    levers: Dict[str, float] = {}
    language: Optional[str] = "en"

@router.post("/evaluate")
async def evaluate_policy(req: PolicyEvaluateRequest):
    """
    Evaluates policy impact using the Evidence-Based Pipeline:
    - Education sector: Retrieves from local docs/ knowledge base (UDISE+, CMDM, SSA, SOER, etc.)
    - Other sectors: Dynamically researches approved government & academic web domains
    - Computes verified metrics & scenarios in pure Python
    - Synthesizes grounded executive report with Llama 3.1 8B
    """
    query_text = (req.description.strip() or req.policy_name or "National Welfare Policy").strip()
    
    result = await pipeline_orchestrator.execute_full_pipeline(
        user_policy_query=query_text,
        categories=req.categories,
        levers=req.levers
    )

    return {
        "success": True,
        "status": "success",
        "simulation": result["simulation"],
        "proofs": result.get("proofs", {}),
        "ai_guidance": result["ai_guidance"],
        "budget_calculation": result.get("budget_calculation"),
        "report": result.get("report"),
        "metrics": result.get("metrics", []),
        "scenarios": result.get("scenarios", {}),
        "evidence": result.get("evidence_used", []),
        "evidence_gaps": result.get("evidence_gaps", []),
        "methodology": result.get("methodology", ""),
        "source_strategy": result.get("source_strategy", "")
    }
