// Removed invalid module declaration for base64url

import { LedgerJWTPayload } from "@minka/ledger-sdk/types";
import { KeyObject, createPrivateKey, createPublicKey } from "crypto";
import isNode from "detect-node";
import { SignJWT } from "jose";
import { privateKeyEd25519RawToDer } from "./asn1";
// @ts-ignore
import * as ed25519 from "@noble/ed25519";
import base64url from "base64url";

// If you get a type error for 'detect-node', add a module declaration:
// declare module 'detect-node';
// If you get a type error for 'base64url', add a module declaration:
// declare module 'base64url';

// const payload: LedgerJWTPayload = {
// 	iss: 'my-issuer',
// 	sub: 'user-id',
// 	aud: 'my-audience',
// 	// iat: Math.floor(Date.now()/1000),
// 	exp: Math.floor(Date.now()/1000) + 60,
//  };

type PublicKeyParser = {
  [key: string]: (keyHex: string) => string;
};

const publicKeyParser: PublicKeyParser = {
  "ed25519-raw": privateKeyEd25519RawToDer,
  "rsa-der": (keyHex: string) => keyHex,
};

/**
 * Imports public `der` key from raw key format
 * @param key public key in raw format
 * @returns public key in `der` format
 */
export function importPublicKey(
  key: string,
  format = "ed25519-raw"
): KeyObject {
  const keyHex = Buffer.from(key, "base64").toString("hex");
  const parser = publicKeyParser[format];
  if (!parser) {
    throw new Error(`Unknown public key format: ${format}`);
  }
  return createPublicKey({
    format: "der",
    type: "spki",
    key: Buffer.from(parser(keyHex), "hex"),
  });
}

/**
 * Imports private `der` key from raw key format
 * @param key private key in raw format
 * @returns private key in `der` format
 */
export function importPrivateKey(key: string): KeyObject {
  const keyHex = Buffer.from(key, "base64").toString("hex");
  return createPrivateKey({
    format: "der",
    type: "pkcs8",
    key: Buffer.from(privateKeyEd25519RawToDer(keyHex), "hex"),
  });
}

export async function signJWT(
  payload: LedgerJWTPayload, //payload to sign
  secret: string, //secret key from signer
  kid?: string //public key id from signer
): Promise<string> {
  // Ensure kid is a string (fallback to empty string if undefined)
  const kidStr = kid || "";
  return isNode
    ? signJWTNode(payload, secret, kidStr)
    : signJWTBrowser(payload, secret, kidStr);
}

export async function signJWTNode(
  payload: LedgerJWTPayload,
  secret: string,
  kid: string
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "EdDSA", kid })
    .sign(importPrivateKey(secret));
}

/**
 * This function is used to concatenate multiple buffers
 * into a single buffer.
 * It's used further in the code to concatenate the header
 * and payload with a dot separator.
 */
export function bufferConcat(...buffers: Uint8Array[]): Uint8Array {
  const size = buffers.reduce(
    (acc: number, buffer: Uint8Array) => acc + buffer.length,
    0
  );
  const buf = new Uint8Array(size);
  let i = 0;
  buffers.forEach((buffer: Uint8Array) => {
    buf.set(buffer, i);
    i += buffer.length;
  });
  return buf;
}

export async function signJWTBrowser(
  payload: LedgerJWTPayload,
  secret: string,
  kid: string
): Promise<string> {
  const header = { alg: "EdDSA", kid };
  const payloadEncoded = base64url.encode(JSON.stringify(payload));
  const headerEncoded = base64url.encode(JSON.stringify(header));

  // Concatenate header and payload with a dot
  const data = `${headerEncoded}.${payloadEncoded}`;

  // Sign the data (as Uint8Array)
  const privateKey = Buffer.from(secret, "base64");
  try {
    const signature = await ed25519.sign(Buffer.from(data), privateKey);
    const encodedSignature = base64url.encode(Buffer.from(signature));
    return `${headerEncoded}.${payloadEncoded}.${encodedSignature}`;
  } catch (error: any) {
    if (error.message === "Expected 32 bytes") {
      const publicLength = Buffer.from(secret, "base64").toString("hex").length;
      throw new Error(
        `Unexpected raw private key length in hex ${publicLength}, expected 64`
      );
    }
    throw new Error("jwt signing failed");
  }
}
