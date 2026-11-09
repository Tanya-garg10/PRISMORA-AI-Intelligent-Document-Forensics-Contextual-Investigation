export interface Investigation {
  id: string;
  title: string;
  description?: string;
  status: 'CREATED' | 'PROCESSING' | 'ANALYZED' | 'REVIEW_REQUIRED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  document_count?: number;
  finding_count?: number;
  critical_findings_count?: number;
  pending_review_count?: number;
  human_verdict?: string;
  review_notes?: string;
  agent_summary?: string;
  documents?: DocumentItem[];
  findings?: Finding[];
  agent_actions?: AgentAction[];
}

export interface DocumentPage {
  id: string;
  document_id: string;
  page_number: number;
  rendered_image_url?: string;
  ela_image_url?: string;
  raw_text?: string;
  width?: number;
  height?: number;
  ocr_confidence?: number;
  created_at?: string;
}

export interface DocumentItem {
  id: string;
  investigation_id: string;
  investigation_title?: string;
  filename: string;
  file_type?: string;
  file_size_bytes?: number;
  sha256?: string;
  document_type: string;
  classification_confidence?: number;
  ocr_confidence?: number;
  page_count: number;
  status?: string;
  created_at: string;
  pages?: DocumentPage[];
  extracted_fields?: ExtractedField[];
  observations?: ForensicObservation[];
  rendered_image_url?: string;
}

export type Document = DocumentItem;

export interface ExtractedField {
  id: string;
  document_id: string;
  page_number: number;
  field_name: string;
  field_value?: string;
  raw_value?: string;
  normalized_value?: string;
  field_type?: string;
  confidence?: number;
  confidence_score?: number;
  bounding_box?: number[] | {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface ForensicObservation {
  id: string;
  document_id: string;
  page_number: number;
  technique: string;
  description: string;
  anomaly_score?: number;
  bounding_box?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null;
  evidence_crop_url?: string;
  ela_image_url?: string;
  limitations?: string;
  created_at?: string;
}

export interface FindingEvidence {
  id: string;
  finding_id: string;
  document_id: string;
  evidence_type?: string;
  reference_field_id?: string;
  label?: string;
  evidence_data?: Record<string, any>;
  image_url?: string;
  page_number?: number;
  observation?: ForensicObservation;
}

export interface Finding {
  id: string;
  investigation_id: string;
  category?: string;
  finding_type?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  grade?: 'OBSERVATION' | 'POTENTIAL_ANOMALY' | 'CONFIRMED_FACT';
  title: string;
  description?: string;
  explanation?: string;
  observed_value?: string;
  expected_value?: string;
  confidence_score?: number;
  alternative_explanations?: string[];
  recommended_actions?: string[];
  human_review_required?: boolean;
  status?: 'UNREVIEWED' | 'VERIFIED_ANOMALY' | 'DISMISSED_BENIGN' | 'NEEDS_MORE_INFO';
  review_status?: 'UNREVIEWED' | 'VERIFIED_ANOMALY' | 'DISMISSED_BENIGN' | 'NEEDS_MORE_INFO';
  reviewer_notes?: string;
  created_at: string;
  evidence?: FindingEvidence[];
  evidence_items?: FindingEvidence[];
}

export interface AgentAction {
  id: string;
  investigation_id?: string;
  step_number: number;
  action_type: 'OBSERVE' | 'PLAN' | 'INVESTIGATE' | 'TOOL_CALL' | 'CORRELATE' | 'EXPLAIN' | 'REVIEW';
  tool_name?: string;
  observation_summary?: string;
  tool_input?: Record<string, any>;
  tool_output?: Record<string, any> | string;
  reasoning?: string;
  created_at: string;
}

export interface GraphNode {
  id: string;
  label?: string;
  type: 'document' | 'entity' | 'finding' | string;
  position?: { x: number; y: number };
  metadata?: Record<string, any>;
  data?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship_type?: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SystemHealth {
  status: string;
  app_name?: string;
  version?: string;
  gemini_configured: boolean;
  gemini_model?: string;
  ocr_engine?: string;
  database?: {
    status?: string;
    type?: string;
    investigation_count?: number;
    document_count?: number;
    finding_count?: number;
  } | string;
  storage?: {
    originals_dir?: string;
    rendered_dir?: string;
    evidence_dir?: string;
  };
}
