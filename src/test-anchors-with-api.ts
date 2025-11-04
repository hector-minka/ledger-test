import axios from "axios";
import crypto from "crypto";
import dayjs from "dayjs";
import fs from "fs";
import util from "util";
import { createHash, createSignatureDigest } from "./hash";
import { signJWT } from "./jwt-auth";

// Configuration constants
// const SIGNER = "htorohn";
// const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
// const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
// const LEDGER = "payment-hub-staging";
const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";
// const AUDIENCE = "payments-hub-hector-test";
// const AUDIENCE = "payment-hub-staging";

const LEDGER = "alianza-stg";
const AUDIENCE = "alianza-stg";
// Llaves Alianza
// const SIGNER = "alianza-bridge";
// const PUBLIC_KEY = "bBIoixdgfoRkT6doMqA04bU0Maa02fiimVvmufo1cQA=";
// const SECRET_KEY = "vyFN95ZVwv0_ZXigHFvIL3-Hc0n4fzezci32D8UsJz8=";

const SIGNER = "alianza_stg";
const PUBLIC_KEY = "qDHTI5K69OEVUvdYqmhnp7ZIJfou6tJTwTa3cgqz/as=";
const SECRET_KEY = "PWinr3kv7wI46SlfNLHJZu54IO2aann4H8hHYr3Ij/s=";

const keyPair = {
  format: "ed25519-raw" as const,
  public: PUBLIC_KEY,
  secret: SECRET_KEY,
};

const getPrivateKey = () => {
  const keyDer = fs.readFileSync("htorohn-key.der");
  return crypto.createPrivateKey({
    key: keyDer,
    format: "der",
    type: "pkcs8",
  });
};

// Helper function to create JWT token
const createJWT = async () => {
  return await signJWT(
    {
      iss: SIGNER,
      sub: `signer:${SIGNER}`,
      aud: AUDIENCE,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    SECRET_KEY,
    PUBLIC_KEY
  );
};

// Helper function to create signature
const createSignature = (data: any, customData: any) => {
  const hash = createHash(data);
  const signatureDigest = createSignatureDigest(hash, customData);
  const digestBuffer = Buffer.from(signatureDigest, "hex");
  const privateKey = getPrivateKey();
  const signatureBase64 = crypto
    .sign(undefined, digestBuffer, privateKey)
    .toString("base64");

  return {
    hash,
    signatureDigest,
    signatureBase64,
  };
};

// Create Anchor using direct API
export async function createAnchor() {
  try {
    console.log("🔄 Creating anchor with direct API...");

    const anchorData = {
      handle: "@htorohn3",
      target: "svgs:19345654998@bancorojo.co",
      symbol: "cop",
      custom: {
        aliasType: "username",
        documentType: "cc",
        documentNumber: "0801198608",
        accountType: "svgs",
        accountNumber: "123457",
        firstName: "Hector",
        secondName: "Alfredo",
        lastName: "Toro",
        secondLastName: "del Cid",
        participantCode: "891234918",
        routingCode: "TFY",
      },
      schema: "individual",
    };

    const signatureCustom = {
      domain: null,
      status: "active",
      moment: "2025-04-14T14:23:45.123Z",
      consented: "2025-04-14T14:23:45.123Z",
      received: "2025-04-14T14:23:45.123Z",
      dispatched: "2025-04-14T14:23:45.123Z",
    };

    const { hash, signatureDigest, signatureBase64 } = createSignature(
      anchorData,
      signatureCustom
    );

    const request = {
      data: anchorData,
      hash,
      meta: {
        labels: ["ndin:0801198607268"],
        proofs: [
          {
            method: "ed25519-v2",
            custom: signatureCustom,
            digest: signatureDigest,
            public: keyPair.public,
            result: signatureBase64,
          },
        ],
      },
    };

    const jwt = await createJWT();

    const response = await axios.post(`${SERVER}/anchors`, request, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("✅ Anchor created successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error creating anchor:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Get Anchor using direct API
export async function getAnchor() {
  try {
    console.log("🔍 Getting anchor with direct API...");

    const jwt = await createJWT();
    const handle = "@htorohn";
    const response = await axios.get(`${SERVER}/anchors/${handle}`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        "x-received": "2025-04-14T14:23:45.123Z",
        "x-dispatched": "2025-04-14T14:23:45.123Z",
        Authorization: `Bearer ${jwt}`,
        "x-use-case": "p2p",
        "x-domain": "TFY",
      },
    });

    console.log("✅ Anchor retrieved successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error getting anchor:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// List Anchors using direct API
export async function getAnchors() {
  try {
    console.log("📋 Listing anchors with direct API...");

    const jwt = await createJWT();

    const params = {
      "meta.labels": "nidn:0801198607268",
    };

    const response = await axios.get(`${SERVER}/anchors`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
        "x-use-case": "p2p",
        "x-domain": "TFY",
      },
      params,
    });

    console.log("✅ Anchors listed successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error listing anchors:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Update Anchor Status using direct API
export async function updateAnchorStatus() {
  try {
    console.log("✅ Updating anchor status to active with direct API...");

    // First, get the existing anchor
    const jwt = await createJWT();
    // const getResponse = await axios.get(`${SERVER}/anchors/3107944087`, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-ledger": LEDGER,
    //     Authorization: `Bearer ${jwt}`,
    //   },
    // });
    const anchorHandle = "3107944087";
    const getResponse = await axios.get(`${SERVER}/anchors/${anchorHandle}`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
        "x-received": dayjs().toISOString(),
        "x-dispatched": dayjs().toISOString(),
        "x-domain": "transfiya",
        "x-use-case": "send.b2p",
      },
    });
    const existingAnchor = getResponse.data.data;
    console.log("EXISTING ANCHOR:", existingAnchor);
    const signatureCustom = {
      status: "SUSPENDED",
      moment: "2025-04-14T14:23:45.123Z",
      domain: "transfiya",
    };

    // const { hash, signatureDigest, signatureBase64 } = createSignature(
    //   JSON.parse(JSON.stringify(existingAnchor.data)),
    //   signatureCustom
    // );

    // const existingAnchor = getResponse.data.data;
    const existingHash = getResponse.data.hash;
    // const existingLuid = getResponse.data.luid;

    // Calculate hash for the drop operation data
    const updateData = {
      parent: existingHash, // Reference to previous state
    };
    // You need to calculate the hash of this drop data
    const newHash = createHash(updateData); // Use your hash function

    // const signatureCustom = {
    //   status: "CANCELLED",
    //   moment: "2025-04-15T14:23:45.123Z", // or use new Date().toISOString()
    // };

    // Use the existing hash for the signature digest
    const signatureDigest = createSignatureDigest(newHash, signatureCustom);

    const digestBuffer = Buffer.from(signatureDigest, "hex");
    const privateKey = getPrivateKey();
    const signatureBase64 = crypto
      .sign(undefined, digestBuffer, privateKey)
      .toString("base64");

    const request = {
      data: existingAnchor.data,
      hash: newHash,
      meta: {
        ...existingAnchor.meta,
        proofs: [
          {
            method: "ed25519-v2",
            custom: signatureCustom,
            digest: signatureDigest,
            public: keyPair.public,
            result: signatureBase64,
          },
        ],
      },
    };

    const response = await axios.put(
      `${SERVER}/anchors/${anchorHandle}`,
      request,
      {
        headers: {
          "Content-Type": "application/json",
          "x-ledger": LEDGER,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    console.log("✅ Anchor status updated successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error updating anchor status:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Update Anchor Status to Inactive using direct API
export async function updateAnchorStatus2() {
  try {
    console.log("❌ Updating anchor status to inactive with direct API...");

    // First, get the existing anchor
    const jwt = await createJWT();
    const getResponse = await axios.get(`${SERVER}/anchors/carlos5@minka.io`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
      },
    });

    const existingAnchor = getResponse.data.data;

    const signatureCustom = {
      status: "INACTIVE",
      moment: "2025-04-14T14:23:45.123Z",
    };

    const { hash, signatureDigest, signatureBase64 } = createSignature(
      existingAnchor.data,
      signatureCustom
    );

    const request = {
      data: existingAnchor.data,
      hash,
      meta: {
        ...existingAnchor.meta,
        proofs: [
          {
            method: "ed25519-v2",
            custom: signatureCustom,
            digest: signatureDigest,
            public: keyPair.public,
            result: signatureBase64,
          },
        ],
      },
    };

    const response = await axios.put(
      `${SERVER}/anchors/carlos5@minka.io`,
      request,
      {
        headers: {
          "Content-Type": "application/json",
          "x-ledger": LEDGER,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    console.log("✅ Anchor status updated to inactive successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error updating anchor status:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Drop Anchor using direct API
export async function dropAnchor() {
  try {
    console.log("🗑️ Dropping anchor with direct API...");

    const handle = "@htorohn";

    // // First, get the existing anchor to get its current data and hash
    const jwt = await signJWT(
      {
        iss: SIGNER,
        sub: `signer:${SIGNER}`,
        aud: LEDGER,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      SECRET_KEY,
      PUBLIC_KEY
    );
    const getResponse = await axios.get(`${SERVER}/anchors/${handle}`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
        // tyesting new headers
        "x-use-case": "send.b2p",
        "x-domain": "TFY",
      },
    });

    console.log(
      "GET RESPONSE:",
      util.inspect(getResponse.data, { depth: null, colors: true })
    );

    // const existingAnchor = getResponse.data.data;
    const existingHash = getResponse.data.hash;
    const existingLuid = getResponse.data.luid;

    // Calculate hash for the drop operation data
    const dropData = {
      parent: existingHash, // Reference to previous state
    };
    // You need to calculate the hash of this drop data
    const newHash = createHash(dropData); // Use your hash function

    const signatureCustom = {
      status: "CANCELLED",
      moment: "2025-04-15T14:23:45.123Z", // or use new Date().toISOString()
    };

    // Use the existing hash for the signature digest
    const signatureDigest = createSignatureDigest(newHash, signatureCustom);

    const digestBuffer = Buffer.from(signatureDigest, "hex");
    const privateKey = getPrivateKey();
    const signatureBase64 = crypto
      .sign(undefined, digestBuffer, privateKey)
      .toString("base64");

    const proofData = {
      method: "ed25519-v2",
      public: keyPair.public,
      digest: signatureDigest,
      result: signatureBase64,
      custom: signatureCustom,
    };

    const request = {
      luid: existingLuid,
      data: dropData,
      hash: newHash,
      meta: {
        ...getResponse.data.meta,
        proofs: [proofData], // Only include the new proof for the drop operation
      },
    };

    console.log(
      "REQUEST:",
      util.inspect(request, { depth: null, colors: true })
    );
    const response = await axios.delete(`${SERVER}/anchors/${handle}`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
      },
      data: request,
    });

    console.log("✅ Anchor dropped successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error dropping anchor:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Update Anchor Data using direct API
export async function updateAnchorData() {
  try {
    console.log("📝 Updating anchor data with direct API...");

    // First, get the existing anchor
    const jwt = await createJWT();
    const getResponse = await axios.get(
      `${SERVER}/anchors/carlos129833da@minka.io`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-ledger": LEDGER,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const existingAnchor = getResponse.data.data;
    const updateData = {
      ...existingAnchor.data,
      custom: {
        ...existingAnchor.data.custom,
        firstName: "Carlo111114",
      },
    };

    const signatureCustom = {
      status: "UPDATE",
      moment: "2025-04-14T14:23:45.123Z",
    };

    const { hash, signatureDigest, signatureBase64 } = createSignature(
      updateData,
      signatureCustom
    );

    const request = {
      data: updateData,
      hash,
      meta: {
        ...existingAnchor.meta,
        proofs: [
          {
            method: "ed25519-v2",
            custom: signatureCustom,
            digest: signatureDigest,
            public: keyPair.public,
            result: signatureBase64,
          },
        ],
      },
    };

    const response = await axios.put(
      `${SERVER}/anchors/carlos129833da@minka.io`,
      request,
      {
        headers: {
          "Content-Type": "application/json",
          "x-ledger": LEDGER,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    console.log("✅ Anchor data updated successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error updating anchor data:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Sign Anchor using direct API
export async function signAnchor() {
  try {
    console.log("✍️ Signing anchor with direct API...");
    const handle = "@htorohn3";
    // First, get the existing anchor
    // const jwt = await createJWT();
    const jwt = await signJWT(
      {
        iss: SIGNER,
        sub: `signer:${SIGNER}`,
        aud: LEDGER,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      SECRET_KEY,
      PUBLIC_KEY
    );
    const getResponse = await axios.get(`${SERVER}/anchors/${handle}`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
        // tyesting new headers
        // "x-use-case": "p2p",
      },
    });
    const existingAnchor = getResponse.data.data;

    if (!existingAnchor) {
      throw new Error(
        "Anchor data not found in response. The anchor might not exist or the response structure is different."
      );
    }

    const signatureCustom = {
      status: "ACTIVE",
      moment: new Date().toISOString(),
      operation: "verification",
    };

    // Use the correct endpoint for adding proofs: POST /anchors/{id}/proofs
    const existingHash = getResponse.data.hash;
    const signatureDigest = createSignatureDigest(
      existingHash,
      signatureCustom
    );

    const digestBuffer = Buffer.from(signatureDigest, "hex");
    const privateKey = getPrivateKey();
    const signatureBase64 = crypto
      .sign(undefined, digestBuffer, privateKey)
      .toString("base64");

    const proofData = {
      method: "ed25519-v2",
      public: keyPair.public,
      digest: signatureDigest,
      result: signatureBase64,
      custom: signatureCustom,
    };

    const response = await axios.post(
      `${SERVER}/anchors/${handle}/proofs`,
      proofData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-ledger": LEDGER,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    console.log("✅ Anchor signed successfully!");
    console.log(
      "Response:",
      util.inspect(response.data, { depth: null, colors: true })
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error signing anchor:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(
      "Usage: npm run ts-node src/test-anchors-with-api.ts <command>"
    );
    console.log("Available commands:");
    console.log("  createAnchor        - Create a new anchor using direct API");
    console.log(
      "  getAnchor          - Get an existing anchor using direct API"
    );
    console.log(
      "  getAnchors         - List anchors with filters using direct API"
    );
    console.log(
      "  updateAnchorStatus - Update anchor status to active using direct API"
    );
    console.log(
      "  updateAnchorStatus2- Update anchor status to inactive using direct API"
    );
    console.log(
      "  dropAnchor         - Drop/cancel an anchor using direct API"
    );
    console.log("  updateAnchorData   - Update anchor data using direct API");
    console.log(
      "  signAnchor         - Sign an existing anchor using direct API"
    );
    return;
  }

  try {
    switch (command) {
      case "createAnchor":
        console.log("🔄 Creating anchor with direct API...");
        await createAnchor();
        break;
      case "getAnchor":
        console.log("🔍 Getting anchor with direct API...");
        await getAnchor();
        break;
      case "getAnchors":
        console.log("📋 Listing anchors with direct API...");
        await getAnchors();
        break;
      case "updateAnchorStatus":
        console.log("✅ Updating anchor status to active with direct API...");
        await updateAnchorStatus();
        break;
      case "updateAnchorStatus2":
        console.log("❌ Updating anchor status to inactive with direct API...");
        await updateAnchorStatus2();
        break;
      case "dropAnchor":
        console.log("🗑️ Dropping anchor with direct API...");
        await dropAnchor();
        break;
      case "updateAnchorData":
        console.log("📝 Updating anchor data with direct API...");
        await updateAnchorData();
        break;
      case "signAnchor":
        console.log("✍️ Signing anchor with direct API...");
        await signAnchor();
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log(
          "Available commands: createAnchor, getAnchor, getAnchors, updateAnchorStatus, updateAnchorStatus2, dropAnchor, updateAnchorData, signAnchor"
        );
    }
  } catch (error: any) {
    console.error(
      "❌ Error executing command:",
      util.inspect(error?.response?.data || error, {
        depth: null,
        colors: true,
      })
    );
  }
}

// Export functions for individual use
// export { getAnchor };

// Run main function if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
