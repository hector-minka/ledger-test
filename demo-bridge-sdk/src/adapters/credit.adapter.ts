import {
  AbortResult,
  CommitResult,
  IBankAdapter,
  PrepareResult,
  ResultStatus,
  TransactionContext,
} from "@minka/bridge-sdk";

export class SyncCreditBankAdapter extends IBankAdapter {
  prepare(context: TransactionContext): Promise<PrepareResult> {
    console.log("RECEIVED POST /v2/credits");

    let result: PrepareResult;

    result = {
      status: ResultStatus.Prepared,
    };

    return Promise.resolve(result);
  }

  abort(context: TransactionContext): Promise<AbortResult> {
    console.log("RECEIVED POST /v2/credits/abort");

    let result: AbortResult;

    result = {
      status: ResultStatus.Aborted,
    };

    return Promise.resolve(result);
  }

  commit(context: TransactionContext): Promise<CommitResult> {
    console.log("RECEIVED POST /v2/credits/commit");

    let result: CommitResult;

    result = {
      status: ResultStatus.Committed,
    };

    return Promise.resolve(result);
  }

  getEntry(context: TransactionContext): {
    schema: string;
    target: string;
    source: string;
    amount: number;
    symbol: string;
  } {
    return {
      schema: context.entry.schema,
      target: context.entry.target!.handle,
      source: context.entry.source!.handle,
      amount: context.entry.amount,
      symbol: context.entry.symbol.handle,
    };
  }
}
