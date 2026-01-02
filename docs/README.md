# Documentación de Autenticación Minka

Esta documentación proporciona una guía completa para implementar la autenticación en la API de Minka, incluyendo la generación de hashes, firmas digitales, y JWT tokens.

## 📚 Guías Disponibles

### 1. [Guía Principal de Autenticación](./autenticacion-guia.md)

Guía completa paso a paso que cubre:

- Configuración inicial y dependencias
- Generación de archivo .der desde PEM usando minka signer
- Creación del hash de datos
- Generación del signature digest
- Creación del digest buffer
- Generación de la firma base64
- Mapeo a campos del proof
- Generación de JWT con claves pública y privada
- Ejemplo completo de implementación

### 2. [Ejemplos Prácticos](./ejemplos-practicos.md)

Ejemplos de código y casos de uso reales:

- Comandos de terminal para generación de claves
- Scripts de utilidad para validación
- Casos de uso comunes (B2P, P2P, transferencias internacionales)
- Testing y debugging
- Configuración por entornos
- Monitoreo y logging

### 3. [Referencia Rápida](./referencia-rapida.md)

Cheat sheet con:

- Comandos esenciales
- Flujo de autenticación resumido
- Configuración mínima
- Estructura de request
- Errores comunes y soluciones
- Testing básico

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+
- minka signer CLI
- Archivo PEM de clave privada

### Instalación

```bash
npm install crypto dayjs fs path util
npm install @minka/ledger-sdk
npm install jose @noble/ed25519 base64url safe-stable-stringify
```

### Configuración Básica

```typescript
const SIGNER = "tu-signer";
const PUBLIC_KEY = "tu-clave-publica-base64";
const SECRET_KEY = "tu-clave-privada-base64";
const LEDGER = "tu-ledger";
const SERVER = "https://ldg-stg.one/api/v2";
```

### Generar Archivo .der

```bash
minka signer export --input private-key.pem --output tu-key.der --format der
```

## 🔧 Implementación

### Flujo Básico

1. **Serializar datos** con `safe-stable-stringify`
2. **Crear hash SHA256** de los datos serializados
3. **Generar signature digest** combinando hash + datos personalizados
4. **Convertir a buffer** para firma
5. **Firmar con Ed25519** usando clave privada
6. **Crear proof object** con todos los componentes
7. **Generar JWT** para autenticación
8. **Enviar request** con headers apropiados

### Ejemplo Mínimo

```typescript
import { createHash, createSignatureDigest } from "./hash";
import { signJWT } from "./jwt-auth";

// 1. Crear hash
const hash = createHash(data);

// 2. Crear signature digest
const signatureDigest = createSignatureDigest(hash, signatureCustom);

// 3. Firmar
const digestBuffer = Buffer.from(signatureDigest, "hex");
const signatureBase64 = crypto
  .sign(undefined, digestBuffer, privateKey)
  .toString("base64");

// 4. Crear proof
const proof = {
  method: "ed25519-v2",
  custom: signatureCustom,
  digest: signatureDigest,
  public: PUBLIC_KEY,
  result: signatureBase64,
};

// 5. Generar JWT
const jwt = await signJWT(payload, SECRET_KEY, PUBLIC_KEY);
```

## 🛡️ Seguridad

### Mejores Prácticas

- **Nunca hardcodees** claves privadas en el código
- **Usa variables de entorno** para configuración sensible
- **Valida todos los datos** antes de firmar
- **Implementa logging** para auditoría
- **Usa HTTPS** para todas las comunicaciones
- **Rota las claves** periódicamente

### Validación de Datos

```typescript
function validateIntentData(data: any): boolean {
  const requiredFields = ["handle", "claims", "schema", "access", "config"];
  return requiredFields.every((field) => data[field] !== undefined);
}
```

## 🧪 Testing

### Pruebas Unitarias

```typescript
import { createHash, createSignatureDigest } from "./hash";

test("should create consistent hash", () => {
  const data = { test: "data" };
  const hash1 = createHash(data);
  const hash2 = createHash(data);
  expect(hash1).toBe(hash2);
});
```

### Pruebas de Integración

```typescript
test("should create valid proof", async () => {
  const result = await createIntentWithApi();
  expect(result.meta.proofs).toHaveLength(1);
  expect(result.meta.proofs[0]).toHaveProperty("method", "ed25519-v2");
});
```

## 📊 Monitoreo

### Logging Estructurado

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
```

### Métricas Importantes

- Tiempo de generación de hash
- Tiempo de firma digital
- Tiempo de generación de JWT
- Tasa de errores de autenticación
- Latencia de requests

## 🔍 Troubleshooting

### Problemas Comunes

#### Error: "Unexpected raw private key length"

**Causa**: La clave privada no tiene el formato correcto
**Solución**: Verificar que la clave tenga exactamente 64 caracteres en hex

#### Error: "Invalid pkcs5 encrypted key format"

**Causa**: El archivo .der no está en formato PKCS#8 correcto
**Solución**: Regenerar con `minka signer export`

#### Error: "JWT signing failed"

**Causa**: Incompatibilidad entre claves pública y privada
**Solución**: Verificar que ambas claves sean del mismo par

#### Error: "serializeData: failed to stringify"

**Causa**: Referencias circulares en los datos
**Solución**: Limpiar datos antes de serializar

### Debugging

```typescript
// Habilitar logs detallados
process.env.DEBUG = "minka:auth";

// Verificar configuración
console.log("Config:", {
  signer: SIGNER,
  ledger: LEDGER,
  server: SERVER,
  hasPrivateKey: !!fs.existsSync("htorohn-key.der"),
});
```

## 📞 Soporte

### Recursos Adicionales

- [Documentación oficial de Minka](https://docs.minka.io)
- [SDK de Ledger](https://github.com/minka-io/ledger-sdk)
- [Especificación Ed25519](https://ed25519.cr.yp.to/)

### Contacto

- Email: soporte@minka.io
- Slack: #minka-support
- GitHub Issues: [minka-io/ledger-sdk](https://github.com/minka-io/ledger-sdk/issues)

## 📝 Changelog

### v1.0.0

- Guía inicial de autenticación
- Ejemplos de implementación
- Referencia rápida
- Casos de uso comunes

---

**Nota**: Esta documentación está basada en la implementación actual en `src/intents-api.ts` y puede requerir actualizaciones según cambios en la API de Minka.





























