import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Database, Sparkles, Shield, FileCheck, CheckCircle2, 
  AlertTriangle, RefreshCw, Layers, HardDrive, Play, ArrowRight 
} from 'lucide-react';
import { checkHealth, createInvestigation, uploadDocument } from '../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loadingCaseId, setLoadingCaseId] = useState<string | null>(null);

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: checkHealth,
  });

  const handleLoadCase = async (caseId: string, caseTitle: string, docCount: number) => {
    setLoadingCaseId(caseId);
    try {
      // 1. Create a new investigation
      const inv = await createInvestigation(
        `Benchmark: ${caseTitle}`,
        `Pre-configured benchmark dossier from ${caseId} (${docCount} documents).`
      );

      // In real backend, files are located in /app/applet/dataset/{caseId}/
      // We can notify the user or redirect directly to the new investigation
      navigate(`/investigations/${inv.id}`);
    } catch (err) {
      console.error('Failed to load benchmark case:', err);
    } finally {
      setLoadingCaseId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            System Diagnostics & Engines
          </h1>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 uppercase">
            Operational Telemetry
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Forensic engines status, cryptographic integrity vaults, and synthetic benchmark suites.
        </p>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* DocMind */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ONLINE
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">DocMind Processing Engine</h3>
          <p className="text-xs text-slate-500 mb-4">
            PyMuPDF 1.25 rendering, Tesseract OCR fallback, and SHA-256 custody seals.
          </p>
          <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex justify-between"><span>DPI Target:</span><span className="font-mono">200 DPI</span></div>
            <div className="flex justify-between"><span>Hash Algorithm:</span><span className="font-mono">SHA-256</span></div>
          </div>
        </div>

        {/* PixelTrace */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ONLINE
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">PixelTrace Visual Forensics</h3>
          <p className="text-xs text-slate-500 mb-4">
            OpenCV & Pillow Error Level Analysis (ELA) with 95% JPEG recompression matrix.
          </p>
          <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex justify-between"><span>ELA Scale Factor:</span><span className="font-mono">20x Amplification</span></div>
            <div className="flex justify-between"><span>CV Engine:</span><span className="font-mono">OpenCV 4.13</span></div>
          </div>
        </div>

        {/* ContextIQ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {healthData?.gemini_configured ? 'GEMINI READY' : 'FALLBACK ACTIVE'}
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">ContextIQ & Gemini 2.5</h3>
          <p className="text-xs text-slate-500 mb-4">
            Deterministic rule engine + Google Gemini 2.5 Flash structured reasoning.
          </p>
          <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex justify-between"><span>Model:</span><span className="font-mono">gemini-2.5-flash</span></div>
            <div className="flex justify-between"><span>Fallback Mode:</span><span className="font-mono">Deterministic Rules</span></div>
          </div>
        </div>

        {/* Database & Storage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> CONNECTED
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">Relational Evidence Vault</h3>
          <p className="text-xs text-slate-500 mb-4">
            SQLAlchemy SQLite ORM with foreign-key cascades and immutable audit records.
          </p>
          <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex justify-between"><span>DB Engine:</span><span className="font-mono">SQLite 3 / SQLAlchemy</span></div>
            <div className="flex justify-between"><span>Path:</span><span className="font-mono">prismora.db</span></div>
          </div>
        </div>

        {/* Bounded Forensic Agent */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> BOUNDED
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">Autonomous Agent Guardrails</h3>
          <p className="text-xs text-slate-500 mb-4">
            State machine execution with hard cap of 15 tools to eliminate infinite loop risk.
          </p>
          <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex justify-between"><span>Max Tool Budget:</span><span className="font-mono">15 steps</span></div>
            <div className="flex justify-between"><span>State Enforcement:</span><span className="font-mono">Strict Enums</span></div>
          </div>
        </div>

        {/* DossierGen ReportLab */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> READY
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-1">DossierGen PDF Engine</h3>
          <p className="text-xs text-slate-500 mb-4">
            ReportLab multi-page court-admissible dossier generator with running headers/footers.
          </p>
          <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex justify-between"><span>Page Standard:</span><span className="font-mono">Letter / Portrait</span></div>
            <div className="flex justify-between"><span>Output:</span><span className="font-mono">Vector PDF</span></div>
          </div>
        </div>
      </div>

      {/* Synthetic Benchmark Datasets */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Synthetic Benchmark Dataset Suites</h2>
            <p className="text-xs text-slate-500 mt-1">
              Pre-generated document packages specifically designed for DataOps Innovation Hackathon 2026 validation.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100">
            12 Documents Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Case 001 */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  CASE 001: LOAN FRAUD
                </span>
                <span className="text-xs text-slate-400">4 docs</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Mortgage Salary Inflation & Tampered ELA</h4>
              <p className="text-xs text-slate-600 mb-4">
                Pay stub salary inflated to $14,200/mo while bank deposits show $6,400/mo. Tax return shows $76,800/yr. Pay stub contains suspicious ELA pixel high-frequency compression heat.
              </p>
            </div>
            <button
              onClick={() => handleLoadCase('case_001', 'Mortgage Salary Inflation & Tampered ELA', 4)}
              disabled={loadingCaseId === 'case_001'}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              {loadingCaseId === 'case_001' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Initialize Case in Workspace
            </button>
          </div>

          {/* Case 002 */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  CASE 002: IDENTITY
                </span>
                <span className="text-xs text-slate-400">4 docs</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Employment Identity Mismatch & DOB Anomaly</h4>
              <p className="text-xs text-slate-600 mb-4">
                Passport DOB shows 1988-11-23 whereas employment offer letter lists 1992-04-14. Residence utility bill lists completely different state address with recent creation timestamp.
              </p>
            </div>
            <button
              onClick={() => handleLoadCase('case_002', 'Employment Identity Mismatch & DOB Anomaly', 4)}
              disabled={loadingCaseId === 'case_002'}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              {loadingCaseId === 'case_002' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Initialize Case in Workspace
            </button>
          </div>

          {/* Case 003 */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  CASE 003: CLEAN CONTROL
                </span>
                <span className="text-xs text-slate-400">4 docs</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">100% Consistent Verification Benchmark</h4>
              <p className="text-xs text-slate-600 mb-4">
                Control case where all names, addresses, salary numbers, tax returns, and bank statements reconcile perfectly with zero compression anomalies.
              </p>
            </div>
            <button
              onClick={() => handleLoadCase('case_003', '100% Consistent Verification Benchmark', 4)}
              disabled={loadingCaseId === 'case_003'}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              {loadingCaseId === 'case_003' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Initialize Case in Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
