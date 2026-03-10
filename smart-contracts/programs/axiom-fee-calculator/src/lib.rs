use anchor_lang::prelude::*;

declare_id!("AX1oMFEEcalcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod axiom_fee_calculator {
    use super::*;

    // Calculate bridge fee with mathematical precision
    pub fn calculate_bridge_fee(
        ctx: Context<CalculateFee>,
        amount: u64,
        source_chain: String,
        target_chain: String,
        token_type: TokenType,
        urgency: UrgencyLevel,
    ) -> Result<u64> {
        let calculator = &ctx.accounts.calculator;
        let clock = Clock::get()?;

        // Base fee calculation
        let base_fee = calculator.base_fee;

        // Chain multiplier
        let chain_multiplier = if source_chain == target_chain {
            calculator.same_chain_multiplier
        } else {
            calculator.cross_chain_multiplier
        };

        // Token type multiplier
        let token_multiplier = match token_type {
            TokenType::Native => calculator.native_token_multiplier,
            TokenType::Stable => calculator.stable_token_multiplier,
            TokenType::Meme => calculator.meme_token_multiplier,
            TokenType::NFT => calculator.nft_multiplier,
        };

        // Urgency multiplier
        let urgency_multiplier = match urgency {
            UrgencyLevel::Standard => calculator.standard_urgency_multiplier,
            UrgencyLevel::Fast => calculator.fast_urgency_multiplier,
            UrgencyLevel::Instant => calculator.instant_urgency_multiplier,
        };

        // Time-based discount (lower fees during off-peak hours)
        let current_hour = (clock.unix_timestamp / 3600) % 24;
        let time_discount = if current_hour >= 2 && current_hour <= 6 {
            calculator.off_peak_discount // 20% discount during 2-6 AM
        } else {
            10000 // No discount
        };

        // Volume-based discount (higher volume = lower fees)
        let volume_discount = if amount > calculator.high_volume_threshold {
            calculator.high_volume_discount
        } else if amount > calculator.medium_volume_threshold {
            calculator.medium_volume_discount
        } else {
            10000 // No discount
        };

        // Calculate total fee using precise math
        // All multipliers are in basis points (1/10000)
        let total_multiplier = chain_multiplier
            .checked_mul(token_multiplier)
            .unwrap()
            .checked_mul(urgency_multiplier)
            .unwrap()
            .checked_mul(time_discount)
            .unwrap()
            .checked_mul(volume_discount)
            .unwrap();

        // Apply multiplier to base fee
        let adjusted_base_fee = (base_fee as u128)
            .checked_mul(total_multiplier as u128)
            .unwrap()
            .checked_div(100000000) // Divide by 100^3 to normalize (10000^2)
            .unwrap() as u64;

        // Calculate percentage of transfer amount
        let percentage_fee = (amount as u128)
            .checked_mul(calculator.percentage_fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        // Take the maximum of fixed fee and percentage fee
        let total_fee = adjusted_base_fee.max(percentage_fee);

        // Apply minimum and maximum bounds
        let final_fee = total_fee
            .max(calculator.min_fee)
            .min(calculator.max_fee);

        emit!(FeeCalculatedEvent {
            amount,
            source_chain,
            target_chain,
            token_type,
            urgency,
            total_fee: final_fee,
            breakdown: FeeBreakdown {
                base_fee,
                chain_multiplier,
                token_multiplier,
                urgency_multiplier,
                time_discount,
                volume_discount,
            },
            timestamp: clock.unix_timestamp,
        });

        Ok(final_fee)
    }

    // Update fee parameters (governance only)
    pub fn update_fee_parameters(
        ctx: Context<UpdateParameters>,
        new_base_fee: u64,
        new_percentage_fee_bps: u16,
        new_min_fee: u64,
        new_max_fee: u64,
    ) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;

        // Only governance can update parameters
        require!(ctx.accounts.governance.key() == calculator.governance, FeeError::Unauthorized);

        // Validate parameters
        require!(new_percentage_fee_bps <= 1000, FeeError::InvalidPercentageFee); // Max 10%
        require!(new_min_fee <= new_max_fee, FeeError::InvalidFeeBounds);
        require!(new_base_fee <= new_max_fee, FeeError::InvalidBaseFee);

        calculator.base_fee = new_base_fee;
        calculator.percentage_fee_bps = new_percentage_fee_bps;
        calculator.min_fee = new_min_fee;
        calculator.max_fee = new_max_fee;

        emit!(ParametersUpdatedEvent {
            new_base_fee,
            new_percentage_fee_bps,
            new_min_fee,
            new_max_fee,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Update multipliers (governance only)
    pub fn update_multipliers(
        ctx: Context<UpdateMultipliers>,
        updates: MultiplierUpdates,
    ) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;

        // Only governance can update multipliers
        require!(ctx.accounts.governance.key() == calculator.governance, FeeError::Unauthorized);

        // Validate all multipliers are reasonable (between 0.1x and 10x)
        let validate_multiplier = |mult: u32| mult >= 1000 && mult <= 100000;

        require!(validate_multiplier(updates.same_chain_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.cross_chain_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.native_token_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.stable_token_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.meme_token_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.nft_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.standard_urgency_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.fast_urgency_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.instant_urgency_multiplier), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.off_peak_discount), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.medium_volume_discount), FeeError::InvalidMultiplier);
        require!(validate_multiplier(updates.high_volume_discount), FeeError::InvalidMultiplier);

        calculator.same_chain_multiplier = updates.same_chain_multiplier;
        calculator.cross_chain_multiplier = updates.cross_chain_multiplier;
        calculator.native_token_multiplier = updates.native_token_multiplier;
        calculator.stable_token_multiplier = updates.stable_token_multiplier;
        calculator.meme_token_multiplier = updates.meme_token_multiplier;
        calculator.nft_multiplier = updates.nft_multiplier;
        calculator.standard_urgency_multiplier = updates.standard_urgency_multiplier;
        calculator.fast_urgency_multiplier = updates.fast_urgency_multiplier;
        calculator.instant_urgency_multiplier = updates.instant_urgency_multiplier;
        calculator.off_peak_discount = updates.off_peak_discount;
        calculator.medium_volume_discount = updates.medium_volume_discount;
        calculator.high_volume_discount = updates.high_volume_discount;

        emit!(MultipliersUpdatedEvent {
            updates,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Update volume thresholds
    pub fn update_volume_thresholds(
        ctx: Context<UpdateThresholds>,
        new_medium_threshold: u64,
        new_high_threshold: u64,
    ) -> Result<()> {
        let calculator = &mut ctx.accounts.calculator;

        // Only governance can update thresholds
        require!(ctx.accounts.governance.key() == calculator.governance, FeeError::Unauthorized);

        require!(new_medium_threshold < new_high_threshold, FeeError::InvalidThresholds);

        calculator.medium_volume_threshold = new_medium_threshold;
        calculator.high_volume_threshold = new_high_threshold;

        emit!(ThresholdsUpdatedEvent {
            medium_threshold: new_medium_threshold,
            high_threshold: new_high_threshold,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CalculateFee<'info> {
    pub calculator: Account<'info, FeeCalculator>,
}

#[derive(Accounts)]
pub struct UpdateParameters<'info> {
    #[account(
        mut,
        seeds = [b"fee_calculator"],
        bump = calculator.bump
    )]
    pub calculator: Account<'info, FeeCalculator>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMultipliers<'info> {
    #[account(
        mut,
        seeds = [b"fee_calculator"],
        bump = calculator.bump
    )]
    pub calculator: Account<'info, FeeCalculator>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateThresholds<'info> {
    #[account(
        mut,
        seeds = [b"fee_calculator"],
        bump = calculator.bump
    )]
    pub calculator: Account<'info, FeeCalculator>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct FeeCalculator {
    pub governance: Pubkey,
    pub base_fee: u64,                    // Base fee in lamports
    pub percentage_fee_bps: u16,          // Percentage fee in basis points
    pub min_fee: u64,                     // Minimum fee
    pub max_fee: u64,                     // Maximum fee

    // Multipliers (in basis points, 10000 = 1x)
    pub same_chain_multiplier: u32,       // 1.0x for same chain
    pub cross_chain_multiplier: u32,      // 1.5x for cross-chain
    pub native_token_multiplier: u32,     // 1.0x for native tokens
    pub stable_token_multiplier: u32,     // 0.8x for stablecoins
    pub meme_token_multiplier: u32,       // 1.2x for meme coins
    pub nft_multiplier: u32,              // 2.0x for NFTs

    // Urgency multipliers
    pub standard_urgency_multiplier: u32, // 1.0x standard
    pub fast_urgency_multiplier: u32,     // 1.5x fast
    pub instant_urgency_multiplier: u32,  // 2.0x instant

    // Discounts
    pub off_peak_discount: u32,           // 0.8x during off-peak
    pub medium_volume_discount: u32,      // 0.9x for medium volume
    pub high_volume_discount: u32,        // 0.7x for high volume

    // Volume thresholds
    pub medium_volume_threshold: u64,     // Amount for medium discount
    pub high_volume_threshold: u64,       // Amount for high discount

    pub bump: u8,
}

impl FeeCalculator {
    pub const LEN: usize = 32 + 8 + 2 + 8 + 8 + (4 * 12) + (4 * 3) + (4 * 3) + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TokenType {
    Native,
    Stable,
    Meme,
    NFT,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum UrgencyLevel {
    Standard,
    Fast,
    Instant,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MultiplierUpdates {
    pub same_chain_multiplier: u32,
    pub cross_chain_multiplier: u32,
    pub native_token_multiplier: u32,
    pub stable_token_multiplier: u32,
    pub meme_token_multiplier: u32,
    pub nft_multiplier: u32,
    pub standard_urgency_multiplier: u32,
    pub fast_urgency_multiplier: u32,
    pub instant_urgency_multiplier: u32,
    pub off_peak_discount: u32,
    pub medium_volume_discount: u32,
    pub high_volume_discount: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct FeeBreakdown {
    pub base_fee: u64,
    pub chain_multiplier: u32,
    pub token_multiplier: u32,
    pub urgency_multiplier: u32,
    pub time_discount: u32,
    pub volume_discount: u32,
}

#[error_code]
pub enum FeeError {
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Invalid percentage fee")]
    InvalidPercentageFee,
    #[msg("Invalid fee bounds")]
    InvalidFeeBounds,
    #[msg("Invalid base fee")]
    InvalidBaseFee,
    #[msg("Invalid multiplier value")]
    InvalidMultiplier,
    #[msg("Invalid volume thresholds")]
    InvalidThresholds,
}

#[event]
pub struct FeeCalculatedEvent {
    pub amount: u64,
    pub source_chain: String,
    pub target_chain: String,
    pub token_type: TokenType,
    pub urgency: UrgencyLevel,
    pub total_fee: u64,
    pub breakdown: FeeBreakdown,
    pub timestamp: i64,
}

#[event]
pub struct ParametersUpdatedEvent {
    pub new_base_fee: u64,
    pub new_percentage_fee_bps: u16,
    pub new_min_fee: u64,
    pub new_max_fee: u64,
    pub timestamp: i64,
}

#[event]
pub struct MultipliersUpdatedEvent {
    pub updates: MultiplierUpdates,
    pub timestamp: i64,
}

#[event]
pub struct ThresholdsUpdatedEvent {
    pub medium_threshold: u64,
    pub high_threshold: u64,
    pub timestamp: i64,
}