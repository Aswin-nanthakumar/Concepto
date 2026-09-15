import { motion } from 'framer-motion'
import {
  ArrowRight, BarChart3, ClipboardCheck, FileText, Pyramid, Sparkles,
  Target, UploadCloud,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BloomBars, BloomDonut, CoverageGauge } from '@/components/charts/Charts'
import { PageHeader } from '@/components/layout/Shell'
import { Badge, Card, EmptyState, Skeleton } from '@/components/ui/Bits'
import { useApp } from '@/context/AppContext'
import { useDashboard } from '@/hooks/useAnalysis'
import { api } from '@/lib/api'
import { pct, timeAgo } from '@/lib/utils'

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboard()
  const { result, selectResult, switchDocument, toast, lastJobId } = useApp()
  const navigate = useNavigate()

  const openJob = async (jobId) => {
    switchDocument(jobId)
    try {
      const res = await api.results(jobId)
      selectResult(res)
      navigate(`/app/extraction?doc=${jobId}`)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const stats = [
    { label: 'Total analyses', value: data?.total_analyses ?? 0, icon: FileText, tint: 'bg-primary-50 text-primary' },
    { label: 'Objectives generated', value: data?.total_objectives ?? 0, icon: Target, tint: 'bg-emerald-50 text-success' },
    { label: 'Avg confidence', value: data?.avg_confidence ? pct(data.avg_confidence) : '—', icon: Sparkles, tint: 'bg-amber-50 text-warning' },
    { label: 'Avg coverage', value: data ? `${Math.round(data.avg_coverage)}/100` : '—', icon: BarChart3, tint: 'bg-violet-50 text-violet-600' },
  ]

  return (
    <div>
      <PageHeader
        title="Concepto Dashboard"
        sub="Your educational intelligence overview"
        actions={
          <Link to="/app/upload" className="btn-primary"><UploadCloud size={16} /> New analysis</Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[132px]" />)
          : stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="stat-card">
                <div className={`mb-2 inline-flex w-fit rounded-xl p-2 ${s.tint}`}><s.icon size={18} /></div>
                <p className="text-2xl font-extrabold text-ink">{s.value}</p>
                <p className="text-[13px] font-medium text-muted">{s.label}</p>
              </div>
            </motion.div>
          ))}
      </div>

      {isError && (
        <div className="card mt-4 border-danger/30 bg-red-50 p-4 text-sm font-medium text-red-700">
          Could not reach the backend. Start it with <code className="rounded bg-white px-1.5 py-0.5">uvicorn app.main:app</code> or
          set <code className="rounded bg-white px-1.5 py-0.5">VITE_API_URL</code> to your Render URL.
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Current / aggregate bloom */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="section-title flex items-center gap-2"><Pyramid size={18} className="text-primary" /> Bloom distribution</h3>
              <p className="section-sub">{result ? `Current: ${result.title}` : 'Across all completed analyses'}</p>
            </div>
            {result && <Badge className="border-primary/20 bg-primary-50 text-primary-700">Live</Badge>}
          </div>
          {isLoading ? <Skeleton className="h-44" />
            : <BloomDonut dist={result ? result.bloom_distribution : data?.bloom_totals} />}
          <div className="mt-4">
            <BloomBars dist={result ? result.bloom_distribution : data?.bloom_totals} compact />
          </div>
        </Card>

        {/* Coverage + quick actions */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="flex items-center gap-4">
            <CoverageGauge value={result ? result.coverage_score : data?.avg_coverage || 0} size={130} />
            <div className="text-sm">
              <h3 className="font-bold text-ink">Coverage score</h3>
              <p className="mt-1 leading-relaxed text-muted">
                {result
                  ? `${result.objectives.length} objectives across ${Object.values(result.bloom_distribution).filter(Boolean).length} Bloom levels.`
                  : 'Run your first analysis to measure curriculum coverage.'}
              </p>
              {result && (
                <button onClick={() => navigate('/app/analytics')} className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:underline">
                  View analytics <ArrowRight size={14} />
                </button>
              )}
            </div>
          </Card>
          <Card>
            <h3 className="mb-3 font-bold text-ink">Quick actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/app/upload', icon: UploadCloud, t: 'Upload' },
                { to: '/app/extraction', icon: Target, t: 'Objectives' },
                { to: '/app/assessments', icon: ClipboardCheck, t: 'Assessments' },
                { to: '/app/export', icon: BarChart3, t: 'Export' },
              ].map((a) => (
                <Link key={a.t} to={a.to} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/40 hover:bg-primary-50">
                  <a.icon size={16} className="text-primary" /> {a.t}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent */}
      <Card className="mt-4 !p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="section-title">Recent analyses</h3>
          <Link to="/app/history" className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
        ) : data?.recent?.length ? (
          <ul className="divide-y divide-border">
            {data.recent.map((r) => (
              <li key={r.job_id}>
                <button onClick={() => r.status === 'completed' && openJob(r.job_id)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-secondarybg disabled:cursor-default">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <FileText size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{r.title}</p>
                    <p className="text-xs text-muted">{r.objective_count} objectives · {timeAgo(r.created_at)}</p>
                  </div>
                  <Badge className={r.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                    {r.status}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={UploadCloud} title="No analyses yet"
              sub="Upload your first chapter, lesson, or transcript to see it here."
              action={<Link to="/app/upload" className="btn-primary">Upload content</Link>}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
