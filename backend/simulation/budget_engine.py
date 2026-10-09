"""
Mathematical Budget Engine (Python Backend):
Pure deterministic calculation of proposed allocations, budget differences,
gross increases, gross reductions, and sector aggregates based on:
    B_new = B_base * (1 + Delta / 100)
"""

from typing import Dict, Any, List, Optional
import math

SECTOR_BUDGET_CATALOG = {
    "water-reforms": {
        "name": "Water Reforms",
        "ministry": "Ministry of Jal Shakti",
        "total_budget": 94808,
        "sliders": [
            {"id": "water-infra-construction-funding", "name": "Water Infrastructure & Project Construction Funding", "baseline": 11377},
            {"id": "potable-drinking-water-budget", "name": "Potable Drinking Water Supply Budget", "baseline": 13273},
            {"id": "rural-household-water-connections", "name": "Rural Household Water Connections", "baseline": 11377},
            {"id": "agri-irrigation-water-budget", "name": "Agricultural Irrigation Water Budget", "baseline": 11377},
            {"id": "groundwater-recharge-aquifer-restoration", "name": "Groundwater Recharge & Aquifer Restoration", "baseline": 7585},
            {"id": "river-cleaning-pollution-control", "name": "River Cleaning & Pollution Control", "baseline": 9481},
            {"id": "dam-reservoir-storage-development", "name": "Dam, Reservoir & Water Storage Development", "baseline": 7585},
            {"id": "wastewater-treatment-recycling", "name": "Wastewater Treatment & Water Recycling", "baseline": 7585},
            {"id": "rainwater-harvesting-watershed-development", "name": "Rainwater Harvesting & Watershed Development", "baseline": 7585},
            {"id": "water-conservation-smart-metering", "name": "Water Conservation, Leak Detection & Smart Metering", "baseline": 7583}
        ]
    },
    "agriculture-farming": {
        "name": "Agriculture & Farming",
        "ministry": "Agriculture & Farmers Welfare",
        "total_budget": 140529,
        "sliders": [
            {"id": "farmer-subsidies-direct-assistance", "name": "Farmer Subsidies & Direct Financial Assistance", "baseline": 25295},
            {"id": "irrigation-infra-micro-irrigation", "name": "Irrigation Infrastructure & Micro-Irrigation", "baseline": 16863},
            {"id": "fertilizer-subsidies", "name": "Fertilizer Subsidies", "baseline": 28106},
            {"id": "agri-electricity-subsidies", "name": "Agricultural Electricity Subsidies", "baseline": 11242},
            {"id": "msp-procurement-support", "name": "Minimum Support Price (MSP) & Procurement Support", "baseline": 16863},
            {"id": "crop-insurance-disaster-compensation", "name": "Crop Insurance & Disaster Compensation", "baseline": 14053},
            {"id": "agri-research-improved-seeds", "name": "Agricultural Research & Improved Seeds", "baseline": 8432},
            {"id": "farm-mechanization-equipment-subsidies", "name": "Farm Mechanization & Equipment Subsidies", "baseline": 7026},
            {"id": "agri-storage-cold-chains-warehousing", "name": "Agricultural Storage, Cold Chains & Warehousing", "baseline": 7026},
            {"id": "farmer-training-digital-agriculture", "name": "Farmer Training, Extension Services & Digital Agriculture", "baseline": 5623}
        ]
    },
    "education": {
        "name": "Education",
        "ministry": "Ministry of Education",
        "total_budget": 139289,
        "sliders": [
            {"id": "per-student-school-funding", "name": "Per-Student School Funding", "baseline": 16715},
            {"id": "teacher-recruitment-training", "name": "Teacher Recruitment & Training", "baseline": 27858},
            {"id": "school-infra-construction", "name": "School Infrastructure & Construction", "baseline": 20893},
            {"id": "digital-classrooms-connectivity", "name": "Digital Classrooms & Internet Connectivity", "baseline": 11143},
            {"id": "scholarships-disadvantaged-students", "name": "Scholarships for Economically Disadvantaged Students", "baseline": 13929},
            {"id": "mid-day-meals-pm-poshan-funding", "name": "Mid-Day Meals / PM POSHAN Funding", "baseline": 13929},
            {"id": "foundational-literacy-numeracy", "name": "Foundational Literacy & Numeracy Programmes", "baseline": 11143},
            {"id": "higher-education-university-grants", "name": "Higher Education & University Grants", "baseline": 13929},
            {"id": "girls-education-gender-equity", "name": "Girls' Education & Gender-Equity Programmes", "baseline": 5572},
            {"id": "vocational-training-employability", "name": "Vocational Training, Skill Development & Employability", "baseline": 4178}
        ]
    },
    "healthcare": {
        "name": "Healthcare",
        "ministry": "Health & Family Welfare",
        "total_budget": 106530,
        "sliders": [
            {"id": "primary-healthcare-centres", "name": "Primary Healthcare & Health Centres", "baseline": 15980},
            {"id": "govt-hospital-infrastructure", "name": "Government Hospital Infrastructure", "baseline": 15980},
            {"id": "healthcare-worker-recruitment", "name": "Doctor, Nurse & Healthcare Worker Recruitment", "baseline": 21306},
            {"id": "essential-medicines-supplies", "name": "Essential Medicines & Medical Supplies", "baseline": 12784},
            {"id": "public-health-insurance-coverage", "name": "Public Health Insurance & Treatment Coverage", "baseline": 15980},
            {"id": "maternal-reproductive-healthcare", "name": "Maternal & Reproductive Healthcare", "baseline": 6392},
            {"id": "child-healthcare-immunisation", "name": "Child Healthcare & Immunisation", "baseline": 5327},
            {"id": "disease-prevention-surveillance", "name": "Disease Prevention & Epidemiological Surveillance", "baseline": 4261},
            {"id": "mental-healthcare-services", "name": "Mental Healthcare Services", "baseline": 3196},
            {"id": "medical-research-diagnostics-tech", "name": "Medical Research, Diagnostics & Health Technology", "baseline": 5324}
        ]
    },
    "housing-urban-development": {
        "name": "Housing & Urban Development",
        "ministry": "Housing & Urban Affairs",
        "total_budget": 85522,
        "sliders": [
            {"id": "affordable-housing-construction", "name": "Affordable Housing Construction", "baseline": 17104},
            {"id": "urban-slum-redevelopment", "name": "Urban Slum Redevelopment", "baseline": 6842},
            {"id": "urban-water-supply-sanitation", "name": "Urban Water Supply & Sanitation", "baseline": 10263},
            {"id": "sewage-treatment-drainage-systems", "name": "Sewage Treatment & Drainage Systems", "baseline": 10263},
            {"id": "urban-roads-street-infrastructure", "name": "Urban Roads & Street Infrastructure", "baseline": 10263},
            {"id": "public-transport-urban-mobility", "name": "Public Transport & Urban Mobility", "baseline": 8552},
            {"id": "affordable-rental-housing", "name": "Affordable Rental Housing", "baseline": 4276},
            {"id": "smart-city-digital-urban-infra", "name": "Smart City & Digital Urban Infrastructure", "baseline": 6842},
            {"id": "parks-green-spaces-urban-forestry", "name": "Parks, Green Spaces & Urban Forestry", "baseline": 4276},
            {"id": "urban-flood-prevention-resilience", "name": "Urban Flood Prevention & Climate Resilience", "baseline": 6841}
        ]
    },
    "women-empowerment": {
        "name": "Women Empowerment",
        "ministry": "Gender Budget Statement",
        "total_budget": 501000,
        "sliders": [
            {"id": "womens-education-scholarships", "name": "Women's Education & Scholarships", "baseline": 50100},
            {"id": "womens-employment-skill-dev", "name": "Women's Employment & Skill Development", "baseline": 60120},
            {"id": "womens-entrepreneurship-business-loans", "name": "Women's Entrepreneurship & Business Loans", "baseline": 60120},
            {"id": "shgs-microfinance", "name": "Self-Help Groups & Microfinance", "baseline": 60120},
            {"id": "maternal-healthcare-nutrition", "name": "Maternal Healthcare & Nutrition", "baseline": 50100},
            {"id": "womens-safety-legal-assistance", "name": "Women's Safety & Legal Assistance", "baseline": 60120},
            {"id": "prevention-gender-violence", "name": "Prevention of Gender-Based Violence", "baseline": 50100},
            {"id": "childcare-working-womens-hostels", "name": "Childcare & Working Women's Hostels", "baseline": 40080},
            {"id": "digital-financial-literacy-women", "name": "Digital & Financial Literacy for Women", "baseline": 35070},
            {"id": "equal-pay-workplace-inclusion", "name": "Equal Pay, Workplace Inclusion & Employment Support", "baseline": 35070}
        ]
    },
    "rural-development": {
        "name": "Rural Development",
        "ministry": "Department of Rural Development",
        "total_budget": 197023,
        "sliders": [
            {"id": "rural-roads-connectivity", "name": "Rural Roads & Connectivity", "baseline": 29553},
            {"id": "rural-housing-pmay-g", "name": "Rural Housing — PMAY-G", "baseline": 29553},
            {"id": "mgnrega-rural-employment", "name": "MGNREGA & Rural Employment", "baseline": 59107},
            {"id": "rural-drinking-water-sanitation", "name": "Rural Drinking Water & Sanitation", "baseline": 19702},
            {"id": "rural-electrification-reliability", "name": "Rural Electrification & Power Reliability", "baseline": 9851},
            {"id": "village-internet-digital-infra", "name": "Village Internet & Digital Infrastructure", "baseline": 7881},
            {"id": "rural-skill-development-entrepreneurship", "name": "Rural Skill Development & Entrepreneurship", "baseline": 7881},
            {"id": "shgs-rural-livelihoods", "name": "Self-Help Groups & Livelihood Missions", "baseline": 13792},
            {"id": "rural-health-education-infra", "name": "Rural Healthcare & Education Infrastructure", "baseline": 9851},
            {"id": "watershed-rural-asset-creation", "name": "Watershed Development & Rural Asset Creation", "baseline": 9852}
        ]
    },
    "energy-power": {
        "name": "Energy & Power",
        "ministry": "Power + New & Renewable Energy",
        "total_budget": 62912,
        "sliders": [
            {"id": "electricity-generation-infra", "name": "Electricity Generation Infrastructure", "baseline": 12582},
            {"id": "renewable-energy-solar-wind", "name": "Renewable Energy — Solar & Wind", "baseline": 15728},
            {"id": "rural-electrification-household-connections", "name": "Rural Electrification & Household Connections", "baseline": 5033},
            {"id": "power-agri-electricity-subsidies", "name": "Agricultural Electricity Subsidies", "baseline": 5033},
            {"id": "industrial-electricity-support", "name": "Industrial Electricity Subsidies & Support", "baseline": 3146},
            {"id": "transmission-distribution-networks", "name": "Transmission Lines & Distribution Networks", "baseline": 7549},
            {"id": "battery-storage-grid-modernisation", "name": "Battery Storage & Grid Modernisation", "baseline": 6291},
            {"id": "energy-efficiency-demand-mgmt", "name": "Energy Efficiency & Demand Management", "baseline": 2517},
            {"id": "ev-charging-infrastructure", "name": "Electric Vehicle Charging Infrastructure", "baseline": 1887},
            {"id": "clean-energy-green-hydrogen", "name": "Clean Energy Research & Green Hydrogen", "baseline": 3146}
        ]
    },
    "transport-logistics": {
        "name": "Transport & Logistics",
        "ministry": "Road Transport & Highways + Railways",
        "total_budget": 591252,
        "sliders": [
            {"id": "national-highways-expressways", "name": "National Highways & Expressways", "baseline": 206938},
            {"id": "transport-rural-roads-village-conn", "name": "Rural Roads & Village Connectivity", "baseline": 47300},
            {"id": "railway-infra-capacity", "name": "Railway Infrastructure & Capacity", "baseline": 177376},
            {"id": "metro-rail-urban-transit", "name": "Metro Rail & Urban Public Transport", "baseline": 47300},
            {"id": "bus-services-transit-subsidies", "name": "Bus Services & Public Transport Subsidies", "baseline": 17738},
            {"id": "ports-shipping-inland-waterways", "name": "Ports, Shipping & Inland Waterways", "baseline": 29563},
            {"id": "airports-regional-connectivity", "name": "Airports & Regional Air Connectivity", "baseline": 17738},
            {"id": "freight-corridors-logistics-parks", "name": "Freight Corridors & Logistics Parks", "baseline": 23650},
            {"id": "road-safety-accident-prevention", "name": "Road Safety & Accident Prevention", "baseline": 11825},
            {"id": "electric-mobility-low-emission", "name": "Electric Mobility & Low-Emission Transport", "baseline": 11824}
        ]
    }
}

class MathematicalBudgetEngine:
    """
    Validates inputs, executes deterministic budget formula B_new = B_base * (1 + delta / 100),
    and computes per-slider, per-sector, and macro-aggregate allocations.
    """

    @staticmethod
    def validate_percent_change(val: Any) -> float:
        """Validates change percent is numeric, finite, within [-50, 100]."""
        try:
            f = float(val)
            if math.isnan(f) or math.isinf(f):
                return 0.0
            return max(-50.0, min(100.0, f))
        except (ValueError, TypeError):
            return 0.0

    @classmethod
    def calculate(cls, levers: Dict[str, Any], categories: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Executes mathematical budget calculations for the given levers and selected categories.
        """
        # Determine active sectors
        active_sectors = []
        if categories:
            for cat_id in categories:
                if cat_id in SECTOR_BUDGET_CATALOG:
                    active_sectors.append(cat_id)
        if not active_sectors:
            # Fallback: check which sectors the levers belong to
            for sector_id, sec_data in SECTOR_BUDGET_CATALOG.items():
                slider_ids = {s["id"] for s in sec_data["sliders"]}
                if any(k in slider_ids for k in levers.keys()):
                    active_sectors.append(sector_id)
        if not active_sectors:
            active_sectors = list(SECTOR_BUDGET_CATALOG.keys())[:3]

        slider_results: List[Dict[str, Any]] = []
        sector_results: Dict[str, Dict[str, Any]] = {}

        total_baseline = 0.0
        total_proposed = 0.0
        gross_increases = 0.0
        gross_reductions = 0.0
        parameters_changed = 0

        for sec_id in active_sectors:
            sec_info = SECTOR_BUDGET_CATALOG[sec_id]
            sec_base = 0.0
            sec_prop = 0.0
            sec_inc = 0
            sec_dec = 0
            sec_unchanged = 0
            sec_sliders = []

            for s_def in sec_info["sliders"]:
                s_id = s_def["id"]
                b_base = float(s_def["baseline"])
                pct_change = cls.validate_percent_change(levers.get(s_id, 0.0))

                b_new = round(b_base * (1.0 + (pct_change / 100.0)), 2)
                diff = round(b_new - b_base, 2)

                sec_base += b_base
                sec_prop += b_new

                if diff > 0.01:
                    gross_increases += diff
                    sec_inc += 1
                    parameters_changed += 1
                elif diff < -0.01:
                    gross_reductions += abs(diff)
                    sec_dec += 1
                    parameters_changed += 1
                else:
                    sec_unchanged += 1

                slider_res = {
                    "slider_id": s_id,
                    "sector_id": sec_id,
                    "sector_name": sec_info["name"],
                    "policy_name": s_def["name"],
                    "baseline_budget": b_base,
                    "change_percent": pct_change,
                    "proposed_budget": b_new,
                    "budget_difference": diff
                }
                slider_results.append(slider_res)
                sec_sliders.append(slider_res)

            sec_diff = round(sec_prop - sec_base, 2)
            sector_results[sec_id] = {
                "sector_id": sec_id,
                "sector_name": sec_info["name"],
                "ministry": sec_info["ministry"],
                "baseline_budget": round(sec_base, 2),
                "proposed_budget": round(sec_prop, 2),
                "budget_difference": sec_diff,
                "percent_change": round((sec_diff / sec_base * 100.0), 2) if sec_base > 0 else 0.0,
                "sliders_increased": sec_inc,
                "sliders_decreased": sec_dec,
                "sliders_unchanged": sec_unchanged,
                "sliders": sec_sliders
            }

            total_baseline += sec_base
            total_proposed += sec_prop

        net_change = round(total_proposed - total_baseline, 2)
        gross_increases = round(gross_increases, 2)
        gross_reductions = round(gross_reductions, 2)

        agg = {
            "total_baseline_budget": round(total_baseline, 2),
            "total_proposed_budget": round(total_proposed, 2),
            "net_change": net_change,
            "pct_change": round((net_change / total_baseline * 100.0), 2) if total_baseline > 0 else 0.0,
            "gross_increases": gross_increases,
            "gross_reductions": gross_reductions,
            "parameters_changed": parameters_changed,
            "total_parameters_configured": len(slider_results)
        }

        return {
            "per_slider": slider_results,
            "per_sector": sector_results,
            "aggregate": agg,
            "macro_aggregate": agg
        }

budget_engine = MathematicalBudgetEngine()
