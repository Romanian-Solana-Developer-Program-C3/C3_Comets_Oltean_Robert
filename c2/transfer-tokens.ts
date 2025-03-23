import "dotenv/config"
import { getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, transferChecked, getAccount } from "@solana/spl-token"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers"

// Check if required environment variables are set
if (!process.env.TOKEN_MINT) {
    throw new Error("TOKEN_MINT environment variable is not set in .env file");
}
if (!process.env.SOURCE_ACCOUNT) {
    throw new Error("SOURCE_ACCOUNT environment variable is not set in .env file");
}
if (!process.env.DESTINATION_ACCOUNT) {
    throw new Error("DESTINATION_ACCOUNT environment variable is not set in .env file");
}

// Constants
const TOKEN_DECIMALS = 6; // Number of decimal places for the token
const MINT = new PublicKey(process.env.TOKEN_MINT as string); // Token mint address from environment
const SRC = new PublicKey(process.env.SOURCE_ACCOUNT as string); // Source wallet address
const DEST = new PublicKey(process.env.DESTINATION_ACCOUNT as string); // Destination wallet address
const AMOUNT_TO_TRANSFER = 1 * 10**TOKEN_DECIMALS; // Amount to transfer (1 token with decimals)

async function transferTokens(mint: PublicKey, source: PublicKey, destination: PublicKey, amount: number) {
    try {
        console.log(`Preparing to transfer ${amount / 10**TOKEN_DECIMALS} tokens from ${source.toString().slice(0, 8)}... to ${destination.toString().slice(0, 8)}...`);

        const connection = new Connection(clusterApiUrl('devnet'));
        const keypair = getKeypairFromEnvironment("SECRET_KEY");

        if (amount <= 0) {
            throw new Error("Amount must be positive");
        }

        const sourceAta = getAssociatedTokenAddressSync(mint, source);
        
        try {
            const sourceAccount = await getAccount(connection, sourceAta);
            const currentBalance = parseInt(sourceAccount.amount.toString());
            console.log(`Current balance: ${currentBalance / 10**TOKEN_DECIMALS} tokens`);
            
            if (currentBalance < amount) {
                throw new Error(`Insufficient token balance. Have: ${currentBalance / 10**TOKEN_DECIMALS}, Need: ${amount / 10**TOKEN_DECIMALS}`);
            }
        } catch (error) {
            if (error.name === "TokenAccountNotFoundError") {
                throw new Error("Source token account doesn't exist. You need to mint tokens first.");
            }
            throw error;
        }

        console.log("Setting up recipient's token account...");
        const destinationAta = await getOrCreateAssociatedTokenAccount(
            connection, 
            keypair, 
            mint, 
            destination
        );

        console.log(`Sending ${amount / 10**TOKEN_DECIMALS} tokens to ${destination.toString().slice(0, 8)}...`);
        const signature = await transferChecked(
            connection, 
            keypair, 
            sourceAta, 
            mint, 
            destinationAta.address, 
            keypair, 
            amount, 
            TOKEN_DECIMALS
        );

        const link = getExplorerLink("transaction", signature, "devnet");
        console.log(`Transfer confirmed successfully! View transaction: ${link}`);
        
        try {
            const newSourceAccount = await getAccount(connection, sourceAta);
            const newBalance = parseInt(newSourceAccount.amount.toString());
            console.log(`New balance: ${newBalance / 10**TOKEN_DECIMALS} tokens`);
        } catch (error) {
            console.log("Could not fetch updated balance");
        }
        
        return signature;
    } catch (error) {
        console.error(`Transfer failed: ${error.message}`);
        
        if (error.message.includes("insufficient funds")) {
            console.error("Make sure you have enough SOL to pay for transaction fees.");
        } else if (error.message.includes("invalid account owner")) {
            console.error("There might be an issue with token account ownership.");
        }
        
        throw error;
    }
}

transferTokens(MINT, SRC, DEST, AMOUNT_TO_TRANSFER);