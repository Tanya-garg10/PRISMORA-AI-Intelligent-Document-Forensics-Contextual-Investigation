# PRISMORA AI
### *See Beyond the Surface. Discover the Evidence.*

**AI-Powered Document Forensics & Contextual Intelligence System**  
**Hackathon:** DataOps Innovation Hackathon 2026  
**Organizer:** HackTheCore | **Team:** BrandCanvas  
**Challenge:** Problem Statement 2 | **Development Environment:** Antigravity  

---

## 1. Executive Overview
Traditional document intelligence systems read documents in isolation — extracting key-value pairs without contextual cross-verification. **PRISMORA AI** is an investigative intelligence platform that analyzes networks of documents simultaneously:
- Distinguishes strictly between an **Observation**, a **Potential Anomaly**, and a **Confirmed Fact**.
- Normalizes frequencies, currencies, statutory withholdings (gross vs. net), and timestamps across disparate evidence.
- Performs localized visual forensics (Error Level Analysis, compression variance, metadata anomalies).
- Operates a bounded AI investigation agent (`OBSERVE → PLAN → INVESTIGATE → CORRELATE → EXPLAIN → REVIEW`).
- Generates court-ready PDF investigative dossiers with full cryptographic provenance (SHA-256).

---

## 2. Six Core Intelligence Engines
1. **DocMind (Ingestion & OCR)**: Multi-format parsing (PDF, PNG, JPG), SHA-256 immutability hashing, high-resolution rendering, and bounding-box structured OCR.
2. **PixelTrace (Visual Forensics)**: Error Level Analysis (ELA), JPEG re-compression delta mapping, image splicing detection, and regional crop extraction.
3. **ContextIQ (Contextual Normalization & Reasoning)**: Deterministic rule-based reconcilers combined with Google Gemini 2.5 Flash for nuanced discrepancy explanations.
4. **CrossDoc Graph (Relationship Intelligence)**: Interactive entity-document-finding relationship network built on React Flow.
5. **EvidenceVault (Audit & Integrity)**: Tamper-evident storage, audit trails, human-in-the-loop decisions, and review state tracking.
6. **DossierGen (Forensic Reporting)**: ReportLab PDF report generation with visual evidence insets and complete chain of custody.

---

## 3. Project Structure
```
PRISMORA-AI/
  backend/
    app/
      api/                 # REST API endpoints
      core/                # System configuration & logging
      database/            # SQLAlchemy database connection & session
      models/              # Database models (Investigations, Documents, Findings)
      schemas/             # Pydantic request/response schemas
      services/
        ingestion/         # DocMind PDF & file handling
        ocr/               # OCR text & layout extraction
        classification/    # Document type detection
        visual_forensics/  # PixelTrace ELA & splicing analysis
        contextiq/         # ContextIQ normalization & comparison
        crossdoc/          # Graph relationship builder
        agent/             # Bounded autonomous investigator
        evidence/          # EvidenceVault storage & hashes
        reporting/         # DossierGen PDF generation
    tests/
      test_dataset.py      # Synthetic dataset integrity test suite
    requirements.txt       # Python backend dependencies
  dataset/
    case_001/              # Financial Discrepancy Case (4 docs + 4 PNGs)
    case_002/              # Address Inconsistency Case (4 docs + 4 PNGs)
    case_003/              # Visual Document Tampering Case (4 docs + 4 PNGs)
    ground_truth.json      # Ground truth specifications & coordinates
    dataset_summary.json   # Dataset metrics and summary
    README.md              # Dataset documentation
  docs/
    architecture.md        # System architecture specifications
    methodology.md         # Forensic & mathematical methodology
    limitations.md         # Known limitations and guardrails
    integration_matrix.md  # Engine & technology mapping
  scripts/
    generate_synthetic_dataset.py  # Synthetic dataset generator
  src/                     # React + Vite + Tailwind frontend application
  storage/
    originals/             # Immutable uploaded source files
    rendered/              # High-res rendered page previews
    evidence/              # Extracted visual evidence crops
  metadata.json
  package.json
  README.md
```

---

## 4. Benchmark Dataset Summary
- **Case 001 (Financial Inconsistency)**: Loan application declaring $12,500/mo salary contradicted by employer pay stub ($9,200/mo gross), verified bank deposit ($6,840/mo net), and Form W-2.
- **Case 002 (Address Contradiction)**: Commercial application & utility bill claiming Springfield address contradicted by active primary residential lease & HR records in Eugene, OR.
- **Case 003 (Visual Document Tampering)**: Authentic invoice ($14,500) vs. digitally spliced invoice ($41,500) with altered coordinates `[1120, 615, 1540, 665]` and corroborated by Purchase Order PO-4401.

---

## 5. Verification Commands
```bash
# Verify Python test suite:
python3 -m pytest backend/tests/test_dataset.py -v

# Re-run synthetic dataset generator:
python3 scripts/generate_synthetic_dataset.py
```
