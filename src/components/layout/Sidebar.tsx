import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { 
  ArrowRightLeft, 
  Brain, 
  Shield, 
  TrendingUp, 
  FlaskConical,
  Settings,
  Wallet,
  Activity,
  ChevronLeft,
  Zap,
  Globe,
  Trophy,
  History,
  LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from './Header'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/', icon: LayoutGrid, label: 'Discover', description: 'Market Pulse' },
  { path: '/bridge', icon: ArrowRightLeft, label: 'Bridge', description: 'Cross-Chain' },
  { path: '/ai-analysis', icon: Brain, label: 'AI Scanner', description: 'Risk Analysis' },
  { path: '/trust-score', icon: Shield, label: 'Trust', description: 'Reputation' },
  { path: '/hype', icon: TrendingUp, label: 'Hype', description: 'Sentiment' },
  { path: '/vaults', icon: FlaskConical, label: 'Vaults', description: 'Revival' },
]

const stats = [
  { label: 'Volume', value: '$2.4B', color: 'text-primary' },
  { label: 'Verified', value: '15.2K', color: 'text-success' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300 shadow-2xl"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-glow-cyan shrink-0 transition-transform hover:scale-105 active:scale-95">
            <Zap className="w-5 h-5 text-background" fill="currentColor" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-display font-extrabold text-xl tracking-tighter text-foreground uppercase">Axiom</span>
              <span className="text-[10px] text-primary font-mono font-bold tracking-widest -mt-1 leading-none uppercase">Bridge Hub</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Rewards/Ranks Section - Axiom style */}
      {!collapsed && (
        <div className="mx-4 mt-6 p-3 rounded-xl bg-primary/5 border border-primary/10 group cursor-pointer hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Rank</span>
            </div>
            <span className="text-xs font-mono font-bold text-primary">#42</span>
          </div>
          <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-primary shadow-glow-cyan" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase">Silver Tier</span>
            <span className="text-[10px] text-primary font-bold">250/500 XP</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "opacity-70"
              )} />
              {!collapsed && (
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-xs uppercase tracking-wide">
                    {item.label}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Terminal Stats */}
      {!collapsed && (
        <div className="px-6 py-4 grid grid-cols-2 gap-4 border-t border-sidebar-border/50">
          {stats.map(stat => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <span className={cn("text-xs font-mono font-bold", stat.color)}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border/50 space-y-2">
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
          "bg-primary text-background hover:opacity-90 active:scale-95 font-bold text-xs uppercase tracking-wider shadow-glow-cyan"
        )}>
          <Wallet className="w-4 h-4" />
          {!collapsed && <span>Connect</span>}
        </button>
        
        <button 
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
            "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span className="text-[10px] uppercase font-bold tracking-widest">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div 
        className={cn(
          "min-h-screen transition-all duration-300 flex flex-col",
          collapsed ? "ml-20" : "ml-[260px]"
        )}
      >
        <Header toggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}