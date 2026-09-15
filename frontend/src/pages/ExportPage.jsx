import { motion } from 'framer-motion'
import { Braces, Download, FileSpreadsheet, FileText, FileType2, Loader2, UploadCloud } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/Shell'
import { Button, Card, EmptyState } from '@/components/ui/Bits'
import { useApp } from '@/context/AppContext'
import { useResultLoader } from '@/hooks/useAnalysis'
import { api } from '@/lib/api'
import { downloadBlob } from '@/lib/utils'
import { cn } from '@/lib/utils'

const FORMATS = [
  { id: 'json', label: 'JSON', desc: 'Structured data for integrations & LMS imports', icon: Braces, ext: 'json' },
  { id: 'csv', label: 'CSV', desc: 'Objectives, skills & concepts for spreadsheets', icon: FileSpreadsheet, ext: 'csv' },
  { id: 'md', label: 'Markdown', desc: 'Readable report for docs, Notion & GitHub', icon: FileText, ext: 'md' },
  { id: 'pdf', label: 'PDF', desc: 'Polished shareable report for stakeholders', icon: FileType2, ext: 'pdf' },
]

export default function ExportPage() {
  const { result, loading } = useResultLoader()
  const { toast, settings } = useApp()
  const [busy, setBusy] = useState(null)
  const [preview, setPreview] = useState({ format: null, text: '' })

  useEffect(() => {
    setPreview({ format: null, text: '' })
    setBusy(null)
  }, [result?.job_id])

  if (loading) return <p className="text-sm text-muted">Loading…</p>
  if (!result) {
    return (
      <div>
        <PageHeader title="Export Center" sub="Download your results" />
        <EmptyState icon={Download} title="Nothing to export yet"
          sub="Run an analysis first, then export it as JSON, CSV, Markdown, or PDF."
          action={<Link to="/app/upload" className="btn-primary"><UploadCloud size={16} /> Upload content</Link>} />
      </div>
    )
  }

  const doExport = async (fmt) => {
    setBusy(fmt.id)
    try {
      const blob = await api.exportBlob(result.job_id, fmt.id)
      const safe = (result.title || 'analysis').replace(/[^a-z0-9-_]+/gi, '-').slice(0, 40) || 'analysis'
      downloadBlob(blob, `${safe}.${fmt.ext}`)
      toast(`${fmt.label} downloaded`, 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(null)
    }
  }

  const doPreview = async (fmt) => {
    if (preview.format === fmt.id) {
      setPreview({ format: null, text: '' })
      return
    }
    if (fmt.id === 'pdf') {
      toast('PDF preview is not available — download to view.', 'info')
      return
    }
    setBusy(`preview-${fmt.id}`)
    try {
      const blob = await api.exportBlob(result.job_id, fmt.id)
      const text = await blob.text()
      setPreview({ format: fmt.id, text: text.slice(0, 6000) })
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <PageHeader title="Export Center" sub={`Export "${result.title}" — exports always match displayed data`} />

      {(settings?.institutionName || settings?.instructorName) && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary-50/60 px-4 py-2.5 text-xs text-primary-900 shadow-sm">
          <span>
            Branded report active: <strong>{[settings.instructorName, settings.institutionName].filter(Boolean).join(' · ')}</strong>
          </span>
          <Link to="/app/settings" className="font-semibold text-primary underline hover:text-primary-800">
            Edit branding
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FORMATS.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="card-hover flex h-full flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex w-fit rounded-xl bg-primary-50 p-2.5 text-primary"><f.icon size={20} /></div>
                {f.id === (settings?.defaultExportFormat || 'pdf') && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Preferred</span>
                )}
              </div>
              <h3 className="font-extrabold text-ink">{f.label}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">{f.desc}</p>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => doExport(f)} disabled={!!busy} className="!px-3.5 !py-2 text-[13px]">
                  {busy === f.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Download
                </Button>
                {f.id !== 'pdf' && (
                  <button onClick={() => doPreview(f)} disabled={!!busy}
                    className={cn('rounded-xl border px-3 py-2 text-[13px] font-semibold transition',
                      preview.format === f.id ? 'border-primary bg-primary-50 text-primary-700' : 'border-border text-muted hover:text-ink')}>
                    {busy === `preview-${f.id}` ? '…' : 'Preview'}
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* What's included */}
      <Card className="mt-4">
        <h3 className="mb-3 font-bold text-ink">Included in every export</h3>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
          {[
            `${result.objectives.length} objectives`, `${result.skills.length} skills`,
            `${result.concepts.length} concepts`, `${result.assessments.mcqs.length} MCQs`,
            `${result.assessments.short_answers.length} short answers`,
            `${result.gaps.length} gap findings`,
          ].map((x) => (
            <div key={x} className="rounded-xl bg-secondarybg px-3 py-2.5 text-center text-[13px] font-bold text-ink">{x}</div>
          ))}
        </div>
      </Card>

      {preview.format && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mt-4 !p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-secondarybg px-5 py-3">
              <p className="text-sm font-bold text-ink">Preview · {preview.format.toUpperCase()}</p>
              <button onClick={() => setPreview({ format: null, text: '' })} className="btn-ghost !py-1 text-xs">Close</button>
            </div>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-700">
              {preview.text}
            </pre>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
