# Quick Authentication Flow Reference

## Security Steps Overview

```
Data → Serialize → Hash → + Custom → Digest → Buffer → Sign → Base64 → Proof → JWT → Request
```

## Detailed Flow

| Step | Action                | Purpose                                                |
| ---- | --------------------- | ------------------------------------------------------ |
| 1    | **Serialize Data**    | Consistent string format using `safe-stable-stringify` |
| 2    | **Create Hash**       | SHA256 hash of serialized data for integrity           |
| 3    | **Add Custom Data**   | Timestamp and status for additional security           |
| 4    | **Create Digest**     | SHA256 hash of data hash + custom data                 |
| 5    | **Convert to Buffer** | Binary format for cryptographic signing                |
| 6    | **Load Private Key**  | Ed25519 private key from .der file                     |
| 7    | **Sign with Ed25519** | Digital signature for authentication                   |
| 8    | **Encode Base64**     | Safe string format for transmission                    |
| 9    | **Create Proof**      | Combine all signature components                       |
| 10   | **Generate JWT**      | Authentication token with expiration                   |
| 11   | **Build Request**     | Complete API request with headers                      |
| 12   | **Send to API**       | Authenticated request to Minka                         |

## Security Layers

### 🔐 **Data Integrity**

- SHA256 hashing ensures data hasn't been tampered with
- Deterministic serialization guarantees consistent results

### 🔑 **Authentication**

- Ed25519 digital signatures prove request authenticity
- Private key protection via .der file format

### 🎫 **Authorization**

- JWT tokens provide stateless authentication
- Time-based expiration prevents replay attacks

## Key Components

```typescript
// 1. Data Hashing
const hash = createHash(data);

// 2. Signature Digest
const signatureDigest = createSignatureDigest(hash, customData);

// 3. Digital Signing
const signatureBase64 = crypto
  .sign(undefined, digestBuffer, privateKey)
  .toString("base64");

// 4. Proof Object
const proof = {
  method: "ed25519-v2",
  custom: customData,
  digest: signatureDigest,
  public: PUBLIC_KEY,
  result: signatureBase64,
};

// 5. JWT Token
const jwt = await signJWT(payload, SECRET_KEY, PUBLIC_KEY);
```

## Security Checklist

- [ ] Private key stored securely (not in code)
- [ ] Environment variables for configuration
- [ ] HTTPS for all communications
- [ ] Input data validation
- [ ] Proper error handling
- [ ] Secure logging practices

## Common Errors

| Error                                | Quick Fix                         |
| ------------------------------------ | --------------------------------- |
| `Unexpected raw private key length`  | Check key has 64 hex characters   |
| `Invalid pkcs5 encrypted key format` | Regenerate .der with minka signer |
| `JWT signing failed`                 | Verify key compatibility          |
| `serializeData: failed to stringify` | Check for circular references     |

---

> **💡 Tip**: This flow ensures secure, authenticated communication with the Minka API through multiple layers of cryptographic security.





























