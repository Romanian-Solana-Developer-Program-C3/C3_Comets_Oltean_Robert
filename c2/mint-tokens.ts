import "dotenv/config"
import { getOrCreateAssociatedTokenAccount, mintTo, getAccount } from "@solana/spl-token"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers"

function validateAddress(name: string, value: string | undefined): PublicKey {
  if (!value) {
    throw new Error(`${name} environment variable is not set in .env file`);
  }
  
  try {
    return new PublicKey(value);
  } catch (error) {
    throw new Error(`Invalid ${name} address: "${value}". Make sure it's a valid Solana address.`);
  }
}

// Constants
const TOKEN_DECIMALS = 6; 
const MINT = validateAddress("TOKEN_MINT", process.env.TOKEN_MINT);
const AMOUNT_TO_MINT = 10 * 10**TOKEN_DECIMALS;

async function mintToken(amount: number, mint: PublicKey) {
    try {
        console.log(`Preparing to mint ${amount / 10**TOKEN_DECIMALS} tokens of mint ${mint.toString().slice(0, 8)}...`);

        const connection = new Connection(clusterApiUrl('devnet'));
        
        const keypair = getKeypairFromEnvironment("SECRET_KEY");
        console.log(`Using keypair with public key: ${keypair.publicKey.toString().slice(0, 8)}...`);
        
        if (amount <= 0) {
            throw new Error("Amount must be positive");
        }
        
        console.log("Setting up associated token account...");
        const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection, 
            keypair, 
            mint, 
            keypair.publicKey
        );
        console.log(`Token account: ${associatedTokenAccount.address.toString().slice(0, 8)}...`);
        
        try {
            const tokenAccount = await getAccount(connection, associatedTokenAccount.address);
            const currentBalance = parseInt(tokenAccount.amount.toString());
            console.log(`Current token balance: ${currentBalance / 10**TOKEN_DECIMALS} tokens`);
        } catch (error) {
            if (error.name === "TokenAccountNotFoundError") {
                console.log("This will be the first tokens in this account.");
            } else {
                console.warn("Could not check current token balance:", error.message);
            }
        }
        
        console.log(`Minting ${amount / 10**TOKEN_DECIMALS} tokens...`);
        const signature = await mintTo(
            connection, 
            keypair,           // Payer of the transaction fee
            mint,              // Mint address
            associatedTokenAccount.address, // Destination token account
            keypair,           // Mint authority
            amount             // Amount to mint
        );
        
        const link = getExplorerLink("transaction", signature, "devnet");
        
        console.log("\n✅ Tokens minted successfully!");
        console.log(`View transaction: ${link}`);
        
        try {
            const tokenAccount = await getAccount(connection, associatedTokenAccount.address);
            const newBalance = parseInt(tokenAccount.amount.toString());
            console.log(`New token balance: ${newBalance / 10**TOKEN_DECIMALS} tokens`);
        } catch (error) {
            console.warn("Could not fetch updated balance");
        }

        console.log("\n----- NEXT STEPS -----");
        console.log("You can now transfer tokens using transfer-tokens.ts");
        
        return signature;
    } catch (error) {
        console.error("❌ Failed to mint tokens:");
        
        if (error.message.includes("insufficient funds")) {
            console.error("You don't have enough SOL to pay for this transaction.");
            console.error("Try running an airdrop script to get more devnet SOL.");
        } else if (error.message.includes("invalid mint authority")) {
            console.error("Your key is not the mint authority for this token.");
            console.error("Make sure you're using the same keypair that created the token mint.");
        } else if (error.message.includes("failed to send transaction")) {
            console.error("Network error: Failed to send the transaction to the Solana network.");
            console.error("This could be due to network congestion or devnet being down.");
        } else {
            console.error(error);
        }
        throw error;
    }
}

mintToken(AMOUNT_TO_MINT, MINT)