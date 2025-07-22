# Java Security Library

This library provides cryptographic utilities for interoperability with the Minka Ledger integration, mirroring the security features and data formats of the TypeScript SDK.

## Security Features (English)

**What does this library do?**

- Creates a secure hash (SHA-256) of your data.
- Signs data with Ed25519 private keys (digital signature).
- Signs JWT tokens with Ed25519 keys for authentication.
- Serializes data to stable JSON for consistent cryptographic results.
- Loads private keys from PKCS#8 DER files (the same format as Node.js/TypeScript).

**How does it work?**

1. **Hashing:**
   - Converts your data to a stable JSON string and hashes it with SHA-256.
   - _Example:_
     ```java
     String hash = HashUtils.createHash(data);
     ```
2. **Signature Digest:**
   - Combines the data hash and custom signature info, then hashes again.
   - _Example:_
     ```java
     String signatureDigest = HashUtils.createSignatureDigest(hash, signatureCustom);
     ```
3. **Digital Signature:**
   - Signs the digest with your Ed25519 private key (from a .der file).
   - _Example:_
     ```java
     PrivateKey privateKey = KeyUtils.loadEd25519PrivateKeyFromDerFile("htorohn-key.der");
     byte[] signature = SignatureUtils.signEd25519(signatureDigest, privateKey);
     String signatureBase64 = SignatureUtils.toBase64(signature);
     ```
4. **JWT Signing:**
   - Signs a JWT for authentication using your Ed25519 key.
   - _Example:_
     ```java
     String jwt = JwtUtils.signJWT(jwtPayload, SECRET_KEY, PUBLIC_KEY);
     ```

**How to use:**

- Place your Ed25519 private key in PKCS#8 DER format in the project directory.
- Use the provided classes (`HashUtils`, `SignatureUtils`, `KeyUtils`, `JwtUtils`) as shown above.
- See `IntentApiSecurityTest.java` for a full working example, including sending a signed request to the server.

---

## Características de Seguridad (Español)

**¿Qué hace esta librería?**

- Crea un hash seguro (SHA-256) de tus datos.
- Firma datos con claves privadas Ed25519 (firma digital).
- Firma tokens JWT con claves Ed25519 para autenticación.
- Serializa datos a JSON estable para resultados criptográficos consistentes.
- Carga claves privadas desde archivos PKCS#8 DER (el mismo formato que Node.js/TypeScript).

**¿Cómo funciona?**

1. **Hash:**
   - Convierte tus datos a JSON estable y los hashea con SHA-256.
   - _Ejemplo:_
     ```java
     String hash = HashUtils.createHash(data);
     ```
2. **Digest de Firma:**
   - Combina el hash de los datos y la info de la firma, y vuelve a hashear.
   - _Ejemplo:_
     ```java
     String signatureDigest = HashUtils.createSignatureDigest(hash, signatureCustom);
     ```
3. **Firma Digital:**
   - Firma el digest con tu clave privada Ed25519 (desde un archivo .der).
   - _Ejemplo:_
     ```java
     PrivateKey privateKey = KeyUtils.loadEd25519PrivateKeyFromDerFile("htorohn-key.der");
     byte[] signature = SignatureUtils.signEd25519(signatureDigest, privateKey);
     String signatureBase64 = SignatureUtils.toBase64(signature);
     ```
4. **Firma JWT:**
   - Firma un JWT para autenticación usando tu clave Ed25519.
   - _Ejemplo:_
     ```java
     String jwt = JwtUtils.signJWT(jwtPayload, SECRET_KEY, PUBLIC_KEY);
     ```

**¿Cómo se usa?**

- Coloca tu clave privada Ed25519 en formato PKCS#8 DER en el directorio del proyecto.
- Usa las clases (`HashUtils`, `SignatureUtils`, `KeyUtils`, `JwtUtils`) como en los ejemplos.
- Consulta `IntentApiSecurityTest.java` para un ejemplo completo, incluyendo el envío de una petición firmada al servidor.

---

## Structure

- `src/` — Java source code for the library
- `test/` — Example Java scripts for testing the library

## Main Classes

- `HashUtils` — Hashing and serialization
- `SignatureUtils` — Ed25519 signature creation and Base64 encoding
- `JwtUtils` — JWT signing with EdDSA
- `KeyUtils` — Key loading utilities

## Example Usage

```java
import com.minka.security.HashUtils;
import com.minka.security.SignatureUtils;
import com.minka.security.JwtUtils;
import com.minka.security.KeyUtils;

// Hashing
dataHash = HashUtils.createHash(dataJsonString);

// Signature digest
signatureDigest = HashUtils.createSignatureDigest(dataHash, signatureCustomJsonString);

// Load private key
PrivateKey privateKey = KeyUtils.loadEd25519PrivateKeyFromDerFile("htorohn-key.der");

// Sign digest
byte[] signature = SignatureUtils.signEd25519(signatureDigest, privateKey);
String signatureBase64 = SignatureUtils.toBase64(signature);

// JWT
String jwt = JwtUtils.signJWT(payloadMap, SECRET_KEY, PUBLIC_KEY);
```

See the `test/` folder for runnable examples.
