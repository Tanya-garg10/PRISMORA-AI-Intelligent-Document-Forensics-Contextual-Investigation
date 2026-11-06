import os
from pathlib import Path
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from backend.app.core.config import settings

class DossierGeneratorService:
    @classmethod
    def generate_report(cls, investigation_data: Dict[str, Any], output_pdf_path: str) -> str:
        settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        doc = SimpleDocTemplate(
            output_pdf_path,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        header_title = ParagraphStyle('HeaderTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=colors.HexColor('#0F172A'), spaceAfter=4)
        tagline = ParagraphStyle('Tagline', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#6366F1'), spaceAfter=15)
        sec_header = ParagraphStyle('SecHeader', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#1E293B'), spaceBefore=14, spaceAfter=6)
        body = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor('#334155'))
        body_bold = ParagraphStyle('BodyBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=colors.HexColor('#0F172A'))
        callout = ParagraphStyle('Callout', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=14, textColor=colors.HexColor('#1E293B'))

        story = []
        story.append(Paragraph("PRISMORA AI — FORENSIC INVESTIGATION DOSSIER", header_title))
        story.append(Paragraph("See Beyond the Surface. Discover the Evidence. | DataOps Innovation Hackathon 2026", tagline))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6366F1'), spaceAfter=12))

        inv = investigation_data
        status_color = "#EF4444" if inv.get("status") == "REVIEW_REQUIRED" else "#10B981"
        overview_table = [
            [Paragraph("<b>Case Title:</b>", body_bold), Paragraph(inv.get("title", "Untitled"), body), Paragraph("<b>Case ID:</b>", body_bold), Paragraph(inv.get("id", "N/A"), body)],
            [Paragraph("<b>Status:</b>", body_bold), Paragraph(f"<font color='{status_color}'><b>{inv.get('status', 'N/A')}</b></font>", body_bold), Paragraph("<b>Generated At:</b>", body_bold), Paragraph(inv.get("created_at", "2026-11-05"), body)],
            [Paragraph("<b>Human Verdict:</b>", body_bold), Paragraph(inv.get("human_verdict") or "PENDING REVIEW", body), Paragraph("<b>Total Documents:</b>", body_bold), Paragraph(str(len(inv.get("documents", []))), body)]
        ]
        story.append(Table(overview_table, colWidths=[120, 160, 110, 150], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
        ])))
        story.append(Spacer(1, 10))

        if inv.get("agent_summary"):
            story.append(Paragraph("EXECUTIVE INVESTIGATION SUMMARY", sec_header))
            story.append(Table([[Paragraph(inv["agent_summary"].replace("\n", "<br/>"), callout)]], colWidths=[540], style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EEF2FF')),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#C7D2FE')),
                ('PADDING', (0,0), (-1,-1), 8),
            ])))
            story.append(Spacer(1, 10))

        story.append(Paragraph("DOCUMENT EVIDENCE INVENTORY & INTEGRITY HASHES", sec_header))
        doc_rows = [[Paragraph("<b>Filename</b>", body_bold), Paragraph("<b>Type</b>", body_bold), Paragraph("<b>SHA-256 Hash</b>", body_bold), Paragraph("<b>Status</b>", body_bold)]]
        for d in inv.get("documents", []):
            hash_display = f"{d.get('sha256', '')[:16]}...{d.get('sha256', '')[-8:]}"
            doc_rows.append([
                Paragraph(d.get("filename", ""), body),
                Paragraph(d.get("document_type", "unknown").replace("_", " ").title(), body),
                Paragraph(f"<font face='Courier' size=7>{hash_display}</font>", body),
                Paragraph(d.get("status", "VERIFIED"), body)
            ])
        story.append(Table(doc_rows, colWidths=[150, 130, 190, 70], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 5),
        ])))
        story.append(Spacer(1, 12))

        findings = inv.get("findings", [])
        story.append(Paragraph(f"FORENSIC FINDINGS & CONTEXTUAL DISCREPANCIES ({len(findings)})", sec_header))
        if not findings:
            story.append(Paragraph("No critical discrepancies detected across ingested records.", body))
        else:
            for idx, f in enumerate(findings, 1):
                sev_color = "#DC2626" if f.get("severity") == "CRITICAL" else "#D97706"
                f_table = [
                    [Paragraph(f"<b>Finding #{idx}: {f.get('title')}</b>", body_bold), Paragraph(f"<font color='{sev_color}'><b>{f.get('severity')} / {f.get('grade')}</b></font>", body_bold)],
                    [Paragraph(f"<b>Explanation:</b> {f.get('explanation')}", body), ""],
                ]
                if f.get("alternative_explanations"):
                    alts = "<br/>• ".join(f.get("alternative_explanations")[:2])
                    f_table.append([Paragraph(f"<b>Alternative Benign Explanations:</b><br/>• {alts}", body), ""])

                story.append(Table(f_table, colWidths=[420, 120], style=TableStyle([
                    ('SPAN', (0,1), (1,1)),
                    ('SPAN', (0,2), (1,2)) if len(f_table) > 2 else ('PADDING', (0,0), (-1,-1), 4),
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2') if f.get("severity") == "CRITICAL" else colors.HexColor('#FFFBEB')),
                    ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#FCA5A5') if f.get("severity") == "CRITICAL" else colors.HexColor('#FDE68A')),
                    ('PADDING', (0,0), (-1,-1), 6),
                ])))
                story.append(Spacer(1, 8))

        story.append(Paragraph(
            "<font size=7 color='#64748B'><b>DISCLAIMER:</b> PRISMORA AI contextual and visual anomalies do not constitute definitive legal proof of fraud. Human confirmation by certified forensic document examiners is required before legal action.</font>",
            body
        ))
        doc.build(story)
        return output_pdf_path
