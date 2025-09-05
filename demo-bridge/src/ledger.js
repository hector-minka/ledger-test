import ledgerSdk from "@minka/ledger-sdk";

const { LedgerSdk } = ledgerSdk;

// const LEDGER = "ledger-bridge-test";
const LEDGER = "payment-hub-staging";
const SERVER = "https://ldg-stg.one/api/v2";
// htorohn
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";

// Populate this object with bank keys you have created previously
// using htorohn signer at the moment
const bankKeyPair = {
  format: "ed25519-raw",
  public: PUBLIC_KEY,
  secret: SECRET_KEY,
};

// Populate with Ledger public key data.
export const ledgerSigner = {
  format: "ed25519-raw",
  public: "XhjxNOor+jocpF7YrMTiNdeNbwgqvG3EicLO61cyfZU=",
};

// Configure the Ledger SDK.
const ledger = new LedgerSdk({
  // This is the ledger instance we are going to connect to.
  ledger: LEDGER,
  server: SERVER,
  secure: {
    aud: "demo",
    iss: "mint",
    keyPair: bankKeyPair,
    sub: bankKeyPair.public,
    exp: 3600,
  },
});

// This function is used to notify Ledger of Entry processing final statuses.
export async function notifyLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action];

  if (!notifyStates.includes(notifyAction.state)) {
    return;
  }

  const custom = {
    handle: entry.handle,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error.reason,
    detail: notifyAction.error.detail,
    failId: notifyAction.error.failId,
  };
  const ledgerResponse = await ledger.intent
    .from(entry.data.intent)
    .hash()
    .sign([
      {
        keyPair: bankKeyPair,
        custom,
      },
    ])
    .send();
  console.log(`SENT signature to Ledger\n${JSON.stringify(custom, null, 2)}`);
}
