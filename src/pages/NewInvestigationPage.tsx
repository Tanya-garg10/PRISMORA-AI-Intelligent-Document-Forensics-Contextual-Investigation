import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';

export const NewInvestigationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSeed = searchParams.get('seed') || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSeed, setSelectedSeed] = useState<string>(initialSeed);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incoming: File[]) => {
    const valid: File[] = [];
    const rejected: string[] = [];
    for (const file of incoming) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'png', 'jpg', 'jpeg'].includes(extension || '')) {
        rejected.push(`${file.name}: unsupported format`);
      } else if (file.size > 25 * 1024 * 1024) {
        rejected.push(`${file.name}: exceeds 25 MB`);
      } else {
        valid.push(file);
      }
    }
    setFiles((previous) => [...previous, ...valid]);
    setError(rejected.length ? `Skipped file(s): ${rejected.join(', ')}` : null);
  };

  useEffect(() => {
    if (selectedSeed === 'CASE_001') {
      setTitle('Case 001 — Financial Salary Discrepancy Investigation');
      setDescription('Auditing mortgage loan application against employer pay stubs, bank statements, and IRS W-2 records.');
    } else if (selectedSeed === 'CASE_002') {
      setTitle('Case 002 — Residential Domicile Contradiction Audit');
      setDescription('Cross-document verification of primary address between application, utility bills, and residential lease agreement.');
    } else if (selectedSeed === 'CASE_003') {
      setTitle('Case 003 — Commercial Invoice Visual Tampering & ELA');
      setDescription('Forensic visual inspection of suspected digital splice on vendor invoice INV-2026-8829.');
    }
  }, [selectedSeed]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Investigation title is required.');
      return;
    }

    if (!selectedSeed && files.length === 0) {
      setError('Please select a synthetic benchmark case or upload at least one document.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create investigation
      const inv = await api.createInvestigation({
        title,
        description,
        seed_case: selectedSeed || undefined,
      });

      // If user uploaded custom files in addition to or instead of seed
      if (files.length > 0) {
        await api.uploadDocuments(inv.id, files);
      }

      // Automatically redirect to workspace and trigger initial analysis
      navigate(`/investigations/${inv.id}?autoRun=true`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize investigation');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Initiate New Investigation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload multi-document packages for automated OCR extraction, visual forensic analysis, and contextual intelligence.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Case Metadata */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">1. Case Identification</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Investigation Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Loan Dossier Audit — Alex Mercer"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description & Investigation Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add contextual notes, claimed identities, or specific compliance flags..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>
        </div>

        {/* 1-Click Benchmark Selector */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-sky-50/40 border border-violet-100 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900">2. Sample Investigation Cases</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Select one of the controlled synthetic forensic cases to test deterministic cross-document reconciliation and visual ELA.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'CASE_001', name: 'Case 001: Financial Discrepancy', detail: '4 Documents ($12.5k declared vs $9.2k pay stub)' },
              { id: 'CASE_002', name: 'Case 002: Address Inconsistency', detail: '4 Documents (Springfield vs Eugene domicile)' },
              { id: 'CASE_003', name: 'Case 003: Visual Invoice Splicing', detail: '4 Documents ($14.5k PO vs $41.5k altered invoice)' },
            ].map((c) => {
              const isSelected = selectedSeed === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelectedSeed(isSelected ? '' : c.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all active:scale-98 ${
                    isSelected
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-violet-200' : 'text-violet-600'}`}>
                      {c.id}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <h4 className="text-xs font-bold leading-snug">{c.name}</h4>
                  <p className={`text-[11px] mt-1 ${isSelected ? 'text-violet-100' : 'text-slate-500'}`}>{c.detail}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Upload Area */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">3. Custom Document Upload (Optional if using Benchmark)</h2>
            <span className="text-xs text-slate-400">PDF, PNG, JPG (Max 25MB each)</span>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragOver ? 'border-violet-500 bg-violet-50/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Drag & drop document files here</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Upload multiple PDFs or images to analyze together</p>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 cursor-pointer transition-colors shadow-2xs">
              <span>Browse Files</span>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">Selected Files ({files.length}):</span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {files.map((file, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-violet-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all active:scale-98 disabled:opacity-50"
          >
            <span>{submitting ? 'Creating Case & Ingesting...' : 'Create Case & Launch Pipeline'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewInvestigationPage;
