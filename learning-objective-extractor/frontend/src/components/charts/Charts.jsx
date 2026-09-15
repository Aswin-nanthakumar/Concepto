import { motion } from 'framer-motion'
import { Fragment, useMemo } from 'react'
import { BLOOM_COLORS, BLOOM_LEVELS, BLOOM_META } from '@/lib/constants'

/* Donut chart (pure SVG, no deps) */
export function BloomDonut({ dist, size = 180 }) {
  const total = BLOOM_LEVELS.reduce((s, l) => s + (dist?.[l] || 0), 0) || 1
  const R = 54
  const C = 2 * Math.PI * R
  let acc = 0
  const segs = BLOOM_LEVELS.map((l) => {
    const frac = (dist?.[l] || 0) / total
    const seg = { level: l, frac, dash: frac * C, offset: acc * C }
    acc += frac
    return seg
  })
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 140 140" width={size} height={size} className="-rotate-90">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#F1F5F9" strokeWidth="20" />
          {segs.filter((s) => s.frac > 0).map((s) => (
            <motion.circle
              key={s.level}
              cx="70" cy="70" r={R} fill="none"
              stroke={BLOOM_COLORS[s.level]} strokeWidth="20"
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: -s.offset }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-ink">{total === 1 && !BLOOM_LEVELS.some((l) => dist?.[l]) ? 0 : total}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">objectives</span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2">
        {BLOOM_LEVELS.map((l) => (
          <div key={l} className="flex items-center gap-2 text-[13px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: BLOOM_COLORS[l] }} />
            <span className="font-semibold text-ink">{BLOOM_META[l].label}</span>
            <span className="ml-auto font-bold text-muted">{dist?.[l] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Horizontal bars */
export function BloomBars({ dist, compact = false }) {
  const max = Math.max(1, ...BLOOM_LEVELS.map((l) => dist?.[l] || 0))
  return (
    <div className="flex flex-col gap-2.5">
      {BLOOM_LEVELS.map((l, i) => {
        const v = dist?.[l] || 0
        return (
          <div key={l} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[13px] font-semibold text-ink">{BLOOM_META[l].label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: BLOOM_COLORS[l] }}
                initial={{ width: 0 }}
                animate={{ width: `${(v / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-[13px] font-bold text-muted">{v}</span>
            {!compact && <span className="hidden w-14 shrink-0 text-right text-[11px] text-muted sm:block">{BLOOM_META[l].verbs[0]}</span>}
          </div>
        )
      })}
    </div>
  )
}

/* Skill heatmap: skills x bloom presence */
export function SkillHeatmap({ skills }) {
  const rows = useMemo(() => (skills || []).slice(0, 12), [skills])
  if (!rows.length) return <p className="text-sm text-muted">No skills detected yet.</p>
  const maxF = Math.max(1, ...rows.map((s) => s.frequency || 1))
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="grid grid-cols-[180px_repeat(6,1fr)] gap-1.5">
          <div />
          {BLOOM_LEVELS.map((l) => (
            <div key={l} className="pb-1 text-center text-[11px] font-bold" style={{ color: BLOOM_COLORS[l] }}>
              {BLOOM_META[l].label.slice(0, 4)}
            </div>
          ))}
          {rows.map((s) => (
            <Fragment key={s.name}>
              <div className="truncate py-1 pr-2 text-[13px] font-semibold text-ink" title={s.name}>{s.name}</div>
              {BLOOM_LEVELS.map((l) => {
                const on = (s.bloom_levels || []).includes(l)
                const heat = on ? 0.35 + 0.65 * ((s.frequency || 1) / maxF) : 0
                return (
                  <div
                    key={`${s.name}-${l}`}
                    title={`${s.name} · ${l} ${on ? `· x${s.frequency}` : '· —'}`}
                    className="flex h-9 items-center justify-center rounded-lg border text-[11px] font-bold"
                    style={{
                      backgroundColor: on ? `${BLOOM_COLORS[l]}${Math.round(heat * 255).toString(16).padStart(2, '0')}` : '#F8FAFC',
                      borderColor: on ? BLOOM_COLORS[l] : '#E2E8F0',
                      color: on && heat > 0.6 ? '#fff' : on ? '#0F172A' : '#CBD5E1',
                    }}
                  >
                    {on ? `x${s.frequency}` : '·'}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Confidence distribution histogram */
export function ConfidenceHist({ objectives }) {
  const buckets = useMemo(() => {
    const b = [0, 0, 0, 0, 0]
    for (const o of objectives || []) {
      const c = o.confidence ?? 0
      b[c >= 0.9 ? 4 : c >= 0.8 ? 3 : c >= 0.7 ? 2 : c >= 0.6 ? 1 : 0] += 1
    }
    return b
  }, [objectives])
  const labels = ['<60%', '60–70', '70–80', '80–90', '90+']
  const max = Math.max(1, ...buckets)
  return (
    <div className="flex h-40 items-end gap-3">
      {buckets.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-xs font-bold text-ink">{v}</span>
          <motion.div
            className="w-full rounded-t-lg bg-primary"
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            style={{ opacity: 0.45 + (i / 4) * 0.55, maxHeight: '100%' }}
          />
          <span className="text-[11px] font-semibold text-muted">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

/* Coverage gauge */
export function CoverageGauge({ value = 0, size = 150 }) {
  const frac = Math.min(1, Math.max(0, value / 100))
  const R = 60
  const arc = Math.PI * R
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 140 80" width={size} height={size * 0.57}>
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#F1F5F9" strokeWidth="14" strokeLinecap="round" />
        <motion.path
          d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#2563EB" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={arc}
          initial={{ strokeDashoffset: arc }}
          animate={{ strokeDashoffset: arc * (1 - frac) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="-mt-9 text-center">
        <p className="text-2xl font-extrabold text-ink">{Math.round(value)}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">coverage</p>
      </div>
    </div>
  )
}
