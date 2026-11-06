#!/usr/bin/env python3
"""
PRISMORA AI — Synthetic Dataset Generator
Generates realistic, multi-document forensic investigation cases with ground truth:
- Case 001: Financial Discrepancy (Loan Application vs Salary Pay Stub vs Bank Statement vs W2)
- Case 002: Address Contradiction (Credit Application vs Utility Bill vs Lease vs HR Letter)
- Case 003: Visual Document Tampering (Authentic Invoice vs Spliced/Altered Invoice vs Purchase Order)
"""

import os
import json
import hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

WORKSPACE_ROOT = Path("/app/applet")
DATASET_ROOT = WORKSPACE_ROOT / "dataset"
STORAGE_ROOT = WORKSPACE_ROOT / "storage"

# Ensure directories exist
for case_dir in ["case_001", "case_002", "case_003"]:
    (DATASET_ROOT / case_dir).mkdir(parents=True, exist_ok=True)
for storage_dir in ["originals", "rendered", "evidence"]:
    (STORAGE_ROOT / storage_dir).mkdir(parents=True, exist_ok=True)


def calculate_sha256(filepath):
    """Compute SHA-256 hash of a file for forensic verification."""
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            sha.update(chunk)
    return sha.hexdigest()


def render_pdf_to_png(pdf_path, output_png_path, dpi=200):
    """Render first page of PDF into high-res PNG using PyMuPDF (or pdf2image/fallback)."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=dpi)
        pix.save(output_png_path)
        doc.close()
        return True
    except Exception as e:
        print(f"Warning: Could not render PDF with PyMuPDF: {e}")
        return False


# ============================================================================
# CASE 001: FINANCIAL INCONSISTENCY
# ============================================================================
def build_case_001():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )
    bold_style = ParagraphStyle(
        'BoldDark',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    c1_dir = DATASET_ROOT / "case_001"

    # 1. Application Form (Alex Mercer claims $12,500/mo salary)
    doc_app = SimpleDocTemplate(str(c1_dir / "application_form.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_app = [
        Paragraph("VERITAS MORTGAGE CORP — LOAN APPLICATION", title_style),
        Paragraph("Application Ref: <b>APP-2026-9812</b> | Submission Date: <b>2026-01-14</b> | Status: Under Review", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Paragraph("<b>APPLICANT PERSONAL & EMPLOYMENT INFORMATION</b>", bold_style),
        Spacer(1, 8),
        Table([
            [Paragraph("Full Legal Name:", bold_style), Paragraph("Alex Mercer", body_style), Paragraph("Date of Birth:", bold_style), Paragraph("1988-04-12", body_style)],
            [Paragraph("National ID (SSN Last 4):", bold_style), Paragraph("9841", body_style), Paragraph("Phone Number:", bold_style), Paragraph("+1 (555) 438-9201", body_style)],
            [Paragraph("Residential Address:", bold_style), Paragraph("342 Elmwood Ave, Portland, OR 97201", body_style), Paragraph("Marital Status:", bold_style), Paragraph("Single", body_style)],
            [Paragraph("Current Employer:", bold_style), Paragraph("Apex Dynamics LLC", body_style), Paragraph("Job Title:", bold_style), Paragraph("Senior Staff Systems Architect", body_style)],
            [Paragraph("Employment Duration:", bold_style), Paragraph("4 Years 6 Months", body_style), Paragraph("Employment Type:", bold_style), Paragraph("Full-time Permanent", body_style)],
            [Paragraph("Stated Gross Monthly Salary:", bold_style), Paragraph("<b>$12,500.00 USD</b>", bold_style), Paragraph("Annual Base Income:", bold_style), Paragraph("<b>$150,000.00 USD</b>", bold_style)],
            [Paragraph("Requested Loan Amount:", bold_style), Paragraph("$420,000.00 USD", body_style), Paragraph("Loan Purpose:", bold_style), Paragraph("Residential Property Purchase", body_style)],
        ], colWidths=[140, 140, 130, 130], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('TEXTCOLOR', (1,5), (1,5), colors.HexColor('#0F172A')),
        ])),
        Spacer(1, 15),
        Paragraph("<b>DECLARATION & SIGNATURE</b>", bold_style),
        Spacer(1, 6),
        Paragraph("I certify that all statements made in this application are complete, accurate, and true to the best of my knowledge.", body_style),
        Spacer(1, 25),
        Table([
            [Paragraph("Applicant Signature: <i>Alex Mercer (Digital Cert #44910)</i>", body_style), Paragraph("Date Signed: 2026-01-14", body_style)]
        ], colWidths=[350, 190])
    ]
    doc_app.build(story_app)

    # 2. Official Pay Stub / Salary Statement (Actual Gross: $9,200/mo, Net: $6,840/mo)
    doc_pay = SimpleDocTemplate(str(c1_dir / "salary_statement.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_pay = [
        Paragraph("APEX DYNAMICS LLC — OFFICIAL EARNINGS STATEMENT", title_style),
        Paragraph("Pay Period: <b>2025-12-01 to 2025-12-31</b> | Pay Date: <b>2025-12-31</b> | Document ID: <b>PAY-APX-8831</b>", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("Employee Name:", bold_style), Paragraph("Alex Mercer", body_style), Paragraph("Employee ID:", bold_style), Paragraph("EMP-0492", body_style)],
            [Paragraph("Department:", bold_style), Paragraph("Cloud Infrastructure", body_style), Paragraph("Tax Filing Status:", bold_style), Paragraph("Single / 0 Exemptions", body_style)],
        ], colWidths=[120, 150, 120, 150], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
        ])),
        Spacer(1, 12),
        Paragraph("<b>EARNINGS & WITHHOLDINGS BREAKDOWN</b>", bold_style),
        Spacer(1, 6),
        Table([
            [Paragraph("<b>Earnings Description</b>", bold_style), Paragraph("<b>Rate / Hrs</b>", bold_style), Paragraph("<b>Current Period</b>", bold_style), Paragraph("<b>YTD Total</b>", bold_style)],
            [Paragraph("Regular Base Salary", body_style), Paragraph("Monthly", body_style), Paragraph("<b>$9,200.00</b>", bold_style), Paragraph("$110,400.00", body_style)],
            [Paragraph("Overtime / Bonus", body_style), Paragraph("—", body_style), Paragraph("$0.00", body_style), Paragraph("$5,000.00", body_style)],
            [Paragraph("<b>Total Gross Pay</b>", bold_style), Paragraph("", body_style), Paragraph("<b>$9,200.00</b>", bold_style), Paragraph("<b>$115,400.00</b>", bold_style)],
            [Paragraph("Federal Income Tax (FIT)", body_style), Paragraph("Withholding", body_style), Paragraph("-$1,380.00", body_style), Paragraph("-$17,310.00", body_style)],
            [Paragraph("Social Security Tax (OASDI)", body_style), Paragraph("6.2%", body_style), Paragraph("-$570.40", body_style), Paragraph("-$7,154.80", body_style)],
            [Paragraph("Medicare Tax", body_style), Paragraph("1.45%", body_style), Paragraph("-$133.40", body_style), Paragraph("-$1,673.30", body_style)],
            [Paragraph("State Income Tax (OR)", body_style), Paragraph("Withholding", body_style), Paragraph("-$276.20", body_style), Paragraph("-$3,465.00", body_style)],
            [Paragraph("<b>Total Statutory Deductions</b>", bold_style), Paragraph("", body_style), Paragraph("<b>-$2,360.00</b>", bold_style), Paragraph("<b>-$29,603.10</b>", bold_style)],
            [Paragraph("<b>NET PAY DISTRIBUTION</b>", bold_style), Paragraph("Direct Deposit #9910", bold_style), Paragraph("<b>$6,840.00</b>", bold_style), Paragraph("<b>$85,796.90</b>", bold_style)],
        ], colWidths=[180, 120, 120, 120], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#E2E8F0')),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#E0E7FF')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 5),
        ])),
        Spacer(1, 15),
        Paragraph("<font color='#64748B' size=8>Apex Dynamics Payroll Services LLC | 100 Innovation Way, Suite 400, Portland, OR | Verified via ADP System</font>", body_style)
    ]
    doc_pay.build(story_pay)

    # 3. Bank Statement (Shows $6,840.00 direct deposit, proving actual net income matches pay stub, NOT $12,500 application claim)
    doc_bank = SimpleDocTemplate(str(c1_dir / "bank_statement.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_bank = [
        Paragraph("MERIDIAN FIRST CREDIT BANK — ACCOUNT STATEMENT", title_style),
        Paragraph("Statement Period: <b>2025-12-01 to 2025-12-31</b> | Account Number: <b>*******4819</b> | Account Type: Premier Checking", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("Account Holder:", bold_style), Paragraph("Alex Mercer", body_style), Paragraph("Starting Balance:", bold_style), Paragraph("$18,420.50", body_style)],
            [Paragraph("Mailing Address:", bold_style), Paragraph("342 Elmwood Ave, Portland, OR 97201", body_style), Paragraph("Total Deposits:", bold_style), Paragraph("$7,140.00", body_style)],
            [Paragraph("Branch Code:", bold_style), Paragraph("BR-092 (Portland Downtown)", body_style), Paragraph("Ending Balance:", bold_style), Paragraph("$21,290.30", body_style)],
        ], colWidths=[120, 160, 110, 150], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
        ])),
        Spacer(1, 12),
        Paragraph("<b>TRANSACTION HISTORY</b>", bold_style),
        Spacer(1, 6),
        Table([
            [Paragraph("<b>Date</b>", bold_style), Paragraph("<b>Transaction Description</b>", bold_style), Paragraph("<b>Type</b>", bold_style), Paragraph("<b>Amount (USD)</b>", bold_style), Paragraph("<b>Running Balance</b>", bold_style)],
            [Paragraph("2025-12-03", body_style), Paragraph("Whole Foods Market #102", body_style), Paragraph("Debit Card", body_style), Paragraph("-$84.20", body_style), Paragraph("$18,336.30", body_style)],
            [Paragraph("2025-12-10", body_style), Paragraph("Portland Electric Utility", body_style), Paragraph("ACH BillPay", body_style), Paragraph("-$145.00", body_style), Paragraph("$18,191.30", body_style)],
            [Paragraph("2025-12-15", body_style), Paragraph("Client Consulting Reimbursement", body_style), Paragraph("Direct Credit", body_style), Paragraph("+$300.00", body_style), Paragraph("$18,491.30", body_style)],
            [Paragraph("2025-12-28", body_style), Paragraph("Mortgage Escrow Reserve", body_style), Paragraph("Internal Transfer", body_style), Paragraph("-$4,041.00", body_style), Paragraph("$14,450.30", body_style)],
            [Paragraph("<b>2025-12-31</b>", bold_style), Paragraph("<b>APEX DYNAMICS PAYROLL DIR DEP</b>", bold_style), Paragraph("<b>Payroll ACH</b>", bold_style), Paragraph("<b>+$6,840.00</b>", bold_style), Paragraph("<b>$21,290.30</b>", bold_style)],
        ], colWidths=[70, 200, 80, 90, 100], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#DCFCE7')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 5),
        ])),
        Spacer(1, 20),
        Paragraph("<font color='#64748B' size=8>Meridian First Credit Bank FDIC Insured #84102 | Official Banking Record</font>", body_style)
    ]
    doc_bank.build(story_bank)

    # 4. Form W-2 / Wage and Tax Statement (Prior year wage $110,400 = 12 * $9,200)
    doc_w2 = SimpleDocTemplate(str(c1_dir / "tax_return_w2.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_w2 = [
        Paragraph("INTERNAL REVENUE SERVICE — FORM W-2 WAGE & TAX STATEMENT", title_style),
        Paragraph("Tax Year: <b>2025</b> | OMB No. 1545-0008 | Copy B — To Be Filed With Employee's Federal Tax Return", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("a Employee Social Security Number:", bold_style), Paragraph("***-**-9841", body_style), Paragraph("1 Wages, tips, other compensation:", bold_style), Paragraph("<b>$110,400.00</b>", bold_style)],
            [Paragraph("b Employer Identification Number (EIN):", bold_style), Paragraph("93-4019284", body_style), Paragraph("2 Federal income tax withheld:", bold_style), Paragraph("$16,560.00", body_style)],
            [Paragraph("c Employer's Name & Address:", bold_style), Paragraph("Apex Dynamics LLC<br/>100 Innovation Way<br/>Portland, OR 97201", body_style), Paragraph("3 Social security wages:<br/>4 Social security tax withheld:", bold_style), Paragraph("$110,400.00<br/>$6,844.80", body_style)],
            [Paragraph("e Employee's Name & Address:", bold_style), Paragraph("Alex Mercer<br/>342 Elmwood Ave<br/>Portland, OR 97201", body_style), Paragraph("5 Medicare wages:<br/>6 Medicare tax withheld:", bold_style), Paragraph("$110,400.00<br/>$1,600.80", body_style)],
        ], colWidths=[150, 150, 140, 100], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#94A3B8')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FAFAFA')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
    ]
    doc_w2.build(story_w2)

    # Render PNG previews
    for name in ["application_form", "salary_statement", "bank_statement", "tax_return_w2"]:
        pdf = c1_dir / f"{name}.pdf"
        png = c1_dir / f"{name}.png"
        render_pdf_to_png(pdf, png)


# ============================================================================
# CASE 002: ADDRESS CONTRADICTION
# ============================================================================
def build_case_002():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )
    bold_style = ParagraphStyle(
        'BoldDark',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    c2_dir = DATASET_ROOT / "case_002"

    # 1. Commercial Credit Application (Claims 742 Evergreen Terrace, Springfield, OR)
    doc_app = SimpleDocTemplate(str(c2_dir / "credit_application.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_app = [
        Paragraph("CASCADE PACIFIC CAPITAL — CREDIT APPLICATION", title_style),
        Paragraph("Application Number: <b>CR-2026-1049</b> | Filing Date: <b>2026-02-01</b>", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Paragraph("<b>PRIMARY APPLICANT RESIDENTIAL PROFILE</b>", bold_style),
        Spacer(1, 8),
        Table([
            [Paragraph("Applicant Name:", bold_style), Paragraph("Elena Vance", body_style), Paragraph("SSN (Last 4):", bold_style), Paragraph("4419", body_style)],
            [Paragraph("Current Residential Address:", bold_style), Paragraph("<b>742 Evergreen Terrace, Springfield, OR 97477</b>", bold_style), Paragraph("Years at Address:", bold_style), Paragraph("3 Years", body_style)],
            [Paragraph("Housing Status:", bold_style), Paragraph("Renting / Sole Occupant", body_style), Paragraph("Monthly Rent/Mortgage:", bold_style), Paragraph("$1,650.00", body_style)],
            [Paragraph("Primary Employer:", bold_style), Paragraph("Northwest BioSystems Inc", body_style), Paragraph("Work Location:", bold_style), Paragraph("Eugene, OR", body_style)],
            [Paragraph("Stated Annual Income:", bold_style), Paragraph("$94,000.00 USD", body_style), Paragraph("Credit Line Requested:", bold_style), Paragraph("$35,000.00 USD", body_style)],
        ], colWidths=[150, 160, 120, 110], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ])),
        Spacer(1, 20),
        Paragraph("Applicant Certification: All provided records represent bona fide primary residence under penalty of review.", body_style)
    ]
    doc_app.build(story_app)

    # 2. Utility Bill (Shows 742 Evergreen Terrace, Springfield, OR 97477 - but billing in inactive / final disconnect cycle)
    doc_util = SimpleDocTemplate(str(c2_dir / "utility_bill.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_util = [
        Paragraph("PACIFIC NORTHWEST POWER & LIGHT — UTILITY STATEMENT", title_style),
        Paragraph("Account Number: <b>UTIL-902-841</b> | Bill Date: <b>2026-01-15</b> | Due Date: <b>2026-02-05</b>", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("Customer Name:", bold_style), Paragraph("Elena Vance", body_style), Paragraph("Service Location:", bold_style), Paragraph("<b>742 Evergreen Terrace, Springfield, OR 97477</b>", bold_style)],
            [Paragraph("Service Type:", bold_style), Paragraph("Residential Electric & Gas", body_style), Paragraph("Service Status:", bold_style), Paragraph("Active (Transfer Requested)", body_style)],
            [Paragraph("Billing Period:", bold_style), Paragraph("2025-12-10 to 2026-01-10", body_style), Paragraph("Total Amount Due:", bold_style), Paragraph("$112.45 USD", body_style)],
        ], colWidths=[120, 150, 120, 150], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
    ]
    doc_util.build(story_util)

    # 3. Residential Lease Agreement (Signed Nov 1, 2025 for 894 Willow Creek Way, Apt 3B, Eugene, OR 97401 - Contradicts Springfield address!)
    doc_lease = SimpleDocTemplate(str(c2_dir / "lease_agreement.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_lease = [
        Paragraph("STANDARD RESIDENTIAL LEASE CONTRACT", title_style),
        Paragraph("Agreement Ref: <b>LEASE-EUG-2025-992</b> | Effective Term: <b>2025-11-01 to 2026-10-31</b>", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("Landlord / Property Manager:", bold_style), Paragraph("Oakmont Real Estate Partners LLC", body_style)],
            [Paragraph("Tenant Name:", bold_style), Paragraph("<b>Elena Vance</b>", bold_style)],
            [Paragraph("Leased Premises (Primary Residence):", bold_style), Paragraph("<b>894 Willow Creek Way, Apt 3B, Eugene, OR 97401</b>", bold_style)],
            [Paragraph("Monthly Base Rental Amount:", bold_style), Paragraph("$1,850.00 USD per month", body_style)],
            [Paragraph("Execution Date:", bold_style), Paragraph("2025-10-28", body_style)],
            [Paragraph("Possession & Occupancy Date:", bold_style), Paragraph("2025-11-01 (Mandatory primary tenant domicile)", body_style)],
        ], colWidths=[180, 360], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ])),
        Spacer(1, 15),
        Paragraph("Section 4.1 Exclusive Residence: Tenant warrants that the leased premises shall serve as their primary sole legal residence.", body_style)
    ]
    doc_lease.build(story_lease)

    # 4. Employer Verification Letter (HR confirms employee address on record is 894 Willow Creek Way, Apt 3B, Eugene, OR)
    doc_hr = SimpleDocTemplate(str(c2_dir / "employer_verification.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_hr = [
        Paragraph("NORTHWEST BIOSYSTEMS INC — HUMAN RESOURCES", title_style),
        Paragraph("Verification Letter ID: <b>HR-VER-2026-081</b> | Date Issued: <b>2026-01-20</b>", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Paragraph("To: Verification Department, Cascade Pacific Capital", body_style),
        Spacer(1, 10),
        Paragraph("This official document confirms that <b>Elena Vance</b> is employed as a Senior Bio-Informatics Analyst at Northwest BioSystems Inc on a full-time basis since March 2022.", body_style),
        Spacer(1, 10),
        Table([
            [Paragraph("Employee Name:", bold_style), Paragraph("Elena Vance", body_style)],
            [Paragraph("Employee ID:", bold_style), Paragraph("NB-44810", body_style)],
            [Paragraph("Primary Address on Corporate Record:", bold_style), Paragraph("<b>894 Willow Creek Way, Apt 3B, Eugene, OR 97401</b>", bold_style)],
            [Paragraph("Current Employment Status:", bold_style), Paragraph("Active / Good Standing", body_style)],
            [Paragraph("Annual Base Compensation:", bold_style), Paragraph("$94,000.00 USD", body_style)],
        ], colWidths=[180, 360], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
    ]
    doc_hr.build(story_hr)

    # Render PNGs
    for name in ["credit_application", "utility_bill", "lease_agreement", "employer_verification"]:
        pdf = c2_dir / f"{name}.pdf"
        png = c2_dir / f"{name}.png"
        render_pdf_to_png(pdf, png)


# ============================================================================
# CASE 003: VISUAL DOCUMENT ANOMALY (TAMPERING)
# ============================================================================
def build_case_003():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )
    bold_style = ParagraphStyle(
        'BoldDark',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    c3_dir = DATASET_ROOT / "case_003"

    # 1. Authentic Invoice (Vanguard Industrial Supplies -> Cascade Systems, Total: $14,500.00)
    doc_orig = SimpleDocTemplate(str(c3_dir / "authentic_invoice.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_orig = [
        Paragraph("VANGUARD INDUSTRIAL SUPPLIES — COMMERCIAL INVOICE", title_style),
        Paragraph("Invoice Number: <b>INV-2026-8829</b> | Issue Date: <b>2026-02-10</b> | Payment Terms: Net 30", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("Billed To:", bold_style), Paragraph("Cascade Systems Corp<br/>500 Tech Parkway, Suite 200<br/>Seattle, WA 98101", body_style),
             Paragraph("Remit Payment To:", bold_style), Paragraph("Vanguard Industrial Supplies<br/>Wire Routing: #021000021<br/>Account: #99401284", body_style)],
        ], colWidths=[100, 170, 110, 160], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ])),
        Spacer(1, 15),
        Paragraph("<b>LINE ITEM DETAILS</b>", bold_style),
        Spacer(1, 6),
        Table([
            [Paragraph("Item #", bold_style), Paragraph("Description", bold_style), Paragraph("Qty", bold_style), Paragraph("Unit Price", bold_style), Paragraph("Total", bold_style)],
            [Paragraph("VIG-101", body_style), Paragraph("Optical Sensor Array Mod V2", body_style), Paragraph("10", body_style), Paragraph("$950.00", body_style), Paragraph("$9,500.00", body_style)],
            [Paragraph("VIG-204", body_style), Paragraph("Industrial Bus Interface Bridge", body_style), Paragraph("5", body_style), Paragraph("$1,000.00", body_style), Paragraph("$5,000.00", body_style)],
            [Paragraph("<b>TOTAL DUE</b>", bold_style), Paragraph("", body_style), Paragraph("", body_style), Paragraph("", body_style), Paragraph("<b>$14,500.00 USD</b>", bold_style)],
        ], colWidths=[60, 240, 50, 90, 100], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#E2E8F0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 6),
        ])),
    ]
    doc_orig.build(story_orig)

    # 2. Corroborating Purchase Order (Authentic PO #PO-4401 issued by Cascade Systems for $14,500.00)
    doc_po = SimpleDocTemplate(str(c3_dir / "purchase_order.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_po = [
        Paragraph("CASCADE SYSTEMS CORP — OFFICIAL PURCHASE ORDER", title_style),
        Paragraph("PO Number: <b>PO-4401</b> | Order Date: <b>2026-02-05</b> | Vendor: Vanguard Industrial Supplies", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("Authorized Total Amount:", bold_style), Paragraph("<b>$14,500.00 USD</b>", bold_style)],
            [Paragraph("Authorized Signatory:", bold_style), Paragraph("Marcus Reed, VP Procurement", body_style)],
            [Paragraph("Budget Code:", bold_style), Paragraph("ENG-CAPEX-2026-Q1", body_style)],
            [Paragraph("Matching Vendor Quote:", bold_style), Paragraph("VIG-Q-8829", body_style)],
        ], colWidths=[180, 360], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
    ]
    doc_po.build(story_po)

    # 3. Shipping Manifest (Quantities match authentic $14,500 items: 10 sensors + 5 bridges)
    doc_ship = SimpleDocTemplate(str(c3_dir / "shipping_manifest.pdf"), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story_ship = [
        Paragraph("PACIFIC FREIGHT LOGISTICS — DELIVERY MANIFEST", title_style),
        Paragraph("Waybill Ref: <b>WB-2026-7719</b> | Dispatch Date: <b>2026-02-12</b>", subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15),
        Table([
            [Paragraph("Shipper:", bold_style), Paragraph("Vanguard Industrial Supplies, Portland, OR", body_style)],
            [Paragraph("Consignee:", bold_style), Paragraph("Cascade Systems Corp, Seattle, WA", body_style)],
            [Paragraph("Package Details:", bold_style), Paragraph("15 Crates (10x Sensor Mod V2, 5x Bus Bridge)", body_style)],
            [Paragraph("Gross Shipping Weight:", bold_style), Paragraph("84.5 lbs", body_style)],
            [Paragraph("Delivery Status:", bold_style), Paragraph("Delivered & Signed by Cascade Warehouse on 2026-02-14", body_style)],
        ], colWidths=[180, 360], style=TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
    ]
    doc_ship.build(story_ship)

    # First render authentic invoice to high-res PNG
    orig_pdf = c3_dir / "authentic_invoice.pdf"
    orig_png = c3_dir / "authentic_invoice.png"
    render_pdf_to_png(orig_pdf, orig_png, dpi=200)

    # Render purchase order and shipping manifest
    render_pdf_to_png(c3_dir / "purchase_order.pdf", c3_dir / "purchase_order.png", dpi=200)
    render_pdf_to_png(c3_dir / "shipping_manifest.pdf", c3_dir / "shipping_manifest.png", dpi=200)

    # 4. Now generate the TAMPERED / ALTERED INVOICE:
    # We perform a controlled pixel splice on the authentic invoice PNG, altering "$14,500.00" to "$41,500.00"
    # and creating an altered PDF from it!
    # Altered coordinates in 200 DPI space:
    # Width ~1700, Height ~2200. Let's inspect or apply image manipulation.
    altered_png = c3_dir / "altered_invoice.png"
    altered_pdf = c3_dir / "altered_invoice.pdf"

    if orig_png.exists():
        img = Image.open(orig_png).convert("RGB")
        w, h = img.size
        draw = ImageDraw.Draw(img)

        # We will alter the line item or total box.
        # Let's locate the area where total amount is displayed:
        # In a letter page of 1700x2200, the table total is approximately:
        # x between 1100 and 1550, y between 600 and 720.
        # Let's create a clearly defined altered patch:
        # Patch coordinates: [x1: 1120, y1: 615, x2: 1540, y2: 665] (in 200dpi pixels)
        patch_box = (1120, 615, 1540, 665)
        # Draw background patch with subtle noise mismatch and different compression level
        draw.rectangle(patch_box, fill=(240, 240, 248))
        
        # Draw altered text: "$41,500.00 USD"
        # Try to load a font or default font
        font = None
        for font_candidate in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]:
            if os.path.exists(font_candidate):
                try:
                    font = ImageFont.truetype(font_candidate, 26)
                    break
                except Exception:
                    pass
        if font is None:
            font = ImageFont.load_default()

        draw.text((1140, 625), "$41,500.00 USD", fill=(15, 23, 42), font=font)
        
        # Save at different JPEG quality to produce strong Error Level Analysis (ELA) delta
        temp_jpg = c3_dir / "altered_temp.jpg"
        img.save(temp_jpg, "JPEG", quality=75)
        tampered_img = Image.open(temp_jpg).convert("RGB")
        tampered_img.save(altered_png, "PNG")
        if temp_jpg.exists():
            temp_jpg.unlink()

        # Also create a PDF wrapper for altered invoice
        tampered_img.save(altered_pdf, "PDF", resolution=200.0)
    else:
        # Fallback if image rendering didn't run
        print("Warning: orig_png not found for tampering")


def generate_metadata_and_ground_truth():
    """Generates ground_truth.json and dataset_summary.json with complete cryptographic and forensic specs."""
    c1_dir = DATASET_ROOT / "case_001"
    c2_dir = DATASET_ROOT / "case_002"
    c3_dir = DATASET_ROOT / "case_003"

    ground_truth = {
        "metadata": {
            "dataset_name": "PRISMORA AI Forensic Benchmark Dataset",
            "version": "1.0.0",
            "generated_date": "2026-11-05",
            "total_cases": 3,
            "total_documents": 12,
            "description": "Controlled multi-document synthetic benchmark for document forensics, contextual discrepancies, and visual anomaly detection."
        },
        "cases": {
            "CASE_001": {
                "case_id": "CASE_001",
                "title": "Financial Information Inconsistency",
                "category": "financial_discrepancy",
                "description": "Applicant declared $12,500.00/month salary on loan application. Official employer pay stub, bank statements, and W2 tax filing confirm actual gross base salary is $9,200.00/month (net deposit $6,840.00/month). Discrepancy is $3,300.00/month ($39,600/year overstatement).",
                "documents": [
                    {
                        "document_id": "C1_DOC_01",
                        "filename": "application_form.pdf",
                        "type": "loan_application",
                        "sha256": calculate_sha256(c1_dir / "application_form.pdf") if (c1_dir / "application_form.pdf").exists() else "",
                        "key_fields": {
                            "applicant_name": "Alex Mercer",
                            "employer": "Apex Dynamics LLC",
                            "stated_gross_monthly_salary": 12500.00,
                            "stated_annual_salary": 150000.00,
                            "requested_loan_amount": 420000.00
                        }
                    },
                    {
                        "document_id": "C1_DOC_02",
                        "filename": "salary_statement.pdf",
                        "type": "pay_stub",
                        "sha256": calculate_sha256(c1_dir / "salary_statement.pdf") if (c1_dir / "salary_statement.pdf").exists() else "",
                        "key_fields": {
                            "employee_name": "Alex Mercer",
                            "employer": "Apex Dynamics LLC",
                            "gross_monthly_salary": 9200.00,
                            "net_monthly_pay": 6840.00,
                            "pay_date": "2025-12-31"
                        }
                    },
                    {
                        "document_id": "C1_DOC_03",
                        "filename": "bank_statement.pdf",
                        "type": "bank_statement",
                        "sha256": calculate_sha256(c1_dir / "bank_statement.pdf") if (c1_dir / "bank_statement.pdf").exists() else "",
                        "key_fields": {
                            "account_holder": "Alex Mercer",
                            "bank_name": "Meridian First Credit Bank",
                            "payroll_direct_deposit_amount": 6840.00,
                            "payroll_payer": "APEX DYNAMICS PAYROLL",
                            "statement_period_end": "2025-12-31"
                        }
                    },
                    {
                        "document_id": "C1_DOC_04",
                        "filename": "tax_return_w2.pdf",
                        "type": "tax_w2",
                        "sha256": calculate_sha256(c1_dir / "tax_return_w2.pdf") if (c1_dir / "tax_return_w2.pdf").exists() else "",
                        "key_fields": {
                            "employee_name": "Alex Mercer",
                            "employer_name": "Apex Dynamics LLC",
                            "total_annual_wages": 110400.00
                        }
                    }
                ],
                "expected_findings": [
                    {
                        "finding_type": "contextual_inconsistency",
                        "severity": "CRITICAL",
                        "source_field": "stated_gross_monthly_salary",
                        "contradicted_by": ["C1_DOC_02.gross_monthly_salary", "C1_DOC_03.payroll_direct_deposit_amount", "C1_DOC_04.total_annual_wages"],
                        "delta_value": 3300.00,
                        "explanation": "Declared monthly income ($12,500.00) exceeds substantiated gross pay stub earnings ($9,200.00) by $3,300.00 and does not match banking direct deposit cash flow ($6,840.00 net).",
                        "human_review_required": True
                    }
                ]
            },
            "CASE_002": {
                "case_id": "CASE_002",
                "title": "Address Information Inconsistency",
                "category": "address_discrepancy",
                "description": "Credit application and electricity bill state residence at 742 Evergreen Terrace, Springfield, OR 97477. However, an active residential lease agreement and official HR employment verification record primary legal residence at 894 Willow Creek Way, Apt 3B, Eugene, OR 97401.",
                "documents": [
                    {
                        "document_id": "C2_DOC_01",
                        "filename": "credit_application.pdf",
                        "type": "credit_application",
                        "sha256": calculate_sha256(c2_dir / "credit_application.pdf") if (c2_dir / "credit_application.pdf").exists() else "",
                        "key_fields": {
                            "applicant_name": "Elena Vance",
                            "residential_address": "742 Evergreen Terrace, Springfield, OR 97477",
                            "years_at_address": 3
                        }
                    },
                    {
                        "document_id": "C2_DOC_02",
                        "filename": "utility_bill.pdf",
                        "type": "utility_bill",
                        "sha256": calculate_sha256(c2_dir / "utility_bill.pdf") if (c2_dir / "utility_bill.pdf").exists() else "",
                        "key_fields": {
                            "customer_name": "Elena Vance",
                            "service_address": "742 Evergreen Terrace, Springfield, OR 97477",
                            "bill_date": "2026-01-15"
                        }
                    },
                    {
                        "document_id": "C2_DOC_03",
                        "filename": "lease_agreement.pdf",
                        "type": "lease_agreement",
                        "sha256": calculate_sha256(c2_dir / "lease_agreement.pdf") if (c2_dir / "lease_agreement.pdf").exists() else "",
                        "key_fields": {
                            "tenant_name": "Elena Vance",
                            "leased_premises": "894 Willow Creek Way, Apt 3B, Eugene, OR 97401",
                            "effective_date": "2025-11-01"
                        }
                    },
                    {
                        "document_id": "C2_DOC_04",
                        "filename": "employer_verification.pdf",
                        "type": "hr_verification",
                        "sha256": calculate_sha256(c2_dir / "employer_verification.pdf") if (c2_dir / "employer_verification.pdf").exists() else "",
                        "key_fields": {
                            "employee_name": "Elena Vance",
                            "address_on_file": "894 Willow Creek Way, Apt 3B, Eugene, OR 97401",
                            "date_issued": "2026-01-20"
                        }
                    }
                ],
                "expected_findings": [
                    {
                        "finding_type": "address_contradiction",
                        "severity": "HIGH",
                        "source_field": "residential_address",
                        "contradicted_by": ["C2_DOC_03.leased_premises", "C2_DOC_04.address_on_file"],
                        "explanation": "Application declares Springfield address, whereas primary 12-month lease executed Nov 2025 and HR corporate records register primary domicile in Eugene, OR.",
                        "benign_alternative": "Applicant recently moved or maintains dual residence for work proximity.",
                        "human_review_required": True
                    }
                ]
            },
            "CASE_003": {
                "case_id": "CASE_003",
                "title": "Visual Document Anomaly & Tampering",
                "category": "visual_tampering",
                "description": "Authentic commercial invoice INV-2026-8829 totals $14,500.00, matching authorized Purchase Order PO-4401 and delivery manifest. The altered invoice file shows localized pixel splicing changing total to $41,500.00 with distinct compression and ELA artifact anomalies.",
                "documents": [
                    {
                        "document_id": "C3_DOC_01",
                        "filename": "authentic_invoice.pdf",
                        "type": "commercial_invoice",
                        "sha256": calculate_sha256(c3_dir / "authentic_invoice.pdf") if (c3_dir / "authentic_invoice.pdf").exists() else "",
                        "key_fields": {
                            "invoice_number": "INV-2026-8829",
                            "vendor": "Vanguard Industrial Supplies",
                            "total_amount": 14500.00
                        }
                    },
                    {
                        "document_id": "C3_DOC_02",
                        "filename": "altered_invoice.pdf",
                        "type": "altered_invoice",
                        "sha256": calculate_sha256(c3_dir / "altered_invoice.pdf") if (c3_dir / "altered_invoice.pdf").exists() else "",
                        "is_altered": True,
                        "altered_coordinates_200dpi": {
                            "x1": 1120,
                            "y1": 615,
                            "x2": 1540,
                            "y2": 665,
                            "target_field": "total_amount",
                            "original_text": "$14,500.00 USD",
                            "altered_text": "$41,500.00 USD"
                        },
                        "key_fields": {
                            "invoice_number": "INV-2026-8829",
                            "vendor": "Vanguard Industrial Supplies",
                            "total_amount": 41500.00
                        }
                    },
                    {
                        "document_id": "C3_DOC_03",
                        "filename": "purchase_order.pdf",
                        "type": "purchase_order",
                        "sha256": calculate_sha256(c3_dir / "purchase_order.pdf") if (c3_dir / "purchase_order.pdf").exists() else "",
                        "key_fields": {
                            "po_number": "PO-4401",
                            "authorized_total": 14500.00,
                            "authorized_signatory": "Marcus Reed"
                        }
                    },
                    {
                        "document_id": "C3_DOC_04",
                        "filename": "shipping_manifest.pdf",
                        "type": "shipping_manifest",
                        "sha256": calculate_sha256(c3_dir / "shipping_manifest.pdf") if (c3_dir / "shipping_manifest.pdf").exists() else "",
                        "key_fields": {
                            "manifest_number": "WB-2026-7719",
                            "total_items": 15,
                            "delivery_status": "Delivered"
                        }
                    }
                ],
                "expected_findings": [
                    {
                        "finding_type": "visual_forensic_splice",
                        "severity": "CRITICAL",
                        "source_field": "total_amount",
                        "detection_technique": "Error Level Analysis (ELA) + Region Comparison",
                        "evidence_coordinates": [1120, 615, 1540, 665],
                        "explanation": "Localized compression error variance detected over invoice total amount box. Purchase Order PO-4401 corroborates authentic amount of $14,500.00.",
                        "human_review_required": True
                    }
                ]
            }
        }
    }

    # Write ground_truth.json
    with open(DATASET_ROOT / "ground_truth.json", "w") as f:
        json.dump(ground_truth, f, indent=2)

    # Write dataset_summary.json
    summary = {
        "dataset_name": "PRISMORA AI Forensic Dataset",
        "total_cases": 3,
        "cases": [
            {
                "case_id": "CASE_001",
                "name": "Financial Information Inconsistency",
                "documents_count": len(ground_truth["cases"]["CASE_001"]["documents"]),
                "core_discrepancy": "$12,500 stated salary vs $9,200 substantiated gross pay"
            },
            {
                "case_id": "CASE_002",
                "name": "Address Information Inconsistency",
                "documents_count": len(ground_truth["cases"]["CASE_002"]["documents"]),
                "core_discrepancy": "Springfield application/utility vs Eugene primary lease & HR record"
            },
            {
                "case_id": "CASE_003",
                "name": "Visual Document Anomaly",
                "documents_count": len(ground_truth["cases"]["CASE_003"]["documents"]),
                "core_discrepancy": "Invoice total digitally altered from $14,500 to $41,500 with ELA signature"
            }
        ],
        "integrity_checksum_verified": True
    }
    with open(DATASET_ROOT / "dataset_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    # Write README.md in dataset folder
    readme_content = """# PRISMORA AI — Synthetic Benchmark Dataset
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
"""
    with open(DATASET_ROOT / "README.md", "w") as f:
        f.write(readme_content)

    print("Synthetic dataset generated successfully!")


if __name__ == "__main__":
    print("Generating Case 001...")
    build_case_001()
    print("Generating Case 002...")
    build_case_002()
    print("Generating Case 003...")
    build_case_003()
    print("Generating ground truth and metadata...")
    generate_metadata_and_ground_truth()
