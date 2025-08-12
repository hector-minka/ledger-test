import axios from "axios";
import crypto from "crypto";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import util from "util";
import { createHash, createSignatureDigest, serializeData } from "./hash";
import { signJWT } from "./jwt-auth";

// Informacion para firmar los proof

// htorohn
const SIGNER = "htorohn";
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// hector-bac
// const PUBLIC_KEY = "mZgQf7MvGjSHgevAF0ZhVfXGjX5Jyd8bHMdZJ0msEcE=";
// const SECRET_KEY = "ocOakPT0WW/vG7TZTHeg0nf4CJ2mfv/WrivaDQzo0j4=";

// htorohn-bac
// const SIGNER = "htorohn-bac";
// const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
// const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// const LEDGER = "toro-ledger";
const LEDGER = "payments-hub-hector-test";
const SERVER = "https://ldg-dev.one/api/v2";
// const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA=";
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";
// const PUBLIC_SERVER_KEY = "sWf+wVQmbs+1lrjOpfwetHHMchQxDdEHVoCl6+1v1CI="; // htorohn lpayments-hub-hector-test dev server

// const getOwnerAccessRules = (publicKey: string) => {
//   return [
//     {
//       action: "any",
//       signer: {
//         public: publicKey,
//       },
//     },
//     {
//       action: "read",
//       bearer: {
//         $signer: {
//           public: publicKey,
//         },
//       },
//     },
//   ] as any;
// };

// Anchor data structure based on test-anchors.ts
const anchorData = {
  handle: "3123454335",
  target: "svgs:20359303@bancorojo.co",
  // wallet: "svgs:20359303@bancorojo.co",
  symbol: "cop",
  schema: "individual",
  custom: {
    lastName: "Carrasquillo",
    aliasType: "tel",
    firstName: "Alejandra",
    secondName: "Lourdes",
    routingCode: "TFY",
    documentType: "cc",
    documentNumber: "1239374708",
    secondLastName: "Palomo",
    participantCode: "8224",
  },
  //   access: getOwnerAccessRules(PUBLIC_KEY),
  //   config: {
  //     commit: "auto",
  //   },
};

const signatureCustom = {
  moment: dayjs().toISOString(),
  status: "active",
  consented: dayjs().toISOString(),
  received: dayjs().toISOString(),
  dispatched: dayjs().toISOString(),
  domain: null,
};

const keyPair = {
  // Public-secret key pair used to sign tokens
  format: "ed25519-raw" as const,
  public: PUBLIC_KEY,
  secret: SECRET_KEY,
};

const getPrivateKey = () => {
  const keyDer = fs.readFileSync(path.resolve(__dirname, "../htorohn-key.der"));
  return crypto.createPrivateKey({
    key: keyDer,
    format: "der",
    type: "pkcs8",
  });
};

export const createAnchorWithApi = async () => {
  try {
    const serializedData = serializeData(anchorData);
    console.log("SERIALIZED ANCHOR DATA:", serializedData);

    const hash = createHash(anchorData);
    console.log("ANCHOR HASH:", hash);

    const signatureDigest = createSignatureDigest(hash, signatureCustom);
    console.log("SIGNATURE DIGEST:", signatureDigest);

    const digestBuffer = Buffer.from(signatureDigest, "hex");
    const privateKey = getPrivateKey();
    console.info(
      "PRIVATE KEY:",
      util.inspect(privateKey, { depth: null, colors: true })
    );

    const signatureBase64 = crypto
      .sign(undefined, digestBuffer, privateKey)
      .toString("base64");

    console.log("SIGNATURE BASE64:", signatureBase64);

    const request = {
      data: anchorData,
      hash,
      meta: {
        labels: ["ndin:0801198607268"],
        proofs: [
          {
            method: "ed25519-v2",
            custom: signatureCustom,
            digest: signatureDigest,
            public: keyPair.public,
            result: signatureBase64,
          },
        ],
      },
    };

    console.info(
      "ANCHOR REQUEST:",
      util.inspect(request, { depth: null, colors: true })
    );

    const jwt = await signJWT(
      {
        iss: SIGNER,
        sub: `signer:${SIGNER}`,
        aud: LEDGER,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      SECRET_KEY,
      PUBLIC_KEY
    );
    console.log("JWT:", jwt);

    // Create anchor using the same API logic but with /anchors endpoint
    const response = await axios.post(`${SERVER}/anchors`, request, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.info("ANCHOR RESPONSE:", response.data);
    console.info(
      "ANCHOR RESPONSE DETAILS:",
      util.inspect(response.data, { depth: null, colors: true })
    );

    return response.data;
  } catch (error: any) {
    console.error("ANCHOR CREATION ERROR:", error.message);
    if (error.response) {
      console.info(
        "ANCHOR ERROR RESPONSE:",
        util.inspect(error.response.data, { depth: null, colors: true })
      );
    }
    throw error;
  }
};

export const getAnchorWithApi = async (anchorHandle: string) => {
  try {
    const jwt = await signJWT(
      {
        iss: SIGNER,
        sub: `signer:${SIGNER}`,
        aud: LEDGER,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      SECRET_KEY,
      PUBLIC_KEY
    );

    const response = await axios.get(`${SERVER}/anchors/${anchorHandle}`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
        "x-received": dayjs().toISOString(),
        "x-dispatched": dayjs().toISOString(),
      },
    });

    console.info("ANCHOR GET RESPONSE:", response.data);
    console.info(
      "ANCHOR GET RESPONSE DETAILS:",
      util.inspect(response.data, { depth: null, colors: true })
    );

    return response.data;
  } catch (error: any) {
    console.error("ANCHOR GET ERROR:", error.message);
    if (error.response) {
      console.info(
        "ANCHOR GET ERROR RESPONSE:",
        util.inspect(error.response.data, { depth: null, colors: true })
      );
    }
    throw error;
  }
};

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log("Usage: npm run ts-node src/test-anchors-api.ts <command>");
    console.log("Available commands:");
    console.log("  createAnchor - Create a new anchor using API");
    console.log("  getAnchor    - Get an existing anchor using API");
    return;
  }

  try {
    switch (command) {
      case "createAnchor":
        console.log("🔄 Creating anchor using API...");
        await createAnchorWithApi();
        break;
      case "getAnchor":
        console.log("🔍 Getting anchor using API...");
        const anchorHandle = args[1] || "3123454332"; // Default anchor handle
        await getAnchorWithApi(anchorHandle);
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log("Available commands: createAnchor, getAnchor");
    }
  } catch (error) {
    console.error(
      "❌ Error executing command:",
      util.inspect(error, { depth: null, colors: true })
    );
  }
}

// Run main function if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
