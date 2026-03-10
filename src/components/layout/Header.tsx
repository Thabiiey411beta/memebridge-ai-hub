import { useState } from 'react'
import { Menu, Search, Bell, Wallet, Bot, ChevronDown, Zap, Trophy, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  toggleSidebar: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  
  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Toggler & Search */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className={cn(
            "relative flex items-center transition-all duration-300 group hidden sm:flex",
            searchFocused ? "w-96" : "w-72"
          )}>
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="QUICK SEARCH [CTRL + K]"
              className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/50 rounded-xl text-xs font-mono tracking-wider focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Center: Global Market Stats */}
        <div className="hidden xl:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            SOL: <span className="text-foreground">$142.35</span>
          </div>
          <div className="flex items-center gap-2 border-l border-border/50 pl-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            GAS: <span className="text-foreground font-mono">12 GWEI</span>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Points/XP Display */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer">
            <Trophy className="w-4 h-4 text-primary" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">My Rewards</span>
              <span className="text-xs font-mono font-bold text-primary tracking-tighter">1,245 XP</span>
            </div>
          </div>

          <div className="h-8 w-px bg-border/50 hidden sm:block" />

          {/* AI Guardian Status */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Guardian</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-success" />)}
            </div>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-muted/30 border border-border/50 hover:text-primary transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-destructive shadow-glow-cyan animate-pulse" />
          </button>

          {/* Connect Wallet */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-background font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 shadow-glow-cyan transition-all">
            <Wallet className="w-4 h-4" />
            <span>Connect</span>
          </button>
        </div>
      </div>
    </header>
  )
}
