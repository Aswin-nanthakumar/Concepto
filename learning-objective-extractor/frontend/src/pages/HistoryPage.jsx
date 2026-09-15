import { Eye, FileText, History, Search, Trash2, UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/Shell'
import { Badge, Card, EmptyState, Skeleton } from '@/components/ui/Bits'
import { useApp } from '@/context/AppContext'
import { useHistory } from '@/hooks/useAnalysis'
import { api } from '@/lib/api'
import { pct, timeAgo } from '@/lib/utils'

export default function HistoryPage() {
  const { data, isLoading, refetch } = useHistory()
  const { selectResult, switchDocument, toast } = useApp()
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const items = useMemo(() => {
    if (!data) return []
    return data.filter((j) =>
      !query || j.title.toLowerCase().includes(query.toLowerCase()) ||
      (j.filename || '').toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

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

  const remove = async (jobId) => {
    if (!window.confirm('Delete this analysis permanently?')) return
    setDeleting(jobId)
    try {
      await api.deleteJob(jobId)
      toast('Analysis deleted', 'success')
      refetch()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Processing History"
        sub={`${items.length} record${items.length === 1 ? '' : 's'}`}
        actions={
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search history…" className="input !pl-10" />
          </div>
        }
      />

      <Card className="!p-0 overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
        ) : items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-border bg-secondarybg/70">
                <tr>
                  <th className="table-head">Analysis</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Status</th>
                  <th className="table-head text-right">Objectives</th>
                  <th className="table-head text-right">Coverage</th>
                  <th className="table-head text-right">Confidence</th>
                  <th className="table-head text-right">Created</th>
                  <th className="table-head text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((j) => (
                  <tr key={j.job_id} className="transition hover:bg-secondarybg/60">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                          <FileText size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-bold text-ink">{j.title}</p>
                          <p className="truncate text-xs text-muted">{j.filename} · {j.word_count.toLocaleString()} words</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><Badge className="border-border bg-secondarybg capitalize text-slate-600">{j.content_type}</Badge></td>
                    <td className="table-cell">
                      <Badge className={j.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : j.status === 'failed' ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-amber-200 bg-amber-50 text-amber-700'}>
                        {j.status}
                      </Badge>
                    </td>
                    <td className="table-cell text-right font-bold text-ink">{j.objective_count}</td>
                    <td className="table-cell text-right font-semibold text-muted">{j.coverage_score ? `${Math.round(j.coverage_score)}` : '—'}</td>
                    <td className="table-cell text-right font-semibold text-muted">{j.avg_confidence ? pct(j.avg_confidence) : '—'}</td>
                    <td className="table-cell whitespace-nowrap text-right text-muted">{timeAgo(j.created_at)}</td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-1">
                        {j.status === 'completed' && (
                          <button onClick={() => openJob(j.job_id)} className="btn-ghost !px-2.5 !py-1.5 text-xs" title="Open results">
                            <Eye size={15} /> Open
                          </button>
                        )}
                        <button onClick={() => remove(j.job_id)} disabled={deleting === j.job_id}
                          className="btn-ghost !px-2.5 !py-1.5 text-xs hover:!text-danger" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={History} title={query ? 'No matches found' : 'No history yet'}
              sub={query ? 'Try a different search term.' : 'Your past analyses will appear here with full stats.'}
              action={!query && <Link to="/app/upload" className="btn-primary"><UploadCloud size={16} /> Start analyzing</Link>}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
