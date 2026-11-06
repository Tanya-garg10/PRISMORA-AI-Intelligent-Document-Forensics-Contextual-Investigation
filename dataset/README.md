# PRISMORA AI — Synthetic Benchmark Dataset
This directory contains 12 synthetic documents across three distinct investigative cases designed to rigorously test document forensics, OCR extraction, cross-document reconciliation, and visual manipulation detection.

## Case Overview
1. **Case 001: Financial Information Inconsistency**
   - Application Form (`application_form.pdf`): Declares $12,500/mo income.
   - Salary Statement (`salary_statement.pdf`): Documents actual gross salary of $9,200/mo and net pay of $6,840.
   - Bank Statement (`bank_statement.pdf`): Confirms payroll deposit of $6,840.
   - Form W-2 (`tax_return_w2.pdf`): Documents prior year wages of $110,400.

2. **Case 002: Address Information Inconsistency**
   - Credit Application (`credit_application.pdf`): States 742 Evergreen Terrace, Springfield, OR.
   - Utility Bill (`utility_bill.pdf`): Billing statement for Springfield address.
   - Lease Agreement (`lease_agreement.pdf`): Primary residential lease for 894 Willow Creek Way, Apt 3B, Eugene, OR.
   - HR Verification (`employer_verification.pdf`): Corporate employer records confirming Eugene domicile.

3. **Case 003: Visual Document Anomaly**
   - Authentic Invoice (`authentic_invoice.pdf` / `.png`): Vendor invoice totaling $14,500.00.
   - Altered Invoice (`altered_invoice.pdf` / `.png`): Spliced total altered to $41,500.00 with ELA anomaly.
   - Purchase Order (`purchase_order.pdf`): Corroborates authentic $14,500.00 authorization.
   - Shipping Manifest (`shipping_manifest.pdf`): Physical item quantities corroborating authentic order.

All identities, companies, addresses, and numbers are fictional.
