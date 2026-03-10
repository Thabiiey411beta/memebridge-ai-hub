import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  Users,
  Wallet,
  BarChart3,
  Eye,
  Zap,
  Search,
  RefreshCw,
  Terminal,
  ScanSearch,
  Info,
  Radar,
  Cpu,
  CircuitBoard,
  Hexagon,
  Target,
  Crosshair,
  Lock,
  Unlock,
  Radio,
  Wifi,
  Satellite
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface TokenHealth {
  symbol: string
  name: string
  health: number
  risk: 'low' | 'medium' | 'high' | 'critical'
  volumeChange: number
  holderConcentration: number
  whaleActivity: number
  socialScore: number
  rugProbability: number
}

const mockTokens: TokenHealth[] = [
  { symbol: 'PEPE', name: 'Pepe', health: 85, risk: 'low', volumeChange: 12.4, holderConcentration: 15, whaleActivity: 8, socialScore: 92, rugProbability: 5 },
  { symbol: 'BONK', name: 'Bonk', health: 72, risk: 'medium', volumeChange: -8.2, holderConcentration: 28, whaleActivity: 45, socialScore: 78, rugProbability: 18 },
  { symbol: 'WIF', name: 'dogwifhat', health: 91, risk: 'low', volumeChange: 25.6, holderConcentration: 12, whaleActivity: 15, socialScore: 95, rugProbability: 3 },
  { symbol: 'BOME', name: 'Book of Meme', health: 45, risk: 'high', volumeChange: -52.3, holderConcentration: 65, whaleActivity: 82, socialScore: 42, rugProbability: 72 },
  { symbol: 'MYRO', name: 'Myro', health: 58, risk: 'medium', volumeChange: -15.8, holderConcentration: 35, whaleActivity: 55, socialScore: 65, rugProbability: 35 },
  { symbol: 'POPCAT', name: 'Popcat', health: 78, risk: 'low', volumeChange: 5.2, holderConcentration: 22, whaleActivity: 12, socialScore: 88, rugProbability: 8 },
]

const riskAlerts = [
  { token: 'BOME', type: 'volume', message: 'Volume dropped 52% in 24h', severity: 'critical', time: '12s ago' },
  { token: 'BONK', type: 'whale', message: 'Large wallet moved 45M tokens', severity: 'warning', time: '1m ago' },
  { token: 'MYRO', type: 'holder', message: 'Top 10 holders own 35% of supply', severity: 'warning', time: '5m ago' },
  { token: 'PUMP', type: 'contract', message: 'Unverified contract detected', severity: 'critical', time: '12m ago' },
]

export function AIAnalysisDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedToken, setSelectedToken] = useState<TokenHealth | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [hologramActive, setHologramActive] = useState(false)

  const filteredTokens = mockTokens.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const analyzeToken = () => {
    setIsAnalyzing(true)
    setScanProgress(0)
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  useEffect(() => {
    const hologramInterval = setInterval(() => {
      setHologramActive(prev => !prev)
    }, 3000)
    return () => clearInterval(hologramInterval)
  }, [])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-emerald-400/20'
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-amber-400/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30 shadow-orange-500/20'
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30 shadow-red-400/20'
      default: return 'text-slate-400'
    }
  }

  const getRiskGlow = (risk: string) => {
    switch (risk) {
      case 'low': return 'shadow-emerald-400/50'
      case 'medium': return 'shadow-amber-400/50'
      case 'high': return 'shadow-orange-500/50'
      case 'critical': return 'shadow-red-400/50'
      default: return 'shadow-slate-400/50'
    }
  }

  return (
    <div className="relative p-6 space-y-6 h-full flex flex-col overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
        />
      </div>

      {/* Holographic Overlay */}
      <AnimatePresence>
        {hologramActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-400/30 rounded-full animate-ping" />
            <div className="absolute bottom-1/3 right-1/3 w-24 h-24 border border-purple-400/30 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-emerald-400/30 rotate-45 animate-spin" style={{ animationDuration: '3s' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between relative z-10"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Radar className="w-4 h-4 text-cyan-400" />
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">NEURAL SECURITY MATRIX</span>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            AI SENTINEL
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">SYSTEM ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[
              { icon: Cpu, color: 'text-cyan-400' },
              { icon: CircuitBoard, color: 'text-purple-400' },
              { icon: Hexagon, color: 'text-emerald-400' }
            ].map(({ icon: Icon, color }, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-800/50 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold shadow-lg",
                  color
                )}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeToken}
            disabled={isAnalyzing}
            className="font-mono text-[10px] uppercase font-bold tracking-widest border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-cyan-400/20 transition-all duration-300"
          >
            <RefreshCw className={cn("w-3 h-3 mr-2", isAnalyzing && "animate-spin")} />
            {isAnalyzing ? 'ANALYZING...' : 'DEEP SCAN'}
          </Button>
        </div>
      </motion.div>

      {/* Scan Progress Bar */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Neural Network Analysis</span>
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-cyan-400/30">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                style={{ width: `${scanProgress}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-[9px] font-mono text-cyan-400">{scanProgress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10">
        {/* Token List - Enhanced Cyberpunk Table */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="flex-1 flex flex-col glass overflow-hidden border-cyan-400/20 shadow-2xl shadow-cyan-400/10">
              <div className="p-4 border-b border-cyan-400/20 flex items-center justify-between bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">MARKET SURVEILLANCE</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/30 text-[9px] font-mono shadow-emerald-400/20">
                      <Lock className="w-3 h-3 mr-1" />
                      2,156 SECURE
                    </Badge>
                    <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/30 text-[9px] font-mono shadow-amber-400/20">
                      <Unlock className="w-3 h-3 mr-1" />
                      542 MONITORED
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-400" />
                  <input
                    placeholder="TARGET ACQUISITION..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800/50 border border-cyan-400/30 rounded-md pl-8 pr-3 py-1.5 text-[10px] font-mono focus:outline-none focus:border-cyan-400 focus:shadow-cyan-400/20 w-48 text-cyan-100 placeholder-cyan-400/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 border-b border-cyan-400/20">
                    <tr>
                      <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-cyan-400 font-mono">Asset</th>
                      <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-cyan-400 font-mono">Neural Health</th>
                      <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-cyan-400 font-mono">Flow Rate</th>
                      <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-cyan-400 font-mono">Threat Level</th>
                      <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-cyan-400 font-mono text-right">Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-400/10">
                    {filteredTokens.map((token, index) => (
                      <motion.tr
                        key={token.symbol}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedToken(token)}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:bg-cyan-400/5",
                          selectedToken?.symbol === token.symbol ? "bg-cyan-400/10 border-l-2 border-cyan-400" : "hover:shadow-cyan-400/10"
                        )}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-cyan-400/30 flex items-center justify-center font-bold text-xs text-cyan-100 shadow-lg"
                            >
                              {token.symbol.slice(0, 2)}
                            </motion.div>
                            <div>
                              <div className="text-xs font-bold text-cyan-100">{token.symbol}</div>
                              <div className="text-[9px] text-cyan-400/70 font-mono uppercase tracking-tighter">{token.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden border border-cyan-400/20">
                              <motion.div
                                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                                style={{ width: `${token.health}%` }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${token.health}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-cyan-100">{token.health}%</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[10px]">
                          <div className={cn(
                            "flex items-center gap-1",
                            token.volumeChange >= 0 ? "text-emerald-400" : "text-red-400"
                          )}>
                            {token.volumeChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {token.volumeChange > 0 ? '+' : ''}{token.volumeChange}%
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={cn(
                            "text-[8px] py-0 px-1 border-transparent uppercase font-bold font-mono shadow-lg",
                            getRiskColor(token.risk),
                            getRiskGlow(token.risk)
                          )}>
                            {token.risk}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 rounded bg-slate-700/50 hover:bg-cyan-400/20 border border-cyan-400/30 hover:border-cyan-400 transition-colors group-hover:shadow-cyan-400/20"
                          >
                            <Info className="w-3 h-3 text-cyan-400" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center font-bold text-xs">
                            {token.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{token.symbol}</div>
                            <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${token.health}%` }} />
                          </div>
                          <span className="text-[10px] font-mono font-bold">{token.health}%</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[10px]">
                        <div className={cn(token.volumeChange >= 0 ? "text-success" : "text-destructive")}>
                          {token.volumeChange > 0 ? '+' : ''}{token.volumeChange}%
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={cn("text-[8px] py-0 px-1 border-transparent uppercase font-bold", getRiskColor(token.risk))}>
                          {token.risk}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-1.5 rounded bg-muted hover:text-primary transition-colors">
                          <Info className="w-3.3 h-3.3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Enhanced Details & Alerts Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedToken ? (
              <motion.div
                key={selectedToken.symbol}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-strong border-cyan-400/30 shadow-2xl shadow-cyan-400/20 shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-400/5" />
                  <CardHeader className="pb-2 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">TARGET: {selectedToken.symbol}</span>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-emerald-400 shadow-emerald-400/50 shadow-lg"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 relative">
                    <div className="flex items-center justify-center p-6 border-y border-cyan-400/20 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse" />
                      <div className="text-center relative z-10">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="text-6xl font-display font-black tracking-tighter leading-none italic bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                        >
                          {selectedToken.health}
                        </motion.div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400 mt-2 font-mono">NEURAL INTEGRITY</div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-cyan-400/20 blur-3xl -z-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="space-y-1 p-3 rounded-lg bg-slate-800/30 border border-cyan-400/20"
                      >
                        <span className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-wider font-mono">Social Matrix</span>
                        <div className="text-sm font-mono font-bold text-cyan-100">{selectedToken.socialScore}/100</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="space-y-1 p-3 rounded-lg bg-slate-800/30 border border-red-400/20 text-right"
                      >
                        <span className="text-[9px] font-bold text-red-400/70 uppercase tracking-wider font-mono">Rug Vector</span>
                        <div className="text-sm font-mono font-bold text-red-400">{selectedToken.rugProbability}%</div>
                      </motion.div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-cyan-400/70 uppercase font-bold tracking-wider font-mono">Whale Activity</span>
                        <span className="text-amber-400 font-mono font-bold animate-pulse">VOLATILE</span>
                      </div>
                      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden flex border border-cyan-400/20">
                        <motion.div
                          className="h-full bg-emerald-400"
                          style={{ width: '40%' }}
                          initial={{ width: '0%' }}
                          animate={{ width: '40%' }}
                          transition={{ duration: 1 }}
                        />
                        <motion.div
                          className="h-full bg-amber-400"
                          style={{ width: '35%' }}
                          initial={{ width: '0%' }}
                          animate={{ width: '35%' }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                        <motion.div
                          className="h-full bg-red-400"
                          style={{ width: '25%' }}
                          initial={{ width: '0%' }}
                          animate={{ width: '25%' }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-cyan-400/50 font-mono">
                        <span>ACCUMULATION</span>
                        <span>DISTRIBUTION</span>
                        <span>DUMPING</span>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-900 font-black uppercase italic tracking-widest h-12 shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 active:scale-95 transition-all border border-cyan-400/50">
                        <Terminal className="w-4 h-4 mr-2" />
                        ACTIVATE DEFENSE MATRIX
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="glass flex flex-col items-center justify-center p-12 text-center shrink-0 border-cyan-400/20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <ScanSearch className="w-12 h-12 text-cyan-400/30 mb-4" />
                  </motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/50 font-mono">SELECT TARGET FOR ANALYSIS</p>
                  <div className="mt-2 w-16 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Security Pulse Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4 flex-1 min-h-0"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Radio className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">THREAT INTELLIGENCE</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] text-emerald-400 font-mono">LIVE</span>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {riskAlerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border text-[10px] transition-all duration-300 hover:scale-[1.02] cursor-pointer",
                    alert.severity === 'critical'
                      ? "bg-red-400/5 border-red-400/30 hover:bg-red-400/10 shadow-red-400/10 hover:shadow-red-400/20"
                      : "bg-amber-400/5 border-amber-400/30 hover:bg-amber-400/10 shadow-amber-400/10 hover:shadow-amber-400/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: alert.severity === 'critical' ? [0, 10, -10, 0] : [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <AlertTriangle className={cn("w-3 h-3", alert.severity === 'critical' ? "text-red-400" : "text-amber-400")} />
                      </motion.div>
                      <span className="font-bold uppercase tracking-tighter text-cyan-100 font-mono">[{alert.token}]</span>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-slate-700/50 text-cyan-400/70 font-mono uppercase">{alert.type}</span>
                    </div>
                    <span className="text-cyan-400/50 font-mono text-[9px]">{alert.time}</span>
                  </div>
                  <p className="text-cyan-100 leading-relaxed font-mono">{alert.message}</p>
                  {alert.severity === 'critical' && (
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="mt-2 w-full h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
