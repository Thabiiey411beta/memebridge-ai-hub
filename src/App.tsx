import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/Sidebar'
import BridgePage from '@/pages/BridgePage'
import AIAnalysisPage from '@/pages/AIAnalysisPage'
import TrustScorePage from '@/pages/TrustScorePage'
import HypePage from '@/pages/HypePage'
import VaultsPage from '@/pages/VaultsPage'
import { getProtocolInstance } from '@/protocols/manager'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeProtocol = async () => {
      try {
        const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY
        if (!heliusApiKey) {
          console.warn('Helius API key not found. Please add VITE_HELIUS_API_KEY to your .env.local file')
          return
        }

        const protocol = getProtocolInstance(heliusApiKey)
        await protocol.initialize()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize protocol:', error)
      }
    }

    initializeProtocol()
  }, [])

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
