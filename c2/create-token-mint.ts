import "dotenv/config"
import { createMint } from "@solana/spl-token"
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers"

// Constants for token creation
const TOKEN_DECIMALS = 6; 

async function createTokenMint() {
    try {
        console.log("Preparing to create a new token mint...");

        const connection = new Connection(clusterApiUrl('devnet'));
        
        const keypair = getKeypairFromEnvironment("SECRET_KEY");
        console.log(`Using keypair with public key: ${keypair.publicKey.toString().slice(0, 8)}...`);
        
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`Current wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
        
        if (balance < 0.05 * LAMPORTS_PER_SOL) {
            console.warn("Warning: Your wallet balance is low. Creating a mint requires SOL for rent exemption.");
            console.warn("Consider requesting an airdrop if the transaction fails.");
        }
        
        console.log("Creating mint account on the Solana blockchain...");
        console.log(`Token will have ${TOKEN_DECIMALS} decimal places`);
        
        const mint = await createMint(
            connection, 
            keypair, 
            keypair.publicKey, 
            null,              // No freeze authority
            TOKEN_DECIMALS
        );
        
        const link = getExplorerLink("address", mint.toBase58(), "devnet");
        
        console.log("\n✅ Token mint created successfully!");
        console.log(`\nToken Mint Address: ${mint.toBase58()}`);
        console.log(`View on Solana Explorer: ${link}`);
        
        console.log("\n----- NEXT STEPS -----");
        console.log("1. Add this token address to your .env file:");
        console.log(`TOKEN_MINT=${mint.toBase58()}`);
        console.log("2. Run the mint-token.ts script to create tokens with this mint");
        console.log("3. Then you can transfer tokens using transfer-tokens.ts");
        
        return mint;
    } catch (error) {
        console.error("❌ Failed to create token mint:");
        
        if (error.message.includes("insufficient funds")) {
            console.error("You don't have enough SOL to pay for this transaction.");
            console.error("Try running an airdrop script to get more devnet SOL.");
        } else if (error.message.includes("failed to send transaction")) {
            console.error("Network error: Failed to send the transaction to the Solana network.");
            console.error("This could be due to network congestion or devnet being down.");
        } else {
            console.error(error);
        }
        throw error;
    }
}

createTokenMint();
