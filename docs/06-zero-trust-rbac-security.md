# Contribution 06: Zero-Trust RBAC & DPDP Act 2023 Compliant Data Isolation

## Overview
Compliance with the Digital Personal Data Protection (DPDP) Act 2023 and the Aadhaar Act 2016 is core to DBT-GUARD's security design.

## Architecture
- **PII Masking:** Aadhaar numbers are masked to the last 4 digits (`XXXX-XXXX-4921`) across all UI tables and logs.
- **Cryptographic Tenant Isolation:** When a farmer logs in, state queries are strictly scoped to their own record.
- **6 Stakeholder Roles:**
  1. Farmer
  2. Krishi Bhavan Officer
  3. Lead Bank Branch
  4. Akshaya Centre
  5. Village Office
  6. District Nodal Officer
