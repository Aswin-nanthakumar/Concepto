import { AlertTriangle, BarChart3, CheckCircle2, Target, TrendingUp, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BloomBars, ConfidenceHist, CoverageGauge, SkillHeatmap } from '@/components/charts/Charts'
import { PageHeader } from '@/components/layout/Shell'
import { Badge, Card, EmptyState, Progress } from '@/components/ui/Bits'
import { useResultLoader } from '@/hooks/useAnalysis'
import { BLOOM_LEVELS } from '@/lib/constants'
import { pct } from '@/lib/utils'

export default function AnalyticsPage() {
  const { result, loading } = useResultLoader()

  if (loading) return <p className="text-sm text-muted">Loading…</p>
  if (!result) {
    return (
      <div>
        <PageHeader title="Analytics" sub="Coverage, confidence & gaps" />
        <EmptyState icon={BarChart3} title="No analytics yet"
          sub="Run an analysis to unlock coverage metrics, confidence trends, and gap detection."
          action={<Link to="/app/upload" className="btn-primary"><UploadCloud size={16} /> Upload content</Link>} />
      </div>
    )
  }

  const explicit = result.objectives.filter((o) => o.kind === 'explicit').length
  const implicit = result.objectives.length - explicit
  const high = result.objectives.filter((o) => o.confidence >= 0.85).length
  const med = result.objectives.filter((o) => o.confidence >= 0.65 && o.confidence < 0.85).length
  const low = result.objectives.length - high - med
  const coveredLevels = BLOOM_LEVELS.filter((l) => (result.bloom_distribution[l] || 0) > 0).length

  const sevStyle = {
    high: 'border-red-200 bg-red-50 text-red-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }

  return (
    <div>
      <PageHeader title="Analytics" sub={`${result.title} · deep quality metrics`} />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="stat-card items-center justify-center !min-h-[150px]">
          <CoverageGauge value={result.coverage_score} size={120} />
        </div>
        <div className="stat-card justify-center">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-muted"><TrendingUp size={15} /> Avg confidence</p>
          <p className="text-3xl font-extrabold text-ink">{pct(result.avg_confidence)}</p>
          <Progress value={result.avg_confidence * 100} color="#2563EB" className="mt-2" />
        </div>
        <div className="stat-card justify-center">
          <p className="text-[13px] font-semibold text-muted">Explicit vs implicit</p>
          <p className="text-3xl font-extrabold text-ink">{explicit}<span className="text-lg text-muted"> / {implicit}</span></p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full">
            <div className="bg-primary" style={{ width: `${(explicit / Math.max(1, result.objectives.length)) * 100}%` }} />
            <div className="bg-violet-400" style={{ width: `${(implicit / Math.max(1, result.objectives.length)) * 100}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-muted">Directly taught vs inferred prerequisites</p>
        </div>
        <div className="stat-card justify-center">
          <p className="text-[13px] font-semibold text-muted">Bloom breadth</p>
          <p className="text-3xl font-extrabold text-ink">{coveredLevels}<span className="text-lg text-muted"> / 6</span></p>
          <Progress value={(coveredLevels / 6) * 100} color="#8B5CF6" className="mt-2" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 font-bold text-ink">Confidence distribution</h3>
          <p className="mb-4 text-[13px] text-muted">How certain the AI is about each objective.</p>
          <ConfidenceHist objectives={result.objectives} />
          <div className="mt-4 flex gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">High {high}</span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">Medium {med}</span>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-600">Low {low}</span>
          </div>
        </Card>
        <Card>
          <h3 className="mb-1 font-bold text-ink">Bloom balance</h3>
          <p className="mb-4 text-[13px] text-muted">Objective counts per cognitive level.</p>
          <BloomBars dist={result.bloom_distribution} />
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="mb-1 font-bold text-ink">Skill × Bloom heatmap</h3>
        <p className="mb-4 text-[13px] text-muted">Skill frequency across cognitive levels — darker means stronger signal.</p>
        <SkillHeatmap skills={result.skills} />
      </Card>

      {/* Gap analysis */}
      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <h3 className="section-title">Learning gap analysis</h3>
          <Badge className="border-border bg-white text-slate-600">{result.gaps.length} findings</Badge>
        </div>
        {result.gaps.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {result.gaps.map((g, i) => (
              <Card key={i} className="card-hover">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={sevStyle[g.severity] || sevStyle.medium}>{g.severity.toUpperCase()}</Badge>
                  <Badge className="border-border bg-secondarybg capitalize text-slate-600">{g.category.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-2.5 flex items-start gap-2 font-bold text-ink">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" /> {g.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{g.description}</p>
                <p className="mt-2.5 flex items-start gap-2 rounded-xl bg-emerald-50/70 p-3 text-[13px] leading-relaxed text-emerald-900">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                  <span><span className="font-bold">Recommendation: </span>{g.recommendation}</span>
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={CheckCircle2} title="No gaps detected"
            sub="This content shows strong, balanced coverage across all dimensions." />
        )}
      </div>
    </div>
  )
}
