/**
 * DBT-GUARD Annexure-I Mandate Generator
 * Generates formatted NPCI Aadhaar-Bank Account Seeding Mandate Forms (Annexure-I)
 * for PM-KISAN Direct Benefit Transfer beneficiaries.
 */

export interface BeneficiaryMandateData {
  farmerName: string;
  maskedAadhaar: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  villagePanchayat: string;
  district: string;
  caseId: string;
  remediationReason: string;
}

export function generateAnnexureIMandateText(data: BeneficiaryMandateData): string {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
================================================================================
                    NATIONAL PAYMENTS CORPORATION OF INDIA (NPCI)
                  APPLICATION FOR SEEDING / LINKING AADHAAR NUMBER
              AND RECEIVING DBT BENEFITS THROUGH APBS (ANNEXURE - I)
================================================================================

Date: ${dateStr}
Case Reference: ${data.caseId} (DBT-GUARD Auto-Generated)

To,
The Branch Manager,
${data.bankName},
${data.branchName} Branch,
${data.district}, Kerala.

Subject: Consent to Seed Aadhaar Number with Account and Map to NPCI APBS

Respected Sir / Madam,

I, ${data.farmerName.toUpperCase()}, residing at ${data.villagePanchayat}, ${data.district},
hold an active Savings Bank Account with your branch as detailed below:

1. Account Number: ${data.accountNumber}
2. IFSC Code: ${data.ifscCode}
3. Aadhaar Number (Masked): ${data.maskedAadhaar}

PURPOSE & CONSENT:
I hereby submit my Aadhaar number and give my voluntary consent to:
(a) Seed my Aadhaar with my bank account mentioned above for authentication & e-KYC.
(b) Map my Aadhaar with NPCI Mapper to receive Direct Benefit Transfer (DBT) 
    credits under PM-KISAN and other Government welfare schemes.
(c) I understand that if I have an existing Aadhaar mapping with another bank,
    this submission will designate ${data.bankName} as my primary receiving bank.

Remediation Note from Krishi Bhavan:
${data.remediationReason}

Yours faithfully,


_________________________
(Signature / Thumb Impression of Beneficiary)
Name: ${data.farmerName}
Mobile: Linked to Aadhaar

--------------------------------------------------------------------------------
                   FOR BRANCH OFFICE USE ONLY (ACKNOWLEDGEMENT)
--------------------------------------------------------------------------------
Received request for Aadhaar Seeding / NPCI Mapping from:
Beneficiary Name: ${data.farmerName}
Account Number: ${data.accountNumber}
Date Received: ____________________

Status: [ ] Seeded & Mapped to APBS   [ ] KYC Updated   [ ] Rejected (Reason: _______)

Authorised Signatory & Branch Stamp: _______________________________
================================================================================
`.trim();
}

/**
 * Triggers a browser download of the generated NPCI Annexure-I text file
 */
export function downloadAnnexureIFile(data: BeneficiaryMandateData): void {
  const content = generateAnnexureIMandateText(data);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NPCI_Annexure_I_${data.caseId}_${data.farmerName.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
