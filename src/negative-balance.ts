import { LedgerSdk } from "@minka/ledger-sdk";
import {
  ClaimAction,
  LedgerKeyPair,
  LimitClaimMetric,
} from "@minka/ledger-sdk/types";

// const SIGNER = "htorohn";
const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// hector-bac
// const PUBLIC_KEY = "mZgQf7MvGjSHgevAF0ZhVfXGjX5Jyd8bHMdZJ0msEcE=";
// const SECRET_KEY = "ocOakPT0WW/vG7TZTHeg0nf4CJ2mfv/WrivaDQzo0j4=";

// htorohn-bac
// const SIGNER = "htorohn-bac";
// const PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
// const SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";

// const LEDGER = "toro-ledger";
// const LEDGER = "hector-ledger-test";
// // const PUBLIC_SERVER_KEY = "9nwKxTS2IT2CQMtFGw0oWbOWPCkD7NRwSVMin2EQlzA=";
// const PUBLIC_SERVER_KEY = "MMko0OM/+lNtdKR+D9SvgZul1KiZXjZ5slLkGEBTO9s=";
// const LEDGER = "alianza-stg";
// const SERVER = "https://ldg-stg.one/api/v2";
// const SERVER = "https://ldg-stg.one/api/v2";
// const PUBLIC_SERVER_KEY = "TXbyuxpHVEzqjaLOya1KCMRRNESZZd9oV9FFDD+1M/A=";

const LEDGER = "ph-demo";
const SERVER = "https://ldg-stg.one/api/v2";
const PUBLIC_SERVER_KEY = "F1jP1QlOt2stfMYmP4E39gMclnuHVEG3Tlo/zIq7vbs=";

async function negativeBalance() {
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

  await sdk.intent
    .init()
    .data({
      handle: sdk.handle.unique(),
      claims: [
        {
          action: ClaimAction.Limit,
          metric: LimitClaimMetric.MinBalance,
          amount: -1e10,
          wallet: { handle: "fineract.com.co" },
          symbol: { handle: "cop" },
        },
      ],
      schema: "wallet-limit",
    })
    .hash()
    .sign([
      {
        keyPair: keyPair,
      },
    ])
    .send();
}

negativeBalance();
