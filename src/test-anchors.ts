import { AnchorListParams, LedgerSdk } from "@minka/ledger-sdk";
import {
  //   LedgerClaim,
  LedgerKeyPair,
} from "@minka/ledger-sdk/types";
import util from "util";

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
// const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
// const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
// const LEDGER = "hector-ledger-test";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";
const AUDIENCE = "payment-hub-staging";

// htorohn
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// hector-bac
// const PUBLIC_KEY = "mZgQf7MvGjSHgevAF0ZhVfXGjX5Jyd8bHMdZJ0msEcE=";
// const SECRET_KEY = "ocOakPT0WW/vG7TZTHeg0nf4CJ2mfv/WrivaDQzo0j4=";
// const LEDGER = "toro-ledger";
// const LEDGER = "hector-ledger-test";
// const LEDGER = "payments-hub-hector-test";
// const SERVER = "https://ldg-dev.one/api/v2";
// const LEDGER = "ledger-bridge-test";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA="; // htorohn server key
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s="; // hector-bac server key
// const PUBLIC_SERVER_KEY = "vY5WiTerOBs7FVHLQcz+Y4L0pXXs6HtasskooJwcyqw="; // htorohn ledger-bridge-test
// const PUBLIC_SERVER_KEY = "sWf+wVQmbs+1lrjOpfwetHHMchQxDdEHVoCl6+1v1CI="; // htorohn lpayments-hub-hector-test dev server

const LEDGER = "payment-hub-staging";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";
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
      iss: PUBLIC_KEY,
      sub: "signer:htorohn",
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
    handle: "htorohn@icloud.com",
    target: "svgs:1543534534534@bancoamarillo.co",
    symbol: "cop",
    custom: {
      aliasType: "username",
      documentType: "cc",
      documentNumber: "080119860745",
      accountType: "svgs",
      accountNumber: "123457",
      firstName: "Hector",
      secondName: "Alfredo",
      lastName: "Toro",
      secondLastName: "del Cid",
      participantCode: "891234918",
      routingCode: "TFY",
    },
    schema: "individual",
  };

  try {
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
  } catch (error: any) {
    console.error("❌ Error in createAnchor:");

    // Extract status from the nested structure
    let status = null;
    if (error?.custom?.causedBy?.response?.status) {
      status = error.custom.causedBy.response.status;
    } else if (error?.custom?.causedBy?.status) {
      status = error.custom.causedBy.status;
    } else if (error?.response?.status) {
      status = error.response.status;
    }

    if (status) {
      console.error("❌ Response status:", status);
    }

    throw error; // Re-throw to be caught by the main error handler
  }
}

async function getAnchor() {
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
      iss: PUBLIC_KEY,
      sub: "signer:htorohn",
      aud: AUDIENCE,
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });

  sdk.anchor.setHeader("X-Received", "2025-04-14T14:23:45.123Z"); // value is an example without the proper format
  sdk.anchor.setHeader("X-Dispatched", "2025-04-14T14:23:45.123Z"); // value is an example without the proper format
  sdk.anchor.setHeader("X-use-case", "p2p"); // value is an example without the proper format
  sdk.anchor.setHeader("X-domain", "TFY"); // value is an example without the proper format

  /*
	const anchor = (await  sdk.anchor
                    .read('carlos998876@minka.io')
                    ).response.data;
    console.log("El Anchor  es:", anchor);
    */

  try {
    // const { response } = await sdk.anchor.read("@zeljko11");
    const { response } = await sdk.anchor.read("ricardo");

    console.log("<br>El Anchor response request es:", response.request);
    console.log("<br>El Anchor config es:", response.config);
    console.log(
      "<br>El Anchor response es:",
      util.inspect(response.data, { depth: null, colors: true })
    );
  } catch (error: any) {
    console.error("❌ Error in getAnchor:");

    // Extract status from the nested structure
    let status = null;
    if (error?.custom?.causedBy?.response?.status) {
      status = error.custom.causedBy.response.status;
    } else if (error?.custom?.causedBy?.status) {
      status = error.custom.causedBy.status;
    } else if (error?.response?.status) {
      status = error.response.status;
    }

    if (status) {
      console.error("❌ Response status:", status);
    }

    throw error; // Re-throw to be caught by the main error handler
  }
}

async function getAnchors() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: true,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: "carlos",
      sub: "signer:carlos",
      aud: "rtpswitch-servibanca-v02",
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });
  const params: AnchorListParams = {
    "meta.labels": "nidn:0801198607268",
  };

  /*const params:AnchorListParams = {
        "data.custom.documentNumber":"0801198607268",
        "data.custom.documentType":"nidn"
    }*/

  const anchors = await sdk.anchor.list(params);

  console.log(
    "Retrieved anchors list:",
    JSON.stringify(anchors.response.data, null, 4)
  );
}

async function updateAnchorStatus() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: true,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: "carlos",
      sub: "signer:carlos",
      aud: "rtpswitch-servibanca-v02",
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });

  const record = (await sdk.anchor.read("carlos59@minka.io")).response.data;

  console.log("El Anchor es:", record);
  const keyPair: LedgerKeyPair = {
    format: "ed25519-raw",
    public: PUBLIC_KEY,
    secret: SECRET_KEY,
  };

  await sdk.anchor
    //.with('carlos@minka.io')  ofr  signing for POST ALIAS AND POST INTENT
    .from(record)
    .data({
      ...record.data,
    })
    .hash()
    .sign([
      {
        keyPair,
        custom: {
          status: "active",
          moment: "2025-04-14T14:23:45.123Z",
        },
      },
    ])
    .send();
}

async function updateAnchorStatus2() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: true,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: "carlos",
      sub: "signer:carlos",
      aud: "rtpswitch-servibanca-v02",
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

  const record = (await sdk.anchor.read("carlos5@minka.io")).response.data;
  console.log("El Anchor es:", record);
  await sdk.anchor
    //.with('carlos@minka.io')  ofr  signing for POST ALIAS AND POST INTENT
    .from(record)
    .data({
      ...record.data,
    })
    .hash()
    .sign([
      {
        keyPair,
        custom: {
          status: "INACTIVE",
          moment: "2025-04-14T14:23:45.123Z",
        },
      },
    ])
    .send();
}

async function dropAnchor() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    verifyResponseProofs: false,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: "carlos",
      sub: "signer:carlos",
      aud: "rtpswitch-servibanca-v02",
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

  const droppedAnchor = await sdk.anchor
    .with("@htorohn3")
    .drop()
    .hash()
    .sign([
      {
        keyPair,
        custom: {
          status: "CANCELLED",
          moment: "2025-04-15T14:23:45.123Z",
        },
      },
    ])
    .send();

  console.log(
    "Dropped anchor:",
    JSON.stringify(droppedAnchor.response.data, null, 4)
  );
}

async function updateAnchorData() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: true,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: "carlos",
      sub: "signer:carlos",
      aud: "rtpswitch-servibanca-v02",
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });

  const record = (await sdk.anchor.read("carlos129833da@minka.io")).response
    .data;
  const updateData = record;
  updateData.data.custom = {
    ...updateData.data.custom,
    firstName: "Carlo111114",
  };

  console.log("El Anchor es:", record);
  const keyPair: LedgerKeyPair = {
    format: "ed25519-raw",
    public: PUBLIC_KEY,
    secret: SECRET_KEY,
  };

  const updatedAnchor = await sdk.anchor
    .from(record)
    .data({
      ...updateData.data,
      custom: updateData.data.custom,
    })
    .hash()
    .sign([
      {
        keyPair,
        custom: {
          status: "UPDATE",
          moment: "2025-04-14T14:23:45.123Z",
        },
      },
    ])
    .send();

  console.log(
    "Updated anchor:",
    JSON.stringify(updatedAnchor.response.data, null, 4)
  );
}

async function signAnchor() {
  const sdk = new LedgerSdk({
    ledger: LEDGER,
    server: SERVER,
    timeout: 15000,
    verifyResponseProofs: true,
    signer: {
      format: "ed25519-raw",
      public: PUBLIC_SERVER_KEY,
    },
    secure: {
      iss: PUBLIC_KEY,
      sub: "signer:htorohn",
      aud: AUDIENCE,
      exp: 60,
      keyPair: {
        format: "ed25519-raw",
        public: PUBLIC_KEY,
        secret: SECRET_KEY,
      },
    },
  });
  // First read the current anchor data
  const { response: anchorResponse } = await sdk.anchor.read("@htorohn");
  console.log("El anchor response es:", anchorResponse.data);

  const builder = sdk.anchor
    .from(anchorResponse.data)
    .hash()

    .sign([
      {
        keyPair: {
          format: "ed25519-raw",
          public: PUBLIC_KEY,
          secret: SECRET_KEY,
        },
        custom: {
          status: "SUSPENDED",
          moment: new Date().toISOString(),
          operation: "verification",
        },
      },
    ]);

  console.log(
    "🔍 SDK Builder data:",
    util.inspect(builder, { depth: 3, colors: true })
  );

  const { response: signedResponse } = await builder.send();

  console.log(
    "El signed response es:",
    util.inspect(signedResponse.data, { depth: null, colors: true })
  );
}

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

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log("Usage: npm run ts-node src/test-anchors.ts <command>");
    console.log("Available commands:");
    console.log("  createAnchor        - Create a new anchor");
    console.log("  getAnchor          - Get an existing anchor");
    console.log("  getAnchors         - List anchors with filters");
    console.log("  updateAnchorStatus - Update anchor status to active");
    console.log("  updateAnchorStatus2- Update anchor status to inactive");
    console.log("  dropAnchor         - Drop/cancel an anchor");
    console.log("  updateAnchorData   - Update anchor data");
    console.log("  signAnchor         - Sign an existing anchor");
    return;
  }

  try {
    switch (command) {
      case "createAnchor":
        console.log("🔄 Creating anchor...");
        await createAnchor();
        break;
      case "getAnchor":
        console.log("🔍 Getting anchor...");
        await getAnchor();
        break;
      case "getAnchors":
        console.log("📋 Listing anchors...");
        await getAnchors();
        break;
      case "updateAnchorStatus":
        console.log("✅ Updating anchor status to active...");
        await updateAnchorStatus();
        break;
      case "updateAnchorStatus2":
        console.log("❌ Updating anchor status to inactive...");
        await updateAnchorStatus2();
        break;
      case "dropAnchor":
        console.log("🗑️ Dropping anchor...");
        await dropAnchor();
        break;
      case "updateAnchorData":
        console.log("📝 Updating anchor data...");
        await updateAnchorData();
        break;
      case "signAnchor":
        console.log("✍️ Signing anchor...");
        await signAnchor();
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log(
          "Available commands: createAnchor, getAnchor, getAnchors, updateAnchorStatus, updateAnchorStatus2, dropAnchor, updateAnchorData, signAnchor"
        );
    }
  } catch (error: any) {
    console.error(
      "❌ Error executing command:",
      util.inspect(error?.custom?.causedBy?.response?.data || error, {
        depth: null,
        colors: true,
      })
    );

    // Extract status from the nested structure
    let status = null;
    if (error?.custom?.causedBy?.response?.status) {
      console.log("custom.causedBy.respose.status");
      status = error.custom.causedBy.response.status;
    } else if (error?.custom?.causedBy?.status) {
      console.log("custom.causedBy.status");
      status = error.custom.causedBy.status;
    } else if (error?.response?.status) {
      console.log("response.status");
      status = error.response.status;
    }

    if (status) {
      console.error("❌ Response status:", status);
    }

    // Log the custom section to see the full error structure
    if (error?.custom) {
      console.error(
        "❌ Custom error details:",
        util.inspect(error.custom, { depth: 1, colors: true })
      );
    }
  }
}

// Export getAnchor function for individual use
export { getAnchor };

// Run main function if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
