"""
FastAPI Router for Controlled Information Retrieval & Evidence Pipeline.
Exposes endpoints for end-to-end policy research, local document ingestion, evidence exploration, source validation, and simulation.
"""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from backend.retrieval.pipeline_orchestrator import pipeline_orchestrator
from backend.retrieval.source_controller import source_controller, ALLOWED_DOMAINS, TIER_1_DOMAINS, TIER_2_DOMAINS, TIER_3_DOMAINS
from backend.retrieval.evidence_store import evidence_store
from backend.retrieval.document_ingestion import document_ingestion_service
from backend.retrieval.policy_similarity import policy_similarity_engine
from backend.simulation.policy_simulator import policy_simulator

router = APIRouter(prefix="/pipeline", tags=["Controlled Evidence Pipeline"])

class PolicyResearchRequest(BaseModel):
    query: str = Field(..., example="Provide 20 units of water free every day to farmers owning less than 3 acres.")
    domain: Optional[str] = 'auto'
    categories: Optional[List[str]] = []
    levers: Optional[Dict[str, float]] = {}

class SimulationRequest(BaseModel):
    water_units: Optional[float] = 20.0
    max_acres: Optional[float] = 3.0
    eligible_farmers_cr: Optional[float] = 7.2
    num_iterations: Optional[int] = 10000

@router.post("/research")
async def run_policy_research(req: PolicyResearchRequest):
    """
    Executes the Evidence-Based Policy Retrieval & Simulation Pipeline:
    - Education sector: Retrieves from local docs/ knowledge base (UDISE+, CMDM, SSA, SOER, etc.)
    - Other sectors: Site-restricted parallel web research on approved domains
    - Computes transparent Python metrics with multi-scenario projections
    - Grounded report synthesis with Llama 3.1 8B referencing exact document page numbers
    """
    try:
        result = await pipeline_orchestrator.execute_full_pipeline(
            user_policy_query=req.query,
            domain_override=req.domain,
            categories=req.categories,
            levers=req.levers
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
def list_ingested_documents():
    """Returns the list and status of all documents in the local knowledge base (docs/)."""
    docs = evidence_store.get_ingested_documents()
    return {
        "success": True,
        "total_documents": len(docs),
        "documents": docs
    }

@router.post("/ingest")
def trigger_document_ingestion(force: bool = False, max_pages: int = 150):
    """Triggers indexing of local education documents into ChromaDB and SQLite."""
    summary = document_ingestion_service.ingest_all(force=force, max_pages_per_pdf=max_pages)
    return {
        "success": True,
        "summary": summary
    }

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
    indicator: Optional[str] = Query(None, description="Filter by indicator (e.g. enrolment, attendance, water_consumption)"),
    sector: Optional[str] = Query(None, description="Filter by sector (e.g. Education, Agriculture)"),
    limit: int = Query(50, ge=1, le=200)
):
    """Retrieves verified evidence items from the structured database."""
    if indicator:
        items = evidence_store.query_structured_by_indicator(indicator)
    elif sector:
        items = evidence_store.query_by_sector(sector, limit=limit)
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
