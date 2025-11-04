import { LedgerSdk } from "@minka/ledger-sdk";
import { LedgerKeyPair } from "@minka/ledger-sdk/types";
import util from "util";
// Utility function for ISO timestamp
function generateISOTimestamp(): string {
  return new Date().toISOString();
}

const AUDIENCE = "qr-demo";
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
const LEDGER = "qr-demo";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "Gy7CbTDCYcG5NEhs6lCw3Nlrz2yGo6UHCsCXQU0eR7M=";

/**
 * Create a QR Code anchor in Minka Ledger
 * This will trigger the webhook to the QR Bridge which will generate the QR code
 */
export async function createTransfiyaAnchor() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: false,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: PUBLIC_KEY,
      sub: "signer:htorohn",
      aud: AUDIENCE,
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });

  const keyPair: LedgerKeyPair = {
    format: "ed25519-raw",
    public: PUBLIC_KEY,
    secret: SECRET_KEY,
  };

  // QR Code anchor data according to the schema
  const anchorData = {
    handle: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    target: "target:test-account",
    schema: "qr-code",
    custom: {
      // Point of Initiation Method - Required
      pointOfInitiationMethod: "DINAMICO", // or "ESTATICO"

      // Merchant Account Information - Required
      merchantAccountInformation: {
        aliasType: "CELULAR", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID
        aliasValue: "+573001234567", // The "llave" - this goes to EMVco field 26-01
        merchantCode: "MERCH-001", // Optional merchant code
      },

      // Merchant Information - Required
      merchantName: "Test Merchant",
      merchantCity: "Bogotá",
      postalCode: "110111", // Required by

      // Transaction Details - Required
      merchantCategoryCode: "5411", // MCC code (0000 for PN, ISO 18245 for PJ)

      // Additional Merchant Information - Required
      additionalMerchantInformation: {
        terminal: "TERM-001", // Required terminal identifier
        transactionPorpose: "COMPRAS", // COMPRAS, ANULACIONES, TRANSFERENCIAS, RETIRO, RECAUDO, RECARGAS, DEPOSITO
      },

      // Transaction - Required
      transaction: {
        amount: "50000.00", // Transaction amount (required)
      },

      // Custom Data (Tax Information) - Optional but useful
      customData: {
        valorIva: "9500.00", // IVA amount (optional)
        baseIva: "50000.00", // Base IVA (optional)
        valorInc: "0.00", // INC amount (optional)
      },

      // Channel - Required
      channel: "POS", // IM, POS, APP, ECOMM, MPOS, ATM, CB, OFC
    },
  };

  try {
    console.log("🔄 Creating QR anchor...");
    console.log("📋 Anchor data:", JSON.stringify(anchorData, null, 2));

    const { response } = await sdk.anchor
      .init()
      .data(anchorData)
      .meta({
        labels: [],
        proofs: [],
      })
      .hash()
      .sign([
        {
          keyPair,
          custom: {
            domain: null,
            status: "ACTIVE",
            moment: generateISOTimestamp(),
          },
        },
      ])
      .send();

    console.log("✅ Anchor created successfully!");
    // console.log("📄 Request:", response.request);
    console.log(
      "📊 Response data:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    console.log("🔗 Anchor handle:", response.data?.data?.handle);

    // The ledger will automatically forward this to the QR Bridge webhook
    // The bridge will generate the QR code and return it

    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating anchor:");

    // Extract status from the nested structure
    let status = null;
    if (error?.custom?.causedBy?.response?.status) {
      status = error.custom.causedBy.response.status;
    } else if (error?.custom?.causedBy?.status) {
      status = error.custom.causedBy.status;
    } else if (error?.response?.status) {
      status = error.response.status;
    }

    if (status) {
      console.error("❌ Response status:", status);
    }

    // Log error details
    if (error?.custom?.causedBy?.response?.data) {
      console.error(
        "❌ Error details:",
        util.inspect(error.custom.causedBy.response.data, {
          depth: null,
          colors: true,
        })
      );
    }

    throw error;
  }
}

/**
 * Create a Static QR Code anchor (ESTATICO)
 */
export async function createStaticTransfiyaAnchor() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: false,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: PUBLIC_KEY,
      sub: "signer:htorohn",
      aud: AUDIENCE,
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });

  const keyPair: LedgerKeyPair = {
    format: "ed25519-raw",
    public: PUBLIC_KEY,
    secret: SECRET_KEY,
  };

  // Static QR - no transaction amount needed
  const anchorData = {
    handle: `anchor:transfiya-static-${Date.now()}@minka.io`,
    target: "target:test-account",
    schema: "transfiya-qr-code",
    custom: {
      pointOfInitiationMethod: "ESTATICO", // Static QR
      merchantAccountInformation: {
        aliasType: "EMAIL",
        aliasValue: "merchant@example.com",
        merchantCode: "MERCH-STATIC-001",
      },
      merchantName: "Static Merchant",
      merchantCity: "Bogotá",
      postalCode: "110111",
      merchantCategoryCode: "5411",
      additionalMerchantInformation: {
        terminal: "TERM-STATIC-001",
        transactionPorpose: "COMPRAS",
      },
      // For static QR, transaction amount is optional (user will enter it manually)
      transaction: {
        amount: "0.00", // Can be omitted, but requires the field
      },
      idQr: `QR-STATIC-${Date.now()}`,
      channel: "APP",
    },
  };

  try {
    console.log("🔄 Creating Static QR anchor...");

    const { response } = await sdk.anchor
      .init()
      .data(anchorData)
      .meta({
        labels: [],
        proofs: [],
      })
      .hash()
      .sign([
        {
          keyPair,
          custom: {
            domain: null,
            status: "ACTIVE",
            moment: generateISOTimestamp(),
          },
        },
      ])
      .send();

    console.log("✅ Static anchor created successfully!");
    console.log(
      "📊 Response data:",
      util.inspect(response.data, { depth: null, colors: true })
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating Static anchor:", error);
    throw error;
  }
}

/**
 * Read a anchor
 */
export async function getTransfiyaAnchor(handle: string) {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: false,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: PUBLIC_KEY,
      sub: "signer:htorohn",
      aud: AUDIENCE,
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });

  try {
    console.log(`🔍 Reading anchor: ${handle}`);

    const { response } = await sdk.anchor.read(handle);

    console.log(
      "📊 Anchor data:",
      util.inspect(response.data, { depth: null, colors: true })
    );

    // Check if it's a QR anchor
    if (response.data?.data?.schema === "transfiya-qr-code") {
      console.log("✅ This is a QR anchor");
      console.log(
        "🔑 Alias Value (llave):",
        response.data?.data?.custom?.["merchantAccountInformation"]?.aliasValue
      );
      console.log("📱 QR ID:", response.data?.data?.custom?.["idQr"]);
      console.log(
        "💰 Amount:",
        response.data?.data?.custom?.["transaction"]?.amount
      );
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Error reading anchor:", error);
    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const handle = args[1]; // Optional handle for get command

  if (!command) {
    console.log("Usage: ts-node test-transfiya-anchor.ts <command> [handle]");
    console.log("\nAvailable commands:");
    console.log("  createQR      - Create a dynamic QR anchor");
    console.log("  createStaticQR - Create a static QR anchor");
    console.log("  get <handle>   - Get a QR anchor");
    return;
  }

  try {
    switch (command) {
      case "createQR":
        await createTransfiyaAnchor();
        break;

      case "createStaticQR":
        await createStaticTransfiyaAnchor();
        break;

      case "get":
        if (!handle) {
          console.error("❌ Please provide an anchor handle");
          console.log("Usage: ts-node test-transfiya-anchor.ts get <handle>");
          return;
        }
        await getTransfiyaAnchor(handle);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log("Available commands: createQR, createStaticQR, get");
    }
  } catch (error: any) {
    console.error("❌ Error executing command:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
