import type {
  Farmer,
  BankAccount,
  NpciMapperRecord,
  PfmsValidationRecord,
  PaymentInstalment,
  CaseRecord,
  CaseStatus,
  CallStatus,
  Role,
} from '../types';

export interface RuleEvaluationResult {
  rule_code: string;
  rule_id: string;
  issue_title: string;
  issue_description: string;
  severity: 'Red' | 'Amber' | 'Grey' | 'Green';
  status: CaseStatus;
  owner_office_type: Role;
  owner_office_name: string;
  waiting_for: 'Bank' | 'Akshaya' | 'Village Office' | 'Farmer' | 'Department' | 'System';
  priority: number;
  priority_label: string;
  evidence_text: string;
  farmer_action_text: string;
  where_to_go: string;
  documents_required: string[];
  proof_to_close: string;
  next_step_text: string;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const TODAY = '2026-10-16';

export function evaluateRules(
  farmer: Farmer,
  account: BankAccount,
  npci: NpciMapperRecord,
  pfms: PfmsValidationRecord,
  payments: PaymentInstalment[],
  daysOpen: number = 3,
  callStatus: CallStatus = 'Pending Call'
): RuleEvaluationResult {
  const latestPayment = payments.find((p) => p.instalment_no === 23) || payments[payments.length - 1];
  const previousPaymentFailed = payments.some(
    (p) => (p.instalment_no === 22 || p.instalment_no === 23) && p.status === 'Payment Failed'
  );

  let rule_code = 'CLEAN';
  let rule_id = 'READY';
  let issue_title = 'Clean Validation (Ready)';
  let issue_description = 'All mandatory criteria satisfied. Account seeded and active in NPCI mapper.';
  let severity: 'Red' | 'Amber' | 'Grey' | 'Green' = 'Green';
  let status: CaseStatus = 'Ready';
  let owner_office_type: Role = 'krishi_bhavan';
  let owner_office_name = farmer.krishi_bhavan || 'Krishi Bhavan Thrissur';
  let waiting_for: 'Bank' | 'Akshaya' | 'Village Office' | 'Farmer' | 'Department' | 'System' = 'Department';

  let evidence_text = 'Clearinghouse positive confirmation. Active Aadhaar mandate verified.';
  let farmer_action_text = 'No action required by beneficiary.';
  let where_to_go = 'Not applicable.';
  let documents_required: string[] = [];
  let proof_to_close = 'Disbursement confirmation in next clearinghouse cycle.';
  let next_step_text = 'Next instalment will be credited directly to the Aadhaar-seeded bank account.';

  // Rule Evaluation (Order defined in prompt R01 -> R12)
  if (farmer.ekyc_status === 'Pending' || farmer.ekyc_status === 'Failed') {
    // R01 e-KYC Pending -> Red EKYC_PENDING
    rule_code = 'R01';
    rule_id = 'EKYC_PENDING';
    issue_title = 'e-KYC Pending (Biometric / OTP)';
    issue_description = 'Farmer e-KYC re-authentication has lapsed or is incomplete in central portal.';
    severity = 'Red';
    status = 'Issue identified';
    owner_office_type = 'akshaya';
    owner_office_name = `Akshaya e-Kendra (${farmer.local_body})`;
    waiting_for = 'Farmer';
    evidence_text = `PM-KISAN portal flag: e-KYC status marked as ${farmer.ekyc_status}.`;
    farmer_action_text = 'Visit nearest Akshaya Center with Aadhaar card for biometric authentication.';
    where_to_go = `Nearest Akshaya e-Kendra in ${farmer.local_body}`;
    documents_required = ['Original Aadhaar Card', 'Mobile phone linked to Aadhaar'];
    proof_to_close = 'Automated UIDAI e-KYC success callback from central gateway.';
    next_step_text = 'Once e-KYC is cleared, DBT mandate flag will update to Active.';
  } else if (farmer.land_seeding_status === 'Pending' || farmer.land_seeding_status === 'Mismatch') {
    // R02 land seeding Pending -> Red LAND_PENDING
    rule_code = 'R02';
    rule_id = 'LAND_PENDING';
    issue_title = 'Land Seeding Pending (RoR / ReLIS Cadastre Mismatch)';
    issue_description = 'Land record cadastre linkage incomplete or survey number discrepancy in ReLIS.';
    severity = 'Red';
    status = 'Issue identified';
    owner_office_type = 'village_office';
    owner_office_name = `Village Revenue Office (${farmer.local_body})`;
    waiting_for = 'Village Office';
    evidence_text = `Kerala ReLIS cadastre mismatch for survey records in ${farmer.local_body}.`;
    farmer_action_text = 'Submit land tax receipt (RoR) to Village Revenue Officer for online verification.';
    where_to_go = `Village Revenue Office, ${farmer.local_body}`;
    documents_required = ['Recent Land Tax Receipt', 'Possession Certificate', 'Aadhaar Xerox'];
    proof_to_close = 'Digital mutation / RoR verification push from Kerala ReLIS portal.';
    next_step_text = 'Village Revenue Officer confirms cadastral boundary and signs electronically.';
  } else if (npci.mapped_status === 'Not mapped') {
    // R03 mapper "Not mapped" -> Red NOT_MAPPED
    rule_code = 'R03';
    rule_id = 'NOT_MAPPED';
    issue_title = 'Aadhaar not mapped in NPCI (Payment bounced)';
    issue_description =
      'NPCI mapper de-linked or marked inactive. PM-KISAN 23rd instalment payment bounce triggered by PFMS clearinghouse reject.';
    severity = 'Red';
    status = 'Issue identified';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'Bank';
    evidence_text = `*PFMS_ERR_R01: Aadhaar number [${farmer.aadhaar_masked}] not seeded with bank account at NPCI Central Mapper for Beneficiary_ID ${farmer.farmer_id}.* Batch Ref: PFMS-KL-TSR-2026-B892.`;
    farmer_action_text =
      'Farmer must physically submit Annexure-I Aadhaar Seeding & DBT Mandate Consent Form at the bank branch.';
    where_to_go = `${account.bank_name}, ${account.branch_name}`;
    documents_required = [
      'Original Aadhaar Card + 1 Self-attested photocopy',
      'Bank Passbook copy',
      'PM-KISAN Annexure 1 DBT Mandate Consent Form',
    ];
    proof_to_close =
      'Physical bank counterfoil acknowledgement or fresh active NPCI mapper response ping in next clearinghouse scheduled pull.';
    next_step_text =
      'Upon verified NPCI re-mapping, automated state trigger queues the stalled 23rd instalment (₹2,000) for instant re-credit.';
  } else if (npci.mapped_status === 'De-seeded') {
    // R04 "De-seeded" -> Red DESEEDED
    rule_code = 'R04';
    rule_id = 'DESEEDED';
    issue_title = 'Aadhaar Mandate De-seeded by Bank';
    issue_description = 'Bank de-seeded Aadhaar mandate during core banking or account migration.';
    severity = 'Red';
    status = 'Issue identified';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'Bank';
    evidence_text = 'NPCI mapper shows status "De-seeded" by issuing financial institution.';
    farmer_action_text = 'Visit bank branch with passbook and re-consent for DBT mandate routing.';
    where_to_go = `${account.bank_name}, ${account.branch_name}`;
    documents_required = ['Bank Passbook', 'Aadhaar Card', 'Fresh Mandate Slip'];
    proof_to_close = 'Core banking re-activation receipt stamped by branch manager.';
    next_step_text = 'Disbursement re-scheduled upon positive NPCI status broadcast.';
  } else if (account.account_status === 'Closed') {
    // R05 account Closed -> Red ACC_CLOSED
    rule_code = 'R05';
    rule_id = 'ACC_CLOSED';
    issue_title = 'Bank Account Closed / Defunct';
    issue_description = 'Target credit account closed at branch; PFMS transfer rejected.';
    severity = 'Red';
    status = 'Issue identified';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'Farmer';
    evidence_text = `Core banking return code: Account ${account.account_number_masked} closed.`;
    farmer_action_text = 'Open fresh savings account (or provide another active account) and seed with Aadhaar.';
    where_to_go = `Any commercial bank branch or Post Office (IPPB) in ${farmer.local_body}`;
    documents_required = ['Aadhaar Card', 'Passport Photos', 'PAN / Form 60'];
    proof_to_close = 'New account opening kit with Aadhaar seeding confirmation.';
    next_step_text = 'Update beneficiary master record with newly opened account.';
  } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(account.ifsc)) {
    // R06 IFSC invalid -> Red WRONG_BANK
    rule_code = 'R06';
    rule_id = 'WRONG_BANK';
    issue_title = 'Invalid IFSC Code (Bank Merger Anomaly)';
    issue_description = `Recorded IFSC ${account.ifsc} does not match standard 11-character RBI syntax.`;
    severity = 'Red';
    status = 'Issue identified';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'Bank';
    evidence_text = `IFSC check failed regex /^[A-Z]{4}0[A-Z0-9]{6}$/: "${account.ifsc}"`;
    farmer_action_text = 'Obtain new merged IFSC code from branch counter or passbook front page.';
    where_to_go = `${account.bank_name}, ${account.branch_name}`;
    documents_required = ['Updated Bank Passbook'];
    proof_to_close = 'Corrected IFSC updated in PFMS master beneficiary registry.';
    next_step_text = 'Central PFMS clearing re-tests IFSC validity with RBI NEFT directory.';
  } else if (
    account.kyc_status === 'Pending' ||
    account.kyc_status === 'Expired' ||
    account.account_status === 'Frozen'
  ) {
    // R07 KYC Pending/Expired or Frozen -> Red KYC_PENDING
    rule_code = 'R07';
    rule_id = 'KYC_PENDING';
    issue_title = 'Bank Account KYC Expired / Debit-Credit Freeze';
    issue_description = 'Periodic KYC renewal overdue in Core Banking System; debit/credit freeze in effect.';
    severity = 'Red';
    status = 'Issue identified';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'Bank';
    evidence_text = `Bank KYC status flagged as ${account.kyc_status}, Account Status: ${account.account_status}.`;
    farmer_action_text = 'Submit Re-KYC form with identity and address proofs at your home branch.';
    where_to_go = `${account.bank_name}, ${account.branch_name}`;
    documents_required = ['Aadhaar Card', 'Voter ID or Ration Card', 'Two Passport Photos'];
    proof_to_close = 'Bank KYC renewal confirmation receipt.';
    next_step_text = 'Core banking lifts freeze flag; credit transactions enabled.';
  } else if (
    pfms.error_code === 'N02' ||
    pfms.error_description.toLowerCase().includes('name mismatch')
  ) {
    // R08 name mismatch -> Amber
    rule_code = 'R08';
    rule_id = 'NAME_MISMATCH';
    issue_title = 'Beneficiary Name Spelling Variance (PFMS vs Bank)';
    issue_description = 'Name string divergence exceeds acceptable phonetic threshold between Aadhaar and CBS.';
    severity = 'Amber';
    status = 'Needs verification';
    owner_office_type = 'krishi_bhavan';
    owner_office_name = farmer.krishi_bhavan;
    waiting_for = 'Department';
    evidence_text = `PFMS Error N02: Name on PM-KISAN record does not exactly match bank core banking ledger.`;
    farmer_action_text = 'Submit identity affidavit or one-and-the-same certificate to Krishi Bhavan.';
    where_to_go = `Krishi Bhavan, ${farmer.local_body}`;
    documents_required = ['Aadhaar Card', 'Bank Passbook', 'Ration Card'];
    proof_to_close = 'Agricultural Extension Officer name match certification in state portal.';
    next_step_text = 'Agricultural Officer updates alias record in PM-KISAN database.';
  } else if (account.account_status === 'Dormant' || npci.mapped_status === 'Inactive') {
    // R09 Inactive -> Amber
    rule_code = 'R09';
    rule_id = 'INACTIVE';
    issue_title = 'Account Dormant (No Transactions > 12 Months)';
    issue_description = 'Account placed in inoperative status due to lack of customer transactions.';
    severity = 'Amber';
    status = 'Needs verification';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'Bank';
    evidence_text = `Core Banking ledger: Account ${account.account_number_masked} marked as Dormant.`;
    farmer_action_text = 'Perform an in-person deposit or withdrawal of small amount at branch to reactivate.';
    where_to_go = `${account.bank_name}, ${account.branch_name}`;
    documents_required = ['Bank Passbook', 'Withdrawal/Deposit slip', 'Aadhaar'];
    proof_to_close = 'Dormancy revocation transaction voucher.';
    next_step_text = 'Branch activates mandate upon transaction confirmation.';
  } else if (
    !npci.last_updated_date ||
    daysBetween(npci.last_updated_date, TODAY) > 90 ||
    npci.mapped_status === ''
  ) {
    // R10 mapper blank or response > 90 days old -> Amber DATA_STALE
    rule_code = 'R10';
    rule_id = 'DATA_STALE';
    issue_title = 'NPCI Mapper Status Stale (> 90 Days Without Refresh)';
    issue_description = 'Mapper ping timestamp older than 90 days; re-confirmation needed before bulk disbursal.';
    severity = 'Amber';
    status = 'Needs verification';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'System';
    evidence_text = `Last mapper update timestamp is ${npci.last_updated_date || 'None'}, older than 90 days threshold.`;
    farmer_action_text = 'No farmer action if active; Krishi Bhavan will ping NPCI re-validation bridge.';
    where_to_go = 'Automated clearinghouse query.';
    documents_required = [];
    proof_to_close = 'Fresh 200 OK mapper handshake from NPCI API.';
    next_step_text = 'Automated nightly sync updates mapper status flag.';
  } else if (pfms.error_code === 'B09' || pfms.error_description.includes('Credited bank differs')) {
    // R11 credited bank != bank on record -> Amber
    rule_code = 'R11';
    rule_id = 'BANK_MISMATCH';
    issue_title = 'Credited Bank Differs from Master Record';
    issue_description = 'NPCI router delivered payment to another active account of the same beneficiary.';
    severity = 'Amber';
    status = 'Needs verification';
    owner_office_type = 'bank_branch';
    owner_office_name = `${account.bank_name} (${account.branch_name})`;
    waiting_for = 'Bank';
    evidence_text = 'PFMS reconciliation: disbursement routed to secondary financial institution.';
    farmer_action_text = 'Confirm with bank which account should remain primary for PM-KISAN credits.';
    where_to_go = `${account.bank_name}, ${account.branch_name}`;
    documents_required = ['Passbooks of both accounts', 'Aadhaar Card'];
    proof_to_close = 'Written primary account designation preference form.';
    next_step_text = 'NPCI updates primary DBT recipient bank account.';
  } else if (latestPayment?.status === 'PFMS Response Pending') {
    // R12 latest payment "PFMS Response Pending" -> Grey PENDING
    rule_code = 'R12';
    rule_id = 'PENDING';
    issue_title = 'PFMS Treasury Response Pending';
    issue_description = 'Transaction batch transmitted to RBI clearinghouse; awaiting final settlement advice.';
    severity = 'Grey';
    status = 'Payment pending';
    owner_office_type = 'krishi_bhavan';
    owner_office_name = farmer.krishi_bhavan;
    waiting_for = 'System';
    evidence_text = 'Treasury release batch transmitted. Settlement window in transit.';
    farmer_action_text = 'No farmer action required. Awaiting banking clearing cycle.';
    where_to_go = 'State Treasury Settlement Desk.';
    documents_required = [];
    proof_to_close = 'Final credit advice note from Reserve Bank of India.';
    next_step_text = 'Account credit expected within 48 banking hours.';
  }

  // Priority Calculation:
  // Base: Red 3 / Amber 2 / Grey 1 / Green 1
  // +1 previous instalment failed
  // +1 open > 7 days
  // +1 call not reached
  let priority = severity === 'Red' ? 3 : severity === 'Amber' ? 2 : 1;
  if (previousPaymentFailed) priority += 1;
  if (daysOpen > 7) priority += 1;
  if (callStatus === 'Not reached') priority += 1;

  // Clamp priority between 1 and 6
  priority = Math.min(6, Math.max(1, priority));

  let priority_label = 'Priority 1 (Normal)';
  if (priority >= 5) priority_label = `Priority ${priority} — Urgent`;
  else if (priority === 4) priority_label = 'Priority 4 (High)';
  else if (priority === 3) priority_label = 'Priority 3 (Medium)';
  else if (priority === 2) priority_label = 'Priority 2 (Low)';

  return {
    rule_code,
    rule_id,
    issue_title,
    issue_description,
    severity,
    status,
    owner_office_type,
    owner_office_name,
    waiting_for,
    priority,
    priority_label,
    evidence_text,
    farmer_action_text,
    where_to_go,
    documents_required,
    proof_to_close,
    next_step_text,
  };
}
