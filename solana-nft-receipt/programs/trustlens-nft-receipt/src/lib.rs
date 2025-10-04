use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo, Transfer};
use mpl_token_metadata::{
    instructions::{CreateMetadataAccountV3, UpdateMetadataAccountV2},
    types::{DataV2, Creator, Collection},
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod trustlens_nft_receipt {
    use super::*;

    /// Initialize the NFT receipt program
    /// Creates the master PDA and sets up the oracle authority
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let master = &mut ctx.accounts.master;
        master.authority = ctx.accounts.authority.key();
        master.bump = ctx.bumps.master;
        master.total_minted = 0;
        
        msg!("TrustLens NFT Receipt Program initialized");
        msg!("Authority: {}", ctx.accounts.authority.key());
        
        Ok(())
    }

    /// Mint a new NFT receipt for an Aeternity escrow deal
    /// Only authorized oracle can call this function
    pub fn mint_escrow_nft(
        ctx: Context<MintEscrowNft>,
        escrow_id: String,
        client_wallet: Pubkey,
        freelancer_wallet: Pubkey,
        amount: u64,
        project_description: String,
    ) -> Result<()> {
        // Verify oracle authorization
        let master = &ctx.accounts.master;
        require!(
            ctx.accounts.oracle.key() == master.authority,
            ErrorCode::UnauthorizedOracle
        );

        // Create escrow NFT metadata
        let escrow_data = EscrowData {
            escrow_id: escrow_id.clone(),
            client_wallet,
            freelancer_wallet,
            amount,
            status: EscrowStatus::Active,
            completion_score: None,
            timestamp: Clock::get()?.unix_timestamp,
            project_description: project_description.clone(),
        };

        // Store escrow data in the NFT account
        let nft_account = &mut ctx.accounts.escrow_nft;
        nft_account.escrow_data = escrow_data;
        nft_account.is_soulbound = true; // Non-transferable until completion
        nft_account.bump = ctx.bumps.escrow_nft;

        // Update master counter
        let master = &mut ctx.accounts.master;
        master.total_minted += 1;

        // Create metadata for the NFT
        create_nft_metadata(
            &ctx,
            &escrow_id,
            &project_description,
            client_wallet,
            freelancer_wallet,
            amount,
        )?;

        msg!("Minted NFT for escrow: {}", escrow_id);
        msg!("Client: {}", client_wallet);
        msg!("Freelancer: {}", freelancer_wallet);
        msg!("Amount: {} lamports", amount);

        Ok(())
    }

    /// Update escrow status (only oracle can call)
    /// This is called when escrow status changes on Aeternity
    pub fn update_escrow_status(
        ctx: Context<UpdateEscrowStatus>,
        new_status: EscrowStatus,
        completion_score: Option<u8>,
    ) -> Result<()> {
        // Verify oracle authorization
        let master = &ctx.accounts.master;
        require!(
            ctx.accounts.oracle.key() == master.authority,
            ErrorCode::UnauthorizedOracle
        );

        let escrow_nft = &mut ctx.accounts.escrow_nft;
        
        // Update status and completion score
        escrow_nft.escrow_data.status = new_status;
        escrow_nft.escrow_data.completion_score = completion_score;

        // If escrow is completed (released or disputed), make NFT transferable
        if matches!(new_status, EscrowStatus::Released | EscrowStatus::Disputed) {
            escrow_nft.is_soulbound = false;
            msg!("Escrow completed - NFT is now transferable");
        }

        // Update metadata to reflect new status
        update_nft_metadata(&ctx, new_status, completion_score)?;

        msg!("Updated escrow status to: {:?}", new_status);
        if let Some(score) = completion_score {
            msg!("Completion score: {}", score);
        }

        Ok(())
    }

    /// Transfer NFT (only allowed after escrow completion)
    pub fn transfer_nft(ctx: Context<TransferNft>) -> Result<()> {
        let escrow_nft = &ctx.accounts.escrow_nft;
        
        // Check if NFT is still soulbound
        require!(
            !escrow_nft.is_soulbound,
            ErrorCode::NftStillSoulbound
        );

        // Check if escrow is completed
        require!(
            matches!(escrow_nft.escrow_data.status, EscrowStatus::Released | EscrowStatus::Disputed),
            ErrorCode::EscrowNotCompleted
        );

        // Perform the transfer
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, 1)?;

        msg!("NFT transferred successfully");
        Ok(())
    }

    /// Get escrow data from NFT
    pub fn get_escrow_data(ctx: Context<GetEscrowData>) -> Result<EscrowData> {
        let escrow_nft = &ctx.accounts.escrow_nft;
        Ok(escrow_nft.escrow_data.clone())
    }
}

// Helper function to create NFT metadata
fn create_nft_metadata(
    ctx: &Context<MintEscrowNft>,
    escrow_id: &str,
    project_description: &str,
    client_wallet: Pubkey,
    freelancer_wallet: Pubkey,
    amount: u64,
) -> Result<()> {
    let metadata_account = &ctx.accounts.metadata_account;
    let mint_account = &ctx.accounts.mint_account;
    let payer = &ctx.accounts.payer;
    let update_authority = &ctx.accounts.oracle;
    let token_metadata_program = &ctx.accounts.token_metadata_program;

    let name = format!("TrustLens Escrow #{}", escrow_id);
    let symbol = "TRUST";
    let uri = format!("https://trustlens.io/metadata/{}", escrow_id);

    let data_v2 = DataV2 {
        name: name.clone(),
        symbol: symbol.to_string(),
        uri: uri.clone(),
        seller_fee_basis_points: 0,
        creators: Some(vec![
            Creator {
                address: update_authority.key(),
                verified: true,
                share: 100,
            }
        ]),
        collection: None,
        uses: None,
    };

    let accounts = CreateMetadataAccountV3 {
        metadata: metadata_account.to_account_info(),
        mint: mint_account.to_account_info(),
        mint_authority: update_authority.to_account_info(),
        payer: payer.to_account_info(),
        update_authority: update_authority.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };

    let ix = CreateMetadataAccountV3 {
        metadata: metadata_account.key(),
        mint: mint_account.key(),
        mint_authority: update_authority.key(),
        payer: payer.key(),
        update_authority: update_authority.key(),
        system_program: ctx.accounts.system_program.key(),
        rent: ctx.accounts.rent.key(),
    };

    let ix = mpl_token_metadata::instruction::create_metadata_accounts_v3(
        *token_metadata_program.key,
        metadata_account.key(),
        mint_account.key(),
        update_authority.key(),
        payer.key(),
        update_authority.key(),
        name,
        symbol.to_string(),
        uri,
        Some(data_v2),
        true, // is_mutable
        true, // update_authority_is_signer
        None, // collection
        None, // uses
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            metadata_account.to_account_info(),
            mint_account.to_account_info(),
            update_authority.to_account_info(),
            payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
    )?;

    Ok(())
}

// Helper function to update NFT metadata
fn update_nft_metadata(
    ctx: &Context<UpdateEscrowStatus>,
    status: EscrowStatus,
    completion_score: Option<u8>,
) -> Result<()> {
    let metadata_account = &ctx.accounts.metadata_account;
    let update_authority = &ctx.accounts.oracle;
    let token_metadata_program = &ctx.accounts.token_metadata_program;

    let escrow_nft = &ctx.accounts.escrow_nft;
    let escrow_id = &escrow_nft.escrow_data.escrow_id;
    
    let status_text = match status {
        EscrowStatus::Active => "Active",
        EscrowStatus::Released => "Released",
        EscrowStatus::Disputed => "Disputed",
    };

    let score_text = if let Some(score) = completion_score {
        format!(" - Score: {}/100", score)
    } else {
        String::new()
    };

    let name = format!("TrustLens Escrow #{} - {}", escrow_id, status_text);
    let uri = format!("https://trustlens.io/metadata/{}/{}", escrow_id, status_text.to_lowercase());

    let data_v2 = DataV2 {
        name,
        symbol: "TRUST".to_string(),
        uri,
        seller_fee_basis_points: 0,
        creators: Some(vec![
            Creator {
                address: update_authority.key(),
                verified: true,
                share: 100,
            }
        ]),
        collection: None,
        uses: None,
    };

    let ix = UpdateMetadataAccountV2 {
        metadata: metadata_account.to_account_info(),
        update_authority: update_authority.to_account_info(),
    };

    let ix = mpl_token_metadata::instruction::update_metadata_accounts_v2(
        *token_metadata_program.key,
        metadata_account.key(),
        update_authority.key(),
        Some(data_v2),
        None, // new_update_authority
        None, // primary_sale_happened
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            metadata_account.to_account_info(),
            update_authority.to_account_info(),
        ],
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8,
        seeds = [b"master"],
        bump
    )]
    pub master: Account<'info, Master>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(escrow_id: String)]
pub struct MintEscrowNft<'info> {
    #[account(
        mut,
        seeds = [b"master"],
        bump = master.bump
    )]
    pub master: Account<'info, Master>,

    #[account(
        init,
        payer = payer,
        space = 8 + EscrowNft::SIZE,
        seeds = [b"escrow_nft", escrow_id.as_bytes()],
        bump
    )]
    pub escrow_nft: Account<'info, EscrowNft>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = oracle,
        seeds = [b"mint", escrow_id.as_bytes()],
        bump
    )]
    pub mint_account: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = oracle
    )]
    pub metadata_account: AccountInfo<'info>,

    #[account(mut)]
    pub oracle: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, mpl_token_metadata::program::TokenMetadata>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(escrow_id: String)]
pub struct UpdateEscrowStatus<'info> {
    #[account(
        seeds = [b"master"],
        bump = master.bump
    )]
    pub master: Account<'info, Master>,

    #[account(
        mut,
        seeds = [b"escrow_nft", escrow_id.as_bytes()],
        bump = escrow_nft.bump
    )]
    pub escrow_nft: Account<'info, EscrowNft>,

    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    #[account(mut)]
    pub oracle: Signer<'info>,

    pub token_metadata_program: Program<'info, mpl_token_metadata::program::TokenMetadata>,
}

#[derive(Accounts)]
pub struct TransferNft<'info> {
    #[account(
        mut,
        seeds = [b"escrow_nft", escrow_nft.escrow_data.escrow_id.as_bytes()],
        bump = escrow_nft.bump
    )]
    pub escrow_nft: Account<'info, EscrowNft>,

    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = owner
    )]
    pub from_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = to_authority
    )]
    pub to_token_account: Account<'info, TokenAccount>,

    pub mint_account: Account<'info, Mint>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is the recipient of the NFT
    pub to_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(escrow_id: String)]
pub struct GetEscrowData<'info> {
    #[account(
        seeds = [b"escrow_nft", escrow_id.as_bytes()],
        bump
    )]
    pub escrow_nft: Account<'info, EscrowNft>,
}

#[account]
pub struct Master {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_minted: u64,
}

#[account]
pub struct EscrowNft {
    pub escrow_data: EscrowData,
    pub is_soulbound: bool,
    pub bump: u8,
}

impl EscrowNft {
    pub const SIZE: usize = 8 + EscrowData::SIZE + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EscrowData {
    pub escrow_id: String,
    pub client_wallet: Pubkey,
    pub freelancer_wallet: Pubkey,
    pub amount: u64,
    pub status: EscrowStatus,
    pub completion_score: Option<u8>,
    pub timestamp: i64,
    pub project_description: String,
}

impl EscrowData {
    pub const SIZE: usize = 4 + 256 + 32 + 32 + 8 + 1 + 1 + 8 + 4 + 512;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum EscrowStatus {
    Active,
    Released,
    Disputed,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    #[msg("NFT is still soulbound and cannot be transferred")]
    NftStillSoulbound,
    #[msg("Escrow is not completed")]
    EscrowNotCompleted,
}
