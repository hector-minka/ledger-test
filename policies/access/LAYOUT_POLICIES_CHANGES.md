# Layout Policies Update Guide

## Overview

This document explains the changes made to the layout policies file to align with the updated Payments Hub policy configuration.

## File Location

**Updated File:** `layout-policies-updated.ts`

**Original File:** (Your existing layout policies file - replace with updated version)

## Key Changes Summary

### 1. Added Services Policy (NEW)

**Added:** Complete `CIRCLE_SERVICES` policy definition

**Purpose:** Bridge operations and payment processing

**Key Features:**
- Payment operations: `spend`, `commit`, `abort` on wallets
- Intent management: create intents and intent-proofs
- Anchor management: full anchor operations
- Read/query: intents and wallets

**Why:** Bridges need complete payment flow functionality without owner privileges.

---

### 2. Updated Owner Policy

#### Added Record Types (Create Action)
- `anchor-proof`
- `bridge-proof`
- `circle-proof`
- `domain-proof`
- `effect`, `effect-proof`
- `ledger-proof`
- `policy-proof`
- `request`
- `schema-proof`
- `server`
- `signer-proof`
- `signer-factor`, `signer-factor-proof`, `signer-factor-secret`
- `symbol-proof`
- `wallet-proof`

#### Added Actions
- `abort` - Cancel operations
- `activate` - Activate records
- `assign-signer` - Assign signers
- `commit` - Finalize transactions
- `destroy` - Destroy records
- `issue` - Issue assets
- `limit` - Set limits
- `lookup` - Perform lookups
- `remove-signer` - Remove signers
- `spend` - Execute payments
- `reveal` - Reveal information

#### Added PH-Standard Reports
- `trans_details_rep`
- `ledger_movement_rep`
- `ledger_participants_rep`

---

### 3. Updated Admin Policy

#### Added Record Types (Any Action)
- `anchor-proof`
- `bridge-proof`
- `circle-proof`
- `domain-proof`
- `effect`, `effect-proof`
- `ledger-proof`
- `policy-proof`
- `request`
- `schema-proof`
- `server`
- `signer-proof`
- `signer-factor`, `signer-factor-proof`, `signer-factor-secret`
- `symbol-proof`
- `wallet-proof`

#### Added PH-Standard Reports
- `trans_details_rep`
- `ledger_movement_rep`
- `ledger_participants_rep`

---

### 4. Updated Security Policy

#### Added Record Types (Any Action)
- `anchor-proof`
- `bridge-proof`
- `circle-proof`
- `domain-proof`
- `effect`, `effect-proof`
- `ledger-proof`
- `policy-proof`
- `request`
- `schema-proof`
- `server`
- `signer-proof`
- `signer-factor`, `signer-factor-proof`, `signer-factor-secret`
- `symbol-proof`
- `wallet-proof`

**Note:** Security policy does not create reports, so no report schemas added.

---

### 5. Updated Operations Policy

#### Added PH-Standard Reports
- `trans_details_rep`
- `ledger_movement_rep`
- `ledger_participants_rep`

**Report Schemas Now Include:**
- `billing`
- `reconciliation`
- `trans_details_rep` (PH-standard)
- `ledger_movement_rep` (PH-standard)
- `ledger_participants_rep` (PH-standard)

---

### 6. Support Policy

**No Changes** - Remains read-only as designed.

---

## Code Structure Improvements

### Added Constants

```typescript
// PH-standard report schemas
const PH_STANDARD_REPORTS = [
  'trans_details_rep',
  'ledger_movement_rep',
  'ledger_participants_rep',
] as const
```

**Benefit:** Centralized definition of PH-standard reports for easy maintenance.

### Import Updates

Added `CIRCLE_SERVICES` to imports:

```typescript
import {
  CIRCLE_ADMIN,
  CIRCLE_OPERATION,
  CIRCLE_OWNER,
  CIRCLE_SECURITY,
  CIRCLE_SUPPORT,
  CIRCLE_SERVICES,  // NEW
  SCHEMA_POLICY_ACCESS,
} from './constants'
```

---

## Migration Steps

1. **Backup Current File**
   ```bash
   cp your-layout-policies-file.ts your-layout-policies-file.ts.backup
   ```

2. **Replace with Updated Version**
   - Copy contents from `layout-policies-updated.ts`
   - Or merge changes manually if you have custom modifications

3. **Verify Constants**
   - Ensure `CIRCLE_SERVICES` is defined in your constants file
   - Verify all `AccessRecord` and `AccessAction` enums are available

4. **Test**
   - Run your layout generation
   - Verify all policies are created correctly
   - Test each circle's permissions

5. **Deploy**
   - Deploy to development environment
   - Test all operations
   - Deploy to production after validation

---

## Verification Checklist

- [ ] Services policy is created
- [ ] Owner policy has all 17 actions
- [ ] Owner policy has all 29 record types
- [ ] Admin policy has all record types
- [ ] Security policy has all record types
- [ ] Operations policy has PH-standard reports
- [ ] Admin policy has PH-standard reports
- [ ] Owner policy has PH-standard reports
- [ ] All policies compile without errors
- [ ] Layout generation works correctly

---

## Comparison: Before vs After

### Before
- ❌ No services policy
- ❌ Owner missing 11 actions
- ❌ Admin/Security missing 16 record types
- ❌ No PH-standard reports in admin/operations
- ❌ Incomplete payment flows for bridges

### After
- ✅ Services policy for bridges
- ✅ Owner has all 17 actions
- ✅ Admin/Security have all record types
- ✅ All report-creating policies have PH-standard reports
- ✅ Complete payment flows for bridges

---

## Notes

1. **Services Policy:** This is a PH-only policy. If you're working with RTP, you may not need this policy.

2. **PH-Standard Reports:** These are specific to Payments Hub. They provide additional reporting capabilities beyond the standard Minka reports.

3. **Record Types:** The added record types (proofs, effects, etc.) are essential for proper Minka ledger functionality and were missing in the original PH policies.

4. **Actions:** The added actions (spend, commit, abort, etc.) are critical for payment processing and were missing in the original PH owner policy.

---

## References

- See `FINAL_POLICY_CONFIGURATION.md` for complete policy documentation
- See `POLICY_ANALYSIS.md` for detailed analysis of changes
- See `CHANGES_SUMMARY.md` for summary of all modifications






