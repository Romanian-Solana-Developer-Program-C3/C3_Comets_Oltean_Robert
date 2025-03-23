import "dotenv/config"
import { getKeypairFromEnvironment, airdropIfRequired } from "@solana-developers/helpers"
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl, PublicKey, Keypair } from "@solana/web3.js"

async function requestAirdropIfNeeded(
    connection: Connection, 
    publicKey: PublicKey, 
    minBalance = LAMPORTS_PER_SOL, 
    airdropAmount = LAMPORTS_PER_SOL): Promise<boolean> {
        try {
            const currentBalance = await connection.getBalance(publicKey);

            if (currentBalance < minBalance) {
                console.log(`Balance is less than ${minBalance/LAMPORTS_PER_SOL} SOL, requesting Airdrop...`);

                await airdropIfRequired(connection, publicKey, minBalance, airdropAmount);
                console.log("Airdrop successful!");
                return true;
            } else {
                console.log("Balance is sufficient, no airdrop needed.");
                return false; 
            }
        } catch (error) {
            console.error("Airdrop operation failed:", error);
            return false;
        }
    }

async function checkBalanceAndAirdrop() {
    try {
        const connection = new Connection(clusterApiUrl("devnet"));
        const keypair = getKeypairFromEnvironment("SECRET_KEY");
        const publicKey = keypair.publicKey;
    
        console.log(`The public key is: ${publicKey.toBase58()}`);
    
        const initialBalance = await connection.getBalance(publicKey);
        console.log(`The user ${publicKey.toString()} has a balance of ${initialBalance / LAMPORTS_PER_SOL} SOL`);
    
        await requestAirdropIfNeeded(connection, publicKey);
    
        const updatedBalance = await connection.getBalance(publicKey);
        console.log(`The balance of the user ${publicKey.toString()} has been updated. They now has a balance of ${updatedBalance / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
        console.log(error);   
    }
}

checkBalanceAndAirdrop()