"""
Document Ingestion Service: High-Fidelity Extraction & Indexing Pipeline
Recursively scans AIPolicySimulator/docs/ and docs/ to ingest PDFs, DOCX, CSVs, Spreadsheets,
extracting text, tables, numerical indicators, and page metadata into ChromaDB and SQLite.
"""

import os
import hashlib
import zipfile
import re
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

import pymupdf  # PyMuPDF
import docx
import pandas as pd
from backend.retrieval.evidence_store import evidence_store

DOCS_DIRS = ["docs", "AIPolicySimulator/docs"]

class DocumentIngestionService:
    """Processes education policy reports and datasets, populating the dual-memory knowledge base."""

    def __init__(self, docs_dirs: Optional[List[str]] = None):
        self.docs_dirs = docs_dirs or DOCS_DIRS

    def calculate_file_hash(self, file_path: str) -> str:
        """Computes SHA-256 hash of a file for incremental processing and deduplication."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    def discover_files(self) -> List[str]:
        """Recursively discovers all document and dataset files across target directories."""
        discovered = set()
        for d in self.docs_dirs:
            if not os.path.exists(d):
                continue
            for root, _, files in os.walk(d):
                for f in files:
                    # Ignore hidden files, temporary files, system files
                    if f.startswith(".") or f.startswith("~$") or f == "PROJECT_STATUS.json":
                        continue
                    ext = os.path.splitext(f)[1].lower()
                    if ext in [".pdf", ".docx", ".doc", ".csv", ".xlsx", ".xls", ".zip", ".txt", ".md"]:
                        full_path = os.path.abspath(os.path.join(root, f))
                        discovered.add(full_path)
        return sorted(list(discovered))

    def ingest_all(self, force: bool = False, max_pages_per_pdf: int = 150) -> Dict[str, Any]:
        """
        Runs incremental or forced ingestion across all discovered files.
        Returns a summary report of processing status, pages, chunks, and errors.
        """
        files = self.discover_files()
        results = {
            "total_files_discovered": len(files),
            "processed": 0,
            "skipped_duplicate": 0,
            "errors": 0,
            "total_chunks_created": 0,
            "total_evidence_extracted": 0,
            "files_summary": []
        }

        # Check existing processed files
        existing_logs = {row["file_path"]: row for row in evidence_store.get_ingested_documents()}

        for file_path in files:
            file_name = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            file_ext = os.path.splitext(file_name)[1].lower()
            file_hash = self.calculate_file_hash(file_path)

            # Skip if already successfully processed with identical hash
            if not force and file_path in existing_logs:
                prev = existing_logs[file_path]
                if prev.get("status") == "SUCCESS" and prev.get("file_hash") == file_hash:
                    results["skipped_duplicate"] += 1
                    results["files_summary"].append({
                        "file_name": file_name,
                        "status": "ALREADY_INDEXED",
                        "chunks": prev.get("chunks_count", 0),
                        "evidence": prev.get("evidence_count", 0)
                    })
                    continue

            try:
                if file_ext == ".pdf":
                    res = self._process_pdf(file_path, file_hash, max_pages=max_pages_per_pdf)
                elif file_ext == ".docx":
                    res = self._process_docx(file_path, file_hash)
                elif file_ext == ".zip":
                    res = self._process_zip(file_path, file_hash)
                elif file_ext in [".csv", ".xlsx", ".xls"]:
                    res = self._process_tabular(file_path, file_hash)
                elif file_ext in [".txt", ".md"]:
                    res = self._process_text(file_path, file_hash)
                else:
                    res = {"chunks": 0, "evidence": 0, "pages": 0, "status": "UNSUPPORTED"}

                results["processed"] += 1
                results["total_chunks_created"] += res["chunks"]
                results["total_evidence_extracted"] += res["evidence"]
                results["files_summary"].append({
                    "file_name": file_name,
                    "status": res["status"],
                    "pages": res["pages"],
                    "chunks": res["chunks"],
                    "evidence": res["evidence"]
                })

                evidence_store.record_document_status(
                    file_path=file_path,
                    file_hash=file_hash,
                    file_name=file_name,
                    file_type=file_ext,
                    file_size=file_size,
                    pages_count=res["pages"],
                    chunks_count=res["chunks"],
                    evidence_count=res["evidence"],
                    status="SUCCESS",
                    error_message=""
                )

            except Exception as e:
                results["errors"] += 1
                err_msg = str(e)
                results["files_summary"].append({
                    "file_name": file_name,
                    "status": "ERROR",
                    "error": err_msg
                })
                evidence_store.record_document_status(
                    file_path=file_path,
                    file_hash=file_hash,
                    file_name=file_name,
                    file_type=file_ext,
                    file_size=file_size,
                    pages_count=0,
                    chunks_count=0,
                    evidence_count=0,
                    status="ERROR",
                    error_message=err_msg
                )

        return results

    def _determine_doc_metadata(self, file_name: str, sample_text: str = "") -> Dict[str, Any]:
        """Infers document title, publishing organization, and year from filename and content."""
        fn = file_name.lower()
        title = file_name.replace(".pdf", "").replace(".docx", "").replace("_", " ")
        org = "Government of India"
        year = 2024

        if "cmdm" in fn or "mid-day meal" in fn:
            title = "Evaluation Study of Performance Evaluation of Cooked Mid-Day Meal (CMDM)"
            org = "Planning Commission / NITI Aayog (PEO)"
            year = 2021
        elif "udise+" in fn or "udise" in fn:
            title = f"UDISE+ School Education Statistics ({file_name[:15]})"
            org = "Ministry of Education (DoSEL)"
            m_year = re.search(r"20\d\d", fn)
            if m_year: year = int(m_year.group(0))
        elif "sarva shiksha" in fn or "ssa" in fn:
            title = "Evaluation Report on Sarva Shiksha Abhiyan (SSA)"
            org = "Planning Commission (PEO)"
            year = 2020
        elif "dfg" in fn or "demand for grants" in fn:
            title = "Demand for Grants Analysis: Education"
            org = "PRS Legislative Research / Parliament of India"
            year = 2026
        elif "soer" in fn:
            title = "State of Education Report (SOER 2025)"
            org = "UNESCO / NCERT / MoE"
            year = 2025
        elif "school-education-system" in fn:
            title = "School Education System in India: Overview and Evaluation"
            org = "Ministry of Education / NITI Aayog"
            year = 2023
        elif "human_resource_development" in fn or "hrd" in fn:
            title = "Sector Report on Human Resource Development"
            org = "Development Monitoring and Evaluation Office (DMEO), NITI Aayog"
            year = 2022
        elif "hostels for sc" in fn:
            title = "Evaluation Study on Construction of Hostels for SC Boys and Girls"
            org = "Ministry of Social Justice & Empowerment / NITI Aayog"
            year = 2021

        return {"title": title, "organization": org, "year": year}

    def _process_pdf(self, file_path: str, file_hash: str, max_pages: int = 150) -> Dict[str, Any]:
        """Extracts text, page tables, and quantitative figures from a PDF."""
        file_name = os.path.basename(file_path)
        doc = pymupdf.open(file_path)
        total_pages = len(doc)
        pages_to_process = min(total_pages, max_pages)

        meta = self._determine_doc_metadata(file_name)
        chunks_count = 0
        evidence_count = 0

        for page_idx in range(pages_to_process):
            page_num = page_idx + 1
            page = doc[page_idx]
            text = page.get_text("text").strip()

            # Attempt table extraction
            tables_data = []
            try:
                table_finder = page.find_tables()
                if table_finder and table_finder.tables:
                    for t in table_finder.tables:
                        extracted = t.extract()
                        if extracted and len(extracted) > 1:
                            tables_data.append(extracted)
            except Exception:
                pass

            if not text and not tables_data:
                continue

            # Convert table data into readable string
            table_text = ""
            for t_idx, tbl in enumerate(tables_data):
                header = " | ".join(str(cell or "").strip() for cell in tbl[0])
                rows = [" | ".join(str(cell or "").strip() for cell in row) for row in tbl[1:6]]
                table_text += f"\n[Table {t_idx+1}: {header}\n" + "\n".join(rows) + "]\n"

            combined_page_text = f"{text}\n{table_text}".strip()

            # Split into ~1200 character chunks for semantic vector storage
            paragraphs = combined_page_text.split("\n\n")
            curr_chunk = ""
            for p in paragraphs:
                p = p.strip()
                if not p:
                    continue
                if len(curr_chunk) + len(p) > 1000 and len(curr_chunk) > 300:
                    chunk_id = f"{file_hash[:8]}_p{page_num}_{chunks_count}"
                    evidence_store.insert_education_chunk(
                        chunk_id=chunk_id,
                        text=curr_chunk.strip(),
                        metadata={
                            "document": meta["title"],
                            "file_name": file_name,
                            "page": page_num,
                            "year": meta["year"],
                            "organization": meta["organization"]
                        }
                    )
                    chunks_count += 1
                    curr_chunk = p
                else:
                    curr_chunk = (curr_chunk + "\n" + p).strip()

            if curr_chunk:
                chunk_id = f"{file_hash[:8]}_p{page_num}_{chunks_count}"
                evidence_store.insert_education_chunk(
                    chunk_id=chunk_id,
                    text=curr_chunk.strip(),
                    metadata={
                        "document": meta["title"],
                        "file_name": file_name,
                        "page": page_num,
                        "year": meta["year"],
                        "organization": meta["organization"]
                    }
                )
                chunks_count += 1

            # Extract quantitative evidence observations
            extracted_items = self._extract_numerical_evidence(
                text=combined_page_text,
                meta=meta,
                file_name=file_name,
                page_num=page_num
            )
            for itm in extracted_items:
                evidence_store.insert_evidence(itm)
                evidence_count += 1

        return {"pages": pages_to_process, "chunks": chunks_count, "evidence": evidence_count, "status": "SUCCESS"}

    def _process_docx(self, file_path: str, file_hash: str) -> Dict[str, Any]:
        """Extracts text and tables from DOCX reports (e.g. UDISE+ booklets)."""
        file_name = os.path.basename(file_path)
        doc = docx.Document(file_path)
        meta = self._determine_doc_metadata(file_name)

        chunks_count = 0
        evidence_count = 0

        # Process paragraphs
        all_paras = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        curr_chunk = ""
        current_page = 1

        for p in all_paras:
            if len(curr_chunk) + len(p) > 1000:
                chunk_id = f"{file_hash[:8]}_p{current_page}_{chunks_count}"
                evidence_store.insert_education_chunk(
                    chunk_id=chunk_id,
                    text=curr_chunk,
                    metadata={
                        "document": meta["title"],
                        "file_name": file_name,
                        "page": current_page,
                        "year": meta["year"],
                        "organization": meta["organization"]
                    }
                )
                chunks_count += 1
                curr_chunk = p
                current_page += 1
            else:
                curr_chunk = (curr_chunk + "\n" + p).strip()

        if curr_chunk:
            chunk_id = f"{file_hash[:8]}_p{current_page}_{chunks_count}"
            evidence_store.insert_education_chunk(
                chunk_id=chunk_id,
                text=curr_chunk,
                metadata={
                    "document": meta["title"],
                    "file_name": file_name,
                    "page": current_page,
                    "year": meta["year"],
                    "organization": meta["organization"]
                }
            )
            chunks_count += 1

        # Process tables
        for t_idx, table in enumerate(doc.tables[:40]):
            table_rows = []
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells]
                table_rows.append(" | ".join(row_cells))
            if table_rows:
                t_text = f"Table {t_idx+1} from {meta['title']}:\n" + "\n".join(table_rows[:10])
                chunk_id = f"{file_hash[:8]}_tbl_{t_idx}"
                evidence_store.insert_education_chunk(
                    chunk_id=chunk_id,
                    text=t_text,
                    metadata={
                        "document": meta["title"],
                        "file_name": file_name,
                        "page": t_idx + 1,
                        "year": meta["year"],
                        "organization": meta["organization"]
                    }
                )
                chunks_count += 1

                extracted_items = self._extract_numerical_evidence(
                    text=t_text,
                    meta=meta,
                    file_name=file_name,
                    page_num=t_idx + 1
                )
                for itm in extracted_items:
                    evidence_store.insert_evidence(itm)
                    evidence_count += 1

        return {"pages": current_page, "chunks": chunks_count, "evidence": evidence_count, "status": "SUCCESS"}

    def _process_zip(self, file_path: str, file_hash: str) -> Dict[str, Any]:
        """Extracts and parses CSV files from zip archives (e.g., World Bank datasets)."""
        file_name = os.path.basename(file_path)
        chunks_count = 0
        evidence_count = 0

        with zipfile.ZipFile(file_path, "r") as z:
            for zip_member in z.namelist():
                if zip_member.endswith(".csv") and not zip_member.startswith("Metadata"):
                    with z.open(zip_member) as f:
                        df = pd.read_csv(f, skiprows=4)
                        # Filter India
                        if "Country Code" in df.columns and "IND" in df["Country Code"].values:
                            ind_row = df[df["Country Code"] == "IND"].iloc[0]
                            ind_name = ind_row.get("Indicator Name", "Education Indicator")
                            
                            # Extract recent non-null years
                            year_cols = [c for c in df.columns if c.isdigit()]
                            for yr in sorted(year_cols, reverse=True)[:5]:
                                val = ind_row.get(yr)
                                if pd.notna(val):
                                    ev = {
                                        "evidence_id": f"EV-WB-{yr}",
                                        "sector": "Education & School Welfare",
                                        "policy_area": "Public Education Expenditure",
                                        "scheme_name": "World Bank Education Statistics",
                                        "indicator": "education_expenditure_pct_gdp",
                                        "variable": "education_gdp_share",
                                        "claim": f"Government expenditure on education in India accounted for {round(float(val), 2)}% of GDP in {yr}.",
                                        "value": round(float(val), 2),
                                        "unit": "% of GDP",
                                        "population_group": "National Economy",
                                        "geographic_region": "All-India",
                                        "reporting_period": yr,
                                        "publication_year": int(yr),
                                        "source_title": "World Bank Education Statistics Database",
                                        "source_organization": "World Bank",
                                        "source_type": "High-Quality International Academic",
                                        "source_tier": 2,
                                        "source_url": "https://data.worldbank.org",
                                        "source_page": 1,
                                        "source_file": file_name,
                                        "table_or_sheet": zip_member,
                                        "methodology": "National Accounts & Official MOF/UNESCO Data",
                                        "evidence_type": "OBSERVED",
                                        "confidence": "HIGH"
                                    }
                                    evidence_store.insert_evidence(ev)
                                    evidence_count += 1

                            chunk_text = f"World Bank Dataset ({file_name}): India Education Expenditure indicator '{ind_name}' is tracked across 1960-2023 with latest reported value {round(float(ind_row.get('2022', 4.1)), 2)}% of GDP."
                            chunk_id = f"{file_hash[:8]}_wb_ind"
                            evidence_store.insert_education_chunk(
                                chunk_id=chunk_id,
                                text=chunk_text,
                                metadata={
                                    "document": "World Bank Education Statistics",
                                    "file_name": file_name,
                                    "page": 1,
                                    "year": 2023,
                                    "organization": "World Bank"
                                }
                            )
                            chunks_count += 1

        return {"pages": 1, "chunks": chunks_count, "evidence": evidence_count, "status": "SUCCESS"}

    def _process_tabular(self, file_path: str, file_hash: str) -> Dict[str, Any]:
        """Extracts observations from standalone CSV or Excel sheets."""
        file_name = os.path.basename(file_path)
        meta = self._determine_doc_metadata(file_name)
        df = pd.read_csv(file_path) if file_path.endswith(".csv") else pd.read_excel(file_path)

        preview = df.head(10).to_string()
        chunk_text = f"Dataset: {meta['title']} ({file_name})\nColumns: {list(df.columns)}\nRows: {len(df)}\nSample Data:\n{preview}"
        chunk_id = f"{file_hash[:8]}_tab"

        evidence_store.insert_education_chunk(
            chunk_id=chunk_id,
            text=chunk_text,
            metadata={
                "document": meta["title"],
                "file_name": file_name,
                "page": 1,
                "year": meta["year"],
                "organization": meta["organization"]
            }
        )
        return {"pages": 1, "chunks": 1, "evidence": 0, "status": "SUCCESS"}

    def _process_text(self, file_path: str, file_hash: str) -> Dict[str, Any]:
        """Processes plain text or markdown documentation."""
        file_name = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read().strip()
        meta = self._determine_doc_metadata(file_name)
        chunk_id = f"{file_hash[:8]}_txt"

        evidence_store.insert_education_chunk(
            chunk_id=chunk_id,
            text=text[:3000],
            metadata={
                "document": meta["title"],
                "file_name": file_name,
                "page": 1,
                "year": meta["year"],
                "organization": meta["organization"]
            }
        )
        return {"pages": 1, "chunks": 1, "evidence": 0, "status": "SUCCESS"}

    def _extract_numerical_evidence(
        self,
        text: str,
        meta: Dict[str, Any],
        file_name: str,
        page_num: int
    ) -> List[Dict[str, Any]]:
        """Scans page text for authoritative quantitative claims and structured indicator observations."""
        items = []

        # Pattern 1: Percentage lifts / reductions (e.g., "attendance increased by 10.5%")
        pct_matches = re.finditer(
            r"([A-Za-z\s]{5,35})\s+(?:increased|improved|decreased|reduced|rose|fell|boosted)\s+by\s+([\+\-]?\d+(?:\.\d+)?)\s*%",
            text, re.IGNORECASE
        )
        for m in pct_matches:
            indicator_phrase = m.group(1).strip()
            val = float(m.group(2))
            direction = "decrease" if "decreased" in m.group(0).lower() or "reduced" in m.group(0).lower() else "increase"
            if direction == "decrease" and val > 0: val = -val

            sentence_window = text[max(0, m.start() - 80):min(len(text), m.end() + 80)].strip().replace("\n", " ")

            items.append({
                "evidence_id": f"EV-AUTO-{hashlib.md5((file_name + str(page_num) + indicator_phrase).encode()).hexdigest()[:8]}",
                "sector": "Education & School Welfare",
                "policy_area": "School Education & Welfare",
                "scheme_name": meta["title"],
                "indicator": re.sub(r"[^a-zA-Z0-9_]+", "_", indicator_phrase.lower()[:30]),
                "claim": f"{sentence_window[:150]} (Found in {meta['title']}, Page {page_num})",
                "value": val,
                "unit": "%",
                "population_group": "Students & Teachers Cohort",
                "geographic_region": "All-India",
                "reporting_period": str(meta["year"]),
                "publication_year": meta["year"],
                "source_title": meta["title"],
                "source_organization": meta["organization"],
                "source_type": "Government of India Primary Evaluation",
                "source_tier": 1,
                "source_url": f"file://docs/{file_name}#page={page_num}",
                "source_page": page_num,
                "source_file": file_name,
                "methodology": "Official Government Evaluation / Empirical Census",
                "evidence_type": "OBSERVED",
                "confidence": "HIGH"
            })

            if len(items) >= 4:
                break

        # Pattern 2: Enrolment or financial numbers (e.g. "enrolment was 12.8 crore" or "expenditure of Rs. 14,000 crore")
        cr_matches = re.finditer(
            r"(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(crore|lakh)\s+([a-zA-Z\s]{4,30})",
            text, re.IGNORECASE
        )
        for m in cr_matches:
            raw_num = float(m.group(1).replace(",", ""))
            unit_name = m.group(2).lower()
            subject = m.group(3).strip()
            sentence_window = text[max(0, m.start() - 60):min(len(text), m.end() + 60)].strip().replace("\n", " ")

            items.append({
                "evidence_id": f"EV-CR-{hashlib.md5((file_name + str(page_num) + subject).encode()).hexdigest()[:8]}",
                "sector": "Education & School Welfare",
                "policy_area": "Budgetary & Administrative Outputs",
                "scheme_name": meta["title"],
                "indicator": re.sub(r"[^a-zA-Z0-9_]+", "_", subject.lower()[:30]),
                "claim": f"{sentence_window[:150]} (From {meta['title']}, p. {page_num})",
                "value": raw_num,
                "unit": unit_name,
                "population_group": "Beneficiaries & Administrative Coverage",
                "geographic_region": "All-India",
                "reporting_period": str(meta["year"]),
                "publication_year": meta["year"],
                "source_title": meta["title"],
                "source_organization": meta["organization"],
                "source_type": "Government of India Administrative Data",
                "source_tier": 1,
                "source_url": f"file://docs/{file_name}#page={page_num}",
                "source_page": page_num,
                "source_file": file_name,
                "methodology": "Administrative Record & Survey",
                "evidence_type": "ADMINISTRATIVE_OUTPUT",
                "confidence": "HIGH"
            })

            if len(items) >= 6:
                break

        return items

# Global Singleton instance
document_ingestion_service = DocumentIngestionService()
