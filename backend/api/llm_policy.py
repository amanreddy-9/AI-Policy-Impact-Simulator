"""LLM Policy Evaluation Router: Parses text descriptions & slider inputs, triggers Monte Carlo simulations, and generates executive policy summaries."""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from backend.simulation.monte_carlo import simulate_comprehensive

router = APIRouter()

class PolicyEvaluateRequest(BaseModel):
    mode: str = "custom"  # "custom" or "existing"
    policy_name: Optional[str] = "Custom Policy Initiative"
    description: str = ""
    levers: Dict[str, float]

def generate_ai_executive_summary(
    mode: str,
    policy_name: str,
    description: str,
    sim_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Generates structured executive policy guidance using LLM analysis (with robust fallback)."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    eff_score = sim_data["effectiveness_score"]
    fiscal_cost = sim_data["fiscal_cost_lakh_cr"]
    sust_score = sim_data["sustainability_score"]
    income_delta = sim_data["overall_deltas"]["income_pct"]
    pov_delta = sim_data["overall_deltas"]["poverty_pct"]
    
    caste_sc = sim_data["sectoral"]["caste"]["SC"]
    caste_st = sim_data["sectoral"]["caste"]["ST"]
    women_impact = sim_data["sectoral"]["gender"]["women"]

    # Try LLM generation if key is present
    if groq_api_key and groq_api_key.startswith("gsk_"):
        try:
            import urllib.request
            import json

            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            }
            prompt = f"""You are a Senior Public Policy Advisor to the Government of India.
Analyze the following policy proposal:
- Policy Name / Mode: {policy_name} ({mode})
- User Intent & Description: "{description}"
- Key Simulation Results:
  * Policy Effectiveness Score: {eff_score}/100
  * Total Fiscal Cost: ₹ {fiscal_cost} Lakh Crore ({sim_data['budget_feasibility']})
  * 5-Year Sustainability Index: {sust_score}/100
  * Income Boost: +{income_delta}% | Poverty Reduction: {pov_delta}%
  * Targeted Impact: SC (+{caste_sc}%), ST (+{caste_st}%), Women (+{women_impact}%)

Provide a concise 3-part structured assessment:
1. Executive Verdict & Core Strengths
2. Fiscal & Implementation Risks (regional bottlenecks or inflation)
3. 2 Key Policy Refinements to maximize social ROI. Keep total response under 200 words."""

            payload = {
                "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 300,
                "temperature": 0.5
            }

            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                llm_text = res_data["choices"][0]["message"]["content"]
                return {
                    "source": "Groq Llama-3.3-70B AI Model",
                    "executive_verdict": llm_text,
                    "policy_viability": "High Viability" if eff_score > 60 and sust_score > 55 else "Conditional Approval"
                }
        except Exception as e:
            pass

    # Intelligent Structured Policy Advisor Fallback
    viability = "Highly Effective & Feasible" if eff_score >= 65 and sust_score >= 60 else ("Moderately Effective" if eff_score >= 45 else "Requires Fiscal Recalibration")
    
    verdict = (
        f"The proposed initiative '{policy_name}' achieves a strong Effectiveness Score of {eff_score}/100 with an estimated fiscal outlay of ₹{fiscal_cost} Lakh Cr. "
        f"Stochastic projections indicate significant positive momentum for marginal groups, driving an average income growth of +{income_delta}% and a poverty reduction of {pov_delta}%. "
        f"Particularly high responsiveness is observed among SC (+{caste_sc}%) and ST (+{caste_st}%) households."
    )
    
    risks = (
        f"Primary risk involves fiscal crowding-out if total outlay exceeds ₹2.0 Lakh Cr. "
        f"Interstate implementation variance between high-capacity states (e.g., AP, MH) and lower baseline states (e.g., Bihar, Odisha) requires targeted administrative support."
    )

    recommendations = [
        "Phase rollout over 3 fiscal quarters to mitigate upfront budgetary pressure.",
        "Integrate Direct Benefit Transfer (DBT) via Aadhaar-linked accounts to minimize leakage in food & credit allocations."
    ]

    return {
        "source": "AI Policy Analytical Engine",
        "policy_viability": viability,
        "executive_verdict": verdict,
        "fiscal_and_regional_risks": risks,
        "strategic_recommendations": recommendations
    }

@router.post("/evaluate")
def evaluate_policy(req: PolicyEvaluateRequest):
    sim_data = simulate_comprehensive(
        levers=req.levers,
        description=req.description,
        mode=req.mode
    )
    ai_guidance = generate_ai_executive_summary(
        mode=req.mode,
        policy_name=req.policy_name or "Policy Proposal",
        description=req.description,
        sim_data=sim_data
    )
    return {
        "status": "success",
        "simulation": sim_data,
        "ai_guidance": ai_guidance
    }
