import type { Role, WorkflowStep, CaseRecord } from '../types';

export interface WorkflowTemplate {
  issue_category: string;
  problem_statement: string;
  immediate_next_action: string;
  verification_status: 'Confirmed issue' | 'Suspected issue' | 'Verification required' | 'Resolved issue';
  primary_role: Role;
  primary_role_label: string;
  supporting_role?: Role;
  supporting_role_label?: string;
  escalation_recipient: string;
  farmer_notification_required: boolean;
  farmer_notification_reason?: string;
  farmer_required_action?: string;
  steps: Array<{
    title: string;
    responsible_role: Role | 'farmer';
    responsible_role_label: string;
    action_description: string;
    required_input_evidence?: string;
    expected_outcome: string;
    action_button_label: string;
  }>;
}

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  // Issue A: e-KYC Pending (R07)
  EKYC_PENDING: {
    issue_category: 'e-KYC Verification',
    problem_statement: 'e-KYC verification is pending in national portal.',
    immediate_next_action: 'Assist farmer with biometric or OTP e-KYC authentication at Akshaya Kendra.',
    verification_status: 'Verification required',
    primary_role: 'akshaya',
    primary_role_label: 'Akshaya Kendra Operator',
    supporting_role: 'krishi_bhavan',
    supporting_role_label: 'Krishi Bhavan Agricultural Officer',
    escalation_recipient: 'District IT Mission & District DBT Nodal Officer',
    farmer_notification_required: true,
    farmer_notification_reason: 'Farmer physical or OTP presence is required for Aadhaar e-KYC authentication.',
    farmer_required_action: 'Visit nearest Akshaya Kendra with Aadhaar card and Aadhaar-linked mobile phone.',
    steps: [
      {
        title: 'Confirm e-KYC status',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Confirm that e-KYC is actually pending through the authorised PM-KISAN portal inquiry.',
        required_input_evidence: 'Portal verification timestamp & status code',
        expected_outcome: 'Pending status confirmed before dispatching citizen.',
        action_button_label: 'Confirm e-KYC Status',
      },
      {
        title: 'Determine verification mode',
        responsible_role: 'akshaya',
        responsible_role_label: 'Akshaya Kendra Operator',
        action_description: 'Check whether farmer needs biometric fingerprint verification or Aadhaar OTP verification.',
        required_input_evidence: 'UIDAI OTP mobile status (linked vs unlinked)',
        expected_outcome: 'Verification pathway identified.',
        action_button_label: 'Record Verification Mode',
      },
      {
        title: 'Assign nearest Akshaya Kendra',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Route task to beneficiary local ward Akshaya Kendra with verified service instructions.',
        required_input_evidence: 'Akshaya Kendra Center Code',
        expected_outcome: 'Akshaya operator notified for desk facilitation.',
        action_button_label: 'Assign Akshaya Kendra',
      },
      {
        title: 'Notify farmer in Malayalam',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Explain steps in Malayalam via SMS and voice assist informing required documents.',
        required_input_evidence: 'Outreach delivery log & farmer consent',
        expected_outcome: 'Farmer notified with specific Akshaya location.',
        action_button_label: 'Prepare Notification',
      },
      {
        title: 'Record service completion outcome',
        responsible_role: 'akshaya',
        responsible_role_label: 'Akshaya Kendra Operator',
        action_description: 'Execute e-KYC transaction and record biometric transaction reference ID.',
        required_input_evidence: 'UIDAI e-KYC Transaction ID / Ack Slip',
        expected_outcome: 'e-KYC authentication successfully recorded.',
        action_button_label: 'Record Completion',
      },
      {
        title: 'Verify completion in state database',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Verify updated e-KYC flag in state beneficiary repository.',
        required_input_evidence: 'Authorised state sync response',
        expected_outcome: 'e-KYC confirmed active.',
        action_button_label: 'Verify Auth Source',
      },
      {
        title: 'Revalidate payment eligibility',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Re-run scheme eligibility checks and release docket for next instalment run.',
        required_input_evidence: 'Revalidation check result',
        expected_outcome: 'Case marked ready for disbursal.',
        action_button_label: 'Revalidate Case',
      },
    ],
  },

  // Issue B: Aadhaar–NPCI Mapping Not Confirmed (R03, R04, R01)
  NPCI_MAPPING_UNCONFIRMED: {
    issue_category: 'Aadhaar–NPCI Mapping',
    problem_statement: 'Bank mapping not confirmed in NPCI mapper.',
    immediate_next_action: 'Verify NPCI mapping and account status through authorised banking system.',
    verification_status: 'Verification required',
    primary_role: 'bank_branch',
    primary_role_label: 'Bank Branch Officer',
    supporting_role: 'krishi_bhavan',
    supporting_role_label: 'Krishi Bhavan Agricultural Officer',
    escalation_recipient: 'Lead District Manager (LDM) & District Nodal Officer',
    farmer_notification_required: true,
    farmer_notification_reason: 'Farmer may need to submit Mandate Annexure-I if account is dormant or unseeded.',
    farmer_required_action: 'Visit home bank branch with Aadhaar card and passbook to execute DBT mandate.',
    steps: [
      {
        title: 'Verify bank account status',
        responsible_role: 'bank_branch',
        responsible_role_label: 'Bank Branch Officer',
        action_description: 'Check Finacle/CBS account status: ensure account is Active (not Dormant, Closed, or Frozen).',
        required_input_evidence: 'CBS Account Status Code (Active/Dormant)',
        expected_outcome: 'Account status confirmed operational.',
        action_button_label: 'Mark Account Verified',
      },
      {
        title: 'Check NPCI mapper record',
        responsible_role: 'bank_branch',
        responsible_role_label: 'Bank Branch Officer',
        action_description: 'Verify whether required Aadhaar–NPCI mapping is active in central mapper table.',
        required_input_evidence: 'NPCI Mapper Response Code',
        expected_outcome: 'Mapping confirmed or mandate requirement recorded.',
        action_button_label: 'Record NPCI Result',
      },
      {
        title: 'Record bank desk findings',
        responsible_role: 'bank_branch',
        responsible_role_label: 'Bank Branch Officer',
        action_description: 'Record whether CBS mandate was executed or customer visit is needed.',
        required_input_evidence: 'Bank Desk Reference / Mandate No.',
        expected_outcome: 'Clear next step documented by bank.',
        action_button_label: 'Submit Bank Findings',
      },
      {
        title: 'Notify farmer if action is required',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'If bank reports mandate missing, explain branch visit steps in Malayalam.',
        required_input_evidence: 'Notification dispatch confirmation',
        expected_outcome: 'Farmer advised with exact branch instructions.',
        action_button_label: 'Prepare Notification',
      },
      {
        title: 'Recheck mapping after correction',
        responsible_role: 'bank_branch',
        responsible_role_label: 'Bank Branch Officer',
        action_description: 'Verify that Aadhaar seeding was uploaded in evening CBS batch.',
        required_input_evidence: 'CBS Batch Upload Ack',
        expected_outcome: 'Seeding confirmed in bank records.',
        action_button_label: 'Confirm Batch Upload',
      },
      {
        title: 'Revalidate payment readiness',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Re-run NPCI clearinghouse poll to confirm 200 OK before clearing payment.',
        required_input_evidence: 'Clearinghouse revalidation log',
        expected_outcome: 'Payment readiness confirmed.',
        action_button_label: 'Revalidate Case',
      },
    ],
  },

  // Issue C: Land Record or Seeding Mismatch (R02, R11)
  LAND_RECORD_MISMATCH: {
    issue_category: 'Land Record Mutation',
    problem_statement: 'Land survey record mismatch or pending mutation.',
    immediate_next_action: 'Verify survey sub-division in Village Revenue Portal (BHOOMI/ReLIS).',
    verification_status: 'Verification required',
    primary_role: 'village_office',
    primary_role_label: 'Village Revenue Officer',
    supporting_role: 'krishi_bhavan',
    supporting_role_label: 'Krishi Bhavan Agricultural Officer',
    escalation_recipient: 'Tahsildar & Sub-Collector Thrissur',
    farmer_notification_required: false,
    farmer_notification_reason: 'Inter-departmental verification in progress. Contact farmer only if title deed copy is missing.',
    farmer_required_action: 'Provide latest Land Tax receipt if Village Office requests physical verification.',
    steps: [
      {
        title: 'Identify specific record discrepancy',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Isolate exact field differing: Survey number, Thandapper number, or extent of land.',
        required_input_evidence: 'Discrepancy field tag (Survey/Extent)',
        expected_outcome: 'Specific query formulated for Revenue Office.',
        action_button_label: 'Isolate Discrepancy',
      },
      {
        title: 'Route task to Village Revenue Office',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Assign verification docket to jurisdictional Village Revenue Officer.',
        required_input_evidence: 'Village Office Docket Ref',
        expected_outcome: 'Task transferred to revenue desk.',
        action_button_label: 'Assign Village Office',
      },
      {
        title: 'Verify ReLIS land tax record',
        responsible_role: 'village_office',
        responsible_role_label: 'Village Revenue Officer',
        action_description: 'Cross-check against digital ReLIS mutation register and record tax payment status.',
        required_input_evidence: 'Thandapper / Mutation Volume Ref',
        expected_outcome: 'Official title ownership confirmed.',
        action_button_label: 'Record Revenue Verification',
      },
      {
        title: 'Trigger farmer notice if documents needed',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'If title partition requires farmer proof, notify farmer to furnish latest tax receipt.',
        required_input_evidence: 'Notice reference number',
        expected_outcome: 'Farmer informed with document checklist.',
        action_button_label: 'Prepare Notification',
      },
      {
        title: 'Verify updated record in portal',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Confirm updated land seeding status reflected in Krishi Bhavan repository.',
        required_input_evidence: 'State Agriculture Portal Sync Ref',
        expected_outcome: 'Land seeding marked verified.',
        action_button_label: 'Verify Updated Record',
      },
      {
        title: 'Revalidate scheme eligibility',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Run automated scheme validation to confirm eligibility threshold satisfied.',
        required_input_evidence: 'Land eligibility check score',
        expected_outcome: 'Case marked ready for release.',
        action_button_label: 'Revalidate Case',
      },
    ],
  },

  // Issue D: Name Mismatch (R05, R06)
  NAME_MISMATCH: {
    issue_category: 'Demographic Matching',
    problem_statement: 'Discrepancy between Aadhaar name and Bank/Portal record.',
    immediate_next_action: 'Determine source of discrepancy and assign to originating institution.',
    verification_status: 'Verification required',
    primary_role: 'bank_branch',
    primary_role_label: 'Bank Branch Officer / Akshaya',
    supporting_role: 'krishi_bhavan',
    supporting_role_label: 'Krishi Bhavan Agricultural Officer',
    escalation_recipient: 'District Nodal Officer (PM-KISAN Grievance Cell)',
    farmer_notification_required: true,
    farmer_notification_reason: 'Clarification required regarding initials vs expanded name format.',
    farmer_required_action: 'Submit name alignment declaration or passbook copy at designated desk.',
    steps: [
      {
        title: 'Identify differing records',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Compare Aadhaar card name string against Bank Core Banking string and PM-KISAN portal.',
        required_input_evidence: 'String comparison score (Levenshtein distance)',
        expected_outcome: 'Exact divergence (initial vs full name) documented.',
        action_button_label: 'Compare Name Strings',
      },
      {
        title: 'Determine owning institution',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Identify whether the discrepancy is in bank CBS (initial missing) or portal spelling.',
        required_input_evidence: 'Owning institution tag (Bank / UIDAI / Portal)',
        expected_outcome: 'Target correction desk determined.',
        action_button_label: 'Identify Source Record',
      },
      {
        title: 'Assign correction request',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Route correction task with demographic comparison docket to the responsible desk.',
        required_input_evidence: 'Assignment docket number',
        expected_outcome: 'Task queued at target desk.',
        action_button_label: 'Assign Correction Task',
      },
      {
        title: 'Notify farmer if declaration needed',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Contact farmer only if physical name clarification certificate is required.',
        required_input_evidence: 'Notification record & consent check',
        expected_outcome: 'Farmer notified without unwarranted bank visits.',
        action_button_label: 'Prepare Notification',
      },
      {
        title: 'Verify corrected record',
        responsible_role: 'bank_branch',
        responsible_role_label: 'Bank Branch Officer',
        action_description: 'Perform demographic match query through bank/portal verification gateway.',
        required_input_evidence: 'Demographic Match Result (Match Confidence >= 80%)',
        expected_outcome: 'Demographic compatibility verified.',
        action_button_label: 'Record Match Result',
      },
      {
        title: 'Revalidate case for payment',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Re-run PFMS demographic pre-validation check.',
        required_input_evidence: 'PFMS pre-validation token',
        expected_outcome: 'Pre-validation successful.',
        action_button_label: 'Revalidate Case',
      },
    ],
  },

  // Issue E: Payment Pending or Rejected (R12, R08, R09, R10)
  PAYMENT_PENDING_REJECTED: {
    issue_category: 'Payment Disbursal',
    problem_statement: 'Instalment payment rejected or response pending in PFMS.',
    immediate_next_action: 'Analyze PFMS rejection error code and route to treasury or bank desk.',
    verification_status: 'Confirmed issue',
    primary_role: 'krishi_bhavan',
    primary_role_label: 'Krishi Bhavan Agricultural Officer',
    supporting_role: 'bank_branch',
    supporting_role_label: 'Bank Branch Officer',
    escalation_recipient: 'State PM-KISAN Nodal Office & PFMS State Directorate',
    farmer_notification_required: true,
    farmer_notification_reason: 'Inform beneficiary of payment status and estimated resolution timeline.',
    farmer_required_action: 'Await bank re-processing; visit branch only if mandate re-execution is required.',
    steps: [
      {
        title: 'Check PFMS payment error code',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Inspect exact PFMS code (R01, R03, B01, etc.) and clearinghouse transaction timestamp.',
        required_input_evidence: 'PFMS Rejection Code & Description',
        expected_outcome: 'Root cause error isolated.',
        action_button_label: 'Inspect Error Code',
      },
      {
        title: 'Determine payment stage',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Verify whether payment is pending in transit, definitively rejected, or awaiting credit confirmation.',
        required_input_evidence: 'Clearing cycle status token',
        expected_outcome: 'Accurate state established without false alarms.',
        action_button_label: 'Confirm Payment Stage',
      },
      {
        title: 'Map error to responsible desk',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Assign task to lead bank for CBS mandate issues or state treasury for batch retries.',
        required_input_evidence: 'Routing rationale & docket reference',
        expected_outcome: 'Action docket assigned.',
        action_button_label: 'Assign Remediation Desk',
      },
      {
        title: 'Notify farmer of timeline',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Provide reassurance in Malayalam regarding delayed instalment and remediation steps.',
        required_input_evidence: 'Outbound notification token',
        expected_outcome: 'Beneficiary grievance addressed proactively.',
        action_button_label: 'Prepare Notification',
      },
      {
        title: 'Verify institution response',
        responsible_role: 'bank_branch',
        responsible_role_label: 'Bank Branch Officer',
        action_description: 'Check whether corrective action or mandate re-link was confirmed by the desk.',
        required_input_evidence: 'Institution acknowledgement reference',
        expected_outcome: 'Correction verified by responsible party.',
        action_button_label: 'Record Response',
      },
      {
        title: 'Poll clearinghouse for re-attempt',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Initiate supplementary revalidation batch for payment retry.',
        required_input_evidence: 'Revalidation batch ID',
        expected_outcome: 'Payment queued for next settlement cycle.',
        action_button_label: 'Poll Clearinghouse',
      },
      {
        title: 'Confirm independent credit status',
        responsible_role: 'krishi_bhavan',
        responsible_role_label: 'Krishi Bhavan Agricultural Officer',
        action_description: 'Verify actual credit advice in account ledger before closing docket.',
        required_input_evidence: 'Credit Reference / UTR Number',
        expected_outcome: 'Funds confirmed credited in beneficiary account.',
        action_button_label: 'Verify Credit & Resolve',
      },
    ],
  },
};

/**
 * Maps any case to its concrete workflow template and generates initial steps.
 */
export function getWorkflowTemplateForCase(ruleCode: string): WorkflowTemplate {
  if (ruleCode === 'R07') {
    return WORKFLOW_TEMPLATES.EKYC_PENDING;
  }
  if (ruleCode === 'R03' || ruleCode === 'R04' || ruleCode === 'R01') {
    return WORKFLOW_TEMPLATES.NPCI_MAPPING_UNCONFIRMED;
  }
  if (ruleCode === 'R02' || ruleCode === 'R11') {
    return WORKFLOW_TEMPLATES.LAND_RECORD_MISMATCH;
  }
  if (ruleCode === 'R05' || ruleCode === 'R06') {
    return WORKFLOW_TEMPLATES.NAME_MISMATCH;
  }
  return WORKFLOW_TEMPLATES.PAYMENT_PENDING_REJECTED;
}

export function buildWorkflowSteps(caseId: string, template: WorkflowTemplate): WorkflowStep[] {
  return template.steps.map((s, idx) => ({
    id: `step_${caseId}_${idx + 1}`,
    step_number: idx + 1,
    title: s.title,
    responsible_role: s.responsible_role,
    responsible_role_label: s.responsible_role_label,
    action_description: s.action_description,
    required_input_evidence: s.required_input_evidence,
    expected_outcome: s.expected_outcome,
    action_button_label: s.action_button_label,
    is_completed: false,
  }));
}

export function enrichCaseWithWorkflow(c: Partial<CaseRecord>): CaseRecord {
  const ruleCode = c.rule_code || 'R03';
  const tmpl = getWorkflowTemplateForCase(ruleCode);
  const steps = c.workflow_steps || buildWorkflowSteps(c.case_id || 'K104', tmpl);

  // Compute status according to redesigned lifecycle if legacy is present
  let status = c.status || 'Action Required';
  if (status === 'Issue identified') status = 'Action Required';
  if (status === 'Needs verification') status = 'Verification Required';
  if (status === 'Correction requested') status = 'Awaiting Department';
  if (status === 'Correction reported') status = 'Ready for Revalidation';
  if (status === 'Validation passed') status = 'Resolved';
  if (status === 'Credited') status = 'Payment Confirmed';

  return {
    case_id: c.case_id || 'K104',
    farmer_id: c.farmer_id || 'KL-TSR-0001',
    farmer_name_en: c.farmer_name_en || 'Ravi K',
    farmer_name_ml: c.farmer_name_ml || 'രവി കെ',
    aadhaar_masked: c.aadhaar_masked || 'XXXX-XXXX-7841',
    mobile_masked: c.mobile_masked || '+91 98460XXXXX',
    local_body: c.local_body || 'Irinjalakuda',
    krishi_bhavan: c.krishi_bhavan || 'Krishi Bhavan Irinjalakuda',
    bank_name: c.bank_name || 'State Bank of India',
    branch_name: c.branch_name || 'Irinjalakuda Main',
    ifsc: c.ifsc || 'SBIN0070123',
    account_masked: c.account_masked || 'XXXXXXXX9761',
    rule_code: ruleCode,
    issue_title: tmpl.issue_category,
    issue_description: c.issue_description || tmpl.problem_statement,
    problem_statement: tmpl.problem_statement,
    immediate_next_action: tmpl.immediate_next_action,
    severity: c.severity || 'Red',
    status: status as any,
    priority: c.priority || 5,
    priority_label: c.priority_label || 'Priority 5 — Urgent',
    detection_date: c.detection_date || '14 Oct 2026',
    verification_status: c.verification_status || tmpl.verification_status,
    owner_office_type: tmpl.primary_role,
    owner_office_name: c.owner_office_name || (tmpl.primary_role === 'bank_branch' ? 'SBI Irinjalakuda Branch' : 'Krishi Bhavan'),
    responsible_role_label: tmpl.primary_role_label,
    supporting_role_label: tmpl.supporting_role_label,
    assigned_officer: c.assigned_officer || 'Suresh Menon (Scale II, SBI)',
    current_task_owner: tmpl.primary_role_label,
    escalation_recipient: tmpl.escalation_recipient,
    waiting_for: tmpl.primary_role === 'bank_branch' ? 'Bank' : tmpl.primary_role === 'akshaya' ? 'Akshaya' : tmpl.primary_role === 'village_office' ? 'Village Office' : 'Department',
    days_open: c.days_open || 3,
    deadline_date: c.deadline_date || '2026-10-23',
    is_overdue: (c.days_open || 3) > 7,
    workflow_steps: steps,
    farmer_notification_required: tmpl.farmer_notification_required,
    farmer_notification_reason: tmpl.farmer_notification_reason,
    farmer_required_action: tmpl.farmer_required_action,
    last_contact_attempt: c.last_contact_attempt || '15 Oct 2026, 11:24 IST',
    next_permitted_followup: '17 Oct 2026',
    notification_delivery_status: 'Delivered',
    call_status: c.call_status || 'Answered',
    call_attempts: c.call_attempts || 1,
    consent_call: c.consent_call !== undefined ? c.consent_call : true,
    field_visit_needed: false,
    evidence_text: c.evidence_text || 'NPCI Mapper status: NOT_MAPPED',
    farmer_action_text: tmpl.farmer_required_action || '',
    where_to_go: c.where_to_go || 'SBI Irinjalakuda Branch',
    documents_required: c.documents_required || ['Aadhaar Card', 'Bank Passbook'],
    proof_to_close: c.proof_to_close || 'Stamped Annexure-I Counterfoil',
    next_step_text: tmpl.immediate_next_action,
    proof_attachment: c.proof_attachment,
    what_if_active: c.what_if_active,
  };
}
