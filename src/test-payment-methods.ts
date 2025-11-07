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
 * Initialize SDK instance
 */
function getSdk() {
  return new LedgerSdk({
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
}

/**
 * Get key pair for signing
 */
function getKeyPair(): LedgerKeyPair {
  return {
    format: "ed25519-raw",
    public: PUBLIC_KEY,
    secret: SECRET_KEY,
  };
}

/**
 * Helper function to create and send anchor
 */
async function createAnchor(anchorData: any, description: string) {
  const sdk = getSdk();
  const keyPair = getKeyPair();

  try {
    console.log(`🔄 ${description}...`);
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
    console.log(
      "📊 Response data:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    console.log("🔗 Anchor handle:", response.data?.data?.handle);

    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating anchor:");

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
 * 1. Create QR Code for Individual (QR para individuo)
 * Schema: qr-individual.schema.json
 * Requires: recipient with aliasType and aliasValue
 * Typically static QR without amount
 */
export async function createQRIndividual() {
  const anchorData = {
    handle: `QR-INDIVIDUAL-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`,
    target: "target:test-account",
    schema: "qr-individual", // Schema identifier
    custom: {
      // Recipient information (REQUIRED)
      recipient: {
        aliasType: "CELULAR", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID, NIT, ACCOUNT_NUMBER
        aliasValue: "+573001234567", // REQUIRED for individual QR
        name: "Juan Pérez",
        documentNumber: "1234567890",
        documentType: "CC",
        city: "Bogotá",
        categoryCode: "0000", // For individuals typically 0000
        countryCode: "CO",
        postalCode: "110111",
      },
      // Transaction is optional for individual QR (typically static)
      // If present, amount and currencyCode are required
      // transaction: {
      //   amount: 5000000, // 50000.00 COP in base 100
      //   currencyCode: "170",
      // },
      // Method options (optional)
      methodOptions: {
        subtype: "STATIC", // STATIC for individual QR (typically)
        // duration: 31536000, // Optional for static QR
      },
      // Metadata (optional)
      metadata: {
        description: "QR code for individual payment",
      },
    },
  };

  return await createAnchor(anchorData, "Creating QR Code for Individual");
}

/**
 * 2. Create QR Code for Merchant (QR para comercio)
 * Schema: qr-merchant.schema.json
 * Requires: recipient with aliasType, aliasValue, name, city, categoryCode
 * Can be static or dynamic
 */
export async function createQRMerchant() {
  const transactionAmount = 5000000; // 50000.00 COP in base 100
  const taxAmount = 950000; // 9500.00 COP in base 100

  const anchorData = {
    handle: `QR-MERCHANT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`,
    target: "target:test-account",
    schema: "qr-merchant", // Schema identifier
    custom: {
      // Recipient information (REQUIRED with name, city, categoryCode)
      recipient: {
        aliasType: "NIT", // For merchants typically NIT or MERCHANTID
        aliasValue: "900123456-1", // REQUIRED for merchant QR
        merchantCode: "MERCH-001", // Optional merchant code
        name: "Mi Tienda S.A.S", // REQUIRED for merchant
        documentNumber: "900123456-1",
        documentType: "NIT",
        city: "Bogotá", // REQUIRED for merchant
        categoryCode: "5411", // REQUIRED for merchant (MCC code)
        countryCode: "CO",
        postalCode: "110111",
      },
      // Transaction (optional - can be static or dynamic)
      // If present, amount and currencyCode are required
      transaction: {
        amount: transactionAmount,
        currencyCode: "170", // COP
        tax: taxAmount,
        referenceNumber: "FACT-2024-001234",
        channel: "POS",
        transactionPurpose: "COMPRAS",
        terminal: "TERM-001",
      },
      // Method options (optional)
      methodOptions: {
        subtype: "DINAMIC", // DINAMIC or STATIC
        duration: 3600, // Required if subtype is DINAMIC
      },
      // Metadata (optional)
      metadata: {
        description: "QR code for merchant payment",
      },
    },
  };

  return await createAnchor(anchorData, "Creating QR Code for Merchant");
}

/**
 * 3. Create Dynamic Key (Llave dinámica)
 * Schema: dynamic-key.schema.json
 * Requires: methodOptions with duration
 * The aliasValue is generated dynamically, so it's NOT provided
 */
export async function createDynamicKey() {
  const anchorData = {
    handle: `DYNAMIC-KEY-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`,
    target: "target:test-account",
    schema: "dynamic-key", // Schema identifier
    custom: {
      // Recipient information (optional)
      // NOTE: aliasValue is NOT provided - it will be generated dynamically
      recipient: {
        aliasType: "CELULAR", // REQUIRED if recipient is provided
        // aliasValue is NOT provided - will be generated
        name: "Service Provider",
        city: "Bogotá",
        categoryCode: "4899",
        countryCode: "CO",
      },
      // Transaction is NOT used for dynamic keys
      // Transaction information is generated when the key is used
      // Method options (REQUIRED)
      methodOptions: {
        subtype: "DINAMIC",
        duration: 259200, // REQUIRED for dynamic keys (3 days in seconds)
      },
      // Metadata (optional)
      metadata: {
        description: "Dynamic key for recurring payments",
      },
    },
  };

  return await createAnchor(anchorData, "Creating Dynamic Key");
}

/**
 * 4. Create Payment Link (Link de pago)
 * Schema: payment-link.schema.json
 * Requires: recipient with aliasType and aliasValue
 * Transaction is optional
 */
export async function createPaymentLink() {
  const transactionAmount = 7500000; // 75000.00 COP in base 100

  const anchorData = {
    handle: `PAYMENT-LINK-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`,
    target: "target:test-account",
    schema: "payment-link", // Schema identifier
    custom: {
      // Recipient information (REQUIRED)
      recipient: {
        aliasType: "MERCHANTID", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID, NIT, ACCOUNT_NUMBER
        aliasValue: "PW-MERCH-123456", // REQUIRED for payment links
        merchantCode: "MERCH-LINK-001", // Optional
        name: "E-commerce Store",
        documentNumber: "800123456-1",
        documentType: "NIT",
        city: "Medellín",
        categoryCode: "7311",
        countryCode: "CO",
        postalCode: "050001",
      },
      // Transaction (optional for payment links)
      // If present, amount and currencyCode are required
      transaction: {
        amount: transactionAmount,
        currencyCode: "170", // COP
        referenceNumber: "ORDER-2024-001234",
        channel: "APP",
        transactionPurpose: "COMPRAS",
      },
      // Method options (optional)
      methodOptions: {
        subtype: "DINAMIC", // DINAMIC or STATIC
        duration: 86400, // Optional (24 hours)
      },
      // Metadata (optional)
      metadata: {
        description: "Payment link for e-commerce",
        invoiceNumber: "INV-2024-001234",
        customerEmail: "customer@example.com",
      },
    },
  };

  return await createAnchor(anchorData, "Creating Payment Link");
}

/**
 * Read an anchor by handle
 */
export async function getAnchor(handle: string) {
  const sdk = getSdk();

  try {
    console.log(`🔍 Reading anchor: ${handle}`);
    const { response } = await sdk.anchor.read(handle);

    console.log(
      "📊 Anchor data:",
      util.inspect(response.data, { depth: null, colors: true })
    );

    // Check if it's a payment method anchor
    const custom = response.data?.data?.custom;
    const schema = response.data?.data?.schema;

    if (custom) {
      console.log("\n✅ Payment method anchor detected");
      console.log(`📋 Schema: ${schema || "Not specified"}`);

      // Display transaction information
      if (custom["transaction"] && typeof custom["transaction"] === "object") {
        const transaction = custom["transaction"] as any;
        console.log("\n💰 Transaction Details:");

        if (transaction.amount) {
          const amountInCOP = transaction.amount / 100;
          console.log(
            `   Amount: ${amountInCOP.toFixed(2)} COP (${
              transaction.amount
            } in base 100)`
          );
        }

        if (transaction.currencyCode) {
          console.log(`   Currency Code: ${transaction.currencyCode}`);
        }

        if (transaction.tax) {
          const taxInCOP = transaction.tax / 100;
          console.log(
            `   Tax (IVA): ${taxInCOP.toFixed(2)} COP (${
              transaction.tax
            } in base 100)`
          );
        }

        if (transaction.referenceNumber) {
          console.log(`   Reference: ${transaction.referenceNumber}`);
        }

        if (transaction.channel) {
          console.log(`   Channel: ${transaction.channel}`);
        }

        if (transaction.transactionPurpose) {
          console.log(`   Purpose: ${transaction.transactionPurpose}`);
        }
      }

      // Display recipient information
      if (custom["recipient"] && typeof custom["recipient"] === "object") {
        const recipient = custom["recipient"] as any;
        console.log("\n👤 Recipient Details:");

        if (recipient.aliasValue) {
          console.log(`   Alias Value: ${recipient.aliasValue}`);
        }

        if (recipient.aliasType) {
          console.log(`   Alias Type: ${recipient.aliasType}`);
        }

        if (recipient.name) {
          console.log(`   Name: ${recipient.name}`);
        }

        if (recipient.city) {
          console.log(`   City: ${recipient.city}`);
        }

        if (recipient.categoryCode) {
          console.log(`   Category Code (MCC): ${recipient.categoryCode}`);
        }
      }

      // Display remitant information
      if (custom["remitant"] && typeof custom["remitant"] === "object") {
        const remitant = custom["remitant"] as any;
        console.log("\n📤 Remitant Details:");

        if (remitant.name) {
          console.log(`   Name: ${remitant.name}`);
        }

        if (remitant.city) {
          console.log(`   City: ${remitant.city}`);
        }
      }

      // Display method options
      if (
        custom["methodOptions"] &&
        typeof custom["methodOptions"] === "object"
      ) {
        const methodOptions = custom["methodOptions"] as any;
        console.log("\n⚙️  Method Options:");

        if (methodOptions.subtype) {
          console.log(`   Subtype: ${methodOptions.subtype}`);
        }

        if (methodOptions.duration) {
          const duration = methodOptions.duration as number;
          const hours = duration / 3600;
          const days = hours / 24;
          console.log(
            `   Duration: ${duration} seconds (${hours.toFixed(
              2
            )} hours / ${days.toFixed(2)} days)`
          );
        }
      }
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Error reading anchor:", error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const handle = args[1]; // Optional handle for get command

  if (!command) {
    console.log("Usage: ts-node test-payment-methods.ts <command> [handle]");
    console.log("\nAvailable commands:");
    console.log("  createQRIndividual  - Create a QR code for individual");
    console.log("  createQRMerchant    - Create a QR code for merchant");
    console.log("  createDynamicKey    - Create a dynamic key");
    console.log("  createPaymentLink   - Create a payment link");
    console.log("  get <handle>        - Get a payment method anchor");
    console.log("\nExamples:");
    console.log("  ts-node test-payment-methods.ts createQRIndividual");
    console.log("  ts-node test-payment-methods.ts createQRMerchant");
    console.log("  ts-node test-payment-methods.ts createDynamicKey");
    console.log("  ts-node test-payment-methods.ts createPaymentLink");
    console.log("  ts-node test-payment-methods.ts get <anchor-handle>");
    return;
  }

  try {
    switch (command) {
      case "createQRIndividual":
        await createQRIndividual();
        break;

      case "createQRMerchant":
        await createQRMerchant();
        break;

      case "createDynamicKey":
        await createDynamicKey();
        break;

      case "createPaymentLink":
        await createPaymentLink();
        break;

      case "get":
        if (!handle) {
          console.error("❌ Please provide an anchor handle");
          console.log("Usage: ts-node test-payment-methods.ts get <handle>");
          return;
        }
        await getAnchor(handle);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log(
          "Available commands: createQRIndividual, createQRMerchant, createDynamicKey, createPaymentLink, get"
        );
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
