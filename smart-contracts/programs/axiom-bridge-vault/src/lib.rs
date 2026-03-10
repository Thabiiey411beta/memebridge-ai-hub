use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("AX1oMBrideHUBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod axiom_bridge_vault {
    use super::*;

    // Initialize the bridge vault
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.total_locked = 0;
        vault.bridge_fee_bps = 30; // 0.3% default fee
        vault.emergency_pause = false;
        vault.bump = ctx.bumps.vault;

        emit!(VaultInitializedEvent {
            authority: vault.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Lock tokens for bridging
    pub fn lock_tokens(ctx: Context<LockTokens>, amount: u64, target_chain: String, recipient: Pubkey) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_token_account = &ctx.accounts.user_token_account;
        let vault_token_account = &ctx.accounts.vault_token_account;
        let token_program = &ctx.accounts.token_program;

        // Check if vault is not paused
        require!(!vault.emergency_pause, BridgeError::VaultPaused);

        // Validate amount
        require!(amount > 0, BridgeError::InvalidAmount);

        // Calculate fee
        let fee = (amount as u128)
            .checked_mul(vault.bridge_fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        let net_amount = amount.checked_sub(fee).unwrap();

        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                token_program.to_account_info(),
                Transfer {
                    from: user_token_account.to_account_info(),
                    to: vault_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update vault state
        vault.total_locked = vault.total_locked.checked_add(net_amount).unwrap();

        // Generate bridge request ID
        let bridge_id = Clock::get()?.unix_timestamp as u64;

        emit!(TokensLockedEvent {
            user: ctx.accounts.user.key(),
            token_mint: ctx.accounts.token_mint.key(),
            amount: net_amount,
            fee,
            target_chain,
            recipient,
            bridge_id,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Release tokens after successful cross-chain transfer
    pub fn release_tokens(ctx: Context<ReleaseTokens>, bridge_id: u64, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let vault_token_account = &ctx.accounts.vault_token_account;
        let recipient_token_account = &ctx.accounts.recipient_token_account;
        let token_program = &ctx.accounts.token_program;

        // Only authority can release tokens
        require!(ctx.accounts.authority.key() == vault.authority, BridgeError::Unauthorized);

        // Validate amount
        require!(amount > 0, BridgeError::InvalidAmount);
        require!(vault.total_locked >= amount, BridgeError::InsufficientFunds);

        // Transfer tokens from vault to recipient
        let vault_bump = vault.bump;
        let vault_seeds = &[
            b"vault",
            vault.authority.as_ref(),
            &[vault_bump],
        ];
        let vault_signer = &[&vault_seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                Transfer {
                    from: vault_token_account.to_account_info(),
                    to: recipient_token_account.to_account_info(),
                    authority: vault.to_account_info(),
                },
                vault_signer,
            ),
            amount,
        )?;

        // Update vault state
        vault.total_locked = vault.total_locked.checked_sub(amount).unwrap();

        emit!(TokensReleasedEvent {
            recipient: ctx.accounts.recipient.key(),
            token_mint: ctx.accounts.token_mint.key(),
            amount,
            bridge_id,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Update bridge fee
    pub fn update_bridge_fee(ctx: Context<UpdateFee>, new_fee_bps: u16) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        // Only authority can update fee
        require!(ctx.accounts.authority.key() == vault.authority, BridgeError::Unauthorized);

        // Validate fee (max 5%)
        require!(new_fee_bps <= 500, BridgeError::InvalidFee);

        vault.bridge_fee_bps = new_fee_bps;

        emit!(FeeUpdatedEvent {
            new_fee_bps,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Emergency pause/unpause
    pub fn emergency_pause(ctx: Context<EmergencyControl>, pause: bool) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        // Only authority can pause/unpause
        require!(ctx.accounts.authority.key() == vault.authority, BridgeError::Unauthorized);

        vault.emergency_pause = pause;

        emit!(EmergencyPauseEvent {
            paused: pause,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Withdraw accumulated fees
    pub fn withdraw_fees(ctx: Context<WithdrawFees>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let vault_token_account = &ctx.accounts.vault_token_account;
        let fee_recipient = &ctx.accounts.fee_recipient;
        let token_program = &ctx.accounts.token_program;

        // Only authority can withdraw fees
        require!(ctx.accounts.authority.key() == vault.authority, BridgeError::Unauthorized);

        // Check if vault has enough tokens (fees are separate from locked tokens)
        let vault_balance = vault_token_account.amount;
        require!(vault_balance >= amount, BridgeError::InsufficientFunds);

        // Transfer fees
        let vault_bump = vault.bump;
        let vault_seeds = &[
            b"vault",
            vault.authority.as_ref(),
            &[vault_bump],
        ];
        let vault_signer = &[&vault_seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                Transfer {
                    from: vault_token_account.to_account_info(),
                    to: fee_recipient.to_account_info(),
                    authority: vault.to_account_info(),
                },
                vault_signer,
            ),
            amount,
        )?;

        emit!(FeesWithdrawnEvent {
            recipient: ctx.accounts.fee_recipient.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockTokens<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_mint,
        associated_token::authority = vault
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseTokens<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = vault
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is the recipient of the tokens
    pub recipient: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EmergencyControl<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = vault
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = fee_recipient
    )]
    pub fee_recipient: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub total_locked: u64,
    pub bridge_fee_bps: u16, // Fee in basis points (1/100th of a percent)
    pub emergency_pause: bool,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 32 + 8 + 2 + 1 + 1; // authority + total_locked + fee + pause + bump
}

#[error_code]
pub enum BridgeError {
    #[msg("Vault is currently paused")]
    VaultPaused,
    #[msg("Invalid amount specified")]
    InvalidAmount,
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Invalid fee percentage")]
    InvalidFee,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}

#[event]
pub struct VaultInitializedEvent {
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TokensLockedEvent {
    pub user: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub target_chain: String,
    pub recipient: Pubkey,
    pub bridge_id: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensReleasedEvent {
    pub recipient: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub bridge_id: u64,
    pub timestamp: i64,
}

#[event]
pub struct FeeUpdatedEvent {
    pub new_fee_bps: u16,
    pub timestamp: i64,
}

#[event]
pub struct EmergencyPauseEvent {
    pub paused: bool,
    pub timestamp: i64,
}

#[event]
pub struct FeesWithdrawnEvent {
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}