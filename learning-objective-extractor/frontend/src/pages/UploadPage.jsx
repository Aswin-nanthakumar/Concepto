import { motion } from 'framer-motion'
import {
  BookOpen, CheckCircle2, Clock3, FileText, FileType, Loader2, Presentation,
  ScrollText, Sparkles, Trash2, Type, UploadCloud,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/Shell'
import { Badge, Button, Card, PipelineSteps } from '@/components/ui/Bits'
import { useApp } from '@/context/AppContext'
import { useAnalyze } from '@/hooks/useAnalysis'
import { api } from '@/lib/api'
import { SAMPLE_TEXTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const TYPE_ICONS = { chapter: BookOpen, lesson: Presentation, syllabus: ScrollText, course: FileText, transcript: Type }

export default function UploadPage() {
  const { upload, setUpload, setResult, setLastJobId, toast, analyzing, settings } = useApp()
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [text, setText] = useState('')
  const [tab, setTab] = useState('file')
  const [step, setStep] = useState(-1)
  const fileRef = useRef(null)
  const analyze = useAnalyze()

  const doUploadFile = async (file) => {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext)) {
      toast('Unsupported file type. Please use PDF, DOCX, or TXT.', 'error')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast('File is larger than 15 MB.', 'error')
      return
    }
    setUploading(true)
    try {
      const res = await api.uploadFile(file)
      setResult(null)
      setUpload(res)
      setLastJobId(res.job_id)
      toast(`"${res.title}" ready — ${res.word_count} words detected`, 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const doUploadText = async (raw, title) => {
    const content = (raw ?? text).trim()
    if (content.length < 50) {
      toast('Please provide at least 50 characters for meaningful analysis.', 'error')
      return
    }
    setUploading(true)
    try {
      const res = await api.uploadText(content, 'pasted-content.txt', title)
      setResult(null)
      setUpload(res)
      setLastJobId(res.job_id)
      toast(`"${res.title}" ready — ${res.word_count} words detected`, 'success')
      if (settings?.autoAnalyzeSamples && raw) {
        setStep(0)
        const timer = setInterval(() => setStep((s) => (s < 6 ? s + 1 : s)), 1400)
        analyze.mutate(
          { jobId: res.job_id },
          { onSettled: () => { clearInterval(timer); setStep(-1) } }
        )
      }
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const startAnalysis = () => {
    if (!upload) return
    setStep(0)
    const timer = setInterval(() => setStep((s) => (s < 6 ? s + 1 : s)), 1400)
    analyze.mutate(
      { jobId: upload.job_id },
      { onSettled: () => { clearInterval(timer); setStep(-1) } }
    )
  }

  const TypeIcon = upload ? TYPE_ICONS[upload.content_type] || FileText : FileText

  return (
    <div>
      <PageHeader title="Upload Content" sub="PDF, DOCX, TXT — or paste text directly" />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Input panel */}
        <Card className="lg:col-span-3">
          <div className="mb-4 inline-flex rounded-xl bg-secondarybg p-1">
            {[{ id: 'file', label: 'Upload file', icon: UploadCloud }, { id: 'text', label: 'Paste text', icon: Type }].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('tab-btn flex items-center gap-2', tab === t.id ? 'bg-white text-ink shadow-card' : 'text-muted hover:text-ink')}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'file' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); doUploadFile(e.dataTransfer.files?.[0]) }}
              onClick={() => fileRef.current?.click()}
              className={cn('flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition',
                dragging ? 'border-primary bg-primary-50' : 'border-border bg-secondarybg/50 hover:border-primary/50 hover:bg-primary-50/40')}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden"
                onChange={(e) => doUploadFile(e.target.files?.[0])} />
              <div className="rounded-2xl bg-white p-4 text-primary shadow-card">
                {uploading ? <Loader2 size={28} className="animate-spin" /> : <UploadCloud size={28} />}
              </div>
              <div>
                <p className="font-bold text-ink">{uploading ? 'Uploading…' : 'Drag & drop your file here'}</p>
                <p className="mt-1 text-sm text-muted">or <span className="font-bold text-primary">browse files</span> · PDF, DOCX, TXT · max 15 MB</p>
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Paste your lesson, chapter, syllabus, or lecture transcript here (min 50 characters)…"
                className="input min-h-[240px] resize-y leading-relaxed"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
                <Button onClick={() => doUploadText()} disabled={uploading || text.trim().length < 50}>
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {uploading ? 'Processing…' : 'Use this text'}
                </Button>
              </div>
            </div>
          )}

          {/* Samples */}
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2.5 text-[13px] font-bold text-ink">No file handy? Try a sample:</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {SAMPLE_TEXTS.map((s) => (
                <button key={s.id} disabled={uploading}
                  onClick={() => doUploadText(s.text, s.title)}
                  className="group rounded-xl border border-border p-3 text-left transition hover:border-primary/40 hover:bg-primary-50 disabled:opacity-50">
                  <p className="text-[13px] font-bold text-ink group-hover:text-primary-700">{s.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{s.text.slice(0, 90)}…</p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Preview / status panel */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <h3 className="mb-3 font-bold text-ink">Content preview</h3>
            {!upload ? (
              <div className="rounded-xl bg-secondarybg p-6 text-center text-sm text-muted">
                <FileType size={28} className="mx-auto mb-2 text-slate-300" />
                Upload or paste content to see a preview with word count, reading time & type detection.
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary-50 p-2.5 text-primary"><TypeIcon size={20} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink">{upload.title}</p>
                    <p className="truncate text-xs text-muted">{upload.filename}</p>
                  </div>
                  <button onClick={() => { setUpload(null); setResult(null); setLastJobId(null); }} className="btn-ghost !p-2" title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="border-primary/20 bg-primary-50 text-primary-700 capitalize">{upload.content_type}</Badge>
                  <Badge className="border-border bg-secondarybg text-slate-600 uppercase">{upload.source_type}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    { v: upload.word_count.toLocaleString(), l: 'words' },
                    { v: `${upload.reading_minutes}m`, l: 'read time', icon: Clock3 },
                    { v: upload.char_count.toLocaleString(), l: 'chars' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-secondarybg px-2 py-2.5">
                      <p className="text-sm font-extrabold text-ink">{s.v}</p>
                      <p className="text-[11px] font-medium text-muted">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 max-h-44 overflow-y-auto rounded-xl border border-border bg-secondarybg/60 p-3 text-[13px] leading-relaxed text-slate-600">
                  {upload.preview}
                </div>
              </motion.div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-bold text-ink"><Sparkles size={17} className="text-primary" /> AI pipeline</h3>
            {analyzing || step >= 0 ? (
              <PipelineSteps active={step} />
            ) : (
              <>
                <p className="text-sm leading-relaxed text-muted">
                  {settings.maxObjectives} objectives · {settings.difficulty} difficulty ·
                  assessments {settings.includeAssessments ? 'on' : 'off'} · gaps {settings.includeGaps ? 'on' : 'off'}
                </p>
                <Button onClick={startAnalysis} disabled={!upload} className="mt-3 w-full !py-3">
                  <Sparkles size={16} /> {upload ? 'Extract learning objectives' : 'Upload content first'}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
