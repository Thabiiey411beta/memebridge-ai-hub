use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("AX1oMEscrowXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod axiom_bridge_escrow {
    use super::*;

    // Initialize escrow for a cross-chain transfer
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        amount: u64,
        source_chain: String,
        target_chain: String,
        recipient: Pubkey,
        deadline: i64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        escrow.maker = ctx.accounts.maker.key();
        escrow.amount = amount;
        escrow.source_chain = source_chain.clone();
        escrow.target_chain = target_chain.clone();
        escrow.recipient = recipient;
        escrow.deadline = deadline;
        escrow.status = EscrowStatus::Pending;
        escrow.created_at = clock.unix_timestamp;
        escrow.bump = ctx.bumps.escrow;

        // Transfer tokens to escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.maker_token_account.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.maker.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(EscrowCreatedEvent {
            escrow_id: escrow.key(),
            maker: escrow.maker,
            amount,
            source_chain,
            target_chain,
            recipient,
            deadline,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Execute escrow after cross-chain confirmation
    pub fn execute_escrow(ctx: Context<ExecuteEscrow>, proof_data: Vec<u8>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        // Check escrow status
        require!(escrow.status == EscrowStatus::Pending, EscrowError::InvalidStatus);

        // Check deadline
        require!(clock.unix_timestamp <= escrow.deadline, EscrowError::DeadlineExpired);

        // Verify proof data (simplified - in production, use proper VAA verification)
        require!(!proof_data.is_empty(), EscrowError::InvalidProof);

        // Update status
        escrow.status = EscrowStatus::Executed;
        escrow.executed_at = Some(clock.unix_timestamp);

        // Transfer tokens to recipient
        let escrow_bump = escrow.bump;
        let escrow_seeds = &[
            b"escrow",
            escrow.maker.as_ref(),
            &[escrow_bump],
        ];
        let escrow_signer = &[&escrow_seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.recipient_token_account.to_account_info(),
                    authority: escrow.to_account_info(),
                },
                escrow_signer,
            ),
            escrow.amount,
        )?;

        emit!(EscrowExecutedEvent {
            escrow_id: escrow.key(),
            executor: ctx.accounts.executor.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Cancel escrow if deadline passed or conditions not met
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        // Check escrow status
        require!(escrow.status == EscrowStatus::Pending, EscrowError::InvalidStatus);

        // Check if deadline passed or maker is canceling
        let can_cancel = clock.unix_timestamp > escrow.deadline ||
                        ctx.accounts.canceler.key() == escrow.maker;

        require!(can_cancel, EscrowError::CannotCancel);

        // Update status
        escrow.status = EscrowStatus::Cancelled;
        escrow.cancelled_at = Some(clock.unix_timestamp);

        // Return tokens to maker
        let escrow_bump = escrow.bump;
        let escrow_seeds = &[
            b"escrow",
            escrow.maker.as_ref(),
            &[escrow_bump],
        ];
        let escrow_signer = &[&escrow_seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.maker_token_account.to_account_info(),
                    authority: escrow.to_account_info(),
                },
                escrow_signer,
            ),
            escrow.amount,
        )?;

        emit!(EscrowCancelledEvent {
            escrow_id: escrow.key(),
            canceler: ctx.accounts.canceler.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Dispute escrow (for arbitration)
    pub fn dispute_escrow(ctx: Context<DisputeEscrow>, reason: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        // Check escrow status
        require!(escrow.status == EscrowStatus::Pending, EscrowError::InvalidStatus);

        // Update status
        escrow.status = EscrowStatus::Disputed;
        escrow.disputed_at = Some(clock.unix_timestamp);

        emit!(EscrowDisputedEvent {
            escrow_id: escrow.key(),
            disputer: ctx.accounts.disputer.key(),
            reason,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Resolve dispute through governance
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        winner: DisputeWinner,
        refund_amount: Option<u64>
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        // Check escrow status
        require!(escrow.status == EscrowStatus::Disputed, EscrowError::InvalidStatus);

        // Only governance can resolve disputes
        require!(ctx.accounts.governance.key() == escrow.governance, EscrowError::Unauthorized);

        // Update status
        escrow.status = EscrowStatus::Resolved;
        escrow.resolved_at = Some(clock.unix_timestamp);

        // Handle resolution based on winner
        let refund_amount = refund_amount.unwrap_or(escrow.amount);

        match winner {
            DisputeWinner::Maker => {
                // Return tokens to maker
                let escrow_bump = escrow.bump;
                let escrow_seeds = &[
                    b"escrow",
                    escrow.maker.as_ref(),
                    &[escrow_bump],
                ];
                let escrow_signer = &[&escrow_seeds[..]];

                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.escrow_token_account.to_account_info(),
                            to: ctx.accounts.maker_token_account.to_account_info(),
                            authority: escrow.to_account_info(),
                        },
                        escrow_signer,
                    ),
                    refund_amount,
                )?;
            },
            DisputeWinner::Recipient => {
                // Send tokens to recipient
                let escrow_bump = escrow.bump;
                let escrow_seeds = &[
                    b"escrow",
                    escrow.maker.as_ref(),
                    &[escrow_bump],
                ];
                let escrow_signer = &[&escrow_seeds[..]];

                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.escrow_token_account.to_account_info(),
                            to: ctx.accounts.recipient_token_account.to_account_info(),
                            authority: escrow.to_account_info(),
                        },
                        escrow_signer,
                    ),
                    escrow.amount,
                )?;
            }
        }

        emit!(DisputeResolvedEvent {
            escrow_id: escrow.key(),
            winner,
            refund_amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(
        init,
        payer = maker,
        space = 8 + Escrow::LEN,
        seeds = [b"escrow", maker.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub maker: Signer<'info>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = maker
    )]
    pub maker_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = maker,
        associated_token::mint = token_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.maker.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub executor: Signer<'info>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = executor,
        associated_token::mint = token_mint,
        associated_token::authority = escrow.recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.maker.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub canceler: Signer<'info>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow.maker
    )]
    pub maker_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DisputeEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.maker.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub disputer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.maker.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub governance: Signer<'info>,

    pub token_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow.maker
    )]
    pub maker_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow.recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Escrow {
    pub maker: Pubkey,
    pub amount: u64,
    pub source_chain: String,
    pub target_chain: String,
    pub recipient: Pubkey,
    pub deadline: i64,
    pub status: EscrowStatus,
    pub governance: Pubkey, // Governance contract address
    pub created_at: i64,
    pub executed_at: Option<i64>,
    pub cancelled_at: Option<i64>,
    pub disputed_at: Option<i64>,
    pub resolved_at: Option<i64>,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 32 + 8 + (4 + 32) + (4 + 32) + 32 + 8 + 1 + 32 + 8 + (1 + 8) + (1 + 8) + (1 + 8) + (1 + 8) + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Pending,
    Executed,
    Cancelled,
    Disputed,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum DisputeWinner {
    Maker,
    Recipient,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid escrow status for this operation")]
    InvalidStatus,
    #[msg("Escrow deadline has expired")]
    DeadlineExpired,
    #[msg("Cannot cancel escrow at this time")]
    CannotCancel,
    #[msg("Invalid proof data")]
    InvalidProof,
    #[msg("Unauthorized operation")]
    Unauthorized,
}

#[event]
pub struct EscrowCreatedEvent {
    pub escrow_id: Pubkey,
    pub maker: Pubkey,
    pub amount: u64,
    pub source_chain: String,
    pub target_chain: String,
    pub recipient: Pubkey,
    pub deadline: i64,
    pub timestamp: i64,
}

#[event]
pub struct EscrowExecutedEvent {
    pub escrow_id: Pubkey,
    pub executor: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct EscrowCancelledEvent {
    pub escrow_id: Pubkey,
    pub canceler: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct EscrowDisputedEvent {
    pub escrow_id: Pubkey,
    pub disputer: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

#[event]
pub struct DisputeResolvedEvent {
    pub escrow_id: Pubkey,
    pub winner: DisputeWinner,
    pub refund_amount: u64,
    pub timestamp: i64,
}