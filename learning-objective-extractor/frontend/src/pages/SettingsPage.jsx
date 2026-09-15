import {
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck,
  FileText,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Info,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/Shell'
import { Badge, Button, Card } from '@/components/ui/Bits'
import { DEFAULT_SETTINGS, useApp } from '@/context/AppContext'
import { cn, downloadBlob } from '@/lib/utils'

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition', on ? 'bg-primary' : 'bg-slate-200')}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
          on ? 'left-[22px]' : 'left-0.5'
        )}
      />
    </button>
  )
}

const ACADEMIC_LEVELS = [
  { id: 'elementary', label: 'Elementary (K-5)' },
  { id: 'middle_school', label: 'Middle (6-8)' },
  { id: 'high_school', label: 'High School (9-12)' },
  { id: 'undergraduate', label: 'Undergraduate' },
  { id: 'professional', label: 'Professional' },
  { id: 'graduate', label: 'Graduate' },
]

const TAXONOMIES = [
  {
    id: 'revised_bloom',
    label: "Revised Bloom's (Anderson & Krathwohl)",
    desc: 'Remember · Understand · Apply · Analyze · Evaluate · Create',
    badge: 'Standard',
  },
  {
    id: 'webb_dok',
    label: "Webb's Depth of Knowledge (DOK)",
    desc: 'Recall (DOK 1) · Skill/Concept (DOK 2) · Strategic (DOK 3) · Extended (DOK 4)',
    badge: 'K-12 & Rigor',
  },
  {
    id: 'fink',
    label: "Fink's Significant Learning",
    desc: 'Foundational · Application · Integration · Human Dimension · Caring',
    badge: 'Higher Ed',
  },
  {
    id: 'original_bloom',
    label: "Original Bloom's Taxonomy (1956)",
    desc: 'Knowledge · Comprehension · Application · Analysis · Synthesis · Evaluation',
    badge: 'Classic',
  },
]

const PHRASING_STYLES = [
  {
    id: 'action_verb',
    label: 'Action Verb First',
    example: '“Analyze the core biochemical pathways of...”',
  },
  {
    id: 'swbat',
    label: 'SWBAT Template',
    example: '“Students will be able to analyze the core...”',
  },
  {
    id: 'abcd',
    label: 'ABCD Model (Audience, Behavior, Condition, Degree)',
    example: '“Given a diagram, learners will accurately classify...”',
  },
]

const EXPORT_FORMAT_OPTIONS = [
  { id: 'pdf', label: 'PDF Report', ext: '.pdf' },
  { id: 'md', label: 'Markdown', ext: '.md' },
  { id: 'json', label: 'JSON Data', ext: '.json' },
  { id: 'csv', label: 'CSV Spreadsheet', ext: '.csv' },
]

export default function SettingsPage() {
  const { settings, setSettings, resetSettings, restoreWorkspace, resetWorkspace, upload, result, toast } = useApp()
  const [activeTab, setActiveTab] = useState('pedagogy')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const importFileRef = useRef(null)

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }))

  const handleExportBackup = () => {
    try {
      const payload = {
        app: 'Concepto',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const dateStr = new Date().toISOString().split('T')[0]
      downloadBlob(blob, `concepto-settings-backup-${dateStr}.json`)
      toast('Settings configuration exported successfully', 'success')
    } catch (e) {
      toast('Export failed: ' + e.message, 'error')
    }
  }

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        restoreWorkspace(parsed)
        toast('Configuration restored successfully!', 'success')
      } catch (err) {
        toast('Failed to parse backup file: ' + err.message, 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const getStorageSize = () => {
    try {
      const raw = localStorage.getItem('concepto-state-v1') || ''
      const bytes = new Blob([raw]).size
      return `${(bytes / 1024).toFixed(1)} KB`
    } catch {
      return '0 KB'
    }
  }

  const tabs = [
    { id: 'pedagogy', label: 'Pedagogy & Objectives', icon: GraduationCap },
    { id: 'assessments', label: 'Assessment Engine', icon: ClipboardCheck },
    { id: 'branding', label: 'Institution & Export', icon: Building2 },
    { id: 'workspace', label: 'Workspace & Workflow', icon: HardDrive },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Settings & Customization"
        sub="Configure pedagogical frameworks, assessment parameters, institution branding, and workspace preferences."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleExportBackup}
              className="!py-2 text-[13px]"
              title="Download backup of settings"
            >
              <Download size={14} /> Export Config
            </Button>
            <Button
              variant="secondary"
              onClick={() => importFileRef.current?.click()}
              className="!py-2 text-[13px]"
              title="Restore settings from file"
            >
              <Upload size={14} /> Import Config
            </Button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </div>
        }
      />

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto rounded-2xl border border-border bg-secondarybg/70 p-1.5 gap-1 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition whitespace-nowrap',
                isActive
                  ? 'bg-white text-ink shadow-card'
                  : 'text-muted hover:text-ink hover:bg-white/60'
              )}
            >
              <Icon size={16} className={isActive ? 'text-primary' : 'text-muted'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: Pedagogy & Objectives */}
      {activeTab === 'pedagogy' && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="flex flex-col justify-between">
            <div>
              <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
                <SlidersHorizontal size={17} className="text-primary" /> Objective Extraction Parameters
              </h3>
              <p className="mb-5 text-[13px] text-muted">
                Fine-tune the depth, count, and difficulty of generated learning objectives.
              </p>

              <label className="label">
                Maximum Objectives: <span className="font-bold text-primary">{settings.maxObjectives}</span>
              </label>
              <input
                type="range"
                min={6}
                max={40}
                step={1}
                value={settings.maxObjectives}
                onChange={(e) => update({ maxObjectives: Number(e.target.value) })}
                className="mb-1 w-full accent-primary"
              />
              <div className="mb-5 flex justify-between text-[11px] font-semibold text-muted">
                <span>6 · Concise syllabus</span>
                <span>18 · Recommended</span>
                <span>40 · Exhaustive curriculum</span>
              </div>

              <label className="label">Difficulty Context</label>
              <div className="mb-5 grid grid-cols-4 gap-2">
                {['auto', 'beginner', 'intermediate', 'advanced'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update({ difficulty: d })}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-[13px] font-bold capitalize transition',
                      settings.difficulty === d
                        ? 'border-primary bg-primary-50 text-primary-700'
                        : 'border-border text-muted hover:text-ink'
                    )}
                  >
                    {d === 'auto' ? 'Auto' : d}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { k: 'includeAssessments', t: 'Generate assessments', d: 'MCQs, short answers, practical tasks & projects' },
                  { k: 'includeGaps', t: 'Run gap analysis', d: 'Identify prerequisite holes and Bloom level imbalances' },
                ].map((row) => (
                  <div key={row.k} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink">{row.t}</p>
                      <p className="text-xs text-muted">{row.d}</p>
                    </div>
                    <Toggle on={settings[row.k]} onClick={() => update({ [row.k]: !settings[row.k] })} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>Standard Bloom verb alignment</span>
              <button
                type="button"
                onClick={() => {
                  update({ maxObjectives: 18, difficulty: 'auto', includeAssessments: true, includeGaps: true })
                  toast('Extraction parameters reset to defaults', 'info')
                }}
                className="font-semibold text-primary hover:underline"
              >
                Reset to default
              </button>
            </div>
          </Card>

          <Card className="space-y-5">
            <div>
              <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
                <GraduationCap size={17} className="text-primary" /> Target Audience & Taxonomy Standard
              </h3>
              <p className="mb-4 text-[13px] text-muted">
                Adapt the pedagogical language, verb taxonomy, and cognitive expectations.
              </p>

              <label className="label">Target Academic Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {ACADEMIC_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => update({ academicLevel: level.id })}
                    className={cn(
                      'rounded-xl border p-2 text-left text-xs font-bold transition',
                      (settings.academicLevel || 'undergraduate') === level.id
                        ? 'border-primary bg-primary-50 text-primary-700'
                        : 'border-border text-muted hover:text-ink hover:border-slate-300'
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>

              <label className="label">Taxonomy Framework</label>
              <div className="space-y-2 mb-4">
                {TAXONOMIES.map((tax) => {
                  const selected = (settings.taxonomyModel || 'revised_bloom') === tax.id
                  return (
                    <button
                      key={tax.id}
                      type="button"
                      onClick={() => update({ taxonomyModel: tax.id })}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition',
                        selected
                          ? 'border-primary bg-primary-50/60 ring-1 ring-primary/30'
                          : 'border-border bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn('text-xs font-bold', selected ? 'text-primary-800' : 'text-ink')}>
                          {tax.label}
                        </span>
                        <Badge className="text-[10px] bg-white border-border">{tax.badge}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-muted leading-relaxed">{tax.desc}</p>
                    </button>
                  )
                })}
              </div>

              <label className="label">Objective Phrasing Style</label>
              <div className="space-y-2">
                {PHRASING_STYLES.map((style) => {
                  const selected = (settings.phrasingStyle || 'action_verb') === style.id
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => update({ phrasingStyle: style.id })}
                      className={cn(
                        'w-full rounded-xl border p-2.5 text-left text-xs transition',
                        selected
                          ? 'border-primary bg-primary-50 text-primary-700 font-bold'
                          : 'border-border text-muted hover:text-ink'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{style.label}</span>
                        {selected && <Check size={14} className="text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] font-normal text-muted mt-0.5">{style.example}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Assessment Engine */}
      {activeTab === 'assessments' && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="space-y-4">
            <div>
              <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
                <ClipboardCheck size={17} className="text-primary" /> Question Generation Rules
              </h3>
              <p className="mb-4 text-[13px] text-muted">
                Control the depth, question formats, and pedagogical feedback generated for exams.
              </p>

              <label className="label">Default MCQ Question Pool Count</label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => update({ mcqCount: num })}
                    className={cn(
                      'rounded-xl border py-2.5 text-center text-sm font-bold transition',
                      (settings.mcqCount || 5) === num
                        ? 'border-primary bg-primary-50 text-primary-700'
                        : 'border-border text-muted hover:text-ink'
                    )}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  {
                    k: 'includeExplanations',
                    t: 'Answer Rationales & Explanations',
                    d: 'Provide thorough conceptual justifications for correct answers',
                  },
                  {
                    k: 'includeDistractors',
                    t: 'Distractor Error Analysis',
                    d: 'Explain common student misconceptions behind incorrect options',
                  },
                  {
                    k: 'includeRubrics',
                    t: 'Task & Project Scoring Rubrics',
                    d: 'Generate clear performance criteria for grading open-ended assignments',
                  },
                  {
                    k: 'scenarioBased',
                    t: 'Scenario & Case-Study Prompts',
                    d: 'Formulate questions based on realistic applications rather than rote recall',
                  },
                ].map((item) => (
                  <div key={item.k} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink">{item.t}</p>
                      <p className="text-xs text-muted">{item.d}</p>
                    </div>
                    <Toggle
                      on={settings[item.k] ?? true}
                      onClick={() => update({ [item.k]: !(settings[item.k] ?? true) })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
              <Sparkles size={17} className="text-primary" /> Assessment Preview & Guidance
            </h3>
            <p className="text-[13px] text-muted">
              Here is how your generated assessment modules are configured:
            </p>

            <div className="rounded-xl border border-border bg-secondarybg/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Multiple Choice Quizzes</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {settings.mcqCount || 5} Questions per Run
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Conceptual Explanations</span>
                <span className="text-muted font-medium">
                  {settings.includeExplanations ?? true ? 'Included with every answer' : 'Answers only'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Distractor Diagnostics</span>
                <span className="text-muted font-medium">
                  {settings.includeDistractors ?? true ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Practical Task Rubrics</span>
                <span className="text-muted font-medium">
                  {settings.includeRubrics ?? true ? 'Generated' : 'Off'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info size={14} /> Interactive Assessment Center
              </p>
              <p className="leading-relaxed">
                Generated assessments can be taken directly inside the <strong>Assessments</strong> tab as an interactive quiz or exported to your LMS.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Institution & Export Branding */}
      {activeTab === 'branding' && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="space-y-4">
            <div>
              <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
                <Building2 size={17} className="text-primary" /> Institution & Author Metadata
              </h3>
              <p className="mb-4 text-[13px] text-muted">
                These details will be embedded into headers of exported PDFs, Markdown, and LMS reports.
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="label">Institution / Department Name</label>
                  <input
                    type="text"
                    value={settings.institutionName || ''}
                    onChange={(e) => update({ institutionName: e.target.value })}
                    placeholder="e.g. Department of Computer Science & Engineering"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Instructor / Course Author</label>
                  <input
                    type="text"
                    value={settings.instructorName || ''}
                    onChange={(e) => update({ instructorName: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins, Associate Professor"
                    className="input"
                  />
                </div>
              </div>

              <label className="label">Default Export Format</label>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {EXPORT_FORMAT_OPTIONS.map((fmt) => {
                  const isSelected = (settings.defaultExportFormat || 'pdf') === fmt.id
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => update({ defaultExportFormat: fmt.id })}
                      className={cn(
                        'rounded-xl border p-2.5 text-left text-xs font-bold transition flex items-center justify-between',
                        isSelected
                          ? 'border-primary bg-primary-50 text-primary-700'
                          : 'border-border text-muted hover:text-ink'
                      )}
                    >
                      <span>{fmt.label}</span>
                      <span className="text-[11px] font-mono text-muted">{fmt.ext}</span>
                    </button>
                  )
                })}
              </div>

              <label className="label">Export Inclusions</label>
              <div className="space-y-2.5">
                {[
                  {
                    k: 'includeConfidenceInExport',
                    t: 'Include AI Confidence Ratings',
                    d: 'Show percentage reliability scores for each objective',
                  },
                  {
                    k: 'includeBloomBadgesInExport',
                    t: 'Include Bloom Taxonomy Color Codes',
                    d: 'Tag objectives with colored cognitive level indicators',
                  },
                  {
                    k: 'includeExecutiveSummary',
                    t: 'Include Executive Document Summary',
                    d: 'Add auto-generated overview summary paragraph at report top',
                  },
                ].map((item) => (
                  <div key={item.k} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-ink">{item.t}</p>
                      <p className="text-[11px] text-muted">{item.d}</p>
                    </div>
                    <Toggle
                      on={settings[item.k] ?? true}
                      onClick={() => update({ [item.k]: !(settings[item.k] ?? true) })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
              <FileText size={17} className="text-primary" /> Live Document Header Preview
            </h3>
            <p className="text-[13px] text-muted">
              Live preview of how your exported reports and printable documents will appear:
            </p>

            <div className="rounded-2xl border-2 border-dashed border-border bg-slate-50/70 p-6 space-y-4">
              <div className="border-b border-border pb-3 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    {settings.institutionName || 'Your Institution / Department'}
                  </p>
                  <h4 className="text-base font-extrabold text-ink mt-0.5">
                    {result?.title || 'Learning Objectives & Syllabus Analysis'}
                  </h4>
                  <p className="text-xs text-muted mt-1">
                    Instructor: <strong>{settings.instructorName || 'Course Instructor Name'}</strong> · Date:{' '}
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-primary-50 text-primary-700 border-primary/20 text-[10px]">
                  Concepto Verified
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-ink">Sample Objective Entry Preview:</p>
                <div className="rounded-xl border border-border bg-white p-3 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Analyze</Badge>
                    {settings.includeConfidenceInExport ?? true ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        94% confidence
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-ink font-medium">
                    {settings.phrasingStyle === 'swbat'
                      ? 'Students will be able to analyze and evaluate structural dependencies in complex systems.'
                      : settings.phrasingStyle === 'abcd'
                      ? 'Given architectural diagrams, students will analyze dependencies with 90% accuracy.'
                      : 'Analyze structural dependencies and evaluate critical path constraints.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: Workspace & Workflow */}
      {activeTab === 'workspace' && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="space-y-4">
            <div>
              <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
                <Layers size={17} className="text-primary" /> Workflow & Interface Preferences
              </h3>
              <p className="mb-4 text-[13px] text-muted">
                Tune interactive behaviors, display density, and analysis triggers.
              </p>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">Auto-Analyze Sample Documents</p>
                    <p className="text-xs text-muted">
                      Immediately trigger AI analysis when clicking a sample lesson or transcript in the Upload tab
                    </p>
                  </div>
                  <Toggle
                    on={settings.autoAnalyzeSamples || false}
                    onClick={() => update({ autoAnalyzeSamples: !settings.autoAnalyzeSamples })}
                  />
                </div>

                <div className="rounded-xl border border-border p-3.5">
                  <p className="text-sm font-bold text-ink mb-1">Display Density</p>
                  <p className="text-xs text-muted mb-3">Adjust row heights and spacing across tables and lists</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'comfortable', label: 'Comfortable (Default)' },
                      { id: 'compact', label: 'Compact (High Density)' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => update({ displayDensity: mode.id })}
                        className={cn(
                          'rounded-xl border py-2 text-center text-xs font-bold transition',
                          (settings.displayDensity || 'comfortable') === mode.id
                            ? 'border-primary bg-primary-50 text-primary-700'
                            : 'border-border text-muted hover:text-ink'
                        )}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border p-3.5">
                  <p className="text-sm font-bold text-ink mb-1">Low-Confidence Alert Threshold</p>
                  <p className="text-xs text-muted mb-3">
                    Flag objectives that fall below this AI confidence score
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[60, 70, 80].map((thr) => (
                      <button
                        key={thr}
                        type="button"
                        onClick={() => update({ confidenceThreshold: thr })}
                        className={cn(
                          'rounded-xl border py-2 text-center text-xs font-bold transition',
                          (settings.confidenceThreshold || 70) === thr
                            ? 'border-primary bg-primary-50 text-primary-700'
                            : 'border-border text-muted hover:text-ink'
                        )}
                      >
                        Below {thr}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="mb-1 flex items-center gap-2 font-bold text-ink">
                <HardDrive size={17} className="text-primary" /> Workspace Storage & State
              </h3>
              <p className="text-[13px] text-muted">
                Manage your local session, cached extractions, and workspace backup.
              </p>

              <div className="rounded-xl border border-border bg-secondarybg/50 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Active Document:</span>
                  <span className="font-bold text-ink truncate max-w-[200px]">
                    {result?.title || upload?.title || 'None selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Extracted Objectives in Memory:</span>
                  <span className="font-bold text-ink">{result?.objectives?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Browser Storage Used:</span>
                  <span className="font-mono font-bold text-ink">{getStorageSize()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label">Configuration Portability</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleExportBackup}
                    className="!py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download size={13} /> Export Backup (.json)
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => importFileRef.current?.click()}
                    className="!py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Upload size={13} /> Restore Backup (.json)
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50/40 p-3.5 space-y-2">
                <p className="text-xs font-bold text-red-700">Workspace Management</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      resetWorkspace()
                      toast('Workspace cleared — ready for new document', 'info')
                    }}
                    className="!py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Clear Active Session
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowResetConfirm(true)}
                    className="!py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Reset All Settings
                  </Button>
                </div>
              </div>

              {showResetConfirm && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
                  <p className="font-bold">Are you sure you want to reset all preferences to default?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        resetSettings()
                        setShowResetConfirm(false)
                        toast('All settings reset to default values', 'success')
                      }}
                      className="!py-1 text-xs"
                    >
                      Yes, reset
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowResetConfirm(false)}
                      className="!py-1 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
