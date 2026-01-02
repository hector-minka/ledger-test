import {
  AccessAction,
  AccessRecord,
  LayoutRecordValues,
  LedgerPolicy,
} from '@minka/types'

import { RECORD_DEFAULTS } from '../../../services/record.service'

import {
  CIRCLE_ADMIN,
  CIRCLE_OPERATION,
  CIRCLE_OWNER,
  CIRCLE_SECURITY,
  CIRCLE_SUPPORT,
  CIRCLE_SERVICES,
  SCHEMA_POLICY_ACCESS,
} from './constants'

// PH-standard report schemas
const PH_STANDARD_REPORTS = [
  'trans_details_rep',
  'ledger_movement_rep',
  'ledger_participants_rep',
] as const

export const createStudioNavigationPolicies =
  (): LayoutRecordValues<LedgerPolicy> => [
    {
      data: {
        ...RECORD_DEFAULTS,
        handle: 'studio-navigation',
        schema: SCHEMA_POLICY_ACCESS,
        record: AccessRecord.Any,
        values: [
          {
            action: AccessAction.Manage,
            record: AccessRecord.Any,
            signer: { $circle: CIRCLE_OWNER },
          },
          {
            action: AccessAction.Manage,
            record: AccessRecord.Any,
            signer: { $circle: CIRCLE_ADMIN },
          },
          {
            action: AccessAction.Manage,
            record: {
              $in: [
                AccessRecord.Domain,
                AccessRecord.Signer,
                AccessRecord.Circle,
                AccessRecord.CircleSigner,
              ],
            },
            signer: { $circle: CIRCLE_SECURITY },
          },
          {
            action: AccessAction.Manage,
            record: {
              $in: [
                AccessRecord.Domain,
                AccessRecord.Signer,
                AccessRecord.Circle,
                AccessRecord.CircleSigner,
                AccessRecord.Wallet,
                AccessRecord.Intent,
                AccessRecord.Report,
              ],
            },
            signer: { $circle: CIRCLE_OPERATION },
          },
          {
            action: AccessAction.Manage,
            record: AccessRecord.Any,
            signer: { $circle: CIRCLE_SUPPORT },
          },
        ],
      },
    },
  ]

export const createCirclePolicies = (): LayoutRecordValues<LedgerPolicy> => [
  {
    data: {
      ...RECORD_DEFAULTS,
      handle: CIRCLE_OWNER,
      schema: SCHEMA_POLICY_ACCESS,
      record: AccessRecord.Any,
      values: [
        /**
         * Allow owners to create any record except from report, then allow
         * owners to perform any operation except create. This will effectively
         * give any-any but exclude report-create.
         */
        {
          action: AccessAction.Create,
          record: {
            $in: [
              AccessRecord.Anchor,
              AccessRecord.AnchorProof,
              AccessRecord.Bridge,
              AccessRecord.BridgeProof,
              AccessRecord.Circle,
              AccessRecord.CircleProof,
              AccessRecord.CircleSigner,
              AccessRecord.Domain,
              AccessRecord.DomainProof,
              AccessRecord.Effect,
              AccessRecord.EffectProof,
              AccessRecord.Intent,
              AccessRecord.IntentProof,
              AccessRecord.Ledger,
              AccessRecord.LedgerProof,
              AccessRecord.Policy,
              AccessRecord.PolicyProof,
              AccessRecord.ReportProof,
              AccessRecord.Request,
              AccessRecord.Schema,
              AccessRecord.SchemaProof,
              AccessRecord.Server,
              AccessRecord.Signer,
              AccessRecord.SignerProof,
              AccessRecord.SignerFactor,
              AccessRecord.SignerFactorProof,
              AccessRecord.SignerFactorSecret,
              AccessRecord.Symbol,
              AccessRecord.SymbolProof,
              AccessRecord.Wallet,
              AccessRecord.WalletProof,
            ],
          },
          signer: { $circle: CIRCLE_OWNER },
        },
        {
          action: {
            $in: [
              AccessAction.Abort,
              AccessAction.Access,
              AccessAction.Activate,
              AccessAction.AssignSigner,
              AccessAction.Commit,
              AccessAction.Destroy,
              AccessAction.Drop,
              AccessAction.Issue,
              AccessAction.Limit,
              AccessAction.Lookup,
              AccessAction.Manage,
              AccessAction.Query,
              AccessAction.Read,
              AccessAction.RemoveSigner,
              AccessAction.Spend,
              AccessAction.Update,
              AccessAction.Reveal,
            ],
          },
          record: AccessRecord.Any,
          signer: { $circle: CIRCLE_OWNER },
        },
        /**
         * Explicitly allow owners to create the reports we want to allow.
         * Includes PH-standard reports.
         */
        {
          action: AccessAction.Create,
          record: AccessRecord.Report,
          change: {
            schema: {
              $in: [
                'billing',
                'reconciliation',
                'export-changes',
                'export-journal',
                ...PH_STANDARD_REPORTS,
              ],
            },
          },
          signer: { $circle: CIRCLE_OWNER },
        },
        {
          action: AccessAction.Read,
          bearer: { $signer: { $circle: CIRCLE_OWNER } },
        },
      ],
    },
  },
  {
    data: {
      ...RECORD_DEFAULTS,
      handle: CIRCLE_ADMIN,
      schema: SCHEMA_POLICY_ACCESS,
      record: AccessRecord.Any,
      values: [
        {
          action: AccessAction.Any,
          record: { $in: [AccessRecord.Circle, AccessRecord.CircleSigner] },
          filter: {
            handle: {
              $regex: '^(?!.*owner).*$|^owner@.*$',
            },
          },
          signer: { $circle: CIRCLE_ADMIN },
        },
        {
          action: AccessAction.Create,
          record: AccessRecord.Circle,
          signer: { $circle: CIRCLE_ADMIN },
        },
        {
          action: { $in: [AccessAction.Create, AccessAction.Update] },
          record: AccessRecord.Policy,
          signer: { $circle: CIRCLE_ADMIN },
        },
        {
          action: {
            $in: [AccessAction.Update, AccessAction.Read, AccessAction.Drop],
          },
          record: AccessRecord.Report,
          signer: { $circle: CIRCLE_ADMIN },
        },
        {
          action: AccessAction.Create,
          record: AccessRecord.Report,
          signer: { $circle: CIRCLE_ADMIN },
          change: {
            schema: {
              $in: [
                'billing',
                'reconciliation',
                'export-changes',
                'export-journal',
                ...PH_STANDARD_REPORTS,
              ],
            },
          },
        },
        {
          action: AccessAction.Any,
          record: {
            $in: [
              AccessRecord.Anchor,
              AccessRecord.AnchorProof,
              AccessRecord.Bridge,
              AccessRecord.BridgeProof,
              AccessRecord.CircleProof,
              AccessRecord.Domain,
              AccessRecord.DomainProof,
              AccessRecord.Effect,
              AccessRecord.EffectProof,
              AccessRecord.Intent,
              AccessRecord.IntentProof,
              AccessRecord.Ledger,
              AccessRecord.LedgerProof,
              AccessRecord.PolicyProof,
              AccessRecord.ReportProof,
              AccessRecord.Request,
              AccessRecord.Schema,
              AccessRecord.SchemaProof,
              AccessRecord.Server,
              AccessRecord.Signer,
              AccessRecord.SignerProof,
              AccessRecord.SignerFactor,
              AccessRecord.SignerFactorProof,
              AccessRecord.SignerFactorSecret,
              AccessRecord.Symbol,
              AccessRecord.SymbolProof,
              AccessRecord.Wallet,
              AccessRecord.WalletProof,
            ],
          },
          signer: { $circle: CIRCLE_ADMIN },
        },
        {
          action: { $in: [AccessAction.Read, AccessAction.Query] },
          bearer: { $signer: { $circle: CIRCLE_ADMIN } },
        },
      ],
    },
  },
  {
    data: {
      ...RECORD_DEFAULTS,
      handle: CIRCLE_SECURITY,
      schema: SCHEMA_POLICY_ACCESS,
      record: AccessRecord.Any,
      values: [
        {
          action: AccessAction.Any,
          record: { $in: [AccessRecord.Circle, AccessRecord.CircleSigner] },
          filter: {
            handle: {
              $in: [
                CIRCLE_ADMIN,
                CIRCLE_SECURITY,
                CIRCLE_OPERATION,
                CIRCLE_SUPPORT,
              ],
            },
          },
          signer: { $circle: CIRCLE_SECURITY },
        },
        {
          action: AccessAction.Create,
          record: AccessRecord.Circle,
          signer: { $circle: CIRCLE_SECURITY },
        },
        {
          action: AccessAction.Create,
          record: AccessRecord.Policy,
          signer: { $circle: CIRCLE_SECURITY },
          change: {
            schema: {
              $in: [SCHEMA_POLICY_ACCESS],
            },
          },
        },
        {
          action: AccessAction.Any,
          record: {
            $in: [
              AccessRecord.Anchor,
              AccessRecord.AnchorProof,
              AccessRecord.BridgeProof,
              AccessRecord.CircleProof,
              AccessRecord.DomainProof,
              AccessRecord.Effect,
              AccessRecord.EffectProof,
              AccessRecord.Intent,
              AccessRecord.IntentProof,
              AccessRecord.Ledger,
              AccessRecord.LedgerProof,
              AccessRecord.PolicyProof,
              AccessRecord.ReportProof,
              AccessRecord.Request,
              AccessRecord.Schema,
              AccessRecord.SchemaProof,
              AccessRecord.Server,
              AccessRecord.Signer,
              AccessRecord.SignerProof,
              AccessRecord.SignerFactor,
              AccessRecord.SignerFactorProof,
              AccessRecord.SignerFactorSecret,
              AccessRecord.Symbol,
              AccessRecord.SymbolProof,
              AccessRecord.Wallet,
              AccessRecord.WalletProof,
            ],
          },
          signer: { $circle: CIRCLE_SECURITY },
        },
        {
          action: { $in: [AccessAction.Read, AccessAction.Query] },
          bearer: { $signer: { $circle: CIRCLE_SECURITY } },
        },
      ],
    },
  },
  {
    data: {
      ...RECORD_DEFAULTS,
      handle: CIRCLE_OPERATION,
      schema: SCHEMA_POLICY_ACCESS,
      record: AccessRecord.Any,
      values: [
        // Operation's circle should be able to read reports
        // and also create new ones.
        // It should have access granted to read any record
        // in order to create the reports
        // Note: requirement to read wallet and balances are
        //       covered with this 'any'
        {
          action: { $in: [AccessAction.Read, AccessAction.Query] },
          record: {
            $in: [
              AccessRecord.Schema,
              AccessRecord.Wallet,
              AccessRecord.Report,
              AccessRecord.Domain,
              AccessRecord.Signer,
              AccessRecord.Circle,
              AccessRecord.Intent,
              AccessRecord.CircleSigner,
            ],
          },
          bearer: { $signer: { $circle: CIRCLE_OPERATION } },
        },
        {
          action: AccessAction.Create,
          record: AccessRecord.ReportProof,
          signer: { $circle: CIRCLE_OPERATION },
        },
        {
          action: AccessAction.Create,
          record: AccessRecord.Report,
          signer: { $circle: CIRCLE_OPERATION },
          change: {
            schema: {
              $in: ['billing', 'reconciliation', ...PH_STANDARD_REPORTS],
            },
          },
        },
      ],
    },
  },
  {
    data: {
      ...RECORD_DEFAULTS,
      handle: CIRCLE_SUPPORT,
      schema: SCHEMA_POLICY_ACCESS,
      record: AccessRecord.Any,
      values: [
        {
          action: { $in: [AccessAction.Read, AccessAction.Query] },
          bearer: { $signer: { $circle: CIRCLE_SUPPORT } },
        },
      ],
    },
  },
  {
    data: {
      ...RECORD_DEFAULTS,
      handle: CIRCLE_SERVICES,
      schema: SCHEMA_POLICY_ACCESS,
      record: AccessRecord.Any,
      values: [
        /**
         * Read/Query operations for intents and wallets
         */
        {
          action: { $in: [AccessAction.Read, AccessAction.Query] },
          record: {
            $in: [AccessRecord.Intent, AccessRecord.Wallet],
          },
          bearer: { $signer: { $circle: CIRCLE_SERVICES } },
        },
        /**
         * Intent management - bridges need to create intents and intent-proofs
         */
        {
          action: AccessAction.Create,
          record: AccessRecord.Intent,
          signer: { $circle: CIRCLE_SERVICES },
        },
        {
          action: AccessAction.Create,
          record: AccessRecord.IntentProof,
          signer: { $circle: CIRCLE_SERVICES },
        },
        /**
         * Payment operations - complete flow (spend, commit, abort)
         * This allows bridges to execute complete payment transactions
         * without needing owner circle privileges.
         */
        {
          action: {
            $in: [AccessAction.Spend, AccessAction.Commit, AccessAction.Abort],
          },
          record: AccessRecord.Wallet,
          signer: { $circle: CIRCLE_SERVICES },
        },
        /**
         * Anchor management - bridges need full anchor operations
         */
        {
          action: {
            $in: [
              AccessAction.Create,
              AccessAction.Update,
              AccessAction.Read,
              AccessAction.Query,
              AccessAction.Drop,
              AccessAction.Manage,
              AccessAction.Access,
            ],
          },
          record: AccessRecord.Anchor,
          signer: { $circle: CIRCLE_SERVICES },
        },
      ],
    },
  },
]

export const createPoliciesData = (): LayoutRecordValues<LedgerPolicy> => {
  const studioNavigation = createStudioNavigationPolicies() as any[]
  const circles = createCirclePolicies() as any[]

  return [...studioNavigation, ...circles] as LayoutRecordValues<LedgerPolicy>
}






