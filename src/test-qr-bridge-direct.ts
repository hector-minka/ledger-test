import axios from "axios";
import * as fs from "fs";
import * as path from "path";

// Configuration - Update these values based on your setup
const BRIDGE_BASE_URL = "http://localhost:3000";
const BRIDGE_ENDPOINT = `${BRIDGE_BASE_URL}/api/v1/qr/generate`;

/**
 * Generate a QR code by calling the bridge endpoint directly
 * This bypasses the ledger and calls the bridge API directly
 */
export async function generateQrDirect(dynamic: boolean = true) {
  // Create anchor data structure (same as ledger format)
  const anchorData = {
    data: {
      handle: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      target: "target:test-account",
      schema: "transfiya-qr-code",
      custom: dynamic
        ? {
            // Dynamic QR Code
            pointOfInitiationMethod: "DINAMICO",
            merchantAccountInformation: {
              aliasType: "CELULAR", // IDENTIFICACION, CELULAR, EMAIL, TEXT, MERCHANTID
              aliasValue: "+573001234567", // The "llave" - this goes to EMVco field 26-01
              merchantCode: "MERCH-001", // Optional merchant code
            },
            merchantName: "Test Merchant",
            merchantCity: "Bogotá",
            postalCode: "110111",
            merchantCategoryCode: "5411", // MCC code
            additionalMerchantInformation: {
              terminal: "TERM-001",
              transactionPorpose: "COMPRAS", // COMPRAS, ANULACIONES, TRANSFERENCIAS, RETIRO, RECAUDO, RECARGAS, DEPOSITO
            },
            transaction: {
              amount: "50000.00", // Transaction amount (required for dynamic)
            },
            customData: {
              valorIva: "9500.00",
              baseIva: "50000.00",
              valorInc: "0.00",
            },
            idQr: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            channel: "POS", // IM, POS, APP, ECOMM, MPOS, ATM, CB, OFC
          }
        : {
            // Static QR Code
            pointOfInitiationMethod: "ESTATICO",
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
            transaction: {
              amount: "0.00", // Static QR - amount is optional
            },
            idQr: `QR-STATIC-${Date.now()}`,
            channel: "APP",
          },
    },
    // Optional fields - not required for direct bridge call
    hash: undefined,
    status: undefined,
    meta: undefined,
  };

  try {
    console.log("🔄 Calling QR Bridge directly...");
    console.log("📍 Endpoint:", BRIDGE_ENDPOINT);
    console.log("📋 Anchor data:", JSON.stringify(anchorData, null, 2));

    const response = await axios.post(
      BRIDGE_ENDPOINT,
      { anchor: anchorData },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log("✅ QR code generated successfully!");
    console.log("📊 Response status:", response.status);
    console.log("\n📱 QR Code Details:");
    console.log(
      "  - Payload length:",
      response.data.qrPayload?.length || 0,
      "characters"
    );
    console.log(
      "  - Image base64 length:",
      response.data.qrImage?.length || 0,
      "characters"
    );
    console.log("  - Anchor handle:", response.data.anchor?.data?.handle);

    // Display QR payload (first 100 chars)
    if (response.data.qrPayload) {
      console.log("\n📄 QR Payload (first 100 chars):");
      console.log("  ", response.data.qrPayload);
    }

    // Display QR JSON structure
    if (response.data.qrJson) {
      console.log("\n📋 QR JSON Structure:");
      console.log(JSON.stringify(response.data.qrJson, null, 2));
    }

    // Save QR image to file
    if (response.data.qrImage) {
      const imageBuffer = Buffer.from(response.data.qrImage, "base64");
      const filename = `qr-${Date.now()}.png`;
      const filepath = path.join(process.cwd(), filename);
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`\n💾 QR base64: ${response.data.qrImage}`);
      console.log(`\n💾 QR image saved to: ${filepath}`);
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Error calling QR Bridge:");

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("❌ Response status:", error.response.status);
      console.error(
        "❌ Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ No response received from server");
      console.error("❌ Request details:", error.request);
      console.error(
        "\n💡 Make sure the QR Bridge is running on:",
        BRIDGE_BASE_URL
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("❌ Error:", error.message);
    }

    throw error;
  }
}

/**
 * Generate a Dynamic QR Code
 */
export async function generateDynamicQr() {
  return generateQrDirect(true);
}

/**
 * Generate a Static QR Code
 */
export async function generateStaticQr() {
  return generateQrDirect(false);
}

/**
 * Get QR code by anchor handle (if it was previously generated and saved)
 */
export async function getQrByAnchorHandle(handle: string) {
  try {
    const url = `${BRIDGE_BASE_URL}/api/v1/qr/by-anchor/${encodeURIComponent(
      handle
    )}`;
    console.log("🔍 Fetching QR code by anchor handle...");
    console.log("📍 Endpoint:", url);

    const response = await axios.get(url, {
      timeout: 15000,
    });

    console.log("✅ QR code retrieved successfully!");
    console.log("📊 Response status:", response.status);
    console.log("\n📱 QR Code Details:");
    console.log(
      "  - Payload length:",
      response.data.qrPayload?.length || 0,
      "characters"
    );
    console.log(
      "  - Image base64 length:",
      response.data.qrImage?.length || 0,
      "characters"
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching QR code:");

    if (error.response) {
      console.error("❌ Response status:", error.response.status);
      console.error(
        "❌ Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      console.error("❌ No response received from server");
      console.error(
        "\n💡 Make sure the QR Bridge is running on:",
        BRIDGE_BASE_URL
      );
    } else {
      console.error("❌ Error:", error.message);
    }

    throw error;
  }
}

/**
 * Get QR code image as binary PNG file
 */
export async function getQrImageByAnchorHandle(
  handle: string,
  savePath?: string
) {
  try {
    const url = `${BRIDGE_BASE_URL}/api/v1/qr/by-anchor/${encodeURIComponent(
      handle
    )}/image`;
    console.log("🖼️  Fetching QR code image...");
    console.log("📍 Endpoint:", url);

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
    });

    console.log("✅ QR code image retrieved successfully!");
    console.log("📊 Response status:", response.status);
    console.log("📦 Image size:", response.data.length, "bytes");

    if (savePath) {
      fs.writeFileSync(savePath, response.data);
      console.log(`💾 Image saved to: ${savePath}`);
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching QR image:");

    if (error.response) {
      console.error("❌ Response status:", error.response.status);
      if (error.response.status === 404) {
        console.error(
          "❌ QR code not found. Make sure the anchor handle exists."
        );
      }
    } else if (error.request) {
      console.error("❌ No response received from server");
      console.error(
        "\n💡 Make sure the QR Bridge is running on:",
        BRIDGE_BASE_URL
      );
    } else {
      console.error("❌ Error:", error.message);
    }

    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const handle = args[1]; // Optional handle for get commands

  if (!command) {
    console.log("Usage: ts-node test-qr-bridge-direct.ts <command> [options]");
    console.log("\nAvailable commands:");
    console.log("  generate      - Generate a dynamic QR code");
    console.log("  generateStatic - Generate a static QR code");
    console.log("  get <handle>   - Get QR code by anchor handle");
    console.log("  image <handle> [savePath] - Get QR image as PNG file");
    console.log("\nEnvironment variables:");
    console.log(
      "  BRIDGE_URL - Base URL of the QR Bridge (default: http://localhost:3000)"
    );
    return;
  }

  try {
    switch (command) {
      case "generate":
        await generateDynamicQr();
        break;

      case "generateStatic":
        await generateStaticQr();
        break;

      case "get":
        if (!handle) {
          console.error("❌ Please provide an anchor handle");
          console.log("Usage: ts-node test-qr-bridge-direct.ts get <handle>");
          return;
        }
        await getQrByAnchorHandle(handle);
        break;

      case "image":
        if (!handle) {
          console.error("❌ Please provide an anchor handle");
          console.log(
            "Usage: ts-node test-qr-bridge-direct.ts image <handle> [savePath]"
          );
          return;
        }
        const savePath = args[2] || `qr-image-${Date.now()}.png`;
        await getQrImageByAnchorHandle(handle, savePath);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log("Available commands: generate, generateStatic, get, image");
    }
  } catch (error: any) {
    console.error("❌ Error executing command:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
