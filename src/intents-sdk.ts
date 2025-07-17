import { LedgerSdk } from "@minka/ledger-sdk";
import util from "util";

// Informacion para firmar los proof

// htorohn
// const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
// const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// hector-bac
const PUBLIC_KEY = "mZgQf7MvGjSHgevAF0ZhVfXGjX5Jyd8bHMdZJ0msEcE=";
const SECRET_KEY = "ocOakPT0WW/vG7TZTHeg0nf4CJ2mfv/WrivaDQzo0j4=";
// const LEDGER = "toro-ledger";
const LEDGER = "hector-ledger-test";
const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA=";
const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";

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

const sdk = new LedgerSdk({
  ledger: LEDGER,
  server: SERVER,
  timeout: 15000,
  verifyResponseProofs: false,
  signer: {
    format: "ed25519-raw",
    public: PUBLIC_SERVER_KEY,
  },
});

const keyPair = {
  // Public-secret key pair used to sign tokens
  format: "ed25519-raw" as const,
  public: PUBLIC_KEY,
  secret: SECRET_KEY,
};

export const createIntentWithSdk = async () => {
  const response = await sdk.intent
    .init()
    .data({
      handle: sdk.handle.unique(), // will return a random unique handle
      claims: [claim],
      schema: "transfer",
      access: getOwnerAccessRules(keyPair.public),
    })
    .hash()
    .sign([{ keyPair }])
    .send();

  // Get just the actual intent data
  const intentData = (response as any).data?.data || (response as any).intent;
  console.info(
    "INTENT DATA:",
    util.inspect(intentData, { depth: null, colors: true })
  );
};

export const prepareDebitWithSdk = async () => {};

createIntentWithSdk();
// prepareDebitWithSdk();
