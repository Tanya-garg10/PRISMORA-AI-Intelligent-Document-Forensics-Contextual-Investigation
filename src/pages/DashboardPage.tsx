import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileStack,
  Fingerprint,
  FolderKanban,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import type { Investigation } from '../types';

const samples = [
  { id: 'CASE_001', title: 'Financial records', meta: 'Income & supporting records', icon: FileStack, tone: 'violet' },
  { id: 'CASE_002', title: 'Address records', meta: 'Address consistency review', icon: Fingerprint, tone: 'blue' },
  { id: 'CASE_003', title: 'Invoice records', meta: 'Invoice & purchase order', icon: ShieldAlert, tone: 'amber' },
];

const statusClass: Record<string, string> = {
  CREATED: 'status-neutral',
  PROCESSING: 'status-processing',
  ANALYZED: 'status-success',
  REVIEW_REQUIRED: 'status-review',
  COMPLETED: 'status-success',
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function relativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (days === 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  return `Updated ${days} days ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState<string | null>(null);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      setError(null);
      setInvestigations(await api.listInvestigations());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load investigations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchInvestigations(); }, []);

  const sortedInvestigations = useMemo(
    () => [...investigations].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()),
    [investigations],
  );
  const filteredInvestigations = sortedInvestigations.filter((item) =>
    `${item.title} ${item.description || ''} ${item.status}`.toLowerCase().includes(search.toLowerCase()),
  );
  const documentCount = investigations.reduce((sum, item) => sum + (item.document_count || 0), 0);
  const findingCount = investigations.reduce((sum, item) => sum + (item.finding_count || 0), 0);
  const pendingCount = investigations.reduce((sum, item) => sum + (item.pending_review_count || 0), 0);

  const launchSample = async (sampleId: string, title: string) => {
    try {
      setSeeding(sampleId);
      const investigation = await api.createInvestigation({
        title: `Sample review · ${title}`,
        description: `Investigation created from the ${sampleId} sample document set.`,
        seed_case: sampleId,
      });
      navigate(`/investigations/${investigation.id}?autoRun=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not launch the sample investigation.');
    } finally {
      setSeeding(null);
    }
  };

  return (
    <div className="app-content">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7363bf]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Investigation workspace
          </div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#17182b] sm:text-[36px]">
            Your Investigation Workspace
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Connect the records, follow the evidence, and keep every conclusion grounded in reviewable sources.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => void fetchInvestigations()} disabled={loading} className="button-secondary !h-11 !px-3" aria-label="Refresh investigations">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/investigations/new" className="button-primary !h-11">
            <Plus className="h-4 w-4" /> New investigation
          </Link>
        </div>
      </div>

      <section className="dashboard-hero mb-6 overflow-hidden rounded-2xl p-6 text-white sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-100">
              <Sparkles className="h-3 w-3" /> Evidence, in context
            </span>
            <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-[30px]">
              See the whole case,<br className="hidden sm:block" /> not just the individual files.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100/75">
              Compare extracted information across documents and inspect the source behind every potential finding.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/investigations/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#302668] transition hover:bg-violet-50">
              Create a case <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#investigations" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10">
              Browse investigations
            </a>
          </div>
        </div>
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
      </section>

      {error && (
        <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span><button type="button" onClick={() => void fetchInvestigations()} className="font-semibold underline">Try again</button>
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Investigation summary">
        {[
          { label: 'Investigations', value: investigations.length, icon: FolderKanban, hint: 'All recorded cases', tint: 'violet' },
          { label: 'Documents', value: documentCount, icon: FileStack, hint: 'Original files ingested', tint: 'blue' },
          { label: 'Potential findings', value: findingCount, icon: ShieldAlert, hint: 'Require source review', tint: 'amber' },
          { label: 'Pending review', value: pendingCount, icon: Clock3, hint: 'Awaiting a decision', tint: 'rose' },
        ].map(({ label, value, icon: Icon, hint, tint }) => (
          <article key={label} className="metric-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                {loading ? <div className="mt-3 h-8 w-14 animate-pulse rounded-lg bg-slate-100" /> : <p className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-[#17182b]">{error ? '—' : value.toLocaleString()}</p>}
              </div>
              <span className={`metric-icon metric-${tint}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">{hint}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section id="investigations" className="panel-card scroll-mt-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#17182b]">Recent investigations</h2>
              <p className="mt-1 text-xs text-slate-400">Cases from your workspace, ordered by latest update.</p>
            </div>
            <label className="relative block sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search investigations" className="h-10 w-full rounded-lg border border-slate-200 bg-[#fbfbfd] pl-9 pr-3 text-xs outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
            </label>
          </div>

          {loading ? (
            <div className="grid gap-3 p-5">{[0, 1, 2].map((item) => <div key={item} className="h-[58px] animate-pulse rounded-xl bg-slate-50" />)}</div>
          ) : !error && filteredInvestigations.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><FolderKanban className="h-5 w-5" /></span>
              <h3 className="mt-4 text-sm font-semibold text-slate-800">{search ? 'No matching investigations' : 'Your workspace is ready'}</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
                {search ? 'Try another title or status.' : 'Create an investigation and add documents to start connecting evidence.'}
              </p>
              {!search && <Link to="/investigations/new" className="button-primary mx-auto mt-5 !h-10 !text-xs"><Plus className="h-4 w-4" /> Create investigation</Link>}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredInvestigations.slice(0, 8).map((item) => (
                <article key={item.id} className="group flex flex-col gap-3 px-5 py-4 transition hover:bg-[#fcfbff] sm:flex-row sm:items-center sm:px-6">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50/70 text-violet-700">
                      <FileStack className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <Link to={`/investigations/${item.id}`} className="block truncate text-[13px] font-semibold text-slate-800 transition group-hover:text-[#5542b4]">{item.title}</Link>
                      <p className="mt-1 truncate text-[11px] text-slate-400">{item.description || 'No description provided'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pl-[52px] sm:gap-5 sm:pl-0">
                    <span className={`status-pill ${statusClass[item.status] || 'status-neutral'}`}>{item.status.replaceAll('_', ' ')}</span>
                    <span className="text-[11px] text-slate-500">{item.document_count || 0} docs</span>
                    <span className="text-[11px] text-slate-500">{item.finding_count || 0} findings</span>
                    <span className="hidden min-w-[92px] text-right text-[11px] text-slate-400 lg:block">{formatDate(item.updated_at || item.created_at)}</span>
                    <Link to={`/investigations/${item.id}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-700" aria-label={`Open ${item.title}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          {filteredInvestigations.length > 8 && (
            <div className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-500">
              Showing 8 of {filteredInvestigations.length} cases. Use search to find another.
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="panel-card">
            <div className="border-b border-slate-100 px-5 py-5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#17182b]">Recent case updates</h2>
              <p className="mt-1 text-xs text-slate-400">Activity based on stored case records.</p>
            </div>
            {loading ? <div className="space-y-3 p-5">{[0,1,2].map((x) => <div key={x} className="h-12 animate-pulse rounded-lg bg-slate-50" />)}</div> : sortedInvestigations.length ? (
              <div className="space-y-4 p-5">
                {sortedInvestigations.slice(0, 4).map((item) => (
                  <Link key={item.id} to={`/investigations/${item.id}`} className="flex gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      {item.pending_review_count ? <Clock3 className="h-3.5 w-3.5 text-amber-600" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-slate-700">{item.title}</span>
                      <span className="mt-1 block text-[10px] text-slate-400">{relativeDate(item.updated_at || item.created_at)} · {item.status.replaceAll('_', ' ').toLowerCase()}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : <p className="px-5 py-6 text-xs text-slate-400">Updates will appear when you create a case.</p>}
          </section>

          <section className="panel-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0edff] text-[#6552c3]"><Sparkles className="h-4 w-4" /></span>
              <div><h2 className="text-sm font-semibold text-[#17182b]">Quick actions</h2><p className="text-[10px] text-slate-400">Continue your workflow</p></div>
            </div>
            <div className="mt-4 grid gap-2">
              <Link to="/investigations/new" className="quick-action"><Plus className="h-4 w-4 text-violet-600" /><span>Start a new investigation</span><ArrowRight className="ml-auto h-3.5 w-3.5" /></Link>
              <Link to="/reports" className="quick-action"><FileStack className="h-4 w-4 text-blue-600" /><span>View report downloads</span><ArrowRight className="ml-auto h-3.5 w-3.5" /></Link>
              <Link to="/settings" className="quick-action"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span>Check system status</span><ArrowRight className="ml-auto h-3.5 w-3.5" /></Link>
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Explore with sample data</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">Start from a sample document set</h2></div>
          <p className="text-xs text-slate-400">Creates an investigation using the included dataset.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {samples.map(({ id, title, meta, icon: Icon, tone }) => (
            <button type="button" key={id} onClick={() => void launchSample(id, title)} disabled={seeding !== null} className={`sample-card sample-${tone}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"><Icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1 text-left"><span className="block text-[13px] font-semibold text-slate-800">{title}</span><span className="mt-1 block text-[11px] text-slate-500">{meta}</span></span>
              {seeding === id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowDownRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
