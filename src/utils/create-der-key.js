// save as make-ed25519-pkcs8.js
const fs = require("fs");
const path = require("path");

// Read the raw 32-byte Ed25519 private key
const raw = fs.readFileSync(path.resolve(__dirname, "../../raw.key"));
if (raw.length !== 32)
  throw new Error("Expected 32 bytes for Ed25519 private key");

// PKCS#8 DER header for Ed25519 private key
const pkcs8Header = Buffer.from("302e020100300506032b657004220420", "hex");
const pkcs8Der = Buffer.concat([pkcs8Header, raw]);

// Export as PEM
const pem = [
  "-----BEGIN PRIVATE KEY-----",
  pkcs8Der
    .toString("base64")
    .match(/.{1,64}/g)
    .join("\n"),
  "-----END PRIVATE KEY-----",
].join("\n");

fs.writeFileSync("hector-key.pem", pem);
console.log("Wrote hector-key.pem");
