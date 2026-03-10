import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  MessageCircle, 
  Twitter, 
  Send, 
  Zap,
  Flame,
  Trophy,
  Users,
  Calendar,
  ThumbsUp,
  Share2,
  Image,
  Sparkles,
  Target,
  BarChart3,
  Globe,
  Radio,
  Newspaper,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const sentimentData = [
  { platform: 'Twitter', sentiment: 78, mentions: '12.4K', trend: '+15%' },
  { platform: 'Telegram', sentiment: 65, mentions: '8.2K', trend: '-3%' },
  { platform: 'Reddit', sentiment: 82, mentions: '4.1K', trend: '+28%' },
]

const activeEvents = [
  { 
    id: 1, 
    name: 'Meme Contest #12', 
    participants: 847, 
    prize: '5,000 SOL',
    endsIn: '2 days',
    type: 'contest'
  },
  { 
    id: 2, 
    name: 'Viral Challenge', 
    participants: 2341, 
    prize: '10M PEPE',
    endsIn: '5 hours',
    type: 'challenge'
  },
  { 
    id: 3, 
    name: 'Story DAO Launch', 
    participants: 156, 
    prize: 'NFT Drops',
    endsIn: '1 week',
    type: 'dao'
  },
]

const aiGeneratedContent = [
  { 
    type: 'meme', 
    prompt: 'When your coin does 10x after the AI hype cycle',
    likes: '2.4K',
    shares: 456
  },
  { 
    type: 'thread', 
    title: 'Why Memecoins Are the Future of Crypto',
    likes: '1.8K',
    shares: 892
  },
  { 
    type: 'tweet', 
    content: 'Just bridged my PEPE to Solana. Zero tax. Lightning fast. This is the way. 🐸🚀',
    likes: '892',
    shares: 234
  },
]

const loyaltyPoints = {
  current: 4250,
  earnedToday: 150,
  tier: 'Diamond',
  nextReward: 500,
  history: [
    { action: 'Bridge completed', points: 50, time: '2h ago' },
    { action: 'Event participated', points: 100, time: '5h ago' },
    { action: 'Content shared', points: 25, time: '1d ago' },
    { action: 'Referral bonus', points: 200, time: '2d ago' },
  ]
}

export function HypeRetentionModule() {
  const [selectedEvent, setSelectedEvent] = useState<typeof activeEvents[0] | null>(null)

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Viral Intelligence</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tighter uppercase italic">Sentiment Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="font-mono text-[10px] uppercase font-bold tracking-widest">
            <Globe className="w-3 h-3 mr-2" />
            Global Scan
          </Button>
          <Button size="sm" className="bg-primary text-background font-black uppercase italic tracking-widest px-4 shadow-glow-cyan">
            <Zap className="w-3 h-3 mr-2" />
            Sync Socials
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Matrix - Axiom style */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sentimentData.map((item, i) => (
              <Card key={i} className="glass border-border/50 group hover:border-primary/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {item.platform === 'Twitter' && <Twitter className="w-4 h-4 text-primary" />}
                      {item.platform === 'Telegram' && <Send className="w-4 h-4 text-primary" />}
                      {item.platform === 'Reddit' && <MessageCircle className="w-4 h-4 text-primary" />}
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.platform}</span>
                    </div>
                    <div className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded",
                      item.trend.startsWith('+') ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {item.trend}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-display font-black tracking-tighter italic">{item.sentiment}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Index</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold">{item.mentions}</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Mentions</div>
                    </div>
                  </div>
                  <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${item.sentiment}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-strong border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Operations</span>
              </div>
              <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest">Archive</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {activeEvents.map((event) => (
                  <div key={event.id} className="p-5 flex items-center justify-between group hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-lg group-hover:border-primary/30 transition-all">
                        {event.type === 'contest' ? '🏆' : event.type === 'challenge' ? '🎯' : '👥'}
                      </div>
                      <div>
                        <div className="text-sm font-bold uppercase tracking-wide group-hover:text-primary transition-colors">{event.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Ends in {event.endsIn}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-success">{event.prize}</div>
                        <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter">{event.participants} ACTIVE</div>
                      </div>
                      <Button variant="outline" size="sm" className="font-black text-[9px] uppercase italic tracking-widest px-4 border-primary/20 group-hover:bg-primary group-hover:text-background transition-all">JOIN OP</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-border/50 p-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Generative Stream
              </h4>
              <div className="space-y-3">
                {aiGeneratedContent.slice(0, 2).map((content, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-primary/10 text-primary border-transparent text-[8px] uppercase">{content.type}</Badge>
                      <span className="text-[9px] font-mono text-muted-foreground">ID: GEN_{i}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed mb-3 italic">"{content.type === 'meme' ? content.prompt : content.title || content.content}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {content.likes}</span>
                        <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Share2 className="w-3 h-3" /> {content.shares}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-[8px] font-black uppercase">DEPLOY</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[hsl(var(--background-deep))] border-border/50 p-6 relative overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Network Feed</h4>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-[10px] leading-relaxed text-muted-foreground uppercase font-bold tracking-tight">
                      <span className="text-foreground">System:</span> New viral cluster detected in <span className="text-primary">#SOLANA</span> sector. <span className="text-foreground">Confidence: 89%</span>.
                    </p>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </Card>
          </div>
        </div>

        {/* Loyalty & Rewards - Axiom Style */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-strong border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[100px] -z-10" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Loyalty Status</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-4 border-y border-border/30">
                <div className="text-5xl font-display font-black tracking-tighter italic leading-none">{loyaltyPoints.current.toLocaleString()}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mt-2">OPERATIVE XP</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Current Tier</span>
                  <Badge className="bg-primary text-background font-black text-[9px] italic italic-widest uppercase italic px-3">{loyaltyPoints.tier}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Next Unlock</span>
                    <span className="text-primary">{loyaltyPoints.nextReward} XP TO GO</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-glow-cyan" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Recent Gains</span>
                {loyaltyPoints.history.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-foreground">{item.action}</span>
                    <span className="text-primary">+{item.points}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-primary text-background font-black uppercase italic tracking-widest h-12 shadow-glow-cyan transition-all active:scale-95">
                REDEEM GEAR
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Boost Signal</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="w-full justify-start h-10 text-[9px] font-black uppercase tracking-widest border-border/50 hover:border-primary/30 transition-all">
                <Twitter className="w-3 h-3 mr-3 text-primary" /> X / Twitter Broadcast
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 text-[9px] font-black uppercase tracking-widest border-border/50 hover:border-primary/30 transition-all">
                <Send className="w-3 h-3 mr-3 text-primary" /> Telegram Intel
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 text-[9px] font-black uppercase tracking-widest border-border/50 hover:border-primary/30 transition-all">
                <Newspaper className="w-3 h-3 mr-3 text-primary" /> Substack Analysis
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
