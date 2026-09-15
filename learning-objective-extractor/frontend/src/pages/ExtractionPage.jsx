import { motion } from 'framer-motion'
import { Download, Filter, Search, Target, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BloomBars } from '@/components/charts/Charts'
import { PageHeader } from '@/components/layout/Shell'
import { BloomBadge, Button, Card, ConfidencePill, CopyButton, EmptyState, KindTag, Skeleton } from '@/components/ui/Bits'
import { BLOOM_LEVELS, BLOOM_META } from '@/lib/constants'
import { useResultLoader } from '@/hooks/useAnalysis'
import { cn, pct } from '@/lib/utils'

export default function ExtractionPage() {
  const { result, loading } = useResultLoader()
  const [query, setQuery] = useState('')
  const [levels, setLevels] = useState(new Set(BLOOM_LEVELS))
  const [kind, setKind] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    setQuery('')
    setLevels(new Set(BLOOM_LEVELS))
    setKind('all')
  }, [result?.job_id])

  const filtered = useMemo(() => {
    if (!result) return []
    return result.objectives.filter((o) => {
      if (!levels.has(o.bloom_level)) return false
      if (kind !== 'all' && o.kind !== kind) return false
      if (query && !o.text.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [result, levels, kind, query])

  const grouped = useMemo(() => {
    const g = {}
    for (const l of BLOOM_LEVELS) g[l] = filtered.filter((o) => o.bloom_level === l)
    return g
  }, [filtered])

  const toggleLevel = (l) => {
    setLevels((prev) => {
      const next = new Set(prev)
      if (next.has(l)) next.delete(l)
      else next.add(l)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!result) {
    return (
      <div>
        <PageHeader title="Objective Extraction" sub="AI-generated measurable objectives" />
        <EmptyState
          icon={Target} title="No extraction results yet"
          sub="Upload educational content and run the AI pipeline to generate Bloom-classified learning objectives."
          action={<Link to="/app/upload" className="btn-primary"><UploadCloud size={16} /> Upload content</Link>}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Objective Extraction"
        sub={`${result.title} · engine: ${result.engine === 'gemini' ? 'Gemini 2.5 Flash' : 'Offline'}`}
        actions={
          <>
            <CopyButton text={result.objectives.map((o, i) => `${i + 1}. [${o.bloom_level}] ${o.text}`).join('\n')} label="Copy all" />
            <Button variant="secondary" onClick={() => navigate('/app/export')}><Download size={15} /> Export</Button>
          </>
        }
      />

      {result.summary && (
        <Card className="mb-4 border-l-4 !border-l-primary bg-primary-50/40">
          <p className="text-sm leading-relaxed text-ink"><span className="font-bold">Summary: </span>{result.summary}</p>
        </Card>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: 'Objectives', v: result.objectives.length },
          { l: 'Skills', v: result.skills.length },
          { l: 'Avg confidence', v: pct(result.avg_confidence) },
          { l: 'Coverage', v: `${Math.round(result.coverage_score)}/100` },
        ].map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="stat-card !min-h-[104px]">
              <p className="text-2xl font-extrabold text-ink">{s.v}</p>
              <p className="text-[13px] font-medium text-muted">{s.l}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mt-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search objectives…" className="input !pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-muted" />
            {['all', 'explicit', 'implicit'].map((k) => (
              <button key={k} onClick={() => setKind(k)}
                className={cn('rounded-lg px-3 py-1.5 text-[13px] font-bold capitalize transition',
                  kind === k ? 'bg-ink text-white' : 'bg-secondarybg text-muted hover:text-ink')}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {BLOOM_LEVELS.map((l) => (
            <button key={l} onClick={() => toggleLevel(l)}
              className={cn('transition', levels.has(l) ? 'opacity-100' : 'opacity-30 grayscale')}>
              <BloomBadge level={l} count={result.bloom_distribution[l] || 0} />
            </button>
          ))}
          <span className="ml-auto self-center text-xs font-semibold text-muted">
            Showing {filtered.length} of {result.objectives.length}
          </span>
        </div>
      </Card>

      {/* Grouped objectives */}
      <div className="mt-4 space-y-4">
        {BLOOM_LEVELS.map((lvl) => {
          const objs = grouped[lvl]
          if (!objs.length) return null
          return (
            <Card key={lvl} className="!p-0 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border bg-secondarybg/60 px-5 py-3.5">
                <BloomBadge level={lvl} count={objs.length} />
                <span className="hidden text-[13px] text-muted sm:inline">{BLOOM_META[lvl].desc}</span>
                <span className="ml-auto text-xs font-semibold text-muted">
                  {BLOOM_META[lvl].verbs.join(' · ')}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {objs.map((o, i) => (
                  <motion.li key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="group flex flex-wrap items-center gap-2.5 px-5 py-3.5 transition hover:bg-secondarybg/60">
                    <p className="min-w-[200px] flex-1 text-sm font-medium leading-relaxed text-ink">{o.text}</p>
                    <div className="flex items-center gap-2">
                      <KindTag kind={o.kind} />
                      <ConfidencePill value={o.confidence} />
                      <span className="opacity-0 transition group-hover:opacity-100">
                        <CopyButton text={o.text} label="" />
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <EmptyState icon={Search} title="No objectives match your filters"
            sub="Try widening the Bloom levels or clearing the search." />
        )}
      </div>

      {/* Mini distribution */}
      <Card className="mt-4">
        <h3 className="mb-4 font-bold text-ink">Bloom distribution</h3>
        <BloomBars dist={result.bloom_distribution} />
      </Card>
    </div>
  )
}
