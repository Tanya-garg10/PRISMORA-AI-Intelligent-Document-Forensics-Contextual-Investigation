# PRISMORA AI — Analysis Methodology

## 1. Document ingestion and text extraction

- Uploaded files are restricted by extension and size, stored under the local originals directory, and hashed with SHA-256.
- PDF pages are rendered with PyMuPDF at 200 DPI. Text-based PDFs use native text extraction; image OCR uses the local Tesseract executable when installed.
- Structured fields are extracted with the regular expressions implemented in `backend/app/services/ocr/extractor.py`. The extractor supports selected names, financial amounts, addresses, dates, and reference numbers; it is not a general-purpose document understanding model.
- Extracted values and page text are references for review. Recognition quality depends on the source document, and image OCR is unavailable if Tesseract is not installed.

## 2. Visual inspection

### Error Level Analysis

The PixelTrace service converts a rendered page to JPEG at a selected quality, compares the re-encoded image with the source pixels, and calculates relative differences across 64-pixel tiles. It saves an amplified difference image and may identify the tile with the highest difference.

ELA is sensitive to compression history and image content. A high difference score can have benign causes and is not proof of editing or fraud.

### Metadata

Basic PDF metadata (such as creator, producer, dates, encryption, and page count) or image format and dimensions are recorded. The current implementation does not validate document signatures, author identity, or claimed dates.

## 3. Cross-document comparisons

ContextIQ applies deterministic rules to supported extracted fields, including declared versus documented gross monthly salary, invoice totals versus purchase-order totals, and selected address fields. Address comparison uses basic string normalization. These rules do not provide general date normalization, annual/monthly conversion, tax calculations, or broad entity resolution.

Where configured, Gemini may rewrite explanations and alternatives for existing deterministic findings. It is optional and its output should be reviewed; it does not independently establish evidence.

## 4. Human review

Automated outputs are observations or potential discrepancies. Reviewers can record a decision and notes for a finding. A recorded decision is an audit action, not an independent verification of the underlying document or a legal conclusion.
