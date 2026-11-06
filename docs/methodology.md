# PRISMORA AI — Forensic Methodology

## 1. Visual Forensics (PixelTrace)
### Error Level Analysis (ELA)
- **Principle**: Resaving an image at a known JPEG quality (e.g. 90-95%) creates a predictable compression error differential across authentic surfaces. Spliced, pasted, or digitally edited segments exhibit distinct error gradients due to differing generation histories.
- **Scoring**: Calculates mean squared error (MSE) across grid tiles, generating high-contrast heatmap masks pinpointing localized manipulations.

### Metadata & Exif Heuristics
- Checks for software signatures (Photoshop, GIMP, Canva, Preview export artifacts).
- Cross-references document creation timestamps against claimed issue dates.

---

## 2. Contextual Normalization (ContextIQ)
- **Currency & Frequency Alignment**: Converts annualized salaries to monthly baselines (`Annual / 12` vs. `Monthly * 12`) with tolerance bands for bonuses and deductions.
- **Gross vs. Net Deductions**: Detects whether discrepancies match standard statutory withholding rates (tax, social security, pension) rather than fraudulent reporting.
- **Temporal Sequence Auditing**: Verifies that issuance, registration, and statement cycles are chronologically coherent.

---

## 3. Human-in-the-Loop Review
No automated finding is ever marked as definitive fraud without human verification. The system grades confidence:
- **Low Risk / High Confidence Match**
- **Ambiguity / Under-Review (Benign Explanation Feasible)**
- **Critical Contradiction / Anomaly Detected**
