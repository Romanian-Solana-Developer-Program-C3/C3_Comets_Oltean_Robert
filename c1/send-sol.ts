import "dotenv/config"
import { 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  Connection, 
  clusterApiUrl,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

async function sendSOL() {
    try {
        const addressReceiver = new PublicKey("5PgdW9fhhXuGR8aG5JgzMDksCPddrHojQaybiUCgNg4N");
        console.log(`Sending SOL to ${addressReceiver.toString()}`);

        const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
        console.log(`Sending from ${senderKeypair.publicKey.toString()}`);

        const connection = new Connection(clusterApiUrl("devnet"));

        const amountInLamports = 0.1 * LAMPORTS_PER_SOL;

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: addressReceiver,
            lamports: amountInLamports,
        });

        const messageV0 = new TransactionMessage({
            payerKey: senderKeypair.publicKey,
            recentBlockhash: blockhash,
            instructions: [transferInstruction]
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        transaction.sign([senderKeypair]);

        const signature = await connection.sendTransaction(transaction);
        console.log(`Transaction sent with signature: ${signature}`);

        console.log('Waiting for transaction confirmation...');
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        });

        if (confirmation.value.err) {
            console.error('Transaction failed:', confirmation.value.err);
          } else {
            console.log('Transaction confirmed successfully!');
        }

        const receiverBalance = await connection.getBalance(addressReceiver);
        console.log(`Receiver balance: ${receiverBalance / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
        console.log(error)
    }
}

sendSOL();