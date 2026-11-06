# PRISMORA AI — Known Limitations

1. **OCR:** Image OCR requires the external Tesseract executable. Without it, PDF native text extraction still works, but image-only documents do not receive OCR text. Handwriting and low-quality scans may also produce incomplete text.
2. **Field extraction:** Structured extraction uses a limited collection of document-specific patterns. Unsupported labels and formats may not produce fields; missing fields must not be interpreted as proof that information is absent.
3. **Visual analysis:** ELA and basic metadata checks are heuristics. Benign compression, scanning, or export workflows can produce differences. The application cannot determine fraud from these indicators.
4. **Comparisons:** Deterministic rules cover only selected salary, invoice, and address cases. They do not implement general date/currency normalization, tax estimation, or broad entity resolution.
5. **Gemini:** Contextual explanations require a configured API key and network access. Gemini output can be inaccurate and must be checked against the stored evidence; deterministic comparisons work without it.
6. **Storage and access control:** Runtime files and SQLite data are stored locally. The current application is a prototype and does not provide user authentication, multi-tenant isolation, or production-grade access controls.
7. **Reports:** PDF reports summarize application records. They are not certified forensic opinions or a guarantee of legal admissibility.
