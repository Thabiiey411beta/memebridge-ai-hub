use anchor_lang::prelude::*;

declare_id!("AX1oMGovernanceXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod axiom_governance {
    use super::*;

    // Initialize governance with signers
    pub fn initialize_governance(
        ctx: Context<InitializeGovernance>,
        signers: Vec<Pubkey>,
        threshold: u8,
    ) -> Result<()> {
        let governance = &mut ctx.accounts.governance;

        require!(signers.len() >= 1, GovernanceError::InvalidSignerCount);
        require!(threshold > 0 && threshold <= signers.len() as u8, GovernanceError::InvalidThreshold);
        require!(signers.contains(&ctx.accounts.creator.key()), GovernanceError::CreatorNotSigner);

        governance.signers = signers;
        governance.threshold = threshold;
        governance.proposal_count = 0;
        governance.bump = ctx.bumps.governance;

        emit!(GovernanceInitializedEvent {
            signers: governance.signers.clone(),
            threshold,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Create a proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        actions: Vec<ProposalAction>,
        execution_delay: i64,
    ) -> Result<()> {
        let governance = &mut ctx.accounts.governance;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        // Validate proposal
        require!(!title.is_empty(), GovernanceError::EmptyTitle);
        require!(!description.is_empty(), GovernanceError::EmptyDescription);
        require!(!actions.is_empty(), GovernanceError::NoActions);

        // Only signers can create proposals
        require!(governance.signers.contains(&ctx.accounts.proposer.key()), GovernanceError::Unauthorized);

        let proposal_id = governance.proposal_count;
        governance.proposal_count = governance.proposal_count.checked_add(1).unwrap();

        proposal.id = proposal_id;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.actions = actions;
        proposal.status = ProposalStatus::Active;
        proposal.created_at = clock.unix_timestamp;
        proposal.voting_ends_at = clock.unix_timestamp + (7 * 24 * 60 * 60); // 7 days
        proposal.execution_delay = execution_delay;
        proposal.execution_eta = None;
        proposal.approvals = vec![ctx.accounts.proposer.key()];
        proposal.rejections = vec![];
        proposal.queued_at = None;
        proposal.executed_at = None;
        proposal.cancelled_at = None;
        proposal.bump = ctx.bumps.proposal;

        emit!(ProposalCreatedEvent {
            proposal_id,
            proposer: ctx.accounts.proposer.key(),
            title: proposal.title.clone(),
            actions_count: actions.len() as u8,
            voting_ends_at: proposal.voting_ends_at,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Vote on a proposal
    pub fn vote_proposal(
        ctx: Context<VoteProposal>,
        approve: bool,
    ) -> Result<()> {
        let governance = &ctx.accounts.governance;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        // Check if proposal is active
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);

        // Check if voting period is still open
        require!(clock.unix_timestamp <= proposal.voting_ends_at, GovernanceError::VotingEnded);

        // Check if voter is a signer
        require!(governance.signers.contains(&ctx.accounts.voter.key()), GovernanceError::NotASigner);

        // Check if voter hasn't already voted
        require!(!proposal.approvals.contains(&ctx.accounts.voter.key()), GovernanceError::AlreadyVoted);
        require!(!proposal.rejections.contains(&ctx.accounts.voter.key()), GovernanceError::AlreadyVoted);

        // Record vote
        if approve {
            proposal.approvals.push(ctx.accounts.voter.key());
        } else {
            proposal.rejections.push(ctx.accounts.voter.key());
        }

        // Check if proposal can be queued
        let approval_count = proposal.approvals.len() as u8;
        if approval_count >= governance.threshold {
            proposal.status = ProposalStatus::Succeeded;
            proposal.queued_at = Some(clock.unix_timestamp);
            proposal.execution_eta = Some(clock.unix_timestamp + proposal.execution_delay);

            emit!(ProposalSucceededEvent {
                proposal_id: proposal.id,
                approval_count,
                execution_eta: proposal.execution_eta.unwrap(),
                timestamp: clock.unix_timestamp,
            });
        }

        emit!(VoteCastEvent {
            proposal_id: proposal.id,
            voter: ctx.accounts.voter.key(),
            approve,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Execute a successful proposal
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let governance = &ctx.accounts.governance;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        // Check if proposal is ready for execution
        require!(proposal.status == ProposalStatus::Succeeded, GovernanceError::ProposalNotSucceeded);

        // Check if execution delay has passed
        if let Some(execution_eta) = proposal.execution_eta {
            require!(clock.unix_timestamp >= execution_eta, GovernanceError::ExecutionDelayNotMet);
        }

        // Execute actions (simplified - in practice, would call external programs)
        for action in &proposal.actions {
            match action {
                ProposalAction::UpdateFee { new_fee_bps } => {
                    // Would call fee calculator program
                    msg!("Executing fee update to {} bps", new_fee_bps);
                },
                ProposalAction::UpdateSecurity { parameter, value } => {
                    // Would call security validator program
                    msg!("Executing security update: {} = {}", parameter, value);
                },
                ProposalAction::EmergencyPause { pause } => {
                    // Would call bridge vault program
                    msg!("Executing emergency {}", if *pause { "pause" } else { "unpause" });
                },
                ProposalAction::AddSigner { signer } => {
                    // Add new signer
                    if !governance.signers.contains(signer) {
                        // Note: In practice, would need to update governance account
                        msg!("Adding new signer: {}", signer);
                    }
                },
                ProposalAction::RemoveSigner { signer } => {
                    // Remove signer
                    msg!("Removing signer: {}", signer);
                },
            }
        }

        proposal.status = ProposalStatus::Executed;
        proposal.executed_at = Some(clock.unix_timestamp);

        emit!(ProposalExecutedEvent {
            proposal_id: proposal.id,
            executor: ctx.accounts.executor.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Cancel a proposal
    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        // Only proposer can cancel
        require!(ctx.accounts.canceler.key() == proposal.proposer, GovernanceError::Unauthorized);

        // Check if proposal is still active
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);

        proposal.status = ProposalStatus::Cancelled;
        proposal.cancelled_at = Some(clock.unix_timestamp);

        emit!(ProposalCancelledEvent {
            proposal_id: proposal.id,
            canceler: ctx.accounts.canceler.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Update governance signers and threshold
    pub fn update_governance(
        ctx: Context<UpdateGovernance>,
        new_signers: Vec<Pubkey>,
        new_threshold: u8,
    ) -> Result<()> {
        let governance = &mut ctx.accounts.governance;

        // Only governance itself can update (through proposal execution)
        require!(ctx.accounts.updater.key() == governance.key(), GovernanceError::Unauthorized);

        require!(new_signers.len() >= 1, GovernanceError::InvalidSignerCount);
        require!(new_threshold > 0 && new_threshold <= new_signers.len() as u8, GovernanceError::InvalidThreshold);

        governance.signers = new_signers;
        governance.threshold = new_threshold;

        emit!(GovernanceUpdatedEvent {
            new_signers: governance.signers.clone(),
            new_threshold,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGovernance<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Governance::LEN,
        seeds = [b"governance"],
        bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        mut,
        seeds = [b"governance"],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::LEN,
        seeds = [b"proposal", governance.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteProposal<'info> {
    pub governance: Account<'info, Governance>,

    #[account(
        mut,
        seeds = [b"proposal", proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    pub governance: Account<'info, Governance>,

    #[account(
        mut,
        seeds = [b"proposal", proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub executor: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub canceler: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateGovernance<'info> {
    #[account(
        mut,
        seeds = [b"governance"],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    pub updater: Signer<'info>,
}

#[account]
pub struct Governance {
    pub signers: Vec<Pubkey>,
    pub threshold: u8,
    pub proposal_count: u32,
    pub bump: u8,
}

impl Governance {
    pub const LEN: usize = 4 + 32*10 + 1 + 4 + 1; // Max 10 signers
}

#[account]
pub struct Proposal {
    pub id: u32,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub actions: Vec<ProposalAction>,
    pub status: ProposalStatus,
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub execution_delay: i64,
    pub execution_eta: Option<i64>,
    pub approvals: Vec<Pubkey>,
    pub rejections: Vec<Pubkey>,
    pub queued_at: Option<i64>,
    pub executed_at: Option<i64>,
    pub cancelled_at: Option<i64>,
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 4 + 32 + (4 + 100) + (4 + 500) + (4 + 10*ProposalAction::LEN) + 1 + 8 + 8 + 8 + (1 + 8) + (4 + 32*10) + (4 + 32*10) + (1 + 8) + (1 + 8) + (1 + 8) + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ProposalStatus {
    Active,
    Succeeded,
    Executed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ProposalAction {
    UpdateFee { new_fee_bps: u16 },
    UpdateSecurity { parameter: String, value: u64 },
    EmergencyPause { pause: bool },
    AddSigner { signer: Pubkey },
    RemoveSigner { signer: Pubkey },
}

impl ProposalAction {
    pub const LEN: usize = 1 + 2 + (4 + 32) + 8 + 1 + 32 + 32; // Max size
}

#[error_code]
pub enum GovernanceError {
    #[msg("Invalid number of signers")]
    InvalidSignerCount,
    #[msg("Invalid threshold")]
    InvalidThreshold,
    #[msg("Creator must be a signer")]
    CreatorNotSigner,
    #[msg("Empty proposal title")]
    EmptyTitle,
    #[msg("Empty proposal description")]
    EmptyDescription,
    #[msg("Proposal must have at least one action")]
    NoActions,
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Proposal is not active")]
    ProposalNotActive,
    #[msg("Voting period has ended")]
    VotingEnded,
    #[msg("Not a governance signer")]
    NotASigner,
    #[msg("Already voted on this proposal")]
    AlreadyVoted,
    #[msg("Proposal has not succeeded")]
    ProposalNotSucceeded,
    #[msg("Execution delay not yet met")]
    ExecutionDelayNotMet,
}

#[event]
pub struct GovernanceInitializedEvent {
    pub signers: Vec<Pubkey>,
    pub threshold: u8,
    pub timestamp: i64,
}

#[event]
pub struct ProposalCreatedEvent {
    pub proposal_id: u32,
    pub proposer: Pubkey,
    pub title: String,
    pub actions_count: u8,
    pub voting_ends_at: i64,
    pub timestamp: i64,
}

#[event]
pub struct VoteCastEvent {
    pub proposal_id: u32,
    pub voter: Pubkey,
    pub approve: bool,
    pub timestamp: i64,
}

#[event]
pub struct ProposalSucceededEvent {
    pub proposal_id: u32,
    pub approval_count: u8,
    pub execution_eta: i64,
    pub timestamp: i64,
}

#[event]
pub struct ProposalExecutedEvent {
    pub proposal_id: u32,
    pub executor: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProposalCancelledEvent {
    pub proposal_id: u32,
    pub canceler: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct GovernanceUpdatedEvent {
    pub new_signers: Vec<Pubkey>,
    pub new_threshold: u8,
    pub timestamp: i64,
}