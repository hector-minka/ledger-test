import axios from "axios";
import dayjs from "dayjs";
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

const LEDGER = "coopcentral-stg";
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

//DEMO CLAIM:
const claim = {
  action: "transfer",
  source: {
    handle: "svgs:234234235@coopcentral.com.co",
    custom: {
      documentNumber: "123456789",
      documentType: "txid",
      entityType: "business",
      name: "Mi Negocio",
    },
  },

  target: {
    // Esta es una cuenta inactiva, para que el credito devuelva error
    handle: "svgs:12345654321@bancorojo",
    custom: {
      accountRef: "whuNP1sAxduKZWLHWxkiYEeDhMnuC4m2j4",
      documentNumber: "900123456",
      documentType: "txid",
      entityType: "business",
      name: "Casalinda Inc'",
      participantCode: "900504001",
      participantRef: "$bancorojo''",
      routingCode: "TFY",
    },
  },
  // target: {
  //   // Esta es una cuenta inactiva, para que el credito devuelva error
  //   handle: "svgs:0178005345@banrep",
  //   custom: {
  //     accountRef: "wSW1vpZRFtWyR4b8VoBtjWYmVbSmH1ry5s",
  //     documentNumber: "3131920",
  //     documentType: "cc",
  //     entityType: "individual",
  //     name: "ADOLFO RUIZ",
  //     participantCode: "860003020",
  //     participantRef: "$banrep'",
  //     routingCode: "ENT",
  //   },
  // },
  symbol: {
    handle: "cop",
  },
  amount: 100,
} as any;

//for ph-demo test with fineract and bancorojo
// const claim = {
//   action: "transfer",

//   source: {
//     handle: "svgs:1543534534534@fineract.com.co",
//     custom: {
//       documentNumber: "080119860745",
//       documentType: "cc",
//       entityType: "individual",
//       name: "Hector Toro",
//     },
//   },
//   target: {
//     // handle: "@BBVA32230398554",
//     handle: "svgs:01780053450@banrep",
//     schema: "individual",
//     symbol: "usd",
//     custom: {
//       entityType: "individual",
//       name: "ADOLFO RUIZ",
//       aliasType: "username",
//       documentType: "cc",
//       documentNumber: "3131920",
//       accountRef: "wSW1vpZRFtWyR4b8VoBtjWYmVbSmH1ry5s",
//     },
//   },

//   symbol: { handle: "cop" },
//   amount: 400,
// } as any;
const data = {
  handle: generateTimestampHandle("890203088"),
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

// const signatureCustom = {
//   moment: dayjs().toISOString(),
//   status: "created",
//   consented: dayjs().toISOString(),
//   received: dayjs().toISOString(),
//   dispatched: dayjs().toISOString(),
// };

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
