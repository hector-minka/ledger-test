# Minka API Authentication

This guide explains how to implement authentication for the Minka API, including hash generation, digital signatures, and JWT tokens.

> **🔍 Security Flow**: For a visual overview of the authentication process, see [Authentication Flow Guide](./authentication-flow.md)

## Quick Start

### 1. Install Dependencies

```bash
npm install crypto @minka/ledger-sdk jose @noble/ed25519 base64url safe-stable-stringify
```

### 2. Generate .der File

```bash
minka signer export --input private-key.pem --output your-key.der --format der
```

### 3. Basic Configuration

```typescript
const SIGNER = "your-signer-name";
const PUBLIC_KEY = "dGVzdF9wdWJsaWNfa2V5X2Jhc2U2NF9zdHJpbmc="; // Example key
const SECRET_KEY = "dGVzdF9wcml2YXRlX2tleV9iYXNlNjRfc3RyaW5n"; // Example key
const LEDGER = "your-ledger-name";
const SERVER = "https://ldg-stg.one/api/v2";
```

## Implementation Steps

### Step 1: Data Hashing

```typescript
import stringify from "safe-stable-stringify";
import crypto from "crypto";

function createHash(data: any): string {
  const serialized = stringify(data);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

const hash = createHash(yourData);
```

### Step 2: Signature Digest

```typescript
function createSignatureDigest(dataHash: string, custom?: any): string {
  const serializedCustom = custom ? stringify(custom) : "";
  return crypto
    .createHash("sha256")
    .update(dataHash + serializedCustom)
    .digest("hex");
}

const signatureDigest = createSignatureDigest(hash, {
  moment: "2025-01-03T10:10:31.616Z",
  status: "created",
});
```

### Step 3: Digital Signing

```typescript
import fs from "fs";

function getPrivateKey() {
  const keyDer = fs.readFileSync("your-key.der");
  return crypto.createPrivateKey({
    key: keyDer,
    format: "der",
    type: "pkcs8",
  });
}

const digestBuffer = Buffer.from(signatureDigest, "hex");
const privateKey = getPrivateKey();
const signatureBase64 = crypto
  .sign(undefined, digestBuffer, privateKey)
  .toString("base64");
```

### Step 4: Create Proof Object

```typescript
const proof = {
  method: "ed25519-v2",
  custom: { moment: "2025-01-03T10:10:31.616Z", status: "created" },
  digest: signatureDigest,
  public: PUBLIC_KEY,
  result: signatureBase64,
};
```

### Step 5: Generate JWT

```typescript
import { signJWT } from "./jwt-auth";

const jwt = await signJWT(
  {
    iss: SIGNER,
    sub: `signer:${SIGNER}`,
    aud: LEDGER,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
  SECRET_KEY,
  PUBLIC_KEY
);
```

## Complete Example

```typescript
import axios from "axios";
import crypto from "crypto";
import fs from "fs";
import { createHash, createSignatureDigest } from "./hash";
import { signJWT } from "./jwt-auth";

export const createIntent = async (data: any) => {
  try {
    // 1. Hash the data
    const hash = createHash(data);

    // 2. Create signature digest
    const signatureDigest = createSignatureDigest(hash, {
      moment: new Date().toISOString(),
      status: "created",
    });

    // 3. Sign the digest
    const digestBuffer = Buffer.from(signatureDigest, "hex");
    const privateKey = getPrivateKey();
    const signatureBase64 = crypto
      .sign(undefined, digestBuffer, privateKey)
      .toString("base64");

    // 4. Create proof
    const proof = {
      method: "ed25519-v2",
      custom: { moment: new Date().toISOString(), status: "created" },
      digest: signatureDigest,
      public: PUBLIC_KEY,
      result: signatureBase64,
    };

    // 5. Generate JWT
    const jwt = await signJWT(
      {
        iss: SIGNER,
        sub: `signer:${SIGNER}`,
        aud: LEDGER,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      SECRET_KEY,
      PUBLIC_KEY
    );

    // 6. Send request
    const response = await axios.post(
      `${SERVER}/intents`,
      {
        data,
        hash,
        meta: { proofs: [proof] },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-ledger": LEDGER,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};
```

## Request Structure

```typescript
const request = {
  data: {
    handle: "unique-handle-12345",
    claims: [
      {
        action: "transfer",
        source: {
          handle: "svgs:123456789@bank.com",
          custom: {
            documentNumber: "123456789",
            documentType: "txid",
            entityType: "business",
            name: "Business Name",
          },
        },
        target: {
          handle: "svgs:987654321@bank.com",
          custom: {
            accountRef: "1234567890",
            documentNumber: "987654321",
            documentType: "txid",
            entityType: "individual",
            name: "Person Name",
          },
        },
        symbol: { handle: "usd" },
        amount: 1000,
      },
    ],
    schema: "b2p-send",
    access: [
      {
        action: "any",
        signer: { public: PUBLIC_KEY },
      },
    ],
    config: { commit: "auto" },
  },
  hash: "generated-hash",
  meta: {
    proofs: [proof],
  },
};
```

## Common Errors

| Error                                | Solution                                 |
| ------------------------------------ | ---------------------------------------- |
| `Unexpected raw private key length`  | Ensure private key has 64 hex characters |
| `Invalid pkcs5 encrypted key format` | Regenerate .der file with minka signer   |
| `JWT signing failed`                 | Verify key compatibility                 |
| `serializeData: failed to stringify` | Check for circular references            |

## Security Notes

- Never hardcode private keys in production
- Use environment variables for sensitive data
- Validate all input data before processing
- Implement proper error handling and logging
- Use HTTPS for all API communications

## Testing

```typescript
// Test hash consistency
test("should create consistent hash", () => {
  const data = { test: "data" };
  const hash1 = createHash(data);
  const hash2 = createHash(data);
  expect(hash1).toBe(hash2);
});

// Test signature validation
test("should validate signature", () => {
  const data = { test: "data" };
  const hash = createHash(data);
  const digest = createSignatureDigest(hash, { status: "test" });
  expect(digest).toBeDefined();
  expect(digest.length).toBe(64);
});
```

This authentication flow ensures secure communication with the Minka API through cryptographic signatures and JWT tokens.
