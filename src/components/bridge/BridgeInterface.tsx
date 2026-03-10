import { useState, useEffect } from 'react'
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
  Wallet
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
  { id: 'solana', name: 'Solana', icon: '◎', color: 'from-purple-500 to-pink-500', connected: true },
  { id: 'ethereum', name: 'Ethereum', icon: '⟐', color: 'from-gray-500 to-gray-700', connected: true },
  { id: 'bsc', name: 'BSC', icon: '◆', color: 'from-yellow-500 to-orange-500', connected: true },
  { id: 'base', name: 'Base', icon: '⬡', color: 'from-blue-500 to-cyan-500', connected: true },
]

const tokens = [
  { symbol: 'SOL', name: 'Solana', price: '$142.35', change: '+5.2%', volume: '$2.4B' },
  { symbol: 'PEPE', name: 'Pepe', price: '$0.0000012', change: '+12.8%', volume: '$890M' },
  { symbol: 'BONK', name: 'Bonk', price: '$0.000025', change: '+8.4%', volume: '$456M' },
  { symbol: 'WIF', name: 'dogwifhat', price: '$2.45', change: '+3.2%', volume: '$320M' },
  { symbol: 'BOME', name: 'Book of Meme', price: '$0.015', change: '+15.6%', volume: '$280M' },
  { symbol: 'MYRO', name: 'Myro', price: '$0.18', change: '-2.1%', volume: '$95M' },
]

const recentTransfers = [
  { from: 'Solana', to: 'Ethereum', token: 'WIF', amount: '12,450', time: '2m ago', status: 'completed' },
  { from: 'BSC', to: 'Solana', token: 'PEPE', amount: '50M', time: '5m ago', status: 'completed' },
  { from: 'Base', to: 'Solana', token: 'MYRO', amount: '25,000', time: '12m ago', status: 'pending' },
  { from: 'Ethereum', to: 'Solana', token: 'BONK', amount: '100M', time: '18m ago', status: 'completed' },
]

export function BridgeInterface() {
  const [fromChain, setFromChain] = useState(chains[0])
  const [toChain, setToChain] = useState(chains[1])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedToken, setSelectedToken] = useState(tokens[0])
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

  const filteredTokens = tokens.filter(t => 
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
        sender: 'user_wallet_address', // Would get from wallet
        recipient: 'recipient_wallet_address', // Would get from input
        fee
      }

      const txHash = await protocol.bridge.initiateTransfer(transfer)
      
      // Check AI protection
      const scamCheck = await protocol.ai.detectScams(selectedToken.symbol)
      if (scamCheck.overallRisk > 0.7) {
        toast.warning('High scam risk detected! Transfer blocked for safety.')
        setBridgeStatus('idle')
        return
      }

      toast.success(`Bridge initiated! Transaction: ${txHash}`)
      setBridgeStatus('success')
    } catch (error) {
      console.error('Bridge failed:', error)
      toast.error('Bridge failed. Please try again.')
      setBridgeStatus('idle')
    }
  }

  const swapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text">Cross-Chain Bridge</h1>
          <p className="text-muted-foreground mt-1">Transfer memecoins across chains with zero tax</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          AI Protection Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bridge Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                Transfer Assets
              </CardTitle>
              <CardDescription>Select source and destination chains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Chain */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">From</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select 
                      value={fromChain.id}
                      onChange={(e) => setFromChain(chains.find(c => c.id === e.target.value) || chains[0])}
                      className="w-full h-12 px-4 bg-muted border border-border rounded-lg appearance-none cursor-pointer pr-10"
                    >
                      {chains.map(chain => (
                        <option key={chain.id} value={chain.id}>{chain.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="w-32">
                    <Input 
                      placeholder="Amount" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button 
                  onClick={swapChains}
                  className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all"
                >
                  <ArrowRight className="w-5 h-5 text-primary" />
                </button>
              </div>

              {/* To Chain */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">To</label>
                <div className="relative">
                  <select 
                    value={toChain.id}
                    onChange={(e) => setToChain(chains.find(c => c.id === e.target.value) || chains[1])}
                    className="w-full h-12 px-4 bg-muted border border-border rounded-lg appearance-none cursor-pointer pr-10"
                  >
                    {chains.map(chain => (
                      <option key={chain.id} value={chain.id}>{chain.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Token Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Token</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {filteredTokens.slice(0, 6).map(token => (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={cn(
                        "p-3 rounded-lg border transition-all text-left",
                        selectedToken.symbol === token.symbol 
                          ? "bg-primary/10 border-primary/50 shadow-glow-purple/20" 
                          : "bg-muted/50 border-border hover:border-primary/30"
                      )}
                    >
                      <div className="font-mono text-sm font-bold">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bridge Button */}
              <Button 
                onClick={handleBridge}
                disabled={!amount || bridgeStatus === 'processing'}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
              >
                {bridgeStatus === 'idle' && (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Bridge Now (0% Tax)
                  </>
                )}
                {bridgeStatus === 'processing' && (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                )}
                {bridgeStatus === 'success' && (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Bridge Complete!
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-success" />
                  <span>AI Scam Check</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-warning" />
                  <span>~30s Estimated</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-info" />
                  <span>4 Chains</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Recent */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Bridge Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold gradient-text">$47.2M</div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-success">+12.4%</span>
                <span className="text-muted-foreground">vs yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Supported Tokens */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Verified Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tokens.slice(0, 4).map(token => (
                <div key={token.symbol} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.volume}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{token.price}</div>
                    <div className="text-xs text-success">{token.change}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTransfers.map((tx, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{tx.from} → {tx.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{tx.amount} {tx.token}</span>
                    {tx.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-warning" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
