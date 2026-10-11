import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import SimulatorPage from './pages/SimulatorPage'
import ErrorBoundary from './components/common/ErrorBoundary'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}

