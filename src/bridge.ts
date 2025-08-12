import express from "express";
import util from "util";
import { prepareCreditWithSdk, prepareDebitWithSdk } from "./intents-sdk";

// TypeScript interfaces for the debit request data
interface CustomData {
  name: string;
  idType: string;
  idNumber: string;
  entityType: string;
  phoneNumber?: string;
}

interface Signer {
  public: string;
}

interface Bearer {
  $signer: {
    public: string;
  };
}

interface Access {
  action: string;
  signer?: Signer;
  bearer?: Bearer;
}

interface Symbol {
  handle: string;
}

interface Source {
  custom: CustomData;
  handle: string;
}

interface Target {
  custom: CustomData;
  handle: string;
}

interface Claim {
  action: string;
  amount: number;
  source: Source;
  symbol: Symbol;
  target: Target;
}

interface IntentData {
  access: Access[];
  claims: Claim[];
  handle: string;
  schema: string;
}

interface Proof {
  custom: {
    moment?: string;
    status?: string;
    luid?: string;
  };
  digest: string;
  method: string;
  public: string;
  result: string;
}

interface IntentMeta {
  moment: string;
  owners: string[];
  proofs: Proof[];
  status: string;
  thread: string;
}

interface Intent {
  data: IntentData;
  hash: string;
  luid: string;
  meta: IntentMeta;
}

interface DebitData {
  luid: string;
  amount: number;
  handle: string;
  inputs: number[];
  intent: Intent;
  schema: string;
  source: Source;
  symbol: Symbol;
  target: Target;
}

interface DebitRequest {
  data: DebitData;
  hash: string;
  meta: {
    proofs: Proof[];
  };
}

const app = express();

// Parse command line arguments for port
const args = process.argv.slice(2);
let portArg: string | undefined;

// Look for -p flag in command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "-p" && i + 1 < args.length) {
    portArg = args[i + 1];
    break;
  }
}

// Priority: command line argument (-p) > environment variable (PORT) > default (3000)
const PORT = portArg || process.env["PORT"] || 3000;

// Middleware
app.use(express.json());

// POST /api/v2/debits
app.post(
  "/api/v2/debits",
  async (req: express.Request<{}, {}, DebitRequest>, res: express.Response) => {
    try {
      console.info(
        "INTENT DATA:",
        util.inspect(req.body, { depth: null, colors: true })
      );

      // Now you can safely access typed properties
      const { data } = req.body;
      console.log(
        `Processing debit for amount: ${data.amount} ${data.symbol.handle}`
      );
      console.log(`From: ${data.source.custom.name} (${data.source.handle})`);
      console.log(`To: ${data.target.custom.name} (${data.target.handle})`);
      console.log(`Intent handle: ${data.intent.data.handle}`);

      // const { source, target, amount, symbol = "lps" } = req.body;
      //   await testReadIntent(data.intent.data.handle);
      prepareDebitWithSdk(data.intent.data.handle);
      console.log("sending acknowledge...");
      res.status(202).send();
    } catch (error) {
      console.error("Error creating debit intent:", error);
      res.status(500).json({
        error: "Failed to create transfer intent",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
// POST /api/v2/debits
app.post(
  "/api/v2/credits",
  async (req: express.Request<{}, {}, DebitRequest>, res: express.Response) => {
    try {
      console.info(
        "INTENT DATA:",
        util.inspect(req.body, { depth: null, colors: true })
      );

      // Now you can safely access typed properties
      const { data } = req.body;
      console.log(
        `Processing debit for amount: ${data.amount} ${data.symbol.handle}`
      );
      console.log(`From: ${data.source.custom.name} (${data.source.handle})`);
      console.log(`To: ${data.target.custom.name} (${data.target.handle})`);
      console.log(`Intent handle: ${data.intent.data.handle}`);

      // const { source, target, amount, symbol = "lps" } = req.body;
      //   await testReadIntent(data.intent.data.handle);
      prepareCreditWithSdk(data.intent.data.handle);
      console.log("sending acknowledge...");
      res.status(202).send();
    } catch (error) {
      console.error("Error creating debit intent:", error);
      res.status(500).json({
        error: "Failed to create transfer intent",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bridge server running on port ${PORT}`);
  console.log(`📡 POST /api/v2/debits - Create transfer intent`);
  console.log(`📡 POST /api/v2/credits - Create transfer intent`);
  console.log(`🏥 GET /health - Health check`);
});

export default app;
