# Ejemplos Prácticos de Autenticación Minka

## Comandos de Terminal

### 1. Generar Archivo .der desde PEM

```bash
# Usando minka signer (recomendado)
minka signer export --input private-key.pem --output htorohn-key.der --format der

# Usando OpenSSL (alternativo)
openssl pkcs8 -topk8 -inform PEM -outform DER -in private-key.pem -out htorohn-key.der -nocrypt
```

### 2. Verificar Archivo .der

```bash
# Verificar contenido del archivo DER
openssl asn1parse -inform DER -in htorohn-key.der

# Verificar que es una clave Ed25519
openssl pkey -inform DER -in htorohn-key.der -text -noout
```

## Scripts de Utilidad

### 1. Generador de Claves

```typescript
// generate-keys.ts
import crypto from "crypto";
import fs from "fs";
import { privateKeyEd25519RawToDer, publicKeyEd25519RawToDer } from "./asn1";

function generateKeyPair() {
  // Generar par de claves Ed25519
  const keyPair = crypto.generateKeyPairSync("ed25519");

  // Extraer claves en formato raw
  const privateKeyRaw = keyPair.privateKey.export({
    format: "der",
    type: "pkcs8",
  });
  const publicKeyRaw = keyPair.publicKey.export({
    format: "der",
    type: "spki",
  });

  // Convertir a hex para procesamiento
  const privateKeyHex = privateKeyRaw.toString("hex");
  const publicKeyHex = publicKeyRaw.toString("hex");

  // Extraer solo la parte raw (sin prefijos ASN.1)
  const privateKeyRawHex = privateKeyHex.slice(-64); // Últimos 64 caracteres
  const publicKeyRawHex = publicKeyHex.slice(-64); // Últimos 64 caracteres

  // Convertir a base64
  const privateKeyBase64 = Buffer.from(privateKeyRawHex, "hex").toString(
    "base64"
  );
  const publicKeyBase64 = Buffer.from(publicKeyRawHex, "hex").toString(
    "base64"
  );

  console.log("Private Key (Base64):", privateKeyBase64);
  console.log("Public Key (Base64):", publicKeyBase64);

  // Guardar archivo .der
  fs.writeFileSync("generated-key.der", privateKeyRaw);

  return {
    private: privateKeyBase64,
    public: publicKeyBase64,
  };
}

generateKeyPair();
```

### 2. Validador de Firma

```typescript
// validate-signature.ts
import crypto from "crypto";
import { createHash, createSignatureDigest } from "./hash";

function validateSignature(
  data: any,
  signatureCustom: any,
  signatureBase64: string,
  publicKeyBase64: string
): boolean {
  try {
    // 1. Recrear el hash
    const hash = createHash(data);

    // 2. Recrear el signature digest
    const signatureDigest = createSignatureDigest(hash, signatureCustom);

    // 3. Convertir a buffer
    const digestBuffer = Buffer.from(signatureDigest, "hex");

    // 4. Convertir clave pública a formato DER
    const publicKeyHex = Buffer.from(publicKeyBase64, "base64").toString("hex");
    const publicKeyDerHex = publicKeyEd25519RawToDer(publicKeyHex);
    const publicKey = crypto.createPublicKey({
      key: Buffer.from(publicKeyDerHex, "hex"),
      format: "der",
      type: "spki",
    });

    // 5. Verificar firma
    const signature = Buffer.from(signatureBase64, "base64");
    return crypto.verify(null, digestBuffer, publicKey, signature);
  } catch (error) {
    console.error("Error validating signature:", error);
    return false;
  }
}

// Ejemplo de uso
const data = {
  /* tus datos */
};
const signatureCustom = {
  /* tus datos personalizados */
};
const signatureBase64 = "tu_firma_base64";
const publicKeyBase64 = "tu_clave_publica_base64";

const isValid = validateSignature(
  data,
  signatureCustom,
  signatureBase64,
  publicKeyBase64
);
console.log("Signature valid:", isValid);
```

### 3. Generador de JWT de Prueba

```typescript
// test-jwt.ts
import { signJWT } from "./jwt-auth";

async function generateTestJWT() {
  const payload = {
    iss: "test-signer",
    sub: "signer:test-signer",
    aud: "test-ledger",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
  };

  const secretKey = "tu_clave_secreta_base64";
  const publicKey = "tu_clave_publica_base64";

  try {
    const jwt = await signJWT(payload, secretKey, publicKey);
    console.log("JWT generado:", jwt);

    // Decodificar para verificar
    const parts = jwt.split(".");
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    const payload_decoded = JSON.parse(
      Buffer.from(parts[1], "base64url").toString()
    );

    console.log("Header:", header);
    console.log("Payload:", payload_decoded);
  } catch (error) {
    console.error("Error generando JWT:", error);
  }
}

generateTestJWT();
```

## Casos de Uso Comunes

### 1. Transferencia B2P (Business to Person)

```typescript
const b2pTransfer = {
  action: "transfer",
  source: {
    handle: "svgs:123456789@alianza.com.co",
    custom: {
      documentNumber: "123456789",
      documentType: "txid",
      entityType: "business",
      name: "Mi Negocio",
    },
  },
  target: {
    handle: "svgs:987654321@bancorojo.co",
    custom: {
      accountRef: "3123454333",
      documentNumber: "987654321",
      documentType: "txid",
      entityType: "individual",
      name: "Juan Pérez",
    },
  },
  symbol: { handle: "cop" },
  amount: 100000, // $100,000 COP
};
```

### 2. Transferencia P2P (Person to Person)

```typescript
const p2pTransfer = {
  action: "transfer",
  source: {
    handle: "svgs:111111111@bancorojo.co",
    custom: {
      documentNumber: "111111111",
      documentType: "txid",
      entityType: "individual",
      name: "María García",
    },
  },
  target: {
    handle: "svgs:222222222@bancorojo.co",
    custom: {
      documentNumber: "222222222",
      documentType: "txid",
      entityType: "individual",
      name: "Carlos López",
    },
  },
  symbol: { handle: "cop" },
  amount: 50000, // $50,000 COP
};
```

### 3. Transferencia Internacional

```typescript
const internationalTransfer = {
  action: "transfer",
  source: {
    handle: "svgs:333333333@alianza.com.co",
    custom: {
      documentNumber: "333333333",
      documentType: "txid",
      entityType: "individual",
      name: "Ana Rodríguez",
    },
  },
  target: {
    handle: "svgs:444444444@transfiya",
    custom: {
      accountRef: "wi2UauFZ8ARN5vYhVY57r4LSmA2aWsGiwL",
      documentNumber: "444444444",
      documentType: "txid",
      entityType: "individual",
      name: "John Smith",
    },
  },
  symbol: { handle: "usd" },
  amount: 1000, // $1,000 USD
};
```

## Testing y Debugging

### 1. Script de Prueba Completa

```typescript
// test-complete-auth.ts
import { createIntentWithApi } from "./intents-api";

async function testCompleteAuthentication() {
  console.log("🧪 Iniciando prueba de autenticación completa...");

  try {
    await createIntentWithApi();
    console.log("✅ Prueba completada exitosamente");
  } catch (error) {
    console.error("❌ Error en la prueba:", error);
  }
}

testCompleteAuthentication();
```

### 2. Validador de Datos

```typescript
// validate-data.ts
function validateIntentData(data: any): boolean {
  const requiredFields = ["handle", "claims", "schema", "access", "config"];

  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`❌ Campo requerido faltante: ${field}`);
      return false;
    }
  }

  // Validar claims
  if (!Array.isArray(data.claims) || data.claims.length === 0) {
    console.error("❌ Claims debe ser un array no vacío");
    return false;
  }

  // Validar cada claim
  for (const claim of data.claims) {
    const claimRequiredFields = [
      "action",
      "source",
      "target",
      "symbol",
      "amount",
    ];
    for (const field of claimRequiredFields) {
      if (!claim[field]) {
        console.error(`❌ Campo requerido faltante en claim: ${field}`);
        return false;
      }
    }
  }

  console.log("✅ Datos del intent válidos");
  return true;
}

// Ejemplo de uso
const data = {
  handle: "20250903795828547TFY595495513812965",
  claims: [
    /* tus claims */
  ],
  schema: "b2p-send",
  access: [
    /* tus reglas de acceso */
  ],
  config: {
    commit: "auto",
  },
};

validateIntentData(data);
```

## Configuración de Entornos

### 1. Variables de Entorno

```bash
# .env
SIGNER_NAME=htorohn
PUBLIC_KEY=YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=
SECRET_KEY=fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=
LEDGER_NAME=payment-hub-staging
SERVER_URL=https://ldg-stg.one/api/v2
PRIVATE_KEY_PATH=./htorohn-key.der
```

### 2. Configuración por Entorno

```typescript
// config.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  signer: process.env.SIGNER_NAME || "htorohn",
  publicKey: process.env.PUBLIC_KEY || "",
  secretKey: process.env.SECRET_KEY || "",
  ledger: process.env.LEDGER_NAME || "payment-hub-staging",
  server: process.env.SERVER_URL || "https://ldg-stg.one/api/v2",
  privateKeyPath: process.env.PRIVATE_KEY_PATH || "./htorohn-key.der",
};

// Validar configuración
function validateConfig() {
  const required = ["publicKey", "secretKey", "ledger", "server"];
  for (const field of required) {
    if (!config[field]) {
      throw new Error(
        `Variable de entorno requerida faltante: ${field.toUpperCase()}`
      );
    }
  }
}

validateConfig();
```

## Monitoreo y Logging

### 1. Logger Estructurado

```typescript
// logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

### 2. Middleware de Logging

```typescript
// logging-middleware.ts
import logger from "./logger";

export function logAuthenticationStep(step: string, data: any) {
  logger.info("Authentication Step", {
    step,
    timestamp: new Date().toISOString(),
    data: typeof data === "object" ? JSON.stringify(data) : data,
  });
}

export function logError(error: Error, context: string) {
  logger.error("Authentication Error", {
    context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
}
```

## Comandos de Utilidad

### 1. Script de Verificación

```bash
#!/bin/bash
# verify-setup.sh

echo "🔍 Verificando configuración de autenticación..."

# Verificar archivo .der
if [ ! -f "htorohn-key.der" ]; then
  echo "❌ Archivo htorohn-key.der no encontrado"
  exit 1
fi

# Verificar variables de entorno
if [ -z "$PUBLIC_KEY" ] || [ -z "$SECRET_KEY" ]; then
  echo "❌ Variables de entorno PUBLIC_KEY y SECRET_KEY requeridas"
  exit 1
fi

# Verificar dependencias
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no instalado"
  exit 1
fi

echo "✅ Configuración verificada correctamente"
```

### 2. Script de Limpieza

```bash
#!/bin/bash
# cleanup.sh

echo "🧹 Limpiando archivos temporales..."

# Remover archivos de log
rm -f *.log

# Remover archivos de prueba
rm -f test-*.json

echo "✅ Limpieza completada"
```

Estos ejemplos prácticos te ayudarán a implementar la autenticación de manera robusta y mantenible en tu aplicación Minka.




















