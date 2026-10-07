"""
FastAPI Router for Controlled Information Retrieval & Evidence Pipeline.
Exposes endpoints for end-to-end policy research, evidence exploration, source validation, and simulation.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from backend.retrieval.pipeline_orchestrator import pipeline_orchestrator
from backend.retrieval.source_controller import source_controller, ALLOWED_DOMAINS, TIER_1_DOMAINS, TIER_2_DOMAINS, TIER_3_DOMAINS
from backend.retrieval.evidence_store import evidence_store
from backend.retrieval.policy_similarity import policy_similarity_engine
from backend.simulation.policy_simulator import policy_simulator

router = APIRouter(prefix="/pipeline", tags=["Controlled Evidence Pipeline"])

class PolicyResearchRequest(BaseModel):
    query: str = Field(..., example="Provide 20 units of water free every day to farmers owning less than 3 acres.")
    domain: Optional[str] = 'auto'
    max_search_results: Optional[int] = 8

class SimulationRequest(BaseModel):
    water_units: Optional[float] = 20.0
    max_acres: Optional[float] = 3.0
    eligible_farmers_cr: Optional[float] = 7.2
    num_iterations: Optional[int] = 10000

@router.post("/research")
async def run_policy_research(req: PolicyResearchRequest):
    """
    Executes the full Controlled Information Retrieval & Evidence Pipeline:
    1. Llama 3.1 8B Query Planning & Variable Identification
    2. Site-restricted Search on Approved Government & Academic Domains
    3. Webpage & PDF Parsing with Page Indexing
    4. Evidence Extraction & Validation (OBSERVED vs MODELLED vs PROJECTED)
    5. Dual-Memory Storage (DuckDB SQL + ChromaDB Vector Store)
    6. Policy Similarity Engine for Historical Comparisons
    7. Pure Python 10,000 Monte Carlo Stochastic Simulation
    8. Llama 3.1 8B Report Synthesis with Grounded Page Citations
    """
    try:
        result = await pipeline_orchestrator.execute_full_pipeline(req.query, req.domain)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources")
def get_approved_sources():
    """Returns the list of approved domains organized by credibility tiers."""
    return {
        "success": True,
        "total_allowed_domains": len(ALLOWED_DOMAINS),
        "tiers": {
            "tier_1_primary_government": {
                "description": "Primary Government of India Authorities (NITI Aayog, DMEO, MoSPI, RBI, Ministries, Union Budget)",
                "domains": TIER_1_DOMAINS
            },
            "tier_2_international_academic": {
                "description": "High-Quality International & Academic Institutions (World Bank, FAO, UN, WHO, IMF, Journals)",
                "domains": TIER_2_DOMAINS
            },
            "tier_3_think_tanks": {
                "description": "Recognized Research Institutes & Policy Think Tanks (ICRIER, CPR, ORF, IGIDR, PRS)",
                "domains": TIER_3_DOMAINS
            }
        }
    }

@router.get("/evidence")
def list_stored_evidence(
    indicator: Optional[str] = Query(None, description="Filter by indicator (e.g. farmer_income, water_consumption)"),
    limit: int = Query(25, ge=1, le=100)
):
    """Retrieves verified evidence items from the structured DuckDB database."""
    if indicator:
        items = evidence_store.query_structured_by_indicator(indicator)
    else:
        items = evidence_store.get_all_evidence(limit=limit)
    return {
        "success": True,
        "count": len(items),
        "evidence": items
    }

@router.post("/similar-policies")
def find_similar_policies(req: Dict[str, Any]):
    """Matches a policy description against historical Indian policy benchmarks."""
    desc = req.get("description", "")
    area = req.get("policy_area", "")
    matches = policy_similarity_engine.find_similar_policies(desc, area, top_n=5)
    return {
        "success": True,
        "matches": matches
    }

@router.post("/simulate")
def run_simulation(req: SimulationRequest):
    """Runs a 10,000-iteration Monte Carlo simulation for parametric policy levers."""
    results = policy_simulator.run_monte_carlo_simulation(
        policy_params=req.model_dump(),
        num_iterations=req.num_iterations or 10000
    )
    return {
        "success": True,
        "simulation": results
    }
