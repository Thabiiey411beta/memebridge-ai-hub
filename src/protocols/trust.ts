import { createHelius } from 'helius-sdk'

// Types for trust scoring
export interface TrustFactors {
  tokenHealth: number // 0-100
  developerReputation: number // 0-100
  communityStrength: number // 0-100
  liquidityStability: number // 0-100
  socialSentiment: number // 0-100
  onChainActivity: number // 0-100
}

export interface TrustScore {
  overall: number // 0-100
  factors: TrustFactors
  nftEligible: boolean
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  lastUpdated: number
  history: TrustScoreHistory[]
}

export interface TrustScoreHistory {
  score: number
  timestamp: number
  event: string
}

export interface TrustScoreNFT {
  tokenId: string
  score: number
  tier: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
  }
}

export class TrustScoreProtocol {
  private helius: ReturnType<typeof createHelius>
  private scores: Map<string, TrustScore> = new Map()

  constructor(heliusApiKey: string) {
    this.helius = createHelius({ apiKey: heliusApiKey })
  }

  async calculateTrustScore(tokenAddress: string): Promise<TrustScore> {
    try {
      // Calculate individual factors
      const [tokenHealth, developerRep, communityStrength, liquidityStability, socialSentiment, onChainActivity] = await Promise.all([
        this.calculateTokenHealth(tokenAddress),
        this.calculateDeveloperReputation(tokenAddress),
        this.calculateCommunityStrength(tokenAddress),
        this.calculateLiquidityStability(tokenAddress),
        this.calculateSocialSentiment(tokenAddress),
        this.calculateOnChainActivity(tokenAddress)
      ])

      const factors: TrustFactors = {
        tokenHealth,
        developerReputation: developerRep,
        communityStrength,
        liquidityStability,
        socialSentiment,
        onChainActivity
      }

      // Weighted average for overall score
      const weights = {
        tokenHealth: 0.25,
        developerReputation: 0.20,
        communityStrength: 0.20,
        liquidityStability: 0.15,
        socialSentiment: 0.10,
        onChainActivity: 0.10
      }

      const overall = Math.round(
        factors.tokenHealth * weights.tokenHealth +
        factors.developerReputation * weights.developerReputation +
        factors.communityStrength * weights.communityStrength +
        factors.liquidityStability * weights.liquidityStability +
        factors.socialSentiment * weights.socialSentiment +
        factors.onChainActivity * weights.onChainActivity
      )

      const tier = this.getTier(overall)
      const nftEligible = overall >= 70

      const trustScore: TrustScore = {
        overall,
        factors,
        nftEligible,
        tier,
        lastUpdated: Date.now(),
        history: this.getScoreHistory(tokenAddress)
      }

      // Store the score
      this.scores.set(tokenAddress, trustScore)

      return trustScore
    } catch (error) {
      console.error('Error calculating trust score:', error)
      return this.getDefaultTrustScore()
    }
  }

  private async calculateTokenHealth(tokenAddress: string): Promise<number> {
    try {
      // Get token metadata and basic health metrics
      const asset = await this.helius.getAsset(tokenAddress)

      let score = 50 // Base score

      // Check if token has proper metadata
      if (asset.content?.metadata) {
        score += 20
      }

      // Check supply distribution
      const supply = asset.token_info?.supply || 0
      if (supply > 0) {
        score += 10
      }

      // Check for suspicious patterns
      if (asset.mutable) {
        score -= 10 // Mutable metadata can be risky
      }

      return Math.max(0, Math.min(100, score))
    } catch (error) {
      return 30 // Low score if we can't fetch data
    }
  }

  private async calculateDeveloperReputation(tokenAddress: string): Promise<number> {
    // This would check developer wallet history, previous projects, etc.
    // Placeholder implementation
    return Math.floor(Math.random() * 40) + 60 // 60-100 range
  }

  private async calculateCommunityStrength(tokenAddress: string): Promise<number> {
    try {
      // Get holder count and distribution
      const tokenAccounts = await this.helius.getTokenAccounts({
        mint: tokenAddress,
        limit: 1000
      })

      const holderCount = tokenAccounts.length
      let score = 0

      if (holderCount > 1000) score = 90
      else if (holderCount > 500) score = 70
      else if (holderCount > 100) score = 50
      else if (holderCount > 50) score = 30
      else score = 10

      // Check holder distribution (avoid whale dominance)
      const totalSupply = tokenAccounts.reduce((sum, acc) => sum + acc.amount, 0)
      const topHolderPercentage = Math.max(...tokenAccounts.map(acc => acc.amount)) / totalSupply

      if (topHolderPercentage > 0.5) score -= 20
      else if (topHolderPercentage > 0.2) score -= 10

      return Math.max(0, Math.min(100, score))
    } catch (error) {
      return 40
    }
  }

  private async calculateLiquidityStability(tokenAddress: string): Promise<number> {
    // Check liquidity pools and stability
    // This would integrate with DEX APIs
    // Placeholder
    return Math.floor(Math.random() * 30) + 70 // 70-100 range
  }

  private async calculateSocialSentiment(tokenAddress: string): Promise<number> {
    // Analyze social media sentiment
    // This would integrate with Twitter/X, Telegram APIs
    // Placeholder
    return Math.floor(Math.random() * 40) + 60 // 60-100 range
  }

  private async calculateOnChainActivity(tokenAddress: string): Promise<number> {
    try {
      // Get recent transaction activity
      const transactions = await this.helius.getTransactions({
        account: tokenAddress,
        limit: 50
      })

      const recentTxCount = transactions.length
      const avgTxPerDay = recentTxCount / 7 // Assuming 7 days of data

      let score = 0
      if (avgTxPerDay > 100) score = 90
      else if (avgTxPerDay > 50) score = 70
      else if (avgTxPerDay > 20) score = 50
      else if (avgTxPerDay > 5) score = 30
      else score = 10

      return score
    } catch (error) {
      return 30
    }
  }

  private getTier(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (score >= 90) return 'Platinum'
    if (score >= 75) return 'Gold'
    if (score >= 60) return 'Silver'
    return 'Bronze'
  }

  private getScoreHistory(tokenAddress: string): TrustScoreHistory[] {
    // In a real implementation, this would be stored in a database
    // Placeholder
    return [
      {
        score: 65,
        timestamp: Date.now() - 86400000, // 1 day ago
        event: 'Initial assessment'
      }
    ]
  }

  private getDefaultTrustScore(): TrustScore {
    return {
      overall: 50,
      factors: {
        tokenHealth: 50,
        developerReputation: 50,
        communityStrength: 50,
        liquidityStability: 50,
        socialSentiment: 50,
        onChainActivity: 50
      },
      nftEligible: false,
      tier: 'Bronze',
      lastUpdated: Date.now(),
      history: []
    }
  }

  async mintTrustScoreNFT(tokenAddress: string, score: TrustScore): Promise<TrustScoreNFT> {
    if (!score.nftEligible) {
      throw new Error('Token not eligible for Trust Score NFT')
    }

    // This would interact with an NFT contract on Solana
    // Placeholder implementation
    const tokenId = `trust_${tokenAddress}_${Date.now()}`

    const nft: TrustScoreNFT = {
      tokenId,
      score: score.overall,
      tier: score.tier,
      metadata: {
        name: `Trust Score - ${score.tier}`,
        description: `Trust Score NFT for token with ${score.overall}/100 trust rating`,
        image: `https://api.trustscore.com/nft/${tokenId}.png`,
        attributes: [
          { trait_type: 'Trust Score', value: score.overall },
          { trait_type: 'Tier', value: score.tier },
          { trait_type: 'Token Health', value: score.factors.tokenHealth },
          { trait_type: 'Community Strength', value: score.factors.communityStrength },
          { trait_type: 'Developer Reputation', value: score.factors.developerReputation }
        ]
      }
    }

    return nft
  }

  async getTrustScore(tokenAddress: string): Promise<TrustScore | null> {
    return this.scores.get(tokenAddress) || null
  }

  async updateTrustScore(tokenAddress: string, event: string): Promise<TrustScore> {
    const currentScore = await this.calculateTrustScore(tokenAddress)

    // Add event to history
    currentScore.history.push({
      score: currentScore.overall,
      timestamp: Date.now(),
      event
    })

    return currentScore
  }
}