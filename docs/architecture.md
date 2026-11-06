# PRISMORA AI — System Architecture
**AI-Powered Document Forensics & Contextual Intelligence System**

## 1. Architectural Philosophy
Traditional OCR systems treat documents in isolation: they ingest pixels and output text. **PRISMORA AI** approaches multi-document verification through contextual forensics:
1. **Multi-Document Topology**: Investigates information networks, identifying contradictions across disparate records (e.g., Application vs. Bank Statement vs. Tax Record).
2. **Evidence Review**: Separates automated observations and potential anomalies from analyst decisions:
   - **Observation**: Visual, structural, or statistical anomaly (e.g., ELA variance, compression inconsistency).
   - **Potential Anomaly**: Field mismatch or logical discrepancy with plausible benign explanations.
   - **Human Review**: A reviewer records a decision; the application does not independently confirm fraud.
3. **Bounded Agentic Loop**: An autonomous, self-limiting investigation agent executing `OBSERVE → PLAN → INVESTIGATE → CORRELATE → EXPLAIN → REVIEW`.

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
  │ Relationship Net  │ Audit & Integrity │ PDF Report Generation          │
  │ • React Flow Net  │ • File Hashes     │ • ReportLab PDFs               │
  │ • Entity Linking  │ • Bounding Box Ref│ • Complete Audit Provenance    │
  │ • Contradictions  │ • Chain of Custody│ • Visual Evidence Insets       │
  └───────────────────┴───────────────────┴────────────────────────────────┘
```

## 3. Data Flow Pipeline
1. **Ingestion (`DocMind`)**: Files are hashed (SHA-256), stored under the local storage directory, PDF pages are rendered at 200 DPI, and page text is extracted. Image OCR uses Tesseract when installed.
2. **Forensic Scanning (`PixelTrace`)**: Rendered pages are inspected with ELA; basic PDF or image metadata is also recorded. These indicators require human interpretation.
3. **Cross-Doc Correlation (`ContextIQ`)**: Deterministic rules compare supported salary and address fields, then may request optional Gemini explanations.
4. **Agentic Reasoning (`Agentic Loop`)**: A bounded workflow records investigation state and calls database-backed tools under a configured tool budget.
5. **Graph & Dossier (`CrossDoc` & `DossierGen`)**: The application builds an interactive relationship graph and generates PDF investigation reports from stored data.
