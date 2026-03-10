import { useState } from 'react'
import { motion } from 'framer-motion'
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
  Info
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

  const filteredTokens = mockTokens.filter(t => 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const analyzeToken = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success bg-success/10 border-success/30'
      case 'medium': return 'text-warning bg-warning/10 border-warning/30'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30'
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/30'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanSearch className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Security Protocol</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tighter uppercase italic">AI Scanner</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                {i === 1 ? 'ML' : i === 2 ? 'NLP' : 'DS'}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={analyzeToken} disabled={isAnalyzing} className="font-mono text-[10px] uppercase font-bold tracking-widest">
            <RefreshCw className={cn("w-3 h-3 mr-2", isAnalyzing && "animate-spin")} />
            Rescan Network
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Token List - Axiom Style Table */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col glass overflow-hidden border-border/50">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Market Health</span>
                <div className="flex gap-2">
                  <Badge className="bg-success/10 text-success border-transparent text-[9px]">2,156 SAFE</Badge>
                  <Badge className="bg-warning/10 text-warning border-transparent text-[9px]">542 AT RISK</Badge>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input 
                  placeholder="ADDR SEARCH..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-[10px] font-mono focus:outline-none focus:border-primary w-48"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-border/50">
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Token</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Health</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Volume 24h</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Risk</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredTokens.map(token => (
                    <tr 
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={cn(
                        "group cursor-pointer transition-colors",
                        selectedToken?.symbol === token.symbol ? "bg-primary/5" : "hover:bg-muted/30"
                      )}
                    >
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

        {/* Selected Details & Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {selectedToken ? (
            <Card className="glass-strong border-primary/20 shrink-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">Dossier: {selectedToken.symbol}</span>
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center p-6 border-y border-border/30 bg-primary/5">
                  <div className="text-center relative">
                    <div className="text-6xl font-display font-black tracking-tighter leading-none italic">{selectedToken.health}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mt-2">Core Health Index</div>
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 blur-3xl -z-10" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Social Pulse</span>
                    <div className="text-sm font-mono font-bold text-info">{selectedToken.socialScore}/100</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Rug Prob</span>
                    <div className="text-sm font-mono font-bold text-destructive">{selectedToken.rugProbability}%</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground uppercase font-bold tracking-wider">Whale Sentiment</span>
                    <span className="text-warning font-mono font-bold">VOLATILE</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                    <div className="h-full bg-success" style={{ width: '40%' }} />
                    <div className="h-full bg-warning" style={{ width: '35%' }} />
                    <div className="h-full bg-destructive" style={{ width: '25%' }} />
                  </div>
                </div>

                <Button className="w-full bg-primary text-background font-black uppercase italic tracking-widest h-12 shadow-glow-cyan active:scale-95 transition-all">
                  <Terminal className="w-4 h-4 mr-2" />
                  INIT GUARDIAN MODE
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass flex flex-col items-center justify-center p-12 text-center shrink-0">
              <ScanSearch className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select data stream</p>
            </Card>
          )}

          {/* Security Pulse Feed */}
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Network Alerts</span>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {riskAlerts.map((alert, i) => (
                <div key={i} className={cn(
                  "p-3 rounded-lg border text-[10px] transition-all",
                  alert.severity === 'critical' 
                    ? "bg-destructive/5 border-destructive/30 hover:bg-destructive/10" 
                    : "bg-warning/5 border-warning/30 hover:bg-warning/10"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn("w-3 h-3", alert.severity === 'critical' ? "text-destructive" : "text-warning")} />
                      <span className="font-bold uppercase tracking-tighter">[{alert.token}]</span>
                    </div>
                    <span className="text-muted-foreground font-mono">{alert.time}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
