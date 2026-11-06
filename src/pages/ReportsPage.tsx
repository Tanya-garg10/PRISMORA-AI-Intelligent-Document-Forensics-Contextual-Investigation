import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  FileText, Download, ShieldCheck, RefreshCw, 
  Clock, CheckCircle, AlertTriangle, ExternalLink, Sparkles 
} from 'lucide-react';
import { getInvestigations, generateReport } from '../services/api';
import type { Investigation } from '../types';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const { data: investigations, isLoading, refetch } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => getInvestigations(),
  });

  const handleGenerateReport = async (id: string) => {
    setGeneratingId(id);
    try {
      const data = await generateReport(id);
      if (data?.download_url) {
        window.open(data.download_url, '_blank');
      }
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              DossierGen Forensic Reports
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 uppercase">
              Court-Admissible PDF Engine
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Generate, view, and export tamper-evident forensic dossiers with cryptographic hashes and audit logs.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Case Registry
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500 text-sm font-medium">Scanning investigation repository...</p>
        </div>
      ) : !investigations || investigations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Investigation Dossiers Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Create an investigation case and execute the analysis pipeline to generate comprehensive PDF reports.
          </p>
          <Link
            to="/investigations/new"
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"
          >
            Launch Investigation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {investigations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-slate-900">{inv.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    inv.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    inv.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl">
                  {inv.description || 'Forensic investigation across ingested documentation.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Created: {new Date(inv.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ID: {inv.id.slice(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/investigations/${inv.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Open Workspace
                </Link>

                <button
                  onClick={() => handleGenerateReport(inv.id)}
                  disabled={generatingId === inv.id}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition disabled:opacity-50"
                >
                  {generatingId === inv.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Compiling Dossier...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Export PDF Dossier
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
