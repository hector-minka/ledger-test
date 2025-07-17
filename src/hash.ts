#!/usr/bin/env ts-node

import crypto from "crypto";
import stringify from "safe-stable-stringify";

const HASHING_ALGORITHM = "sha256";

export function serializeData(data: any): string {
  const result = stringify(data);
  if (result === undefined) {
    throw new Error("serializeData: failed to stringify input");
  }
  return result;
}

export function createHash(data: any): string {
  const serialized = serializeData(data);
  return crypto.createHash(HASHING_ALGORITHM).update(serialized).digest("hex");
}

export function createSignatureDigest(
  dataHash: string,
  signatureCustom?: Record<string, any>
): string {
  const serializedCustom = signatureCustom
    ? serializeData(signatureCustom)
    : "";
  return crypto
    .createHash(HASHING_ALGORITHM)
    .update(dataHash + serializedCustom)
    .digest("hex");
}

// const myData = {
//     "handle": "202507070140012ALI52874596521589",
//     "claims": [
//         {
//             "action": "transfer",
//             "amount": 90000,
//             "source": {
//                 "custom": {
//                     "name": "Victor",
//                     "documentType": "CC",
//                     "documentNumber": "1091896547",
//                     "entityType": "individual"
//                 },
//                 "handle": "svgs:0185785@alianza.com.co"
//             },
//             "symbol": {
//                 "handle": "cop"
//             },
//             "target": {
//                 "custom": {
//                     "name": "Brianne",
//                     "documentType": "cc",
//                     "documentNumber": "4025412019",
//                     "entityType": "individual",
//                     "accountRef": "wV8VBGaYBijEJLdAHm4qwcwKjZaVtPZMLE",
//                     "routingCode": "TFY"
//                 },
//                 "handle": "svgs:123456@transfiya"
//             }
//         }
//     ],
//     "schema": "b2p-send",
//     "access": [
//         {
//             "action": "any",
//             "signer": {
//                 "public": "bBIoixdgfoRkT6doMqA04bU0Maa02fiimVvmufo1cQA="
//             }
//         }
//     ],
//     "config": {
//         "commit": "auto"
//     }
// };

// const signatureCustom = {
//     "moment": "2025-04-02T05:10:31.616Z",
//     "status": "created",
//     "consented": "2025-07-07T05:10:31.616Z",
//     "received": "2025-07-07T05:10:31.616Z",
//     "dispatched": "2025-07-07T05:10:31.616Z"
// };

// const serialized       = serializeData(myData);
// const dataHash         = createHash(myData);
// const signatureDigest  = createSignatureDigest(dataHash, signatureCustom);

// console.log('Serialized:',       serialized);
// console.log('Data Hash:',        dataHash);
// console.log('Signature Digest:', signatureDigest);

// const keyDer = fs.readFileSync(path.resolve(__dirname, 'carlos-key.der'));

// const privateKey = crypto.createPrivateKey({
//   key: keyDer,
//   format: 'der',
//   type: 'pkcs8',
// });

// const digestBuffer = Buffer.from(signatureDigest, 'hex');
// const signatureBase64 = crypto.sign(undefined, digestBuffer, privateKey).toString('base64');

// console.log('Ed25519 Signature (base64):', signatureBase64);
