import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Dna,
  Target,
  Crosshair,
  Radar,
  Cpu,
  CircuitBoard,
  Hexagon,
  Radio,
  Wifi,
  Satellite,
  Eye,
  ScanSearch
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
  const [hologramActive, setHologramActive] = useState(false)
  const [scanActive, setScanActive] = useState(false)

  const getCurrentTier = (score: number) => {
    return trustLevels.slice().reverse().find(t => score >= t.score) || trustLevels[0]
  }

  const currentTier = getCurrentTier(userProgress.currentScore)
  const nextTier = trustLevels[trustLevels.indexOf(currentTier) + 1]

  useEffect(() => {
    const hologramInterval = setInterval(() => {
      setHologramActive(prev => !prev)
    }, 4000)

    const scanInterval = setInterval(() => {
      setScanActive(prev => !prev)
    }, 2000)

    return () => {
      clearInterval(hologramInterval)
      clearInterval(scanInterval)
    }
  }, [])

  return (
    <div className="relative p-6 space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
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
            <div className="absolute top-1/3 left-1/4 w-40 h-40 border border-purple-400/30 rounded-full animate-ping" />
            <div className="absolute bottom-1/4 right-1/3 w-32 h-32 border border-cyan-400/30 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-400/30 rotate-45 animate-spin" style={{ animationDuration: '4s' }} />
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
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Target className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">NEURAL IDENTITY MATRIX</span>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            TRUST PROTOCOL
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">VERIFICATION ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-400/10 text-purple-400 border-purple-400/30 text-[10px] py-1 font-mono shadow-purple-400/20">
            <Lock className="w-3 h-3 mr-1" />
            SOULBOUND ID: SOL_MB_8472
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Enhanced Main Trust Card */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-strong border-purple-400/30 overflow-hidden relative group shadow-2xl shadow-purple-400/20">
              <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", currentTier.color)} />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-transparent to-cyan-400/5" />

              {/* Scanning Effect */}
              <AnimatePresence>
                {scanActive && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    exit={{ x: '100%' }}
                    transition={{ duration: 2 }}
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none z-10"
                  />
                )}
              </AnimatePresence>

              <CardContent className="p-8 relative z-20">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  {/* Enhanced NFT Soulbound Badge */}
                  <div className="relative shrink-0">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-tr from-purple-400/20 via-cyan-400/20 to-emerald-400/20 blur-3xl -z-10"
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "w-48 h-48 rounded-3xl flex flex-col items-center justify-center border-2 shadow-2xl relative overflow-hidden cursor-pointer",
                        "bg-slate-900/60 backdrop-blur-xl border-purple-400/30 group-hover:border-cyan-400/50 transition-all duration-300"
                      )}
                    >
                      <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", currentTier.color)} />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <currentTier.icon className={cn("w-20 h-20 mb-4 z-10 text-white drop-shadow-2xl")} />
                      </motion.div>
                      <div className="z-10 text-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400/70 mb-1 font-mono">SOULBOUND</div>
                        <div className="text-sm font-bold uppercase text-white tracking-widest">{currentTier.level}</div>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute top-2 left-2 w-2 h-2 border-l-2 border-t-2 border-cyan-400/50" />
                      <div className="absolute top-2 right-2 w-2 h-2 border-r-2 border-t-2 border-cyan-400/50" />
                      <div className="absolute bottom-2 left-2 w-2 h-2 border-l-2 border-b-2 border-cyan-400/50" />
                      <div className="absolute bottom-2 right-2 w-2 h-2 border-r-2 border-b-2 border-cyan-400/50" />
                    </motion.div>
                  </div>

                <div className="flex-1 space-y-6 w-full">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-4xl font-display font-black tracking-tighter italic uppercase text-white">Neural Trust</h2>
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-cyan-400/30", "bg-gradient-to-r", currentTier.color)}
                        >
                          {currentTier.level} CLEARANCE
                        </motion.div>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <motion.span
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="text-7xl font-display font-black italic tracking-tighter leading-none bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                        >
                          {userProgress.currentScore}
                        </motion.span>
                        <span className="text-xl font-bold text-purple-400/70">/ 100</span>
                      </div>
                    </div>

                    {/* Enhanced Rank Progression */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-purple-400/70 font-mono">PATH TO {nextTier?.level || 'MAX'}</span>
                        <span className="text-cyan-400 font-mono font-bold">{userProgress.progressToNext}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden border border-purple-400/20">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-lg shadow-cyan-400/30"
                          style={{ width: `${userProgress.progressToNext}%` }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${userProgress.progressToNext}%` }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-purple-400/50 font-mono">
                        <span>CURRENT: {currentTier.level.toUpperCase()}</span>
                        <span>NEXT: {nextTier?.level.toUpperCase() || 'MAXIMUM'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-400/20">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-3 rounded-lg bg-slate-800/30 border border-purple-400/20"
                      >
                        <div className="text-lg font-bold font-mono text-cyan-400">{userProgress.bridgeCount}</div>
                        <div className="text-[9px] text-purple-400/70 uppercase font-bold tracking-tighter font-mono">CROSSINGS</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-3 rounded-lg bg-slate-800/30 border border-purple-400/20"
                      >
                        <div className="text-lg font-bold font-mono text-emerald-400">{userProgress.volume}</div>
                        <div className="text-[9px] text-purple-400/70 uppercase font-bold tracking-tighter font-mono">SECURED</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-3 rounded-lg bg-slate-800/30 border border-purple-400/20"
                      >
                        <div className="text-lg font-bold font-mono text-amber-400">+{userProgress.airdropsReceived}</div>
                        <div className="text-[9px] text-purple-400/70 uppercase font-bold tracking-tighter font-mono">REWARDS</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Enhanced Rank Ladder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {trustLevels.map((tier, index) => (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={cn(
                      "p-4 border transition-all duration-300 cursor-pointer group relative overflow-hidden",
                      selectedTier.level === tier.level
                        ? "bg-purple-400/10 border-purple-400/50 ring-2 ring-purple-400/30 shadow-lg shadow-purple-400/20"
                        : "bg-slate-800/30 border-purple-400/20 hover:border-cyan-400/40 hover:shadow-cyan-400/10"
                    )}
                    onClick={() => setSelectedTier(tier)}
                  >
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br", tier.color)} />
                    <motion.div
                      animate={selectedTier.level === tier.level ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: selectedTier.level === tier.level ? Infinity : 0, ease: 'linear' }}
                    >
                      <tier.icon className={cn(
                        "w-6 h-6 mb-3 transition-all duration-300",
                        selectedTier.level === tier.level ? "text-cyan-400 scale-110" : "text-purple-400/70 group-hover:text-cyan-400"
                      )} />
                    </motion.div>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-white">{tier.level}</div>
                    <div className="text-[9px] font-mono text-purple-400/70">{tier.multiplier}x MULTIPLIER</div>
                    {selectedTier.level === tier.level && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"
                      />
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Benefits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass border-purple-400/20 shadow-xl shadow-purple-400/10">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">ACTIVE PROTOCOLS: {selectedTier.level.toUpperCase()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTier.benefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-purple-400/20 text-[11px] font-bold uppercase tracking-wide text-cyan-100 hover:border-cyan-400/40 transition-all duration-300"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </motion.div>
                      <span className="font-mono">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Enhanced Upgrade Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 via-cyan-500 to-emerald-500 text-slate-900 p-6 overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-purple-400/30 border border-cyan-400/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Dna className="w-6 h-6" />
                  </motion.div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">BRIDGE PROTOCOL</span>
                </div>
                <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-2 leading-none">Upgrade Identity</h3>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-90 mb-6 leading-relaxed font-mono">
                  Sync on-chain activity to mint soulbound DNA badge and lock in trading rebates.
                </p>
                <Button className="w-full bg-slate-900 text-cyan-400 font-black uppercase italic tracking-widest h-12 shadow-2xl border border-cyan-400/50 hover:bg-slate-800 hover:shadow-cyan-400/30 transition-all">
                  <Zap className="w-4 h-4 mr-2" />
                  UPGRADE NOW
                </Button>
              </div>
              <motion.div
                animate={{ x: [-20, 20, -20] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -right-10 opacity-30"
              >
                <Sparkles className="w-32 h-32" />
              </motion.div>
            </Card>
          </motion.div>

          {/* Enhanced Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-strong border-purple-400/20 shadow-xl shadow-purple-400/10">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">ELITE OPERATIVES</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: '0x74...8f21', score: 98, rank: 'DIAMOND', color: 'from-cyan-400 to-blue-500' },
                  { name: '0x1a...9c34', score: 95, rank: 'DIAMOND', color: 'from-purple-400 to-pink-500' },
                  { name: '0x9d...5e67', score: 92, rank: 'PLATINUM', color: 'from-emerald-400 to-cyan-500' },
                ].map((user, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-purple-400/20 hover:border-cyan-400/40 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-400/20 to-cyan-400/20 border border-purple-400/30">
                        <span className="text-[10px] font-black text-cyan-400">#{i+1}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono font-black text-cyan-400 italic">{user.score} INDEX</div>
                      <div className={cn("text-[8px] font-black uppercase tracking-tighter font-mono px-2 py-0.5 rounded border", `bg-gradient-to-r ${user.color} text-slate-900 border-cyan-400/30`)}>
                        {user.rank}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-cyan-400 hover:bg-purple-400/10 mt-2 font-mono border border-purple-400/20 hover:border-cyan-400/40 transition-all">
                    <Eye className="w-3 h-3 mr-2" />
                    View Full Network
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
