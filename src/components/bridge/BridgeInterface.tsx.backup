import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRightLeft, 
  Zap, 
  Shield, 
  Globe, 
  ChevronDown,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Wallet,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const chains = [
  { id: 'solana', name: 'Solana', icon: '◎', color: 'from-primary to-primary-glow', connected: true },
  { id: 'ethereum', name: 'Ethereum', icon: '⟐', color: 'from-gray-500 to-gray-700', connected: true },
  { id: 'bsc', name: 'BSC', icon: '◆', color: 'from-yellow-500 to-orange-500', connected: true },
  { id: 'base', name: 'Base', icon: '⬡', color: 'from-blue-500 to-cyan-500', connected: true },
]

const marketTokens = [
  { symbol: 'PEPE', name: 'Pepe', price: '$0.00000842', change: '+12.8%', volume: '$890M', mcap: '$3.5B', risk: 'low', trend: [40, 45, 38, 55, 60, 58, 70] },
  { symbol: 'WIF', name: 'dogwifhat', price: '$2.45', change: '+3.2%', volume: '$320M', mcap: '$2.4B', risk: 'low', trend: [30, 32, 35, 31, 38, 42, 45] },
  { symbol: 'BONK', name: 'Bonk', price: '$0.000025', change: '+8.4%', volume: '$456M', mcap: '$1.6B', risk: 'medium', trend: [20, 25, 22, 28, 30, 28, 35] },
  { symbol: 'BOME', name: 'Book of Meme', price: '$0.015', change: '-15.6%', volume: '$280M', mcap: '$850M', risk: 'high', trend: [60, 55, 50, 45, 40, 35, 30] },
  { symbol: 'POPCAT', name: 'Popcat', price: '$0.42', change: '+24.1%', volume: '$120M', mcap: '$420M', risk: 'low', trend: [10, 15, 20, 25, 35, 45, 55] },
  { symbol: 'MYRO', name: 'Myro', price: '$0.18', change: '-2.1%', volume: '$95M', mcap: '$180M', risk: 'medium', trend: [30, 28, 25, 26, 24, 25, 23] },
]

const recentPulse = [
  { type: 'bridge', token: 'PEPE', amount: '12.4M', from: 'ETH', to: 'SOL', time: '12s ago' },
  { type: 'alert', token: 'SCAM', message: 'Potential Honeypot detected', risk: 'critical', time: '1m ago' },
  { type: 'bridge', token: 'WIF', amount: '2.5K', from: 'SOL', to: 'BASE', time: '2m ago' },
  { type: 'revival', token: 'ELON', message: 'Vault reaching 80% goal', time: '5m ago' },
]

function MiniSparkline({ data, color }: { data: number[], color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min
  const width = 80
  const height = 30
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function BridgeInterface() {
  const [fromChain, setFromChain] = useState(chains[0])
  const [toChain, setToChain] = useState(chains[1])
  const [amount, setAmount] = useState('')
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'processing' | 'success'>('idle')
  const [filter, setFilter] = useState('trending')

  const handleBridge = () => {
    setBridgeStatus('processing')
    setTimeout(() => setBridgeStatus('success'), 2500)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Ticker Tape - Axiom Style */}
      <div className="h-10 border-b border-border/50 bg-background/50 flex items-center overflow-hidden whitespace-nowrap px-4 gap-8">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Pulse</span>
        </div>
        <div className="flex gap-6 animate-marquee">
          {marketTokens.concat(marketTokens).map((token, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-muted-foreground font-bold">{token.symbol}</span>
              <span className="text-foreground">{token.price}</span>
              <span className={cn(token.change.startsWith('+') ? "text-success" : "text-destructive")}>
                {token.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Discover Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-display font-extrabold tracking-tighter uppercase italic">Discover</h1>
              <div className="flex p-1 bg-muted rounded-lg gap-1">
                {['trending', 'surge', 'volume', 'new'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                      filter === f ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  placeholder="SCAN TOKEN ADDR..." 
                  className="bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-primary w-64 transition-all"
                />
              </div>
              <button className="p-2 bg-muted rounded-lg hover:text-primary transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {marketTokens.map((token) => (
              <motion.div
                key={token.symbol}
                whileHover={{ y: -4 }}
                className="group relative bg-card border border-border hover:border-primary/50 rounded-xl p-4 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{token.symbol}</span>
                        <Badge variant="outline" className={cn(
                          "text-[9px] py-0 px-1 border-transparent",
                          token.risk === 'low' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        )}>
                          {token.risk.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold">{token.price}</div>
                    <div className={cn(
                      "text-[10px] font-bold flex items-center justify-end gap-1",
                      token.change.startsWith('+') ? "text-success" : "text-destructive"
                    )}>
                      {token.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {token.change}
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-6">
                  <div className="space-y-1">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Market Cap</div>
                    <div className="text-xs font-mono font-bold">{token.mcap}</div>
                  </div>
                  <MiniSparkline 
                    data={token.trend} 
                    color={token.change.startsWith('+') ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <button className="btn-trade-buy py-2 rounded-lg text-[10px]">Buy on SOL</button>
                  <button className="btn-trade-sell py-2 rounded-lg text-[10px]">Sell on SOL</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Quick Bridge Terminal */}
        <div className="w-[380px] border-l border-border/50 bg-sidebar/50 p-6 flex flex-col gap-6 overflow-y-auto hidden 2xl:flex">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-tighter italic">
            <ArrowRightLeft className="w-5 h-5" />
            Quick Bridge
          </div>

          <Card className="glass-strong border-primary/20 shadow-glow-cyan/5">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source Chain</label>
                <div className="relative">
                  <select 
                    value={fromChain.id}
                    onChange={(e) => setFromChain(chains.find(c => c.id === e.target.value) || chains[0])}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-bold appearance-none cursor-pointer focus:border-primary transition-all"
                  >
                    {chains.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <button className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center hover:text-primary transition-colors">
                  <ArrowDownRight className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Destination Chain</label>
                <div className="relative">
                  <select 
                    value={toChain.id}
                    onChange={(e) => setToChain(chains.find(c => c.id === e.target.value) || chains[1])}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-bold appearance-none cursor-pointer focus:border-primary transition-all"
                  >
                    {chains.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Amount</label>
                <div className="relative">
                  <input 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-12 px-4 bg-background border border-border rounded-xl text-lg font-mono font-bold focus:border-primary focus:outline-none transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary px-2 py-1 rounded bg-primary/10">MAX</div>
                </div>
              </div>

              <Button 
                onClick={handleBridge}
                disabled={!amount || bridgeStatus === 'processing'}
                className="w-full h-12 bg-primary text-background hover:opacity-90 font-bold uppercase tracking-widest shadow-glow-cyan"
              >
                {bridgeStatus === 'idle' ? 'Verify & Bridge' : bridgeStatus === 'processing' ? 'Processing...' : 'Complete!'}
              </Button>
            </CardContent>
          </Card>

          {/* Pulse Feed */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Market Pulse</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {recentPulse.map((p, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50 text-[10px] group hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-bold uppercase tracking-wider",
                      p.type === 'bridge' ? "text-primary" : p.type === 'alert' ? "text-destructive" : "text-warning"
                    )}>
                      {p.type}
                    </span>
                    <span className="text-muted-foreground font-mono">{p.time}</span>
                  </div>
                  {p.type === 'bridge' ? (
                    <p className="text-foreground">
                      <span className="font-bold text-foreground">{p.amount} {p.token}</span> moved from <span className="font-bold text-foreground">{p.from}</span> to <span className="font-bold text-foreground">{p.to}</span>
                    </p>
                  ) : (
                    <p className="text-foreground font-medium">{p.message} <span className="font-bold text-primary">[{p.token}]</span></p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
