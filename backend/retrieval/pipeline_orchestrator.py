"""
Pipeline Orchestrator: End-to-End Controlled Information Retrieval & Evidence Simulation Pipeline.
Coordinates:
1. Sector Detection & Strategy Routing (Local docs/ for Education vs Approved Web Research for Other Sectors)
2. Dual-Memory Evidence Retrieval (ChromaDB + SQLite3)
3. Python Metric Computation & Multi-Scenario Modeling (NumPy / Pandas)
4. Llama 3.1 8B Synthesis with Grounded Page Citations
"""

import asyncio
from typing import Dict, Any, List, Optional
from backend.retrieval.source_controller import source_controller, ALLOWED_DOMAINS
from backend.retrieval.education_retriever import education_retriever
from backend.retrieval.web_retriever import web_retriever
from backend.retrieval.pdf_processor import pdf_processor
from backend.retrieval.evidence_store import evidence_store
from backend.retrieval.evidence_extractor import evidence_extractor
from backend.retrieval.policy_similarity import policy_similarity_engine
from backend.simulation.metric_computer import metric_computer
from backend.simulation.budget_engine import budget_engine
from backend.retrieval.online_analyst import online_analyst
from backend.retrieval.llama_engine import llama_engine

class PipelineOrchestrator:
    """Coordinates the dual-strategy retrieval, empirical computation, and grounded LLM evaluation workflow."""

    async def execute_full_pipeline(
        self,
        user_policy_query: str,
        domain_override: str = 'auto',
        categories: Optional[List[str]] = None,
        levers: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Executes the evidence-based analysis:
        - Strategy 1 (Education): Local knowledge base (docs/)
        - Strategy 2 (Other Sectors): Dynamic web research on approved domains
        """
        levers_dict = levers or {}
        cats = [c.lower() for c in (categories or [])]
        query_lower = user_policy_query.lower()

        is_education = any("education" in c or "student" in c or "school" in c for c in cats) or \
                       any(k in query_lower for k in ["education", "school", "student", "teacher", "meal", "poshan", "scholarship", "cmdm", "mid-day", "hostel", "literacy"])

        # Calculate deterministic budget allocations
        budget_calc = budget_engine.calculate(levers_dict, categories)

        # ══════════════════════════════════════════════════════════════
        # STRATEGY 1: EDUCATION SECTOR (LOCAL KNOWLEDGE BASE)
        # ══════════════════════════════════════════════════════════════
        if is_education:
            # 1. Retrieve grounded evidence from local docs/
            retrieval_res = education_retriever.retrieve_education_evidence(user_policy_query, top_k=8)
            evidence_items = retrieval_res["evidence"]
            chunks = retrieval_res["chunks"]
            baselines = retrieval_res["baselines"]
            evidence_gaps = retrieval_res["evidence_gaps"]

            # 2. Compute Publication-Grade Python Metrics (Deterministic / NumPy)
            sim_res = metric_computer.compute_policy_metrics(
                sector="Education",
                policy_text=user_policy_query,
                levers=levers_dict,
                baselines=baselines,
                evidence_items=evidence_items,
                budget_calc=budget_calc
            )

            # 3. Plan structured policy representation
            plan = await llama_engine.plan_policy_query(user_policy_query)
            structured_policy = plan.get("structured_policy", {})

            # 4. Synthesize Publication-Grade Officer Dossier (Gemini / Groq 120B / Local)
            try:
                report = await online_analyst.generate_policy_dossier(
                    policy_text=user_policy_query,
                    budget_calc=budget_calc,
                    simulation_results=sim_res,
                    evidence_items=evidence_items
                )
            except Exception as e:
                print(f"Online analyst error, falling back to local llama: {e}")
                report = await llama_engine.synthesize_policy_report(
                    policy_text=user_policy_query,
                    structured_policy=structured_policy,
                    evidence_items=evidence_items,
                    simulation_results=sim_res,
                    historical_matches=[],
                    evidence_gaps=evidence_gaps,
                    budget_calc=budget_calc
                )

            # Inject Groq beneficiary explanation into proofs if available
            proofs_data = sim_res.get("proofs", {})
            if report.get("beneficiary_explanation") and "beneficiaries" in proofs_data:
                proofs_data["beneficiaries"]["groq_explanation"] = report["beneficiary_explanation"]

            return {
                "sector": "education",
                "source_strategy": "Local Document Knowledge Base (AIPolicySimulator/docs/)",
                "simulation": {
                    "effectiveness_score": sim_res["effectiveness_score"],
                    "fiscal_cost_lakh_cr": sim_res["fiscal_cost_lakh_cr"],
                    "sustainability_score": sim_res["sustainability_score"],
                    "beneficiary_group": sim_res["beneficiary_group"],
                    "sectoral": sim_res["sectoral"],
                    "proofs": proofs_data
                },
                "proofs": proofs_data,
                "ai_guidance": {
                    "executive_verdict": report.get("executive_verdict", ""),
                    "fiscal_and_regional_risks": report.get("fiscal_and_regional_risks", ""),
                    "strategic_recommendations": report.get("strategic_recommendations", [])
                },
                "budget_calculation": budget_calc,
                "report": report,
                "metrics": sim_res["metrics"],
                "scenarios": sim_res["scenarios"],
                "evidence_used": evidence_items[:8],
                "evidence_gaps": evidence_gaps,
                "methodology": sim_res["methodology"],
                "primary_documents": retrieval_res["primary_documents"]
            }

        # ══════════════════════════════════════════════════════════════
        # STRATEGY 2: OTHER SECTORS (DYNAMIC WEB RESEARCH ON APPROVED DOMAINS)
        # ══════════════════════════════════════════════════════════════
        else:
            plan = await llama_engine.plan_policy_query(user_policy_query)
            structured_policy = plan.get("structured_policy", {})
            research_queries = plan.get("research_queries", [user_policy_query])

            # Search approved government & academic domains in parallel
            search_tasks = [web_retriever.search_web(q, max_results=3) for q in research_queries[:3]]
            search_results_nested = await asyncio.gather(*search_tasks, return_exceptions=True)

            all_search_results = []
            for res in search_results_nested:
                if isinstance(res, list):
                    all_search_results.extend(res)

            # Deduplicate by URL
            unique_sources = {}
            for r in all_search_results:
                if r["url"] not in unique_sources:
                    unique_sources[r["url"]] = r
            ranked_sources = list(unique_sources.values())
            ranked_sources.sort(key=lambda x: x.get("tier", 1))

            # Fetch top approved sources
            newly_extracted_evidence = []
            for src in ranked_sources[:3]:
                url = src["url"]
                if url.lower().endswith(".pdf"):
                    try:
                        chunks = await pdf_processor.fetch_and_process_pdf(
                            url=url, document_title=src.get("title"), organization=src.get("domain"), year=2024
                        )
                        for chk in chunks[:2]:
                            items = evidence_extractor.extract_evidence_from_chunk(chk, user_policy_query)
                            for itm in items:
                                val_item = evidence_extractor.validate_evidence(itm, chk.get("text", ""))
                                newly_extracted_evidence.append(val_item)
                                evidence_store.insert_evidence(val_item)
                    except Exception:
                        pass
                else:
                    page_data = await web_retriever.fetch_webpage(url)
                    if page_data.get("success"):
                        chunk_mock = {
                            "document": page_data.get("title", src.get("title")),
                            "organization": page_data.get("domain", "Government Portal"),
                            "page": 1,
                            "url": url,
                            "text": page_data.get("text", "")[:3000]
                        }
                        items = evidence_extractor.extract_evidence_from_chunk(chunk_mock, user_policy_query)
                        for itm in items:
                            val_item = evidence_extractor.validate_evidence(itm, page_data.get("text", ""))
                            newly_extracted_evidence.append(val_item)
                            evidence_store.insert_evidence(val_item)

            # Semantic search in database
            semantic_evidence = evidence_store.search_semantic(user_policy_query, top_k=6)
            combined_evidence = semantic_evidence + newly_extracted_evidence

            # Deduplicate
            seen = set()
            deduped_evidence = []
            for ev in combined_evidence:
                c = ev.get("claim", "")[:60]
                if c not in seen:
                    seen.add(c)
                    deduped_evidence.append(ev)

            # Python Metric Computation
            sim_res = metric_computer.compute_policy_metrics(
                sector=structured_policy.get("sector", "General Welfare"),
                policy_text=user_policy_query,
                levers=levers_dict,
                evidence_items=deduped_evidence,
                budget_calc=budget_calc
            )

            # Historical comparisons
            historical_matches = policy_similarity_engine.find_similar_policies(
                policy_description=user_policy_query,
                policy_area=structured_policy.get("sector", "welfare"),
                top_n=3
            )

            evidence_gaps = [
                "Real-time state-level expenditure variations require State Budget Document panel harmonisation.",
                "Sub-district beneficiary targeting accuracy relies on periodic sample survey audit records."
            ]

            # Synthesize Publication-Grade Officer Dossier (Gemini / Groq 120B / Local)
            try:
                report = await online_analyst.generate_policy_dossier(
                    policy_text=user_policy_query,
                    budget_calc=budget_calc,
                    simulation_results=sim_res,
                    evidence_items=deduped_evidence
                )
            except Exception as e:
                print(f"Online analyst error, falling back to local llama: {e}")
                report = await llama_engine.synthesize_policy_report(
                    policy_text=user_policy_query,
                    structured_policy=structured_policy,
                    evidence_items=deduped_evidence,
                    simulation_results=sim_res,
                    historical_matches=historical_matches,
                    evidence_gaps=evidence_gaps,
                    budget_calc=budget_calc
                )

            # Inject Groq beneficiary explanation into proofs if available
            proofs_data = sim_res.get("proofs", {})
            if report.get("beneficiary_explanation") and "beneficiaries" in proofs_data:
                proofs_data["beneficiaries"]["groq_explanation"] = report["beneficiary_explanation"]

            return {
                "sector": structured_policy.get("sector", "general"),
                "source_strategy": "Dynamic Controlled Web Research on Approved Domains",
                "simulation": {
                    "effectiveness_score": sim_res["effectiveness_score"],
                    "fiscal_cost_lakh_cr": sim_res["fiscal_cost_lakh_cr"],
                    "sustainability_score": sim_res["sustainability_score"],
                    "beneficiary_group": sim_res["beneficiary_group"],
                    "sectoral": sim_res["sectoral"],
                    "proofs": proofs_data
                },
                "proofs": proofs_data,
                "ai_guidance": {
                    "executive_verdict": report.get("executive_verdict", ""),
                    "fiscal_and_regional_risks": report.get("fiscal_and_regional_risks", ""),
                    "strategic_recommendations": report.get("strategic_recommendations", [])
                },
                "budget_calculation": budget_calc,
                "report": report,
                "metrics": sim_res["metrics"],
                "scenarios": sim_res["scenarios"],
                "evidence_used": deduped_evidence[:8],
                "evidence_gaps": evidence_gaps,
                "methodology": sim_res["methodology"],
                "approved_domains_used": [s["domain"] for s in ranked_sources[:4] if s.get("domain")]
            }

# Global Singleton instance
pipeline_orchestrator = PipelineOrchestrator()
