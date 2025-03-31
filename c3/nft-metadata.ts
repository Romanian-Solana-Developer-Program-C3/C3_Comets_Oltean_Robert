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

const keypair = getKeypairFromEnvironment("SECRET_KEY");
const umi = createUmi(clusterApiUrl("devnet"), "confirmed");

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
const signer = createSignerFromKeypair(umi, umiKeypair);

const IMAGE_URI =
  "https://gateway.irys.xyz/BA7k9ChNFjyQfyouAQYEBnmZtFpCs3A3F5SyPk3zebNm";

umi.use(irysUploader());
umi.use(signerIdentity(signer));

export async function uploadMetadata() {
  try {
    console.log("Uploading metadata...");
    const metadata = {
      name: "Cute Dragon",
      symbol: "DRG",
      description: "A cute purple dragon",
      image: IMAGE_URI,
      attributes: [
        {
          trait_type: "Color",
          value: "Purple",
        },
        {
          trait_type: "Race",
          value: "Dragon",
        },
        {
          trait_type: "Size",
          value: "Smol",
        },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: IMAGE_URI,
          },
        ],
      },
    };

    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log(`Metadata uploaded to ${metadataUri}`);
  } catch (error) {
    console.log(error);
  }
}

uploadMetadata();
