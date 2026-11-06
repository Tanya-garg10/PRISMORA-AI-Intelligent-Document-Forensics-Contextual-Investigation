# PRISMORA AI — Integration Matrix

| Engine | Technology | Current role | Validation |
|---|---|---|---|
| **DocMind** | PyMuPDF, Pillow, pytesseract/Tesseract | File hashing, PDF rendering and text extraction, optional image OCR, selected structured fields | Backend API and synthetic dataset tests |
| **PixelTrace** | Pillow, NumPy, PyMuPDF | ELA image generation, tile score, basic PDF/image metadata | Pipeline tests; ELA remains a heuristic |
| **ContextIQ** | Python rules, optional Google Gemini API | Selected salary, invoice total, and address comparisons; optional explanation refinement | Synthetic financial/address pipeline tests |
| **CrossDoc** | React Flow, FastAPI graph builder | Display investigation document, field, and finding relationships | Graph endpoint and browser rendering |
| **EvidenceVault** | SQLite, SQLAlchemy, local files | Store investigation records, file hashes, extracted fields, observations, findings, and review actions | API and database tests |
| **DossierGen** | ReportLab, FastAPI `FileResponse` | Generate a downloadable PDF using stored investigation records | API response and PDF signature/size checks |
