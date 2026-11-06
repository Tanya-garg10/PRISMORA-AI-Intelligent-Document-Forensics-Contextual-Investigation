import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  ChevronDown,
  FileText,
  Files,
  Fingerprint,
  FolderKanban,
  Menu,
  Network,
  Plus,
  Settings,
  X,
} from 'lucide-react';

const appNavigation = [
  { label: 'Overview', path: '/dashboard', icon: Activity },
  { label: 'Investigations', path: '/dashboard#investigations', icon: FolderKanban },
  { label: 'Documents', path: '/documents', icon: Files },
  { label: 'Evidence Explorer', path: '/evidence', icon: Fingerprint },
  { label: 'Relationship Graph', path: '/graph', icon: Network },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

function isNavigationActive(index: number, pathname: string, hash: string) {
  if (index === 0) return pathname === '/dashboard' && hash !== '#investigations';
  if (index === 1) return (pathname === '/dashboard' && hash === '#investigations') || pathname.startsWith('/investigations/');
  if (index === 3) return pathname === '/evidence' || pathname.endsWith('/evidence');
  return pathname === appNavigation[index].path || pathname.startsWith(`${appNavigation[index].path}/`);
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="prism-mark">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M16 3.8 27.1 9.7 16 15.8 4.9 9.7 16 3.8Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
          <path d="M4.9 9.7v12.4L16 28.2V15.8M27.1 9.7v12.4L16 28.2" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
          <path d="m16 3.8 0 12M4.9 9.7 16 16l11.1-6.3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" opacity=".58" />
        </svg>
      </div>
      <div>
        <span className={`block text-[15px] font-bold tracking-[-0.04em] ${inverse ? 'text-white' : 'text-[#17182b]'}`}>
          PRISMORA <span className="text-[#7560d8]">AI</span>
        </span>
        <span className={`block text-[10px] tracking-wide ${inverse ? 'text-slate-400' : 'text-slate-500'}`}>
          See beyond the surface
        </span>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const isLanding = pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLanding) {
    return (
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <a href="#product" className="nav-anchor">Product</a>
            <a href="#capabilities" className="nav-anchor">Capabilities</a>
            <a href="#workflow" className="nav-anchor">How it works</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#4436a8]">Workspace</Link>
            <Link to="/investigations/new" className="button-primary !py-2.5 !px-4">
              Start investigation <ChevronDown className="h-4 w-4 -rotate-90" />
            </Link>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="grid gap-1 border-t border-slate-100 bg-white px-5 py-3 md:hidden">
            <a href="#product" onClick={() => setMobileOpen(false)} className="mobile-nav-link">Product</a>
            <a href="#capabilities" onClick={() => setMobileOpen(false)} className="mobile-nav-link">Capabilities</a>
            <a href="#workflow" onClick={() => setMobileOpen(false)} className="mobile-nav-link">How it works</a>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="mobile-nav-link">Workspace</Link>
            <Link to="/investigations/new" onClick={() => setMobileOpen(false)} className="button-primary mt-2 justify-center">Start investigation</Link>
          </nav>
        )}
      </header>
    );
  }

  return (
    <>
      <aside className="app-sidebar">
        <div className="px-6 pb-8 pt-7"><Brand inverse /></div>
        <div className="px-4">
          <p className="sidebar-label">Workspace</p>
          <nav className="grid gap-1" aria-label="Workspace navigation">
            {appNavigation.map(({ label, path, icon: Icon }, index) => {
              const active = isNavigationActive(index, pathname, hash);
              return (
                <Link
                  key={label}
                  to={path}
                  className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="sidebar-tip">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-violet-200">
              <Fingerprint className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-white">Evidence, in context.</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Connect records, inspect signals, and keep every conclusion reviewable.</p>
            <Link to="/investigations/new" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-200 hover:text-white">
              New investigation <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>
      <header className="app-mobile-header">
        <Brand />
        <Link to="/investigations/new" aria-label="New investigation" className="rounded-lg bg-[#4436a8] p-2 text-white">
          <Plus className="h-4 w-4" />
        </Link>
      </header>
      <nav className="app-mobile-nav" aria-label="Mobile workspace navigation">
        {appNavigation.map(({ label, path, icon: Icon }, index) => (
          <Link
            key={label}
            to={path}
            aria-label={label}
            className={isNavigationActive(index, pathname, hash) ? 'text-[#5d4ac4]' : ''}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span>{['Home', 'Cases', 'Docs', 'Evidence', 'Graph', 'Reports', 'Settings'][index]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
