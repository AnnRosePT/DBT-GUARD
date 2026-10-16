export type Role =
  | 'krishi_bhavan'
  | 'bank_branch'
  | 'akshaya'
  | 'village_office'
  | 'district_nodal'
  | 'farmer';

export interface UserPersona {
  id: string;
  name: string;
  designation: string;
  role: Role;
  office: string;
  jurisdiction: string;
  avatarIcon: string;
  badge: string;
  institution?: string;
  farmerId?: string;
  caseId?: string;
}

export interface RegisteredUser {
  id: string;
  username: string; // PEN / employee ID / username
  passwordHash: string;
  role: Role;
  name: string;
  designation: string;
  office: string;
  jurisdiction: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  createdAt: string;
  badge: string;
  avatarIcon: string;
  farmerId?: string;
  caseId?: string;
}

export interface AuthSession {
  token: string;
  user: UserPersona;
  issuedAt: number;
  expiresAt: number;
}

export interface Farmer {
  farmer_id: string;
  name_en: string;
  name_ml: string;
  aadhaar_token: string; // e.g. "7841"
  aadhaar_masked: string; // "XXXX-XXXX-7841"
  mobile_masked: string; // "+91 98460XXXXX"
  mobile_raw: string;
  local_body: string; // 8 Thrissur local bodies
  ward: string;
  krishi_bhavan: string;
  category: string; // Small Holder, Marginal, etc.
  land_seeding_status: 'Seeded' | 'Pending' | 'Mismatch';
  ekyc_status: 'Completed' | 'Pending' | 'Failed';
  consent_call: 'Y' | 'N';
  issue_injected?: string; // Hidden QA only

  // Optional convenience fields for legacy page interop
  status?: string;
  stage?: string;
  bank_name?: string;
  account_no_masked?: string;
  account_masked?: string;
  bank_ifsc?: string;
  local_body_name?: string;
  phone?: string;
  call_status?: string;
}

export interface BankAccount {
  farmer_id: string;
  bank_name: string;
  branch_name: string;
  ifsc: string;
  account_number_masked: string; // "XXXXXXXX9761"
  account_status: 'Active' | 'Closed' | 'Dormant' | 'Frozen';
  kyc_status: 'Valid' | 'Pending' | 'Expired';
}

export interface NpciMapperRecord {
  aadhaar_token: string;
  bank_name: string;
  mapped_status: 'Mapped' | 'Not mapped' | 'De-seeded' | 'Inactive' | '';
  last_updated_date: string; // YYYY-MM-DD
}

export interface PfmsValidationRecord {
  farmer_id: string;
  validation_status: 'Passed' | 'Rejected' | 'Pending';
  error_code: string;
  error_description: string;
  validation_date: string;
}

export interface PaymentInstalment {
  farmer_id: string;
  instalment_no: 21 | 22 | 23;
  instalment_date: string;
  amount: number;
  status: 'Credited' | 'Cleared' | 'Disbursed' | 'Payment Failed' | 'PFMS Response Pending';
  transaction_id: string;
  remarks: string;
}

export type CaseStatus =
  // Redesigned Lifecycle (Section 7)
  | 'New'
  | 'Verification Required'
  | 'Action Required'
  | 'Awaiting Farmer'
  | 'Awaiting Department'
  | 'Correction in Progress'
  | 'Ready for Revalidation'
  | 'Resolved'
  | 'Payment Confirmed'
  | 'Escalated'
  // Legacy / Diagnostic mappings for compatibility
  | 'Issue identified'
  | 'Needs verification'
  | 'Ready'
  | 'Payment pending'
  | 'Correction requested'
  | 'Correction reported'
  | 'Awaiting verification'
  | 'Validation passed'
  | 'Retry pending'
  | 'Credited';

export type CallStatus =
  | 'Answered'
  | 'Replayed'
  | 'Help requested'
  | 'Not reached'
  | 'Opted out'
  | 'Scheduled'
  | 'Pending Call';

export interface WorkflowStep {
  id: string;
  step_number: number;
  title: string;
  responsible_role: Role | 'farmer';
  responsible_role_label: string;
  action_description: string;
  required_input_evidence?: string;
  expected_outcome: string;
  action_button_label: string;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  evidence_reference?: string;
}

export interface CaseRecord {
  case_id: string; // e.g. "K104"
  farmer_id: string; // e.g. "KL-TSR-0001"
  farmer_name_en: string;
  farmer_name_ml: string;
  aadhaar_masked: string;
  mobile_masked: string;
  local_body: string;
  krishi_bhavan: string;
  bank_name: string;
  branch_name: string;
  ifsc: string;
  account_masked: string;
  
  // Rule diagnostics & Action Card metadata
  rule_code: string; // R01–R12
  issue_title: string;
  issue_description: string;
  problem_statement?: string; // Plain-language statement (Section 1)
  immediate_next_action?: string; // Concise one-liner for owner
  severity: 'Red' | 'Amber' | 'Grey' | 'Green';
  status: CaseStatus;
  priority: number; // calculated 1 to 6
  priority_label: string; // "Priority 5 — Urgent"
  detection_date?: string; // e.g. "14 Oct 2026"
  verification_status?: 'Confirmed issue' | 'Suspected issue' | 'Verification required' | 'Resolved issue';
  
  // Ownership, SLA & Assignment (Section 2B)
  owner_office_type: Role;
  owner_office_name: string;
  responsible_role_label?: string;
  supporting_role_label?: string;
  assigned_officer?: string;
  current_task_owner?: string;
  escalation_recipient?: string;
  waiting_for: 'Bank' | 'Akshaya' | 'Village Office' | 'Farmer' | 'Department' | 'System';
  days_open: number;
  deadline_date: string;
  is_overdue?: boolean;
  
  // Structured Step-by-Step Resolution (Section 2C & Section 3)
  workflow_steps?: WorkflowStep[];
  
  // Prominent Farmer Notification (Section 4)
  farmer_notification_required?: boolean;
  farmer_notification_reason?: string;
  farmer_required_action?: string;
  last_contact_attempt?: string;
  next_permitted_followup?: string;
  notification_delivery_status?: 'Delivered' | 'Pending' | 'Failed' | 'Simulated' | 'Not Sent';

  // Voice Assist & Telephony
  call_status: CallStatus;
  call_attempts: number;
  consent_call: boolean;
  field_visit_needed: boolean;
  call_notes?: string;
  last_call_timestamp?: string;
  
  // Action cards & Resolution Evidence
  evidence_text: string;
  farmer_action_text: string;
  where_to_go: string;
  documents_required: string[];
  proof_to_close: string;
  next_step_text: string;
  
  // Audit & Proof
  proof_attachment?: {
    proof_type: string;
    reference_no: string;
    file_name: string;
    officer_note: string;
    submitted_at: string;
    officer_name: string;
  };
  
  what_if_active?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_name: string;
  role: string;
  case_id: string;
  action: string;
  old_state: string;
  new_state: string;
  reason: string;
  farmer_id?: string;
  officer_name?: string;
  details?: string;
}

export interface RuleDefinition {
  rule_id: string;
  name: string;
  condition_description: string;
  severity: 'Red' | 'Amber' | 'Grey' | 'Green';
  target_owner: Role;
  default_status: CaseStatus;
}
