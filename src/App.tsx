import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

// Lazy-loaded pages for code splitting
const Intervall = lazy(() => import('./pages/Intervall'))
const Farben = lazy(() => import('./pages/Farben'))
const Kettenrechner = lazy(() => import('./pages/Kettenrechner'))
const Timers = lazy(() => import('./pages/Timers'))
const SoundCounter = lazy(() => import('./pages/SoundCounter'))
const Capitals = lazy(() => import('./pages/Capitals'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/intervall"
          element={
            <Suspense fallback={<PageLoader />}>
              <Intervall />
            </Suspense>
          }
        />
        <Route
          path="/farben"
          element={
            <Suspense fallback={<PageLoader />}>
              <Farben />
            </Suspense>
          }
        />
        <Route
          path="/kettenrechner"
          element={
            <Suspense fallback={<PageLoader />}>
              <Kettenrechner />
            </Suspense>
          }
        />
        <Route
          path="/timers"
          element={
            <Suspense fallback={<PageLoader />}>
              <Timers />
            </Suspense>
          }
        />
        <Route
          path="/sound-counter"
          element={
            <Suspense fallback={<PageLoader />}>
              <SoundCounter />
            </Suspense>
          }
        />
        <Route
          path="/capitals"
          element={
            <Suspense fallback={<PageLoader />}>
              <Capitals />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
