"""
Controlled Information Retrieval - Source Controller & Hierarchy Enforcement
Enforces strict domain allowlist, Tier 1-3 source credibility hierarchy, and SSRF protection for Indian Policy Impact Analysis.
"""

from urllib.parse import urlparse
import ipaddress
import socket
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

BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

class SourceController:
    """Controls source domain permissions, checks hierarchy tiers, and blocks unauthorized/SSRF retrieval."""

    def __init__(self, custom_allowed_domains: Optional[List[str]] = None):
        self.allowed_domains = set(custom_allowed_domains or ALLOWED_DOMAINS)

    def is_ssrf_safe(self, url: str) -> bool:
        """Verifies URL is not targeting localhost, private network, or unsafe schemes."""
        if not url:
            return False
        parsed = urlparse(url)
        if parsed.scheme.lower() not in ("http", "https"):
            return False

        hostname = (parsed.hostname or "").lower()
        if not hostname or hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return False

        # Check if hostname is raw IP
        try:
            ip = ipaddress.ip_address(hostname)
            for net in BLOCKED_IP_NETWORKS:
                if ip in net:
                    return False
        except ValueError:
            # Domain name, check for direct local names
            if hostname.endswith(".local") or hostname.endswith(".internal"):
                return False

        return True

    def extract_domain(self, url: str) -> str:
        """Extracts normalized hostname/domain from URL."""
        if not url:
            return ""
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if ":" in netloc:
            netloc = netloc.split(":")[0]
        return netloc

    def is_domain_allowed(self, url: str) -> bool:
        """Checks if a URL belongs to the approved domain allowlist (including subdomains) and is SSRF-safe."""
        if not self.is_ssrf_safe(url):
            return False

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
        valid_results.sort(key=lambda x: x["tier"])
        return valid_results

    def verify_source(self, source_id_or_url: str) -> Dict[str, Any]:
        """Verifies credibility, tier, and provenance of a source URL or identifier."""
        is_allowed = self.is_domain_allowed(source_id_or_url)
        tier, desc = self.get_source_tier_info(source_id_or_url) if is_allowed else (4, "Unverified or Blocked")
        return {
            "source": source_id_or_url,
            "is_allowed": is_allowed,
            "ssrf_safe": self.is_ssrf_safe(source_id_or_url),
            "tier": tier,
            "description": desc
        }

# Global Singleton instance
source_controller = SourceController()
