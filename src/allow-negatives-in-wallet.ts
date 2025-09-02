import { LedgerSdk } from "@minka/ledger-sdk";
import {
  AccessAction,
  ClaimAction,
  LedgerIntent,
  LimitClaimMetric,
} from "@minka/ledger-sdk/types";
import util from "util";

// htorohn
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

const LEDGER = "payment-hub-staging";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";

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

export const allowNegativeBalanceInWallet = async () => {
  const limitIntent: LedgerIntent = {
    handle: "limiting-cop-in-bank-wallet-2",
    schema: "wallet-limit",
    claims: [
      {
        action: ClaimAction.Limit,
        metric: LimitClaimMetric.MinBalance,
        wallet: {
          handle: "alianza.com.co",
        },
        symbol: {
          handle: "cop",
        },
        amount: -200000000000000,
      },
    ],
    access: [
      {
        action: AccessAction.Any,
      },
    ],
  };
  const response = await sdk.intent
    .init()
    .data(limitIntent)
    .hash()
    .sign([{ keyPair }])
    .send();
  console.info(
    "RESPONSE:",
    util.inspect(response, { depth: null, colors: true })
  );
};

allowNegativeBalanceInWallet();
