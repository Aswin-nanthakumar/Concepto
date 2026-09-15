import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/Shell'
import { Skeleton } from '@/components/ui/Bits'

// Lazy-loaded pages for code splitting (Lighthouse > 90)
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const UploadPage = lazy(() => import('@/pages/UploadPage'))
const ExtractionPage = lazy(() => import('@/pages/ExtractionPage'))
const BloomPage = lazy(() => import('@/pages/BloomPage'))
const ConceptsPage = lazy(() => import('@/pages/ConceptsPage'))
const AssessmentsPage = lazy(() => import('@/pages/AssessmentsPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const ExportPage = lazy(() => import('@/pages/ExportPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondarybg p-6"><PageFallback /></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="extraction" element={<ExtractionPage />} />
          <Route path="bloom" element={<BloomPage />} />
          <Route path="concepts" element={<ConceptsPage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
