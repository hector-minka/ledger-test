import ledgerSdk from "@minka/ledger-sdk";

const { LedgerSdk } = ledgerSdk;

// const LEDGER = "ledger-bridge-test";
const LEDGER = "quorum-demo";
const SERVER = "https://ldg-stg.one/api/v2";

// Debit signer keys
// htorohn
const DEBIT_PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const DEBIT_SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// Credit signer keys (you'll need to generate new keys for this)
// signer-demo
const CREDIT_PUBLIC_KEY = "RyeUZy3h3mqQ4cOg0dORRJnXoaMGeWz8Jy6HFKUG+O0=";
const CREDIT_SECRET_KEY = "1ndnufQ8GTBLXwiYLD6lftF/iPKssiyPWWhCeEsM8m8="; // Replace with actual credit secret key

// const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";

// Debit signer key pair
const debitKeyPair = {
  format: "ed25519-raw",
  public: DEBIT_PUBLIC_KEY,
  secret: DEBIT_SECRET_KEY,
};

// Credit signer key pair
const creditKeyPair = {
  format: "ed25519-raw",
  public: CREDIT_PUBLIC_KEY,
  secret: CREDIT_SECRET_KEY,
};

// Populate with Ledger public key data.
export const ledgerSigner = {
  format: "ed25519-raw",
  public: "XhjxNOor+jocpF7YrMTiNdeNbwgqvG3EicLO61cyfZU=",
};

// Configure the Ledger SDK for debits
const debitLedger = new LedgerSdk({
  // This is the ledger instance we are going to connect to.
  ledger: LEDGER,
  server: SERVER,
  secure: {
    aud: "demo",
    iss: "debit-signer",
    keyPair: debitKeyPair,
    sub: debitKeyPair.public,
    exp: 3600,
  },
});

// Configure the Ledger SDK for credits
const creditLedger = new LedgerSdk({
  // This is the ledger instance we are going to connect to.
  ledger: LEDGER,
  server: SERVER,
  secure: {
    aud: "demo",
    iss: "credit-signer",
    keyPair: creditKeyPair,
    sub: creditKeyPair.public,
    exp: 3600,
  },
});

// This function is used to notify Ledger of Debit Entry processing final statuses.
export async function notifyDebitLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action];

  if (!notifyStates.includes(notifyAction.state)) {
    return;
  }

  console.log(`[NOTIFY-DEBIT-LEDGER] Entry:`, entry);

  const custom = {
    handle: entry.handle,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error?.reason,
    detail: notifyAction.error?.detail,
    failId: notifyAction.error?.failId,
  };

  const ledgerResponse = await debitLedger.intent
    .from(entry.data.intent)
    .hash()
    .sign([
      {
        keyPair: debitKeyPair,
        custom,
      },
    ])
    .send();
  console.log(
    `SENT debit signature to Ledger\n${JSON.stringify(custom, null, 2)}`
  );
}

// This function is used to notify Ledger of Credit Entry processing final statuses.
export async function notifyCreditLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action];
  console.log(`[NOTIFY-CREDIT-LEDGER] Entry:`, entry);
  console.log(`[NOTIFY-CREDIT-LEDGER] Notify action:`, notifyAction);
  console.log(`[NOTIFY-CREDIT-LEDGER] Notify states:`, notifyStates);
  if (!notifyStates.includes(notifyAction.state)) {
    return;
  }
  console.log(
    `[NOTIFY-CREDIT-LEDGER] Notify states included:`,
    notifyStates.includes(notifyAction.state)
  );
  const custom = {
    handle: entry.handle,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error?.reason,
    detail: notifyAction.error?.detail,
    failId: notifyAction.error?.failId,
  };
  console.log(`[NOTIFY-CREDIT-LEDGER] Custom:`, custom);
  try {
    console.log(`[NOTIFY-CREDIT-LEDGER] Sending credit signature to Ledger`);
    const ledgerResponse = await creditLedger.intent
      .from(entry.data.intent)
      .hash()
      .sign([
        {
          keyPair: creditKeyPair,
          custom,
        },
      ])
      .send();
    console.log(`[NOTIFY-CREDIT-LEDGER] Ledger response:`, ledgerResponse);
    console.log(
      `[NOTIFY-CREDIT-LEDGER] Successfully sent credit signature to Ledger`
    );
  } catch (error) {
    console.error(
      `[NOTIFY-CREDIT-LEDGER] Error sending credit signature to Ledger:`,
      error
    );
  }
  console.log(
    `SENT credit signature to Ledger\n${JSON.stringify(custom, null, 2)}`
  );
}

// Export the ledger instances for direct use
export { creditKeyPair, creditLedger, debitLedger };

// Legacy function for backward compatibility (uses debit signer)
export async function notifyLedger(entry, action, notifyStates) {
  console.log(
    `[LEGACY] Using debit signer for notifyLedger - consider using notifyDebitLedger or notifyCreditLedger`
  );
  return notifyDebitLedger(entry, action, notifyStates);
}
