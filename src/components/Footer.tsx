import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Fingerprint } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-main">
        <div className="max-w-[290px]">
          <div className="flex items-center gap-3">
            <span className="prism-mark"><Fingerprint className="h-5 w-5" /></span>
            <span className="text-sm font-bold tracking-[-0.03em] text-[#20213a]">PRISMORA <span className="text-[#7560d8]">AI</span></span>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-500">
            A connected workspace for examining documents, tracing evidence, and recording human review.
          </p>
        </div>
        <div>
          <h2 className="footer-label">Explore</h2>
          <Link to="/dashboard" className="footer-link">Workspace</Link>
          <a href="/#capabilities" className="footer-link">Capabilities</a>
          <Link to="/reports" className="footer-link">Reports</Link>
        </div>
        <div className="footer-note">
          <h2 className="footer-label">A note on findings</h2>
          <p>Automated findings and visual indicators are prompts for human review, not proof of fraud or tampering.</p>
          <Link to="/investigations/new" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#5140ad]">Start an investigation <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 PRISMORA AI</span>
        <span>See beyond the surface. Discover the evidence.</span>
      </div>
    </footer>
  );
}
