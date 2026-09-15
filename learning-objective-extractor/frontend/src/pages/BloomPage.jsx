import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle2, Lightbulb, Pyramid, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BloomBars, BloomDonut } from '@/components/charts/Charts'
import { PageHeader } from '@/components/layout/Shell'
import { BloomBadge, Card, EmptyState, Progress } from '@/components/ui/Bits'
import { useResultLoader } from '@/hooks/useAnalysis'
import { BLOOM_COLORS, BLOOM_LEVELS, BLOOM_META } from '@/lib/constants'

export default function BloomPage() {
  const { result, loading } = useResultLoader()

  if (loading) return <p className="text-sm text-muted">Loading…</p>
  if (!result) {
    return (
      <div>
        <PageHeader title="Bloom Analysis" sub="Cognitive depth breakdown" />
        <EmptyState icon={Pyramid} title="No Bloom data yet"
          sub="Run an analysis to see the cognitive distribution of your content."
          action={<Link to="/app/upload" className="btn-primary"><UploadCloud size={16} /> Upload content</Link>} />
      </div>
    )
  }

  const dist = result.bloom_distribution
  const total = result.objectives.length || 1
  const covered = BLOOM_LEVELS.filter((l) => dist[l] > 0)
  const missing = BLOOM_LEVELS.filter((l) => !dist[l])
  const higherOrder = (dist.analyze || 0) + (dist.evaluate || 0) + (dist.create || 0)
  const higherPct = Math.round((higherOrder / total) * 100)

  const insights = []
  if (missing.length) {
    insights.push({
      tone: 'warn',
      title: `${missing.length} Bloom level${missing.length > 1 ? 's' : ''} missing`,
      desc: `No objectives at: ${missing.map((m) => BLOOM_META[m].label).join(', ')}. Consider adding activities at these levels.`,
    })
  } else {
    insights.push({ tone: 'good', title: 'Full Bloom coverage', desc: 'All six cognitive levels are represented. Excellent breadth.' })
  }
  if (higherPct < 25) {
    insights.push({ tone: 'warn', title: `Only ${higherPct}% higher-order thinking`, desc: 'Analyze, Evaluate, and Create are underrepresented. Add case studies, debates, or design tasks.' })
  } else {
    insights.push({ tone: 'good', title: `${higherPct}% higher-order thinking`, desc: 'Strong presence of analysis, evaluation, and creation. Well balanced for deep learning.' })
  }
  const dom = BLOOM_LEVELS.reduce((a, b) => (dist[a] >= dist[b] ? a : b))
  if ((dist[dom] / total) > 0.45) {
    insights.push({ tone: 'warn', title: `${BLOOM_META[dom].label} dominates (${Math.round((dist[dom] / total) * 100)}%)`, desc: 'Heavy skew toward one level. Diversify activities to build other cognitive skills.' })
  }

  return (
    <div>
      <PageHeader title="Bloom Analysis" sub={`${result.title} · ${total} objectives across ${covered.length}/6 levels`} />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h3 className="mb-4 font-bold text-ink">Distribution overview</h3>
          <BloomDonut dist={dist} />
          <div className="mt-5 border-t border-border pt-4">
            <BloomBars dist={dist} />
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-bold text-ink"><Lightbulb size={17} className="text-warning" /> AI insights</h3>
            <div className="space-y-3">
              {insights.map((ins) => (
                <div key={ins.title} className={`rounded-xl border p-3.5 ${ins.tone === 'warn' ? 'border-amber-200 bg-amber-50/60' : 'border-emerald-200 bg-emerald-50/60'}`}>
                  <p className="flex items-center gap-2 text-sm font-bold text-ink">
                    {ins.tone === 'warn' ? <AlertTriangle size={15} className="text-warning" /> : <CheckCircle2 size={15} className="text-success" />}
                    {ins.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{ins.desc}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-1 font-bold text-ink">Higher-order ratio</h3>
            <p className="mb-3 text-[13px] text-muted">Analyze + Evaluate + Create share</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-ink">{higherPct}%</span>
              <span className="pb-1 text-xs text-muted">target ≥ 30%</span>
            </div>
            <Progress value={higherPct} color={higherPct >= 30 ? '#10B981' : '#F59E0B'} className="mt-2" />
          </Card>
        </div>
      </div>

      {/* Per-level cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BLOOM_LEVELS.map((lvl, i) => {
          const objs = result.objectives.filter((o) => o.bloom_level === lvl)
          const color = BLOOM_COLORS[lvl]
          return (
            <motion.div key={lvl} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="!p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: `${color}14` }}>
                  <BloomBadge level={lvl} count={objs.length} />
                  <span className="text-xs font-bold text-muted">Level {i + 1}</span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[13px] text-muted">{BLOOM_META[lvl].desc}</p>
                  <p className="mt-1.5 text-xs font-semibold" style={{ color }}>Verbs: {BLOOM_META[lvl].verbs.join(' · ')}</p>
                  <div className="mt-3">
                    <Progress value={(objs.length / total) * 100} color={color} />
                    <p className="mt-1 text-[11px] font-semibold text-muted">{Math.round((objs.length / total) * 100)}% of objectives</p>
                  </div>
                  {objs.length > 0 && (
                    <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                      {objs.slice(0, 3).map((o) => (
                        <li key={o.id} className="line-clamp-2 text-[13px] leading-snug text-ink">• {o.text}</li>
                      ))}
                      {objs.length > 3 && (
                        <li>
                          <Link to="/app/extraction" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                            +{objs.length - 3} more <ArrowRight size={12} />
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
