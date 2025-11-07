# Access Policies Analysis: RTP vs Payments Hub

## Executive Summary

This document analyzes the differences between Real-Time Payment (RTP) policies and Payments Hub (PH) policies in the `policies/access` folder. The analysis reveals significant gaps in the Payments Hub policies that prevent certain actions from being executed, particularly around proof records, effect management, and additional record types that are present in RTP but missing in PH.

**Reference Documentation:** [Minka Security Policies Documentation](https://docs.minka.io/ledger/explanations/security-policies/)

---

## Policy Structure Validation

According to the [Minka Security Policies documentation](https://docs.minka.io/ledger/explanations/security-policies/), security policies should have the following structure:

### Required Fields:

- ✅ `handle` - Policy identifier (used for referencing)
- ✅ `schema` - Must be `"access"` for security policies
- ✅ `record` - Target record type (or `"any"` for all records)
- ✅ `values` - Array of access rules
- ✅ `access` - Access rules for the policy itself

### Optional Fields:

- `extend` - Reference to another policy to inherit from
- `filter` - Applied at policy level or within values
- `invoke` - Built-in functions for policy validation
- `parent` - Parent policy reference (seen in owner policies)

### Validation Results:

**✅ All policies (RTP and PH) conform to the required structure:**

- All have `handle`, `schema: "access"`, `record`, `values`, and `access` fields
- All use proper `filter` syntax within `values` array
- None use `extend` or `invoke` (optional features)
- Owner policies correctly use `parent` field

**✅ Authorization Patterns Used:**

- `signer` - Authorization based on signer identity
- `bearer` - Authorization based on bearer token
- `$circle` - Reference to circle membership
- `$record` - Reference to record ownership
- `$signer` - Reference to signer within bearer context

**✅ Filter Usage:**

- Both RTP and PH correctly use `filter` within `values` array
- Filters use proper operators: `$in`, `$regex`
- Filters target record properties like `handle` and `schema`

**✅ Change Field Usage:**

- Both RTP and PH correctly use `change.schema` for report creation rules
- This allows filtering report creation by schema type

## Detailed Structural Analysis

### Authorization Model

According to Minka's documentation, policies use an **additive authorization model**, meaning permissions are cumulative. This is important when analyzing the differences:

1. **Signer-based Authorization** (`signer`): Requires the transaction to be signed by a specific entity

   - `$circle: "admin"` - Must be signed by a member of the admin circle
   - `$record: "owner"` - Must be signed by the owner record

2. **Bearer-based Authorization** (`bearer`): Uses bearer tokens for read/query operations

   - `$signer: { $circle: "admin" }` - Bearer token must be from admin circle member

3. **Record Targeting** (`record`): Specifies which record types the rule applies to
   - `"any"` - Applies to all record types
   - Specific types: `"wallet"`, `"intent"`, etc.
   - Arrays: `["circle", "circle-signer"]`

### Filter Usage Analysis

Filters in policy values allow fine-grained control over which records the rule applies to:

**Admin Policy - Circle Filter:**

- **RTP & PH:** Both use `filter.handle.$regex: "^(?!.*owner).*$|^owner@.*$"`
- This regex allows any handle except those containing "owner", OR handles starting with "owner@"
- **Status:** ✅ Identical and correct

**Security Policy - Circle Filter:**

- **RTP:** `filter.handle.$in: ["admin", "security", "operation", "support"]`
- **PH:** `filter.handle.$in: ["admin", "security", "operations", "support"]`
- **Issue:** ⚠️ PH uses "operations" (plural) while RTP uses "operation" (singular)
- **Impact:** If the actual circle handle is "operation", the PH filter won't match it

### Change Field Analysis

The `change` field is used to filter actions based on the change being made:

**Report Creation Rules:**

- Both RTP and PH use `change.schema.$in` to specify which report schemas can be created
- **Owner Policy:**
  - RTP: 5 schemas (`billing`, `reconciliation`, `export-changes`, `export-journal`, `trans_details_rep`)
  - PH: 7 schemas (adds `ledger_movement_rep`, `ledger_participants_rep`)
  - **Status:** ✅ PH has additional schemas (PH-specific feature, should be preserved)

---

## Policy Comparison

### 1. Admin Policy

**File:** `admin-rtp.json` vs `admin-ph-original.json`

#### Key Differences:

**Missing Record Types in PH:**

- `bridge-proof` - Bridge proof records
- `circle-proof` - Circle proof records
- `domain-proof` - Domain proof records
- `effect` - Effect records (critical for payment processing)
- `effect-proof` - Effect proof records
- `ledger-proof` - Ledger proof records
- `policy-proof` - Policy proof records
- `report-proof` - Report proof records (present in PH but in different context)
- `request` - Request records
- `schema-proof` - Schema proof records
- `server` - Server records
- `signer-proof` - Signer proof records
- `signer-factor` - Signer factor records
- `signer-factor-proof` - Signer factor proof records
- `signer-factor-secret` - Signer factor secret records
- `symbol-proof` - Symbol proof records
- `wallet-proof` - Wallet proof records

**Impact:** The admin role in Payments Hub cannot manage proof records, effects, or several critical infrastructure components that are available in RTP.

**Structural Validation:**

- ✅ Both policies correctly use `record: "any"` to target all record types
- ✅ Both use proper `filter` syntax for circle management
- ✅ Both correctly structure `values` array with multiple access rules
- ✅ Both use `bearer` authorization for read/query operations
- ⚠️ PH missing 16 record types in the "any" action rule (lines 79-99 in RTP vs lines 79-99 in PH)

---

### 2. Operations Policy

**File:** `operations-rtp.json` vs `operations-ph-original.json`

#### Key Differences:

**Handle Name:**

- RTP: `"handle": "operation"` (singular)
- PH: `"handle": "operations"` (plural)

**Note:** The structure and permissions are otherwise identical. This is primarily a naming convention difference, but it could cause issues if the system expects a specific handle name.

**Impact:** Potential mismatch if the system references the circle by handle name.

**Structural Validation:**

- ✅ Both policies correctly use `record: "any"`
- ✅ Both correctly use `bearer` authorization for read/query
- ✅ Both correctly structure report creation rules with `change.schema`
- ⚠️ Handle name inconsistency: RTP uses "operation" (singular), PH uses "operations" (plural)
- **Recommendation:** Verify which handle name is correct in your system. If circles are created with "operation", update PH to match RTP.

---

### 3. Security Policy

**File:** `security-rtp.json` vs `security-ph-original.json`

#### Key Differences:

**Missing Record Types in PH:**

- `bridge-proof` - Bridge proof records
- `circle-proof` - Circle proof records
- `domain-proof` - Domain proof records
- `effect` - Effect records (critical for payment processing)
- `effect-proof` - Effect proof records
- `ledger-proof` - Ledger proof records
- `policy-proof` - Policy proof records
- `request` - Request records
- `schema-proof` - Schema proof records
- `server` - Server records
- `signer-proof` - Signer proof records
- `signer-factor` - Signer factor records
- `signer-factor-proof` - Signer factor proof records
- `signer-factor-secret` - Signer factor secret records
- `symbol-proof` - Symbol proof records
- `wallet-proof` - Wallet proof records

**Filter Handle Difference:**

- RTP: `"handle": { "$in": ["admin", "security", "operation", "support"] }`
- PH: `"handle": { "$in": ["admin", "security", "operations", "support"] }`

**Impact:** Security role cannot manage proof records, effects, or infrastructure components. Also, the handle filter uses "operations" (plural) which may not match the actual circle handle.

**Structural Validation:**

- ✅ Both policies correctly use `filter` for circle management
- ✅ Both correctly use `change.schema` for policy creation (access schema only)
- ✅ Both correctly structure `values` array
- ⚠️ **Critical Filter Issue:** PH filter uses "operations" (plural) which may not match actual circle handles
- ⚠️ PH missing 16 record types in the "any" action rule

**Filter Analysis:**
The security policy uses a filter to restrict circle management to specific handles:

```json
"filter": {
  "handle": {
    "$in": ["admin", "security", "operation", "support"]  // RTP
    "$in": ["admin", "security", "operations", "support"] // PH
  }
}
```

This filter ensures security can only manage circles with these specific handles. The mismatch between "operation" and "operations" could prevent security from managing the operations circle if it's named "operation" (singular).

---

### 4. Support Policy

**File:** `support-rtp.json` vs `support-ph-original.json`

#### Key Differences:

**None** - These policies are identical in structure and permissions.

**Impact:** No issues identified for support role.

---

### 5. Services Policy (PH Only)

**File:** `services-ph-original.json` (No RTP equivalent)

#### Context:

**⚠️ CRITICAL ARCHITECTURAL DIFFERENCE:** This policy exists **only in Payments Hub** and was created to solve a critical gap in the original PH policies.

**Problem Statement:**

- The original PH `owner` policy did **NOT** include the `spend` action
- Without `spend` authorization, wallets could not execute payment operations
- This blocked core payment functionality in Payments Hub

**Solution:**

- Created a dedicated `services` policy with `spend` authorization
- Established a `services` circle for external and internal bridges:
  - **External entity bridges** - Bridges connecting to external entities
  - **Internal node bridges** - Bridges connecting to payment nodes (Transfiya, Servibanca, etc.)

#### Policy Capabilities:

**Read/Query Operations:**

- `read`, `query` on `intent` and `wallet` records (bearer authorization)

**Intent Management:**

- `create` on `intent` records
- `create` on `intent-proof` records

**Payment Operations:**

- `spend` on `wallet` records ⚠️ **CRITICAL** - This was the missing capability
- ❌ **MISSING:** `commit` - Cannot finalize transactions
- ❌ **MISSING:** `abort` - Cannot cancel transactions

**⚠️ CRITICAL LIMITATION:** The `services` policy only provides `spend` but NOT `commit` or `abort`. This means bridges in the `services` circle can initiate payments but **cannot complete or cancel them**. This is a significant functional gap for bridge operations.

**Anchor Management:**

- Full anchor operations: `create`, `update`, `read`, `query`, `drop`, `manage`, `access`

#### Structural Analysis:

**✅ Policy Structure:**

- Uses `parent` field (inheritance pattern)
- Correctly uses `record: "any"` with specific rules in `values`
- Proper `signer` and `bearer` authorization patterns
- Follows Minka security policy structure

**Key Features:**

```json
{
  "action": "spend",
  "record": "wallet",
  "signer": {
    "$circle": "services"
  }
}
```

#### Impact Analysis:

**Before Services Policy:**

- ❌ No way to authorize `spend` operations in PH
- ❌ Payment workflows blocked
- ❌ Bridges could not execute wallet operations

**After Services Policy:**

- ✅ Bridges can execute `spend` operations
- ✅ External entity bridges can initiate payments
- ✅ Internal node bridges (Transfiya, Servibanca) can initiate payments
- ❌ **LIMITATION:** Bridges **cannot** `commit` or `abort` transactions
- ⚠️ **INCOMPLETE:** Payment workflows can start but cannot be finalized or cancelled by bridges

**Critical Gap:** For a complete payment flow, bridges need:

1. ✅ `spend` - To initiate payment (available in services policy)
2. ❌ `commit` - To finalize transaction (NOT available)
3. ❌ `abort` - To cancel transaction (NOT available)

**Current Workaround:** Bridges would need to be in the `owner` circle to access `commit` and `abort`, but this violates the principle of least privilege by granting bridges excessive permissions.

#### Relationship to Updated Owner Policy:

**Important Note:** With the updated `owner-ph.json` that now includes `spend` action, there are now **two ways** to authorize spend operations:

1. **Owner Circle:** `spend` action via owner policy (matches RTP)
2. **Services Circle:** `spend` action via services policy (PH-specific)

**Recommendation:**

- The `services` policy should be **maintained** for bridge operations
- It provides a more granular, service-specific authorization model
- Bridges should use the `services` circle rather than `owner` circle
- This follows the principle of least privilege
- ⚠️ **ACTION REQUIRED:** Add `commit` and `abort` actions to the `services` policy so bridges can complete payment flows without needing `owner` circle membership

#### Comparison with RTP:

**RTP Approach:**

- Owner policy includes `spend` action
- No separate services policy needed
- All spend operations go through owner circle

**PH Approach (Original):**

- Owner policy did NOT include `spend` action
- Created services policy as workaround
- Bridges use services circle for spend operations

**PH Approach (Updated):**

- Owner policy now includes `spend` action (matching RTP)
- Services policy still exists for bridge-specific operations
- Provides flexibility: owner for general operations, services for bridge operations

---

### 6. Owner Policy

**File:** `owner-rtp.json` vs `owner-ph-original.json`

#### Key Differences:

**Missing Record Types in PH (Create Action):**

- `bridge-proof` - Bridge proof records
- `circle-proof` - Circle proof records
- `domain-proof` - Domain proof records
- `effect` - Effect records (critical for payment processing)
- `effect-proof` - Effect proof records
- `ledger-proof` - Ledger proof records
- `policy-proof` - Policy proof records
- `request` - Request records
- `schema-proof` - Schema proof records
- `server` - Server records
- `signer-proof` - Signer proof records
- `signer-factor` - Signer factor records
- `signer-factor-proof` - Signer factor proof records
- `signer-factor-secret` - Signer factor secret records
- `symbol-proof` - Symbol proof records
- `wallet-proof` - Wallet proof records

**Missing Actions in PH:**

- `abort` - Abort operations
- `activate` - Activate records
- `assign-signer` - Assign signers
- `commit` - Commit operations
- `destroy` - Destroy records
- `drop` - Drop records (present in PH but in different context)
- `issue` - Issue operations
- `limit` - Limit operations
- `lookup` - Lookup operations
- `manage` - Manage operations (present in PH)
- `query` - Query operations (present in PH)
- `read` - Read operations (present in PH)
- `remove-signer` - Remove signers
- `spend` - Spend operations
- `update` - Update operations (present in PH)
- `reveal` - Reveal operations

**Note:** PH has `access` action which RTP doesn't have explicitly listed, but RTP has more granular actions.

**Report Schema Differences:**

- RTP includes: `billing`, `reconciliation`, `export-changes`, `export-journal`, `trans_details_rep`
- PH includes: `billing`, `reconciliation`, `export-changes`, `export-journal`, `trans_details_rep`, `ledger_movement_rep`, `ledger_participants_rep`

**Impact:** The owner role in Payments Hub has significantly reduced capabilities:

- Cannot create proof records for most record types
- Cannot manage effects (critical for payment processing)
- Cannot perform many operational actions like abort, commit, spend, issue, etc.
- Missing access to server and request records

**Structural Validation:**

- ✅ Both policies correctly use `parent` field (inheritance pattern)
- ✅ Both correctly structure create action with `record.$in` array
- ✅ Both correctly use `action.$in` for multiple actions
- ✅ Both correctly use `change.schema` for report creation
- ⚠️ **Critical:** PH missing 16 record types in create action
- ⚠️ **Critical:** PH missing 11 actions in the "any record" action rule

**Action Analysis:**
The owner policy in RTP uses a comprehensive set of actions:

- **Payment Operations:** `spend`, `commit`, `abort`
- **Asset Management:** `issue`
- **Record Lifecycle:** `activate`, `destroy`, `drop`
- **Access Control:** `assign-signer`, `remove-signer`, `access`
- **Information:** `read`, `query`, `lookup`, `reveal`
- **Administrative:** `update`, `manage`, `limit`

PH only has: `update`, `read`, `query`, `drop`, `manage`, `access`

**Missing Critical Actions:**

- `spend` - **CRITICAL** for payment processing
- `commit` - **CRITICAL** for finalizing transactions
- `abort` - **CRITICAL** for canceling operations
- `issue` - Important for asset issuance
- `activate`, `destroy` - Record lifecycle management
- `assign-signer`, `remove-signer` - Signer management
- `lookup`, `reveal`, `limit` - Additional operational capabilities

---

## Actions Not Executable with Original PH Policies

This section documents **all actions that could NOT be executed** with the original Payments Hub policies (excluding the `services` policy, which was created later as a workaround). This analysis demonstrates the critical gaps that existed in PH and why these capabilities are being added now.

### Analysis Methodology

**Original PH Policies Analyzed:**

- `admin-ph-original.json`
- `operations-ph-original.json`
- `security-ph-original.json`
- `support-ph-original.json`
- `owner-ph-original.json`

**Excluded:** `services-ph-original.json` (created later as workaround for missing `spend`)

**Comparison Baseline:** RTP `owner-rtp.json` policy which includes comprehensive action set

### Actions Available in Original PH Policies

#### Admin Policy (Original PH)

- `any` (for specific record types: circle, circle-signer, ledger, signer, schema, symbol, wallet, anchor, anchor-proof, domain, intent, intent-proof, report-proof, bridge)
- `create` (circle, policy, report with specific schemas)
- `update` (policy, report)
- `read` (bearer authorization)
- `query` (bearer authorization)
- `drop` (report)

#### Operations Policy (Original PH)

- `read` (bearer, specific records)
- `query` (bearer, specific records)
- `create` (report-proof, report with specific schemas)

#### Security Policy (Original PH)

- `any` (for specific record types: circle, circle-signer, ledger, signer, schema, symbol, wallet, anchor, anchor-proof, intent, intent-proof, report-proof)
- `create` (circle, policy with access schema)
- `read` (bearer authorization)
- `query` (bearer authorization)

#### Support Policy (Original PH)

- `read` (bearer authorization)
- `query` (bearer authorization)

#### Owner Policy (Original PH)

- `create` (specific record types: ledger, circle, circle-signer, signer, policy, schema, symbol, wallet, anchor, anchor-proof, domain, intent, intent-proof, report-proof, bridge)
- `update` (any record)
- `read` (bearer authorization)
- `query` (bearer authorization)
- `drop` (any record)
- `manage` (any record)
- `access` (any record)

### Actions NOT Available in Original PH Policies

The following actions **could NOT be executed** by any of the original PH policies:

#### 🔴 CRITICAL - Payment Operations

1. **`spend`** ⚠️ **MOST CRITICAL**

   - **Impact:** Cannot execute payment operations on wallets
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Workaround Created:** `services` policy
   - **Status:** Now added to updated `owner-ph.json`

2. **`commit`** ⚠️ **CRITICAL**

   - **Impact:** Cannot finalize/commit transactions
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

3. **`abort`** ⚠️ **CRITICAL**
   - **Impact:** Cannot abort/cancel operations
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

#### 🟠 HIGH - Asset and Record Management

4. **`issue`**

   - **Impact:** Cannot issue assets
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

5. **`activate`**

   - **Impact:** Cannot activate records
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

6. **`destroy`**
   - **Impact:** Cannot destroy records
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

#### 🟡 MEDIUM - Access Control and Information

7. **`assign-signer`**

   - **Impact:** Cannot assign signers to records
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

8. **`remove-signer`**

   - **Impact:** Cannot remove signers from records
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

9. **`limit`**

   - **Impact:** Cannot set limits on records
   - **Available in RTP:** ✅ Yes (owner policy)
   - **Status:** Now added to updated `owner-ph.json`

10. **`lookup`**

    - **Impact:** Cannot perform lookup operations
    - **Available in RTP:** ✅ Yes (owner policy)
    - **Status:** Now added to updated `owner-ph.json`

11. **`reveal`**
    - **Impact:** Cannot reveal information
    - **Available in RTP:** ✅ Yes (owner policy)
    - **Status:** Now added to updated `owner-ph.json`

### Summary Table: Actions Not Executable in Original PH

| Action          | Criticality | Impact                       | Available in RTP | Workaround        | Status in Updated PH | Available to Bridges (services circle) |
| --------------- | ----------- | ---------------------------- | ---------------- | ----------------- | -------------------- | -------------------------------------- |
| `spend`         | 🔴 CRITICAL | Cannot execute payments      | ✅ Yes           | `services` policy | ✅ Added to owner    | ✅ Yes (via services policy)           |
| `commit`        | 🔴 CRITICAL | Cannot finalize transactions | ✅ Yes           | None              | ✅ Added to owner    | ✅ **YES** (added to services policy)  |
| `abort`         | 🔴 CRITICAL | Cannot cancel operations     | ✅ Yes           | None              | ✅ Added to owner    | ✅ **YES** (added to services policy)  |
| `issue`         | 🟠 HIGH     | Cannot issue assets          | ✅ Yes           | None              | ✅ Added to owner    |
| `activate`      | 🟠 HIGH     | Cannot activate records      | ✅ Yes           | None              | ✅ Added to owner    |
| `destroy`       | 🟠 HIGH     | Cannot destroy records       | ✅ Yes           | None              | ✅ Added to owner    |
| `assign-signer` | 🟡 MEDIUM   | Cannot assign signers        | ✅ Yes           | None              | ✅ Added to owner    |
| `remove-signer` | 🟡 MEDIUM   | Cannot remove signers        | ✅ Yes           | None              | ✅ Added to owner    |
| `limit`         | 🟡 MEDIUM   | Cannot set limits            | ✅ Yes           | None              | ✅ Added to owner    |
| `lookup`        | 🟡 MEDIUM   | Cannot perform lookups       | ✅ Yes           | None              | ✅ Added to owner    |
| `reveal`        | 🟡 MEDIUM   | Cannot reveal information    | ✅ Yes           | None              | ✅ Added to owner    |

### Impact Analysis

**Total Actions Missing:** 11 actions

**Critical Actions Missing:** 3 (`spend`, `commit`, `abort`)

**Functional Impact:**

- ❌ **Payment Processing:** Completely blocked without `spend`, `commit`, `abort`
- ❌ **Asset Management:** Cannot issue or manage assets without `issue`
- ❌ **Record Lifecycle:** Cannot activate or destroy records
- ❌ **Access Control:** Cannot manage signers without `assign-signer`, `remove-signer`
- ❌ **Operational Capabilities:** Missing `limit`, `lookup`, `reveal`

**Why This Matters:**
The original PH policies were **functionally incomplete** for a payment processing system. The missing actions, especially `spend`, `commit`, and `abort`, are fundamental to payment operations. This is why:

1. The `services` policy was created as a workaround for `spend`
2. The updated policies now include all missing actions to match RTP capabilities
3. These updates are critical for PH to function as a complete payment system

**⚠️ Bridge Operations Limitation:**
Even with the `services` policy, bridges in the `services` circle **cannot complete payment flows** because they lack `commit` and `abort` actions. This creates a security vs. functionality dilemma:

- **Option 1:** Put bridges in `owner` circle → Violates least privilege (bridges get excessive permissions)
- **Option 2:** Keep bridges in `services` circle → Cannot complete payment flows (incomplete functionality)

**Recommended Solution:** Add `commit` and `abort` to the `services` policy so bridges can operate with minimal privileges while maintaining full payment flow functionality.

---

## Critical Missing Capabilities in Payments Hub

### 0. Spend Action Authorization (Historical Issue - Now Resolved)

**Original Problem:**

- PH `owner` policy did NOT include `spend` action
- This completely blocked payment operations
- **Workaround:** Created `services` policy with `spend` authorization for bridges

**Current Status:**

- ✅ Updated `owner-ph.json` now includes `spend` action (matching RTP)
- ✅ `services` policy still exists and should be maintained for bridge operations
- ✅ Provides dual authorization paths: owner (general) and services (bridges)

**Impact:** This was the **most critical** gap - without `spend`, no payments could be processed.

### 1. Effect Management

**Impact:** CRITICAL - Effects are essential for payment processing workflows. Without access to `effect` and `effect-proof` records, Payments Hub cannot properly track and manage payment effects.

### 2. Proof Records

**Impact:** HIGH - Missing access to various `*-proof` records means Payments Hub cannot verify or manage proofs for:

- Bridges
- Circles
- Domains
- Effects
- Ledgers
- Policies
- Schemas
- Signers
- Symbols
- Wallets

### 3. Operational Actions

**Impact:** HIGH - Owner role missing critical actions:

- `abort` - Cannot abort operations
- `commit` - Cannot commit operations
- `spend` - Cannot perform spend operations
- `issue` - Cannot issue assets
- `activate` - Cannot activate records
- `assign-signer` / `remove-signer` - Cannot manage signers
- `destroy` - Cannot destroy records
- `limit` - Cannot set limits
- `lookup` - Cannot perform lookups
- `reveal` - Cannot reveal information

### 4. Infrastructure Records

**Impact:** MEDIUM - Missing access to:

- `server` - Server configuration records
- `request` - Request records

### 5. Signer Factor Management

**Impact:** MEDIUM - Missing access to:

- `signer-factor` - Signer factor records
- `signer-factor-proof` - Signer factor proof records
- `signer-factor-secret` - Signer factor secret records

---

## Advanced Policy Features Analysis

### Policy Extension (`extend`)

**Status:** ❌ Neither RTP nor PH policies use the `extend` feature

**Analysis:** According to [Minka documentation](https://docs.minka.io/ledger/explanations/security-policies/), policies can extend other policies to inherit their rules. This could be useful for:

- Creating a base policy with common rules
- Specializing policies for specific use cases
- Reducing duplication

**Recommendation:** Consider using `extend` to create a base policy that both RTP and PH can inherit from, reducing maintenance overhead.

### Built-in Functions (`invoke`)

**Status:** ❌ Neither RTP nor PH policies use the `invoke` feature

**Analysis:** Minka provides built-in functions for policy validation:

- `wallet.canSpendAllChangedRouteTargets` - Validates route targets
- `intent.canReadAnyClaimWallet` - Validates intent read access
- `intent.canReadAnyClaimWalletInThread` - Validates thread access
- `intent.canSpendEveryClaimWallet` - Validates intent creation

**Recommendation:** Consider adding `invoke` functions to policies that manage wallets and intents for additional security validation.

### Policy-Level Filtering

**Status:** ✅ Both RTP and PH correctly use filters within `values` array

**Analysis:** Filters are correctly applied at the value level, not at the policy level. This is the correct pattern according to the documentation.

---

## Recommendations

### Immediate Actions (Critical)

1. **Add all missing record types** from RTP policies to corresponding PH policies

   - 16 record types missing in admin, security, and owner policies
   - Most critical: `effect` and `effect-proof` for payment processing

2. **Add all missing actions** to the owner policy

   - 11 actions missing, including critical payment operations (`spend`, `commit`, `abort`)

3. **Standardize handle names** - Resolve "operation" vs "operations" inconsistency
   - Verify which handle name is actually used in your system
   - Update security policy filter to match the correct handle
   - Consider updating operations policy handle if needed

### Best Practices (Per Minka Documentation)

4. **Maintain PH-specific report schemas** - Keep the additional report schemas (`ledger_movement_rep`, `ledger_participants_rep`) that are specific to Payments Hub

5. **Consider the `access` action** - Verify if PH's `access` action in owner policy is intentional or should be replaced with RTP's more granular actions

6. **Policy Extension** - Consider creating a base policy that both RTP and PH can extend to reduce duplication

7. **Built-in Functions** - Consider adding `invoke` functions for wallet and intent policies for additional validation

8. **Principle of Least Privilege** - When updating policies, start with restrictive rules and add permissions as needed (per Minka best practices)

### Testing Recommendations

9. **Test in Development** - Deploy updated policies to a development/staging environment first
10. **Validate Operations** - Test all payment operations (spend, commit, abort) after updates
11. **Verify Proof Management** - Test proof record creation and management
12. **Check Effect Processing** - Verify effect and effect-proof record handling

---

## Summary Table

| Policy     | Missing Record Types | Missing Actions | Handle Issues               | Status                 | Notes                                   |
| ---------- | -------------------- | --------------- | --------------------------- | ---------------------- | --------------------------------------- |
| admin      | 16 record types      | None            | None                        | Needs update           |                                         |
| operations | None                 | None            | "operation" vs "operations" | Minor fix needed       |                                         |
| security   | 16 record types      | None            | "operation" vs "operations" | Needs update           |                                         |
| support    | None                 | None            | None                        | OK                     |                                         |
| services   | N/A                  | N/A             | None                        | PH-only policy         | Created to solve missing `spend` in PH  |
| owner      | 16 record types      | 11 actions      | None                        | Critical update needed | Original PH missing `spend` (now fixed) |

---

## Authorization Model Deep Dive

### Additive Authorization Model

According to Minka's documentation, the authorization model is **additive**, meaning:

- Permissions from multiple rules are combined (OR logic)
- More permissive rules at ledger level can override restrictive record-level rules
- This is why ledger-level policies must be carefully designed

**Implications for RTP vs PH:**

- RTP policies are more comprehensive, granting broader permissions
- PH policies are more restrictive, potentially blocking legitimate operations
- The missing record types and actions in PH create gaps that cannot be filled by other policies

### Signer vs Bearer Authorization

**Signer Authorization:**

- Used for write operations (create, update, delete, etc.)
- Requires cryptographic signature from authorized entity
- Examples: `signer: { $circle: "admin" }`

**Bearer Authorization:**

- Used for read/query operations
- Uses bearer tokens for authentication
- Examples: `bearer: { $signer: { $circle: "admin" } }`

**Analysis:**

- ✅ Both RTP and PH correctly use `signer` for write operations
- ✅ Both RTP and PH correctly use `bearer` for read/query operations
- ✅ The pattern is consistent across all policies

### Record Targeting Strategies

**Strategy 1: Broad Targeting (`record: "any"`)**

- Used in: admin, operations, security, support, owner policies
- Applies rules to all record types
- Combined with specific `record` fields in `values` for fine-grained control

**Strategy 2: Specific Record Types in Values**

- Used to grant permissions for specific record types
- Examples: `record: "wallet"`, `record: ["circle", "circle-signer"]`
- Allows granular control over which records can be accessed

**Analysis:**

- ✅ Both RTP and PH use consistent targeting strategies
- ✅ The combination of `record: "any"` with specific rules in `values` is correct
- ⚠️ PH is missing many record types in the specific rules within `values`

---

## Next Steps

1. ✅ **COMPLETED:** Generate updated PH policy files with all missing capabilities from RTP
2. ✅ **COMPLETED:** Preserve PH-specific features (additional report schemas)
3. ⚠️ **PENDING:** Standardize handle naming conventions (verify "operation" vs "operations")
4. ⚠️ **PENDING:** Test updated policies in Payments Hub environment
5. ⚠️ **RECOMMENDED:** Consider using policy extension (`extend`) to reduce duplication
6. ⚠️ **RECOMMENDED:** Consider adding built-in functions (`invoke`) for additional validation
7. ⚠️ **RECOMMENDED:** Review and validate the `access` action in owner policy

---

## References

- [Minka Security Policies Documentation](https://docs.minka.io/ledger/explanations/security-policies/)
- Policy files location: `policies/access/`
- Updated PH policies: `*-ph.json` (new files)
- Original PH policies: `*-ph-original.json` (preserved)
- **See `FINAL_POLICY_CONFIGURATION.md`** for complete configuration documentation and circle permissions
