from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="CREATED")  # CREATED, PROCESSING, ANALYZED, REVIEW_REQUIRED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    agent_summary = Column(Text, nullable=True)
    human_verdict = Column(String(50), nullable=True)  # PENDING, BENIGN, SUSPICIOUS, ESCALATED
    review_notes = Column(Text, nullable=True)

    documents = relationship("Document", back_populates="investigation", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="investigation", cascade="all, delete-orphan")
    agent_actions = relationship("AgentAction", back_populates="investigation", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    sha256 = Column(String(64), nullable=False, index=True)
    document_type = Column(String(100), default="unknown")
    classification_confidence = Column(Float, default=1.0)
    page_count = Column(Integer, default=1)
    status = Column(String(50), default="UPLOADED")
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    observations = relationship("ForensicObservation", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    rendered_image_path = Column(String(500), nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    raw_text = Column(Text, nullable=True)
    ocr_confidence_avg = Column(Float, default=1.0)

    document = relationship("Document", back_populates="pages")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, default=1)
    field_name = Column(String(100), nullable=False, index=True)
    raw_value = Column(Text, nullable=False)
    normalized_value = Column(Text, nullable=True)
    field_type = Column(String(50), default="text")
    confidence = Column(Float, default=1.0)
    bounding_box = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="fields")


class ForensicObservation(Base):
    __tablename__ = "forensic_observations"

    id = Column(String(36), primary_key=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, default=1)
    technique = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    anomaly_score = Column(Float, default=0.0)
    bounding_box = Column(JSON, nullable=True)
    evidence_crop_path = Column(String(500), nullable=True)
    ela_image_path = Column(String(500), nullable=True)
    limitations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="observations")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False)
    category = Column(String(100), nullable=False)
    severity = Column(String(50), default="MEDIUM")
    grade = Column(String(50), default="POTENTIAL_ANOMALY")
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    alternative_explanations = Column(JSON, nullable=True)
    recommended_actions = Column(JSON, nullable=True)
    human_review_required = Column(Boolean, default=True)
    review_status = Column(String(50), default="UNREVIEWED")
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="findings")
    evidence_items = relationship("FindingEvidence", back_populates="finding", cascade="all, delete-orphan")


class FindingEvidence(Base):
    __tablename__ = "finding_evidence"

    id = Column(String(36), primary_key=True)
    finding_id = Column(String(36), ForeignKey("findings.id"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    evidence_type = Column(String(50), nullable=False)
    reference_field_id = Column(String(36), nullable=True)
    reference_observation_id = Column(String(36), nullable=True)
    label = Column(String(255), nullable=False)
    evidence_data = Column(JSON, nullable=True)
    image_url = Column(String(500), nullable=True)
    page_number = Column(Integer, default=1)

    finding = relationship("Finding", back_populates="evidence_items")


class DocumentRelationship(Base):
    __tablename__ = "document_relationships"

    id = Column(String(36), primary_key=True)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False)
    source_id = Column(String(36), nullable=False)
    source_type = Column(String(50), nullable=False)
    target_id = Column(String(36), nullable=False)
    target_type = Column(String(50), nullable=False)
    relationship_type = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(String(36), primary_key=True)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    action_type = Column(String(50), nullable=False)
    tool_name = Column(String(100), nullable=True)
    tool_input = Column(JSON, nullable=True)
    tool_output = Column(JSON, nullable=True)
    reasoning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="agent_actions")


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(String(36), primary_key=True)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False)
    finding_id = Column(String(36), nullable=True)
    decision = Column(String(50), nullable=False)
    reviewer = Column(String(100), default="Investigator Analyst")
    rationale = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
