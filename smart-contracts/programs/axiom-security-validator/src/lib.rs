use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

declare_id!("AX1oMSecurityXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod axiom_security_validator {
    use super::*;

    // Validate token for bridging
    pub fn validate_token(ctx: Context<ValidateToken>, token_address: Pubkey) -> Result<ValidationResult> {
        let validator = &ctx.accounts.validator;
        let token_account = &ctx.accounts.token_account;
        let clock = Clock::get()?;

        let mut result = ValidationResult {
            is_valid: true,
            risk_score: 0,
            flags: vec![],
            liquidity_score: 0,
            holder_distribution: 0,
            contract_age_days: 0,
            last_audit_days: 0,
        };

        // Check token supply concentration (honeypot detection)
        if token_account.amount > validator.max_supply_concentration {
            result.flags.push(SecurityFlag::HighSupplyConcentration);
            result.risk_score += 30;
        }

        // Check liquidity
        let liquidity_score = calculate_liquidity_score(token_account.amount, validator.min_liquidity_threshold);
        result.liquidity_score = liquidity_score;

        if liquidity_score < 50 {
            result.flags.push(SecurityFlag::LowLiquidity);
            result.risk_score += 40;
        }

        // Check contract age (proxy for established tokens)
        let contract_age_days = (clock.unix_timestamp - validator.genesis_timestamp) / 86400;
        result.contract_age_days = contract_age_days as u32;

        if contract_age_days < 30 {
            result.flags.push(SecurityFlag::NewToken);
            result.risk_score += 20;
        }

        // Check holder distribution
        let holder_distribution = calculate_holder_distribution(token_account.amount);
        result.holder_distribution = holder_distribution;

        if holder_distribution < 30 {
            result.flags.push(SecurityFlag::PoorDistribution);
            result.risk_score += 25;
        }

        // Check audit status
        let last_audit_days = if let Some(last_audit) = validator.last_audit_timestamp {
            ((clock.unix_timestamp - last_audit) / 86400) as u32
        } else {
            u32::MAX
        };
        result.last_audit_days = last_audit_days;

        if last_audit_days > 365 {
            result.flags.push(SecurityFlag::OutdatedAudit);
            result.risk_score += 15;
        }

        // Final risk assessment
        if result.risk_score >= validator.critical_risk_threshold {
            result.flags.push(SecurityFlag::CriticalRisk);
            result.is_valid = false;
        } else if result.risk_score >= validator.high_risk_threshold {
            result.flags.push(SecurityFlag::HighRisk);
        } else if result.risk_score >= validator.medium_risk_threshold {
            result.flags.push(SecurityFlag::MediumRisk);
        }

        emit!(TokenValidatedEvent {
            token_address,
            result: result.clone(),
            timestamp: clock.unix_timestamp,
        });

        Ok(result)
    }

    // Validate bridge transaction
    pub fn validate_bridge_transaction(
        ctx: Context<ValidateBridge>,
        amount: u64,
        source_chain: String,
        target_chain: String,
        sender: Pubkey,
    ) -> Result<BridgeValidationResult> {
        let validator = &ctx.accounts.validator;
        let clock = Clock::get()?;

        let mut result = BridgeValidationResult {
            is_valid: true,
            risk_score: 0,
            flags: vec![],
            recommended_fee_bps: validator.base_fee_bps,
        };

        // Check amount limits
        if amount < validator.min_bridge_amount {
            result.flags.push(BridgeFlag::AmountTooLow);
            result.risk_score += 10;
        }

        if amount > validator.max_bridge_amount {
            result.flags.push(BridgeFlag::AmountTooHigh);
            result.risk_score += 20;
        }

        // Check cross-chain risks
        if source_chain != target_chain {
            result.risk_score += 15; // Cross-chain has inherent risks

            // Check if chains are supported
            if !validator.supported_chains.contains(&source_chain) ||
               !validator.supported_chains.contains(&target_chain) {
                result.flags.push(BridgeFlag::UnsupportedChain);
                result.is_valid = false;
            }
        }

        // Check sender reputation (simplified)
        if validator.blacklisted_addresses.contains(&sender) {
            result.flags.push(BridgeFlag::BlacklistedSender);
            result.is_valid = false;
        }

        // Time-based checks
        let current_hour = (clock.unix_timestamp / 3600) % 24;
        if current_hour >= 0 && current_hour <= 4 {
            result.flags.push(BridgeFlag::OffHoursTransaction);
            result.risk_score += 5;
        }

        // Adjust fee based on risk
        if result.risk_score > 50 {
            result.recommended_fee_bps = (result.recommended_fee_bps as u32)
                .saturating_mul(150) // 1.5x fee for high risk
                .saturating_div(100) as u16;
        } else if result.risk_score > 25 {
            result.recommended_fee_bps = (result.recommended_fee_bps as u32)
                .saturating_mul(120) // 1.2x fee for medium risk
                .saturating_div(100) as u16;
        }

        emit!(BridgeValidatedEvent {
            amount,
            source_chain,
            target_chain,
            sender,
            result: result.clone(),
            timestamp: clock.unix_timestamp,
        });

        Ok(result)
    }

    // Update security parameters (governance only)
    pub fn update_security_parameters(
        ctx: Context<UpdateSecurityParams>,
        updates: SecurityParameterUpdates,
    ) -> Result<()> {
        let validator = &mut ctx.accounts.validator;

        // Only governance can update parameters
        require!(ctx.accounts.governance.key() == validator.governance, SecurityError::Unauthorized);

        // Validate parameters
        require!(updates.min_bridge_amount < updates.max_bridge_amount, SecurityError::InvalidAmountBounds);
        require!(updates.medium_risk_threshold <= updates.high_risk_threshold, SecurityError::InvalidRiskThresholds);
        require!(updates.high_risk_threshold <= updates.critical_risk_threshold, SecurityError::InvalidRiskThresholds);

        validator.min_bridge_amount = updates.min_bridge_amount;
        validator.max_bridge_amount = updates.max_bridge_amount;
        validator.medium_risk_threshold = updates.medium_risk_threshold;
        validator.high_risk_threshold = updates.high_risk_threshold;
        validator.critical_risk_threshold = updates.critical_risk_threshold;
        validator.max_supply_concentration = updates.max_supply_concentration;
        validator.min_liquidity_threshold = updates.min_liquidity_threshold;
        validator.base_fee_bps = updates.base_fee_bps;

        emit!(SecurityParametersUpdatedEvent {
            updates,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Update supported chains
    pub fn update_supported_chains(
        ctx: Context<UpdateChains>,
        chains: Vec<String>,
    ) -> Result<()> {
        let validator = &mut ctx.accounts.validator;

        // Only governance can update chains
        require!(ctx.accounts.governance.key() == validator.governance, SecurityError::Unauthorized);

        validator.supported_chains = chains.clone();

        emit!(ChainsUpdatedEvent {
            chains,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Update blacklist
    pub fn update_blacklist(
        ctx: Context<UpdateBlacklist>,
        add_addresses: Vec<Pubkey>,
        remove_addresses: Vec<Pubkey>,
    ) -> Result<()> {
        let validator = &mut ctx.accounts.validator;

        // Only governance can update blacklist
        require!(ctx.accounts.governance.key() == validator.governance, SecurityError::Unauthorized);

        // Add addresses to blacklist
        for address in add_addresses {
            if !validator.blacklisted_addresses.contains(&address) {
                validator.blacklisted_addresses.push(address);
            }
        }

        // Remove addresses from blacklist
        validator.blacklisted_addresses.retain(|addr| !remove_addresses.contains(addr));

        emit!(BlacklistUpdatedEvent {
            added: add_addresses,
            removed: remove_addresses,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Update audit timestamp
    pub fn update_audit_timestamp(
        ctx: Context<UpdateAudit>,
        token_address: Pubkey,
        audit_timestamp: i64,
    ) -> Result<()> {
        let validator = &mut ctx.accounts.validator;

        // Only governance can update audit info
        require!(ctx.accounts.governance.key() == validator.governance, SecurityError::Unauthorized);

        validator.last_audit_timestamp = Some(audit_timestamp);

        emit!(AuditUpdatedEvent {
            token_address,
            audit_timestamp,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// Helper functions
fn calculate_liquidity_score(current_liquidity: u64, min_threshold: u64) -> u8 {
    if current_liquidity >= min_threshold * 2 {
        100
    } else if current_liquidity >= min_threshold {
        75
    } else if current_liquidity >= min_threshold / 2 {
        50
    } else if current_liquidity >= min_threshold / 4 {
        25
    } else {
        0
    }
}

fn calculate_holder_distribution(total_supply: u64) -> u8 {
    // Simplified calculation - in reality, would query actual holder data
    // This is a placeholder that returns a score based on supply
    if total_supply > 1000000000 { // 1B tokens
        80
    } else if total_supply > 100000000 { // 100M tokens
        60
    } else if total_supply > 10000000 { // 10M tokens
        40
    } else {
        20
    }
}

#[derive(Accounts)]
pub struct ValidateToken<'info> {
    pub validator: Account<'info, SecurityValidator>,
    pub token_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct ValidateBridge<'info> {
    pub validator: Account<'info, SecurityValidator>,
}

#[derive(Accounts)]
pub struct UpdateSecurityParams<'info> {
    #[account(
        mut,
        seeds = [b"security_validator"],
        bump = validator.bump
    )]
    pub validator: Account<'info, SecurityValidator>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateChains<'info> {
    #[account(
        mut,
        seeds = [b"security_validator"],
        bump = validator.bump
    )]
    pub validator: Account<'info, SecurityValidator>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBlacklist<'info> {
    #[account(
        mut,
        seeds = [b"security_validator"],
        bump = validator.bump
    )]
    pub validator: Account<'info, SecurityValidator>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAudit<'info> {
    #[account(
        mut,
        seeds = [b"security_validator"],
        bump = validator.bump
    )]
    pub validator: Account<'info, SecurityValidator>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct SecurityValidator {
    pub governance: Pubkey,
    pub genesis_timestamp: i64,

    // Bridge limits
    pub min_bridge_amount: u64,
    pub max_bridge_amount: u64,

    // Risk thresholds
    pub medium_risk_threshold: u8,
    pub high_risk_threshold: u8,
    pub critical_risk_threshold: u8,

    // Token validation parameters
    pub max_supply_concentration: u64,
    pub min_liquidity_threshold: u64,

    // Fee parameters
    pub base_fee_bps: u16,

    // Supported chains
    pub supported_chains: Vec<String>,

    // Blacklisted addresses
    pub blacklisted_addresses: Vec<Pubkey>,

    // Audit information
    pub last_audit_timestamp: Option<i64>,

    pub bump: u8,
}

impl SecurityValidator {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1 + 1 + 1 + 8 + 8 + 2 + (4 + 32*10) + (4 + 32*100) + (1 + 8) + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub risk_score: u8,
    pub flags: Vec<SecurityFlag>,
    pub liquidity_score: u8,
    pub holder_distribution: u8,
    pub contract_age_days: u32,
    pub last_audit_days: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BridgeValidationResult {
    pub is_valid: bool,
    pub risk_score: u8,
    pub flags: Vec<BridgeFlag>,
    pub recommended_fee_bps: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum SecurityFlag {
    HighSupplyConcentration,
    LowLiquidity,
    NewToken,
    PoorDistribution,
    OutdatedAudit,
    MediumRisk,
    HighRisk,
    CriticalRisk,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum BridgeFlag {
    AmountTooLow,
    AmountTooHigh,
    UnsupportedChain,
    BlacklistedSender,
    OffHoursTransaction,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SecurityParameterUpdates {
    pub min_bridge_amount: u64,
    pub max_bridge_amount: u64,
    pub medium_risk_threshold: u8,
    pub high_risk_threshold: u8,
    pub critical_risk_threshold: u8,
    pub max_supply_concentration: u64,
    pub min_liquidity_threshold: u64,
    pub base_fee_bps: u16,
}

#[error_code]
pub enum SecurityError {
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Invalid amount bounds")]
    InvalidAmountBounds,
    #[msg("Invalid risk thresholds")]
    InvalidRiskThresholds,
}

#[event]
pub struct TokenValidatedEvent {
    pub token_address: Pubkey,
    pub result: ValidationResult,
    pub timestamp: i64,
}

#[event]
pub struct BridgeValidatedEvent {
    pub amount: u64,
    pub source_chain: String,
    pub target_chain: String,
    pub sender: Pubkey,
    pub result: BridgeValidationResult,
    pub timestamp: i64,
}

#[event]
pub struct SecurityParametersUpdatedEvent {
    pub updates: SecurityParameterUpdates,
    pub timestamp: i64,
}

#[event]
pub struct ChainsUpdatedEvent {
    pub chains: Vec<String>,
    pub timestamp: i64,
}

#[event]
pub struct BlacklistUpdatedEvent {
    pub added: Vec<Pubkey>,
    pub removed: Vec<Pubkey>,
    pub timestamp: i64,
}

#[event]
pub struct AuditUpdatedEvent {
    pub token_address: Pubkey,
    pub audit_timestamp: i64,
    pub timestamp: i64,
}