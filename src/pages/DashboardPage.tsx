import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Investigation } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState<string | null>(null);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listInvestigations();
      setInvestigations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load investigations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleSeedQuickCase = async (caseKey: string, title: string) => {
    try {
      setSeeding(caseKey);
      const created = await api.createInvestigation({
        title,
        description: `Automated DataOps benchmark demonstration for ${caseKey}.`,
        seed_case: caseKey,
      });
      // Redirect to the newly created investigation workspace
      navigate(`/investigations/${created.id}`);
    } catch (err: any) {
      alert(`Error launching case: ${err.message}`);
    } finally {
      setSeeding(null);
    }
  };

  // Compute metrics from actual database records (no fabricated stats)
  const totalCases = investigations.length;
  const totalDocs = investigations.reduce((sum, i) => sum + (i.document_count || 0), 0);
  const totalFindings = investigations.reduce((sum, i) => sum + (i.finding_count || 0), 0);
  const pendingReviews = investigations.filter((i) => i.status === 'REVIEW_REQUIRED' || !i.human_verdict).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
              Operations Center
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forensic Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry and investigation dossiers across all active document verification cases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvestigations}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-600' : ''}`} />
          </button>
          <Link
            to="/investigations/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-sm shadow-violet-500/20 transition-all active:scale-98 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Investigation</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Strictly Calculated From Database Records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Investigations</span>
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalCases}</div>
          <p className="text-[11px] text-slate-400 mt-1">Verified cases in SQLite store</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Documents Ingested</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalDocs}</div>
          <p className="text-[11px] text-slate-400 mt-1">SHA-256 hashed originals</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Findings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalFindings}</div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-document anomalies</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Human Reviews Pending</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingReviews}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting analyst adjudication</p>
        </div>
      </div>

      {/* 1-Click Benchmark Launch Bar */}
      <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-violet-50 via-indigo-50/50 to-sky-50 border border-violet-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h3 className="font-bold text-slate-900 text-sm">Quick-Launch Hackathon Evaluation Cases</h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Instantly seed and audit controlled test cases from the synthetic forensic dataset with one click.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSeedQuickCase('CASE_001', 'Case 001 — Financial Salary Discrepancy')}
            disabled={seeding !== null}
            className="p-3.5 rounded-xl bg-white/90 hover:bg-white border border-violet-200/80 shadow-xs hover:shadow-sm text-left transition-all active:scale-98 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 block mb-0.5">Case 001</span>
            <h4 className="text-xs font-bold text-slate-900">Financial Discrepancy</h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">$12,500 application vs $9,200 pay stub</p>
          </button>

          <button
            onClick={() => handleSeedQuickCase('CASE_002', 'Case 002 — Address Domicile Contradiction')}
            disabled={seeding !== null}
            className="p-3.5 rounded-xl bg-white/90 hover:bg-white border border-sky-200/80 shadow-xs hover:shadow-sm text-left transition-all active:scale-98 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block mb-0.5">Case 002</span>
            <h4 className="text-xs font-bold text-slate-900">Address Contradiction</h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">Springfield application vs Eugene lease</p>
          </button>

          <button
            onClick={() => handleSeedQuickCase('CASE_003', 'Case 003 — Visual Invoice Splicing Anomaly')}
            disabled={seeding !== null}
            className="p-3.5 rounded-xl bg-white/90 hover:bg-white border border-emerald-200/80 shadow-xs hover:shadow-sm text-left transition-all active:scale-98 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">Case 003</span>
            <h4 className="text-xs font-bold text-slate-900">Visual Tampering & ELA</h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">$14,500 authentic vs $41,500 spliced invoice</p>
          </button>
        </div>
      </div>

      {/* Investigations Table / Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Investigations</h2>
          <span className="text-xs text-slate-400 font-medium">Sorted by creation date</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-500" />
            <p className="text-xs">Loading investigation records from SQLite database...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : investigations.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No investigations created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Launch one of the three pre-built benchmark cases above or upload custom documents to initiate an investigation.
            </p>
            <Link
              to="/investigations/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create First Investigation</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Investigation Title</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Documents</th>
                  <th className="px-6 py-3.5">Findings</th>
                  <th className="px-6 py-3.5">Human Verdict</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {investigations.map((inv) => {
                  const statusColors: Record<string, string> = {
                    CREATED: 'bg-slate-100 text-slate-700 border-slate-200',
                    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
                    ANALYZED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    REVIEW_REQUIRED: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
                    COMPLETED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <Link to={`/investigations/${inv.id}`} className="hover:text-violet-600 transition-colors">
                          {inv.title}
                        </Link>
                        {inv.description && (
                          <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">{inv.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[inv.status] || 'bg-slate-100'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{inv.document_count || 0} files</td>
                      <td className="px-6 py-4">
                        {(inv.critical_findings_count || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                            <AlertTriangle className="w-3 h-3" />
                            {inv.critical_findings_count} Critical
                          </span>
                        ) : (inv.finding_count || 0) > 0 ? (
                          <span className="text-amber-600 font-medium">{inv.finding_count} anomalies</span>
                        ) : (
                          <span className="text-slate-400">0 findings</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inv.human_verdict ? (
                          <span className="font-semibold text-slate-800 text-[11px]">{inv.human_verdict}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pending Review</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px]">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/investigations/${inv.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
                        >
                          <span>Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
