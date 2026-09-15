const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request(path, { method = 'GET', body, formData, timeoutMs = 120000, raw = false } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      body: formData || (body ? JSON.stringify(body) : undefined),
      headers: formData ? undefined : { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
    })
    if (!res.ok) {
      let msg = `Request failed (${res.status})`
      try {
        const j = await res.json()
        if (j?.detail) msg = j.detail
      } catch { /* keep default */ }
      const err = new Error(msg)
      err.status = res.status
      throw err
    }
    if (raw) return res.blob()
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) return res.json()
    return res.blob()
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out. The server may be waking up — please retry.')
    if (e instanceof TypeError) throw new Error('Cannot reach the server. Check your connection and API URL in Settings.')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  health: () => request('/api/health', { timeoutMs: 15000 }),
  uploadFile: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return request('/api/upload', { method: 'POST', formData: fd, timeoutMs: 120000 })
  },
  uploadText: (text, filename, title) =>
    request('/api/upload-text', { method: 'POST', body: { text, filename, title } }),
  analyze: (jobId, options) =>
    request(`/api/analyze/${jobId}`, { method: 'POST', body: options || {}, timeoutMs: 180000 }),
  results: (jobId) => request(`/api/results/${jobId}`),
  getJob: (jobId) => request(`/api/job/${jobId}`),
  history: () => request('/api/history'),
  deleteJob: (jobId) => request(`/api/history/${jobId}`, { method: 'DELETE' }),
  dashboard: () => request('/api/dashboard-stats'),
  exportBlob: (jobId, format) => request(`/api/export/${jobId}?format=${format}`, { timeoutMs: 60000, raw: true }),
}

export function apiBase() {
  return BASE || window.location.origin
}
