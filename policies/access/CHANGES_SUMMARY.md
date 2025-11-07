# Payments Hub Policy Updates - Changes Summary

This document summarizes the changes made to each Payments Hub policy file based on the RTP policy analysis.

## Files Created

The following new policy files have been created with recommended updates:

1. `admin-ph.json` - Updated admin policy
2. `operations-ph.json` - Updated operations policy  
3. `security-ph.json` - Updated security policy
4. `owner-ph.json` - Updated owner policy
5. `support-ph.json` - Updated support policy (no changes needed, but included for consistency)
6. `services-ph.json` - Services policy (PH-only, preserved as-is)

**Note:** Original files (`*-ph-original.json`) remain unchanged as requested.

---

## Detailed Changes by Policy

### 1. admin-ph.json

**Added Record Types (16 new types):**
- `bridge-proof`
- `circle-proof`
- `domain-proof`
- `effect` ⚠️ **CRITICAL**
- `effect-proof`
- `ledger-proof`
- `policy-proof`
- `request`
- `schema-proof`
- `server`
- `signer-proof`
- `signer-factor`
- `signer-factor-proof`
- `signer-factor-secret`
- `symbol-proof`
- `wallet-proof`

**Impact:** Admin role can now manage all proof records, effects, and infrastructure components that were previously only available in RTP.

---

### 2. operations-ph.json

**Changes:**
- No structural changes needed
- Handle remains as `"operations"` (plural) to match existing PH convention

**Note:** The handle name differs from RTP (`"operation"` vs `"operations"`). This is preserved to maintain compatibility with existing Payments Hub systems. If your system expects `"operation"` (singular), update accordingly.

---

### 3. security-ph.json

**Added Record Types (16 new types):**
- `bridge-proof`
- `circle-proof`
- `domain-proof`
- `effect` ⚠️ **CRITICAL**
- `effect-proof`
- `ledger-proof`
- `policy-proof`
- `request`
- `schema-proof`
- `server`
- `signer-proof`
- `signer-factor`
- `signer-factor-proof`
- `signer-factor-secret`
- `symbol-proof`
- `wallet-proof`

**Filter Handle:**
- Kept as `"operations"` (plural) to match PH convention

**Impact:** Security role can now manage all proof records, effects, and infrastructure components.

---

### 4. owner-ph.json

**Added Record Types in Create Action (16 new types):**
- `bridge-proof`
- `circle-proof`
- `domain-proof`
- `effect` ⚠️ **CRITICAL**
- `effect-proof`
- `ledger-proof`
- `policy-proof`
- `request`
- `schema-proof`
- `server`
- `signer-proof`
- `signer-factor`
- `signer-factor-proof`
- `signer-factor-secret`
- `symbol-proof`
- `wallet-proof`

**Added Actions (11 new actions):**
- `abort` - Abort operations
- `activate` - Activate records
- `assign-signer` - Assign signers
- `commit` - Commit operations
- `destroy` - Destroy records
- `issue` - Issue operations
- `limit` - Limit operations
- `lookup` - Lookup operations
- `remove-signer` - Remove signers
- `spend` - Spend operations ⚠️ **CRITICAL**
- `reveal` - Reveal information

**Preserved PH-Specific Features:**
- Kept `access` action (present in PH but not explicitly in RTP)
- Kept additional report schemas: `ledger_movement_rep`, `ledger_participants_rep`

**Impact:** Owner role now has full operational capabilities matching RTP, including critical actions like `spend`, `commit`, `abort`, and `issue`.

---

### 5. support-ph.json

**Changes:**
- No changes needed - identical to RTP version

---

### 6. services-ph.json

**Context:**
This is a **PH-only policy** that does not exist in RTP. It was created to solve a critical gap in the original PH policies.

**Original Problem:**
- The original PH `owner` policy did NOT include the `spend` action
- Without `spend` authorization, wallets could not execute payment operations
- This completely blocked payment workflows in Payments Hub

**Solution Implemented:**
- Created `services` policy with `spend` authorization
- Established `services` circle for:
  - External entity bridges
  - Internal node bridges (Transfiya, Servibanca, etc.)

**Policy Capabilities:**
- `spend` on wallets (critical for payment operations)
- `create` on intents and intent-proofs
- Full anchor management (create, update, read, query, drop, manage, access)
- Read/query on intents and wallets

**Current Status:**
- ⚠️ **ENHANCED:** Added `commit` and `abort` actions to complete payment flows
- ✅ Still required for bridge operations
- ⚠️ **Note:** With updated `owner-ph.json` now including `spend`, there are two authorization paths:
  - Owner circle: General spend operations (matches RTP)
  - Services circle: Bridge-specific spend operations (PH-specific)

**Critical Enhancement:**
The original `services` policy only had `spend`, which meant bridges could initiate payments but **could not complete or cancel them**. This created a security vs. functionality dilemma:
- Option 1: Put bridges in owner circle → Violates least privilege
- Option 2: Keep bridges in services circle → Incomplete payment flows

**Solution:** Added `commit` and `abort` to `services` policy so bridges can:
- ✅ Initiate payments (`spend`)
- ✅ Finalize transactions (`commit`)
- ✅ Cancel transactions (`abort`)

**Recommendation:**
- Maintain `services` policy for bridge operations
- Bridges should **only** be in `services` circle, never in `owner` circle (principle of least privilege)
- Owner circle can be used for general operations
- Enhanced `services` policy now provides complete payment flow functionality with minimal privileges

---

## Critical Improvements

### Effect Management
All policies (admin, security, owner) now have access to:
- `effect` records - Essential for payment processing workflows
- `effect-proof` records - Proof verification for effects

### Proof Records
All relevant policies now support proof management for:
- Bridges, circles, domains, ledgers, policies, schemas, signers, symbols, wallets

### Operational Actions (Owner)
Owner role can now:
- Execute payment operations (`spend`, `commit`, `abort`)
- Manage assets (`issue`)
- Control access (`assign-signer`, `remove-signer`)
- Perform administrative tasks (`activate`, `destroy`, `limit`, `lookup`, `reveal`)

---

## Important Notes

1. **Metadata Fields:** The new policy files have empty metadata fields (`hash`, `luid`, `meta.proofs`, etc.). These will be populated automatically when the policies are created/updated in the Minka system.

2. **Parent Field:** The `owner-ph.json` has an empty `parent` field. You may need to set this to match your existing owner policy's parent reference.

3. **Handle Naming:** The `operations` policy uses plural form to match existing PH convention. Verify this matches your system's expectations.

4. **Testing:** Before deploying these policies to production:
   - Test in a development/staging environment
   - Verify all required operations work correctly
   - Confirm no unintended access is granted
   - Validate that existing functionality is not broken

5. **Backup:** Keep the original `*-ph-original.json` files as backup until the new policies are validated.

---

## Next Steps

1. Review the updated policy files
2. Update metadata fields (parent, etc.) as needed
3. Deploy to test environment
4. Validate all operations work correctly
5. Deploy to production after validation

---

## File Comparison

| Policy | Original File | Updated File | Status |
|--------|--------------|--------------|--------|
| Admin | `admin-ph-original.json` | `admin-ph.json` | ✅ Updated |
| Operations | `operations-ph-original.json` | `operations-ph.json` | ✅ Updated |
| Security | `security-ph-original.json` | `security-ph.json` | ✅ Updated |
| Owner | `owner-ph-original.json` | `owner-ph.json` | ✅ Updated |
| Support | `support-ph-original.json` | `support-ph.json` | ✅ Updated |

