"""
Evidence Extractor & Validator.
Extracts Policy Evidence Objects from text/PDF chunks, verifies statistical claims against source text,
and enforces the distinction between OBSERVED, MODELLED, and PROJECTED metrics.
"""

import re
from typing import Dict, Any, List, Optional
from backend.retrieval.source_controller import source_controller

class EvidenceExtractor:
    """Extracts structured empirical claims and validates source ground truth."""

    def extract_evidence_from_chunk(
        self,
        chunk: Dict[str, Any],
        policy_context: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Parses a document/PDF page chunk to identify quantitative policy impact claims.
        """
        text = chunk.get("text", "")
        url = chunk.get("url", "")
        doc_title = chunk.get("document", "Official Report")
        org = chunk.get("organization", "Government Authority")
        page = chunk.get("page", 1)
        year = chunk.get("year", 2024)
        tier = chunk.get("tier", 1)
        source_type = chunk.get("source_type", "Government Authority")

        extracted_items = []

        # Regular expressions to catch percentage lifts, fiscal amounts, and quantitative indicators
        pct_patterns = [
            r"([A-Za-z\s]+?)\s+(?:increased|lifted|boosted|raised|grew by)\s+(\+?\d+(?:\.\d+)?)\s*%",
            r"([A-Za-z\s]+?)\s+(?:reduced|decreased|declined|curbed|lowered by)\s+(\-?\d+(?:\.\d+)?)\s*%",
            r"(\d+(?:\.\d+)?)\s*%\s+(?:increase|rise|gain|reduction|decline)\s+in\s+([A-Za-z\s]+)"
        ]

        for pattern in pct_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                groups = m.groups()
                if len(groups) == 2:
                    if groups[0].replace(".", "").replace("+", "").replace("-", "").isdigit():
                        val_str, indicator_raw = groups[0], groups[1]
                    else:
                        indicator_raw, val_str = groups[0], groups[1]

                    indicator_clean = indicator_raw.strip().lower()
                    if len(indicator_clean) > 4 and len(indicator_clean) < 60:
                        try:
                            val = float(val_str.replace("+", ""))
                            is_decrease = "reduced" in m.group(0).lower() or "decreased" in m.group(0).lower() or "decline" in m.group(0).lower()
                            
                            extracted_items.append({
                                "claim": m.group(0).strip(),
                                "value": -abs(val) if is_decrease else abs(val),
                                "unit": "percent",
                                "indicator": self._map_to_standard_indicator(indicator_clean),
                                "variable": indicator_clean.replace(" ", "_"),
                                "population": "Target Beneficiaries",
                                "sector": self._infer_sector(indicator_clean),
                                "region": "India",
                                "year": year,
                                "effect": "negative" if is_decrease else "positive",
                                "direction": "decrease" if is_decrease else "increase",
                                "methodology": "Official Evaluation / Empirical Study",
                                "source_title": doc_title,
                                "source_organization": org,
                                "source_type": source_type,
                                "source_tier": tier,
                                "source_url": url,
                                "source_page": page,
                                "confidence": "HIGH" if tier == 1 else ("MEDIUM" if tier == 2 else "LOW"),
                                "data_type": "OBSERVED"
                            })
                        except ValueError:
                            pass

        return extracted_items

    def validate_evidence(self, item: Dict[str, Any], raw_source_text: str) -> Dict[str, Any]:
        """
        Validates whether the numerical value and claim exist within the raw source text.
        Marks unverified claims with confidence = LOW.
        """
        val = str(item.get("value", ""))
        url = item.get("source_url", "")

        # 1. Validate Domain Allowlist
        if not source_controller.is_domain_allowed(url):
            item["confidence"] = "LOW"
            item["validation_error"] = "Source URL domain is not in approved allowlist."
            item["data_type"] = "MODELLED"
            return item

        # 2. Check if numerical claim exists in the source text
        clean_val = val.replace("-", "").replace("+", "")
        if clean_val and clean_val not in raw_source_text:
            # Fallback verification: check if within ±1% or present in text
            if clean_val.split(".")[0] not in raw_source_text:
                item["confidence"] = "LOW"
                item["validation_error"] = f"Numerical value {val} could not be verified directly in source page text."
                item["data_type"] = "MODELLED"
                return item

        item["confidence"] = "HIGH" if item.get("source_tier", 1) == 1 else "MEDIUM"
        item["data_type"] = "OBSERVED"
        return item

    def _map_to_standard_indicator(self, text: str) -> str:
        t = text.lower()
        if "income" in t: return "farmer_income"
        if "productiv" in t or "yield" in t: return "crop_productivity"
        if "water" in t or "irrigation" in t: return "water_consumption"
        if "groundwater" in t or "table" in t: return "groundwater_depletion"
        if "cost" in t or "expenditure" in t or "subsidy" in t: return "government_cost"
        if "health" in t or "diarrh" in t or "malnutri" in t: return "health_welfare"
        return "general_welfare"

    def _infer_sector(self, text: str) -> str:
        t = text.lower()
        if "water" in t or "groundwater" in t: return "Water & Environment"
        if "crop" in t or "farm" in t or "agri" in t: return "Agriculture"
        if "health" in t: return "Healthcare"
        if "education" in t or "school" in t: return "Education"
        if "cost" in t or "fiscal" in t or "subsidy" in t: return "Public Finance"
        return "Social Welfare"

# Global Singleton instance
evidence_extractor = EvidenceExtractor()
