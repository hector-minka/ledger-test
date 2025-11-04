import { LedgerSdk } from "@minka/ledger-sdk";
import { IntentCommitMode } from "@minka/ledger-sdk/types";
import util from "util";
import { generateISOTimestamp, generateTimestampHandle } from "./utils/handle";

// Informacion para firmar los proof

// htorohn
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// hector-bac
// const PUBLIC_KEY = "mZgQf7MvGjSHgevAF0ZhVfXGjX5Jyd8bHMdZJ0msEcE=";
// const SECRET_KEY = "ocOakPT0WW/vG7TZTHeg0nf4CJ2mfv/WrivaDQzo0j4=";
// const LEDGER = "toro-ledger";
// const LEDGER = "hector-ledger-test";
// const LEDGER = "payments-hub-hector-test";
// const SERVER = "https://ldg-dev.one/api/v2";
// const LEDGER = "payment-hub-staging";

const LEDGER = "quorum-demo";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A="; // htorohn lpayments-hub-hector-test dev server

// const LEDGER = "ph-demo";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "F1jP1QlOt2stfMYmP4E39gMclnuHVEG3Tlo/zIq7vbs="; // htorohn lpayments-hub-hector-test dev server

// const LEDGER = "alianza-beta";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "kuVd5x0aRp9RsDciy948pcnRT6v2ResWjECHH7TPhO0="; // htorohn lpayments-hub-hector-test dev server

// const LEDGER = "alianza-stg";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "r4H7Zvpxih7dlW3MeTH0M9aqOUMkDuZUOWsFMz3lHFw=";

// const LEDGER = "ledger-bridge-test";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA="; // htorohn server key
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s="; // hector-bac server key
// const PUBLIC_SERVER_KEY = "vY5WiTerOBs7FVHLQcz+Y4L0pXXs6HtasskooJwcyqw="; // htorohn ledger-bridge-test
// const PUBLIC_SERVER_KEY = "sWf+wVQmbs+1lrjOpfwetHHMchQxDdEHVoCl6+1v1CI="; // htorohn lpayments-hub-hector-test dev server

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

//transfer to test for ph
// const claim = {
//   action: "transfer",
//   source: {
//     handle: "svgs:123456789@alianza.com.co",
//     custom: {
//       documentNumber: "123456789",
//       documentType: "txid",
//       entityType: "business",
//       name: "Mi Negocio",
//     },
//   },
//   target: {
//     handle: "svgs:20240915400@transfiya",
//     custom: {
//       accountRef: "wi2UauFZ8ARN5vYhVY57r4LSmA2aWsGiwL",
//       documentNumber: "321654987",
//       documentType: "txid",
//       entityType: "individual",
//       name: "BIBIANA CAUSIL",
//     },
//   },
//   symbol: { handle: "cop" },
//   amount: 4000,
// } as any;

//transfer to test quorum-demo
const claim = {
  action: "transfer",

  source: {
    // handle: "svgs:1234567@ficohsa.com.hn",
    // handle: "svgs:1234567@bac.com.hn",
    // handle: "svgs:1234567@bank.com.co",
    handle: "svgs:2@ach",
    custom: {
      idNumber: "123456789",
      idType: "txid",
      entityType: "business",
      name: "Toro Studio",
    },
    // custom: {
    //   entityType: "individual",
    //   idNumber: "1234567",
    //   idType: "txid",
    //   name: "Hector Toro",
    //   phoneNumber: "98761065",
    // },
  },
  target: {
    handle: "svgs:3@alianza",
    custom: {
      //   accountRef: "3123454333",
      idNumber: "321654987",
      idType: "txid",
      entityType: "individual",
      name: "Hector Toro",
    },
    // handle: "svgs:1234567@bac.com.hn",
    // custom: {
    //   entityType: "individual",
    //   idNumber: "7654321",
    //   idType: "txid",
    //   name: "Alfredo del Cid",
    // },
  },

  symbol: { handle: "cop" },
  amount: 500,
} as any;

//transfer to ph-demo
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
//     handle: "svgs:01780053450@bancorojo.co",
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

const customProof = {
  moment: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
  dispatched: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
  status: "created",
  consented: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
  received: generateISOTimestamp(), //"2025-07-16T00:51:50.904Z",
};

const keyPair = {
  // Public-secret key pair used to sign tokens
  format: "ed25519-raw" as const,
  public: PUBLIC_KEY,
  secret: SECRET_KEY,
};

const sdk = new LedgerSdk({
  ledger: LEDGER,
  server: SERVER,
  timeout: 15000,
  verifyResponseProofs: false,
  signer: {
    format: "ed25519-raw",
    public: PUBLIC_SERVER_KEY,
  },
  // Optional, default values for auth composition
  secure: {
    iss: PUBLIC_KEY, // signer handle or public key
    sub: "signer:htorohn", // signer:<handle>, bridge:<handle>, ...
    aud: LEDGER, // ledger handle or public key
    exp: 60, // Expiration time of tokens, in seconds
    keyPair,
  },
});

// Function to generate a timestamp-based handle following the pattern ^\\d{8}\\d{9}.{3}\\d{15}$
// const generateTimestampHandle = (): string => {
//   // Get current timestamp in YYYYMMDD format (8 digits)
//   const now = new Date();
//   const timestamp =
//     now.getFullYear().toString() +
//     (now.getMonth() + 1).toString().padStart(2, "0") +
//     now.getDate().toString().padStart(2, "0");

//   // Generate 9 random digits
//   const randomDigits = Math.floor(Math.random() * 1000000000)
//     .toString()
//     .padStart(9, "0");

//   // Fixed 3 characters (you can change these as needed)
//   const fixedChars = "TFY";

//   // Generate 15 random digits
//   const randomDigits15 = Math.floor(Math.random() * 1000000000000000)
//     .toString()
//     .padStart(15, "0");

//   return timestamp + randomDigits + fixedChars + randomDigits15;
// };

const data = {
  // handle: sdk.handle.unique(), // will return a random unique handle
  claims: [claim],
  //   schema: "transfer",
  handle: generateTimestampHandle(),
  access: getOwnerAccessRules(keyPair.public),
  config: {
    commit: IntentCommitMode.Auto,
  },
  custom: {
    routingCode: "TFY",
    useCase: "send.b2p",
  },
};

export const createIntentWithSdk = async () => {
  console.log(
    "Request data to send:",
    util.inspect(data, { depth: null, colors: true })
  );
  try {
    const response = await sdk.intent
      .init()
      .data({
        // handle: sdk.handle.unique(), // will return a random unique handle
        claims: [claim],
        // schema: "payment",
        schema: "transfer", //esta es para probar quorum-demo
        handle: generateTimestampHandle(),
        access: getOwnerAccessRules(keyPair.public),
        config: {
          commit: IntentCommitMode.Auto,
        },
        custom: {
          description: "Test transaction",
          //   routingCode: "TFY",
          //   useCase: "send.b2p",
        },
      })
      .hash()
      .sign([{ keyPair, custom: customProof }])
      .send();
    // Get just the actual intent data
    const intentData = (response as any).data?.data || (response as any).intent;
    console.info(
      "INTENT DATA:",
      util.inspect(intentData, { depth: null, colors: true })
    );
  } catch (error: any) {
    console.error(
      `❌ Error occurred:`,
      util.inspect(error, { depth: 1, colors: true })
    );

    // Log all enumerable properties
    // console.log("Error properties:", Object.keys(error.custom.causedBy));

    // // Log each property individually
    // // Object.keys(error.custom.trace.custom).forEach((key) => {
    // //   console.log(`${key}:`, error[key]);
    // // });

    // if (error.custom.causedBy.request) {
    //   console.error(
    //     `🔍 Custom request object:`,
    //     util.inspect(error.custom.causedBy.request, {
    //       depth: 2,
    //       colors: true,
    //     })
    //   );
    // }
  }
};

export const prepareDebitWithSdk = async (intentHandle: string) => {
  console.log(
    `🔍 [prepareDebitWithSdk] Starting process for intent handle: ${intentHandle}`
  );

  try {
    // Step 1: Read the existing intent by its handle
    console.log(
      `📖 [prepareDebitWithSdk] Step 1: Reading existing intent from server...`
    );
    const { response } = await sdk.intent.read(intentHandle);
    console.log(`✅ [prepareDebitWithSdk] Step 1: Successfully read intent`);
    console.log(`📋 [prepareDebitWithSdk] Intent data received:`, {
      handle: response.data?.data?.handle,
      schema: response.data?.data?.schema,
      claimsCount: response.data?.data?.claims?.length,
      status: response.data?.meta?.status,
    });

    // Step 2: Start building the intent from existing data
    console.log(
      `🔧 [prepareDebitWithSdk] Step 2: Building intent from existing data...`
    );
    const intentBuilder = sdk.intent.from(response.data);
    console.log(
      `✅ [prepareDebitWithSdk] Step 2: Intent builder created from response.data`
    );

    // Step 3: Hash the intent data
    console.log(
      `🔐 [prepareDebitWithSdk] Step 3: Creating hash of intent data...`
    );
    const hashedIntent = intentBuilder.hash();
    console.log(`✅ [prepareDebitWithSdk] Step 3: Hash created successfully`);

    // Step 4: Prepare signature data
    console.log(
      `✍️ [prepareDebitWithSdk] Step 4: Preparing signature with custom data...`
    );
    const customData = {
      moment: new Date().toISOString(),
      status: "prepared",
    } as any; // Type assertion to bypass strict typing
    console.log(`📝 [prepareDebitWithSdk] Custom signature data:`, customData);

    // Step 5: Sign the intent
    console.log(
      `🔑 [prepareDebitWithSdk] Step 5: Signing intent with Ed25519 key...`
    );
    const signedIntent = hashedIntent.sign([
      {
        keyPair,
        custom: customData,
      },
    ]);
    console.log(
      `✅ [prepareDebitWithSdk] Step 5: Intent signed successfully with key: ${keyPair.public.substring(
        0,
        10
      )}...`
    );

    // Step 6: Send the signed intent to server
    console.log(
      `📤 [prepareDebitWithSdk] Step 6: Sending signed intent to server...`
    );
    const intent_prepared_debit = await signedIntent.send();
    console.log(
      `✅ [prepareDebitWithSdk] Step 6: Intent sent successfully to server`
    );
    console.log(
      `📊 [prepareDebitWithSdk] Server response status: ${
        intent_prepared_debit.response?.status || "unknown"
      }`
    );

    // Step 7: Log the final result
    console.log(`🎉 [prepareDebitWithSdk] Process completed successfully!`);
    console.info(
      "INTENT PREPARED DEBIT:",
      util.inspect(intent_prepared_debit.response.data, {
        depth: null,
        colors: true,
      })
    );

    return intent_prepared_debit;
  } catch (error) {
    console.error(
      `❌ [prepareDebitWithSdk] Error occurred during process:`,
      error
    );
    console.error(`🔍 [prepareDebitWithSdk] Error details:`, {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      intentHandle: intentHandle,
    });
    throw error; // Re-throw to let the calling function handle it
  }
};

export const prepareCreditWithSdk = async (intentHandle: string) => {
  console.log(
    `🔍 [prepareCreditWithSdk] Starting process for intent handle: ${intentHandle}`
  );

  try {
    // Step 1: Read the existing intent by its handle
    console.log(
      `📖 [prepareCreditWithSdk] Step 1: Reading existing intent from server...`
    );
    const { response } = await sdk.intent.read(intentHandle);
    console.log(`✅ [prepareCreditWithSdk] Step 1: Successfully read intent`);
    console.log(`📋 [prepareCreditWithSdk] Intent data received:`, {
      handle: response.data?.data?.handle,
      schema: response.data?.data?.schema,
      claimsCount: response.data?.data?.claims?.length,
      status: response.data?.meta?.status,
    });

    // Step 2: Start building the intent from existing data
    console.log(
      `🔧 [prepareCreditWithSdk] Step 2: Building intent from existing data...`
    );
    const intentBuilder = sdk.intent.from(response.data);
    console.log(
      `✅ [prepareCreditWithSdk] Step 2: Intent builder created from response.data`
    );

    // Step 3: Hash the intent data
    console.log(
      `🔐 [prepareCreditWithSdk] Step 3: Creating hash of intent data...`
    );
    const hashedIntent = intentBuilder.hash();
    console.log(`✅ [prepareCreditWithSdk] Step 3: Hash created successfully`);

    // Step 4: Prepare signature data
    console.log(
      `✍️ [prepareCreditWithSdk] Step 4: Preparing signature with custom data...`
    );
    const customData = {
      moment: new Date().toISOString(),
      status: "prepared",
    } as any; // Type assertion to bypass strict typing
    console.log(`📝 [prepareCreditWithSdk] Custom signature data:`, customData);

    // Step 5: Sign the intent
    console.log(
      `🔑 [prepareCreditWithSdk] Step 5: Signing intent with Ed25519 key...`
    );
    const signedIntent = hashedIntent.sign([
      {
        keyPair,
        custom: customData,
      },
    ]);
    console.log(
      `✅ [prepareCreditWithSdk] Step 5: Intent signed successfully with key: ${keyPair.public.substring(
        0,
        10
      )}...`
    );

    // Step 6: Send the signed intent to server
    console.log(
      `📤 [prepareCreditWithSdk] Step 6: Sending signed intent to server...`
    );
    const intent_prepared_credit = await signedIntent.send();
    console.log(
      `✅ [prepareCreditWithSdk] Step 6: Intent sent successfully to server`
    );
    console.log(
      `📊 [prepareCreditWithSdk] Server response status: ${
        intent_prepared_credit.response?.status || "unknown"
      }`
    );

    // Step 7: Log the final result
    console.log(`🎉 [prepareCreditWithSdk] Process completed successfully!`);
    console.info(
      "INTENT PREPARED CREDIT:",
      util.inspect(intent_prepared_credit.response.data, {
        depth: null,
        colors: true,
      })
    );

    return intent_prepared_credit;
  } catch (error) {
    console.error(
      `❌ [prepareCreditWithSdk] Error occurred during process:`,
      error
    );
    console.error(`🔍 [prepareCreditWithSdk] Error details:`, {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      intentHandle: intentHandle,
    });
    throw error; // Re-throw to let the calling function handle it
  }
};

createIntentWithSdk();
// prepareDebitWithSdk();
