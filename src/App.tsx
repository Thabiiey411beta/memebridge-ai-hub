import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/Sidebar'
import BridgePage from '@/pages/BridgePage'
import AIAnalysisPage from '@/pages/AIAnalysisPage'
import TrustScorePage from '@/pages/TrustScorePage'
import HypePage from '@/pages/HypePage'
import VaultsPage from '@/pages/VaultsPage'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<BridgePage />} />
          <Route path="/ai-analysis" element={<AIAnalysisPage />} />
          <Route path="/trust-score" element={<TrustScorePage />} />
          <Route path="/hype" element={<HypePage />} />
          <Route path="/vaults" element={<VaultsPage />} />
        </Routes>
      </AppLayout>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
