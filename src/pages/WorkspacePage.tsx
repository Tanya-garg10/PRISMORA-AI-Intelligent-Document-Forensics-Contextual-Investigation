import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, ShieldAlert, Sparkles, Network, ArrowLeft, Play, 
  CheckCircle, AlertTriangle, XCircle, Search, Layers, Clock, 
  Download, Eye, UserCheck, RefreshCw, FileSearch
} from 'lucide-react';
import { getInvestigation, runInvestigationPipeline, generateReport, reviewFinding } from '../services/api';
import type { Finding } from '../types';

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const autoRunStarted = useRef(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'findings' | 'documents' | 'matrix' | 'agent'>('findings');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: investigation, isLoading, isError, refetch } = useQuery({
    queryKey: ['investigation', id],
    queryFn: () => getInvestigation(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PROCESSING' ? 2500 : false;
    }
  });

  const runPipelineMutation = useMutation({
    mutationFn: () => runInvestigationPipeline(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigation', id] });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: () => generateReport(id!),
  });

  useEffect(() => {
    if (
      searchParams.get('autoRun') !== 'true' ||
      !investigation ||
      autoRunStarted.current
    ) return;

    if (investigation.status === 'PROCESSING') {
      autoRunStarted.current = true;
      setSearchParams((current) => {
        current.delete('autoRun');
        return current;
      }, { replace: true });
      return;
    }

    if (runPipelineMutation.isPending) return;

    autoRunStarted.current = true;
    setSearchParams((current) => {
      current.delete('autoRun');
      return current;
    }, { replace: true });

    if (investigation.documents?.length) {
      runPipelineMutation.mutate();
    }
  }, [investigation, runPipelineMutation.isPending, runPipelineMutation.mutate, searchParams, setSearchParams]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent mb-4"></div>
        <p className="text-slate-600 font-medium">Loading forensic workspace...</p>
      </div>
    );
  }

  if (isError || !investigation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Investigation Not Found</h2>
        <p className="text-slate-600 mb-6">The investigation case file could not be retrieved.</p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const findings = investigation.findings || [];
  const documents = investigation.documents || [];
  const agentActions = investigation.agent_actions || [];

  // Filtered findings
  const filteredFindings = findings.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && (f.review_status || f.status) !== statusFilter) return false;
    return true;
  });

  // Calculate high-risk count
  const highRiskCount = findings.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL').length;
  const verifiedCount = findings.filter(f => (f.review_status || f.status) === 'VERIFIED_ANOMALY').length;
  const matrixFieldNames = Array.from(new Set(
    documents.flatMap((document) => (document.extracted_fields || []).map((field) => field.field_name))
  )).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Header */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Cases
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-600">Investigation record</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{investigation.title}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                investigation.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                investigation.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                'bg-slate-200 text-slate-700'
              }`}>
                {investigation.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">{investigation.description || 'Forensic examination across multi-source dossier.'}</p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => runPipelineMutation.mutate()}
              disabled={runPipelineMutation.isPending || investigation.status === 'PROCESSING'}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-violet-600 text-white shadow-sm hover:bg-violet-700 transition disabled:opacity-50"
            >
              {runPipelineMutation.isPending || investigation.status === 'PROCESSING' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Dossier...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Full Pipeline
                </>
              )}
            </button>
            <Link
              to={`/investigations/${investigation.id}/graph`}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-700 shadow-sm transition"
            >
              <Network className="w-4 h-4 mr-2 text-violet-600" />
              Graph View
            </Link>

            <Link
              to={`/investigations/${investigation.id}/evidence`}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-700 shadow-sm transition"
            >
              <Eye className="w-4 h-4 mr-2 text-blue-600" />
              Evidence Explorer
            </Link>

            <button
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {generateReportMutation.isPending ? 'Generating...' : 'PDF Dossier'}
            </button>
          </div>
          {generateReportMutation.isError && (
            <p className="mt-3 text-xs text-rose-600" role="alert">
              Report failed: {generateReportMutation.error instanceof Error ? generateReportMutation.error.message : 'Unknown report error'}
            </p>
          )}
        </div>
        {runPipelineMutation.isError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            Analysis failed: {runPipelineMutation.error instanceof Error ? runPipelineMutation.error.message : 'Unknown pipeline error'}
          </div>
        )}
      </div>

      {/* Investigation Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents Ingested</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{documents.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Originals hashed (SHA-256)</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potential Findings</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{findings.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">For human review</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">High / Critical Flags</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{highRiskCount}</div>
          <div className="text-xs text-rose-500/80 mt-0.5">Prioritized for review</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Human Verified</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</div>
          <div className="text-xs text-emerald-600/80 mt-0.5">Audited by Investigator</div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="border-b border-slate-200 mb-6 overflow-x-auto">
        <nav className="flex min-w-max space-x-6">
          <button
            onClick={() => setActiveTab('findings')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'findings'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Overview ({findings.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'documents'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Visual Forensics ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'matrix'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Extracted Data
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'agent'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Context Analysis ({agentActions.length})
          </button>
          <Link
            to={`/investigations/${investigation.id}/evidence`}
            className="pb-3 text-sm font-bold flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-900 transition"
          >
            <FileSearch className="w-4 h-4" />
            Evidence
          </Link>
        </nav>
      </div>

      {/* Tab 1: Findings & Discrepancies */}
      {activeTab === 'findings' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
            <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Severity:</span>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                      severityFilter === s
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Review Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'UNREVIEWED', 'VERIFIED_ANOMALY', 'DISMISSED_BENIGN', 'NEEDS_MORE_INFO'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      statusFilter === st
                        ? 'bg-violet-700 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Discrepancies In Filter</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                No findings match the current filter selection, or the forensic pipeline has not detected anomalies in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <FindingCard 
                  key={finding.id} 
                  finding={finding} 
                  investigationId={investigation.id}
                  documents={documents}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Document Inventory */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-600 shrink-0" />
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-[200px]" title={doc.filename}>
                      {doc.filename}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-violet-100 text-violet-800">
                    {doc.document_type || 'UNCLASSIFIED'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Pages:</span>
                    <span className="font-semibold">{doc.page_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">OCR Confidence:</span>
                    <span className="font-semibold">{doc.ocr_confidence ? `${Math.round(doc.ocr_confidence * 100)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SHA-256 (Audit Seal):</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]" title={doc.sha256}>
                      {doc.sha256?.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                {doc.pages && doc.pages[0]?.rendered_image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 mb-4 group">
                    <img 
                      src={doc.pages[0].rendered_image_url}
                      alt={doc.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                      <span className="text-xs text-white font-medium flex items-center">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View in Evidence Explorer
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/investigations/${investigation.id}/evidence?doc=${doc.id}`}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-center bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200 transition"
              >
                Inspect Page Layers & ELA
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Extracted Field Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Cross-Document Field Alignment Matrix</h3>
              <p className="text-xs text-slate-500">Side-by-side comparison of extracted fields across submitted documents.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Standard Field</th>
                  {documents.map(d => (
                    <th key={d.id} className="p-3.5 border-l border-slate-200">
                      <div className="font-bold text-slate-900 truncate max-w-[150px]">{d.filename}</div>
                      <div className="text-[10px] text-violet-600 font-normal">{d.document_type}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixFieldNames.map((fieldKey) => {
                  return (
                    <tr key={fieldKey} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-700 capitalize bg-slate-50/40">
                        {fieldKey.replace(/_/g, ' ')}
                      </td>
                      {documents.map(d => {
                        const match = d.extracted_fields?.find(f => f.field_name === fieldKey);
                        return (
                          <td key={d.id} className="p-3.5 border-l border-slate-200">
                            {match ? (
                              <div>
                                <span className="font-semibold text-slate-900">{match.raw_value}</span>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  conf: {match.confidence ? `${Math.round(match.confidence * 100)}%` : 'N/A'} (pg {match.page_number})
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300 italic">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Bounded AI Agent Action Log */}
      {activeTab === 'agent' && (
        <div className="space-y-4">
          <div className="bg-linear-to-r from-violet-900 to-indigo-900 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-300" />
                <h3 className="font-bold text-lg">Bounded Forensic Investigation Agent</h3>
              </div>
              <p className="text-xs text-violet-200 mt-1 max-w-2xl">
                Execution lifecycle follows strict state machine: <span className="font-mono text-white">OBSERVE → PLAN → INVESTIGATE → CORRELATE → EXPLAIN → REVIEW</span>.
                Capped at max 15 tool executions with strict auditability.
              </p>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono">
              Tool Budget: {agentActions.length} / 15 Used
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="relative border-l-2 border-violet-200 ml-4 space-y-6 py-2">
              {agentActions.map((action, idx) => (
                <div key={action.id || idx} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-violet-600 border-2 border-white ring-2 ring-violet-200" />
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-violet-100 text-violet-800 font-mono">
                          STEP {action.step_number}: {action.action_type}
                        </span>
                        {action.tool_name && (
                          <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            tool: {action.tool_name}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(action.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 mb-2 font-medium">{action.reasoning}</p>

                    {action.tool_output && (
                      <div className="mt-2 bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-36">
                        <pre>{typeof action.tool_output === 'string' ? action.tool_output : JSON.stringify(action.tool_output, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding, investigationId, documents }: { finding: Finding; investigationId: string; documents: any[] }) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleDecision = async (newStatus: 'VERIFIED_ANOMALY' | 'DISMISSED_BENIGN' | 'NEEDS_MORE_INFO') => {
    setIsUpdating(true);
    setReviewError(null);
    try {
      await reviewFinding(finding.id, newStatus, 'Updated status via Forensic Workspace triage.');
      await queryClient.invalidateQueries({ queryKey: ['investigation', investigationId] });
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Failed to save review decision.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED_ANOMALY':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'DISMISSED_BENIGN':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'NEEDS_MORE_INFO':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-violet-300 transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${getSeverityBadge(finding.severity)}`}>
              {finding.severity}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
              {finding.category || finding.finding_type || 'Finding'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(finding.review_status || finding.status || 'UNREVIEWED')}`}>
              {(finding.review_status || finding.status || 'UNREVIEWED').replace(/_/g, ' ')}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900">{finding.title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">Evidence items</div>
            <div className="text-sm font-black text-slate-900">{finding.evidence_items?.length || 0}</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">{finding.explanation}</p>

      {/* Discrepancy Values Box */}
      {/* Action footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Triage Decision:</span>
          <button
            onClick={() => handleDecision('VERIFIED_ANOMALY')}
            disabled={isUpdating}
            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold transition disabled:opacity-50"
          >
            Confirm Anomaly
          </button>
          <button
            onClick={() => handleDecision('DISMISSED_BENIGN')}
            disabled={isUpdating}
            className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Dismiss as Benign
          </button>
          <button
            onClick={() => handleDecision('NEEDS_MORE_INFO')}
            disabled={isUpdating}
            className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Needs Info
          </button>
        </div>

        {reviewError && <p className="w-full text-xs text-rose-600" role="alert">{reviewError}</p>}

        <Link
          to={`/investigations/${investigationId}/evidence`}
          className="text-violet-600 hover:text-violet-800 font-bold flex items-center gap-1"
        >
          View Evidence Coordinates <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
