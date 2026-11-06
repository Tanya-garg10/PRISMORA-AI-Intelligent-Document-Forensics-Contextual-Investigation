from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class InvestigationCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    seed_case: Optional[str] = None

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    human_verdict: Optional[str] = None
    review_notes: Optional[str] = None

class ExtractedFieldResponse(BaseModel):
    id: str
    document_id: str
    page_number: int
    field_name: str
    raw_value: str
    normalized_value: Optional[str] = None
    field_type: str
    confidence: float
    bounding_box: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ForensicObservationResponse(BaseModel):
    id: str
    document_id: str
    page_number: int
    technique: str
    description: str
    anomaly_score: float
    bounding_box: Optional[Dict[str, Any]] = None
    evidence_crop_path: Optional[str] = None
    limitations: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    investigation_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    sha256: str
    document_type: str
    classification_confidence: float
    page_count: int
    status: str
    created_at: datetime
    rendered_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class FindingEvidenceResponse(BaseModel):
    id: str
    finding_id: str
    document_id: str
    evidence_type: str
    reference_field_id: Optional[str] = None
    label: str
    evidence_data: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    page_number: int

    class Config:
        from_attributes = True

class FindingResponse(BaseModel):
    id: str
    investigation_id: str
    category: str
    severity: str
    grade: str
    title: str
    explanation: str
    alternative_explanations: Optional[List[str]] = None
    recommended_actions: Optional[List[str]] = None
    human_review_required: bool
    review_status: str
    reviewer_notes: Optional[str] = None
    created_at: datetime
    evidence_items: List[FindingEvidenceResponse] = []

    class Config:
        from_attributes = True

class FindingReviewRequest(BaseModel):
    decision: str
    notes: Optional[str] = None
    reviewer: Optional[str] = "Investigator Analyst"

class AgentActionResponse(BaseModel):
    id: str
    step_number: int
    action_type: str
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[Dict[str, Any]] = None
    reasoning: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InvestigationResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    finding_count: int = 0
    critical_findings_count: int = 0
    human_verdict: Optional[str] = None
    agent_summary: Optional[str] = None

    class Config:
        from_attributes = True

class InvestigationDetailResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    agent_summary: Optional[str] = None
    human_verdict: Optional[str] = None
    review_notes: Optional[str] = None
    documents: List[DocumentResponse] = []
    findings: List[FindingResponse] = []
    agent_actions: List[AgentActionResponse] = []

    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, float]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: Optional[bool] = False
    style: Optional[Dict[str, Any]] = None

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
