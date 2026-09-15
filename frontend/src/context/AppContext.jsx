import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AppCtx = createContext(null)
const LS_KEY = 'concepto-state-v1'

function loadPersisted() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
}

export const DEFAULT_SETTINGS = {
  // Extraction & Objectives
  maxObjectives: 18,
  difficulty: 'auto',
  includeAssessments: true,
  includeGaps: true,

  // Pedagogical Framework & Taxonomy
  academicLevel: 'undergraduate', // elementary, middle_school, high_school, undergraduate, professional, graduate
  taxonomyModel: 'revised_bloom', // revised_bloom, webb_dok, fink, original_bloom
  phrasingStyle: 'action_verb', // action_verb, swbat, abcd

  // Assessment & Quiz Engine
  mcqCount: 5,
  includeExplanations: true,
  includeDistractors: true,
  includeRubrics: true,
  scenarioBased: true,

  // Institution Branding & Export
  institutionName: '',
  instructorName: '',
  defaultExportFormat: 'pdf', // pdf, md, json, csv
  includeConfidenceInExport: true,
  includeBloomBadgesInExport: true,
  includeExecutiveSummary: true,

  // Interface & Workflow
  displayDensity: 'comfortable', // comfortable, compact
  autoAnalyzeSamples: false,
  confidenceThreshold: 70, // 60, 70, 80
}

export function AppProvider({ children }) {
  const persisted = useMemo(loadPersisted, [])
  const [upload, setUpload] = useState(null) // UploadResponse
  const [result, setResult] = useState(null) // AnalysisResult
  const [analyzing, setAnalyzing] = useState(false)
  const [toasts, setToasts] = useState([])
  const [settings, setSettings] = useState({
    ...DEFAULT_SETTINGS,
    ...persisted.settings,
  })
  const [lastJobId, setLastJobId] = useState(persisted.lastJobId || null)

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ settings, lastJobId }))
  }, [settings, lastJobId])

  const toast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t.slice(-3), { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  const selectResult = useCallback((res, upl = null) => {
    setResult(res)
    if (upl) setUpload(upl)
    if (res?.job_id) setLastJobId(res.job_id)
  }, [])

  const switchDocument = useCallback((jobId) => {
    setResult(null)
    setLastJobId(jobId)
  }, [])

  const resetWorkspace = useCallback(() => {
    setUpload(null)
    setResult(null)
    setLastJobId(null)
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const restoreWorkspace = useCallback((data) => {
    if (!data || typeof data !== 'object') throw new Error('Invalid backup file format')
    if (data.settings) setSettings((s) => ({ ...DEFAULT_SETTINGS, ...data.settings }))
    if (data.lastJobId) setLastJobId(data.lastJobId)
  }, [])

  const value = useMemo(
    () => ({
      upload, setUpload, result, setResult, selectResult, switchDocument,
      analyzing, setAnalyzing, toasts, toast, settings, setSettings,
      lastJobId, setLastJobId, resetWorkspace, resetSettings, restoreWorkspace,
    }),
    [upload, result, analyzing, toasts, toast, settings, lastJobId, selectResult, switchDocument, resetWorkspace, resetSettings, restoreWorkspace]
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
