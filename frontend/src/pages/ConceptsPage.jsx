import { motion } from 'framer-motion'
import { BookMarked, Link2, Network, Search, UploadCloud, Wrench } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SkillHeatmap } from '@/components/charts/Charts'
import { PageHeader } from '@/components/layout/Shell'
import { Badge, Card, ConfidencePill, EmptyState, Progress } from '@/components/ui/Bits'
import { useResultLoader } from '@/hooks/useAnalysis'
import { BLOOM_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ConceptsPage() {
  const { result, loading } = useResultLoader()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('concepts')

  useEffect(() => {
    setQuery('')
    setTab('concepts')
  }, [result?.job_id])

  const concepts = useMemo(() => {
    if (!result) return []
    return [...result.concepts]
      .sort((a, b) => b.importance - a.importance)
      .filter((c) => !query || c.name.toLowerCase().includes(query.toLowerCase()))
  }, [result, query])

  const skills = useMemo(() => {
    if (!result) return []
    return [...result.skills]
      .sort((a, b) => b.frequency - a.frequency)
      .filter((s) => !query || s.name.toLowerCase().includes(query.toLowerCase()))
  }, [result, query])

  if (loading) return <p className="text-sm text-muted">Loading…</p>
  if (!result) {
    return (
      <div>
        <PageHeader title="Concept Explorer" sub="Skills, concepts & relationships" />
        <EmptyState icon={Network} title="No concepts yet"
          sub="Run an analysis to extract skills and key concepts from your content."
          action={<Link to="/app/upload" className="btn-primary"><UploadCloud size={16} /> Upload content</Link>} />
      </div>
    )
  }

  const objById = Object.fromEntries(result.objectives.map((o) => [o.id, o]))

  return (
    <div>
      <PageHeader
        title="Concept Explorer"
        sub={`${result.concepts.length} concepts · ${result.skills.length} skills extracted`}
        actions={
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="input !pl-10" />
          </div>
        }
      />

      <div className="mb-4 inline-flex rounded-xl border border-border bg-white p-1">
        {[{ id: 'concepts', label: `Concepts (${result.concepts.length})`, icon: BookMarked },
          { id: 'skills', label: `Skills (${result.skills.length})`, icon: Wrench }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('tab-btn flex items-center gap-2', tab === t.id ? 'bg-ink text-white' : 'text-muted hover:text-ink')}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'concepts' ? (
        concepts.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                <Card className="card-hover flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-ink">{c.name}</h3>
                    <ConfidencePill value={c.importance} />
                  </div>
                  <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{c.definition || 'Key concept identified in the content.'}</p>
                  <div className="mt-3">
                    <Progress value={c.importance * 100} color="#2563EB" />
                    <p className="mt-1 text-[11px] font-semibold text-muted">Importance {Math.round(c.importance * 100)}%</p>
                  </div>
                  {c.related_objectives?.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
                        <Link2 size={12} /> Linked objectives
                      </p>
                      <ul className="space-y-1">
                        {c.related_objectives.slice(0, 2).map((id) => objById[id] && (
                          <li key={id} className="line-clamp-2 text-xs leading-snug text-slate-600">
                            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: BLOOM_COLORS[objById[id].bloom_level] }} />
                            {objById[id].text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : <EmptyState icon={Search} title="No concepts match" sub="Try a different search term." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-2">
            {skills.length ? skills.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                <Card className="!p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-ink">{s.name}</p>
                    <Badge className="border-border bg-secondarybg text-slate-600">x{s.frequency}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(s.bloom_levels || []).map((l) => (
                      <span key={l} className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ backgroundColor: BLOOM_COLORS[l] }}>
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2.5">
                    <Progress value={s.confidence * 100} color="#10B981" />
                  </div>
                </Card>
              </motion.div>
            )) : <EmptyState icon={Search} title="No skills match" sub="Try a different search term." />}
          </div>
          <Card className="lg:col-span-3">
            <h3 className="mb-1 font-bold text-ink">Skill × Bloom heatmap</h3>
            <p className="mb-4 text-[13px] text-muted">Where each skill appears across cognitive levels.</p>
            <SkillHeatmap skills={result.skills} />
          </Card>
        </div>
      )}
    </div>
  )
}
