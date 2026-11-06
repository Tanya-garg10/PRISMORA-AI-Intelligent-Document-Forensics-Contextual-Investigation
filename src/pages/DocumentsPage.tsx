import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, FileText, Fingerprint, Search } from 'lucide-react';
import { getAllDocuments } from '../services/api';

function formatBytes(bytes?: number) {
  if (!bytes) return 'Size unavailable';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const { data: documents = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: getAllDocuments,
  });
  const filteredDocuments = useMemo(() => documents.filter((document) =>
    `${document.filename} ${document.investigation_title || ''} ${document.document_type || ''} ${document.status || ''}`
      .toLowerCase().includes(search.toLowerCase()),
  ), [documents, search]);

  return (
    <div className="app-content">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Source register</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#17182b]">Documents</h1>
          <p className="mt-2 text-sm text-slate-500">Original source files connected to your investigation records.</p>
        </div>
        <label className="relative block sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files or cases" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
        </label>
      </div>

      <section className="panel-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#20213a]">Uploaded originals</h2>
            <p className="mt-1 text-[11px] text-slate-400">{isLoading ? 'Loading records…' : `${filteredDocuments.length} of ${documents.length} documents`}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><FileText className="h-4 w-4" /></span>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">{[0, 1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-50" />)}</div>
        ) : isError ? (
          <div className="px-6 py-14 text-center" role="alert">
            <p className="text-sm font-medium text-rose-700">Could not load documents: {error instanceof Error ? error.message : 'Unknown API error'}</p>
            <button type="button" onClick={() => void refetch()} className="mt-3 text-xs font-semibold text-violet-700 hover:underline">Try again</button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><FileText className="h-5 w-5" /></span>
            <h3 className="mt-4 text-sm font-semibold text-slate-800">{search ? 'No matching documents' : 'No documents yet'}</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500">{search ? 'Try another file name or case title.' : 'Create an investigation and upload source files to see them here.'}</p>
            {!search && <Link to="/investigations/new" className="button-primary mx-auto mt-5 !h-10 !text-xs">Start investigation</Link>}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocuments.map((document) => (
              <article key={document.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#fcfbff] sm:flex-row sm:items-center sm:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"><FileText className="h-[17px] w-[17px]" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800">{document.filename}</p>
                  <Link to={`/investigations/${document.investigation_id}`} className="mt-1 block truncate text-[11px] text-violet-700 hover:underline">{document.investigation_title || 'Open investigation'}</Link>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-[52px] text-[10px] text-slate-500 sm:pl-0">
                  <span>{document.document_type || document.file_type || 'File'}</span>
                  <span>{document.page_count} {document.page_count === 1 ? 'page' : 'pages'}</span>
                  <span>{formatBytes(document.file_size_bytes)}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700"><Fingerprint className="h-3 w-3" /> SHA-256 recorded</span>
                  <Link to={`/investigations/${document.investigation_id}/evidence?doc=${document.id}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-700" aria-label={`Inspect ${document.filename} evidence`}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
