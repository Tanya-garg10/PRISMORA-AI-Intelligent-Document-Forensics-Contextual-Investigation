import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import init_db

@pytest.fixture(scope="module")
def client():
    init_db()
    with TestClient(app) as c:
        yield c

class TestPrismoraBackendAPI:
    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"]["status"] == "connected"

    def test_create_and_seed_investigation_case_001(self, client):
        payload = {
            "title": "Case 001 — Financial Verification Test",
            "description": "Automated verification test for financial discrepancy.",
            "seed_case": "CASE_001"
        }
        res = client.post("/api/investigations", json=payload)
        assert res.status_code == 200
        data = res.json()
        inv_id = data["id"]
        assert data["title"] == payload["title"]

        doc_res = client.get(f"/api/investigations/{inv_id}/documents")
        assert doc_res.status_code == 200
        docs = doc_res.json()
        assert len(docs) >= 3

        for d in docs:
            assert len(d["sha256"]) == 64

        analyze_res = client.post(f"/api/investigations/{inv_id}/analyze")
        assert analyze_res.status_code == 200
        analysis_data = analyze_res.json()
        assert analysis_data["status"] in ["ANALYZED", "REVIEW_REQUIRED"]
        assert analysis_data["agent_summary"] is not None

        findings_res = client.get(f"/api/investigations/{inv_id}/findings")
        assert findings_res.status_code == 200
        findings = findings_res.json()
        assert len(findings) >= 1

        fin_finding = next((f for f in findings if f["category"] == "FINANCIAL_DISCREPANCY"), None)
        assert fin_finding is not None
        assert fin_finding["severity"] == "CRITICAL"
        assert len(fin_finding["evidence_items"]) >= 2

        graph_res = client.get(f"/api/investigations/{inv_id}/graph")
        assert graph_res.status_code == 200
        graph_data = graph_res.json()
        assert len(graph_data["nodes"]) > 0
        assert len(graph_data["edges"]) > 0

        review_payload = {
            "decision": "VERIFIED_ANOMALY",
            "notes": "Verified against payroll statements."
        }
        review_res = client.post(f"/api/findings/{fin_finding['id']}/review", json=review_payload)
        assert review_res.status_code == 200
        assert review_res.json()["review_status"] == "VERIFIED_ANOMALY"

        report_res = client.get(f"/api/investigations/{inv_id}/report")
        assert report_res.status_code == 200
        assert report_res.headers["content-type"] == "application/pdf"
        assert len(report_res.content) > 1000

    def test_case_002_address_contradiction_pipeline(self, client):
        payload = {
            "title": "Case 002 — Address Domicile Audit",
            "description": "Automated verification test for residential contradiction.",
            "seed_case": "CASE_002"
        }
        res = client.post("/api/investigations", json=payload)
        assert res.status_code == 200
        inv_id = res.json()["id"]

        analyze_res = client.post(f"/api/investigations/{inv_id}/analyze")
        assert analyze_res.status_code == 200

        findings_res = client.get(f"/api/investigations/{inv_id}/findings")
        findings = findings_res.json()
        addr_finding = next((f for f in findings if f["category"] == "ADDRESS_CONTRADICTION"), None)
        assert addr_finding is not None
        assert "Springfield" in addr_finding["explanation"] or "Eugene" in addr_finding["explanation"]
