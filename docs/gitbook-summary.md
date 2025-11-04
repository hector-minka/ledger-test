# Minka API Authentication

## Overview

Minka API authentication uses Ed25519 digital signatures and JWT tokens to secure API requests. The process involves hashing data, creating signature digests, and signing with private keys.

> **📋 Flow Overview**: For a detailed step-by-step security flow, see [Authentication Flow Guide](./authentication-flow.md)

## Prerequisites

- Node.js 16+
- minka signer CLI
- Private key in PEM format

## Installation

```bash
npm install crypto @minka/ledger-sdk jose @noble/ed25519 base64url safe-stable-stringify
```

## Quick Setup

### 1. Generate .der File

```bash
minka signer export --input private-key.pem --output your-key.der --format der
```

### 2. Configuration

```typescript
const SIGNER = "your-signer-name";
const PUBLIC_KEY = "dGVzdF9wdWJsaWNfa2V5X2Jhc2U2NF9zdHJpbmc="; // Example
const SECRET_KEY = "dGVzdF9wcml2YXRlX2tleV9iYXNlNjRfc3RyaW5n"; // Example
const LEDGER = "your-ledger-name";
const SERVER = "https://ldg-stg.one/api/v2";
```

## Implementation

### Data Hashing

```typescript
import stringify from "safe-stable-stringify";
import crypto from "crypto";

function createHash(data: any): string {
  return crypto.createHash("sha256").update(stringify(data)).digest("hex");
}
```

### Signature Generation

```typescript
function createSignatureDigest(dataHash: string, custom?: any): string {
  const serializedCustom = custom ? stringify(custom) : "";
  return crypto
    .createHash("sha256")
    .update(dataHash + serializedCustom)
    .digest("hex");
}

// Sign the digest
const digestBuffer = Buffer.from(signatureDigest, "hex");
const privateKey = crypto.createPrivateKey({
  key: fs.readFileSync("your-key.der"),
  format: "der",
  type: "pkcs8",
});
const signatureBase64 = crypto
  .sign(undefined, digestBuffer, privateKey)
  .toString("base64");
```

### Proof Object

```typescript
const proof = {
  method: "ed25519-v2",
  custom: { moment: new Date().toISOString(), status: "created" },
  digest: signatureDigest,
  public: PUBLIC_KEY,
  result: signatureBase64,
};
```

### JWT Generation

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
export const createIntent = async (data: any) => {
  // 1. Hash data
  const hash = createHash(data);

  // 2. Create signature digest
  const signatureDigest = createSignatureDigest(hash, {
    moment: new Date().toISOString(),
    status: "created",
  });

  // 3. Sign digest
  const digestBuffer = Buffer.from(signatureDigest, "hex");
  const privateKey = crypto.createPrivateKey({
    key: fs.readFileSync("your-key.der"),
    format: "der",
    type: "pkcs8",
  });
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
  return await axios.post(
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
};
```

## Request Structure

```typescript
{
  data: {
    handle: "unique-handle-12345",
    claims: [{
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
    }],
    schema: "b2p-send",
    access: [{ action: "any", signer: { public: PUBLIC_KEY } }],
    config: { commit: "auto" },
  },
  hash: "generated-hash",
  meta: { proofs: [proof] },
}
```

## Common Errors

| Error                                | Solution                                 |
| ------------------------------------ | ---------------------------------------- |
| `Unexpected raw private key length`  | Ensure private key has 64 hex characters |
| `Invalid pkcs5 encrypted key format` | Regenerate .der file with minka signer   |
| `JWT signing failed`                 | Verify key compatibility                 |
| `serializeData: failed to stringify` | Check for circular references            |

## Security Best Practices

- Use environment variables for sensitive data
- Never hardcode private keys
- Validate all input data
- Implement proper error handling
- Use HTTPS for all communications

## Testing

```typescript
test("should create consistent hash", () => {
  const data = { test: "data" };
  const hash1 = createHash(data);
  const hash2 = createHash(data);
  expect(hash1).toBe(hash2);
});
```

This authentication flow ensures secure communication with the Minka API through cryptographic signatures and JWT tokens.
