import json
import hashlib
from pathlib import Path
import pytest

DATASET_DIR = Path(__file__).resolve().parents[2] / "dataset"

@pytest.fixture
def ground_truth():
    gt_path = DATASET_DIR / "ground_truth.json"
    assert gt_path.exists(), "ground_truth.json must exist"
    with open(gt_path, "r") as f:
        return json.load(f)

@pytest.fixture
def dataset_summary():
    summary_path = DATASET_DIR / "dataset_summary.json"
    assert summary_path.exists(), "dataset_summary.json must exist"
    with open(summary_path, "r") as f:
        return json.load(f)

def calculate_sha256(filepath):
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            sha.update(chunk)
    return sha.hexdigest()


class TestSyntheticDatasetIntegrity:
    """Rigorous verification of the PRISMORA AI synthetic dataset."""

    def test_dataset_summary_structure(self, dataset_summary):
        assert dataset_summary["total_cases"] == 3
        assert len(dataset_summary["cases"]) == 3
        assert dataset_summary["integrity_checksum_verified"] is True

    def test_case_directories_exist(self):
        for case in ["case_001", "case_002", "case_003"]:
            c_dir = DATASET_DIR / case
            assert c_dir.exists() and c_dir.is_dir(), f"Case directory {case} missing"

    def test_all_12_documents_and_rendered_images_exist(self, ground_truth):
        total_docs = 0
        for case_id, case_data in ground_truth["cases"].items():
            case_folder = case_id.lower()
            for doc in case_data["documents"]:
                total_docs += 1
                pdf_path = DATASET_DIR / case_folder / doc["filename"]
                png_path = DATASET_DIR / case_folder / doc["filename"].replace(".pdf", ".png")
                
                assert pdf_path.exists(), f"PDF missing: {pdf_path}"
                assert png_path.exists(), f"Rendered PNG missing: {png_path}"
                assert pdf_path.stat().st_size > 500, f"PDF too small/empty: {pdf_path}"
                assert png_path.stat().st_size > 1000, f"PNG too small/empty: {png_path}"
                
                # Verify SHA-256 integrity match
                actual_hash = calculate_sha256(pdf_path)
                assert actual_hash == doc["sha256"], f"SHA256 mismatch for {doc['filename']}"
                
        assert total_docs == 12, "Should have exactly 12 benchmark documents across 3 cases"

    def test_case_001_financial_discrepancy(self, ground_truth):
        case = ground_truth["cases"]["CASE_001"]
        app_doc = next(d for d in case["documents"] if d["document_id"] == "C1_DOC_01")
        pay_doc = next(d for d in case["documents"] if d["document_id"] == "C1_DOC_02")
        bank_doc = next(d for d in case["documents"] if d["document_id"] == "C1_DOC_03")

        stated_salary = app_doc["key_fields"]["stated_gross_monthly_salary"]
        actual_gross = pay_doc["key_fields"]["gross_monthly_salary"]
        actual_net = pay_doc["key_fields"]["net_monthly_pay"]
        bank_deposit = bank_doc["key_fields"]["payroll_direct_deposit_amount"]

        # Confirm controlled discrepancy
        assert stated_salary == 12500.00
        assert actual_gross == 9200.00
        assert stated_salary - actual_gross == 3300.00
        # Bank deposit strictly matches pay stub net pay
        assert bank_deposit == actual_net == 6840.00

    def test_case_002_address_contradiction(self, ground_truth):
        case = ground_truth["cases"]["CASE_002"]
        app_doc = next(d for d in case["documents"] if d["document_id"] == "C2_DOC_01")
        lease_doc = next(d for d in case["documents"] if d["document_id"] == "C2_DOC_03")
        hr_doc = next(d for d in case["documents"] if d["document_id"] == "C2_DOC_04")

        app_addr = app_doc["key_fields"]["residential_address"]
        lease_addr = lease_doc["key_fields"]["leased_premises"]
        hr_addr = hr_doc["key_fields"]["address_on_file"]

        assert "Springfield" in app_addr
        assert "Eugene" in lease_addr
        assert "Eugene" in hr_addr
        assert lease_addr == hr_addr
        assert app_addr != lease_addr

    def test_case_003_visual_tampering_spec(self, ground_truth):
        case = ground_truth["cases"]["CASE_003"]
        orig_doc = next(d for d in case["documents"] if d["document_id"] == "C3_DOC_01")
        alt_doc = next(d for d in case["documents"] if d["document_id"] == "C3_DOC_02")
        po_doc = next(d for d in case["documents"] if d["document_id"] == "C3_DOC_03")

        assert orig_doc["key_fields"]["total_amount"] == 14500.00
        assert alt_doc["key_fields"]["total_amount"] == 41500.00
        assert po_doc["key_fields"]["authorized_total"] == 14500.00
        assert alt_doc.get("is_altered") is True

        coords = alt_doc["altered_coordinates_200dpi"]
        assert coords["x1"] < coords["x2"]
        assert coords["y1"] < coords["y2"]
        assert coords["original_text"] == "$14,500.00 USD"
        assert coords["altered_text"] == "$41,500.00 USD"
