import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3, ClipboardCheck, Download, FileText, GraduationCap, History, LayoutDashboard,
  Menu, Network, Pyramid, Settings, Target, UploadCloud, X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useHistory } from '@/hooks/useAnalysis'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Toasts } from '@/components/ui/Bits'

const ICONS = {
  LayoutDashboard, UploadCloud, Target, Pyramid, Network, ClipboardCheck,
  BarChart3, Download, History, Settings,
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lift">
        <GraduationCap size={20} />
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-tight text-ink">Concepto</p>
        <p className="text-[11px] font-medium text-muted">Objective Extractor</p>
      </div>
    </Link>
  )
}

function SidebarContent({ onNav }) {
  const { result, analyzing } = useApp()
  const [searchParams] = useSearchParams()
  const docId = searchParams.get('doc') || result?.job_id

  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="px-1 pb-4 pt-1"><Logo /></div>
      <Link to="/app/upload" onClick={onNav} className="btn-primary mb-3 w-full !py-2.5">
        <UploadCloud size={16} /> New Analysis
      </Link>
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon] || LayoutDashboard
        // Append ?doc= parameter to analysis detail pages
        const isDetailPage = ['/app/extraction', '/app/bloom', '/app/concepts', '/app/assessments', '/app/analytics', '/app/export'].includes(item.to)
        const targetTo = isDetailPage && docId ? `${item.to}?doc=${docId}` : item.to

        return (
          <NavLink
            key={item.to}
            to={targetTo}
            end={item.end}
            onClick={onNav}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-secondarybg hover:text-ink'
            )}
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        )
      })}
      <div className="mt-auto rounded-xl border border-border bg-secondarybg p-3">
        {analyzing ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-700">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            Analyzing content…
          </div>
        ) : result ? (
          <>
            <p className="truncate text-xs font-bold text-ink">{result.title}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {result.objectives.length} objectives · {Math.round(result.coverage_score)}/100 coverage
            </p>
          </>
        ) : (
          <p className="text-[11px] leading-relaxed text-muted">
            Upload content to generate objectives, Bloom analysis & assessments.
          </p>
        )}
      </div>
    </div>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const { toasts, result, switchDocument } = useApp()
  const { data: historyItems } = useHistory()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeDocId = searchParams.get('doc') || result?.job_id

  const handleDocumentChange = (e) => {
    const selectedId = e.target.value
    if (selectedId && selectedId !== activeDocId) {
      switchDocument(selectedId)
      navigate(`${location.pathname}?doc=${selectedId}`)
    }
  }

  return (
    <div className="min-h-screen bg-secondarybg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-white lg:block">
        <SidebarContent />
      </aside>
      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <button onClick={() => setOpen(false)} className="btn-ghost absolute right-2 top-3">
                <X size={18} />
              </button>
              <SidebarContent onNav={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setOpen(true)} className="btn-ghost lg:hidden"><Menu size={20} /></button>
            <PageCrumb key={location.pathname} />

            {/* Active Document Switcher */}
            {historyItems && historyItems.length > 0 && (
              <div className="hidden md:flex items-center gap-2 ml-4 rounded-xl border border-border bg-secondarybg/80 px-3 py-1.5 text-xs">
                <FileText size={14} className="text-primary shrink-0" />
                <span className="font-semibold text-muted shrink-0">Doc:</span>
                <select
                  value={activeDocId || ''}
                  onChange={handleDocumentChange}
                  className="bg-transparent font-bold text-ink outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="" disabled>Select Document...</option>
                  {historyItems.map((h) => (
                    <option key={h.job_id} value={h.job_id}>
                      {h.title || h.filename || h.job_id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Link to="/app/history" className="btn-ghost hidden sm:inline-flex text-[13px]">Recent</Link>
              <Link to="/app/upload" className="btn-primary !py-2 text-[13px]">
                <UploadCloud size={15} /> Analyze
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
      <Toasts toasts={toasts} />
    </div>
  )
}

function PageCrumb() {
  const location = useLocation()
  const { result } = useApp()
  const seg = location.pathname.split('/').filter(Boolean).pop() || 'app'
  const titles = {
    app: 'Dashboard', upload: 'Upload Content', extraction: 'Objective Extraction',
    bloom: 'Bloom Analysis', concepts: 'Concept Explorer', assessments: 'Assessment Center',
    analytics: 'Analytics', export: 'Export Center', history: 'Processing History', settings: 'Settings',
  }
  return (
    <div className="flex min-w-0 items-center gap-2">
      <motion.h1
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        className="truncate text-base font-extrabold text-ink"
      >
        {titles[seg] || 'Concepto'}
      </motion.h1>
      {result && seg !== 'app' && (
        <span className="hidden truncate text-xs text-muted sm:inline max-w-[220px]">
          · {result.title}
        </span>
      )}
    </div>
  )
}

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
