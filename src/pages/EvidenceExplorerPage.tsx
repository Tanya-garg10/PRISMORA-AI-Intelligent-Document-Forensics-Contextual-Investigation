import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Layers, Eye, ShieldAlert, CheckCircle, Fingerprint,
  AlertTriangle, ZoomIn, ZoomOut, RotateCcw, 
  FileText, Sliders, CheckSquare, MessageSquare, Tag
} from 'lucide-react';
import { getInvestigation, getInvestigations, reviewFinding } from '../services/api';
import type { Document, DocumentPage, ForensicObservation, Finding } from '../types';

export default function EvidenceExplorerPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const selectedDocId = searchParams.get('doc');
  const { data: investigations = [], isLoading: isLoadingCases, isError: isCasesError, error: casesError } = useQuery({
    queryKey: ['investigations'],
    queryFn: getInvestigations,
    enabled: !id,
  });
  const activeId = id || investigations[0]?.id;
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [showEla, setShowEla] = useState(false);
  const [elaOpacity, setElaOpacity] = useState(70);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Human review modal state
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'VERIFIED_ANOMALY' | 'DISMISSED_BENIGN' | 'NEEDS_MORE_INFO'>('VERIFIED_ANOMALY');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { data: investigation, isLoading, isError } = useQuery({
    queryKey: ['investigation', activeId],
    queryFn: () => getInvestigation(activeId!),
    enabled: !!activeId,
  });

  if (isLoading || (!id && isLoadingCases)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-600 border-t-transparent mb-4"></div>
        <p className="text-slate-600 font-medium">Loading Evidence Explorer & Multi-Layer Visuals...</p>
      </div>
    );
  }

  if (!id && isCasesError) {
    return (
      <div className="app-content">
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          Could not load investigations: {casesError instanceof Error ? casesError.message : 'Unknown API error'}
        </p>
      </div>
    );
  }

  if (!id && investigations.length === 0) {
    return (
      <div className="app-content">
        <div className="panel-card px-6 py-16 text-center">
          <Fingerprint className="mx-auto h-10 w-10 text-violet-500" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Evidence Explorer</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Create an investigation and analyze its documents to review source pages and visual evidence.</p>
          <Link to="/investigations/new" className="button-primary mx-auto mt-5">Start an investigation</Link>
        </div>
      </div>
    );
  }

  if (isError || !investigation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Investigation Not Found</h2>
        <Link to="/dashboard" className="text-violet-600 font-bold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const documents = investigation.documents || [];
  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const pages = currentDoc?.pages || [];
  const currentPage = pages[selectedPageIndex] || pages[0];

  const forensicObservations: ForensicObservation[] = (currentDoc?.observations || [])
    .filter((observation) => observation.page_number === currentPage?.page_number);

  const docFindings = (investigation.findings || []).filter((finding) =>
    (finding.evidence_items || []).some((evidence) => evidence.document_id === currentDoc?.id)
  );

  const handleDocumentChange = (docId: string) => {
    setSearchParams({ doc: docId });
    setSelectedPageIndex(0);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFinding) return;

    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await reviewFinding(selectedFinding.id, reviewDecision, reviewNotes);
      await queryClient.invalidateQueries({ queryKey: ['investigation', activeId] });
      setSelectedFinding(null);
      setReviewNotes('');
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Failed to save review decision.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Link to={`/investigations/${investigation.id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Workspace
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">PixelTrace Evidence Explorer</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 uppercase">
              Forensic Inspection
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ELA difference visualizations and source-page coordinate overlays. These indicators require human interpretation.
          </p>
        </div>

        {/* Document Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {documents.map((doc: any) => (
            <button
              key={doc.id}
              onClick={() => handleDocumentChange(doc.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                doc.id === currentDoc?.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span className="truncate max-w-[140px]">{doc.filename}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Pane Inspection View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Canvas & Overlays (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEla(!showEla)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  showEla 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                {showEla ? 'ELA Heatmap Active' : 'Enable ELA Overlay'}
              </button>

              {showEla && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Opacity:</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={elaOpacity}
                    onChange={(e) => setElaOpacity(Number(e.target.value))}
                    className="w-20 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-slate-600 font-mono w-8">{elaOpacity}%</span>
                </div>
              )}
            </div>

            {/* Page navigation & Zoom */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              {pages.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {pages.map((_, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setSelectedPageIndex(pIdx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        pIdx === selectedPageIndex
                          ? 'bg-white shadow-xs text-slate-900'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Pg {pIdx + 1}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 20))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-500 w-10 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 20))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 min-h-[560px] flex items-center justify-center overflow-auto relative shadow-inner">
            {currentPage?.rendered_image_url ? (
              <div 
                className="relative transition-all duration-150 inline-block rounded shadow-2xl overflow-hidden"
                style={{ width: `${zoomLevel}%`, maxWidth: 'none' }}
              >
                {/* Base Rendered Page */}
                <img
                  src={currentPage.rendered_image_url}
                  alt={`Document page ${selectedPageIndex + 1}`}
                  className="w-full h-auto block select-none"
                />

                {/* ELA Overlay Layer */}
                {showEla && currentPage.ela_image_url && (
                  <img
                    src={currentPage.ela_image_url}
                    alt="Error Level Analysis heatmap"
                    className="absolute inset-0 w-full h-auto pointer-events-none mix-blend-color-dodge"
                    style={{ opacity: elaOpacity / 100 }}
                  />
                )}

                {/* Highlighted bounding boxes from findings if present */}
                {forensicObservations.map((obs, idx) => {
                  if (!obs.bounding_box) return null;
                  const { x1, y1, x2, y2 } = obs.bounding_box;
                  const pageWidth = currentPage.width || 1;
                  const pageHeight = currentPage.height || 1;
                  return (
                    <div
                      key={obs.id || idx}
                      className="absolute border-2 border-rose-500 bg-rose-500/20 rounded pointer-events-none transition"
                      style={{
                        top: `${(y1 / pageHeight) * 100}%`,
                        left: `${(x1 / pageWidth) * 100}%`,
                        width: `${((x2 - x1) / pageWidth) * 100}%`,
                        height: `${((y2 - y1) / pageHeight) * 100}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 bg-rose-600 text-white font-mono text-[9px] px-1 py-0.5 rounded shadow">
                        {obs.technique}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-500 p-12">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No rendered visual available for this document.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Forensic Breakdown & Human Review (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Document Technical Dossier */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-600" />
              Document Forensics Metadata
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Classified Type:</span>
                <span className="font-bold text-violet-700">{currentDoc?.document_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Total Pages:</span>
                <span className="font-semibold text-slate-800">{currentDoc?.page_count}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">OCR Confidence:</span>
                <span className="font-semibold text-slate-800">
                  {currentDoc?.ocr_confidence ? `${Math.round(currentDoc.ocr_confidence * 100)}%` : 'N/A'}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-0.5">SHA-256 Custody Hash:</span>
                <span className="font-mono text-[10px] text-slate-600 bg-slate-50 p-1 rounded block break-all">
                  {currentDoc?.sha256}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Extracted Text</h3>
            <pre className="text-xs text-slate-600 whitespace-pre-wrap max-h-48 overflow-auto">
              {currentPage?.raw_text || 'No text has been extracted from this page yet.'}
            </pre>
            {!!currentDoc?.extracted_fields?.length && (
              <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
                {currentDoc.extracted_fields
                  .filter((field) => field.page_number === currentPage?.page_number)
                  .map((field) => (
                    <div key={field.id} className="flex justify-between gap-3 text-xs">
                      <span className="text-slate-500">{field.field_name.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-slate-800 text-right">{field.raw_value}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Associated Findings on this Document */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Findings in Document ({docFindings.length})
              </span>
            </h3>

            {docFindings.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No anomalies detected specifically on this document.</p>
            ) : (
              <div className="space-y-3">
                {docFindings.map((f: any) => (
                  <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {f.severity}
                      </span>
                      <button
                        onClick={() => setSelectedFinding(f)}
                        className="text-violet-600 hover:text-violet-800 font-bold flex items-center gap-1"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Triage Review
                      </button>
                    </div>
                    <div className="font-bold text-slate-900 mb-1">{f.title}</div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{f.description}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Status: <strong className="text-slate-700">{(f.review_status || 'UNREVIEWED').replace(/_/g, ' ')}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PixelTrace Observations Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              PixelTrace Observations ({forensicObservations.length})
            </h3>
            {forensicObservations.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No visual anomalies detected by PixelTrace on this page.</p>
            ) : (
              <div className="space-y-2.5">
                {forensicObservations.map((obs, idx) => (
                  <div key={obs.id || idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-700">{obs.technique}</span>
                      <span className="text-[10px] text-slate-400">score: {Math.round((obs.anomaly_score || 0) * 100)}%</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{obs.description}</p>
                    {obs.evidence_crop_url && (
                      <a className="mt-2 inline-block text-violet-700 font-semibold" href={obs.evidence_crop_url} target="_blank" rel="noreferrer">
                        Open visual evidence
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Human Review Decision Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-1">Human-in-the-Loop Review</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit your formal forensic assessment for finding: <strong className="text-slate-800">{selectedFinding.title}</strong>
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Forensic Decision:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'VERIFIED_ANOMALY', label: 'Verified Anomaly', color: 'text-rose-700 bg-rose-50 border-rose-300' },
                    { id: 'DISMISSED_BENIGN', label: 'Dismiss as Benign', color: 'text-slate-700 bg-slate-100 border-slate-300' },
                    { id: 'NEEDS_MORE_INFO', label: 'Needs More Info', color: 'text-amber-700 bg-amber-50 border-amber-300' }
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setReviewDecision(opt.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition ${
                        reviewDecision === opt.id
                          ? `${opt.color} ring-2 ring-violet-500`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Investigator Rationale & Audit Notes:</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record the evidence and reasoning behind your review decision..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {reviewError && <p className="text-xs text-rose-600" role="alert">{reviewError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFinding(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Recording Decision...' : 'Commit Review Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
