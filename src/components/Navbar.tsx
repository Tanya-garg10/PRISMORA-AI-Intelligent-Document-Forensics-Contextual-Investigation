import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  FileSearch,
  Network,
  FileText,
  Settings,
  PlusCircle,
  Activity,
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'New Case', path: '/investigations/new', icon: PlusCircle },
    { label: 'Relationship Graph', path: '/graph', icon: Network },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Settings & Status', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                PRISMORA <span className="text-violet-600 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full border border-violet-200">
                Hackathon 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">See Beyond the Surface</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/investigations/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-sm shadow-violet-500/25 hover:shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Audit Documents</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
