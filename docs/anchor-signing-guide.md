# Anchor Signing Guide - Complete Implementation

## Overview

This guide provides a complete implementation for signing anchors using the Minka Ledger API. The documentation explains how to calculate the required `digest` and `result` fields, which are often missing from standard API documentation.

## API Endpoint

```
POST /anchors/{id}/proofs
```

**Purpose:** Adds a cryptographic signature (proof) to an existing anchor.

## Current Issues with Standard Documentation

❌ **Missing hash calculation explanation** - No mention of which hash to use  
❌ **Missing digest calculation** - No explanation of how to create the `digest` field  
❌ **Missing signature generation** - No explanation of how to create the `result` field  
❌ **Missing step-by-step process** - No clear workflow

## Complete Implementation Guide

### Step 1: Get the Existing Anchor

First, you need to retrieve the anchor to get its current hash:

```bash
GET /anchors/{id}
```

**Response includes:**

```json
{
  "hash": "d75577ad1b99e187c505112016b00df9f69e63d02f40871cbb46eef621698a8a",
  "data": {
    "handle": "@htorohn",
    "target": "svgs:19395654998@bancorojo.co",
    "symbol": "cop",
    "custom": {
      /* anchor data */
    }
  },
  "luid": "$anc.-0vgl33EyMtlFPArR",
  "meta": {
    "proofs": [
      /* existing proofs */
    ],
    "status": "ACTIVE",
    "moment": "2025-09-02T19:09:54.614Z"
  }
}
```

### Step 2: Calculate the Digest

The `digest` field is calculated using the **existing anchor's hash** + **your custom data**:

```javascript
// 1. Get the existing hash from the anchor response
const existingHash = anchorResponse.hash; // e.g., "d75577ad1b99e187c505112016b00df9f69e63d02f40871cbb46eef621698a8a"

// 2. Define your custom data
const customData = {
  moment: "2025-04-02T05:10:30.823Z",
  status: "connected",
  operation: "verification",
};

// 3. Calculate the digest
const digest = createSignatureDigest(existingHash, customData);
```

**Digest Calculation Function:**

```javascript
function createSignatureDigest(dataHash, signatureCustom) {
  const serializedCustom = JSON.stringify(signatureCustom);
  return crypto
    .createHash("sha256")
    .update(dataHash + serializedCustom)
    .digest("hex");
}
```

### Step 3: Generate the Signature (Result)

The `result` field is a cryptographic signature of the digest:

```javascript
// 1. Convert digest to buffer
const digestBuffer = Buffer.from(digest, "hex");

// 2. Sign with your private key
const privateKey = crypto.createPrivateKey({
  key: Buffer.from(yourPrivateKeyBase64, "base64"),
  format: "der",
  type: "pkcs8",
});

// 3. Generate signature
const signature = crypto.sign(undefined, digestBuffer, privateKey);
const result = signature.toString("base64");
```

### Step 4: Make the API Call

Now you can make the POST request:

```bash
curl -X POST "<your-ledger-url>/api/v2/anchors/{id}/proofs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-secret-token>" \
  -H "x-ledger: <your-ledger-handle>" \
  -d '{
  "method": "ed25519-v2",
  "public": "your-public-key-base64",
  "digest": "calculated-digest-hex",
  "result": "calculated-signature-base64",
  "custom": {
    "moment": "2025-04-02T05:10:30.823Z",
    "status": "connected",
    "operation": "verification"
  }
}'
```

## Complete Example Implementation

### TypeScript/Node.js Implementation

```typescript
import crypto from "crypto";
import axios from "axios";

interface CustomData {
  moment: string;
  status: string;
  operation: string;
  [key: string]: any;
}

interface ProofData {
  method: string;
  public: string;
  digest: string;
  result: string;
  custom: CustomData;
}

async function signAnchor(
  anchorId: string,
  customData: CustomData,
  privateKeyBase64: string,
  publicKeyBase64: string,
  jwt: string,
  serverUrl: string,
  ledger: string
): Promise<any> {
  try {
    // Step 1: Get existing anchor
    const anchorResponse = await axios.get(`${serverUrl}/anchors/${anchorId}`, {
      headers: {
        "Content-Type": "application/json",
        "x-ledger": ledger,
        Authorization: `Bearer ${jwt}`,
      },
    });

    const existingHash = anchorResponse.data.hash;

    // Step 2: Calculate digest
    const digest = createSignatureDigest(existingHash, customData);

    // Step 3: Generate signature
    const digestBuffer = Buffer.from(digest, "hex");
    const privateKey = crypto.createPrivateKey({
      key: Buffer.from(privateKeyBase64, "base64"),
      format: "der",
      type: "pkcs8",
    });
    const signature = crypto.sign(undefined, digestBuffer, privateKey);
    const result = signature.toString("base64");

    // Step 4: Make API call
    const proofData: ProofData = {
      method: "ed25519-v2",
      public: publicKeyBase64,
      digest: digest,
      result: result,
      custom: customData,
    };

    const response = await axios.post(
      `${serverUrl}/anchors/${anchorId}/proofs`,
      proofData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-ledger": ledger,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error signing anchor:", error);
    throw error;
  }
}

function createSignatureDigest(
  dataHash: string,
  signatureCustom: CustomData
): string {
  const serializedCustom = JSON.stringify(signatureCustom);
  return crypto
    .createHash("sha256")
    .update(dataHash + serializedCustom)
    .digest("hex");
}
```

### Python Implementation

```python
import hashlib
import json
import base64
import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ed25519

def create_signature_digest(data_hash: str, signature_custom: dict) -> str:
    """Calculate the signature digest."""
    serialized_custom = json.dumps(signature_custom, separators=(',', ':'))
    combined = data_hash + serialized_custom
    return hashlib.sha256(combined.encode()).hexdigest()

async def sign_anchor(
    anchor_id: str,
    custom_data: dict,
    private_key_der: bytes,
    public_key_base64: str,
    jwt: str,
    server_url: str,
    ledger: str
) -> dict:
    """Sign an anchor with a new proof."""

    # Step 1: Get existing anchor
    headers = {
        "Content-Type": "application/json",
        "x-ledger": ledger,
        "Authorization": f"Bearer {jwt}"
    }

    response = requests.get(f"{server_url}/anchors/{anchor_id}", headers=headers)
    response.raise_for_status()

    existing_hash = response.json()["hash"]

    # Step 2: Calculate digest
    digest = create_signature_digest(existing_hash, custom_data)

    # Step 3: Generate signature
    private_key = serialization.load_der_private_key(private_key_der, password=None)
    digest_bytes = bytes.fromhex(digest)
    signature = private_key.sign(digest_bytes)
    result = base64.b64encode(signature).decode()

    # Step 4: Make API call
    proof_data = {
        "method": "ed25519-v2",
        "public": public_key_base64,
        "digest": digest,
        "result": result,
        "custom": custom_data
    }

    response = requests.post(
        f"{server_url}/anchors/{anchor_id}/proofs",
        json=proof_data,
        headers=headers
    )
    response.raise_for_status()

    return response.json()
```

## Request/Response Examples

### Request Body

```json
{
  "method": "ed25519-v2",
  "public": "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=",
  "digest": "e52483e9c08d7bc9ea81e832878d255db756ccb12ea50435d7707d9a8a2991d5",
  "result": "UmP3Uqhw/V/aUAv6urH6zR1t8KvNAbPYsTMczfRAwKo+Csz9Zx+Ek5dV5yO+zFKewEJhNbtQL9as9i942qX+AA==",
  "custom": {
    "moment": "2025-09-02T19:58:06.076Z",
    "status": "ACTIVE",
    "operation": "verification"
  }
}
```

### Success Response (200)

```json
{
  "hash": "d75577ad1b99e187c505112016b00df9f69e63d02f40871cbb46eef621698a8a",
  "data": {
    "handle": "@htorohn",
    "target": "svgs:19395654998@bancorojo.co",
    "symbol": "cop",
    "schema": "individual",
    "custom": {
      "lastName": "Toro",
      "aliasType": "username",
      "firstName": "Hector",
      "secondName": "Alfredo",
      "accountType": "svgs",
      "routingCode": "TFY",
      "documentType": "cc",
      "accountNumber": "123457",
      "documentNumber": "0801198607",
      "secondLastName": "del Cid",
      "participantCode": "891234918"
    }
  },
  "luid": "$anc.-0vgl33EyMtlFPArR",
  "meta": {
    "proofs": [
      {
        "custom": {
          "moment": "2025-09-02T19:58:06.076Z",
          "status": "ACTIVE",
          "operation": "verification"
        },
        "digest": "e52483e9c08d7bc9ea81e832878d255db756ccb12ea50435d7707d9a8a2991d5",
        "method": "ed25519-v2",
        "public": "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=",
        "result": "UmP3Uqhw/V/aUAv6urH6zR1t8KvNAbPYsTMczfRAwKo+Csz9Zx+Ek5dV5yO+zFKewEJhNbtQL9as9i942qX+AA=="
      }
    ],
    "status": "ACTIVE",
    "moment": "2025-09-02T19:09:54.614Z",
    "owners": ["YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw="],
    "labels": ["ndin:0801198607268"]
  }
}
```

## Key Points & Best Practices

### ✅ **Critical Requirements:**

- **Use the existing anchor's hash** (not a new hash)
- **Digest = SHA256(existingHash + JSON.stringify(customData))**
- **Result = Ed25519 signature of the digest**
- **Custom data must include `moment` field**
- **All timestamps should be in ISO 8601 format**

### 🔐 **Security Considerations:**

- Always use HTTPS for API calls
- Store private keys securely (never in code)
- Use proper JWT authentication
- Validate all input data before processing

### 📝 **Common Custom Data Fields:**

```javascript
const customData = {
  moment: new Date().toISOString(), // Required: timestamp
  status: "ACTIVE", // Optional: status
  operation: "verification", // Optional: operation type
  received: "2025-07-08T00:20:55.025Z", // Optional: received timestamp
  consented: "2025-07-08T00:20:55.025Z", // Optional: consent timestamp
  dispatched: "2025-07-08T00:20:55.025Z", // Optional: dispatch timestamp
};
```

### 🚨 **Common Errors & Solutions:**

| Error                        | Cause                        | Solution                                    |
| ---------------------------- | ---------------------------- | ------------------------------------------- |
| `crypto.hash-invalid`        | Wrong hash used for digest   | Use existing anchor's hash, not new data    |
| `crypto.parent-hash-invalid` | Incorrect digest calculation | Ensure SHA256(existingHash + customData)    |
| `Schema validation error`    | Missing required fields      | Include all required fields in request body |
| `401 Unauthorized`           | Invalid JWT                  | Check JWT generation and expiration         |
| `404 No record found`        | Anchor doesn't exist         | Verify anchor ID/handle exists              |

## Testing Your Implementation

You can test your implementation using the provided test file:

```bash
# Test the signAnchor function
npm run ts-node src/test-anchors-with-api.ts signAnchor
```

This will help verify that your implementation matches the expected behavior.

## Additional Resources

- [Minka Ledger SDK Documentation](https://docs.minka.io)
- [Ed25519 Cryptographic Signatures](https://ed25519.cr.yp.to/)
- [JWT Authentication Guide](https://jwt.io/introduction)
- [SHA256 Hash Function](https://en.wikipedia.org/wiki/SHA-2)

---

_This guide was created based on working implementations and real-world testing with the Minka Ledger API._
