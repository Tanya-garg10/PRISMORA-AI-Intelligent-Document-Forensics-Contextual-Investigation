import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import (
    Investigation, Document, DocumentPage, ExtractedField,
    ForensicObservation, Finding, FindingEvidence, ReviewDecision
)
from backend.app.schemas.schemas import (
    InvestigationCreate, InvestigationResponse, InvestigationDetailResponse,
    DocumentResponse, ExtractedFieldResponse, FindingResponse, FindingReviewRequest,
    GraphResponse
)
from backend.app.services.ingestion.docmind import DocMindIngestionService
from backend.app.services.classification.classifier import DocumentClassifier
from backend.app.services.ocr.extractor import OCRExtractionService
from backend.app.services.visual_forensics.pixeltrace import PixelTraceService
from backend.app.services.contextiq.contextiq import ContextIQEngine
from backend.app.services.crossdoc.graph_builder import CrossDocGraphBuilder
from backend.app.services.agent.investigator import BoundedForensicAgent
from backend.app.services.reporting.dossier import DossierGeneratorService
from backend.app.core.config import settings

router = APIRouter(prefix="/api")

@router.post("/investigations", response_model=InvestigationDetailResponse)
def create_investigation(payload: InvestigationCreate, db: Session = Depends(get_db)):
    case_dir = None
    if payload.seed_case:
        case_dir = settings.DATASET_DIR / payload.seed_case.lower()
        if not case_dir.is_dir() or not list(case_dir.glob("*.pdf")):
            raise HTTPException(status_code=404, detail=f"Sample case '{payload.seed_case}' was not found or contains no PDF documents.")

    inv_id = str(uuid.uuid4())
    investigation = Investigation(
        id=inv_id,
        title=payload.title,
        description=payload.description or "Document forensics & contextual intelligence investigation.",
        status="CREATED"
    )
    db.add(investigation)
    db.commit()

    if payload.seed_case:
        for pdf_file in sorted(case_dir.glob("*.pdf")):
            with open(pdf_file, "rb") as f:
                file_bytes = f.read()

            ingest_res = DocMindIngestionService.ingest_document(file_bytes, pdf_file.name)
            doc = Document(
                id=ingest_res["document_id"],
                investigation_id=inv_id,
                filename=ingest_res["filename"],
                original_path=ingest_res["original_path"],
                file_type=ingest_res["file_type"],
                file_size_bytes=ingest_res["file_size_bytes"],
                sha256=ingest_res["sha256"],
                page_count=ingest_res["page_count"],
                status="UPLOADED"
            )
            db.add(doc)
            for p in ingest_res["rendered_pages"]:
                page_obj = DocumentPage(
                    id=str(uuid.uuid4()),
                    document_id=doc.id,
                    page_number=p["page_number"],
                    rendered_image_path=p["rendered_image_path"],
                    width=p["width"],
                    height=p["height"]
                )
                db.add(page_obj)
        db.commit()

    db.refresh(investigation)
    return investigation

@router.get("/investigations", response_model=List[InvestigationResponse])
def list_investigations(db: Session = Depends(get_db)):
    invs = db.query(Investigation).order_by(Investigation.created_at.desc()).all()
    results = []
    for inv in invs:
        doc_count = db.query(Document).filter(Document.investigation_id == inv.id).count()
        finding_count = db.query(Finding).filter(Finding.investigation_id == inv.id).count()
        crit_count = db.query(Finding).filter(
            Finding.investigation_id == inv.id,
            Finding.severity.in_(["CRITICAL", "HIGH"])
        ).count()
        results.append({
            "id": inv.id,
            "title": inv.title,
            "description": inv.description,
            "status": inv.status,
            "created_at": inv.created_at,
            "updated_at": inv.updated_at,
            "document_count": doc_count,
            "finding_count": finding_count,
            "critical_findings_count": crit_count,
            "pending_review_count": db.query(Finding).filter(
                Finding.investigation_id == inv.id,
                Finding.review_status == "UNREVIEWED"
            ).count(),
            "human_verdict": inv.human_verdict,
            "agent_summary": inv.agent_summary
        })
    return results

@router.get("/investigations/{id}", response_model=InvestigationDetailResponse)
def get_investigation(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    documents = db.query(Document).filter(Document.investigation_id == id).all()
    document_responses = []
    for doc in documents:
        observations = db.query(ForensicObservation).filter(
            ForensicObservation.document_id == doc.id
        ).all()
        observations_by_page = {}
        for observation in observations:
            observations_by_page.setdefault(observation.page_number, []).append(observation)

        pages = db.query(DocumentPage).filter(
            DocumentPage.document_id == doc.id
        ).order_by(DocumentPage.page_number).all()
        page_responses = []
        for page in pages:
            page_observations = observations_by_page.get(page.page_number, [])
            ela_observation = next(
                (item for item in page_observations if item.technique == "Error Level Analysis (ELA)"),
                None
            )
            page_responses.append({
                "id": page.id,
                "document_id": page.document_id,
                "page_number": page.page_number,
                "rendered_image_url": (
                    f"/storage/rendered/{Path(page.rendered_image_path).name}"
                    if page.rendered_image_path else None
                ),
                "ela_image_url": (
                    f"/storage/evidence/{Path(ela_observation.ela_image_path or ela_observation.evidence_crop_path).name}"
                    if ela_observation and (ela_observation.ela_image_path or ela_observation.evidence_crop_path) else None
                ),
                "width": page.width,
                "height": page.height,
                "raw_text": page.raw_text
            })

        document_responses.append({
            "id": doc.id,
            "investigation_id": doc.investigation_id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "file_size_bytes": doc.file_size_bytes,
            "sha256": doc.sha256,
            "document_type": doc.document_type,
            "classification_confidence": doc.classification_confidence,
            "page_count": doc.page_count,
            "status": doc.status,
            "created_at": doc.created_at,
            "rendered_image_url": page_responses[0]["rendered_image_url"] if page_responses else None,
            "pages": page_responses,
            "extracted_fields": db.query(ExtractedField).filter(
                ExtractedField.document_id == doc.id
            ).all(),
            "observations": [
                {
                    "id": observation.id,
                    "document_id": observation.document_id,
                    "page_number": observation.page_number,
                    "technique": observation.technique,
                    "description": observation.description,
                    "anomaly_score": observation.anomaly_score,
                    "bounding_box": observation.bounding_box,
                    "evidence_crop_url": (
                        f"/storage/evidence/{Path(observation.evidence_crop_path).name}"
                        if observation.evidence_crop_path else None
                    ),
                    "ela_image_url": (
                        f"/storage/evidence/{Path(observation.ela_image_path).name}"
                        if observation.ela_image_path else None
                    ),
                    "limitations": observation.limitations,
                    "created_at": observation.created_at
                }
                for observation in observations
            ]
        })

    return {
        "id": inv.id,
        "title": inv.title,
        "description": inv.description,
        "status": inv.status,
        "created_at": inv.created_at,
        "updated_at": inv.updated_at,
        "agent_summary": inv.agent_summary,
        "human_verdict": inv.human_verdict,
        "review_notes": inv.review_notes,
        "documents": document_responses,
        "findings": inv.findings,
        "agent_actions": inv.agent_actions
    }

@router.post("/investigations/{id}/documents", response_model=List[DocumentResponse])
async def upload_documents(id: str, files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    uploaded_docs = []
    for file in files:
        contents = await file.read()
        valid, err = DocMindIngestionService.validate_file(file.filename, len(contents))
        if not valid:
            raise HTTPException(status_code=400, detail=f"File validation failed: {err}")

        res = DocMindIngestionService.ingest_document(contents, file.filename)
        doc = Document(
            id=res["document_id"],
            investigation_id=id,
            filename=res["filename"],
            original_path=res["original_path"],
            file_type=res["file_type"],
            file_size_bytes=res["file_size_bytes"],
            sha256=res["sha256"],
            page_count=res["page_count"],
            status="UPLOADED"
        )
        db.add(doc)
        for p in res["rendered_pages"]:
            page_obj = DocumentPage(
                id=str(uuid.uuid4()),
                document_id=doc.id,
                page_number=p["page_number"],
                rendered_image_path=p["rendered_image_path"],
                width=p["width"],
                height=p["height"]
            )
            db.add(page_obj)
        uploaded_docs.append(doc)

    db.commit()
    for d in uploaded_docs:
        db.refresh(d)
    return uploaded_docs

@router.get("/investigations/{id}/documents", response_model=List[DocumentResponse])
def list_investigation_documents(id: str, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.investigation_id == id).all()
    results = []
    for d in docs:
        first_page = db.query(DocumentPage).filter(DocumentPage.document_id == d.id).first()
        preview_url = f"/storage/rendered/{Path(first_page.rendered_image_path).name}" if first_page and first_page.rendered_image_path else None
        results.append({
            "id": d.id,
            "investigation_id": d.investigation_id,
            "filename": d.filename,
            "file_type": d.file_type,
            "file_size_bytes": d.file_size_bytes,
            "sha256": d.sha256,
            "document_type": d.document_type,
            "classification_confidence": d.classification_confidence,
            "page_count": d.page_count,
            "status": d.status,
            "created_at": d.created_at,
            "rendered_image_url": preview_url
        })
    return results

@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Document, Investigation.title).join(
        Investigation, Document.investigation_id == Investigation.id
    ).order_by(Document.created_at.desc()).all()
    return [
        {
            "id": doc.id,
            "investigation_id": doc.investigation_id,
            "investigation_title": investigation_title,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "file_size_bytes": doc.file_size_bytes,
            "sha256": doc.sha256,
            "document_type": doc.document_type,
            "classification_confidence": doc.classification_confidence,
            "page_count": doc.page_count,
            "status": doc.status,
            "created_at": doc.created_at
        }
        for doc, investigation_title in documents
    ]

@router.get("/documents/{id}", response_model=DocumentResponse)
def get_document(id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    first_page = db.query(DocumentPage).filter(DocumentPage.document_id == doc.id).first()
    preview_url = f"/storage/rendered/{Path(first_page.rendered_image_path).name}" if first_page and first_page.rendered_image_path else None
    return {
        "id": doc.id,
        "investigation_id": doc.investigation_id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "file_size_bytes": doc.file_size_bytes,
        "sha256": doc.sha256,
        "document_type": doc.document_type,
        "classification_confidence": doc.classification_confidence,
        "page_count": doc.page_count,
        "status": doc.status,
        "created_at": doc.created_at,
        "rendered_image_url": preview_url
    }

@router.get("/documents/{id}/fields", response_model=List[ExtractedFieldResponse])
def get_document_fields(id: str, db: Session = Depends(get_db)):
    return db.query(ExtractedField).filter(ExtractedField.document_id == id).all()

@router.post("/investigations/{id}/analyze", response_model=InvestigationDetailResponse)
def run_investigation_pipeline(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    docs = db.query(Document).filter(Document.investigation_id == id).all()
    if not docs:
        raise HTTPException(status_code=400, detail="Cannot analyze empty investigation.")

    inv.status = "PROCESSING"
    db.commit()

    fields_by_doc = {}
    doc_payloads = []

    for doc in docs:
        pages = db.query(DocumentPage).filter(DocumentPage.document_id == doc.id).order_by(DocumentPage.page_number).all()
        full_text = ""
        doc_fields = []

        for p in pages:
            page_text, word_blocks = OCRExtractionService.extract_page_text_and_blocks(doc.original_path, p.page_number - 1)
            p.raw_text = page_text
            full_text += f"\n{page_text}"

        doc_type, conf = DocumentClassifier.classify(full_text)
        doc.document_type = doc_type
        doc.classification_confidence = conf

        for p in pages:
            extracted = OCRExtractionService.extract_structured_fields(p.raw_text or full_text, doc_type, p.page_number)
            for f in extracted:
                existing = db.query(ExtractedField).filter(
                    ExtractedField.document_id == doc.id,
                    ExtractedField.field_name == f["field_name"]
                ).first()
                if not existing:
                    field_obj = ExtractedField(
                        id=f["id"],
                        document_id=doc.id,
                        page_number=f["page_number"],
                        field_name=f["field_name"],
                        raw_value=f["raw_value"],
                        normalized_value=f["normalized_value"],
                        field_type=f["field_type"],
                        confidence=f["confidence"],
                        bounding_box=f["bounding_box"]
                    )
                    db.add(field_obj)
                    doc_fields.append({**f, "document_id": doc.id})

        first_page = pages[0] if pages else None
        render_path = first_page.rendered_image_path if first_page else ""
        observations = PixelTraceService.analyze_document(doc.id, doc.original_path, render_path)
        for obs in observations:
            obs_obj = ForensicObservation(
                id=obs["id"],
                document_id=doc.id,
                page_number=obs["page_number"],
                technique=obs["technique"],
                description=obs["description"],
                anomaly_score=obs["anomaly_score"],
                bounding_box=obs["bounding_box"],
                evidence_crop_path=obs["evidence_crop_path"],
                ela_image_path=obs.get("ela_image_path"),
                limitations=obs["limitations"]
            )
            db.add(obs_obj)

        doc.status = "PROCESSED"
        fields_by_doc[doc.id] = doc_fields
        doc_payloads.append({
            "id": doc.id,
            "filename": doc.filename,
            "document_type": doc.document_type,
            "sha256": doc.sha256,
            "page_count": doc.page_count
        })

    db.commit()

    raw_findings = ContextIQEngine.run_deterministic_analysis(doc_payloads, fields_by_doc)
    summary_context = f"Investigation: {inv.title}\nDocuments: {len(docs)}\n"
    for d in doc_payloads:
        summary_context += f"- {d['filename']} ({d['document_type']})\n"
    
    findings_list = ContextIQEngine.enhance_with_gemini(raw_findings, summary_context)

    db.query(Finding).filter(Finding.investigation_id == id).delete()
    for f_data in findings_list:
        finding_obj = Finding(
            id=f_data["id"],
            investigation_id=id,
            category=f_data["category"],
            severity=f_data["severity"],
            grade=f_data.get("grade", "POTENTIAL_ANOMALY"),
            title=f_data["title"],
            explanation=f_data["explanation"],
            alternative_explanations=f_data.get("alternative_explanations", []),
            recommended_actions=f_data.get("recommended_actions", []),
            human_review_required=f_data.get("human_review_required", True),
            review_status=f_data.get("review_status", "UNREVIEWED")
        )
        db.add(finding_obj)

        for ev in f_data.get("evidence_items", []):
            ev_obj = FindingEvidence(
                id=str(uuid.uuid4()),
                finding_id=finding_obj.id,
                document_id=ev["document_id"],
                evidence_type=ev["evidence_type"],
                reference_field_id=ev.get("reference_field_id"),
                label=ev["label"],
                evidence_data=ev.get("evidence_data"),
                page_number=ev.get("page_number", 1)
            )
            db.add(ev_obj)

    db.commit()

    agent = BoundedForensicAgent(db, id)
    agent.run_investigation_cycle()

    db.refresh(inv)
    return get_investigation(id, db)

@router.get("/investigations/{id}/findings", response_model=List[FindingResponse])
def get_investigation_findings(id: str, db: Session = Depends(get_db)):
    return db.query(Finding).filter(Finding.investigation_id == id).all()

@router.get("/findings/{id}/evidence", response_model=List[Dict[str, Any]])
def get_finding_evidence(id: str, db: Session = Depends(get_db)):
    ev_items = db.query(FindingEvidence).filter(FindingEvidence.finding_id == id).all()
    return [{
        "id": ev.id,
        "finding_id": ev.finding_id,
        "document_id": ev.document_id,
        "evidence_type": ev.evidence_type,
        "label": ev.label,
        "evidence_data": ev.evidence_data,
        "page_number": ev.page_number
    } for ev in ev_items]

@router.post("/findings/{id}/review", response_model=FindingResponse)
def review_finding(id: str, payload: FindingReviewRequest, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(Finding.id == id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    finding.review_status = payload.decision
    finding.reviewer_notes = payload.notes

    decision_obj = ReviewDecision(
        id=str(uuid.uuid4()),
        investigation_id=finding.investigation_id,
        finding_id=finding.id,
        decision=payload.decision,
        reviewer=payload.reviewer or "Investigator Analyst",
        rationale=payload.notes or "Review decision updated."
    )
    db.add(decision_obj)
    db.commit()
    db.refresh(finding)
    return finding

@router.get("/investigations/{id}/graph", response_model=GraphResponse)
def get_investigation_graph(id: str, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.investigation_id == id).all()
    findings = db.query(Finding).filter(Finding.investigation_id == id).all()

    doc_dicts = [
        {"id": d.id, "filename": d.filename, "document_type": d.document_type, "sha256": d.sha256, "page_count": d.page_count, "file_type": d.file_type}
        for d in docs
    ]
    fields_by_doc = {}
    for d in docs:
        fields = db.query(ExtractedField).filter(ExtractedField.document_id == d.id).all()
        fields_by_doc[d.id] = [
            {"id": f.id, "field_name": f.field_name, "raw_value": f.raw_value, "field_type": f.field_type}
            for f in fields
        ]

    finding_dicts = []
    for f in findings:
        finding_dicts.append({
            "id": f.id,
            "title": f.title,
            "category": f.category,
            "severity": f.severity,
            "review_status": f.review_status,
            "grade": f.grade,
            "evidence_items": [
                {"id": ev.id, "document_id": ev.document_id, "reference_field_id": ev.reference_field_id}
                for ev in f.evidence_items
            ]
        })

    return CrossDocGraphBuilder.build_graph(id, doc_dicts, fields_by_doc, finding_dicts)

@router.get("/investigations/{id}/report")
def download_investigation_report(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    docs = db.query(Document).filter(Document.investigation_id == id).all()
    findings = db.query(Finding).filter(Finding.investigation_id == id).all()
    report_path = str(settings.STORAGE_DIR / f"prismora_dossier_{id[:8]}.pdf")

    inv_data = {
        "id": inv.id,
        "title": inv.title,
        "status": inv.status,
        "created_at": inv.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "human_verdict": inv.human_verdict,
        "review_notes": inv.review_notes,
        "agent_summary": inv.agent_summary,
        "documents": [{"filename": d.filename, "document_type": d.document_type, "sha256": d.sha256, "status": d.status} for d in docs],
        "findings": [{"title": f.title, "category": f.category, "severity": f.severity, "grade": f.grade, "explanation": f.explanation, "alternative_explanations": f.alternative_explanations or []} for f in findings]
    }

    DossierGeneratorService.generate_report(inv_data, report_path)
    return FileResponse(path=report_path, media_type="application/pdf", filename=f"PRISMORA_Dossier_{inv.title.replace(' ', '_')}.pdf")

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_configured": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5),
        "gemini_model": settings.GEMINI_MODEL,
        "ocr_engine": (
            "PyMuPDF Native + Tesseract"
            if shutil.which("tesseract")
            else "PyMuPDF Native (Tesseract not installed; image OCR unavailable)"
        ),
        "database": {
            "status": "connected",
            "type": "SQLite + SQLAlchemy",
            "investigation_count": db.query(Investigation).count(),
            "document_count": db.query(Document).count(),
            "finding_count": db.query(Finding).count()
        },
        "storage": {
            "originals_dir": str(settings.ORIGINALS_DIR),
            "rendered_dir": str(settings.RENDERED_DIR),
            "evidence_dir": str(settings.EVIDENCE_DIR)
        }
    }
