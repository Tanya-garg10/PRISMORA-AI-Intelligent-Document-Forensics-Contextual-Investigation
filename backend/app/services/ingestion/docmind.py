import os
import uuid
import hashlib
from pathlib import Path
from typing import Tuple, List, Dict, Any
from PIL import Image
import fitz
from backend.app.core.config import settings

class DocMindIngestionService:
    @staticmethod
    def calculate_sha256(filepath: Path) -> str:
        sha = hashlib.sha256()
        with open(filepath, "rb") as f:
            while chunk := f.read(8192):
                sha.update(chunk)
        return sha.hexdigest()

    @staticmethod
    def validate_file(filename: str, file_size: int) -> Tuple[bool, str]:
        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'."
        if file_size > settings.MAX_FILE_SIZE_BYTES:
            return False, f"File size exceeds maximum limit."
        return True, ""

    @classmethod
    def ingest_document(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        doc_id = str(uuid.uuid4())
        ext = Path(filename).suffix.lower()
        
        orig_filename = f"{doc_id}_{filename}"
        orig_path = settings.ORIGINALS_DIR / orig_filename
        settings.ORIGINALS_DIR.mkdir(parents=True, exist_ok=True)
        settings.RENDERED_DIR.mkdir(parents=True, exist_ok=True)

        with open(orig_path, "wb") as f:
            f.write(file_bytes)

        sha256_hash = cls.calculate_sha256(orig_path)
        file_size = len(file_bytes)
        rendered_pages = []

        if ext == ".pdf":
            try:
                pdf_doc = fitz.open(orig_path)
                page_count = len(pdf_doc)
                for page_idx in range(page_count):
                    page = pdf_doc.load_page(page_idx)
                    pix = page.get_pixmap(dpi=200)
                    render_name = f"{doc_id}_p{page_idx + 1}.png"
                    render_path = settings.RENDERED_DIR / render_name
                    pix.save(str(render_path))
                    rendered_pages.append({
                        "page_number": page_idx + 1,
                        "rendered_image_path": str(render_path),
                        "width": pix.width,
                        "height": pix.height
                    })
                pdf_doc.close()
            except Exception:
                render_name = f"{doc_id}_p1.png"
                render_path = settings.RENDERED_DIR / render_name
                img = Image.new("RGB", (1600, 2200), color=(255, 255, 255))
                img.save(str(render_path))
                rendered_pages.append({
                    "page_number": 1,
                    "rendered_image_path": str(render_path),
                    "width": 1600,
                    "height": 2200
                })
                page_count = 1
        else:
            try:
                img = Image.open(orig_path)
                w, h = img.size
                render_name = f"{doc_id}_p1.png"
                render_path = settings.RENDERED_DIR / render_name
                img.save(str(render_path))
                rendered_pages.append({
                    "page_number": 1,
                    "rendered_image_path": str(render_path),
                    "width": w,
                    "height": h
                })
                page_count = 1
            except Exception:
                page_count = 1

        return {
            "document_id": doc_id,
            "filename": filename,
            "original_path": str(orig_path),
            "file_type": ext.replace(".", ""),
            "file_size_bytes": file_size,
            "sha256": sha256_hash,
            "page_count": page_count,
            "rendered_pages": rendered_pages
        }
