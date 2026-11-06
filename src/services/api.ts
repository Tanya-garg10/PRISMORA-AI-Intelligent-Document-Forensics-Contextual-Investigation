import {
  Investigation,
  DocumentItem,
  ExtractedField,
  Finding,
  GraphData,
  SystemHealth
} from '../types';

export const listInvestigations = async (): Promise<Investigation[]> => {
  const res = await fetch('/api/investigations');
  if (!res.ok) throw new Error('Failed to fetch investigations');
  return res.json();
};
export const getInvestigations = listInvestigations;

export const getInvestigation = async (id: string): Promise<Investigation> => {
  const res = await fetch(`/api/investigations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch investigation');
  return res.json();
};

export const createInvestigation = async (title: string, description?: string, seed_case?: string): Promise<Investigation> => {
  const res = await fetch('/api/investigations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, seed_case }),
  });
  if (!res.ok) throw new Error('Failed to create investigation');
  return res.json();
};

export const uploadDocuments = async (investigationId: string, files: File[]): Promise<DocumentItem[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const res = await fetch(`/api/investigations/${investigationId}/documents`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload documents');
  }
  return res.json();
};

export const uploadDocument = async (investigationId: string, file: File): Promise<DocumentItem> => {
  const items = await uploadDocuments(investigationId, [file]);
  return items[0];
};

export const runInvestigationPipeline = async (investigationId: string): Promise<Investigation> => {
  const res = await fetch(`/api/investigations/${investigationId}/analyze`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis pipeline failed');
  }
  return res.json();
};
export const runAnalysis = runInvestigationPipeline;

export const listDocuments = async (investigationId: string): Promise<DocumentItem[]> => {
  const res = await fetch(`/api/investigations/${investigationId}/documents`);
  if (!res.ok) throw new Error('Failed to list documents');
  return res.json();
};

export const getDocument = async (documentId: string): Promise<DocumentItem> => {
  const res = await fetch(`/api/documents/${documentId}`);
  if (!res.ok) throw new Error('Failed to get document');
  return res.json();
};

export const getDocumentFields = async (documentId: string): Promise<ExtractedField[]> => {
  const res = await fetch(`/api/documents/${documentId}/fields`);
  if (!res.ok) throw new Error('Failed to fetch document fields');
  return res.json();
};

export const getFindings = async (investigationId: string): Promise<Finding[]> => {
  const res = await fetch(`/api/investigations/${investigationId}/findings`);
  if (!res.ok) throw new Error('Failed to fetch findings');
  return res.json();
};

export const reviewFinding = async (
  findingId: string, 
  decision: 'VERIFIED_ANOMALY' | 'DISMISSED_BENIGN' | 'NEEDS_MORE_INFO', 
  notes?: string
): Promise<Finding> => {
  const res = await fetch(`/api/findings/${findingId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_decision: decision, notes }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
};

export const getInvestigationGraph = async (investigationId: string): Promise<GraphData> => {
  const res = await fetch(`/api/investigations/${investigationId}/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph data');
  return res.json();
};
export const getGraph = getInvestigationGraph;

export const generateReport = async (investigationId: string): Promise<{ download_url: string; filename: string }> => {
  const res = await fetch(`/api/investigations/${investigationId}/report`);
  if (!res.ok) throw new Error('Failed to generate report');
  return {
    download_url: `/api/investigations/${investigationId}/report`,
    filename: `PRISMORA_Dossier_${investigationId.slice(0, 8)}.pdf`
  };
};

export const getReportDownloadUrl = (investigationId: string): string => {
  return `/api/investigations/${investigationId}/report`;
};

export const checkHealth = async (): Promise<SystemHealth> => {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Failed to fetch system health');
  return res.json();
};
export const getHealth = checkHealth;

// Backwards-compatible api namespace
export const api = {
  listInvestigations,
  getInvestigation,
  createInvestigation: (data: { title: string; description?: string; seed_case?: string }) => 
    createInvestigation(data.title, data.description, data.seed_case),
  uploadDocuments,
  uploadDocument,
  runAnalysis,
  runInvestigationPipeline,
  listDocuments,
  getDocument,
  getDocumentFields,
  getFindings,
  reviewFinding,
  getGraph,
  getInvestigationGraph,
  getReportDownloadUrl,
  generateReport,
  getHealth,
  checkHealth,
};
