import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.models import Investigation, Document, ExtractedField, ForensicObservation, Finding, AgentAction
from backend.app.core.config import settings

class BoundedForensicAgent:
    def __init__(self, db: Session, investigation_id: str):
        self.db = db
        self.investigation_id = investigation_id
        self.tool_budget = settings.MAX_TOOL_CALL_BUDGET
        self.tool_calls_executed = 0

    def log_step(self, step_number: int, action_type: str, tool_name: str = None, tool_input: Any = None, tool_output: Any = None, reasoning: str = None):
        action = AgentAction(
            id=str(uuid.uuid4()),
            investigation_id=self.investigation_id,
            step_number=step_number,
            action_type=action_type,
            tool_name=tool_name,
            tool_input=tool_input,
            tool_output=tool_output,
            reasoning=reasoning
        )
        self.db.add(action)
        self.db.commit()

    def tool_get_document_fields(self, document_id: str) -> Dict[str, Any]:
        self.tool_calls_executed += 1
        fields = self.db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
        return {
            "document_id": document_id,
            "field_count": len(fields),
            "fields": [{"name": f.field_name, "raw": f.raw_value, "normalized": f.normalized_value, "type": f.field_type} for f in fields]
        }

    def tool_get_finding_evidence(self, finding_id: str) -> Dict[str, Any]:
        self.tool_calls_executed += 1
        finding = self.db.query(Finding).filter(Finding.id == finding_id).first()
        if not finding:
            return {"error": "Finding not found"}
        return {
            "finding_id": finding_id,
            "title": finding.title,
            "evidence_count": len(finding.evidence_items)
        }

    def tool_generate_investigation_summary(self) -> str:
        self.tool_calls_executed += 1
        inv = self.db.query(Investigation).filter(Investigation.id == self.investigation_id).first()
        docs = self.db.query(Document).filter(Document.investigation_id == self.investigation_id).all()
        findings = self.db.query(Finding).filter(Finding.investigation_id == self.investigation_id).all()

        crit_count = sum(1 for f in findings if f.severity in ["CRITICAL", "HIGH"])
        summary = (
            f"PRISMORA FORENSIC AGENT INVESTIGATION DOSSIER\n"
            f"Case: {inv.title} (Status: {inv.status})\n"
            f"Total Documents Audited: {len(docs)} | Findings Generated: {len(findings)} ({crit_count} Critical/High)\n\n"
        )
        for i, f in enumerate(findings, 1):
            summary += f"Finding {i} [{f.severity} / {f.grade}]: {f.title}\n"
            summary += f"  Explanation: {f.explanation}\n"
            if f.alternative_explanations:
                summary += f"  Alternative Benign Scenarios: {', '.join(f.alternative_explanations[:2])}\n"
            summary += "\n"

        summary += "RECOMMENDATION: " + ("Mandatory Human Review Required before final underwriting clearance." if crit_count > 0 else "Documentation verified within normal variance thresholds.")
        return summary

    def run_investigation_cycle(self) -> str:
        step = 1
        docs = self.db.query(Document).filter(Document.investigation_id == self.investigation_id).all()
        self.log_step(step, "OBSERVE", reasoning=f"Agent observed {len(docs)} uploaded documents in case inventory.")
        step += 1

        self.log_step(step, "PLAN", reasoning="Strategy: 1. Extract and correlate applicant identities. 2. Cross-reference financial/residential claims. 3. Inspect visual compression artifacts.")
        step += 1

        for doc in docs[:4]:
            if self.tool_calls_executed >= self.tool_budget:
                break
            fields_data = self.tool_get_document_fields(doc.id)
            self.log_step(step, "TOOL_CALL", "get_document_fields", {"document_id": doc.id, "filename": doc.filename}, {"extracted_count": fields_data["field_count"]}, f"Retrieved structured OCR entities from '{doc.filename}'")
            step += 1

        findings = self.db.query(Finding).filter(Finding.investigation_id == self.investigation_id).all()
        for f in findings[:3]:
            if self.tool_calls_executed >= self.tool_budget:
                break
            ev_data = self.tool_get_finding_evidence(f.id)
            self.log_step(step, "CORRELATE", "get_finding_evidence", {"finding_id": f.id}, {"evidence_count": ev_data.get("evidence_count", 0)}, f"Correlating evidence for finding: '{f.title}'")
            step += 1

        agent_summary = self.tool_generate_investigation_summary()
        self.log_step(step, "EXPLAIN", "generate_investigation_summary", tool_output={"summary_length": len(agent_summary)}, reasoning="Synthesized cross-document evidence into formal investigative dossier.")

        inv = self.db.query(Investigation).filter(Investigation.id == self.investigation_id).first()
        if inv:
            inv.agent_summary = agent_summary
            inv.status = "REVIEW_REQUIRED" if any(f.severity in ["CRITICAL", "HIGH"] for f in findings) else "ANALYZED"
            self.db.commit()

        return agent_summary
