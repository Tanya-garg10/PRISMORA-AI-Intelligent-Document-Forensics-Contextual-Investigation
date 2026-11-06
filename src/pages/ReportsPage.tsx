import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownToLine, ArrowUpRight, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { getInvestigations, generateReport } from '../services/api';
import type { Investigation } from '../types';

function CaseReportCard({ investigation }: { investigation: Investigation }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = async () => {
    try {
      setDownloading(true);
      setError(null);
      await generateReport(investigation.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not download report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="report-card">
      <div className="report-cover">
        <div className="flex items-center justify-between">
          <span className="report-cover-brand">PRISMORA <b>AI</b></span>
          <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[8px] font-semibold tracking-wider text-white/75">CASE DOSSIER</span>
        </div>
        <div className="report-cover-lines" aria-hidden="true"><i /><i /><i /></div>
        <div className="mt-auto flex items-end justify-between">
          <span className="text-[9px] text-white/60">{investigation.id.slice(0, 8).toUpperCase()}</span>
          <FileText className="h-5 w-5 text-violet-200" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Investigation dossier</p>
            <h2 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-5 text-[#20213a]">{investigation.title}</h2>
          </div>
          <span className={`status-pill shrink-0 ${investigation.status === 'REVIEW_REQUIRED' ? 'status-review' : investigation.status === 'COMPLETED' || investigation.status === 'ANALYZED' ? 'status-success' : investigation.status === 'PROCESSING' ? 'status-processing' : 'status-neutral'}`}>
            {investigation.status.replaceAll('_', ' ')}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-500">{investigation.description || 'Investigation summary based on the stored case record.'}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-[10px] text-slate-500">
          <span>{investigation.document_count || 0} source documents</span>
          <span>{investigation.finding_count || 0} potential findings</span>
          <span>Updated {new Date(investigation.updated_at || investigation.created_at).toLocaleDateString()}</span>
          <span>{investigation.pending_review_count || 0} pending review</span>
        </div>
        {error && <p className="mt-3 text-[11px] text-rose-600" role="alert">{error}</p>}
        <div className="mt-auto flex gap-2 pt-4">
          <Link to={`/investigations/${investigation.id}`} className="button-secondary h-9 flex-1 !px-2 !text-[10px]">
            Open case <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button type="button" onClick={() => void downloadReport()} disabled={downloading} className="button-primary h-9 flex-1 !px-2 !text-[10px] disabled:opacity-60">
            {downloading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
            {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ReportsPage() {
  const { data: investigations = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['investigations'],
    queryFn: getInvestigations,
  });

  return (
    <div className="app-content">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Dossier generation</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#17182b]">Investigation reports</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Generate and download a PDF summary from each case’s stored documents, findings, and review status.</p>
        </div>
        <button type="button" onClick={() => void refetch()} className="button-secondary !h-10 !px-3"><RefreshCw className="h-3.5 w-3.5" /> Refresh registry</button>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-[11px] leading-5 text-blue-800">
        <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
        Reports are generated when requested; this view reflects investigation records and does not imply a dossier was previously saved.
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-[340px] animate-pulse rounded-2xl border border-slate-100 bg-white" />)}</div>
      ) : isError ? (
        <div role="alert" className="panel-card p-5 text-sm text-rose-700">Could not load investigations: {error instanceof Error ? error.message : 'Unknown API error'}</div>
      ) : investigations.length === 0 ? (
        <div className="panel-card px-6 py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-sm font-semibold text-slate-800">No investigation reports yet</h2>
          <p className="mt-1 text-xs text-slate-500">Create a case to generate a downloadable dossier from its stored records.</p>
          <Link to="/investigations/new" className="button-primary mx-auto mt-5 !h-10 !text-xs">Start investigation</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {investigations.map((investigation) => <CaseReportCard key={investigation.id} investigation={investigation} />)}
        </div>
      )}
    </div>
  );
}
