import os
import uuid
import io
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from PIL import Image, ImageChops, ImageDraw
import fitz
from backend.app.core.config import settings

class PixelTraceService:
    @classmethod
    def perform_error_level_analysis(cls, image_path: str, quality: int = 90) -> Tuple[str, float, Optional[Dict[str, Any]]]:
        settings.EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
        img = Image.open(image_path).convert("RGB")
        w, h = img.size

        buffer = io.BytesIO()
        img.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        recompressed = Image.open(buffer).convert("RGB")

        diff = ImageChops.difference(img, recompressed)

        diff_np = np.array(diff, dtype=np.float32)
        tile_size = 64
        max_tile_error = 0.0
        max_box = None

        rows, cols = h // tile_size, w // tile_size
        tile_errors = []

        for r in range(rows):
            for c in range(cols):
                tile = diff_np[r*tile_size:(r+1)*tile_size, c*tile_size:(c+1)*tile_size]
                mean_err = np.mean(tile)
                tile_errors.append(mean_err)
                if mean_err > max_tile_error:
                    max_tile_error = mean_err
                    max_box = {
                        "x1": c * tile_size,
                        "y1": r * tile_size,
                        "x2": (c + 1) * tile_size,
                        "y2": (r + 1) * tile_size
                    }

        overall_mean = np.mean(tile_errors) if tile_errors else 0.0
        overall_std = np.std(tile_errors) if tile_errors else 0.0
        anomaly_ratio = (max_tile_error - overall_mean) / (overall_std + 1e-5) if overall_std > 0 else 0.0
        normalized_anomaly = float(min(max(anomaly_ratio / 6.0, 0.0), 1.0))

        diff_gray = np.array(diff.convert("L"), dtype=np.float32)
        hi = float(np.percentile(diff_gray, 99.5))
        if hi <= 0:
            hi = 1.0
        enhanced = np.clip(diff_gray * (255.0 / hi), 0, 255).astype(np.uint8)
        diff_enhanced = Image.fromarray(enhanced, "L").convert("RGB")

        if max_box:
            draw = ImageDraw.Draw(diff_enhanced)
            draw.rectangle(
                [max_box["x1"], max_box["y1"], max_box["x2"] - 1, max_box["y2"] - 1],
                outline=(255, 60, 60), width=10,
            )

        ela_id = str(uuid.uuid4())
        ela_filename = f"ela_{ela_id}.png"
        ela_path = settings.EVIDENCE_DIR / ela_filename
        diff_enhanced.save(str(ela_path))

        return str(ela_path), normalized_anomaly, max_box

    @classmethod
    def inspect_metadata(cls, doc_path: str) -> Dict[str, Any]:
        meta = {}
        try:
            if doc_path.lower().endswith(".pdf"):
                doc = fitz.open(doc_path)
                pdf_meta = doc.metadata or {}
                meta = {
                    "format": "PDF",
                    "creator": pdf_meta.get("creator", ""),
                    "producer": pdf_meta.get("producer", ""),
                    "creation_date": pdf_meta.get("creationDate", ""),
                    "mod_date": pdf_meta.get("modDate", ""),
                    "is_encrypted": doc.is_encrypted,
                    "page_count": len(doc)
                }
                doc.close()
            else:
                img = Image.open(doc_path)
                meta = {
                    "format": img.format,
                    "mode": img.mode,
                    "size": f"{img.width}x{img.height}"
                }
        except Exception as e:
            meta = {"error": str(e)}
        return meta

    @classmethod
    def crop_evidence_region(cls, image_path: str, bbox: Dict[str, Any], label: str = "evidence") -> Optional[str]:
        settings.EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
        try:
            img = Image.open(image_path)
            w, h = img.size
            x1 = max(0, int(bbox.get("x1", 0)))
            y1 = max(0, int(bbox.get("y1", 0)))
            x2 = min(w, int(bbox.get("x2", w)))
            y2 = min(h, int(bbox.get("y2", h)))

            if x2 <= x1 or y2 <= y1:
                return None

            pad = 10
            crop = img.crop((max(0, x1 - pad), max(0, y1 - pad), min(w, x2 + pad), min(h, y2 + pad)))
            crop_id = str(uuid.uuid4())
            crop_filename = f"crop_{crop_id}.png"
            crop_path = settings.EVIDENCE_DIR / crop_filename
            crop.save(str(crop_path))
            return str(crop_path)
        except Exception as e:
            print(f"Error cropping: {e}")
            return None

    @classmethod
    def analyze_document(cls, document_id: str, original_path: str, rendered_page_path: str) -> List[Dict[str, Any]]:
        observations = []
        if rendered_page_path and os.path.exists(rendered_page_path):
            ela_path, anomaly_score, max_box = cls.perform_error_level_analysis(rendered_page_path)
            desc = "Standard uniform compression gradient across page surface."
            if anomaly_score > 0.40:
                desc = (
                    f"Noticeable compression gradient differential detected (Anomaly Score: {anomaly_score:.2f}). "
                    f"Localized pixel density variance suggests potential recompression, spliced text, or visual alteration."
                )

            evidence_crop = None
            if anomaly_score > 0.35 and max_box:
                evidence_crop = cls.crop_evidence_region(rendered_page_path, max_box, "ela_anomaly")

            observations.append({
                "id": str(uuid.uuid4()),
                "document_id": document_id,
                "page_number": 1,
                "technique": "Error Level Analysis (ELA)",
                "description": desc,
                "anomaly_score": anomaly_score,
                "bounding_box": max_box,
                "evidence_crop_path": evidence_crop or ela_path,
                "ela_image_path": ela_path,
                "limitations": "ELA variance is an investigative indicator, not conclusive proof."
            })

        meta = cls.inspect_metadata(original_path)
        meta_desc = f"Document metadata extracted. Producer: {meta.get('producer', 'N/A')}, Creator: {meta.get('creator', 'N/A')}."
        sus_editors = ["photoshop", "gimp", "canva", "pixlr"]
        prod_str = str(meta.get("producer", "")).lower() + " " + str(meta.get("creator", "")).lower()
        found_editor = any(ed in prod_str for ed in sus_editors)
        
        observations.append({
            "id": str(uuid.uuid4()),
            "document_id": document_id,
            "page_number": 1,
            "technique": "Metadata Provenance Inspection",
            "description": meta_desc + (" (Software signature associated with image editor detected)" if found_editor else ""),
            "anomaly_score": 0.65 if found_editor else 0.05,
            "bounding_box": None,
            "evidence_crop_path": None,
            "ela_image_path": None,
            "limitations": "Metadata can be stripped or modified during file export."
        })

        return observations
