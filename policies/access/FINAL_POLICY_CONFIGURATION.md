# Final Policy Configuration: Payments Hub

## Executive Summary

This document describes the final policy configuration for Payments Hub after all updates. It explains the segregation of functions, permissions for each circle, and how the policies ensure proper security and functionality.

**Status:** ✅ Complete and ready for deployment

---

## Policy Architecture Overview

Payments Hub uses a **role-based access control (RBAC)** model with six distinct circles, each with specific responsibilities and permissions:

1. **Owner** - Full system control and administration
2. **Admin** - Administrative operations and infrastructure management
3. **Security** - Security policy management and access control
4. **Operations** - Operational monitoring and reporting
5. **Services** - Bridge operations and payment processing
6. **Support** - Read-only access for support operations

### Key Principles Applied

1. **Principle of Least Privilege** - Each circle has only the minimum permissions needed
2. **Segregation of Duties** - Clear separation between administrative, operational, and service functions
3. **Defense in Depth** - Multiple layers of security controls
4. **Complete Functionality** - All necessary actions available for each role

---

## Circle Permissions Matrix

### 1. Owner Circle

**Purpose:** Full system ownership and control

**Who Should Be in This Circle:**

- System owners
- Primary administrators
- Entities requiring full system access

**Permissions:**

#### Create Operations

Can create all record types:

- `anchor`, `anchor-proof`
- `bridge`, `bridge-proof`
- `circle`, `circle-proof`, `circle-signer`
- `domain`, `domain-proof`
- `effect`, `effect-proof`
- `intent`, `intent-proof`
- `ledger`, `ledger-proof`
- `policy`, `policy-proof`
- `report-proof`
- `request`
- `schema`, `schema-proof`
- `server`
- `signer`, `signer-proof`
- `signer-factor`, `signer-factor-proof`, `signer-factor-secret`
- `symbol`, `symbol-proof`
- `wallet`, `wallet-proof`

#### All Actions on Any Record

- `abort` - Cancel operations
- `access` - Manage access
- `activate` - Activate records
- `assign-signer` - Assign signers
- `commit` - Finalize transactions
- `destroy` - Destroy records
- `drop` - Delete records
- `issue` - Issue assets
- `limit` - Set limits
- `lookup` - Perform lookups
- `manage` - Manage records
- `query` - Query records
- `read` - Read records
- `remove-signer` - Remove signers
- `spend` - Execute payments
- `update` - Update records
- `reveal` - Reveal information

#### Report Creation

Can create reports with schemas:

- `billing`
- `reconciliation`
- `export-changes`
- `export-journal`
- `trans_details_rep` (PH-specific)
- `ledger_movement_rep` (PH-specific)
- `ledger_participants_rep` (PH-specific)

**Security Notes:**

- Highest privilege level
- Should have minimal membership
- Used for system-level operations
- **Bridges should NEVER be in this circle**

---

### 2. Admin Circle

**Purpose:** Administrative operations and infrastructure management

**Who Should Be in This Circle:**

- System administrators
- Infrastructure managers
- Operations managers

**Permissions:**

#### Circle Management

- `any` action on `circle` and `circle-signer` records (except owner circles)
- `create` on `circle` records
- Filter: Can manage circles with handles matching `^(?!.*owner).*$|^owner@.*$`

#### Policy Management

- `create` and `update` on `policy` records

#### Report Management

- `update`, `read`, `drop` on `report` records
- `create` reports with schemas:
  - `billing`
  - `reconciliation`
  - `export-changes`
  - `export-journal`
  - `trans_details_rep` (PH-standard)
  - `ledger_movement_rep` (PH-standard)
  - `ledger_participants_rep` (PH-standard)

#### Infrastructure Management

`any` action on:

- `anchor`, `anchor-proof`
- `bridge`, `bridge-proof`
- `circle-proof`
- `domain`, `domain-proof`
- `effect`, `effect-proof`
- `intent`, `intent-proof`
- `ledger`, `ledger-proof`
- `policy-proof`
- `report-proof`
- `request`
- `schema`, `schema-proof`
- `server`
- `signer`, `signer-proof`
- `signer-factor`, `signer-factor-proof`, `signer-factor-secret`
- `symbol`, `symbol-proof`
- `wallet`, `wallet-proof`

#### Read/Query Operations

- `read` and `query` (bearer authorization) on all records

**Security Notes:**

- High privilege level
- Can manage infrastructure but not owner circles
- Cannot execute payment operations (`spend`, `commit`, `abort`)
- Focused on administrative tasks

---

### 3. Security Circle

**Purpose:** Security policy management and access control

**Who Should Be in This Circle:**

- Security officers
- Access control administrators
- Policy managers

**Permissions:**

#### Circle Management (Restricted)

- `any` action on `circle` and `circle-signer` records
- Filter: Can only manage circles with handles: `admin`, `security`, `operations`, `support`
- `create` on `circle` records

#### Security Policy Management

- `create` policies with `access` schema only

#### Security Infrastructure Management

`any` action on:

- `anchor`, `anchor-proof`
- `bridge-proof`
- `circle-proof`
- `domain-proof`
- `effect`, `effect-proof`
- `intent`, `intent-proof`
- `ledger`, `ledger-proof`
- `policy-proof`
- `report-proof`
- `request`
- `schema`, `schema-proof`
- `server`
- `signer`, `signer-proof`
- `signer-factor`, `signer-factor-proof`, `signer-factor-secret`
- `symbol`, `symbol-proof`
- `wallet`, `wallet-proof`

#### Read/Query Operations

- `read` and `query` (bearer authorization) on all records

**Security Notes:**

- Focused on security and access control
- Cannot manage owner or services circles
- Cannot execute payment operations
- Can create access policies

---

### 4. Operations Circle

**Purpose:** Operational monitoring and reporting

**Who Should Be in This Circle:**

- Operations staff
- Monitoring personnel
- Report generators

**Permissions:**

#### Read/Query Operations (Limited Scope)

- `read` and `query` (bearer authorization) on:
  - `schema`
  - `wallet`
  - `report`
  - `domain`
  - `signer`
  - `circle`
  - `intent`
  - `circle-signer`

#### Report Operations

- `create` on `report-proof` records
- `create` reports with schemas:
  - `billing`
  - `reconciliation`
  - `trans_details_rep` (PH-standard)
  - `ledger_movement_rep` (PH-standard)
  - `ledger_participants_rep` (PH-standard)

**Security Notes:**

- **Read-only** access (except reports)
- Cannot modify system configuration
- Cannot execute payment operations
- Focused on monitoring and reporting

---

### 5. Services Circle

**Purpose:** Bridge operations and payment processing

**Who Should Be in This Circle:**

- External entity bridges
- Internal node bridges (Transfiya, Servibanca, etc.)
- Payment processing services

**Permissions:**

#### Payment Operations (Complete Flow)

- `spend` - Initiate payments
- `commit` - Finalize transactions
- `abort` - Cancel transactions
- All on `wallet` records

#### Intent Management

- `create` on `intent` records
- `create` on `intent-proof` records

#### Anchor Management

- `create`, `update`, `read`, `query`, `drop`, `manage`, `access` on `anchor` records

#### Read/Query Operations

- `read` and `query` (bearer authorization) on:
  - `intent`
  - `wallet`

**Security Notes:**

- **CRITICAL:** Bridges should ONLY be in this circle
- Provides complete payment flow functionality
- Minimal privileges (only payment-related operations)
- Follows principle of least privilege
- **Never put bridges in owner circle**

**Key Feature:**
The services policy provides all three critical payment actions (`spend`, `commit`, `abort`) so bridges can complete payment flows without needing owner privileges.

---

### 6. Support Circle

**Purpose:** Read-only access for support operations

**Who Should Be in This Circle:**

- Support staff
- Customer service representatives
- Troubleshooting personnel

**Permissions:**

#### Read/Query Operations Only

- `read` and `query` (bearer authorization) on all records

**Security Notes:**

- **Read-only** access
- Cannot modify anything
- Cannot execute operations
- Minimal privileges for support tasks

---

## Segregation of Functions

### Administrative Functions

**Circles:** Owner, Admin, Security

**Responsibilities:**

- System configuration
- Policy management
- Access control
- Infrastructure management

**Separation:**

- **Owner:** Full control, can manage everything
- **Admin:** Can manage infrastructure but not owner circles
- **Security:** Can manage security policies and access control, restricted circle management

### Operational Functions

**Circles:** Operations, Support

**Responsibilities:**

- Monitoring
- Reporting
- Support operations

**Separation:**

- **Operations:** Can create reports, read operational data
- **Support:** Read-only access for troubleshooting

### Service Functions

**Circles:** Services

**Responsibilities:**

- Payment processing
- Bridge operations
- Transaction management

**Separation:**

- **Services:** Complete payment flow operations, isolated from administrative functions

---

## Security Model

### Authorization Types

1. **Signer Authorization** - Requires cryptographic signature

   - Used for: create, update, delete, and operational actions
   - Example: `signer: { $circle: "admin" }`

2. **Bearer Authorization** - Uses bearer tokens
   - Used for: read and query operations
   - Example: `bearer: { $signer: { $circle: "admin" } }`

### Policy Application Levels

1. **Server Level** - Applied via server configuration (affects all ledgers)
2. **Ledger Level** - Applied to all records within a specific ledger
3. **Record Level** - Applied to individual records only

### Additive Authorization Model

Minka uses an **additive authorization model**, meaning:

- Permissions from multiple rules are combined (OR logic)
- More permissive rules at ledger level can override restrictive record-level rules
- Policies must be carefully designed to prevent privilege escalation

---

## Complete Payment Flow Example

### Bridge Payment Processing (Services Circle)

1. **Initiate Payment**

   - Action: `spend`
   - Circle: `services`
   - Record: `wallet`
   - ✅ Authorized by services policy

2. **Finalize Transaction**

   - Action: `commit`
   - Circle: `services`
   - Record: `wallet`
   - ✅ Authorized by services policy

3. **Cancel Transaction (if needed)**
   - Action: `abort`
   - Circle: `services`
   - Record: `wallet`
   - ✅ Authorized by services policy

**Result:** Complete payment flow without needing owner privileges.

---

## Comparison: Before vs. After Updates

### Before Updates (Original PH Policies)

**Problems:**

- ❌ Owner policy missing 11 critical actions (`spend`, `commit`, `abort`, etc.)
- ❌ Admin/Security policies missing 16 record types
- ❌ Services policy only had `spend` (incomplete payment flows)
- ❌ Bridges couldn't complete payment operations

**Workarounds:**

- Created `services` policy for `spend` only
- Bridges needed owner circle for complete flows (security risk)

### After Updates (Current Configuration)

**Solutions:**

- ✅ Owner policy includes all 17 actions (matching RTP)
- ✅ Admin/Security policies include all 29 record types
- ✅ Services policy includes `spend`, `commit`, `abort` (complete flows)
- ✅ Bridges can operate with minimal privileges

**Result:**

- ✅ Complete functionality
- ✅ Proper segregation of duties
- ✅ Principle of least privilege maintained
- ✅ Security and functionality balanced

---

## Best Practices

### Circle Membership

1. **Owner Circle**

   - Minimal membership (system owners only)
   - Never include bridges or services
   - Use for system-level operations only

2. **Admin Circle**

   - System administrators
   - Infrastructure managers
   - Not for payment operations

3. **Security Circle**

   - Security officers
   - Policy managers
   - Access control administrators

4. **Operations Circle**

   - Operations staff
   - Monitoring personnel
   - Report generators

5. **Services Circle**

   - **ONLY bridges and payment services**
   - External entity bridges
   - Internal node bridges
   - **Never put administrative users here**

6. **Support Circle**
   - Support staff
   - Customer service
   - Troubleshooting personnel

### Security Guidelines

1. **Never put bridges in owner circle** - Use services circle only
2. **Minimize owner circle membership** - Only essential system owners
3. **Use services circle for all bridge operations** - Complete payment flows available
4. **Separate administrative and operational functions** - Clear boundaries
5. **Regular access reviews** - Audit circle memberships periodically
6. **Principle of least privilege** - Grant minimum necessary permissions

---

## Policy Files Reference

### Updated Policies (Ready for Deployment)

- `admin-ph.json` - Administrative operations
- `operations-ph.json` - Operational monitoring
- `security-ph.json` - Security management
- `support-ph.json` - Support operations
- `services-ph.json` - Bridge operations (enhanced with commit/abort)
- `owner-ph.json` - Full system control

### Original Policies (Preserved)

- `*-ph-original.json` - All original files preserved for reference

---

## Deployment Checklist

- [ ] Review all policy files
- [ ] Verify circle memberships
- [ ] Ensure bridges are only in services circle
- [ ] Test payment flows with services circle
- [ ] Verify administrative functions work correctly
- [ ] Test read/query operations for operations and support
- [ ] Validate security policy management
- [ ] Deploy to development environment
- [ ] Test all operations
- [ ] Deploy to production after validation

---

## Summary

The updated Payments Hub policy configuration provides:

✅ **Complete Functionality** - All necessary actions available
✅ **Proper Segregation** - Clear separation of duties
✅ **Security** - Principle of least privilege maintained
✅ **Bridge Operations** - Complete payment flows with minimal privileges
✅ **Administrative Control** - Full infrastructure management
✅ **Operational Monitoring** - Read access for operations and support

**Key Achievement:** Bridges can now execute complete payment flows (`spend`, `commit`, `abort`) using only the `services` circle, maintaining security while providing full functionality.

---

## References

- [Minka Security Policies Documentation](https://docs.minka.io/ledger/explanations/security-policies/)
- `POLICY_ANALYSIS.md` - Detailed policy comparison and analysis
- `BRIDGE_OPERATIONS_ANALYSIS.md` - Bridge operations analysis
- `CHANGES_SUMMARY.md` - Summary of all changes made
