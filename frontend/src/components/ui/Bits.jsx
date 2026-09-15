import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Copy, Check, Info } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BLOOM_COLORS, BLOOM_META } from '@/lib/constants'
import { copyText } from '@/lib/utils'

export function Button({ variant = 'primary', className, children, ...props }) {
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-secondary'
  return <button className={cn(cls, className)} {...props}>{children}</button>
}

export function Card({ className, children, ...props }) {
  return <div className={cn('card p-5', className)} {...props}>{children}</div>
}

export function Badge({ className, children, ...props }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', className)} {...props}>
      {children}
    </span>
  )
}

export function BloomBadge({ level, count }) {
  const color = BLOOM_COLORS[level] || '#64748B'
  const label = BLOOM_META[level]?.label || level
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
      {count != null && <span className="opacity-80 font-semibold">· {count}</span>}
    </span>
  )
}

export function KindTag({ kind }) {
  const explicit = kind === 'explicit'
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
      explicit ? 'border-primary/30 bg-primary-50 text-primary-700' : 'border-violet-200 bg-violet-50 text-violet-700')}>
      {explicit ? 'Explicit' : 'Implicit'}
    </span>
  )
}

export function Progress({ value, color = '#2563EB', className }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-100', className)} />
}

export function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      {Icon && <div className="mb-1 rounded-2xl bg-secondarybg p-3.5 text-muted"><Icon size={26} /></div>}
      <p className="text-base font-bold text-ink">{title}</p>
      {sub && <p className="max-w-sm text-sm text-muted">{sub}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation()
        try { await copyText(text); } catch { /* noop */ }
        setDone(true)
        setTimeout(() => setDone(false), 1400)
      }}
      className="btn-ghost !px-2.5 !py-1.5 text-xs"
      title={label}
    >
      {done ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      {done ? 'Copied' : label}
    </button>
  )
}

export function ConfidencePill({ value }) {
  const v = value ?? 0
  const tone = v >= 0.85 ? 'text-success bg-emerald-50 border-emerald-200'
    : v >= 0.65 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-danger bg-red-50 border-red-200'
  return <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold', tone)}>{Math.round(v * 100)}%</span>
}

export function Toasts({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-border bg-white p-3.5 shadow-lift"
        >
          {t.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
            : t.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
            : <Info size={18} className="mt-0.5 shrink-0 text-primary" />}
          <p className="text-sm font-medium text-ink">{t.message}</p>
        </motion.div>
      ))}
    </div>
  )
}

export function PipelineSteps({ active = -1, failed = false }) {
  const steps = ['Parsing', 'Detecting type', 'Extracting concepts', 'Generating objectives', 'Bloom classifying', 'Building assessments', 'Gap analysis']
  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((s, i) => {
        const done = i < active || (!failed && active >= steps.length)
        const current = i === active && !failed
        return (
          <div key={s} className="flex items-center gap-3">
            <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
              done ? 'bg-success text-white' : current ? 'bg-primary text-white' : 'bg-slate-100 text-muted')}>
              {done ? <Check size={13} /> : i + 1}
            </div>
            <span className={cn('text-sm', done || current ? 'font-semibold text-ink' : 'text-muted')}>{s}</span>
            {current && <span className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />}
          </div>
        )
      })}
    </div>
  )
}
