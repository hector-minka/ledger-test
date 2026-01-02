import { LedgerSdk } from "@minka/ledger-sdk";
import { LedgerKeyPair } from "@minka/ledger-sdk/types";
import * as util from "util";
// Utility function for ISO timestamp
function generateISOTimestamp(): string {
  return new Date().toISOString();
}

const AUDIENCE = "qr-demo";
// const AUDIENCE = "ph-gnb-payments";
// const AUDIENCE = "qr-demo";
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
// const LEDGER = "qr-demo";
// const LEDGER = "ph-gnb-payments";
const LEDGER = "qr-demo";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "Gy7CbTDCYcG5NEhs6lCw3Nlrz2yGo6UHCsCXQU0eR7M=";

/**
* Instructions to execute the script:
* createQR: creates a QR Code anchor in Minka Ledger
* modify the anchor data to the desired values in the createQR function
* execute the script with the command: ts-node test-qr-code.ts createQR
* 
* createDynamicKey: creates a Dynamic Key anchor in Minka Ledger
* modify the anchor data to the desired values in the createDynamicKey function
* execute the script with the command: ts-node test-qr-code.ts createDynamicKey
* 
* getAnchor: gets an anchor from Minka Ledger
* execute the script with the command: ts-node test-qr-code.ts getAnchor <handle> | <qr-payload in single quotes>
* 
* disable: disables an anchor from Minka Ledger
* execute the script with the command: ts-node test-qr-code.ts disable <handle>

*/

/**
 * Create a QR Code anchor in Minka Ledger
 * This will trigger the webhook to the QR Bridge which will generate the QR code
 */
export async function createQR() {
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
  //   const transactionAmount = 100000; // 50000.00 COP in base 100
  //   const taxAmount = 0; // 9500.00 COP in base 100 (optional)

  const anchorData = {
    handle: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    target: "target:test-account",
    schema: "qr-code",
    // custom: {
    //   // Transaction details (required)
    //   paymentReference: {
    //     amount: transactionAmount, // Transaction amount in base 100 (required for dynamic QR)
    //     currencyCode: "170", // COP (Colombian Peso) - ISO 4217 code for Colombia
    //     tax: taxAmount, // IVA amount in base 100 (optional)
    //     referenceNumber: "INV-2024-001", // Merchant reference (optional)
    //     channel: "POS", // IM, POS, APP, ECOMM, MPOS, ATM, CB, OFC (optional)
    //     paymentReferencePurpose: "COMPRAS", // COMPRAS, ANULACIONES, TRANSFERENCIAS, RETIRO, RECAUDO, RECARGAS, DEPOSITO (optional)
    //     terminal: "TERM-001", // Terminal label (optional)
    //   },

    //   // Remitant information (optional)
    //   // NOTE: In dynamic QR, aliasType and aliasValue are NOT sent here -
    //   // they are generated dynamically by the external service that the bridge consumes internally
    //   source: {
    //     name: "Test Merchant",
    //     documentNumber: "1234567890",
    //     documentType: "CC",
    //     city: "Bogotá",
    //     categoryCode: "5411", // MCC code (4 digits)
    //     countryCode: "CO", // Colombia
    //     postalCode: "110111",
    //   },

    //   // Recipient information (optional)
    //   // NOTE: In dynamic QR, aliasType and aliasValue are NOT sent here -
    //   // they are generated dynamically by the external service that the bridge consumes internally
    //   target: {
    //     // For dynamic QR, these are generated dynamically:
    //     aliasType: "ALPHANUM", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID, NIT, ACCOUNT_NUMBER
    //     aliasValue: "@kamin01",
    //     // merchantCode: "MERCH-001", // Optional merchant code
    //     name: "Kamin",
    //     // documentNumber: "9876543210",
    //     // documentType: "CC",
    //     city: "Medellín",
    //     categoryCode: "0000", // For PN: 0000, for PJ: ISO 18245 values
    //     countryCode: "CO",
    //     postalCode: "050001",
    //   },

    //   // Method options (optional)
    //   methodOptions: {
    //     subtype: "DINAMIC", // DINAMIC or STATIC
    //     duration: 3600, // Duration in seconds from creation time (required for dynamic QR)
    //   },

    //   // Additional metadata (optional)
    //   metadata: {
    //     // Any additional metadata for payment processing
    //   },
    // },

    //ejemplo de custom completo para QR Code
    custom: {
      target: {
        aliasType: "ALPHANUM",
        aliasValue: "@kamin01",
        merchantCode: "MERCH-001",
        name: "Kamin",
        documentNumber: "900123456",
        documentType: "NIT",
        city: "Medellín",
        categoryCode: "5411",
        countryCode: "CO",
        postalCode: "050001",
        nit: "900123456-1",
        aggregatorCode: "AGG-12345",
        storeLabel: "Sucursal Centro",
        loyaltyNumber: "LOY-123456",
        customer: "Juan Pérez",
        language: "es",
        merchantNameLocalized: "Hope Supermarket",
        merchantCityLocalized: "Bogota",
        destinationAccount: "ACC-DESTINO-001",
      },

      source: {
        name: "Source Name",
        documentNumber: "9876543210",
        documentType: "CC",
        city: "Medellín",
        categoryCode: "0000",
        countryCode: "CO",
        postalCode: "050001",
        sourceAccount: "ACC-ORIGEN-001",
      },

      paymentReference: {
        amount: "100000",
        currencyCode: "170",
        // tipIndicator: "01",
        // tipValue: "5000",
        // tipPercentage: "5",
        // ivaCondition: "02",
        // iva: "19000",
        // baseIva: "100000",
        // incCondition: "02",
        // inc: "0",
        // referenceNumber: "FACT-2024-001234",
        // channel: "POS",
        // terminal: "TERM-001",
        // paymentReferencePurpose: "COMPRAS",
        // transactionId: "123456",
        // channelOrigin: "4",
        // reference: "REF-2024-001",
        // referenceOrCellphone: "3001234567",
        // additionalReference: "REF-ADICIONAL-001",
        // serviceCode: "SERV-001",
        // productType: "PROD-001",
        // transferProductType: "TRANSF-001",
        // discounts: {
        //   discountIndicator: "01",
        //   discountAmount: "5000",
        //   discountTaxAmount: "950",
        //   discountPercentage: "10",
        //   discountValue: "10000",
        //   discountQuery: "01",
        // },
      },

      methodOptions: {
        subtype: "DINAMIC",
        duration: 3600,
      },

      metadata: {
        pointOfInitiationMethod: "DINAMICO",
        acquirerNetwork: "ACH",
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
      util.inspect(response.data, {
        depth: null,
        colors: true,
        maxStringLength: Infinity,
      })
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
          maxStringLength: Infinity,
        })
      );
    }

    throw error;
  }
}

/**
 * Create a Dynamic Key anchor in Minka Ledger
 * This will trigger the webhook to the QR Bridge which will generate the dynamic key
 * The handle is auto-generated if not provided: @MERCHCODE + DDMM + SEQUENCE
 */
export async function createDynamicKey(
  merchantCode: string = "MERCH-001",
  sequence: number = 1,
  skipHandle: boolean = false
) {
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

  // Generate handle if not provided: @MERCHCODE + DDMM + SEQUENCE
  // Format: @ + MERCHCODE + DDMM + SEQUENCE
  // Example: @MERCH-0011012001 (for MERCH-001, date 10/12, sequence 001)
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dateStr = day + month; // DDMM format
  const sequenceStr = String(sequence).padStart(3, "0"); // 3-digit sequence
  const generatedHandle = `@${merchantCode}${dateStr}${sequenceStr}`;

  // Dynamic Key anchor data - same structure as QR Code
  // Amount in base 100 (without decimals): 50000.00 COP = 5000000
  const transactionAmount = 5000000; // 50000.00 COP in base 100
  const taxAmount = 950000; // 9500.00 COP in base 100 (optional)

  const anchorData: any = {
    target: "target:test-account",
    schema: "dynamic-key", // Different schema for dynamic keys
    custom: {
      // Transaction details (required)
      paymentReference: {
        amount: transactionAmount, // Transaction amount in base 100 (required for dynamic key)
        currencyCode: "170", // COP (Colombian Peso) - ISO 4217 code for Colombia
        tax: taxAmount, // IVA amount in base 100 (optional)
        referenceNumber: "INV-2024-001", // Merchant reference (optional)
        channel: "POS", // IM, POS, APP, ECOMM, MPOS, ATM, CB, OFC (optional)
        paymentReferencePurpose: "COMPRAS", // COMPRAS, ANULACIONES, TRANSFERENCIAS, RETIRO, RECAUDO, RECARGAS, DEPOSITO (optional)
        terminal: "TERM-001", // Terminal label (optional)
      },

      // Remitant information (optional)
      source: {
        name: "Test Merchant",
        documentNumber: "1234567890",
        documentType: "CC",
        city: "Bogotá",
        categoryCode: "5411", // MCC code (4 digits)
        countryCode: "CO", // Colombia
        postalCode: "110111",
      },

      // Recipient information (optional)
      target: {
        merchantCode: merchantCode, // Use the provided merchant code
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
        duration: 3600, // Duration in seconds from creation time (required for dynamic key)
      },

      // Additional metadata (optional)
      metadata: {
        // Any additional metadata for payment processing
      },
    },
  };

  // Conditionally add handle only if skipHandle is false
  if (!skipHandle) {
    anchorData.handle = generatedHandle; // Auto-generated: @MERCHCODE + DDMM + SEQUENCE
  }

  try {
    console.log("🔄 Creating Dynamic Key anchor...");
    console.log("📋 Anchor data:", JSON.stringify(anchorData, null, 2));
    if (!skipHandle) {
      console.log("🔑 Generated handle:", generatedHandle);
      console.log("   Format: @MERCHCODE + DDMM + SEQUENCE");
      console.log(
        `   Breakdown: @${merchantCode} + ${dateStr} + ${sequenceStr}`
      );
    } else {
      console.log("⚠️  Handle skipped (skipHandle=true)");
    }

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

    console.log("✅ Dynamic Key anchor created successfully!");
    console.log(
      "📊 Response data:",
      util.inspect(response.data, {
        depth: null,
        colors: true,
        maxStringLength: Infinity,
      })
    );
    console.log("🔗 Anchor handle:", response.data?.data?.handle);
    console.log("📋 Schema:", response.data?.data?.schema);

    // The ledger will automatically forward this to the QR Bridge webhook
    // The bridge will generate the dynamic key and return it

    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating dynamic key anchor:");

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
          maxStringLength: Infinity,
        })
      );
    }

    throw error;
  }
}

// Example usage:
// createDynamicKey("MERCH-001", 1); // Creates: @MERCH-0011012001
// createDynamicKey("MERCH-001", 2); // Creates: @MERCH-0011012002
// createDynamicKey("MERCH-002", 1); // Creates: @MERCH-0021012001
// createDynamicKey("MERCH-001", 1, true); // Creates without handle (skipHandle=true)

// /**
//  * Create a Static QR Code anchor (ESTATICO)
//  */
// export async function createStaticAnchor() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: false,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: PUBLIC_KEY,
//       sub: "signer:htorohn",
//       aud: AUDIENCE,
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   const keyPair: LedgerKeyPair = {
//     format: "ed25519-raw",
//     public: PUBLIC_KEY,
//     secret: SECRET_KEY,
//   };

//   // Static QR Code anchor data according to the Colombia Dynamic QR Code Schema
//   // Note: This uses the same schema structure but with static-specific values
//   const anchorData = {
//     handle: `anchor:transfiya-static-${Date.now()}@minka.io`,
//     target: "target:test-account",
//     custom: {
//       // Transaction details (required)
//       // For static QR, amount can be 0 or omitted (user will enter it manually)
//       transaction: {
//         amount: 0, // Static QR - user enters amount manually
//         currencyCode: "170", // COP (Colombian Peso)
//       },

//       // Remitant information (optional)
//       remitant: {
//         name: "Static Merchant",
//         documentNumber: "1234567890",
//         documentType: "CC",
//         city: "Bogotá",
//         categoryCode: "5411", // MCC code
//         countryCode: "CO",
//         postalCode: "110111",
//       },

//       // Recipient information (optional)
//       // For static QR, aliasType and aliasValue can be provided
//       recipient: {
//         aliasType: "EMAIL", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID, NIT, ACCOUNT_NUMBER
//         aliasValue: "merchant@example.com",
//         merchantCode: "MERCH-STATIC-001",
//         name: "Static Recipient",
//         documentNumber: "9876543210",
//         documentType: "CC",
//         city: "Bogotá",
//         categoryCode: "5411",
//         countryCode: "CO",
//         postalCode: "110111",
//       },

//       // Method options (optional)
//       methodOptions: {
//         subtype: "STATIC", // DINAMIC or STATIC
//         duration: 31536000, // Duration in seconds (optional for static, but can be included - 1 year)
//       },

//       // Additional metadata (optional)
//       metadata: {
//         // Any additional metadata for payment processing
//       },
//     },
//   };

//   try {
//     console.log("🔄 Creating Static QR anchor...");

//     const { response } = await sdk.anchor
//       .init()
//       .data(anchorData)
//       .meta({
//         labels: [],
//         proofs: [],
//       })
//       .hash()
//       .sign([
//         {
//           keyPair,
//           custom: {
//             domain: null,
//             status: "ACTIVE",
//             moment: generateISOTimestamp(),
//           },
//         },
//       ])
//       .send();

//     console.log("✅ Static anchor created successfully!");
//     console.log(
//       "📊 Response data:",
//       util.inspect(response.data, { depth: null, colors: true })
//     );

//     return response.data;
//   } catch (error: any) {
//     console.error("❌ Error creating Static anchor:", error);
//     throw error;
//   }
// }

/**
 * Read a anchor
 */
export async function getAnchor(handle: string) {
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
    // Clean whitespace from handle/payload
    const cleanedHandle = handle.trim().replace(/\s+/g, "");

    console.log(`🔍 Reading anchor: ${cleanedHandle.substring(0, 50)}...`);

    const { response } = await sdk.anchor.read(cleanedHandle);

    console.log(
      "📊 Anchor data:",
      util.inspect(response.data, {
        depth: null,
        colors: true,
        maxStringLength: Infinity,
      })
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

export async function disableAnchor(handle: string) {
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

  const record = (await sdk.anchor.read(handle)).response.data;
  console.log("El Anchor es:", record);

  try {
    console.log("🔄 Disabling QR anchor...");
    //   console.log("📋 Anchor data:", JSON.stringify(anchorData, null, 2));
    console.log("Record data: ", { ...record.data });
    const { response } = await sdk.anchor
      //.with('carlos@minka.io')  ofr  signing for POST ALIAS AND POST INTENT
      .from({ ...record })
      .data({
        ...record.data,
      })
      .hash()
      .sign([
        {
          keyPair,
          custom: {
            status: "INACTIVE",
            moment: generateISOTimestamp(),
          },
        },
      ])
      .send();

    console.log("✅ Anchor disabled successfully!");
    // console.log("📄 Request:", response.request);
    console.log(
      "📊 Response data:",
      util.inspect(response.data, {
        depth: null,
        colors: true,
        maxStringLength: Infinity,
      })
    );
    console.log("🔗 Anchor handle:", response.data?.data?.handle);

    // The ledger will automatically forward this to the QR Bridge webhook
    // The bridge will generate the QR code and return it

    return response.data;
  } catch (error: any) {
    console.error("❌ Error disabling anchor:");

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
          maxStringLength: Infinity,
        })
      );
    }

    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const handle = args[1]; // Optional handle for get command

  if (!command) {
    console.log("Usage: ts-node test-qr-code.ts <command> [arguments]");
    console.log("\nAvailable commands:");
    console.log("  createQR                    - Create a dynamic QR anchor");
    console.log("  createStaticQR              - Create a static QR anchor");
    console.log(
      "  createDynamicKey [merchantCode] [sequence] [skipHandle] - Create a dynamic key anchor"
    );
    console.log("    merchantCode (optional): Default 'MERCH-001'");
    console.log("    sequence (optional): Default 1");
    console.log(
      "    skipHandle (optional): 'true' or 'false', Default 'false'"
    );
    console.log("  getAnchor <handle>          - Get a QR anchor");
    console.log("  disable <handle>             - Disable an anchor");
    return;
  }

  try {
    switch (command) {
      case "createQR":
        await createQR();
        break;
      case "createDynamicKey": {
        const merchantCode = args[1] || "MERCH-001";
        const sequence = args[2] ? parseInt(args[2], 10) : 1;
        const skipHandleStr = args[3]?.toLowerCase();
        const skipHandle = skipHandleStr === "true" || skipHandleStr === "1";

        await createDynamicKey(merchantCode, sequence, skipHandle);
        break;
      }
      //   case "createStaticQR":
      //     await createStaticAnchor();
      //     break;

      case "getAnchor":
        if (!handle) {
          console.error("❌ Please provide an anchor handle");
          console.log("Usage: ts-node test-qr-code.ts getAnchor <handle>");
          return;
        }
        await getAnchor(handle);
        break;
      case "disable":
        if (!handle) {
          console.error("❌ Please provide an anchor handle");
          console.log("Usage: ts-node test-qr-code.ts disable <handle>");
          return;
        }
        await disableAnchor(handle);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log(
          "Available commands: createQR, createStaticQR, createDynamicKey, getAnchor, disable"
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
