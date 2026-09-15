import { motion } from 'framer-motion'
import {
  ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Download, FileText,
  GraduationCap, Network, Play, Pyramid, Sparkles, Target, UploadCloud, Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BLOOM_COLORS, BLOOM_LEVELS, BLOOM_META } from '@/lib/constants'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55 },
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lift">
            <GraduationCap size={20} />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-ink">Concepto</span>
        </Link>
        <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#bloom" className="hover:text-ink">Bloom's Taxonomy</a>
          <a href="#users" className="hover:text-ink">Who it's for</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/app" className="btn-ghost text-sm">Dashboard</Link>
          <Link to="/app/upload" className="btn-primary !py-2 text-sm">Try it free <ArrowRight size={15} /></Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-white to-white">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-20">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3.5 py-1.5 text-xs font-bold text-primary-700 shadow-card">
            <Sparkles size={14} /> Powered by Gemini 2.5 Flash
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Turn any lesson into <span className="text-primary">measurable learning outcomes</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
            Upload a chapter, syllabus, or lecture transcript — get Bloom-classified objectives,
            skills, concepts, assessments, and gap analysis in seconds.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/app/upload" className="btn-primary !px-6 !py-3 text-[15px]">
              <UploadCloud size={18} /> Analyze content now
            </Link>
            <Link to="/app" className="btn-secondary !px-6 !py-3 text-[15px]">
              <Play size={17} /> View live demo
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-muted">
            {['PDF · DOCX · TXT support', 'No signup needed', 'Export to JSON / CSV / PDF'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-success" />{t}</span>
            ))}
          </motion.div>
        </div>

        {/* Hero mock */}
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <div className="card overflow-hidden !p-0 shadow-lift">
            <div className="flex items-center gap-2 border-b border-border bg-secondarybg px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-300" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-emerald-300" />
              <span className="ml-2 text-xs font-semibold text-muted">photosynthesis-ch7.pdf → Analysis</span>
            </div>
            <div className="space-y-2.5 p-4">
              {[
                { lvl: 'understand', t: 'Explain how light energy is converted into chemical energy' },
                { lvl: 'apply', t: 'Calculate photosynthetic rate from experimental data' },
                { lvl: 'analyze', t: 'Compare light-dependent reactions with the Calvin cycle' },
                { lvl: 'create', t: 'Design a greenhouse setup that maximizes crop yield' },
              ].map((o, i) => (
                <motion.div key={o.t} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-start gap-2.5 rounded-xl border border-border bg-white p-3 shadow-card">
                  <span className="mt-0.5 inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: BLOOM_COLORS[o.lvl] }}>{BLOOM_META[o.lvl].label}</span>
                  <span className="text-[13px] font-medium leading-snug text-ink">{o.t}</span>
                </motion.div>
              ))}
              <div className="flex items-center gap-2 rounded-xl bg-primary-50 p-3 text-[13px] font-semibold text-primary-700">
                <Zap size={15} /> + 14 more objectives · 92% avg confidence · Coverage 87/100
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const FEATURES = [
  { icon: Target, title: 'Measurable objectives', desc: 'Every objective starts with a Bloom-compatible action verb and is specific enough to assess.' },
  { icon: Pyramid, title: "Bloom's taxonomy classification", desc: 'Automatic Remember → Create leveling with distribution analytics and imbalance alerts.' },
  { icon: Network, title: 'Skills & concept maps', desc: 'Extracted skills, key concepts, and their relationships across your content.' },
  { icon: ClipboardCheck, title: 'Assessment generator', desc: 'MCQs, short answers, practical tasks, and capstone projects aligned to objectives.' },
  { icon: BarChart3, title: 'Gap analysis', desc: 'Detects missing prerequisites, weak coverage areas, and Bloom-level blind spots.' },
  { icon: Download, title: 'One-click exports', desc: 'Download everything as JSON, CSV, Markdown, or a polished PDF report.' },
]

const STEPS = [
  { icon: UploadCloud, t: 'Upload', d: 'Drop a PDF, DOCX, TXT — or paste text directly. Instant preview, word count & type detection.' },
  { icon: Sparkles, t: 'Analyze', d: 'Gemini 2.5 Flash runs a 7-step pipeline: parsing, concepts, objectives, Bloom, assessments, gaps.' },
  { icon: FileText, t: 'Act', d: 'Explore results, generate assessments, and export curriculum-ready documents.' },
]

const USERS = [
  { t: 'Teachers', d: 'Write lesson plans with crisp objectives in minutes, not hours.' },
  { t: 'Curriculum designers', d: 'Audit entire courses for Bloom balance and coverage gaps.' },
  { t: 'EdTech companies', d: 'Auto-tag content libraries with outcomes and skills.' },
  { t: 'Corporate L&D', d: 'Turn training decks and SOPs into measurable competencies.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />

      {/* Logos strip */}
      <section className="border-y border-border bg-secondarybg/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-[13px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">
          {['K-12 Schools', 'Universities', 'EdTech', 'Corporate L&D', 'Bootcamps', 'Publishers'].map((x) => <span key={x}>{x}</span>)}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Educational intelligence, end to end</h2>
          <p className="mt-3 text-muted">One pipeline from raw content to curriculum-ready outcomes.</p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="card card-hover p-6">
              <div className="mb-3 inline-flex rounded-xl bg-primary-50 p-2.5 text-primary"><f.icon size={20} /></div>
              <h3 className="font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-secondarybg/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-bold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">From content to outcomes in 3 steps</h2>
          </motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.t} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="card relative p-6">
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-slate-100">{i + 1}</span>
                <div className="mb-3 inline-flex rounded-xl bg-ink p-2.5 text-white"><s.icon size={20} /></div>
                <h3 className="font-bold text-ink">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloom strip */}
      <section id="bloom" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest text-primary">Bloom's Taxonomy</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Every objective, precisely leveled</h2>
          <p className="mt-3 text-muted">Consistent color language across the entire platform.</p>
        </motion.div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {BLOOM_LEVELS.map((l, i) => (
            <motion.div key={l} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }}
              className="card card-hover overflow-hidden !p-0">
              <div className="px-4 py-3 text-white" style={{ backgroundColor: BLOOM_COLORS[l] }}>
                <p className="font-extrabold">{BLOOM_META[l].label}</p>
                <p className="text-xs opacity-90">Level {i + 1}</p>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-muted">{BLOOM_META[l].desc}</p>
                <p className="mt-2 text-[11px] font-semibold text-ink">{BLOOM_META[l].verbs.join(' · ')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Users */}
      <section id="users" className="border-y border-border bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-bold uppercase tracking-widest text-primary-100">Who it's for</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Built for everyone who teaches</h2>
          </motion.div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USERS.map((u, i) => (
              <motion.div key={u.t} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="font-bold">{u.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{u.d}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/app/upload" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-bold text-white shadow-lift transition hover:bg-primary-700">
              Start your first analysis <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-[13px] text-muted sm:px-6">
        <span className="inline-flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white"><GraduationCap size={15} /></span>
          Concepto
        </span>
        <span>Built with React · FastAPI · Gemini 2.5 Flash</span>
      </footer>
    </div>
  )
}
