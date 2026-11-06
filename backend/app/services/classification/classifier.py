import re
from typing import Tuple

class DocumentClassifier:
    RULES = [
        ("loan_application", [r"loan application", r"mortgage", r"stated gross monthly salary", r"requested loan amount", r"applicant personal"], 0.95),
        ("credit_application", [r"credit application", r"cascade pacific capital", r"residential profile", r"credit line requested"], 0.95),
        ("pay_stub", [r"earnings statement", r"pay stub", r"regular base salary", r"net pay distribution", r"statutory deductions", r"ytd total"], 0.98),
        ("bank_statement", [r"account statement", r"premier checking", r"direct deposit", r"running balance", r"transaction history", r"branch code"], 0.95),
        ("tax_w2", [r"form w-2", r"wage and tax statement", r"internal revenue service", r"social security wages", r"medicare wages"], 0.98),
        ("utility_bill", [r"utility statement", r"power & light", r"service location", r"amount due", r"billing period"], 0.95),
        ("lease_agreement", [r"residential lease", r"leased premises", r"landlord", r"tenant name", r"monthly base rental"], 0.95),
        ("hr_verification", [r"human resources", r"verification letter", r"employed as", r"address on corporate record", r"annual base compensation"], 0.95),
        ("commercial_invoice", [r"commercial invoice", r"invoice number", r"billed to", r"remit payment to", r"total due"], 0.95),
        ("purchase_order", [r"purchase order", r"po number", r"authorized total", r"signatory", r"budget code"], 0.95),
        ("shipping_manifest", [r"delivery manifest", r"waybill ref", r"shipper", r"consignee", r"gross shipping weight"], 0.95),
    ]

    @classmethod
    def classify(cls, full_text: str) -> Tuple[str, float]:
        text_lower = full_text.lower()
        for doc_type, keywords, confidence in cls.RULES:
            match_count = sum(1 for kw in keywords if re.search(kw, text_lower))
            if match_count >= 2:
                return doc_type, confidence
            elif match_count == 1:
                return doc_type, 0.75
        return "unclassified_document", 0.50
