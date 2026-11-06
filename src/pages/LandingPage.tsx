import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Cpu,
  Database,
  FileCheck2,
  FileSearch,
  Fingerprint,
  Network,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const capabilities = [
  { name: 'DocMind', role: 'Document intake', description: 'Render PDFs, extract native text, and identify supported fields across your source files.', icon: FileSearch, tint: 'violet' },
  { name: 'PixelTrace', role: 'Visual inspection', description: 'Review ELA comparisons and basic document metadata as indicators that need human interpretation.', icon: ScanSearch, tint: 'blue' },
  { name: 'ContextIQ', role: 'Contextual comparison', description: 'Compare selected salary, invoice, and address fields across documents with optional explanation support.', icon: Cpu, tint: 'indigo' },
  { name: 'CrossDoc Graph', role: 'Relationship mapping', description: 'Explore how documents, extracted fields, and potential findings connect in a case.', icon: Network, tint: 'sky' },
  { name: 'EvidenceVault', role: 'Case records', description: 'Keep source hashes, analysis records, evidence references, and review decisions together.', icon: Database, tint: 'emerald' },
  { name: 'DossierGen', role: 'Report generation', description: 'Download a PDF summary assembled from the investigation data stored in the workspace.', icon: FileCheck2, tint: 'amber' },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <section id="product" className="landing-hero">
        <div className="landing-glow" aria-hidden="true" />
        <div className="landing-hero-grid">
          <div className="landing-copy">
            <div className="landing-kicker"><span className="h-1.5 w-1.5 rounded-full bg-[#7560d8]" /> DOCUMENT INTELLIGENCE, CONNECTED</div>
            <h1>Every Document Holds a Story.<br /><span>Discover What Connects Them.</span></h1>
            <p className="landing-intro">
              PRISMORA AI brings documents, extracted information, and visual indicators into one reviewable investigation—so you can follow the evidence back to its source.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/investigations/new" className="button-primary !h-12 !px-5">Start investigation <ArrowRight className="h-4 w-4" /></Link>
              <a href="#capabilities" className="button-secondary !h-12 !px-5">Explore the platform <ChevronRight className="h-4 w-4" /></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Multi-document review</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Source-linked findings</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Human decisions stay central</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Illustration of connected documents and evidence">
            <div className="visual-topline"><span><span className="visual-dot" /> CASE WORKSPACE</span><span>Evidence map</span></div>
            <div className="visual-canvas">
              <div className="visual-grid" />
              <svg className="visual-connectors" viewBox="0 0 620 380" fill="none" aria-hidden="true">
                <path d="M170 100C245 102 241 178 310 184M170 276C240 273 242 195 310 184M453 104C382 106 380 175 310 184M453 275C385 272 377 198 310 184" stroke="#b8afea" strokeWidth="1.5" strokeDasharray="4 6" />
                <path d="M310 184L310 286" stroke="#b8afea" strokeWidth="1.5" strokeDasharray="4 6" />
              </svg>
              <div className="visual-doc visual-doc-a"><span className="visual-doc-icon"><FileSearch className="h-4 w-4" /></span><span><b>Application.pdf</b><small>PDF · source document</small></span><i /></div>
              <div className="visual-doc visual-doc-b"><span className="visual-doc-icon blue"><FileSearch className="h-4 w-4" /></span><span><b>Statement.pdf</b><small>PDF · source document</small></span><i /></div>
              <div className="visual-doc visual-doc-c"><span className="visual-doc-icon sky"><FileSearch className="h-4 w-4" /></span><span><b>Invoice.pdf</b><small>PDF · source document</small></span><i /></div>
              <div className="visual-doc visual-doc-d"><span className="visual-doc-icon amber"><FileSearch className="h-4 w-4" /></span><span><b>Supporting record</b><small>PDF · source document</small></span><i /></div>
              <div className="visual-hub"><span className="hub-prism"><Fingerprint className="h-5 w-5" /></span><b>Evidence map</b><small>Connected case context</small></div>
              <div className="visual-finding"><span><Sparkles className="h-3.5 w-3.5" /></span><div><b>Potential finding</b><small>Review against source records</small></div><i /></div>
            </div>
            <div className="visual-caption"><ShieldCheck className="h-4 w-4 text-emerald-600" /><span>Every insight stays connected to its source.</span><span className="caption-status">REVIEWABLE</span></div>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div><span className="proof-number">01</span><span>Ingest source records</span></div><span className="proof-divider" />
        <div><span className="proof-number">02</span><span>Compare in context</span></div><span className="proof-divider" />
        <div><span className="proof-number">03</span><span>Review with evidence</span></div>
      </section>

      <section id="capabilities" className="landing-section">
        <div className="section-heading">
          <p className="eyebrow">A connected workflow</p>
          <h2>Purpose-built for evidence review.</h2>
          <p>Each capability supports a step in the investigation, while keeping source material and human review in view.</p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ name, role, description, icon: Icon, tint }) => (
            <article key={name} className="capability-card">
              <span className={`capability-icon tint-${tint}`}><Icon className="h-[19px] w-[19px]" strokeWidth={1.8} /></span>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">{role}</p>
              <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#20213a]">{name}</h3>
              <p className="mt-2 text-xs leading-[1.7] text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="workflow-section">
        <div className="workflow-inner">
          <div className="workflow-heading">
            <p className="eyebrow">How it works</p>
            <h2>From files to a clearer picture.</h2>
            <p>A focused workflow that makes the evidence easier to inspect—not conclusions easier to assume.</p>
            <Link to="/investigations/new" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5140ad] hover:text-[#352778]">Start with your documents <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="workflow-steps">
            {[
              { number: '01', title: 'Bring records together', body: 'Create a case and upload PDFs or supported image files. Originals are stored and hashed.' },
              { number: '02', title: 'Inspect and compare', body: 'Review extracted text, supported field comparisons, visual indicators, and document relationships.' },
              { number: '03', title: 'Trace and decide', body: 'Open supporting pages, assess alternative explanations, record a human review, and export a report.' },
            ].map((step) => <article key={step.number} className="workflow-step"><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-inner">
          <div><p className="eyebrow !text-violet-200">Start an investigation</p><h2>Let the records speak together.</h2><p>Bring your documents into one place and begin a source-grounded review.</p></div>
          <Link to="/investigations/new" className="button-light">Create a case <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
