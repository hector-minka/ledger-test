# Bridge Operations Analysis: Services Circle Capabilities

## Executive Summary

This document analyzes the capabilities of bridges operating in the `services` circle with the original PH policies + `services` policy, and identifies critical gaps that prevent bridges from completing payment flows.

## Current State: Services Policy Capabilities

### Actions Available to Bridges (services circle)

With the `services-ph-original.json` policy, bridges in the `services` circle can:

1. ✅ **Read/Query Operations**
   - `read`, `query` on `intent` and `wallet` records (bearer authorization)

2. ✅ **Intent Management**
   - `create` on `intent` records
   - `create` on `intent-proof` records

3. ✅ **Payment Initiation**
   - `spend` on `wallet` records

4. ✅ **Anchor Management**
   - Full anchor operations: `create`, `update`, `read`, `query`, `drop`, `manage`, `access`

### Actions NOT Available to Bridges (services circle)

**❌ CRITICAL GAPS:**

1. **`commit`** - Cannot finalize/commit transactions
2. **`abort`** - Cannot cancel/abort transactions

## Payment Flow Analysis

### Complete Payment Flow Requirements

A complete payment transaction flow requires:

1. ✅ **Initiate Payment** - `spend` action (available in services policy)
2. ❌ **Finalize Transaction** - `commit` action (NOT available)
3. ❌ **Cancel Transaction** - `abort` action (NOT available)

### Current Limitation

**With original `services` policy:**
- Bridges can **start** payment operations (`spend`)
- Bridges **cannot** complete payment operations (`commit`)
- Bridges **cannot** cancel payment operations (`abort`)

**Result:** Payment flows initiated by bridges are **incomplete** and cannot be finalized or cancelled by the bridges themselves.

## Security vs. Functionality Dilemma

### Option 1: Put Bridges in Owner Circle

**Pros:**
- ✅ Bridges can execute all payment operations (`spend`, `commit`, `abort`)
- ✅ Complete payment flow functionality

**Cons:**
- ❌ **Violates Principle of Least Privilege**
- ❌ Bridges get excessive permissions (all owner actions)
- ❌ Security risk: bridges have access to actions they don't need
- ❌ Cannot restrict bridge capabilities

### Option 2: Keep Bridges in Services Circle (Current)

**Pros:**
- ✅ Follows Principle of Least Privilege
- ✅ Bridges only have necessary permissions
- ✅ Better security posture

**Cons:**
- ❌ **Incomplete Functionality**
- ❌ Cannot complete payment flows
- ❌ Cannot cancel transactions
- ❌ Requires workarounds or owner circle access

### Option 3: Enhanced Services Policy (Recommended)

**Solution:** Add `commit` and `abort` to the `services` policy

**Pros:**
- ✅ Bridges can execute complete payment flows
- ✅ Maintains Principle of Least Privilege
- ✅ Bridges only get payment-related actions
- ✅ No excessive permissions
- ✅ Better security than owner circle

**Cons:**
- None (this is the optimal solution)

## Recommended Changes

### Update Services Policy

Add the following actions to `services-ph.json`:

```json
{
  "action": "commit",
  "record": "wallet",
  "signer": {
    "$circle": "services"
  }
},
{
  "action": "abort",
  "record": "wallet",
  "signer": {
    "$circle": "services"
  }
}
```

### Updated Services Policy Capabilities

After adding `commit` and `abort`:

**Payment Operations:**
- ✅ `spend` - Initiate payments
- ✅ `commit` - Finalize transactions
- ✅ `abort` - Cancel transactions

**Result:** Bridges can now execute **complete payment flows** while maintaining minimal privileges.

## Impact Analysis

### Before Enhancement

- ❌ Bridges cannot complete payment flows
- ❌ Must use owner circle (security risk) or incomplete flows
- ❌ Violates principle of least privilege if using owner circle

### After Enhancement

- ✅ Bridges can execute complete payment flows
- ✅ Maintains principle of least privilege
- ✅ Bridges only have payment-related permissions
- ✅ Better security posture than owner circle
- ✅ Full functionality without excessive permissions

## Implementation Status

- ✅ **Identified:** Gap in services policy (missing `commit` and `abort`)
- ✅ **Updated:** `services-ph.json` now includes `commit` and `abort`
- ⚠️ **Pending:** Deploy and test updated policy
- ⚠️ **Pending:** Verify bridges can complete payment flows

## Conclusion

The original `services` policy was **incomplete** for bridge operations. While it solved the immediate problem of allowing bridges to initiate payments (`spend`), it did not provide the necessary actions to complete payment flows (`commit`, `abort`).

**Recommendation:** Use the enhanced `services-ph.json` policy that includes `commit` and `abort` actions. This allows bridges to operate with minimal privileges while maintaining full payment flow functionality.

**Key Principle:** Bridges should **only** be in the `services` circle, never in the `owner` circle, to maintain security and follow the principle of least privilege.

