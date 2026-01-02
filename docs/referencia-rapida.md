# Referencia Rápida - Autenticación Minka

## 🔑 Comandos Esenciales

### Generar archivo .der desde PEM

```bash
minka signer export --input private-key.pem --output htorohn-key.der --format der
```

### Verificar archivo .der

```bash
openssl asn1parse -inform DER -in htorohn-key.der
```

## 📝 Flujo de Autenticación

### 1. Hash de Datos

```typescript
const hash = createHash(data);
```

### 2. Signature Digest

```typescript
const signatureDigest = createSignatureDigest(hash, signatureCustom);
```

### 3. Digest Buffer

```typescript
const digestBuffer = Buffer.from(signatureDigest, "hex");
```

### 4. Firma Base64

```typescript
const signatureBase64 = crypto
  .sign(undefined, digestBuffer, privateKey)
  .toString("base64");
```

### 5. Proof Object

```typescript
const proof = {
  method: "ed25519-v2",
  custom: signatureCustom,
  digest: signatureDigest,
  public: PUBLIC_KEY,
  result: signatureBase64,
};
```

### 6. JWT Token

```typescript
const jwt = await signJWT(payload, SECRET_KEY, PUBLIC_KEY);
```

## 🛠️ Configuración Mínima

```typescript
const SIGNER = "htorohn";
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
const LEDGER = "payment-hub-staging";
const SERVER = "https://ldg-stg.one/api/v2";
```

## 📋 Estructura de Request

```typescript
const request = {
  data: {
    handle: "unique-handle",
    claims: [claim],
    schema: "b2p-send",
    access: getOwnerAccessRules(PUBLIC_KEY),
    config: { commit: "auto" },
  },
  hash: "generated-hash",
  meta: {
    proofs: [proof],
  },
};
```

## 🔐 Headers de Request

```typescript
const headers = {
  "Content-Type": "application/json",
  "x-ledger": LEDGER,
  Authorization: `Bearer ${jwt}`,
};
```

## ⚠️ Errores Comunes

| Error                                | Solución                                           |
| ------------------------------------ | -------------------------------------------------- |
| `Unexpected raw private key length`  | Verificar que la clave tenga 64 caracteres hex     |
| `Invalid pkcs5 encrypted key format` | Regenerar archivo .der con minka signer            |
| `JWT signing failed`                 | Verificar compatibilidad de claves pública/privada |
| `serializeData: failed to stringify` | Revisar referencias circulares en datos            |

## 🧪 Testing

```typescript
// Ejecutar prueba completa
npm run test:auth

// Verificar configuración
npm run verify:setup

// Generar claves de prueba
npm run generate:keys
```

## 📚 Archivos Importantes

- `src/hash.ts` - Funciones de hash y signature digest
- `src/jwt-auth.ts` - Generación de JWT
- `src/asn1.ts` - Conversión de formatos de clave
- `src/intents-api.ts` - Implementación completa
- `htorohn-key.der` - Archivo de clave privada

## 🔄 Flujo Visual

```
Datos → Serializar → Hash SHA256 → + Custom → Signature Digest → Buffer → Firmar Ed25519 → Base64 → Proof → JWT → Request
```

## 📞 Soporte

Para problemas específicos, revisar:

1. Logs de la aplicación
2. Validación de datos de entrada
3. Formato de claves (debe ser Ed25519 raw base64)
4. Configuración de variables de entorno





























