# DBT-GUARD Data Dictionary & Reference Documentation

## Overview
DBT-GUARD is an error-detection, triage, and inter-agency remediation system for PM-KISAN Direct Benefit Transfer (DBT) payments in Thrissur District, Kerala.

### Data Architecture
All farmer identities and transaction instances are synthetically generated for research and demonstration purposes in compliance with the **Aadhaar Act 2016** and **Digital Personal Data Protection (DPDP) Act 2023**.
No real Personally Identifiable Information (PII) is stored or processed.

### File Organization
- `data/mock/farmers.csv`: 1,000 synthetic farmer beneficiary records across 8 Thrissur local bodies.
- `data/mock/bank_accounts.csv`: Core banking account numbers (masked), IFSC codes, branch references, and account statuses.
- `data/mock/npci_mapper.csv`: NPCI Central Mapper status index linked by Aadhaar tokens.
- `data/mock/pfms_validation.csv`: Public Financial Management System validation and error codes (R01, E01, L02, etc.).
- `data/mock/payment_status.csv`: Historical instalment ledgers (Instalment 21, 22, and 23) including payment failure codes.
- `data/mock/rules.csv`: Decision rules matrix R01 through R12.

### Reference Data
- `data/reference/thrissur_local_bodies.csv`: 8 authentic local government bodies in Thrissur District pilot (Irinjalakuda, Kattoor, Muriyad, Karalam, Padiyur, Aloor, Vellookkara, Poomangalam).
- `data/reference/sbi_branches.csv`: Real State Bank of India branches in Thrissur district with IFSC codes.
- `data/reference/pmkisan_instalments.csv`: Official PM-KISAN payment cycle dates and schedules.
- `data/reference/context_stats.csv`: Empirical benchmarks cited from Kerala SLBC bulletins and DLCC reports.

### Rules Engine Calibration
- **Ready (Green):** 720 records
- **Needs Verification (Amber):** 20 records
- **Issue Identified (Red):** 250 records
- **Payment Pending (Grey):** 10 records
- **Total:** 1,000 records
- **Flagship Case:** Case #K104 (KL-TSR-0001 Ravi K, Aadhaar not mapped in NPCI mapper, R03/R01 diagnostic).
