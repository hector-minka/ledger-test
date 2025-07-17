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
const LEDGER = "hector-ledger-test";
const SERVER = "https://ldg-stg.one/api/v2";
// // const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA=";
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";

const getOwnerAccessRules = (publicKey: string) => {
  return [
    {
      action: "any",
      signer: {
        public: publicKey,
      },
    },
    {
      action: "read",
      bearer: {
        $signer: {
          public: publicKey,
        },
      },
    },
  ] as any;
};

const claim = {
  action: "transfer",
  source: {
    handle: "svgs:1234567@bac.com.hn",
    custom: {
      entityType: "individual",
      idNumber: "1234567",
      idType: "txid",
      name: "Hector Toro",
      phoneNumber: "98761065",
    },
  },
  target: {
    handle: "svgs:1234567@ficohsa.com.hn",
    custom: {
      entityType: "individual",
      idNumber: "7654321",
      idType: "txid",
      name: "Alfredo del Cid",
    },
  },

  symbol: { handle: "cop" },
  amount: 400,
} as any;

const data = {
  handle: "202507070140012ALI52874596521589",
  claims: [claim],
  schema: "transfer", // Changed from "b2p-send" to "transfer" to match SDK
  access: getOwnerAccessRules(PUBLIC_KEY),
  config: {
    commit: "auto",
  },
};

const signatureCustom = {
  moment: dayjs().toISOString(),
  status: "created",
  consented: dayjs().toISOString(),
  received: dayjs().toISOString(),
  dispatched: dayjs().toISOString(),
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

export const createIntentWithApi = async () => {
  try {
    const serializedData = serializeData(data);
    console.log("SERIALIZED DATA:", serializedData);
    const hash = createHash(data);
    console.log("HASH:", hash);
    // Get just the actual intent data
    //   const intentData = (response as any).data?.data || (response as any).intent;
    //   console.info(
    //     "INTENT DATA:",
    //     util.inspect(intentData, { depth: null, colors: true })
    //   );
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
      data,
      hash,
      meta: {
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
      "REAUEST:",
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
    // Add the required headers without JWT authentication for now
    const response = await axios.post(`${SERVER}/intents`, request, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`, // Temporarily removed
      },
    });

    console.info("RESPONSE:", response.data);
    console.info(
      "RESPONSE:",
      util.inspect(response.data, { depth: null, colors: true })
    );
  } catch (error: any) {
    console.info(
      "RESPONSE ERROR:",
      util.inspect(error.response.data, { depth: null, colors: true })
    );
  }
};

export const prepareDebitWithSdk = async () => {};

createIntentWithApi();
// prepareDebitWithSdk();

// const getJWT = async () => {
//   const privateKey = getPrivateKey();
//   console.log("PRIVATE KEY:", privateKey);
//   const jwt = await signJWT(
//     {
//       iss: SIGNER,
//       sub: `signer:${SIGNER}`,
//       aud: LEDGER,
//       iat: Math.floor(Date.now() / 1000),
//       exp: Math.floor(Date.now() / 1000) + 60,
//     },
//     SECRET_KEY,
//     PUBLIC_KEY
//   );
//   console.log("JWT:", jwt);
// };

// getJWT();
