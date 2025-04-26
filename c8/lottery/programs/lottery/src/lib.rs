use anchor_lang::prelude::*;

declare_id!("C1ccPGKw6tqcWMPq6FUqkEzP4HYbQksjLqvaVgwcZjCD");

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
