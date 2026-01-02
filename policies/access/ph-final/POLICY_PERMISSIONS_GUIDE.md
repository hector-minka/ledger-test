# Policy Permissions Guide

This document explains what each policy role can do in simple terms. Think of policies as different types of access cards that give people different levels of permission to perform actions in the system.

---

## 👑 Owner Policy

**Who should have this:** The main account owner or highest-level administrator.

**What they can do:**

- ✅ **Create anything** - Can create any type of record in the system (wallets, intents, anchors, policies, etc.)
- ✅ **Full control** - Can perform all actions on any record including:
  - Create, update, read, delete records
  - Manage wallets (spend, commit, abort transactions)
  - Manage access and permissions
  - Create and manage reports
  - Activate, deactivate, or destroy resources
- ✅ **View everything** - Can read and query all data in the system
- ✅ **Generate reports** - Can create billing, reconciliation, and transaction reports

**Think of it as:** The master key that can do everything.

---

## 🔧 Admin Policy

**Who should have this:** System administrators who need to manage the platform.

**What they can do:**

- ✅ **Manage users and groups** - Can create and manage circles (user groups), except owner circles
- ✅ **Full system access** - Can perform any action on system records like:
  - Anchors, bridges, intents, ledgers, wallets
  - Schemas, domains, servers, signers
  - Circle proofs, report proofs, and other system proofs
- ✅ **Manage reports** - Can:
  - Create specific report types (billing, reconciliation, export-changes, export-journal, transaction details, ledger movements, ledger participants)
  - Update, read, and delete existing reports
- ✅ **View data** - Can read and query information

**What they cannot do:**

- ❌ Cannot create or update access policies (this is restricted to Security and Owner roles)
- ❌ Cannot manage owner circles or owner records directly

**Think of it as:** A powerful administrator account that can manage system operations and data, but cannot change access policies.

---

## 🔒 Security Policy

**Who should have this:** Security team members who manage access and permissions.

**What they can do:**

- ✅ **Manage access** - Can create and update access policies
- ✅ **Manage user groups** - Can create circles and manage membership for admin, security, operations, and support groups
- ✅ **System monitoring** - Can perform any action on system records (anchors, bridges, intents, ledgers, wallets, etc.)
- ✅ **View data** - Can read and query information for security audits

**Think of it as:** The security team that controls who can access what.

---

## ⚙️ Operations Policy

**Who should have this:** Operations team members who handle day-to-day business operations.

**What they can do:**

- ✅ **View operational data** - Can read and query:
  - Wallets and balances
  - Intents (payment requests)
  - Reports
  - Schemas and domains
  - User information (signers and circles)
- ✅ **Generate reports** - Can create operational reports:
  - Billing reports
  - Reconciliation reports
  - Transaction detail reports
  - Ledger movement reports
  - Ledger participant reports
- ✅ **Create report proofs** - Can generate proof documents for reports

**What they cannot do:**

- ❌ Cannot create or modify records
- ❌ Cannot manage wallets or process transactions
- ❌ Cannot change permissions or policies

**Think of it as:** A read-only account with the ability to generate reports for business operations.

---

## 🛠️ Services Policy

**Who should have this:** Service applications or APIs that need to process transactions.

**What they can do:**

- ✅ **Process payments** - Can create payment intents (payment requests)
- ✅ **Manage wallets** - Can:
  - Spend from wallets
  - Commit transactions
  - Abort transactions
- ✅ **Manage anchors** - Can create, update, read, query, delete, and manage anchors (payment endpoints)
- ✅ **View data** - Can read and query intents and wallets

**What they cannot do:**

- ❌ Cannot manage users or permissions
- ❌ Cannot create reports
- ❌ Cannot access other system records

**Think of it as:** An API key for applications that need to process payments and manage transactions.

---

## 🆘 Support Policy

**Who should have this:** Customer support team members who help users.

**What they can do:**

- ✅ **View data only** - Can read and query information to help customers

**What they cannot do:**

- ❌ Cannot create, modify, or delete anything
- ❌ Cannot process transactions
- ❌ Cannot change permissions
- ❌ Cannot generate reports

**Think of it as:** A read-only account for customer support to view information and help troubleshoot issues.

---

## Summary Table

| Policy         | Create Records     | Modify Records    | Process Payments | Manage Users          | Generate Reports        | View Data  |
| -------------- | ------------------ | ----------------- | ---------------- | --------------------- | ----------------------- | ---------- |
| **Owner**      | ✅ All             | ✅ All            | ✅ Yes           | ✅ Yes                | ✅ Yes                  | ✅ All     |
| **Admin**      | ✅ Most            | ✅ Most           | ✅ Yes           | ✅ Yes (except owner) | ✅ Yes (specific types) | ✅ All     |
| **Security**   | ✅ System records  | ✅ System records | ✅ Yes           | ✅ Limited groups     | ❌ No                   | ✅ All     |
| **Operations** | ❌ No              | ❌ No             | ❌ No            | ❌ No                 | ✅ Yes                  | ✅ Limited |
| **Services**   | ✅ Intents/Anchors | ✅ Anchors        | ✅ Yes           | ❌ No                 | ❌ No                   | ✅ Limited |
| **Support**    | ❌ No              | ❌ No             | ❌ No            | ❌ No                 | ❌ No                   | ✅ All     |

---

## Best Practices

1. **Owner Policy**: Should only be assigned to the account owner or a very trusted administrator. Use sparingly.

2. **Admin Policy**: Use for system administrators who need to manage the platform but shouldn't have owner-level access.

3. **Security Policy**: Assign to security team members who need to manage access controls and monitor security.

4. **Operations Policy**: Perfect for business operations teams who need to view data and generate reports but shouldn't be able to modify anything.

5. **Services Policy**: Use for automated services, APIs, or applications that need to process payments and transactions.

6. **Support Policy**: Ideal for customer support representatives who need to view information to help customers but shouldn't be able to make changes.

---

## Questions?

If you need help determining which policy to assign to a user or service, consider:

- What actions do they need to perform?
- What data do they need to access?
- Should they be able to modify records or just view them?
- Do they need to process payments or just view transaction history?

Remember: It's always better to start with the least permissions needed and add more only when necessary.
