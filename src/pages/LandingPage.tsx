import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  Network,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Database,
  Sparkles,
  Fingerprint,
  Lock,
  FileText,
  Activity
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const engines = [
    {
      num: '01',
      name: 'DocMind',
      subtitle: 'Intelligent Ingestion & OCR',
      desc: 'Parses multi-format PDFs, JPGs, and PNGs with SHA-256 immutability, rendering 200-DPI frames with word-level bounding boxes and confidence grading.',
      icon: Search,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      num: '02',
      name: 'PixelTrace',
      subtitle: 'Visual Forensics & ELA',
      desc: 'Applies Error Level Analysis (ELA), JPEG recompression delta mapping, metadata provenance scanning, and localized splice detection.',
      icon: Fingerprint,
      color: 'from-violet-500 to-purple-600',
    },
    {
      num: '03',
      name: 'ContextIQ',
      subtitle: 'Contextual Intelligence Engine',
      desc: 'Cross-document reconciliation engine normalizing gross vs. net salaries, monthly vs. annual figures, address canonicalization, and Gemini-grounded reasoning.',
      icon: Cpu,
      color: 'from-fuchsia-500 to-pink-600',
    },
    {
      num: '04',
      name: 'CrossDoc Graph',
      subtitle: 'Relationship Intelligence',
      desc: 'Dynamic React Flow canvas modeling multi-document topology, entity linkages, contradicting claims, and supporting evidence paths.',
      icon: Network,
      color: 'from-sky-500 to-cyan-600',
    },
    {
      num: '05',
      name: 'EvidenceVault',
      subtitle: 'Audit & Provenance Store',
      desc: 'Cryptographic chain of custody storing SHA-256 hashes, immutable original documents, field coordinates, and human-in-the-loop review decisions.',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      num: '06',
      name: 'DossierGen',
      subtitle: 'Forensic PDF Reporting',
      desc: 'Generates court-grade, downloadable PDF investigation dossiers complete with visual evidence crops, audit trails, and alternative benign explanations.',
      icon: FileCheck2,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const cases = [
    {
      id: 'CASE_001',
      badge: 'Financial Forensics',
      title: 'Salary & Income Inflation Case',
      desc: 'Loan applicant declares $12,500/mo income. Pay stubs and bank direct deposits prove actual gross pay is $9,200/mo ($3,300/mo discrepancy).',
      docs: ['Loan Application', 'Pay Stub', 'Bank Statement', 'Form W-2'],
      gradient: 'from-violet-50 to-indigo-50/60 border-violet-200',
    },
    {
      id: 'CASE_002',
      badge: 'Identity & Address',
      title: 'Residential Domicile Contradiction',
      desc: 'Commercial application and utility bills claim Springfield residence, while primary executed residential lease and HR records prove Eugene domicile.',
      docs: ['Credit Application', 'Utility Statement', 'Lease Agreement', 'HR Verification'],
      gradient: 'from-sky-50 to-blue-50/60 border-sky-200',
    },
    {
      id: 'CASE_003',
      badge: 'Visual Tampering',
      title: 'Spliced Commercial Invoice Anomaly',
      desc: 'Digitally altered vendor invoice inflating total from $14,500 to $41,500. Corroborated by original Purchase Order PO-4401 and detected via ELA.',
      docs: ['Authentic Invoice', 'Altered Invoice', 'Purchase Order', 'Delivery Manifest'],
      gradient: 'from-emerald-50 to-teal-50/60 border-emerald-200',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4 text-center border-b border-indigo-950/40">
        <span className="font-semibold text-indigo-300">DataOps Innovation Hackathon 2026</span> • Problem Statement 2 • Team BrandCanvas
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Subtle Ambient Refraction Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-violet-200/40 via-sky-200/30 to-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Contextual Forensics Over Isolated OCR</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.08] mb-6">
            See Beyond the Surface.{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Discover the Evidence.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Traditional OCR reads documents in isolation. <b>PRISMORA AI</b> investigates how information connects across multiple documents—uncovering contradictions, visual manipulations, and contextual evidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 shadow-md shadow-violet-500/25 hover:shadow-lg transition-all active:scale-98"
            >
              <span>Open Investigation Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/investigations/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all active:scale-98"
            >
              <FileCheck2 className="w-4 h-4 text-violet-600" />
              <span>Create New Case</span>
            </Link>
          </div>

          {/* Forensic Standard Tri-Tier Badge */}
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/70 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tier 1</span>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5">Observation</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Visual, structural, or statistical anomaly (e.g., localized ELA variance).</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Tier 2</span>
              <h4 className="text-xs font-bold text-amber-900 mt-0.5">Potential Anomaly</h4>
              <p className="text-[11px] text-amber-700 mt-1 leading-snug">Cross-document mismatch with plausible alternative explanations.</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Tier 3</span>
              <h4 className="text-xs font-bold text-emerald-900 mt-0.5">Confirmed Fact</h4>
              <p className="text-[11px] text-emerald-700 mt-1 leading-snug">Verified ground truth backed by multi-witness corroboration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Six Core Intelligence Engines */}
      <section className="py-20 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2">Engine Architecture</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Six Independent, Integrated Intelligence Engines
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Every document undergoes a complete forensic lifecycle: from cryptographic hashing to deep contextual reasoning and court-ready reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engines.map((eng) => {
              const Icon = eng.icon;
              return (
                <div
                  key={eng.num}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${eng.color} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-violet-200 transition-colors font-mono">
                      {eng.num}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-violet-950 transition-colors">
                    {eng.name}
                  </h4>
                  <p className="text-xs font-semibold text-violet-600 mb-2">{eng.subtitle}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{eng.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hackathon Benchmark Cases (1-Click Demo) */}
      <section className="py-20 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Pre-Built Benchmark Scenarios</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">Explore Hackathon Test Cases</h3>
            <p className="text-sm text-slate-600 mt-2">
              Launch real, fully-grounded multi-document investigations with one click using the synthetic forensic dataset.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div
                key={c.id}
                className={`p-6 rounded-2xl bg-white border ${c.gradient} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-100/70 px-2.5 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">{c.id}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{c.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{c.desc}</p>

                  <div className="pt-3 border-t border-slate-100 mb-6">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Audited Documents ({c.docs.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.docs.map((docName, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {docName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/investigations/new?seed=${c.id}`}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Launch This Benchmark</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold tracking-tight mb-4">
            Ready to Investigate Beyond the Surface?
          </h3>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
            Experience real multi-document forensics, interactive entity graph modeling, and AI agent reasoning in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl font-semibold text-slate-950 bg-white hover:bg-slate-100 shadow-md transition-all active:scale-98 text-sm"
            >
              Open Dashboard
            </Link>
            <Link
              to="/settings"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all active:scale-98 text-sm"
            >
              System Status & Configuration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
