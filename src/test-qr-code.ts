import { LedgerSdk } from "@minka/ledger-sdk";
import { LedgerKeyPair } from "@minka/ledger-sdk/types";
import * as util from "util";
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

  // QR Code anchor data according to the Colombia Dynamic QR Code Schema
  // Amount in base 100 (without decimals): 50000.00 COP = 5000000
  const transactionAmount = 5000000; // 50000.00 COP in base 100
  const taxAmount = 950000; // 9500.00 COP in base 100 (optional)

  const anchorData = {
    handle: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    target: "target:test-account",
    custom: {
      // Transaction details (required)
      transaction: {
        amount: transactionAmount, // Transaction amount in base 100 (required for dynamic QR)
        currencyCode: "170", // COP (Colombian Peso) - ISO 4217 code for Colombia
        tax: taxAmount, // IVA amount in base 100 (optional)
        referenceNumber: "INV-2024-001", // Merchant reference (optional)
        channel: "POS", // IM, POS, APP, ECOMM, MPOS, ATM, CB, OFC (optional)
        transactionPurpose: "COMPRAS", // COMPRAS, ANULACIONES, TRANSFERENCIAS, RETIRO, RECAUDO, RECARGAS, DEPOSITO (optional)
        terminal: "TERM-001", // Terminal label (optional)
      },

      // Remitant information (optional)
      // NOTE: In dynamic QR, aliasType and aliasValue are NOT sent here -
      // they are generated dynamically by the external service that the bridge consumes internally
      remitant: {
        name: "Test Merchant",
        documentNumber: "1234567890",
        documentType: "CC",
        city: "Bogotá",
        categoryCode: "5411", // MCC code (4 digits)
        countryCode: "CO", // Colombia
        postalCode: "110111",
      },

      // Recipient information (optional)
      // NOTE: In dynamic QR, aliasType and aliasValue are NOT sent here -
      // they are generated dynamically by the external service that the bridge consumes internally
      recipient: {
        // For dynamic QR, these are generated dynamically:
        // aliasType: "CELULAR", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID, NIT, ACCOUNT_NUMBER
        // aliasValue: "573001234567",
        merchantCode: "MERCH-001", // Optional merchant code
        name: "Test Recipient",
        documentNumber: "9876543210",
        documentType: "CC",
        city: "Medellín",
        categoryCode: "0000", // For PN: 0000, for PJ: ISO 18245 values
        countryCode: "CO",
        postalCode: "050001",
      },

      // Method options (optional)
      methodOptions: {
        subtype: "DINAMIC", // DINAMIC or STATIC
        duration: 3600, // Duration in seconds from creation time (required for dynamic QR)
      },

      // Additional metadata (optional)
      metadata: {
        // Any additional metadata for payment processing
      },
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

  // Static QR Code anchor data according to the Colombia Dynamic QR Code Schema
  // Note: This uses the same schema structure but with static-specific values
  const anchorData = {
    handle: `anchor:transfiya-static-${Date.now()}@minka.io`,
    target: "target:test-account",
    custom: {
      // Transaction details (required)
      // For static QR, amount can be 0 or omitted (user will enter it manually)
      transaction: {
        amount: 0, // Static QR - user enters amount manually
        currencyCode: "170", // COP (Colombian Peso)
      },

      // Remitant information (optional)
      remitant: {
        name: "Static Merchant",
        documentNumber: "1234567890",
        documentType: "CC",
        city: "Bogotá",
        categoryCode: "5411", // MCC code
        countryCode: "CO",
        postalCode: "110111",
      },

      // Recipient information (optional)
      // For static QR, aliasType and aliasValue can be provided
      recipient: {
        aliasType: "EMAIL", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID, NIT, ACCOUNT_NUMBER
        aliasValue: "merchant@example.com",
        merchantCode: "MERCH-STATIC-001",
        name: "Static Recipient",
        documentNumber: "9876543210",
        documentType: "CC",
        city: "Bogotá",
        categoryCode: "5411",
        countryCode: "CO",
        postalCode: "110111",
      },

      // Method options (optional)
      methodOptions: {
        subtype: "STATIC", // DINAMIC or STATIC
        duration: 31536000, // Duration in seconds (optional for static, but can be included - 1 year)
      },

      // Additional metadata (optional)
      metadata: {
        // Any additional metadata for payment processing
      },
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
    const custom = response.data?.data?.custom;
    if (custom?.["transaction"]) {
      console.log("✅ This is a QR anchor");

      // Display transaction information
      const transaction = custom["transaction"] as any;
      if (transaction?.amount) {
        // Convert from base 100 to decimal
        const amountInCOP = transaction.amount / 100;
        console.log(
          `💰 Amount: ${amountInCOP.toFixed(2)} COP (${
            transaction.amount
          } in base 100)`
        );
      }

      if (transaction?.currencyCode) {
        console.log(`💱 Currency Code: ${transaction.currencyCode}`);
      }

      if (transaction?.tax) {
        const taxInCOP = transaction.tax / 100;
        console.log(
          `📊 Tax (IVA): ${taxInCOP.toFixed(2)} COP (${
            transaction.tax
          } in base 100)`
        );
      }

      // Display recipient information
      const recipient = custom["recipient"] as any;
      if (recipient?.aliasValue) {
        console.log(
          `🔑 Recipient Alias Value (llave): ${recipient.aliasValue}`
        );
        if (recipient?.aliasType) {
          console.log(`📋 Recipient Alias Type: ${recipient.aliasType}`);
        }
      }

      // Display remitant information
      const remitant = custom["remitant"] as any;
      if (remitant?.name) {
        console.log(`👤 Remitant Name: ${remitant.name}`);
      }

      const methodOptions = custom["methodOptions"] as any;
      if (methodOptions?.subtype) {
        console.log(`🔄 QR Type: ${methodOptions.subtype}`);
      }

      if (methodOptions?.duration) {
        const duration = methodOptions.duration as number;
        const hours = duration / 3600;
        console.log(`⏱️  Duration: ${duration} seconds (${hours} hours)`);
      }
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
