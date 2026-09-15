import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle, ArrowLeft, ArrowRight, Award, Check, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCheck, Eye, EyeOff, FlaskConical, LayoutGrid, ListChecks, PenLine, RefreshCw,
  Rocket, Send, Trophy, UploadCloud, XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/Shell'
import { Badge, BloomBadge, Card, CopyButton, EmptyState, Button } from '@/components/ui/Bits'
import { useResultLoader } from '@/hooks/useAnalysis'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'mcqs', label: 'MCQs & Test', icon: ListChecks },
  { id: 'short', label: 'Short answers', icon: PenLine },
  { id: 'tasks', label: 'Practical tasks', icon: FlaskConical },
  { id: 'projects', label: 'Projects', icon: Rocket },
]

export default function AssessmentsPage() {
  const { result, loading } = useResultLoader()
  const [tab, setTab] = useState('mcqs')
  const [showAnswers, setShowAnswers] = useState(false)
  const [viewMode, setViewMode] = useState('exam') // 'exam' (1-at-a-time) | 'list' (all questions)

  // Exam interface states
  const [currentIndex, setCurrentIndex] = useState(0)
  const [picked, setPicked] = useState({}) // qIndex -> optionIndex
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)

  // Reset exam and quiz state whenever switching documents
  useEffect(() => {
    setPicked({})
    setIsSubmitted(false)
    setShowAnswers(false)
    setShowScoreModal(false)
    setCurrentIndex(0)
  }, [result?.job_id])

  if (loading) return <p className="text-sm text-muted">Loading…</p>
  if (!result) {
    return (
      <div>
        <PageHeader title="Assessment Center" sub="Auto-built exams, quizzes & tasks" />
        <EmptyState
          icon={ClipboardCheck}
          title="No assessments yet"
          sub="Run an analysis with assessments enabled to generate quizzes, tasks, and projects."
          action={
            <Link to="/app/upload" className="btn-primary">
              <UploadCloud size={16} /> Upload content
            </Link>
          }
        />
      </div>
    )
  }

  const a = result.assessments
  const counts = {
    mcqs: a.mcqs.length,
    short: a.short_answers.length,
    tasks: a.practical_tasks.length,
    projects: a.projects.length,
  }
  const total = counts.mcqs + counts.short + counts.tasks + counts.projects

  if (total === 0) {
    return (
      <div>
        <PageHeader title="Assessment Center" sub="Auto-built exams, quizzes & tasks" />
        <EmptyState
          icon={ClipboardCheck}
          title="Assessments were disabled for this run"
          sub="Enable assessments in Settings, then re-run the analysis."
          action={<Link to="/app/settings" className="btn-secondary">Open settings</Link>}
        />
      </div>
    )
  }

  // Calculate assessment statistics
  const mcqs = a.mcqs
  const totalQuestions = mcqs.length
  const answeredCount = Object.keys(picked).length
  const correctCount = mcqs.reduce((acc, m, idx) => (picked[idx] === m.answer_index ? acc + 1 : acc), 0)
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const currentQ = mcqs[currentIndex] || null

  const handleSelectOption = (qIdx, optIdx) => {
    if (isSubmitted) return
    setPicked((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    setShowAnswers(true)
    setShowScoreModal(true)
  }

  const handleRetake = () => {
    setPicked({})
    setIsSubmitted(false)
    setShowAnswers(false)
    setShowScoreModal(false)
    setCurrentIndex(0)
  }

  return (
    <div>
      <PageHeader
        title="Assessment Center"
        sub={`${total} interactive items aligned directly with Bloom objectives`}
        actions={
          tab === 'mcqs' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === 'exam' ? 'list' : 'exam'))}
                className="btn-secondary !py-2 text-[13px] flex items-center gap-1.5"
              >
                <LayoutGrid size={15} />
                {viewMode === 'exam' ? 'View All Questions' : 'Exam Mode'}
              </button>
              {isSubmitted && (
                <button
                  type="button"
                  onClick={handleRetake}
                  className="btn-secondary !py-2 text-[13px] flex items-center gap-1.5"
                >
                  <RefreshCw size={14} /> Retake
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAnswers((v) => !v)}
              className="btn-secondary !py-2 text-[13px]"
            >
              {showAnswers ? <EyeOff size={15} /> : <Eye size={15} />}
              {showAnswers ? 'Hide answers' : 'Show answers'}
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'tab-btn flex items-center gap-2',
              tab === t.id ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            )}
          >
            <t.icon size={15} /> {t.label}
            <span
              className={cn(
                'rounded-full px-1.5 text-[11px] font-bold',
                tab === t.id ? 'bg-white/20' : 'bg-secondarybg'
              )}
            >
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* MCQs — Professional Exam Interface */}
      {tab === 'mcqs' && totalQuestions > 0 && (
        <div className="space-y-4">
          {/* Post-submission Score Banner */}
          {isSubmitted && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lift">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-ink">Assessment Result</h3>
                        <Badge
                          className={
                            scorePercent >= 75
                              ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                              : scorePercent >= 50
                              ? 'border-amber-300 bg-amber-100 text-amber-800'
                              : 'border-red-300 bg-red-100 text-red-800'
                          }
                        >
                          {scorePercent >= 75 ? 'Proficient' : scorePercent >= 50 ? 'Satisfactory' : 'Needs Practice'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">
                        You scored <span className="font-bold text-ink">{correctCount}</span> out of{' '}
                        <span className="font-bold text-ink">{totalQuestions}</span> questions ({scorePercent}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="btn-secondary !py-2 text-[13px] flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} /> Retake Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="btn-primary !py-2 text-[13px] flex items-center gap-1.5"
                    >
                      <ListChecks size={15} /> Review All Explanations
                    </button>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-blue-100 pt-3 text-center text-xs">
                  <div className="rounded-xl bg-white/80 p-2 border border-blue-100/50">
                    <span className="block font-extrabold text-emerald-600 text-base">{correctCount}</span>
                    <span className="text-muted font-medium">Correct</span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-blue-100/50">
                    <span className="block font-extrabold text-red-500 text-base">
                      {isSubmitted ? answeredCount - correctCount : 0}
                    </span>
                    <span className="text-muted font-medium">Incorrect</span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-blue-100/50">
                    <span className="block font-extrabold text-slate-500 text-base">
                      {totalQuestions - answeredCount}
                    </span>
                    <span className="text-muted font-medium">Unanswered</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Exam Mode: 1 Question at a time with full online exam controls */}
          {viewMode === 'exam' && currentQ && (
            <div className="space-y-4">
              {/* Question Navigation Strip / Palette */}
              <Card className="!p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Question Palette</span>
                    <span className="text-xs text-muted">· {answeredCount} of {totalQuestions} answered</span>
                  </div>
                  {!isSubmitted && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <Send size={13} /> Finish & Submit Assessment
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {mcqs.map((m, idx) => {
                    const hasAnswered = picked[idx] !== undefined
                    const isCurrent = idx === currentIndex
                    const isCorrect = isSubmitted && picked[idx] === m.answer_index
                    const isWrong = isSubmitted && hasAnswered && picked[idx] !== m.answer_index

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all',
                          isCurrent && 'ring-2 ring-primary ring-offset-2 scale-105',
                          isSubmitted
                            ? isCorrect
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : isWrong
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-600'
                            : hasAnswered
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-border bg-white text-slate-700 hover:border-primary/50'
                        )}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </Card>

              {/* Single Active Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.18 }}
                >
                  <Card className="shadow-sm border border-border">
                    {/* Question Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-extrabold text-primary">
                          Question {currentIndex + 1} of {totalQuestions}
                        </span>
                        <BloomBadge level={currentQ.bloom_level} />
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyButton
                          text={`${currentQ.question}\n${currentQ.options.map((o, i) => `${'ABCD'[i]}. ${o}`).join('\n')}`}
                          label="Copy Question"
                        />
                      </div>
                    </div>

                    {/* Question Stem */}
                    <div className="py-4">
                      <p className="text-base font-bold text-ink leading-snug">{currentQ.question}</p>
                    </div>

                    {/* Radio Button Options */}
                    <div className="space-y-2.5">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = picked[currentIndex] === optIdx
                        const isCorrectOption = optIdx === currentQ.answer_index
                        const revealStatus = isSubmitted || showAnswers

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(currentIndex, optIdx)}
                            className={cn(
                              'group flex items-start gap-3.5 rounded-xl border p-3.5 transition select-none',
                              !isSubmitted ? 'cursor-pointer hover:border-primary/50 hover:bg-primary-50/20' : 'cursor-default',
                              isSelected && !revealStatus && 'border-primary bg-primary-50/40 ring-1 ring-primary/40',
                              revealStatus && isCorrectOption && 'border-emerald-500 bg-emerald-50/70 text-emerald-900',
                              revealStatus && isSelected && !isCorrectOption && 'border-red-400 bg-red-50/70 text-red-900',
                              !isSelected && (!revealStatus || !isCorrectOption) && 'border-border bg-white text-slate-700'
                            )}
                          >
                            {/* Accessible Radio Indicator */}
                            <div className="mt-0.5 flex items-center justify-center">
                              <div
                                className={cn(
                                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                                  isSelected
                                    ? revealStatus
                                      ? isCorrectOption
                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                        : 'border-red-500 bg-red-500 text-white'
                                      : 'border-primary bg-primary text-white'
                                    : 'border-slate-300 group-hover:border-primary/60 bg-white'
                                )}
                              >
                                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                              </div>
                            </div>

                            {/* Option Letter Badge */}
                            <span
                              className={cn(
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition',
                                isSelected ? 'bg-primary-100 text-primary-800' : 'bg-secondarybg text-slate-600'
                              )}
                            >
                              {'ABCD'[optIdx]}
                            </span>

                            {/* Option Content */}
                            <div className="flex-1 text-sm font-medium leading-relaxed pt-0.5">
                              {opt}
                            </div>

                            {/* Post-submission Result Icon */}
                            {revealStatus && isCorrectOption && (
                              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                            )}
                            {revealStatus && isSelected && !isCorrectOption && (
                              <XCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation Box (Revealed after submission or when enabled) */}
                    {(isSubmitted || showAnswers) && currentQ.explanation && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-[13px] leading-relaxed text-slate-700">
                          <p className="font-bold text-ink mb-1 flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-primary" /> Answer Explanation
                          </p>
                          <p>{currentQ.explanation}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Navigation Footer */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentIndex((idx) => Math.max(idx - 1, 0))}
                        disabled={currentIndex === 0}
                        className="!py-2 text-[13px] flex items-center gap-1"
                      >
                        <ChevronLeft size={16} /> Previous
                      </Button>

                      <div className="text-xs font-medium text-muted">
                        {picked[currentIndex] !== undefined ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <Check size={14} /> Answer selected
                          </span>
                        ) : (
                          <span>Select an option above</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {currentIndex < totalQuestions - 1 ? (
                          <Button
                            variant="secondary"
                            onClick={() => setCurrentIndex((idx) => Math.min(idx + 1, totalQuestions - 1))}
                            className="!py-2 text-[13px] flex items-center gap-1"
                          >
                            Next <ChevronRight size={16} />
                          </Button>
                        ) : (
                          !isSubmitted && (
                            <Button
                              variant="primary"
                              onClick={handleSubmit}
                              className="!py-2 text-[13px] flex items-center gap-1.5"
                            >
                              <Send size={14} /> Submit Assessment
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* List Mode: View All Questions in clean cards */}
          {viewMode === 'list' && (
            <div className="space-y-3.5">
              {mcqs.map((m, qi) => {
                const userChoice = picked[qi]
                const isCorrect = userChoice === m.answer_index

                return (
                  <Card key={qi} className="border border-border">
                    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2.5">
                      <Badge className="border-border bg-secondarybg text-slate-700 font-bold">
                        Q{qi + 1}
                      </Badge>
                      <BloomBadge level={m.bloom_level} />
                      {isSubmitted && (
                        <Badge
                          className={
                            isCorrect
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : userChoice !== undefined
                              ? 'border-red-200 bg-red-50 text-red-600'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                          }
                        >
                          {isCorrect ? 'Correct' : userChoice !== undefined ? 'Incorrect' : 'Skipped'}
                        </Badge>
                      )}
                      <span className="ml-auto">
                        <CopyButton
                          text={`${m.question}\n${m.options.map((o, i) => `${'ABCD'[i]}. ${o}`).join('\n')}`}
                          label=""
                        />
                      </span>
                    </div>

                    <p className="mt-3 font-bold text-ink text-sm leading-snug">{m.question}</p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {m.options.map((opt, oi) => {
                        const isAnswer = oi === m.answer_index
                        const isChosen = userChoice === oi
                        const highlightCorrect = (isSubmitted || showAnswers) && isAnswer
                        const highlightWrong = (isSubmitted || showAnswers) && isChosen && !isAnswer

                        return (
                          <div
                            key={oi}
                            onClick={() => handleSelectOption(qi, oi)}
                            className={cn(
                              'flex items-start gap-2.5 rounded-xl border p-2.5 text-left text-[13px] transition',
                              !isSubmitted && 'cursor-pointer hover:border-primary/50',
                              highlightCorrect
                                ? 'border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-900'
                                : highlightWrong
                                ? 'border-red-400 bg-red-50/80 text-red-900'
                                : isChosen
                                ? 'border-primary bg-primary-50 text-primary-900 font-medium'
                                : 'border-border bg-white text-slate-700'
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold',
                                highlightCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : highlightWrong
                                  ? 'bg-red-500 text-white'
                                  : isChosen
                                  ? 'bg-primary text-white'
                                  : 'bg-secondarybg text-muted'
                              )}
                            >
                              {'ABCD'[oi]}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {highlightCorrect && <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />}
                          </div>
                        )
                      })}
                    </div>

                    {(isSubmitted || showAnswers) && m.explanation && (
                      <p className="mt-3 rounded-xl bg-secondarybg p-3 text-xs leading-relaxed text-slate-600">
                        <span className="font-bold text-ink">Explanation: </span>
                        {m.explanation}
                      </p>
                    )}
                  </Card>
                )
              })}

              {!isSubmitted && (
                <div className="mt-4 flex justify-end">
                  <Button variant="primary" onClick={handleSubmit} className="!py-2.5">
                    <Send size={14} /> Submit Assessment
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Short answers tab */}
      {tab === 'short' && (
        <div className="space-y-3">
          {a.short_answers.map((s, i) => (
            <Card key={i}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-border bg-secondarybg text-slate-600 font-bold">Q{i + 1}</Badge>
                <BloomBadge level={s.bloom_level} />
                <span className="ml-auto">
                  <CopyButton text={s.question} label="" />
                </span>
              </div>
              <p className="mt-2.5 font-bold text-ink">{s.question}</p>
              {showAnswers && s.sample_answer && (
                <p className="mt-3 rounded-xl border border-dashed border-border bg-secondarybg/60 p-3 text-[13px] leading-relaxed text-slate-600">
                  <span className="font-bold text-ink">Sample answer: </span>
                  {s.sample_answer}
                </p>
              )}
            </Card>
          ))}
          {a.short_answers.length === 0 && (
            <EmptyState icon={PenLine} title="No short answers" sub="Try re-running the analysis." />
          )}
        </div>
      )}

      {/* Practical tasks tab */}
      {tab === 'tasks' && (
        <div className="grid gap-3 md:grid-cols-2">
          {a.practical_tasks.map((t, i) => (
            <Card key={i} className="card-hover">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-2 text-warning">
                  <FlaskConical size={18} />
                </div>
                <BloomBadge level={t.bloom_level} />
                <span className="ml-auto">
                  <CopyButton text={`${t.title}\n${t.description}`} label="" />
                </span>
              </div>
              <p className="mt-2.5 font-bold text-ink">{t.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t.description}</p>
            </Card>
          ))}
          {a.practical_tasks.length === 0 && (
            <EmptyState icon={FlaskConical} title="No tasks generated" sub="Try re-running the analysis." />
          )}
        </div>
      )}

      {/* Projects tab */}
      {tab === 'projects' && (
        <div className="grid gap-3 md:grid-cols-2">
          {a.projects.map((p, i) => (
            <Card key={i} className="card-hover border-t-4 !border-t-pink-500">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-pink-50 p-2 text-pink-500">
                  <Rocket size={18} />
                </div>
                <Badge className="border-pink-200 bg-pink-50 text-pink-600 font-bold">Capstone</Badge>
                <span className="ml-auto">
                  <CopyButton text={`${p.title}\n${p.description}`} label="" />
                </span>
              </div>
              <p className="mt-2.5 font-bold text-ink">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{p.description}</p>
            </Card>
          ))}
          {a.projects.length === 0 && (
            <EmptyState icon={Rocket} title="No projects generated" sub="Try re-running the analysis." />
          )}
        </div>
      )}
    </div>
  )
}
