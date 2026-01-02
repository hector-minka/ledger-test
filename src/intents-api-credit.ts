import axios from "axios";
import util from "util";
import { generateSignature, signJWT } from "../crypto-utils";
import { generateISOTimestamp, generateTimestampHandle } from "./utils/handle";

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
// // const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA=";
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";
// const LEDGER = "alianza-stg";
// const SERVER = "https://ldg-stg.one/api/v2";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";

const LEDGER = "ph-demo";
const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "F1jP1QlOt2stfMYmP4E39gMclnuHVEG3Tlo/zIq7vbs=";
// console.log("SERVER:", SERVER);

const getOwnerAccessRules = (publicKey: string) => {
  return [
    {
      action: "any",
      signer: {
        public: publicKey,
      },
    },
  ] as any;
};

//DEMO CLAIM:
const claim = {
  action: "transfer",
  source: {
    handle: "svgs:234234234@fineract.com.co",
    custom: {
      documentNumber: "123456789",
      documentType: "txid",
      entityType: "business",
      name: "Mi Negocio",
    },
  },

  target: {
    // Esta es una cuenta inactiva, para que el credito devuelva error
    handle: "svgs:60100000110@crezcamos",
    custom: {
      accountRef: "wTfFxPWiXfXfRcA4WMmiCFybKFDLxdMBDT",
      documentNumber: "63555909",
      documentType: "cc",
      entityType: "individual",
      name: "Mario Alfonso Ruiz Lopez",
      participantCode: "900515759",
      participantRef: "$crezcamos",
    },
  },
  symbol: {
    handle: "cop",
  },
  amount: 1000,
} as any;

const data = {
  handle: generateTimestampHandle(),
  claims: [claim],
  schema: "payment", // Changed from "b2p-send" to "payment" to match SDK
  access: getOwnerAccessRules(PUBLIC_KEY),
  config: {
    commit: "auto",
  },
  custom: {
    routingCode: "TFY",
    useCase: "send.p2p",
  },
};

const signatureCustom = {
  moment: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
  dispatched: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
  status: "created",
  //   consented: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
  received: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
};

const keyPair = {
  // Public-secret key pair used to sign tokens
  format: "ed25519-raw" as const,
  public: PUBLIC_KEY,
  secret: SECRET_KEY,
};

export const createIntentWithApi = async () => {
  try {
    // Use the new crypto-utils module to generate signature
    const { hash, digest, result } = generateSignature(
      data,
      SECRET_KEY,
      signatureCustom
    );

    console.log("HASH:", hash);
    console.log("SIGNATURE DIGEST:", digest);
    console.log("SIGNATURE BASE64:", result);

    const request = {
      data,
      hash,
      meta: {
        proofs: [
          {
            method: "ed25519-v2",
            custom: signatureCustom,
            digest,
            public: keyPair.public,
            result,
          },
        ],
      },
    };

    const jwt = await signJWT(
      {
        iss: SIGNER,
        sub: `signer:${SIGNER}`,
        aud: LEDGER,
        iat: Math.floor(new Date().getTime() / 1000), //Math.floor(Date.now() / 1000),
        exp: Math.floor(new Date().getTime() / 1000) + 6000, //Math.floor(Date.now() / 1000) + 60,
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

    const response = await axios.post(`${SERVER}/intents`, request, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`, // Temporarily removed
      },
    });

    // console.info("RESPONSE:", response.data);
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
