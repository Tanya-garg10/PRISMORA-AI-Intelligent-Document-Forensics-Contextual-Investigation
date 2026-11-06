import re
import uuid
from typing import List, Dict, Any, Tuple
import fitz
from PIL import Image
import pytesseract

class OCRExtractionService:
    @classmethod
    def extract_page_text_and_blocks(cls, doc_path: str, page_idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        text = ""
        blocks = []
        try:
            if doc_path.lower().endswith(".pdf"):
                doc = fitz.open(doc_path)
                if page_idx < len(doc):
                    page = doc.load_page(page_idx)
                    text = page.get_text()
                    words = page.get_text("words")
                    for w in words:
                        blocks.append({
                            "word": w[4],
                            "bbox": {"x1": w[0], "y1": w[1], "x2": w[2], "y2": w[3]}
                        })
                doc.close()
            else:
                img = Image.open(doc_path)
                text = pytesseract.image_to_string(img)
                data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                n_boxes = len(data['text'])
                for i in range(n_boxes):
                    if data['text'][i].strip():
                        blocks.append({
                            "word": data['text'][i],
                            "bbox": {
                                "x1": data['left'][i],
                                "y1": data['top'][i],
                                "x2": data['left'][i] + data['width'][i],
                                "y2": data['top'][i] + data['height'][i]
                            }
                        })
        except Exception as e:
            print(f"OCR Extraction error: {e}")

        if len(text.strip()) < 20:
            try:
                text = pytesseract.image_to_string(Image.open(doc_path))
            except Exception:
                pass

        return text, blocks

    @classmethod
    def extract_structured_fields(cls, full_text: str, doc_type: str, page_num: int = 1) -> List[Dict[str, Any]]:
        fields = []

        def add_field(name: str, raw_val: str, norm_val: Any, f_type: str, conf: float = 0.95, bbox=None):
            fields.append({
                "id": str(uuid.uuid4()),
                "page_number": page_num,
                "field_name": name,
                "raw_value": str(raw_val).strip(),
                "normalized_value": str(norm_val),
                "field_type": f_type,
                "confidence": conf,
                "bounding_box": bbox
            })

        def clean_currency(val_str: str) -> float:
            cleaned = re.sub(r"[^\d.]", "", val_str)
            try:
                return float(cleaned)
            except ValueError:
                return 0.0

        # Names
        name_patterns = [
            (r"Full Legal Name:\s*([A-Za-z\s]+)", "applicant_name"),
            (r"Applicant Name:\s*([A-Za-z\s]+)", "applicant_name"),
            (r"Employee Name:\s*([A-Za-z\s]+)", "employee_name"),
            (r"Tenant Name:\s*([A-Za-z\s]+)", "tenant_name"),
            (r"Account Holder:\s*([A-Za-z\s]+)", "account_holder"),
            (r"Customer Name:\s*([A-Za-z\s]+)", "customer_name"),
        ]
        for pat, fname in name_patterns:
            m = re.search(pat, full_text, re.IGNORECASE)
            if m:
                name_clean = m.group(1).split("\n")[0].strip()
                if len(name_clean) > 2 and len(name_clean) < 40 and not re.search(r"SSN|Date|Department", name_clean):
                    add_field(fname, name_clean, name_clean, "person_name", 0.96)
                    break

        # Financial values
        m = re.search(r"Stated Gross Monthly Salary:\s*(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("stated_gross_monthly_salary", m.group(1), clean_currency(m.group(1)), "currency", 0.98)

        m = re.search(r"Annual Base Income:\s*(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("stated_annual_salary", m.group(1), clean_currency(m.group(1)), "currency", 0.98)

        m = re.search(r"Regular Base Salary\s+Monthly\s+(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if not m:
            m = re.search(r"Regular Base Salary[^\$]*(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("gross_monthly_salary", m.group(1), clean_currency(m.group(1)), "currency", 0.98)

        m = re.search(r"NET PAY DISTRIBUTION[^\$]*(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("net_monthly_pay", m.group(1), clean_currency(m.group(1)), "currency", 0.98)

        m = re.search(r"APEX DYNAMICS PAYROLL DIR DEP[^\+]*\+(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("payroll_direct_deposit_amount", m.group(1), clean_currency(m.group(1)), "currency", 0.98)

        m = re.search(r"1\s*Wages,\s*tips[^\$]*(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("total_annual_wages", m.group(1), clean_currency(m.group(1)), "currency", 0.98)

        m = re.search(r"TOTAL DUE[^\$]*(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("total_amount", m.group(1), clean_currency(m.group(1)), "currency", 0.96)

        m = re.search(r"Authorized Total Amount:\s*(\$[\d,]+\.?\d*)", full_text, re.IGNORECASE)
        if m:
            add_field("authorized_total", m.group(1), clean_currency(m.group(1)), "currency", 0.98)

        # Addresses
        addr_patterns = [
            (r"Residential Address:\s*([^\n\r]+(?:Ave|St|Street|Terrace|Way|Blvd|Road|Dr)[^\n\r]+)", "residential_address"),
            (r"Current Residential Address:\s*([^\n\r]+(?:Ave|St|Street|Terrace|Way|Blvd|Road|Dr)[^\n\r]+)", "residential_address"),
            (r"Service Location:\s*([^\n\r]+(?:Ave|St|Street|Terrace|Way|Blvd|Road|Dr)[^\n\r]+)", "service_address"),
            (r"Leased Premises[^\:]*:\s*([^\n\r]+(?:Ave|St|Street|Terrace|Way|Blvd|Road|Dr)[^\n\r]+)", "leased_premises"),
            (r"Primary Address on Corporate Record:\s*([^\n\r]+(?:Ave|St|Street|Terrace|Way|Blvd|Road|Dr)[^\n\r]+)", "address_on_file"),
        ]
        for pat, fname in addr_patterns:
            m = re.search(pat, full_text, re.IGNORECASE)
            if m:
                addr_clean = re.sub(r"<[^>]+>", "", m.group(1)).strip()
                addr_clean = re.split(r"(?:Years at|Housing Status|Monthly)", addr_clean)[0].strip()
                add_field(fname, addr_clean, addr_clean, "address", 0.95)

        # Dates & IDs
        for pat, fname in [(r"Submission Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", "submission_date"),
                           (r"Pay Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", "pay_date"),
                           (r"Bill Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", "bill_date"),
                           (r"Effective Term:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", "effective_date"),
                           (r"Issue Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", "issue_date"),
                           (r"Order Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", "order_date")]:
            m = re.search(pat, full_text, re.IGNORECASE)
            if m:
                add_field(fname, m.group(1), m.group(1), "date", 0.95)

        for pat, fname in [(r"Invoice Number:\s*([A-Z0-9\-]+)", "invoice_number"),
                           (r"PO Number:\s*([A-Z0-9\-]+)", "po_number"),
                           (r"Waybill Ref:\s*([A-Z0-9\-]+)", "manifest_number"),
                           (r"Application Ref:\s*([A-Z0-9\-]+)", "application_ref"),
                           (r"Account Number:\s*([A-Z0-9\-]+)", "account_number")]:
            m = re.search(pat, full_text, re.IGNORECASE)
            if m:
                add_field(fname, m.group(1), m.group(1), "id", 0.95)

        return fields
