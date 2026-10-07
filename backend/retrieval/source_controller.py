"""
Controlled Information Retrieval - Source Controller & Hierarchy Enforcement
Enforces strict domain allowlist and Tier 1-4 source credibility hierarchy for Indian Policy Impact Analysis.
"""

from urllib.parse import urlparse
from typing import Dict, Any, List, Optional, Tuple

# Tier 1 - Primary Government & Statutory Authorities (Preferred for Quantitative Engine)
TIER_1_DOMAINS = [
    "data.gov.in",
    "niti.gov.in",
    "dmeo.gov.in",
    "dbtbharat.gov.in",
    "mospi.gov.in",
    "rbi.org.in",
    "indiabudget.gov.in",
    "gov.in",
    "nic.in",
    "agricoop.gov.in",
    "agriwelfare.gov.in",
    "jalshakti-dowr.gov.in",
    "jaljeevanmission.gov.in",
    "mohfw.gov.in",
    "education.gov.in",
    "wcd.gov.in",
    "labour.gov.in",
    "morth.nic.in",
    "rural.nic.in",
    "dfpd.gov.in",
    "pmkisan.gov.in",
    "pmjay.gov.in",
    "nrega.nic.in",
    "pmfby.gov.in",
    "cag.gov.in",
    "finmin.nic.in",
    "pib.gov.in",
    "sansad.in",
    "prsindia.org"
]

# Tier 2 - High-Quality International & Academic Institutions
TIER_2_DOMAINS = [
    "worldbank.org",
    "fao.org",
    "un.org",
    "who.int",
    "imf.org",
    "adb.org",
    "undp.org",
    "unicef.org",
    "ieee.org",
    "springer.com",
    "sciencedirect.com",
    "nature.com",
    "thelancet.com",
    "jstor.org"
]

# Tier 3 - Recognized Think Tanks & University Research Institutes
TIER_3_DOMAINS = [
    "icrier.org",
    "cprindia.org",
    "orfonline.org",
    "igidr.ac.in",
    "isid.org.in",
    "nipfp.org.in",
    "ncaer.org",
    "iimb.ac.in",
    "iima.ac.in",
    "isb.edu",
    "iitd.ac.in",
    "iitb.ac.in",
    "iitm.ac.in",
    "epw.in"
]

# Master Allowlist Configuration
ALLOWED_DOMAINS = list(set(TIER_1_DOMAINS + TIER_2_DOMAINS + TIER_3_DOMAINS))

class SourceController:
    """Controls source domain permissions, checks hierarchy tiers, and blocks unauthorized retrieval."""

    def __init__(self, custom_allowed_domains: Optional[List[str]] = None):
        self.allowed_domains = set(custom_allowed_domains or ALLOWED_DOMAINS)

    def extract_domain(self, url: str) -> str:
        """Extracts normalized hostname/domain from URL."""
        if not url:
            return ""
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        # strip port if present
        if ":" in netloc:
            netloc = netloc.split(":")[0]
        return netloc

    def is_domain_allowed(self, url: str) -> bool:
        """Checks if a URL belongs to the approved domain allowlist (including subdomains)."""
        domain = self.extract_domain(url)
        if not domain:
            return False

        # Direct or suffix match (e.g. sub.niti.gov.in matches niti.gov.in or gov.in)
        for allowed in self.allowed_domains:
            if domain == allowed or domain.endswith("." + allowed):
                return True
        return False

    def get_source_tier_info(self, url: str) -> Tuple[int, str]:
        """
        Determines the credibility tier and source type for a given URL.
        Returns: (tier_number, source_type_description)
        """
        domain = self.extract_domain(url)

        # Check Tier 1
        for allowed in TIER_1_DOMAINS:
            if domain == allowed or domain.endswith("." + allowed):
                return 1, "Primary Government of India Authority"

        # Check Tier 2
        for allowed in TIER_2_DOMAINS:
            if domain == allowed or domain.endswith("." + allowed):
                return 2, "High-Quality International / Academic Institute"

        # Check Tier 3
        for allowed in TIER_3_DOMAINS:
            if domain == allowed or domain.endswith("." + allowed):
                return 3, "Recognized Think Tank / University Research"

        return 4, "Unverified Source (Excluded from Quantitative Policy Core)"

    def validate_and_filter_urls(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Filters a list of URLs against allowlist and attaches credibility tier metadata."""
        valid_results = []
        for url in urls:
            if self.is_domain_allowed(url):
                tier, source_type = self.get_source_tier_info(url)
                valid_results.append({
                    "url": url,
                    "domain": self.extract_domain(url),
                    "tier": tier,
                    "source_type": source_type,
                    "is_allowed": True
                })
        # Sort by credibility tier (Tier 1 first)
        valid_results.sort(key=lambda x: x["tier"])
        return valid_results

# Global Singleton instance
source_controller = SourceController()
