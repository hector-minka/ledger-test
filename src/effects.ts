import { LedgerSdk } from "@minka/ledger-sdk";
import {
  AccessAction,
  EffectActionSchema,
  EventSignal,
  LedgerKeyPair,
} from "@minka/ledger-sdk/types";

// Informacion para firmar los proof

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
// const LEDGER = "payment-hub-staging";

const LEDGER = "ph-demo";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A="; // htorohn lpayments-hub-hector-test dev server

// const LEDGER = "ph-demo";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "F1jP1QlOt2stfMYmP4E39gMclnuHVEG3Tlo/zIq7vbs="; // htorohn lpayments-hub-hector-test dev server

// const LEDGER = "alianza-beta";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "kuVd5x0aRp9RsDciy948pcnRT6v2ResWjECHH7TPhO0="; // htorohn lpayments-hub-hector-test dev server

// const LEDGER = "alianza-stg";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "r4H7Zvpxih7dlW3MeTH0M9aqOUMkDuZUOWsFMz3lHFw=";

// const LEDGER = "ledger-bridge-test";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA="; // htorohn server key
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s="; // hector-bac server key
// const PUBLIC_SERVER_KEY = "vY5WiTerOBs7FVHLQcz+Y4L0pXXs6HtasskooJwcyqw="; // htorohn ledger-bridge-test
// const PUBLIC_SERVER_KEY = "sWf+wVQmbs+1lrjOpfwetHHMchQxDdEHVoCl6+1v1CI="; // htorohn lpayments-hub-hector-test dev server

// const getOwnerAccessRules = (publicKey: string) => {
//   return [
//     {
//       action: "any",
//       signer: {
//         public: publicKey,
//       },
//     },
//     {
//       action: "read",
//       bearer: {
//         $signer: {
//           public: publicKey,
//         },
//       },
//     },
//   ] as any;
// };

async function createEffect() {
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
      iss: PUBLIC_KEY, // signer handle or public key
      sub: "signer:htorohn", // signer:<handle>, bridge:<handle>, ...
      aud: LEDGER, // ledger handle or public key
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

  const effect = await sdk.effect.read("mol_trans_proof_add");
  await sdk.effect
    .from(effect.response.data)
    .data({
      handle: "mol_trans_proof_add",
      signal: EventSignal.IntentProofsAdded,
      action: {
        schema: EffectActionSchema.webhook,
        endpoint:
          "https://srv-mol-bridge-628322236251.us-east4.run.app/ledger/intent-proof-added",
      },
      filter: {
        schema: {
          $in: ["credit"],
        },
      },
      //   filter: {
      //     "proofs.0.custom.status": {
      //       $in: ["prepared", "accepted", "failed"],
      //     },
      //     "proofs.0.public": PUBLIC_SERVER_KEY, //F1jP1QlOt2stfMYmP4E39gMclnuHVEG3Tlo/zIq7vbs=
      //   },

      access: [
        {
          action: AccessAction.Any,
          signer: {
            public: PUBLIC_KEY,
          },
        },
      ],
    })
    .hash()
    .sign([{ keyPair }])
    .send();
}

createEffect();
