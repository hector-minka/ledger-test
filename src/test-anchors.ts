import {
  // AnchorListParams,
  LedgerSdk,
} from "@minka/ledger-sdk";
import {
  AccessAction,
  AccessRecordOwnership,
  //   LedgerClaim,
  LedgerKeyPair,
} from "@minka/ledger-sdk/types";

//CARLOS
/*const PUBLIC_KEY = 'ak40/ebXaPHdSwypXWHDlFaZZx0zdajPBz/dijLvdaE=';
const SECRET_KEY = 'pGpzlIcWPih1yYCgtQmYLchKjiHHWcMsZzALIksqGy8=';
const LEDGER = 'rtpswitch-servibanca-v02';
const SERVER = 'https://ldg-stg.one/api/v2';
const PUBLIC_SERVER_KEY = 'ruoUJXl56DvcM0QLAt12WzUoEFhW+rbZt4XMqcCPQGQ=';
*/
//CARLOS SERVIBANCA
// const PUBLIC_KEY = "ak40/ebXaPHdSwypXWHDlFaZZx0zdajPBz/dijLvdaE=";
// const SECRET_KEY = "pGpzlIcWPih1yYCgtQmYLchKjiHHWcMsZzALIksqGy8=";
// const LEDGER = "servibanca";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "RamCkyLvitD9XgZVNhuuN2htIgKdrDzEFjngCc7Kt+U=";
// const AUDIENCE = "servibanca";

// const SIGNER = "htorohn";
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
const LEDGER = "hector-ledger-test";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";
const AUDIENCE = "hector-ledger-test";

//CARLOS_DEV
//const PUBLIC_KEY = 'nAgcwbd3YA/agRjwLee3GGd2eXscnaQIX5i7rS8x7p0=';
//const SECRET_KEY = 'LsGSbpNtWqvza/J1k0gbYlYCuayT3bD727dj46R4M/g=';

// const KEY_PAIR = {
//   format: "ed25519-raw",
//   public: PUBLIC_KEY,
//   secret: SECRET_KEY,
// } as const;

// async function main() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: true,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos", //handler del signer
//       sub: "signer:carlos",
//       aud: "rtpswitch-servibanca-v02", //nombre del ledger
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   const { balances } = await sdk.wallet.getBalances("lulobank.com");

//   await sdk.wallet.getBalances("lulobank.com");
//   console.log("El balance es:", balances);
// }

export async function createAnchor() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: false,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: "carlos",
      sub: "signer:carlos",
      aud: AUDIENCE,
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });

  const keyPair: LedgerKeyPair = {
    format: "ed25519-raw",
    public: PUBLIC_KEY,
    secret: SECRET_KEY,
  };
  const anchorData = {
    handle: "svgs:12345.bac.com.hn.cop",
    wallet: "bac.com.hn",
    target: "svgs:1234597755@bac.com.hn",
    symbol: "cop",
    custom: {
      name: "Hector Toro",
      idType: "nidn",
      idNumber: "0801198607261",
      entityType: "individual",
    },
    access: [
      {
        action: AccessAction.Any,
        signer: { $record: AccessRecordOwnership.Owner },
      },
    ],
    schema: "person",
  };

  //   const anchorData = {
  //     handle: "carlos129833da@minka.io",
  //     wallet: "DICE",
  //     target: "svgs:1234597755@lulobank.com",
  //     symbol: "cop",
  //     custom: {
  //       aliasType: "email",
  //       documentType: "cc",
  //       documentNumber: "0801198607261",
  //       accountType: "svgs",
  //       accountNumber: "123457",
  //       firstName: "Carlos",
  //       secondName: "Jose",
  //       lastName: "Andino",
  //       secondLastName: "Nunez",
  //       entityType: "individual",
  //       targetSpbviCode: "SRV",
  //       participantCode: "860050750",
  //       directory: "centralized",
  //     },
  //     access: [
  //       {
  //         action: AccessAction.Any,
  //         signer: { $record: AccessRecordOwnership.Owner },
  //       },
  //     ],
  //     schema: "person",
  //   };

  const { response } = await sdk.anchor
    .init()
    .data(anchorData)
    .meta({
      labels: ["ndin:0801198607268"],
      proofs: [],
    })
    .hash()
    .sign([
      {
        keyPair,
        custom: {
          domain: null,
          status: "active",
          moment: "2025-04-14T14:23:45.123Z",
          consented: "2025-04-14T14:23:45.123Z",
          received: "2025-04-14T14:23:45.123Z",
          dispatched: "2025-04-14T14:23:45.123Z",
        },
      },
    ])
    .send();
  console.log("<br>El request es:", response.request);
  console.log("<br>EL response data es:", response.data);
  console.log("<br>El response es:", response.config);
  console.log("<br>El response es:", response);
}

// async function getAnchor() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: true,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos",
//       sub: "signer:carlos",
//       aud: AUDIENCE,
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   sdk.anchor.setHeader("X-Received", "2025-04-14T14:23:45.123Z"); // value is an example without the proper format
//   sdk.anchor.setHeader("X-Dispatched", "2025-04-14T14:23:45.123Z"); // value is an example without the proper format

//   /*
// 	const anchor = (await  sdk.anchor
//                     .read('carlos998876@minka.io')
//                     ).response.data;
//     console.log("El Anchor  es:", anchor);
//     */

//   const { response } = await sdk.anchor.read("asdasdasdasd@minka.io");

//   console.log("<br>El Anchor response request es:", response.request);
//   console.log("<br>El Anchor config es:", response.config);
//   console.log("<br>El Anchor response es:", response);
// }

// async function getAnchors() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: true,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos",
//       sub: "signer:carlos",
//       aud: "rtpswitch-servibanca-v02",
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });
//   const params: AnchorListParams = {
//     "meta.labels": "nidn:0801198607268",
//   };

//   /*const params:AnchorListParams = {
//         "data.custom.documentNumber":"0801198607268",
//         "data.custom.documentType":"nidn"
//     }*/

//   const anchors = await await sdk.anchor.list(params);

//   console.log(
//     "Retrieved anchors list:",
//     JSON.stringify(anchors.response.data, null, 4)
//   );
// }

// async function updateAnchorStatus() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: true,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos",
//       sub: "signer:carlos",
//       aud: "rtpswitch-servibanca-v02",
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   const record = (await sdk.anchor.read("carlos59@minka.io")).response.data;

//   console.log("El Anchor es:", record);
//   const keyPair: LedgerKeyPair = {
//     format: "ed25519-raw",
//     public: PUBLIC_KEY,
//     secret: SECRET_KEY,
//   };

//   await sdk.anchor
//     //.with('carlos@minka.io')  ofr  signing for POST ALIAS AND POST INTENT
//     .from(record)
//     .data({
//       ...record.data,
//     })
//     .hash()
//     .sign([
//       {
//         keyPair,
//         custom: {
//           status: "active",
//           moment: "2025-04-14T14:23:45.123Z",
//         },
//       },
//     ])
//     .send();
// }

// async function updateAnchorStatus2() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: true,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos",
//       sub: "signer:carlos",
//       aud: "rtpswitch-servibanca-v02",
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   const keyPair: LedgerKeyPair = {
//     format: "ed25519-raw",
//     public: PUBLIC_KEY,
//     secret: SECRET_KEY,
//   };

//   const record = (await sdk.anchor.read("carlos5@minka.io")).response.data;
//   console.log("El Anchor es:", record);
//   await sdk.anchor
//     //.with('carlos@minka.io')  ofr  signing for POST ALIAS AND POST INTENT
//     .from(record)
//     .data({
//       ...record.data,
//     })
//     .hash()
//     .sign([
//       {
//         keyPair,
//         custom: {
//           status: "INACTIVE",
//           moment: "2025-04-14T14:23:45.123Z",
//         },
//       },
//     ])
//     .send();
// }

// async function dropAnchor() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     verifyResponseProofs: false,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos",
//       sub: "signer:carlos",
//       aud: "rtpswitch-servibanca-v02",
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   const keyPair: LedgerKeyPair = {
//     format: "ed25519-raw",
//     public: PUBLIC_KEY,
//     secret: SECRET_KEY,
//   };

//   const droppedAnchor = await sdk.anchor
//     .with("3044933089")
//     .drop()
//     .hash()
//     .sign([
//       {
//         keyPair,
//         custom: {
//           status: "CANCELLED",
//           moment: "2025-04-15T14:23:45.123Z",
//         },
//       },
//     ])
//     .send();

//   console.log(
//     "Dropped anchor:",
//     JSON.stringify(droppedAnchor.response.data, null, 4)
//   );
// }

// async function updateAnchorData() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: true,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos",
//       sub: "signer:carlos",
//       aud: "rtpswitch-servibanca-v02",
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   const record = (await sdk.anchor.read("carlos129833da@minka.io")).response
//     .data;
//   const updateData = record;
//   updateData.data.custom = {
//     ...updateData.data.custom,
//     firstName: "Carlo111114",
//   };

//   console.log("El Anchor es:", record);
//   const keyPair: LedgerKeyPair = {
//     format: "ed25519-raw",
//     public: PUBLIC_KEY,
//     secret: SECRET_KEY,
//   };

//   const updatedAnchor = await sdk.anchor
//     .from(record)
//     .data({
//       ...updateData.data,
//       custom: updateData.data.custom,
//     })
//     .hash()
//     .sign([
//       {
//         keyPair,
//         custom: {
//           status: "UPDATE",
//           moment: "2025-04-14T14:23:45.123Z",
//         },
//       },
//     ])
//     .send();

//   console.log(
//     "Updated anchor:",
//     JSON.stringify(updatedAnchor.response.data, null, 4)
//   );
// }

// async function createTransaction() {
//   const sdk = new LedgerSdk({
//     ledger: LEDGER,
//     server: SERVER,
//     timeout: 15000,
//     verifyResponseProofs: true,
//     signer: {
//       format: "ed25519-raw",
//       public: PUBLIC_SERVER_KEY,
//     },
//     secure: {
//       iss: "carlos",
//       sub: "signer:carlos",
//       aud: "rtpswitch-servibanca-v02",
//       exp: 60,
//       keyPair: {
//         format: "ed25519-raw",
//         public: PUBLIC_KEY,
//         secret: SECRET_KEY,
//       },
//     },
//   });

//   const keyPair: LedgerKeyPair = {
//     format: "ed25519-raw",
//     public: PUBLIC_KEY,
//     secret: SECRET_KEY,
//   };

//   const transactionData = {
//     handle: "20240425113912312312393",
//     claims: [
//       {
//         action: "transfer",
//         amount: 500,
//         source: {
//           handle: "svgs:123459@lulobank.com",
//           custom: {
//             documentType: "cc",
//             documentNumber: "0801198607268",
//             firstName: "Carlos",
//             secondName: "Jose",
//             lastName: "Andino",
//             secondLastName: "Nunez",
//             targetSpbviCode: "SRV",
//           },
//         },
//         symbol: {
//           handle: "cop",
//         },
//         target: {
//           handle: "svgs:123456@gnbsudameris.com.co",
//           custom: {
//             documentType: "nidn",
//             documentNumber: "0801198607269",
//             firstName: "Carlos1",
//             secondName: "Jose1",
//             lastName: "Andino1",
//             secondLastName: "Nunez1",
//           },
//         },
//       },
//     ] as LedgerClaim[],
//     access: [{ action: AccessAction.Any, signer: { public: PUBLIC_KEY } }],
//     schema: "p2ppush",
//   };

//   const { response } = await sdk.intent
//     .init()
//     .data(transactionData)
//     .hash()
//     .sign([
//       {
//         keyPair,
//         custom: {
//           consented: "2025-04-14T14:23:45.123Z",
//           received: "2025-04-14T14:23:45.123Z",
//           dispatched: "2025-04-14T14:23:45.123Z",
//         },
//       },
//     ])
//     .send();
//   console.log("<br>El request es:", response.request);
//   console.log("<br>EL response data es:", response.data);
//   console.log("<br>El response es:", response.config);
//   console.log("<br>El response es:", response);
// }

// async function createTransactionP2B() {
//   /*const sdk = new LedgerSdk({
// 		ledger: 'rtpswitch-servibanca-v02',
// 		server: 'https://ldg-stg.one/api/v2',
// 		timeout: 15000,
// 		verifyResponseProofs: true,
//         signer: {
//                 format: 'ed25519-raw',
//                 public: 'ruoUJXl56DvcM0QLAt12WzUoEFhW+rbZt4XMqcCPQGQ='
//         },
// 		secure: {
// 			iss: 'carlos',
// 			sub: 'signer:carlos',
// 			aud: 'rtpswitch-servibanca-v02',
// 			exp: 60,
// 			keyPair: {
// 				format: 'ed25519-raw',
// 				public: 'ak40/ebXaPHdSwypXWHDlFaZZx0zdajPBz/dijLvdaE=',
// 				secret: 'pGpzlIcWPih1yYCgtQmYLchKjiHHWcMsZzALIksqGy8='
// 			}
// 		},
// 	});

//     const keyPair: LedgerKeyPair = {
//         format: 'ed25519-raw',
//         public: 'ak40/ebXaPHdSwypXWHDlFaZZx0zdajPBz/dijLvdaE=',
//         secret: 'pGpzlIcWPih1yYCgtQmYLchKjiHHWcMsZzALIksqGy8='
//       };

//     const transactionData = {
//         handle:"202404251139123123123",
//         claims: [
//             {
//               action: "transfer",
//               amount: 500,
//               source: {
//                 handle: "svgs:123456@gnbsudameris.com",
//                 custom: {
//                   documentType:"nidn",
//                   documentNumber:"0801198607268",
//                   firstName:"Carlos",
//                   secondName:"Jose",
//                   lastName:"Andino",
//                   secondLastName:"Nunez",
//                 }
//               },
//               symbol: {
//                 handle: "cop"
//               },
//               target: {
//                 handle: "svgs:123459@lulobank.com",
//                 custom: {
//                     documentType:"nidn",
//                     documentNumber:"0801198607269",
//                     name:"Comercio Prueba",
//                     merchantCode:"123123"
//                 }
//               }
//             }
//           ],
//         access: [ {action: AccessAction.Any, signer: { public:'ak40/ebXaPHdSwypXWHDlFaZZx0zdajPBz/dijLvdaE=' }} ],
//         schema: "p2bpush",

//     }

//       const {response} = await sdk.intent
//         .init()
//         .data(transactionData)
//         .hash()
//         .sign([{
//             keyPair,
//             custom: {
//                 consented:"2025-04-14T14:23:45.123Z",
//                 received:"2025-04-14T14:23:45.123Z",
//                 dispatched:"2025-04-14T14:23:45.123Z"
//             }

//         }])
//         .send();
//         console.log("<br>El request es:", response.request);
//         console.log("<br>EL response data es:", response.data);
//         console.log("<br>El response es:",response.config);
//         console.log("<br>El response es:", response)

//     */
// }

// updateAnchorData().catch(console.error);

createAnchor().catch(console.error);
