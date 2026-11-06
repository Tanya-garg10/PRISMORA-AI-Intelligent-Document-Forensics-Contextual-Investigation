# PRISMORA AI — System Architecture
**AI-Powered Document Forensics & Contextual Intelligence System**
*DataOps Innovation Hackathon 2026 | Challenge: Problem Statement 2 | Team: BrandCanvas*

---

## 1. Architectural Philosophy
Traditional OCR systems treat documents in isolation: they ingest pixels and output text. **PRISMORA AI** approaches multi-document verification through contextual forensics:
1. **Multi-Document Topology**: Investigates information networks, identifying contradictions across disparate records (e.g., Application vs. Bank Statement vs. Tax Record).
2. **Tri-Tier Evidence Grading**: Rigorously categorizes every finding as:
   - **Observation**: Visual, structural, or statistical anomaly (e.g., ELA variance, compression inconsistency).
   - **Potential Anomaly**: Field mismatch or logical discrepancy with plausible benign explanations.
   - **Confirmed Fact**: Verified ground truth validated against immutable references or multi-witness corroboration.
3. **Bounded Agentic Loop**: An autonomous, self-limiting investigation agent executing `OBSERVE → PLAN → INVESTIGATE → CORRELATE → EXPLAIN → REVIEW`.

---

## 2. Six Core Intelligence Engines

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           PRISMORA AI CORE                             │
  ├───────────────────┬───────────────────┬────────────────────────────────┤
  │ 1. DocMind        │ 2. PixelTrace     │ 3. ContextIQ                   │
  │ Ingestion & OCR   │ Visual Forensics  │ Cross-Doc Normalization        │
  │ • PyMuPDF / PIL   │ • Error Level Ana │ • Temporal & Currency Norm     │
  │ • Layout parsing  │ • Noise/Resampling│ • Gross vs. Net Intelligence   │
  │ • SHA-256 Hashing │ • Font & Metadata │ • Deterministic + LLM Reasoner │
  ├───────────────────┼───────────────────┼────────────────────────────────┤
  │ 4. CrossDoc Graph │ 5. EvidenceVault  │ 6. DossierGen                  │
  │ Relationship Net  │ Audit & Integrity │ Forensic Dossier Production    │
  │ • React Flow Net  │ • Immutable Store │ • ReportLab PDF Dossiers       │
  │ • Entity Linking  │ • Bounding Box Ref│ • Complete Audit Provenance    │
  │ • Contradictions  │ • Chain of Custody│ • Visual Evidence Insets       │
  └───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 3. Data Flow Pipeline
1. **Ingestion (`DocMind`)**: Files are hashed (SHA-256), stored in immutable storage, rendered to 300-DPI frames, and parsed into structured OCR blocks with bounding boxes and confidence scores.
2. **Forensic Scanning (`PixelTrace`)**: Images undergo ELA (Error Level Analysis), JPEG compression artifact inspection, noise consistency mapping, and metadata provenance verification.
3. **Cross-Doc Correlation (`ContextIQ`)**: Deterministic normalization aligns dates, currency denominations (monthly vs. annual), tax deductions, and address tokenization.
4. **Agentic Reasoning (`Agentic Loop`)**: A bounded agent queries missing data, invokes deep regional inspection, and queries Gemini for nuance resolution.
5. **Graph & Dossier (`CrossDoc` & `DossierGen`)**: Real-time interactive node visualization and court-ready forensic PDF dossiers.
