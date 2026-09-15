import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { useApp } from '@/context/AppContext'

export function useAnalyze() {
  const { setAnalyzing, selectResult, setResult, toast, settings } = useApp()
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ jobId }) =>
      api.analyze(jobId, {
        max_objectives: settings.maxObjectives,
        difficulty: settings.difficulty,
        include_assessments: settings.includeAssessments,
        include_gaps: settings.includeGaps,
      }),
    onMutate: () => {
      setAnalyzing(true)
      setResult(null)
    },
    onSuccess: (res) => {
      setAnalyzing(false)
      selectResult(res)
      qc.invalidateQueries({ queryKey: ['history'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['result', res.job_id] })
      toast(
        res.engine === 'fallback'
          ? 'Analysis complete (offline engine — add a Gemini key for full AI power)'
          : 'Analysis complete',
        'success'
      )
      navigate(`/app/extraction?doc=${res.job_id}`)
    },
    onError: (e) => {
      setAnalyzing(false)
      toast(e.message || 'Analysis failed', 'error')
    },
  })
}

export function useHistory() {
  return useQuery({ queryKey: ['history'], queryFn: api.history, staleTime: 10000 })
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard, staleTime: 10000 })
}

export function useResultLoader() {
  const [searchParams] = useSearchParams()
  const urlDocId = searchParams.get('doc')
  const { result, lastJobId, selectResult } = useApp()
  const activeId = urlDocId || result?.job_id || lastJobId

  const query = useQuery({
    queryKey: ['result', activeId],
    queryFn: () => (activeId ? api.results(activeId) : null),
    enabled: !!activeId && (!result || result.job_id !== activeId),
    staleTime: 30000,
    retry: 1,
  })

  useEffect(() => {
    if (query.data && (!result || result.job_id !== query.data.job_id)) {
      selectResult(query.data)
    }
  }, [query.data, result, selectResult])

  const activeResult = result && result.job_id === activeId ? result : query.data || null
  const isLoading = Boolean(activeId && !activeResult && query.isLoading)

  return {
    result: activeResult,
    loading: isLoading,
    error: query.error,
    activeId,
  }
}
