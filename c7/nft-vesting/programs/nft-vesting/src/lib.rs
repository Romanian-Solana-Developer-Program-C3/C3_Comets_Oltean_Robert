use anchor_lang::prelude::*;

declare_id!("5bMovGwUc8t7p7rwRawWGoVxgmkSjpTHrjmZz2mfmu98");

#[program]
pub mod nft_vesting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
