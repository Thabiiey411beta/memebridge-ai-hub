import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Star, 
  Zap, 
  Lock, 
  Gift, 
  Award,
  ChevronDown,
  Flame,
  Crown,
  Diamond,
  Sparkles,
  Wallet,
  CheckCircle2,
  Trophy,
  Medal,
  Dna
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface TrustBadge {
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  score: number
  multiplier: number
  color: string
  icon: React.ElementType
  benefits: string[]
}

const trustLevels: TrustBadge[] = [
  { 
    level: 'bronze', 
    score: 0, 
    multiplier: 1.1,
    color: 'from-amber-700 to-amber-900',
    icon: Star,
    benefits: ['5% fee discount', 'Basic alerts']
  },
  { 
    level: 'silver', 
    score: 50, 
    multiplier: 1.25,
    color: 'from-gray-400 to-gray-600',
    icon: Shield,
    benefits: ['10% fee discount', 'Priority support', 'Early access']
  },
  { 
    level: 'gold', 
    score: 75, 
    multiplier: 1.5,
    color: 'from-yellow-400 to-yellow-600',
    icon: Crown,
    benefits: ['20% fee discount', 'Priority airdrops', 'Governance votes']
  },
  { 
    level: 'platinum', 
    score: 90, 
    multiplier: 2,
    color: 'from-purple-400 to-purple-700',
    icon: Diamond,
    benefits: ['30% fee discount', 'Exclusive events', 'VIP support']
  },
  { 
    level: 'diamond', 
    score: 98, 
    multiplier: 3,
    color: 'from-cyan-400 to-blue-600',
    icon: Sparkles,
    benefits: ['50% fee discount', 'All perks', 'DAO governance power']
  },
]

const userProgress = {
  currentScore: 72,
  bridgeCount: 47,
  volume: '$125,400',
  tokensHeld: 12,
  airdropsReceived: 8,
  nextTier: 'gold',
  progressToNext: 68
}

const recentBadges = [
  { name: 'Early Adopter', earned: '2024-01-15', icon: '🚀' },
  { name: 'Volume Master', earned: '2024-02-20', icon: '📈' },
  { name: 'Cross-Chain Pro', earned: '2024-03-10', icon: '🌉' },
]

export function TrustScoreSystem() {
  const [selectedTier, setSelectedTier] = useState<TrustBadge>(trustLevels[2])

  const getCurrentTier = (score: number) => {
    return trustLevels.slice().reverse().find(t => score >= t.score) || trustLevels[0]
  }

  const currentTier = getCurrentTier(userProgress.currentScore)
  const nextTier = trustLevels[trustLevels.indexOf(currentTier) + 1]

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Medal className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Identity Protocol</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tighter uppercase italic">Reputation</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] py-1 font-mono">
            ID: SOL_MB_8472
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Trust Card - Axiom Style Ranks */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-strong border-primary/20 overflow-hidden relative group">
            <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", currentTier.color)} />
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                {/* NFT Soulbound Badge */}
                <div className="relative shrink-0">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl -z-10"
                  />
                  <div className={cn(
                    "w-48 h-48 rounded-3xl flex flex-col items-center justify-center border-2 shadow-2xl relative overflow-hidden",
                    "bg-background/40 backdrop-blur-xl border-white/10 group-hover:border-primary/50 transition-colors"
                  )}>
                    <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", currentTier.color)} />
                    <currentTier.icon className={cn("w-20 h-20 mb-4 z-10", "text-white shadow-glow-cyan")} />
                    <div className="z-10 text-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">SOULBOUND</div>
                      <div className="text-sm font-bold uppercase text-white tracking-widest">{currentTier.level}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-display font-black tracking-tighter italic uppercase">Trust Index</h2>
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", currentTier.color, "text-white")}>
                        {currentTier.level} RANK
                      </div>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-7xl font-display font-black italic tracking-tighter leading-none">{userProgress.currentScore}</span>
                      <span className="text-xl font-bold text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  {/* Rank Progression */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Progress to {nextTier?.level || 'MAX'}</span>
                      <span className="text-primary font-mono">{userProgress.progressToNext}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary shadow-glow-cyan" style={{ width: `${userProgress.progressToNext}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                    <div className="text-center">
                      <div className="text-xs font-bold font-mono">{userProgress.bridgeCount}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Bridges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold font-mono text-primary">{userProgress.volume}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Secured</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold font-mono text-success">+{userProgress.airdropsReceived}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Rewards</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rank Ladder */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {trustLevels.map((tier) => (
              <Card 
                key={tier.level}
                className={cn(
                  "p-4 border transition-all cursor-pointer group",
                  selectedTier.level === tier.level 
                    ? "bg-primary/5 border-primary/40 ring-4 ring-primary/5" 
                    : "bg-muted/20 border-border/50 hover:border-primary/20"
                )}
                onClick={() => setSelectedTier(tier)}
              >
                <tier.icon className={cn(
                  "w-6 h-6 mb-3 transition-transform group-hover:scale-110",
                  selectedTier.level === tier.level ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-[10px] font-black uppercase tracking-widest mb-1">{tier.level}</div>
                <div className="text-[9px] font-mono text-muted-foreground">{tier.multiplier}x Multiplier</div>
              </Card>
            ))}
          </div>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Privileges: {selectedTier.level}</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTier.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 text-[11px] font-bold uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Global Stats & Minting */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-background p-6 overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Dna className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bridge Protocol</span>
              </div>
              <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-2 leading-none">Upgrade Identity</h3>
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-80 mb-6 leading-relaxed">
                Sync on-chain activity to mint soulbound DNA badge and lock in trading rebates.
              </p>
              <Button className="w-full bg-background text-primary font-black uppercase italic tracking-widest h-12 shadow-2xl">
                UPGRADE NOW
              </Button>
            </div>
            <motion.div 
              animate={{ x: [-20, 20, -20] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -right-10 opacity-20"
            >
              <Sparkles className="w-40 h-40" />
            </motion.div>
          </Card>

          <Card className="glass-strong border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Top Operatives</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: '0x74...8f21', score: 98, rank: 'DIAMOND' },
                { name: '0x1a...9c34', score: 95, rank: 'DIAMOND' },
                { name: '0x9d...5e67', score: 92, rank: 'PLATINUM' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-muted-foreground">#{i+1}</span>
                    <span className="text-[10px] font-mono font-bold">{user.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-black text-primary italic">{user.score} INDEX</div>
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">{user.rank}</div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest hover:text-primary mt-2">
                View Full Roster
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
