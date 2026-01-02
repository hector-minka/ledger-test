# Minka Authentication Implementation Guide

This guide provides a comprehensive walkthrough for implementing authentication in the Minka API, including hash generation, digital signatures, and JWT tokens.

## Overview

The Minka authentication process involves several key steps:

1. Data serialization and hashing
2. Signature digest generation
3. Digital signing with Ed25519
4. Proof object creation
5. JWT token generation

## Prerequisites

- Node.js 16+
- minka signer CLI
- Private key in PEM format

## Installation

```bash
npm install crypto dayjs fs path util
npm install @minka/ledger-sdk
npm install jose @noble/ed25519 base64url safe-stable-stringify
```

## Configuration

### Key Setup

```typescript
// Example configuration with hypothetical keys
const SIGNER = "your-signer-name";
const PUBLIC_KEY = "dGVzdF9wdWJsaWNfa2V5X2Jhc2U2NF9zdHJpbmc="; // Example public key
const SECRET_KEY = "dGVzdF9wcml2YXRlX2tleV9iYXNlNjRfc3RyaW5n"; // Example private key
const LEDGER = "your-ledger-name";
const SERVER = "https://ldg-stg.one/api/v2";

const keyPair = {
  format: "ed25519-raw" as const,
  public: PUBLIC_KEY,
  secret: SECRET_KEY,
};
```

## Step-by-Step Implementation

### 1. Generate .der File from PEM

```bash
# Using minka signer (recommended)
minka signer export --input private-key.pem --output your-key.der --format der

# Alternative using OpenSSL
openssl pkcs8 -topk8 -inform PEM -outform DER -in private-key.pem -out your-key.der -nocrypt
```

### 2. Data Serialization and Hashing

```typescript
import stringify from "safe-stable-stringify";
import crypto from "crypto";

function serializeData(data: any): string {
  const result = stringify(data);
  if (result === undefined) {
    throw new Error("serializeData: failed to stringify input");
  }
  return result;
}

function createHash(data: any): string {
  const serialized = serializeData(data);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

// Usage
const data = {
  handle: "20250103123456789ABC123456789",
  claims: [claim],
  schema: "b2p-send",
  access: getOwnerAccessRules(PUBLIC_KEY),
  config: { commit: "auto" },
};

const hash = createHash(data);
```

### 3. Signature Digest Generation

```typescript
function createSignatureDigest(
  dataHash: string,
  signatureCustom?: Record<string, any>
): string {
  const serializedCustom = signatureCustom
    ? serializeData(signatureCustom)
    : "";
  return crypto
    .createHash("sha256")
    .update(dataHash + serializedCustom)
    .digest("hex");
}

// Usage
const signatureCustom = {
  moment: "2025-01-03T10:10:31.616Z",
  status: "created",
};

const signatureDigest = createSignatureDigest(hash, signatureCustom);
```

### 4. Digital Signing

```typescript
import fs from "fs";
import path from "path";

function getPrivateKey(): crypto.KeyObject {
  const keyDer = fs.readFileSync(path.resolve(__dirname, "../your-key.der"));
  return crypto.createPrivateKey({
    key: keyDer,
    format: "der",
    type: "pkcs8",
  });
}

// Convert to buffer and sign
const digestBuffer = Buffer.from(signatureDigest, "hex");
const privateKey = getPrivateKey();
const signatureBase64 = crypto
  .sign(undefined, digestBuffer, privateKey)
  .toString("base64");
```

### 5. Proof Object Creation

```typescript
const proof = {
  method: "ed25519-v2",
  custom: signatureCustom,
  digest: signatureDigest,
  public: keyPair.public,
  result: signatureBase64,
};
```

### 6. JWT Token Generation

```typescript
import { signJWT } from "./jwt-auth";

async function generateJWT(
  signer: string,
  ledger: string,
  secretKey: string,
  publicKey: string
): Promise<string> {
  const payload = {
    iss: signer,
    sub: `signer:${signer}`,
    aud: ledger,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };

  return await signJWT(payload, secretKey, publicKey);
}

// Usage
const jwt = await generateJWT(SIGNER, LEDGER, SECRET_KEY, PUBLIC_KEY);
```

## Complete Implementation Example

```typescript
import axios from "axios";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createHash, createSignatureDigest } from "./hash";
import { signJWT } from "./jwt-auth";

export const createIntentWithApi = async () => {
  try {
    // 1. Create data hash
    const hash = createHash(data);

    // 2. Create signature digest
    const signatureDigest = createSignatureDigest(hash, signatureCustom);

    // 3. Convert to buffer and sign
    const digestBuffer = Buffer.from(signatureDigest, "hex");
    const privateKey = getPrivateKey();
    const signatureBase64 = crypto
      .sign(undefined, digestBuffer, privateKey)
      .toString("base64");

    // 4. Create proof object
    const proof = {
      method: "ed25519-v2",
      custom: signatureCustom,
      digest: signatureDigest,
      public: PUBLIC_KEY,
      result: signatureBase64,
    };

    // 5. Create request
    const request = {
      data,
      hash,
      meta: { proofs: [proof] },
    };

    // 6. Generate JWT
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

    // 7. Send request
    const response = await axios.post(`${SERVER}/intents`, request, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": LEDGER,
        Authorization: `Bearer ${jwt}`,
      },
    });

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
    handle: "unique-handle",
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
            name: "Individual Name",
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
    proofs: [
      {
        method: "ed25519-v2",
        custom: { moment: "2025-01-03T10:10:31.616Z", status: "created" },
        digest: "signature-digest",
        public: PUBLIC_KEY,
        result: "signature-base64",
      },
    ],
  },
};
```

## Common Use Cases

### Business to Person (B2P) Transfer

```typescript
const b2pClaim = {
  action: "transfer",
  source: {
    handle: "svgs:123456789@business-bank.com",
    custom: {
      documentNumber: "123456789",
      documentType: "txid",
      entityType: "business",
      name: "Business Name",
    },
  },
  target: {
    handle: "svgs:987654321@person-bank.com",
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
};
```

### Person to Person (P2P) Transfer

```typescript
const p2pClaim = {
  action: "transfer",
  source: {
    handle: "svgs:111111111@bank.com",
    custom: {
      documentNumber: "111111111",
      documentType: "txid",
      entityType: "individual",
      name: "Sender Name",
    },
  },
  target: {
    handle: "svgs:222222222@bank.com",
    custom: {
      documentNumber: "222222222",
      documentType: "txid",
      entityType: "individual",
      name: "Receiver Name",
    },
  },
  symbol: { handle: "usd" },
  amount: 500,
};
```

## Error Handling

### Common Errors and Solutions

| Error                                | Solution                                         |
| ------------------------------------ | ------------------------------------------------ |
| `Unexpected raw private key length`  | Ensure private key has exactly 64 hex characters |
| `Invalid pkcs5 encrypted key format` | Regenerate .der file with minka signer           |
| `JWT signing failed`                 | Verify public/private key compatibility          |
| `serializeData: failed to stringify` | Check for circular references in data            |

### Validation Function

```typescript
function validateIntentData(data: any): boolean {
  const requiredFields = ["handle", "claims", "schema", "access", "config"];

  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  if (!Array.isArray(data.claims) || data.claims.length === 0) {
    console.error("Claims must be a non-empty array");
    return false;
  }

  return true;
}
```

## Security Best Practices

1. **Never hardcode** private keys in production code
2. **Use environment variables** for sensitive configuration
3. **Validate all data** before signing
4. **Implement proper logging** for audit trails
5. **Use HTTPS** for all communications
6. **Rotate keys** periodically

## Testing

### Unit Test Example

```typescript
import { createHash, createSignatureDigest } from "./hash";

test("should create consistent hash", () => {
  const data = { test: "data" };
  const hash1 = createHash(data);
  const hash2 = createHash(data);
  expect(hash1).toBe(hash2);
});

test("should create valid signature digest", () => {
  const hash = "test-hash";
  const custom = { moment: "2025-01-03T10:10:31.616Z" };
  const digest = createSignatureDigest(hash, custom);
  expect(digest).toBeDefined();
  expect(digest.length).toBe(64); // SHA256 hex length
});
```

## Environment Configuration

```bash
# .env
SIGNER_NAME=your-signer
PUBLIC_KEY=your_public_key_base64
SECRET_KEY=your_secret_key_base64
LEDGER_NAME=your-ledger
SERVER_URL=https://ldg-stg.one/api/v2
PRIVATE_KEY_PATH=./your-key.der
```

## Monitoring and Logging

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: "auth.log" })],
});

// Log authentication steps
function logAuthStep(step: string, data: any) {
  logger.info("Authentication Step", {
    step,
    timestamp: new Date().toISOString(),
    data: typeof data === "object" ? JSON.stringify(data) : data,
  });
}
```

## Summary

The Minka authentication process follows this flow:

1. **Serialize data** → **Create SHA256 hash** → **Generate signature digest** → **Convert to buffer** → **Sign with Ed25519** → **Create proof object** → **Generate JWT** → **Send request**

This implementation ensures secure, authenticated communication with the Minka API while maintaining data integrity through cryptographic signatures.





























