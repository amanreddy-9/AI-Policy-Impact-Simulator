"""
Unified Policy Repository Data Store Interface:
Provides query, search, and provenance retrieval methods over the local SQLite policy database.
"""

import sqlite3
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Optional

DB_PATH = Path(__file__).resolve().parent / "policy_repository.db"

class PolicyRepository:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DB_PATH

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get_scheme_by_id_or_name(self, query: str) -> Optional[Dict[str, Any]]:
        """Retrieves scheme details by scheme_id, canonical_scheme_name, or raw_scheme_name."""
        if not query:
            return None
        clean_q = query.strip().lower()
        conn = self.get_connection()
        cursor = conn.cursor()

        # Try exact scheme_id match first
        cursor.execute("SELECT * FROM unified_schemes WHERE scheme_id = ?", (clean_q,))
        row = cursor.fetchone()

        if not row:
            # Try fuzzy/partial match on scheme_id, canonical_name, or raw_name
            cursor.execute("""
                SELECT * FROM unified_schemes 
                WHERE LOWER(scheme_id) LIKE ? 
                   OR LOWER(canonical_scheme_name) LIKE ? 
                   OR LOWER(raw_scheme_name) LIKE ?
                ORDER BY 
                    CASE WHEN data_nature = 'observed' THEN 1 ELSE 2 END,
                    latest_budget_allocation_cr DESC
                LIMIT 1
            """, (f"%{clean_q}%", f"%{clean_q}%", f"%{clean_q}%"))
            row = cursor.fetchone()

        conn.close()
        if row:
            res = dict(row)
            # Fetch budget history and indicators
            res["budgets"] = self.get_scheme_budget_history(res["scheme_id"])
            res["indicators"] = self.get_scheme_indicators(res["scheme_id"])
            return res
        return None

    def search_schemes(self, sector: Optional[str] = None, text_query: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Searches schemes by sector or keyword search."""
        conn = self.get_connection()
        cursor = conn.cursor()

        query_sql = "SELECT * FROM unified_schemes WHERE 1=1"
        params = []

        if sector:
            query_sql += " AND (LOWER(sector) LIKE ? OR LOWER(sector) = ?)"
            params.extend([f"%{sector.lower()}%", sector.lower()])

        if text_query:
            query_sql += " AND (LOWER(canonical_scheme_name) LIKE ? OR LOWER(raw_scheme_name) LIKE ? OR LOWER(description) LIKE ?)"
            params.extend([f"%{text_query.lower()}%", f"%{text_query.lower()}%", f"%{text_query.lower()}%"])

        query_sql += " ORDER BY CASE WHEN data_nature = 'observed' THEN 1 ELSE 2 END, latest_budget_allocation_cr DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query_sql, params)
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_scheme_budget_history(self, scheme_id: str) -> List[Dict[str, Any]]:
        """Retrieves budget allocation/spent history for a given scheme."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scheme_budgets WHERE scheme_id = ? ORDER BY fiscal_year ASC", (scheme_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_scheme_indicators(self, scheme_id: str) -> List[Dict[str, Any]]:
        """Retrieves outcome indicators for a scheme."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scheme_indicators WHERE scheme_id = ?", (scheme_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_provenance_and_citations(self, scheme_id: str) -> Dict[str, Any]:
        """Returns provenance metadata and local record citations for a scheme."""
        scheme = self.get_scheme_by_id_or_name(scheme_id)
        if not scheme:
            return {}
        return {
            "source_name": scheme.get("source_name", "Unified Policy Repository"),
            "source_file": scheme.get("source_file", "RAW_to_UNIFORM_DATASOURCE/policy_repository.db"),
            "record_provenance_id": scheme.get("record_provenance_id"),
            "data_nature": scheme.get("data_nature", "observed"),
            "data_quality_score": scheme.get("data_quality_score", 0.90),
            "canonical_scheme_name": scheme.get("canonical_scheme_name"),
            "sector": scheme.get("sector"),
            "latest_budget_allocation_cr": scheme.get("latest_budget_allocation_cr")
        }

policy_repository = PolicyRepository()
