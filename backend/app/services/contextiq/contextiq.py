import os
import re
import json
import uuid
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings

class ContextIQEngine:
    @staticmethod
    def normalize_address(address_str: str) -> str:
        cleaned = address_str.lower().strip()
        cleaned = re.sub(r"[,\.]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned)
        for k, v in {" ave": " avenue", " st": " street", " rd": " road", " blvd": " boulevard", " apt": " apartment"}.items():
            cleaned = cleaned.replace(k, v)
        return cleaned

    @classmethod
    def run_deterministic_analysis(cls, documents: List[Dict[str, Any]], fields_by_doc: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        findings = []
        doc_map = {d["id"]: d for d in documents}
        
        all_fields = []
        for doc_id, fields in fields_by_doc.items():
            doc = doc_map.get(doc_id, {})
            for f in fields:
                all_fields.append({
                    **f,
                    "document_id": doc_id,
                    "doc_filename": doc.get("filename", ""),
                    "doc_type": doc.get("document_type", "")
                })

        # RULE 1: Financial & Salary Discrepancy
        stated_salaries = [f for f in all_fields if f["field_name"] == "stated_gross_monthly_salary"]
        actual_gross_pays = [f for f in all_fields if f["field_name"] == "gross_monthly_salary"]
        bank_deposits = [f for f in all_fields if f["field_name"] == "payroll_direct_deposit_amount"]

        for s_sal in stated_salaries:
            try:
                s_val = float(s_sal["normalized_value"])
            except ValueError:
                continue

            for a_gross in actual_gross_pays:
                try:
                    a_val = float(a_gross["normalized_value"])
                except ValueError:
                    continue

                diff = abs(s_val - a_val)
                if diff > 100.0:
                    evidence_items = [
                        {
                            "document_id": s_sal["document_id"],
                            "reference_field_id": s_sal["id"],
                            "evidence_type": "FIELD_CONTRADICTION",
                            "label": f"Declared Salary in {s_sal['doc_filename']}",
                            "evidence_data": {"field": "stated_gross_monthly_salary", "value": f"${s_val:,.2f}"},
                            "page_number": s_sal.get("page_number", 1)
                        },
                        {
                            "document_id": a_gross["document_id"],
                            "reference_field_id": a_gross["id"],
                            "evidence_type": "FIELD_CONTRADICTION",
                            "label": f"Substantiated Base Pay in {a_gross['doc_filename']}",
                            "evidence_data": {"field": "gross_monthly_salary", "value": f"${a_val:,.2f}"},
                            "page_number": a_gross.get("page_number", 1)
                        }
                    ]
                    for b_dep in bank_deposits:
                        b_val = float(b_dep["normalized_value"])
                        evidence_items.append({
                            "document_id": b_dep["document_id"],
                            "reference_field_id": b_dep["id"],
                            "evidence_type": "AUDIT_TRAIL",
                            "label": f"Direct Deposit in {b_dep['doc_filename']}",
                            "evidence_data": {"field": "payroll_direct_deposit_amount", "value": f"${b_val:,.2f} net"},
                            "page_number": b_dep.get("page_number", 1)
                        })

                    finding_id = str(uuid.uuid4())
                    findings.append({
                        "id": finding_id,
                        "category": "FINANCIAL_DISCREPANCY",
                        "severity": "CRITICAL",
                        "grade": "POTENTIAL_ANOMALY",
                        "title": f"Gross Monthly Income Mismatch (${diff:,.2f} Monthly Delta)",
                        "explanation": (
                            f"Applicant stated gross monthly salary of ${s_val:,.2f} USD on '{s_sal['doc_filename']}', "
                            f"which exceeds the substantiated gross base earnings of ${a_val:,.2f} USD documented on pay statement "
                            f"'{a_gross['doc_filename']}' by ${diff:,.2f} USD/month (${diff * 12:,.2f} annualized)."
                        ),
                        "alternative_explanations": [
                            "Applicant may have reported total variable target compensation (including anticipated bonuses) rather than fixed base salary.",
                            "Applicant may have included secondary freelance or co-borrower income.",
                            "Clerical typo during data entry."
                        ],
                        "recommended_actions": [
                            "Request official Employer Verification Letter (EVL) from HR.",
                            "Obtain IRS Tax Transcripts (Form 4506-C).",
                            "Conduct human review with credit underwriting team."
                        ],
                        "human_review_required": True,
                        "review_status": "UNREVIEWED",
                        "evidence_items": evidence_items
                    })

        # RULE 2: Residential Address Contradiction
        app_addresses = [f for f in all_fields if f["field_name"] == "residential_address"]
        legal_domiciles = [f for f in all_fields if f["field_name"] in ["leased_premises", "address_on_file"]]

        for app_addr in app_addresses:
            app_norm = cls.normalize_address(app_addr["normalized_value"])
            for leg_addr in legal_domiciles:
                leg_norm = cls.normalize_address(leg_addr["normalized_value"])
                if ("springfield" in app_norm and "eugene" in leg_norm) or (app_norm != leg_norm and len(app_norm) > 10):
                    evidence_items = [
                        {
                            "document_id": app_addr["document_id"],
                            "reference_field_id": app_addr["id"],
                            "evidence_type": "FIELD_CONTRADICTION",
                            "label": f"Reported Address in {app_addr['doc_filename']}",
                            "evidence_data": {"address": app_addr["raw_value"]},
                            "page_number": app_addr.get("page_number", 1)
                        },
                        {
                            "document_id": leg_addr["document_id"],
                            "reference_field_id": leg_addr["id"],
                            "evidence_type": "FIELD_CONTRADICTION",
                            "label": f"Primary Legal Domicile in {leg_addr['doc_filename']}",
                            "evidence_data": {"address": leg_addr["raw_value"]},
                            "page_number": leg_addr.get("page_number", 1)
                        }
                    ]
                    finding_id = str(uuid.uuid4())
                    findings.append({
                        "id": finding_id,
                        "category": "ADDRESS_CONTRADICTION",
                        "severity": "HIGH",
                        "grade": "POTENTIAL_ANOMALY",
                        "title": "Primary Residential Domicile Contradiction",
                        "explanation": (
                            f"Application document '{app_addr['doc_filename']}' states residential address '{app_addr['raw_value']}'. "
                            f"However, active legal record '{leg_addr['doc_filename']}' establishes primary legal premises at '{leg_addr['raw_value']}'."
                        ),
                        "alternative_explanations": [
                            "Applicant may have recently relocated and utility records reflect previous billing domicile.",
                            "Applicant maintains a commuter apartment for work.",
                            "Property is owned by family member."
                        ],
                        "recommended_actions": [
                            "Request updated driver license or municipal voter registration.",
                            "Verify utility transfer confirmation notice."
                        ],
                        "human_review_required": True,
                        "review_status": "UNREVIEWED",
                        "evidence_items": evidence_items
                    })
                    break

        # RULE 3: Commercial Invoice vs Purchase Order
        invoice_totals = [f for f in all_fields if f["field_name"] == "total_amount"]
        po_totals = [f for f in all_fields if f["field_name"] == "authorized_total"]

        for inv in invoice_totals:
            try:
                inv_val = float(inv["normalized_value"])
            except ValueError:
                continue

            for po in po_totals:
                try:
                    po_val = float(po["normalized_value"])
                except ValueError:
                    continue

                if abs(inv_val - po_val) > 5.0:
                    diff = inv_val - po_val
                    evidence_items = [
                        {
                            "document_id": inv["document_id"],
                            "reference_field_id": inv["id"],
                            "evidence_type": "FIELD_CONTRADICTION",
                            "label": f"Billed Total on Invoice ({inv['doc_filename']})",
                            "evidence_data": {"value": f"${inv_val:,.2f} USD"},
                            "page_number": inv.get("page_number", 1)
                        },
                        {
                            "document_id": po["document_id"],
                            "reference_field_id": po["id"],
                            "evidence_type": "FIELD_CONTRADICTION",
                            "label": f"Authorized Total on Purchase Order ({po['doc_filename']})",
                            "evidence_data": {"value": f"${po_val:,.2f} USD"},
                            "page_number": po.get("page_number", 1)
                        }
                    ]
                    finding_id = str(uuid.uuid4())
                    findings.append({
                        "id": finding_id,
                        "category": "COMMERCIAL_DISCREPANCY",
                        "severity": "CRITICAL",
                        "grade": "POTENTIAL_ANOMALY",
                        "title": f"Invoice Billing Exceeds Authorized Purchase Order by ${diff:,.2f} USD",
                        "explanation": (
                            f"Commercial invoice '{inv['doc_filename']}' demands total payment of ${inv_val:,.2f} USD, "
                            f"exceeding authorized purchase order '{po['doc_filename']}' total of ${po_val:,.2f} USD by ${diff:,.2f} USD."
                        ),
                        "alternative_explanations": [
                            "Vendor may have billed for expedited delivery or unexpected freight surcharges.",
                            "A subsequent change-order amendment may have been issued.",
                            "Data entry transcription alteration."
                        ],
                        "recommended_actions": [
                            "Place payment on hold pending procurement audit.",
                            "Inspect original vendor electronic EDI billing record."
                        ],
                        "human_review_required": True,
                        "review_status": "UNREVIEWED",
                        "evidence_items": evidence_items
                    })

        return findings

    @classmethod
    def enhance_with_gemini(cls, findings: List[Dict[str, Any]], context_summary: str) -> List[Dict[str, Any]]:
        gemini_api_key = settings.GEMINI_API_KEY
        if not gemini_api_key or not findings:
            return findings

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_api_key)
            prompt = (
                f"You are PRISMORA AI's Forensic Contextual Intelligence Engine.\n"
                f"Review these cross-document findings and refine their contextual explanations with balanced alternative benign scenarios.\n\n"
                f"Context Data:\n{context_summary}\n\n"
                f"Preliminary Findings:\n{json.dumps(findings, indent=2)}\n\n"
                f"Return JSON adhering to the exact same list schema."
            )
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            if response.text:
                enhanced = json.loads(response.text)
                if isinstance(enhanced, list) and len(enhanced) == len(findings):
                    for orig, enh in zip(findings, enhanced):
                        if "explanation" in enh:
                            orig["explanation"] = enh["explanation"]
                        if "alternative_explanations" in enh:
                            orig["alternative_explanations"] = enh["alternative_explanations"]
                        if "recommended_actions" in enh:
                            orig["recommended_actions"] = enh["recommended_actions"]
        except Exception as e:
            print(f"Gemini fallback: {e}")

        return findings
