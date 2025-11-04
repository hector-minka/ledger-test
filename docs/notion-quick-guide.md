# 🔐 Autenticación Minka - Guía Rápida

## 📋 Resumen

La autenticación Minka usa firmas digitales Ed25519 y JWT tokens para asegurar las requests de la API. El proceso incluye hashing de datos, creación de signature digests, y firma con claves privadas.

---

## ⚡ Inicio Rápido

### 1. Instalación

```bash
npm install crypto @minka/ledger-sdk jose @noble/ed25519 base64url safe-stable-stringify
```

### 2. Generar archivo .der

```bash
minka signer export --input private-key.pem --output tu-key.der --format der
```

### 3. Configuración

```typescript
const SIGNER = "tu-signer";
const PUBLIC_KEY = "dGVzdF9wdWJsaWNfa2V5X2Jhc2U2NF9zdHJpbmc="; // Ejemplo
const SECRET_KEY = "dGVzdF9wcml2YXRlX2tleV9iYXNlNjRfc3RyaW5n"; // Ejemplo
const LEDGER = "tu-ledger";
const SERVER = "https://ldg-stg.one/api/v2";
```

---

## 🔄 Flujo de Implementación

### Paso 1: Hash de Datos

```typescript
import stringify from "safe-stable-stringify";
import crypto from "crypto";

function createHash(data: any): string {
  return crypto.createHash("sha256").update(stringify(data)).digest("hex");
}

const hash = createHash(data);
```

### Paso 2: Signature Digest

```typescript
function createSignatureDigest(dataHash: string, custom?: any): string {
  const serializedCustom = custom ? stringify(custom) : "";
  return crypto
    .createHash("sha256")
    .update(dataHash + serializedCustom)
    .digest("hex");
}

const signatureDigest = createSignatureDigest(hash, {
  moment: new Date().toISOString(),
  status: "created",
});
```

### Paso 3: Firma Digital

```typescript
const digestBuffer = Buffer.from(signatureDigest, "hex");
const privateKey = crypto.createPrivateKey({
  key: fs.readFileSync("tu-key.der"),
  format: "der",
  type: "pkcs8",
});
const signatureBase64 = crypto
  .sign(undefined, digestBuffer, privateKey)
  .toString("base64");
```

### Paso 4: Proof Object

```typescript
const proof = {
  method: "ed25519-v2",
  custom: { moment: new Date().toISOString(), status: "created" },
  digest: signatureDigest,
  public: PUBLIC_KEY,
  result: signatureBase64,
};
```

### Paso 5: JWT Token

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

---

## 🚀 Ejemplo Completo

```typescript
export const createIntent = async (data: any) => {
  try {
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
      key: fs.readFileSync("tu-key.der"),
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
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};
```

---

## 📊 Estructura de Request

```typescript
{
  data: {
    handle: "unique-handle-12345",
    claims: [{
      action: "transfer",
      source: {
        handle: "svgs:123456789@banco.com",
        custom: {
          documentNumber: "123456789",
          documentType: "txid",
          entityType: "business",
          name: "Mi Negocio",
        },
      },
      target: {
        handle: "svgs:987654321@banco.com",
        custom: {
          accountRef: "1234567890",
          documentNumber: "987654321",
          documentType: "txid",
          entityType: "individual",
          name: "Juan Pérez",
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

---

## ⚠️ Errores Comunes

| Error                                | Solución                                       |
| ------------------------------------ | ---------------------------------------------- |
| `Unexpected raw private key length`  | Verificar que la clave tenga 64 caracteres hex |
| `Invalid pkcs5 encrypted key format` | Regenerar archivo .der con minka signer        |
| `JWT signing failed`                 | Verificar compatibilidad de claves             |
| `serializeData: failed to stringify` | Revisar referencias circulares                 |

---

## 🔒 Mejores Prácticas

- ✅ Usar variables de entorno para datos sensibles
- ✅ Nunca hardcodear claves privadas
- ✅ Validar todos los datos de entrada
- ✅ Implementar manejo robusto de errores
- ✅ Usar HTTPS para todas las comunicaciones

---

## 🧪 Testing

```typescript
test("should create consistent hash", () => {
  const data = { test: "data" };
  const hash1 = createHash(data);
  const hash2 = createHash(data);
  expect(hash1).toBe(hash2);
});
```

---

> **💡 Tip**: Este flujo asegura comunicación segura con la API de Minka a través de firmas criptográficas y JWT tokens.




















