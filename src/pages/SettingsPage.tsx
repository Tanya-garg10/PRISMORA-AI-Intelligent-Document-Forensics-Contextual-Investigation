import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, CheckCircle2, Database, RefreshCw, Sparkles } from 'lucide-react';
import { checkHealth } from '../services/api';

function StatusCard({
  title,
  value,
  description,
  ready,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  ready: boolean;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
          <Icon className="h-5 w-5" />
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {ready ? 'READY' : 'LIMITED'}
        </span>
      </div>
      <h2 className="font-bold text-slate-900">{title}</h2>
      <p className="mt-1 break-words text-sm font-semibold text-slate-700">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: checkHealth,
  });

  const database = typeof data?.database === 'object' ? data.database : undefined;
  const tesseractReady = Boolean(data?.ocr_engine?.includes('Tesseract') && !data.ocr_engine.includes('not installed'));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">System Status</h1>
          <p className="mt-1 text-sm text-slate-500">Live status from the API. Optional services are clearly identified.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh status
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Checking application services...
        </div>
      ) : isError || !data ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700" role="alert">
          Could not retrieve system status: {error instanceof Error ? error.message : 'Unknown API error'}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatusCard
              title="Backend API"
              value={`${data.app_name || 'PRISMORA AI'} ${data.version || ''}`.trim()}
              description="Status is reported by the running FastAPI health endpoint."
              ready={data.status === 'healthy'}
              icon={Activity}
            />
            <StatusCard
              title="Database"
              value={database?.status || 'Unavailable'}
              description={`${database?.type || 'Database'} · ${database?.investigation_count ?? 0} investigations, ${database?.document_count ?? 0} documents`}
              ready={database?.status === 'connected'}
              icon={Database}
            />
            <StatusCard
              title="OCR"
              value={data.ocr_engine || 'Status unavailable'}
              description={tesseractReady ? 'PDF text extraction and Tesseract image OCR are available.' : 'PDF text extraction is available; install Tesseract to enable OCR for image-only documents.'}
              ready={tesseractReady}
              icon={Activity}
            />
            <StatusCard
              title="Gemini"
              value={data.gemini_configured ? `${data.gemini_model || 'Gemini'} configured` : 'Optional · not configured'}
              description={data.gemini_configured ? 'The API key is configured; its value is never returned by this endpoint.' : 'Deterministic comparisons remain available. Set GEMINI_API_KEY to enable contextual explanations.'}
              ready={data.gemini_configured}
              icon={Sparkles}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">Ready to investigate documents?</h2>
              <p className="mt-1 text-sm text-slate-600">Create a case and upload documents, or start with one of the included sample cases.</p>
            </div>
            <Link to="/investigations/new" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-800">
              New investigation
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
