import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FlaskConical, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Vote,
  Zap,
  Plus,
  ArrowRight,
  DollarSign,
  Shield,
  Clock,
  Lock,
  Unlock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  LifeBuoy,
  Target,
  Skull
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface DeadToken {
  id: string
  symbol: string
  name: string
  marketCap: number
  decline: number
  holderCount: number
  vaultProgress: number
  status: 'vaulted' | 'reviving' | 'revived'
  daysDead: number
  revivalProposals: number
}

const deadTokens: DeadToken[] = [
  { id: '1', symbol: 'ELON', name: 'ElonMars', marketCap: 45000, decline: -98.5, holderCount: 1200, vaultProgress: 65, status: 'vaulted', daysDead: 45, revivalProposals: 3 },
  { id: '2', symbol: 'AIT', name: 'Aitana', marketCap: 12000, decline: -95.2, holderCount: 850, vaultProgress: 30, status: 'reviving', daysDead: 120, revivalProposals: 1 },
  { id: '3', symbol: 'GRUMPY', name: 'Grumpy Cat', marketCap: 8000, decline: -92.8, holderCount: 2100, vaultProgress: 100, status: 'revived', daysDead: 180, revivalProposals: 5 },
  { id: '4', symbol: 'ROGUE', name: 'Rogue', marketCap: 2500, decline: -99.1, holderCount: 340, vaultProgress: 0, status: 'vaulted', daysDead: 60, revivalProposals: 0 },
]

const proposals = [
  { id: 1, title: 'Liquidity Injection', tokens: '50 SOL', votes: 156, status: 'active' },
  { id: 2, title: 'Rebranding Campaign', tokens: '25 SOL', votes: 89, status: 'active' },
  { id: 3, title: 'Marketing Push', tokens: '30 SOL', votes: 234, status: 'passed' },
]

export function RevivalVaults() {
  const [vaultAmount, setVaultAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<DeadToken | null>(null)

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-4 h-4 text-primary animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Emergency Protocol</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tighter uppercase italic">Revival Vaults</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-mono px-3">
            SECTOR: ABANDONED
          </Badge>
          <Button size="sm" className="bg-primary text-background font-black uppercase italic tracking-widest px-4 shadow-glow-cyan">
            <Plus className="w-3 h-3 mr-2" />
            New Mission
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mission List - Dead Tokens */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deadTokens.map((token) => (
              <motion.div
                key={token.id}
                whileHover={{ y: -2 }}
                className={cn(
                  "p-5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                  selectedToken?.id === token.id 
                    ? "bg-primary/5 border-primary/40" 
                    : "bg-card border-border/50 hover:border-primary/30"
                )}
                onClick={() => setSelectedToken(token)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm border border-border/50 group-hover:border-primary/20 transition-all">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-tight uppercase">{token.symbol}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-destructive">{token.decline}%</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Collapse</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Revival Progress</span>
                    <span className="text-primary font-mono">{token.vaultProgress}%</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-glow-cyan" style={{ width: `${token.vaultProgress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">MCap (USD)</div>
                    <div className="text-xs font-mono font-bold">${token.marketCap.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Days Dead</div>
                    <div className="text-xs font-mono font-bold">{token.daysDead}D</div>
                  </div>
                </div>

                {token.status === 'reviving' && (
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                    <div className="absolute top-2 right-[-15px] bg-warning text-background font-black text-[8px] py-0.5 px-4 rotate-45 uppercase shadow-xl">
                      LIVE
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <Card className="glass-strong border-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-3">
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Operational Proposals</span>
              </div>
              <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest">All Votes</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="p-5 flex items-center justify-between hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide">{proposal.title}</div>
                        <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Funding Goal: {proposal.tokens}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] font-mono font-bold text-foreground">{proposal.votes} Voted</div>
                        <div className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">{proposal.status}</div>
                      </div>
                      <Button variant="outline" size="sm" className="font-black text-[9px] uppercase italic tracking-widest px-4 border-primary/20 hover:bg-primary hover:text-background transition-all">SIGN</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel - Mission Control */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-strong border-primary/20 relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Mission Control</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                <Skull className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status: Critical</div>
                <div className="text-sm font-bold uppercase tracking-wider text-foreground">Awaiting Target Selection</div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Injection Amount</label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="0.00 SOL"
                      value={vaultAmount}
                      onChange={(e) => setVaultAmount(e.target.value)}
                      className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm font-mono font-bold focus:border-primary focus:outline-none transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary px-2 py-1 rounded bg-primary/10">SOL</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-muted-foreground">Estimated Rebound</span>
                    <span className="text-success">+142%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-muted-foreground">Recovery Probability</span>
                    <span className="text-primary font-mono">72%</span>
                  </div>
                </div>

                <Button className="w-full bg-primary text-background font-black uppercase italic tracking-widest h-12 shadow-glow-cyan transition-all active:scale-95">
                  INITIALIZE RESCUE
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2 border-b border-border/30 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Mission Log</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { token: 'AIDOGE', outcome: 'SECURED', gain: '+240%', date: '15.01.24' },
                { token: 'MONG', outcome: 'SECURED', gain: '+85%', date: '28.12.23' },
              ].map((record, i) => (
                <div key={record.token} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-success rounded-full" />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider">{record.token}</div>
                      <div className="text-[8px] font-mono text-muted-foreground">{record.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-black text-success italic">{record.gain}</div>
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">{record.outcome}</div>
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
