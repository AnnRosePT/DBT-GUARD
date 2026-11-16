# Contribution 02: 12-Rule Automated Multi-Agency Triage Engine (R01–R12)

## Overview
Rejection codes in PFMS and NPCI are notoriously cryptic (e.g. `ERR_NPCI_MAP_INACT_04`, `ERR_DORM_ACC_09`). Agriculture officers and farmers previously had no standard mapping to fix them.

## 12 Failure Classification Rules
- **R01 (NPCI Unmapped):** Aadhaar not linked to APBS -> Lead Bank Branch.
- **R02 (Aadhaar De-seeded):** Prior mandate superseded -> Bank Branch.
- **R03 (Dormant Account):** Account inactive >24 months -> Bank Branch KYC Desk.
- **R04 (Name Mismatch):** Aadhaar vs Bank name mismatch -> Akshaya e-Kendra.
- **R05 (Biometric e-KYC Pending):** Periodic PM-KISAN KYC lapse -> Akshaya CSC.
- **R06 (Land Record Mismatch):** RoR survey parcel discrepancy -> Village Revenue Office.
- **R07 (Land Mutation Split):** Inherited land division -> Village Revenue Office.
- **R08 (IFSC Stale):** Regional rural bank merger -> Krishi Bhavan / PFMS desk.
- **R09 (Account Closed):** Account closed by beneficiary -> Lead Bank Branch.
- **R10 (Invalid Account Number):** Typographical entry error -> Krishi Bhavan.
- **R11 (Minor / Joint Account):** PM-KISAN requires individual adult account -> Bank Branch.
- **R12 (Duplicate Beneficiary):** Dual registration detected -> Krishi Bhavan District Desk.
