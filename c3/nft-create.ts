import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  base58,
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl } from "@solana/web3.js";
import "dotenv/config";

const keypair = getKeypairFromEnvironment("SECRET_KEY");
const umi = createUmi(clusterApiUrl("devnet"), "confirmed");

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
const signer = createSignerFromKeypair(umi, umiKeypair);

const METADATA_URI =
  "https://gateway.irys.xyz/8XTEHDgvAC4M9dEzh6EhjUiiPqMnBj69TCLRromscoTf";

umi.use(mplTokenMetadata());
umi.use(signerIdentity(signer));

export async function createAndMintNft() {
  try {
    console.log("Creating NFT...");
    const mint = generateSigner(umi);
    let tx = createNft(umi, {
      name: "Cute Dragon",
      mint,
      authority: signer,
      sellerFeeBasisPoints: percentAmount(100),
      isCollection: false,
      uri: METADATA_URI,
    });

    console.log("Minting NFT...");
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.deserialize(result.signature);
    console.log(
      `NFT created and minted: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    console.error(error);
  }
}

createAndMintNft();
