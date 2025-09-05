import axios from "axios";
import crypto from "crypto";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import util from "util";
import { createHash, createSignatureDigest } from "./hash";
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
// const LEDGER = "hector-ledger-test";
const SERVER = "https://ldg-stg.one/api/v2";
// // const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA=";
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";
console.log("SERVER:", SERVER);
const LEDGER = "payment-hub-staging";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";

const getOwnerAccessRules = (publicKey: string) => {
  return [
    {
      action: "any",
      signer: {
        public: publicKey,
      },
    },
  ] as any;
  //   [
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
};

// const claim = {
//   action: "transfer",
//   source: {
//     handle: "svgs:1234567@bac.com.hn",
//     custom: {
//       entityType: "individual",
//       idNumber: "1234567",
//       idType: "txid",
//       name: "Hector Toro",
//       phoneNumber: "98761065",
//     },
//   },
//   target: {
//     handle: "svgs:1234567@ficohsa.com.hn",
//     custom: {
//       entityType: "individual",
//       idNumber: "7654321",
//       idType: "txid",
//       name: "Alfredo del Cid",
//     },
//   },

//   symbol: { handle: "cop" },
//   amount: 400,
// } as any;

const claim = {
  action: "transfer",

  source: {
    handle: "svgs:234234234@alianza.com.co",
    custom: {
      documentNumber: "123456789",
      documentType: "txid",
      entityType: "business",
      name: "Mi Negocio",
    },
  },
  target: {
    handle: "svgs:1234567@bancorojo.co",
    custom: {
      accountRef: "3123454333",
      documentNumber: "321654987",
      documentType: "txid",
      entityType: "individual",
      name: "Hector Toro",
    },
  },

  symbol: { handle: "cop" },
  amount: 400,
} as any;
const data = {
  handle: "20250903795828547TFY595495513812965", //generateTimestampHandle(),
  claims: [claim],
  schema: "b2p-send", // Changed from "b2p-send" to "transfer" to match SDK
  access: getOwnerAccessRules(PUBLIC_KEY),
  config: {
    commit: "auto",
  },
};

// const signatureCustom = {
//   moment: dayjs().toISOString(),
//   status: "created",
//   consented: dayjs().toISOString(),
//   received: dayjs().toISOString(),
//   dispatched: dayjs().toISOString(),
// };

const signatureCustom = {
  moment: "2025-09-04T10:10:31.616Z",
  status: "created",
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
    const hash = createHash(data);
    console.log("HASH:", hash);
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

    const jwt = await signJWT(
      {
        iss: SIGNER,
        sub: `signer:${SIGNER}`,
        aud: LEDGER,
        iat: Math.floor(new Date("2025-09-04T10:10:31.616Z").getTime() / 1000), //Math.floor(Date.now() / 1000),
        exp: Math.floor(new Date("2025-09-05T11:10:31.616Z").getTime() / 1000), //Math.floor(Date.now() / 1000) + 60,
      },
      SECRET_KEY,
      PUBLIC_KEY
    );
    console.log("JWT:", jwt);
    console.info(
      "REQUEST:",
      util.inspect(request, { depth: null, colors: true })
    );
    // Add the required headers without JWT authentication for now

    // const response = await axios.post(`${SERVER}/intents`, request, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-ledger": LEDGER,
    //     Authorization: `Bearer ${jwt}`, // Temporarily removed
    //   },
    // });

    // console.info("RESPONSE:", response.data);
    // console.info(
    //   "RESPONSE:",
    //   util.inspect(response.data, { depth: null, colors: true })
    // );
  } catch (error: any) {
    console.info(
      "RESPONSE ERROR:",
      util.inspect(error.response.data, { depth: null, colors: true })
    );
  }
};

export const prepareDebitWithApi = async () => {};

const ANCHOR_SERVER = "https://427652022779.ngrok-free.app"; //esta prueba es con el alias ledger local y el mockup bridge de TFY
const ANCHOR = "3123454333";

export const getAnchortWithApi = async () => {
  try {
    const response = await axios.get(`${ANCHOR_SERVER}/v2/anchors/${ANCHOR}`, {
      headers: {
        "Content-Type": "application/json",
        "x-received": dayjs().toISOString(),
        "x-dispatched": dayjs().toISOString(),
        //   "x-ledger": LEDGER,
        //   Authorization: `Bearer ${jwt}`, // Temporarily removed
      },
    });

    // console.info("RESPONSE:", response.data);
    console.info(
      "RESPONSE:",
      util.inspect(response.data, { depth: null, colors: true })
    );
  } catch (error) {}
};

createIntentWithApi();
// prepareDebitWithSdk();
// getAnchortWithApi();

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
