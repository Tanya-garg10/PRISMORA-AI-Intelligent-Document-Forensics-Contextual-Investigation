# PRISMORA AI — Known Limitations & Risk Disclosure

1. **OCR Quality Dependencies**: Heavily degraded, noisy, or handwritten documents may yield low character recognition confidence (< 60%), necessitating human transcript validation.
2. **Benign Compression Artifacts**: Re-saving, social media transmission (e.g. WhatsApp compression), or print-scan cycles naturally alter ELA responses and must not be conflated with malicious forgery.
3. **LLM Hallucination Guardrails**: Gemini agent reasoning is strictly grounded by deterministic JSON payloads. The system enforces zero-speculation rules and returns `insufficient_evidence` when corroborating documents are absent.
4. **Jurisdictional Tax Formulas**: Gross-to-net estimations apply standard progressive tax approximations; specific municipal allowances require manual adjuster audit.
