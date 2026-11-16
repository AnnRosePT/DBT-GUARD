# 🌾 DBT-GUARD: PM-KISAN DBT Beneficiary Resolution Platform

> **Detect. Explain. Contact. Resolve.**  
> India's first closed-loop, vernacular Direct Benefit Transfer (DBT) beneficiary remediation platform designed to eliminate the last-mile banking blindspot between PFMS central payment gateways, NPCI Aadhaar seeding, and grassroots Krishi Bhavans.

Developed for **She Builds Tech 3.0 (Open Innovation in FinTech)**  
**Team NPS** • **Christ College of Engineering, Irinjalakuda**  
*Ann Rose P T • Ann Sani • Merin Joy • Pawrnami Omprakash*

---

## 📌 Problem Overview
Every disbursement cycle under PM-KISAN, millions of rightful smallholder farmers face silent installment failures without actionable feedback. Cryptic banking error codes (`E01 NPCI Inactive`, `E02 Dormant Account`, `E03 Land Mutation Discrepancy`, `E04 IFSC Stale`) leave farmers trapped in a triangular run-around between Bank Branches, Krishi Bhavans, and Akshaya CSC centres. Over ₹2,400 Crores remain trapped across disbursement cycles nationwide due to these remediable technical rejections.

---

## 🌟 18 Key Contributions & Innovations

### 1. Closed-Loop "Credit-Confirmed" Resolution Lifecycle
Unlike standard grievance portals that close tickets upon officer remarks, DBT-GUARD enforces a verified closed-loop model. A case remains active until banking/PFMS status revalidation confirms the ₹2,000 credit in the beneficiary's account.

### 2. 12-Rule Automated Multi-Agency Triage Engine (R01–R12)
Normalizes cryptic PFMS/NPCI exception codes and automatically maps each case to the exact responsible authority (Lead Bank Branch, Krishi Bhavan, Akshaya Centre, or Village Office) with targeted remediation protocols, eliminating inter-departmental buck-passing.

### 3. Native Malayalam Vernacular Voice Assist (IVR & Telephony)
Overcomes rural digital and literacy barriers through automated outbound Malayalam voice synthesis and pre-recorded native audio announcements, delivering spoken instructions on required physical documents and specific local offices to visit.

### 4. 4-Stage In-Browser NIC e-Gov SMS Gateway Simulator
Features a high-fidelity simulation of the government telecom pipeline (TRAI DLT Template validation → NIC SMS Hub → BTS Cellular Tower → Handset DLR Delivery) paired with an interactive virtual smartphone display for zero-cost offline demonstration.

### 5. Multi-Carrier Live Telecom Bridge & Fallback Dispatch
Integrates real-world telecom dispatch via Indian SMS gateways (Fast2SMS), Twilio, and direct WhatsApp notification bridges with pre-configured mobile endpoints for live field delivery.

### 6. Zero-Trust RBAC & DPDP Act 2023 Compliant Data Isolation
Provides 6 specialized role portals (Farmer, Krishi Bhavan Officer, Lead Bank Branch, Akshaya Centre, Village Office, District Nodal Officer) with masked PII (`XXXX-XXXX-4921`) and cryptographic tenant isolation ensuring farmers only access their own records.

### 7. Offline-Resilient Browser-First Edge Architecture
Engineered on React, TypeScript, Vite, Tailwind CSS, Zustand, and LocalStorage, enabling the entire 1,000-case database, rule engine, and audit logging to execute with near-zero latency directly in-browser on low-spec rural desktops without mandatory server dependencies.

### 8. Automated SLA Tracking & District Nodal Escalation Matrix
Monitors case aging with color-coded severity badges (`Green`, `Amber`, `Red`). Overdue cases (>7 days) automatically escalate to the District Nodal Collector's dashboard, preventing cases from slipping past statutory disbursement windows.

### 9. Immutable Chronological Audit Trail for Inter-Agency Accountability
Maintains a tamper-evident event log recording every touchpoint—timestamp, officer name, action taken, documents uploaded, and revalidation status—ensuring complete administrative transparency across departments.

### 10. Actionable Pre-Filled Resolution Cards & Banking Mandates
Generates instant, human-readable Action Cards with pre-filled NPCI Aadhaar-linking mandate forms (Annexure-I), specific branch IFSCs, and document checklists, reducing physical farmer visits from an average of 3 visits down to a single targeted trip.

### 11. Google Gemini 2.5 Flash Vernacular Advisory Generation
Leverages AI reasoning to translate technical banking failure parameters into natural, culturally respectful vernacular Malayalam advisories tailored to the farmer's specific crop and bank.

### 12. Statistically Grounded 1,000-Beneficiary Synthetic Dataset
Curated a statistically representative dataset modeled after Thrissur District demographics, covering 12 PFMS rejection classes, land survey records, and bank merger anomalies for robust stress testing.

### 13. Data-Driven Macro Bottleneck Analytics for SLBC Policy
Aggregates grassroots failure patterns to provide District Collectors and State Level Bankers' Committees (SLBC) real-time visibility into systemic failure clusters (e.g., mass de-linking post bank mergers), enabling targeted mobile IPPB doorstep camps.

### 14. Wi-Fi Calling Bridge & Interactive Incoming Call Telephony UI
Provides an interactive incoming call screen with realistic telephony ring chimes, caller ID emulation (`KL-GOVAGR`), and live Malayalam audio playback on both mobile and desktop views.

### 15. Cross-Departmental Document Verification & Evidence Locker
Enables Village Officers, Akshaya operators, and bank clerks to upload, inspect, and approve verification proofs (tax receipts, passbook copies, RoR mutations) within a unified case dossier.

### 16. Biometric e-KYC & NPCI APBS Diagnostic Engine
Offers an instant multi-point checklist assessing Aadhaar-bank account mapping, NPCI payment bridge status, active KYC validity, and land cadastre linkage in a single dashboard view.

### 17. Bilingual i18n Localization Engine (English & Malayalam)
Features a real-time language switcher that dynamically translates dashboards, workflows, table headers, forms, and status chips between English and Malayalam for administrative and grassroots users alike.

### 18. Extensible State Agri-Stack & DigiLocker API Blueprint
Architected with modular REST/webhook interfaces ready to plug into Kerala Karshakan, AgriStack, Ente Bhoomi land records, and DigiLocker for automated digital document fetching.

---

## 🏛️ System Architecture

```mermaid
graph TD
    A[PFMS / NPCI Rejection Feed] --> B[DBT-GUARD Core Rules Engine]
    B --> C{Automated Triage R01-R12}
    C -->|Bank Action| D1[Lead Bank Branch Queue: Aadhaar / Dormancy]
    C -->|CSC Action| D2[Akshaya Centre Queue: Biometric e-KYC]
    C -->|Revenue Action| D3[Village Office Queue: Land RoR Mutation]
    C -->|Agri Action| D4[Krishi Bhavan Queue: IFSC / Revalidation]
    
    C --> E[Farmer Outbound Engine]
    E --> F1[Malayalam IVR Voice Call / Wi-Fi Bridge]
    E --> F2[NIC e-Gov SMS Gateway Simulator / Live SMS]
    
    D1 & D2 & D3 & D4 --> G[Remediation Executed & Proof Uploaded]
    G --> H[Automated PFMS Revalidation]
    H -->|Confirmed Credit| I[Case Closed: ₹2,000 Disbursed]
```

---

## 👥 Role-Based Access Control (RBAC)

| Role | Access Scope & Key Responsibilities |
|:---|:---|
| **Farmer** | Isolated personal view: payment status, nearest office, vernacular voice advisory |
| **Krishi Bhavan Officer** | Block jurisdiction, remediation queue, camp scheduling, batch revalidation |
| **Lead Bank Branch** | Mandate verification, NPCI mapper activation, account unfreezing |
| **Akshaya Centre** | Biometric e-KYC authentication, Aadhaar demographics correction |
| **Village Office** | Land survey RoR reconciliation, cadastre mutation clearance |
| **District Nodal Officer** | Macro MIS analytics, overdue SLA escalations, inter-agency reporting |

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Accessible Government & FinTech Theme)
- **State Management:** Zustand with LocalStorage persistence
- **Icons & Typography:** Material Symbols, Noto Sans Malayalam, Inter
- **Telecom & Voice:** Web Audio API, NIC SMS Simulator, Fast2SMS / Twilio Bridges

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/AnnRosePT/DBT-GUARD.git
cd DBT-GUARD

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to explore the platform.

---

## 👩‍💻 Team NPS — Christ College of Engineering, Irinjalakuda
- **Ann Rose P T**
- **Ann Sani**
- **Merin Joy**
- **Pawrnami Omprakash**

*Submitted for She Builds Tech 3.0 · Open Innovation in FinTech*
