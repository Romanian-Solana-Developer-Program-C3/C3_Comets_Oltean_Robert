import { Keypair } from "@solana/web3.js"

const keypair = Keypair.generate();

console.log(`✅ Keypair generated!`)
console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);