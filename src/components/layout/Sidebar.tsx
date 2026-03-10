import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/', icon: ArrowRightLeft, label: 'Bridge', description: 'Cross-Chain Transfer' },
  { path: '/ai-analysis', icon: Brain, label: 'AI Scanner', description: 'Token Health Analysis' },
  { path: '/trust-score', icon: Shield, label: 'Trust Score', description: 'NFT Reputation System' },
  { path: '/hype', icon: TrendingUp, label: 'Hype Retention', description: 'Sentiment & Events' },
  { path: '/vaults', icon: FlaskConical, label: 'Revival Vaults', description: 'Rescue Dead Coins' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-purple">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-display font-bold text-lg gradient-text">MemeBridge</span>
              <span className="text-xs text-muted-foreground">AI Liquidity Hub</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Network Status */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Solana RPC:</span>
            <span className="text-success font-mono">Online</span>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-success animate-pulse mx-auto" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-glow-purple/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-primary" : ""
                  )} />
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col"
                    >
                      <span className={cn(
                        "font-medium text-sm",
                        isActive ? "text-primary" : ""
                      )}>
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </motion.div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
          "bg-secondary/10 text-secondary hover:bg-secondary/20"
        )}>
          <Wallet className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Connect Wallet</span>}
        </button>
        
        <button 
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
            "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <ChevronLeft className={cn(
            "w-5 h-5 transition-transform",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span className="text-sm">Collapse</span>}
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
      <main 
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "ml-20" : "ml-[280px]"
        )}
      >
        {children}
      </main>
    </div>
  )
}
