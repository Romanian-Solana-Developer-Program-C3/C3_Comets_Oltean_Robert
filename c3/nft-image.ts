import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl } from "@solana/web3.js";
import "dotenv/config";
import { readFile } from "fs/promises";

const keypair = getKeypairFromEnvironment("SECRET_KEY");
const umi = createUmi(clusterApiUrl("devnet"), "confirmed");

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
const signer = createSignerFromKeypair(umi, umiKeypair);

const IMAGE_PATH = "./dragon.png";

umi.use(irysUploader());
umi.use(signerIdentity(signer));

export async function uploadImage() {
  try {
    console.log("Uploading image...");
    const img = await readFile(IMAGE_PATH);
    const imgConverted = createGenericFile(new Uint8Array(img), "image/png");

    const [uri] = await umi.uploader.upload([imgConverted]);
    console.log(`Image uploaded to ${uri}`);
  } catch (error) {
    console.error(error);
  }
}

uploadImage();
