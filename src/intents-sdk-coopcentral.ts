import { LedgerSdk } from "@minka/ledger-sdk";
import util from "util";

// Informacion para firmar los proof

// htorohn-stg
const PUBLIC_KEY = "YhIUknamPGxoyqEgF4RlrujAWl4Jt3NfFJQ0pKELv40=";
const SECRET_KEY = "kShFn6MLbXGo1FX4y6Gf4NkWsqECFXN5YQKOA2lfetE=";
const LEDGER = "coopcentral-beta";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "id0gNho3TJPmBQZo0+jKcLPDhhg984o27jEFJvx05xI=";

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

const claim = {
  action: "transfer",
  amount: 400,
  source: {
    handle: "svgs:0987654321@business.com",
    custom: {
      entityType: "business",
      documentNumber: "1234567",
      documentType: "txid",
      name: "Source Business",
    },
  },
  symbol: { handle: "cop" },
  target: {
    handle: "svgs:123456790@individual.com",
    custom: {
      entityType: "individual",
      documentNumber: "7654321",
      documentType: "txid",
      name: "Alfredo del Cid",
    },
  },
} as any;

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
      handle: "12345678901234567XYZ123456789012345",
      claims: [claim],
      schema: "b2p-send",
      custom: {
        routingCode: "TFY",
      },
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
