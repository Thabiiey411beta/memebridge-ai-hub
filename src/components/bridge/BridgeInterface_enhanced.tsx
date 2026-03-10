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
  Filter,
  Brain,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { getProtocolInstance } from '@/protocols/manager'
import { toast } from 'sonner'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedToken, setSelectedToken] = useState(marketTokens[0])
  const [amount, setAmount] = useState('')
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'processing' | 'success'>('idle')
  const [protocol, setProtocol] = useState<any>(null)

  useEffect(() => {
    const initProtocol = async () => {
      try {
        const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY
        if (heliusApiKey) {
          const protocolInstance = getProtocolInstance(heliusApiKey)
          setProtocol(protocolInstance)
        }
      } catch (error) {
        console.error('Failed to initialize bridge protocol:', error)
      }
    }
    initProtocol()
  }, [])

  const filteredTokens = marketTokens.filter(t => 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBridge = async () => {
    if (!protocol || !amount) return

    setBridgeStatus('processing')
    try {
      // Validate token
      const isValid = await protocol.bridge.validateToken(selectedToken.symbol, fromChain.id)
      if (!isValid) {
        toast.error('Token validation failed')
        setBridgeStatus('idle')
        return
      }

      // Estimate fee
      const fee = await protocol.bridge.estimateBridgeFee(fromChain, toChain, {
        symbol: selectedToken.symbol,
        name: selectedToken.name,
        address: selectedToken.symbol, // Using symbol as placeholder
        decimals: 9,
        chainId: fromChain.id
      }, amount)

      // Initiate transfer
      const transfer = {
        fromChain,
        toChain,
        token: {
          symbol: selectedToken.symbol,
          name: selectedToken.name,
          address: selectedToken.symbol,
          decimals: 9,
          chainId: fromChain.id
        },
        amount,
        sender: 'user',
        recipient: 'recipient',
        fee: fee.toString(),
        status: 'pending' as const,
        timestamp: Date.now()
      }

      toast.success('Bridge transaction initiated!')
      setBridgeStatus('success')
      setTimeout(() => setBridgeStatus('idle'), 3000)
    } catch (error) {
      console.error('Bridge error:', error)
      toast.error('Bridge transaction failed')
      setBridgeStatus('idle')
    }
  }

  return (
    <div className="min-h-screen p-6 space-y-6 cyber-grid particles matrix-rain">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-display font-bold neon-text animate-glow bg-clip-text text-transparent bg-gradient-to-r from-primary via-destructive to-success animate-hologram">
          AXIOM BRIDGE TERMINAL
        </h1>
        <p className="text-muted-foreground text-lg font-mono">
          [ CROSS-CHAIN LIQUIDITY PROTOCOL ] [ AI-POWERED SECURITY ] [ QUANTUM BRIDGE ]
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-success font-mono">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-primary font-mono">AI ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive animate-pulse-glow" />
            <span className="text-destructive font-mono">SECURITY ENGAGED</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bridge Interface */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="glass glass-hover holographic animate-fade-in border-2 border-primary/30">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-destructive/5">
              <CardTitle className="flex items-center gap-3 text-2xl font-display">
                <ArrowRightLeft className="w-8 h-8 text-primary animate-pulse-glow" />
                BRIDGE PROTOCOL v2.0
                <Badge className="ml-auto bg-success/20 text-success border-success/50 animate-pulse">
                  ENHANCED
                </Badge>
              </CardTitle>
              <CardDescription className="text-base font-mono">
                [ SECURE CROSS-CHAIN TRANSFERS ] [ REAL-TIME AI MONITORING ] [ QUANTUM ENCRYPTION ]
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Chain Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary font-mono tracking-wider">SOURCE CHAIN</label>
                  <div className="relative group">
                    <select
                      value={fromChain.id}
                      onChange={(e) => setFromChain(chains.find(c => c.id === e.target.value) || chains[0])}
                      className="w-full p-4 bg-card/80 backdrop-blur border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300 font-mono text-lg group-hover:shadow-glow-cyan"
                    >
                      {chains.map(chain => (
                        <option key={chain.id} value={chain.id} className="bg-card">
                          {chain.icon} {chain.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary group-hover:animate-bounce" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary font-mono tracking-wider">TARGET CHAIN</label>
                  <div className="relative group">
                    <select
                      value={toChain.id}
                      onChange={(e) => setToChain(chains.find(c => c.id === e.target.value) || chains[1])}
                      className="w-full p-4 bg-card/80 backdrop-blur border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300 font-mono text-lg group-hover:shadow-glow-cyan"
                    >
                      {chains.map(chain => (
                        <option key={chain.id} value={chain.id} className="bg-card">
                          {chain.icon} {chain.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary group-hover:animate-bounce" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bridge Animation */}
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                    <ArrowRight className="w-8 h-8 text-primary animate-float" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
                  <div className="absolute inset-2 rounded-full border border-primary/30 animate-pulse" />
                </div>
              </div>

              {/* Token Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-primary font-mono tracking-wider">SELECT ASSET</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      placeholder="Search tokens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 w-64 bg-card/80 backdrop-blur border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/50 font-mono transition-all duration-300 group-hover:shadow-glow-cyan"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredTokens.slice(0, 6).map((token, index) => (
                    <motion.button
                      key={token.symbol}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedToken(token)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group",
                        selectedToken.symbol === token.symbol
                          ? "border-primary bg-primary/10 shadow-glow-cyan animate-glow"
                          : "border-border/50 bg-card/50 hover:border-primary/50 hover:shadow-glow-cyan"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-lg">{token.symbol}</span>
                          <Badge variant={
                            token.risk === 'low' ? 'default' :
                            token.risk === 'medium' ? 'secondary' : 'destructive'
                          } className="text-xs font-mono animate-pulse">
                            {token.risk.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground font-mono mb-2">{token.name}</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold">{token.price}</span>
                          <span className={cn(
                            "text-sm font-mono font-bold",
                            token.change.startsWith('+') ? "text-success" : "text-destructive"
                          )}>
                            {token.change}
                          </span>
                        </div>
                        <div className="mt-2">
                          <MiniSparkline
                            data={token.trend}
                            color={token.change.startsWith('+') ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                          />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-primary font-mono tracking-wider">TRANSFER AMOUNT</label>
                <div className="relative group">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl font-mono bg-card/80 backdrop-blur border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/50 pr-20 py-4 transition-all duration-300 group-hover:shadow-glow-cyan"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary font-mono font-bold text-lg">
                    {selectedToken.symbol}
                  </span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-mono">
                    Available: <span className="text-primary">1,234.56</span> {selectedToken.symbol}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary font-mono font-bold transition-all duration-300 border border-primary/50"
                  >
                    MAX
                  </motion.button>
                </div>
              </div>

              {/* Bridge Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBridge}
                disabled={!amount || bridgeStatus === 'processing'}
                className={cn(
                  "w-full py-6 rounded-xl font-display font-bold text-xl transition-all duration-500 relative overflow-hidden group",
                  bridgeStatus === 'processing'
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : bridgeStatus === 'success'
                    ? "bg-success text-success-foreground shadow-glow-lime animate-glow"
                    : "bg-gradient-to-r from-primary via-primary to-primary-glow text-primary-foreground shadow-glow-cyan hover:shadow-glow-cyan animate-glow btn-glow"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {bridgeStatus === 'processing' ? (
                    <>
                      <div className="w-6 h-6 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono">PROCESSING BRIDGE...</span>
                    </>
                  ) : bridgeStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 animate-bounce" />
                      <span className="font-mono">BRIDGE COMPLETE</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 animate-pulse-glow" />
                      <span className="font-mono">INITIATE QUANTUM BRIDGE</span>
                    </>
                  )}
                </div>
              </motion.button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass glass-hover animate-slide-in-left border-2 border-destructive/30">
            <CardHeader className="bg-gradient-to-r from-destructive/5 via-transparent to-primary/5">
              <CardTitle className="flex items-center gap-3 text-xl font-display">
                <Activity className="w-6 h-6 text-destructive animate-pulse-glow" />
                LIVE ACTIVITY FEED
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-success">LIVE</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto space-y-2">
              {recentPulse.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 group cursor-pointer",
                    item.type === 'alert' ? "bg-destructive/10 border-destructive/50 hover:bg-destructive/20" :
                    "bg-card/50 border-border/50 hover:bg-card/80 hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    item.type === 'bridge' ? "bg-primary" :
                    item.type === 'alert' ? "bg-destructive" :
                    "bg-success"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm font-mono flex items-center gap-2">
                      {item.type === 'bridge' && (
                        <>
                          <ArrowRightLeft className="w-4 h-4 text-primary" />
                          {item.token} BRIDGE
                        </>
                      )}
                      {item.type === 'alert' && (
                        <>
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          SECURITY ALERT
                        </>
                      )}
                      {item.type === 'revival' && (
                        <>
                          <Shield className="w-4 h-4 text-success" />
                          VAULT UPDATE
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {item.message || `${item.amount} ${item.from} → ${item.to}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono shrink-0">
                    {item.time}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Market Data Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Market Overview */}
          <Card className="glass glass-hover holographic border-2 border-success/30">
            <CardHeader className="bg-gradient-to-r from-success/5 via-transparent to-primary/5">
              <CardTitle className="flex items-center gap-3 text-xl font-display">
                <TrendingUp className="w-6 h-6 text-success animate-float" />
                MARKET PULSE
                <Badge className="ml-auto bg-primary/20 text-primary border-primary/50 animate-pulse-glow">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                  <div className="text-3xl font-mono font-bold text-success animate-pulse-glow">$2.4T</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">24H VOLUME</div>
                  <div className="text-xs text-success font-mono mt-2">+12.5%</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                  <div className="text-3xl font-mono font-bold text-primary animate-pulse-glow">+8.2%</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">AVG GAIN</div>
                  <div className="text-xs text-primary font-mono mt-2">TRENDING ↑</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary font-mono tracking-wider">TOP MOVERS</h4>
                {marketTokens.slice(0, 5).map((token, index) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/20 to-destructive/20 flex items-center justify-center font-mono font-bold text-sm">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-mono font-bold text-sm">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground font-mono">{token.price}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-mono font-bold",
                        token.change.startsWith('+') ? "text-success" : "text-destructive"
                      )}>
                        {token.change}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{token.volume}</div>
                    </div>
                    <ArrowUpRight className={cn(
                      "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      token.change.startsWith('+') ? "text-success" : "text-destructive"
                    )} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="glass glass-hover border-2 border-primary/30">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-destructive/5">
              <CardTitle className="flex items-center gap-3 text-xl font-display">
                <LayoutGrid className="w-6 h-6 text-primary animate-rotate-slow" />
                QUANTUM ACTIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-2 border-primary/30 hover:border-primary/70 transition-all duration-300 text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-4">
                  <Wallet className="w-6 h-6 text-primary animate-pulse-glow" />
                  <div>
                    <div className="font-medium font-mono">CONNECT WALLET</div>
                    <div className="text-xs text-muted-foreground font-mono">Link quantum accounts</div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-success/10 to-success/5 hover:from-success/20 hover:to-success/10 border-2 border-success/30 hover:border-success/70 transition-all duration-300 text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-4">
                  <Brain className="w-6 h-6 text-success animate-float" />
                  <div>
                    <div className="font-medium font-mono">AI SECURITY SCAN</div>
                    <div className="text-xs text-muted-foreground font-mono">Neural network analysis</div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-destructive/10 to-destructive/5 hover:from-destructive/20 hover:to-destructive/10 border-2 border-destructive/30 hover:border-destructive/70 transition-all duration-300 text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-4">
                  <Globe className="w-6 h-6 text-destructive animate-pulse-glow" />
                  <div>
                    <div className="font-medium font-mono">EMERGENCY PROTOCOL</div>
                    <div className="text-xs text-muted-foreground font-mono">Activate quantum shields</div>
                  </div>
                </div>
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
