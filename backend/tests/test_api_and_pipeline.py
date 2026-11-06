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

        all_docs_res = client.get("/api/documents")
        assert all_docs_res.status_code == 200
        case_docs = [doc for doc in all_docs_res.json() if doc["investigation_id"] == inv_id]
        assert len(case_docs) == len(docs)
        assert all(doc["investigation_title"] == payload["title"] for doc in case_docs)

        analyze_res = client.post(f"/api/investigations/{inv_id}/analyze")
        assert analyze_res.status_code == 200
        analysis_data = analyze_res.json()
        assert analysis_data["status"] in ["ANALYZED", "REVIEW_REQUIRED"]
        assert analysis_data["agent_summary"] is not None
        processed_doc = analysis_data["documents"][0]
        assert processed_doc["pages"]
        assert processed_doc["pages"][0]["rendered_image_url"].startswith("/storage/rendered/")
        assert processed_doc["pages"][0]["raw_text"]
        assert processed_doc["extracted_fields"]
        assert processed_doc["observations"]

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

        list_res = client.get("/api/investigations")
        listed_case = next(item for item in list_res.json() if item["id"] == inv_id)
        assert listed_case["pending_review_count"] == 0

    def test_unknown_seed_case_is_rejected(self, client):
        response = client.post(
            "/api/investigations",
            json={"title": "Invalid sample case", "seed_case": "CASE_DOES_NOT_EXIST"}
        )
        assert response.status_code == 404

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
