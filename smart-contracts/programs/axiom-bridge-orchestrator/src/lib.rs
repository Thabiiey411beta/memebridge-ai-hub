use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("AX1oMBridgeOrchestratorXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod axiom_bridge_orchestrator {
    use super::*;

    // Initialize the bridge orchestrator
    pub fn initialize_bridge(
        ctx: Context<InitializeBridge>,
        bridge_config: BridgeConfig,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;

        bridge.authority = ctx.accounts.authority.key();
        bridge.config = bridge_config;
        bridge.total_volume = 0;
        bridge.active_transfers = 0;
        bridge.emergency_paused = false;
        bridge.bump = ctx.bumps.bridge;

        // Initialize fee calculator
        let fee_calculator = &mut ctx.accounts.fee_calculator;
        fee_calculator.base_fee_bps = bridge_config.base_fee_bps;
        fee_calculator.dynamic_multiplier = 10000; // 1.0 in basis points
        fee_calculator.volume_threshold = bridge_config.daily_volume_limit / 10;
        fee_calculator.last_update = Clock::get()?.unix_timestamp;
        fee_calculator.bump = ctx.bumps.fee_calculator;

        // Initialize security validator
        let security = &mut ctx.accounts.security_validator;
        security.max_transfer_amount = bridge_config.max_transfer_amount;
        security.min_transfer_amount = bridge_config.min_transfer_amount;
        security.daily_volume_limit = bridge_config.daily_volume_limit;
        security.current_daily_volume = 0;
        security.day_start_timestamp = Clock::get()?.unix_timestamp;
        security.risk_score = 0;
        security.suspicious_patterns = vec![];
        security.bump = ctx.bumps.security_validator;

        emit!(BridgeInitializedEvent {
            authority: bridge.authority,
            config: bridge.config.clone(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Initiate a cross-chain transfer
    pub fn initiate_transfer(
        ctx: Context<InitiateTransfer>,
        amount: u64,
        destination_chain: String,
        recipient: Pubkey,
        metadata: TransferMetadata,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        let fee_calculator = &mut ctx.accounts.fee_calculator;
        let security = &mut ctx.accounts.security_validator;
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        // Check if bridge is paused
        require!(!bridge.emergency_paused, BridgeError::BridgePaused);

        // Security validation
        security.validate_transfer(
            amount,
            &ctx.accounts.user.key(),
            &destination_chain,
            &metadata,
            clock.unix_timestamp,
        )?;

        // Calculate fees
        let fee_info = fee_calculator.calculate_fee(
            amount,
            bridge.total_volume,
            security.risk_score,
        )?;

        let total_amount = amount.checked_add(fee_info.total_fee).unwrap();

        // Check user has enough tokens
        require!(ctx.accounts.user_token.amount >= total_amount, BridgeError::InsufficientFunds);

        // Transfer tokens to escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token.to_account_info(),
                    to: ctx.accounts.escrow_token.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            total_amount,
        )?;

        // Create escrow record
        escrow.transfer_id = bridge.active_transfers;
        escrow.initiator = ctx.accounts.user.key();
        escrow.amount = amount;
        escrow.fee = fee_info.total_fee;
        escrow.destination_chain = destination_chain.clone();
        escrow.recipient = recipient;
        escrow.metadata = metadata.clone();
        escrow.status = EscrowStatus::Pending;
        escrow.created_at = clock.unix_timestamp;
        escrow.expires_at = clock.unix_timestamp + (24 * 60 * 60); // 24 hours
        escrow.bump = ctx.bumps.escrow;

        // Update bridge stats
        bridge.total_volume = bridge.total_volume.checked_add(amount).unwrap();
        bridge.active_transfers = bridge.active_transfers.checked_add(1).unwrap();

        // Update security stats
        security.current_daily_volume = security.current_daily_volume.checked_add(amount).unwrap();

        emit!(TransferInitiatedEvent {
            transfer_id: escrow.transfer_id,
            initiator: ctx.accounts.user.key(),
            amount,
            fee: fee_info.total_fee,
            destination_chain,
            recipient,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Complete a transfer (called by relayers/oracles)
    pub fn complete_transfer(
        ctx: Context<CompleteTransfer>,
        transfer_id: u32,
        proof_data: Vec<u8>,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        let escrow = &mut ctx.accounts.escrow;
        let vault = &mut ctx.accounts.vault;
        let clock = Clock::get()?;

        // Verify escrow status
        require!(escrow.status == EscrowStatus::Pending, BridgeError::InvalidEscrowStatus);
        require!(escrow.transfer_id == transfer_id, BridgeError::TransferIdMismatch);

        // Verify proof (simplified - in practice would verify oracle signatures)
        require!(!proof_data.is_empty(), BridgeError::InvalidProof);

        // Check expiration
        require!(clock.unix_timestamp <= escrow.expires_at, BridgeError::TransferExpired);

        // Release tokens from vault to recipient
        vault.release_tokens(
            escrow.amount,
            escrow.recipient,
            &ctx.accounts.vault_token,
            &ctx.accounts.recipient_token,
            &ctx.accounts.token_program,
        )?;

        // Update escrow status
        escrow.status = EscrowStatus::Completed;
        escrow.completed_at = Some(clock.unix_timestamp);

        // Update bridge stats
        bridge.active_transfers = bridge.active_transfers.checked_sub(1).unwrap();

        emit!(TransferCompletedEvent {
            transfer_id,
            recipient: escrow.recipient,
            amount: escrow.amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Handle failed transfers (refunds)
    pub fn refund_transfer(
        ctx: Context<RefundTransfer>,
        transfer_id: u32,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        // Verify escrow status
        require!(escrow.status == EscrowStatus::Pending, BridgeError::InvalidEscrowStatus);
        require!(escrow.transfer_id == transfer_id, BridgeError::TransferIdMismatch);

        // Check if expired or manually triggered
        let can_refund = clock.unix_timestamp > escrow.expires_at ||
                        ctx.accounts.authority.key() == bridge.authority;

        require!(can_refund, BridgeError::CannotRefund);

        // Refund tokens to initiator
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token.to_account_info(),
                    to: ctx.accounts.initiator_token.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
            ),
            escrow.amount.checked_add(escrow.fee).unwrap(),
        )?;

        // Update escrow status
        escrow.status = EscrowStatus::Refunded;
        escrow.refunded_at = Some(clock.unix_timestamp);

        // Update bridge stats
        bridge.active_transfers = bridge.active_transfers.checked_sub(1).unwrap();

        emit!(TransferRefundedEvent {
            transfer_id,
            initiator: escrow.initiator,
            amount: escrow.amount,
            fee: escrow.fee,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Emergency pause/unpause
    pub fn emergency_pause(
        ctx: Context<EmergencyPause>,
        pause: bool,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;

        // Only governance can pause
        require!(ctx.accounts.authority.key() == bridge.authority, BridgeError::Unauthorized);

        bridge.emergency_paused = pause;

        emit!(EmergencyPauseEvent {
            paused: pause,
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Update bridge configuration
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_config: BridgeConfig,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;

        // Only governance can update
        require!(ctx.accounts.authority.key() == bridge.authority, BridgeError::Unauthorized);

        bridge.config = new_config;

        emit!(ConfigUpdatedEvent {
            new_config: bridge.config.clone(),
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bridge_config: BridgeConfig)]
pub struct InitializeBridge<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Bridge::LEN,
        seeds = [b"bridge"],
        bump
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        init,
        payer = authority,
        space = 8 + FeeCalculator::LEN,
        seeds = [b"fee_calculator"],
        bump
    )]
    pub fee_calculator: Account<'info, FeeCalculator>,

    #[account(
        init,
        payer = authority,
        space = 8 + SecurityValidator::LEN,
        seeds = [b"security_validator"],
        bump
    )]
    pub security_validator: Account<'info, SecurityValidator>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitiateTransfer<'info> {
    #[account(
        mut,
        seeds = [b"bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        mut,
        seeds = [b"fee_calculator"],
        bump = fee_calculator.bump
    )]
    pub fee_calculator: Account<'info, FeeCalculator>,

    #[account(
        mut,
        seeds = [b"security_validator"],
        bump = security_validator.bump
    )]
    pub security_validator: Account<'info, SecurityValidator>,

    #[account(
        init,
        payer = user,
        space = 8 + Escrow::LEN,
        seeds = [b"escrow", bridge.active_transfers.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = escrow
    )]
    pub escrow_token: Account<'info, TokenAccount>,

    pub mint: Account<'info, token::Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteTransfer<'info> {
    #[account(
        mut,
        seeds = [b"bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        mut,
        seeds = [b"escrow", escrow.transfer_id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = vault
    )]
    pub vault_token: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = relayer,
        associated_token::mint = mint,
        associated_token::authority = escrow.recipient
    )]
    pub recipient_token: Account<'info, TokenAccount>,

    pub mint: Account<'info, token::Mint>,

    #[account(mut)]
    pub relayer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundTransfer<'info> {
    #[account(
        mut,
        seeds = [b"bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        mut,
        seeds = [b"escrow", escrow.transfer_id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    pub authority: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow
    )]
    pub escrow_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow.initiator
    )]
    pub initiator_token: Account<'info, TokenAccount>,

    pub mint: Account<'info, token::Mint>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(
        mut,
        seeds = [b"bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [b"bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,

    pub authority: Signer<'info>,
}

// Account structs
#[account]
pub struct Bridge {
    pub authority: Pubkey,
    pub config: BridgeConfig,
    pub total_volume: u64,
    pub active_transfers: u32,
    pub emergency_paused: bool,
    pub bump: u8,
}

impl Bridge {
    pub const LEN: usize = 32 + BridgeConfig::LEN + 8 + 4 + 1 + 1;
}

#[account]
pub struct Escrow {
    pub transfer_id: u32,
    pub initiator: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub destination_chain: String,
    pub recipient: Pubkey,
    pub metadata: TransferMetadata,
    pub status: EscrowStatus,
    pub created_at: i64,
    pub expires_at: i64,
    pub completed_at: Option<i64>,
    pub refunded_at: Option<i64>,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 4 + 32 + 8 + 8 + (4 + 32) + 32 + TransferMetadata::LEN + 1 + 8 + 8 + (1 + 8) + (1 + 8) + 1;
}

// Import structs from other programs
#[account]
pub struct FeeCalculator {
    pub base_fee_bps: u16,
    pub dynamic_multiplier: u32,
    pub volume_threshold: u64,
    pub last_update: i64,
    pub bump: u8,
}

impl FeeCalculator {
    pub const LEN: usize = 2 + 4 + 8 + 8 + 1;

    pub fn calculate_fee(&mut self, amount: u64, total_volume: u64, risk_score: u16) -> Result<FeeInfo> {
        // Base fee calculation
        let base_fee = (amount as u128)
            .checked_mul(self.base_fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        // Dynamic multiplier based on volume
        let volume_multiplier = if total_volume > self.volume_threshold {
            15000 // 1.5x
        } else {
            10000 // 1.0x
        };

        // Risk multiplier
        let risk_multiplier = 10000u32.checked_add(risk_score as u32 * 100).unwrap();

        // Calculate total fee
        let total_fee = (base_fee as u128)
            .checked_mul(volume_multiplier as u128)
            .unwrap()
            .checked_mul(risk_multiplier as u128)
            .unwrap()
            .checked_div(10000 * 10000)
            .unwrap() as u64;

        Ok(FeeInfo {
            base_fee,
            volume_multiplier,
            risk_multiplier,
            total_fee,
        })
    }
}

#[account]
pub struct SecurityValidator {
    pub max_transfer_amount: u64,
    pub min_transfer_amount: u64,
    pub daily_volume_limit: u64,
    pub current_daily_volume: u64,
    pub day_start_timestamp: i64,
    pub risk_score: u16,
    pub suspicious_patterns: Vec<SuspiciousPattern>,
    pub bump: u8,
}

impl SecurityValidator {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8 + 2 + (4 + 10*SuspiciousPattern::LEN) + 1;

    pub fn validate_transfer(
        &mut self,
        amount: u64,
        user: &Pubkey,
        destination_chain: &str,
        metadata: &TransferMetadata,
        current_time: i64,
    ) -> Result<()> {
        // Check amount limits
        require!(amount >= self.min_transfer_amount, BridgeError::AmountTooLow);
        require!(amount <= self.max_transfer_amount, BridgeError::AmountTooHigh);

        // Check daily volume limit
        require!(
            self.current_daily_volume.checked_add(amount).unwrap() <= self.daily_volume_limit,
            BridgeError::DailyVolumeExceeded
        );

        // Check for suspicious patterns
        for pattern in &self.suspicious_patterns {
            if pattern.is_suspicious(user, destination_chain, metadata) {
                self.risk_score = self.risk_score.checked_add(1000).unwrap();
                break;
            }
        }

        Ok(())
    }
}

#[account]
pub struct Vault {
    pub total_locked: u64,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 8 + 1;

    pub fn release_tokens<'info>(
        &mut self,
        amount: u64,
        recipient: Pubkey,
        vault_token: &Account<'info, TokenAccount>,
        recipient_token: &Account<'info, TokenAccount>,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        // Transfer from vault to recipient
        token::transfer(
            CpiContext::new(
                token_program.to_account_info(),
                Transfer {
                    from: vault_token.to_account_info(),
                    to: recipient_token.to_account_info(),
                    authority: self.to_account_info(),
                },
            ),
            amount,
        )?;

        self.total_locked = self.total_locked.checked_sub(amount).unwrap();

        Ok(())
    }
}

// Data structures
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BridgeConfig {
    pub base_fee_bps: u16,
    pub max_transfer_amount: u64,
    pub min_transfer_amount: u64,
    pub daily_volume_limit: u64,
    pub supported_chains: Vec<String>,
}

impl BridgeConfig {
    pub const LEN: usize = 2 + 8 + 8 + 8 + (4 + 10*64); // Max 10 chains, 64 chars each
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TransferMetadata {
    pub memo: String,
    pub priority: TransferPriority,
}

impl TransferMetadata {
    pub const LEN: usize = (4 + 256) + 1; // Memo up to 256 chars
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TransferPriority {
    Standard,
    Fast,
    Instant,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum EscrowStatus {
    Pending,
    Completed,
    Refunded,
    Disputed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct FeeInfo {
    pub base_fee: u64,
    pub volume_multiplier: u32,
    pub risk_multiplier: u32,
    pub total_fee: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SuspiciousPattern {
    pub pattern_type: PatternType,
    pub threshold: u64,
    pub time_window: i64,
}

impl SuspiciousPattern {
    pub const LEN: usize = 1 + 8 + 8;

    pub fn is_suspicious(
        &self,
        user: &Pubkey,
        destination_chain: &str,
        metadata: &TransferMetadata,
    ) -> bool {
        // Simplified pattern detection
        match self.pattern_type {
            PatternType::FrequentTransfers => {
                // Would check transfer frequency
                false
            },
            PatternType::LargeAmount => {
                // Would check amount thresholds
                false
            },
            PatternType::BlacklistedDestination => {
                // Would check against blacklist
                false
            },
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum PatternType {
    FrequentTransfers,
    LargeAmount,
    BlacklistedDestination,
}

#[error_code]
pub enum BridgeError {
    #[msg("Bridge is currently paused")]
    BridgePaused,
    #[msg("Insufficient funds for transfer")]
    InsufficientFunds,
    #[msg("Invalid escrow status")]
    InvalidEscrowStatus,
    #[msg("Transfer ID mismatch")]
    TransferIdMismatch,
    #[msg("Invalid proof data")]
    InvalidProof,
    #[msg("Transfer has expired")]
    TransferExpired,
    #[msg("Cannot refund transfer")]
    CannotRefund,
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Transfer amount too low")]
    AmountTooLow,
    #[msg("Transfer amount too high")]
    AmountTooHigh,
    #[msg("Daily volume limit exceeded")]
    DailyVolumeExceeded,
}

// Events
#[event]
pub struct BridgeInitializedEvent {
    pub authority: Pubkey,
    pub config: BridgeConfig,
    pub timestamp: i64,
}

#[event]
pub struct TransferInitiatedEvent {
    pub transfer_id: u32,
    pub initiator: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub destination_chain: String,
    pub recipient: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TransferCompletedEvent {
    pub transfer_id: u32,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TransferRefundedEvent {
    pub transfer_id: u32,
    pub initiator: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub timestamp: i64,
}

#[event]
pub struct EmergencyPauseEvent {
    pub paused: bool,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ConfigUpdatedEvent {
    pub new_config: BridgeConfig,
    pub authority: Pubkey,
    pub timestamp: i64,
}