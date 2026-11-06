import React from 'react';
import { Layers, ShieldCheck, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">PRISMORA AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-4 leading-relaxed">
              AI-Powered Document Forensics & Contextual Intelligence. Discovering contradictions, visual manipulations, and evidence networks across multi-document dossiers.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span>DataOps Innovation Hackathon 2026</span>
              <span>•</span>
              <span>Team: BrandCanvas</span>
              <span>•</span>
              <span>Problem Statement 2</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Engines</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>DocMind (OCR & Parsing)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>PixelTrace (Visual Forensics & ELA)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>ContextIQ (Cross-Doc Reasoner)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>CrossDoc Graph (React Flow)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>EvidenceVault (Audit & Hashes)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>DossierGen (PDF Reports)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Forensic Principles</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Rigorous three-tier classification: <b className="text-slate-300">Observation</b>, <b className="text-slate-300">Potential Anomaly</b>, and <b className="text-slate-300">Confirmed Fact</b>. Never declare fraud on anomalies alone.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              <span className="font-semibold text-emerald-400">Cryptographic Integrity:</span> SHA-256 immutable original file custody.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 PRISMORA AI. Built for DataOps Innovation Hackathon 2026.</p>
          <p className="mt-2 sm:mt-0">See Beyond the Surface. Discover the Evidence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
