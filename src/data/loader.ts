import Papa from 'papaparse';
import type {
  Farmer,
  BankAccount,
  NpciMapperRecord,
  PfmsValidationRecord,
  PaymentInstalment,
  CaseRecord,
} from '../types';
import { generateAllData } from './mockGenerator';
import { evaluateRules } from '../lib/rules';

export interface JoinedFarmerRecord {
  farmer: Farmer;
  account: BankAccount;
  npci: NpciMapperRecord;
  pfms: PfmsValidationRecord;
  payments: PaymentInstalment[];
  caseRecord: CaseRecord;
}

export interface LoadedDataset {
  farmers: Farmer[];
  bankAccounts: BankAccount[];
  npciMapper: NpciMapperRecord[];
  pfmsValidation: PfmsValidationRecord[];
  paymentStatus: PaymentInstalment[];
  joinedRecords: JoinedFarmerRecord[];
  cases: CaseRecord[];
}

export function buildCasesFromData(
  farmers: Farmer[],
  bankAccounts: BankAccount[],
  npciMapper: NpciMapperRecord[],
  pfmsValidation: PfmsValidationRecord[],
  paymentStatus: PaymentInstalment[]
): { joinedRecords: JoinedFarmerRecord[]; cases: CaseRecord[] } {
  // Map lookups for fast joining
  const accountMap = new Map<string, BankAccount>();
  bankAccounts.forEach((acc) => accountMap.set(acc.farmer_id, acc));

  const npciMap = new Map<string, NpciMapperRecord>();
  npciMapper.forEach((np) => npciMap.set(np.aadhaar_token, np));

  const pfmsMap = new Map<string, PfmsValidationRecord>();
  pfmsValidation.forEach((pf) => pfmsMap.set(pf.farmer_id, pf));

  const paymentMap = new Map<string, PaymentInstalment[]>();
  paymentStatus.forEach((pay) => {
    const list = paymentMap.get(pay.farmer_id) || [];
    list.push(pay);
    paymentMap.set(pay.farmer_id, list);
  });

  const joinedRecords: JoinedFarmerRecord[] = [];
  const cases: CaseRecord[] = [];

  farmers.forEach((farmer, index) => {
    const account = accountMap.get(farmer.farmer_id) || {
      farmer_id: farmer.farmer_id,
      bank_name: 'State Bank of India',
      branch_name: 'SBI Irinjalakuda Main',
      ifsc: 'SBIN0008618',
      account_number_masked: 'XXXXXXXX9761',
      account_status: 'Active',
      kyc_status: 'Valid',
    };

    const npci = npciMap.get(farmer.aadhaar_token) || {
      aadhaar_token: farmer.aadhaar_token,
      bank_name: account.bank_name,
      mapped_status: 'Mapped',
      last_updated_date: '2026-09-25',
    };

    const pfms = pfmsMap.get(farmer.farmer_id) || {
      farmer_id: farmer.farmer_id,
      validation_status: 'Passed',
      error_code: 'OK',
      error_description: 'PFMS Account Validation Passed',
      validation_date: '2026-10-14',
    };

    const payments = paymentMap.get(farmer.farmer_id) || [];

    // Realistic days open and call status
    // Case K104 is farmer #0 (Ravi K)
    const isRaviK = index === 0;
    const caseId = isRaviK ? 'K104' : `K${String(100 + index)}`;
    const daysOpen = isRaviK ? 3 : (index % 12) + 1;
    const callStatus = isRaviK
      ? 'Answered'
      : index % 7 === 0
      ? 'Not reached'
      : index % 9 === 0
      ? 'Help requested'
      : index % 11 === 0
      ? 'Replayed'
      : 'Answered';

    const ruleEval = evaluateRules(
      farmer,
      account,
      npci,
      pfms,
      payments,
      daysOpen,
      callStatus
    );

    const deadlineDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const caseRecord: CaseRecord = {
      case_id: caseId,
      farmer_id: farmer.farmer_id,
      farmer_name_en: farmer.name_en,
      farmer_name_ml: farmer.name_ml,
      aadhaar_masked: farmer.aadhaar_masked,
      mobile_masked: farmer.mobile_masked,
      local_body: farmer.local_body,
      krishi_bhavan: farmer.krishi_bhavan,
      bank_name: account.bank_name,
      branch_name: account.branch_name,
      ifsc: account.ifsc,
      account_masked: account.account_number_masked,
      rule_code: ruleEval.rule_code,
      issue_title: ruleEval.issue_title,
      issue_description: ruleEval.issue_description,
      severity: ruleEval.severity,
      status: ruleEval.status,
      priority: ruleEval.priority,
      priority_label: ruleEval.priority_label,
      owner_office_type: ruleEval.owner_office_type,
      owner_office_name: ruleEval.owner_office_name,
      assigned_officer: 'Suresh Menon (Scale II, SBI)',
      waiting_for: ruleEval.waiting_for,
      days_open: daysOpen,
      deadline_date: deadlineDate,
      call_status: callStatus,
      call_attempts: isRaviK ? 1 : (index % 2) + 1,
      consent_call: farmer.consent_call === 'Y',
      field_visit_needed: callStatus === 'Not reached',
      evidence_text: ruleEval.evidence_text,
      problem_statement: ruleEval.issue_description,
      immediate_next_action: ruleEval.next_step_text || ruleEval.farmer_action_text,
      detection_date: '14 Oct 2026',
      verification_status: ruleEval.status === 'Needs verification' ? 'Verification required' : 'Confirmed issue',
      responsible_role_label: ruleEval.owner_office_type === 'bank_branch' ? 'Bank Branch Nodal Officer' :
                              ruleEval.owner_office_type === 'akshaya' ? 'Akshaya Center Executive' :
                              ruleEval.owner_office_type === 'village_office' ? 'Village Revenue Officer' :
                              'Agricultural Extension Officer',
      current_task_owner: ruleEval.owner_office_name,
      escalation_recipient: 'District Agricultural Officer, Thrissur',
      farmer_notification_required: ruleEval.severity === 'Red' || ruleEval.severity === 'Amber',
      farmer_required_action: ruleEval.farmer_action_text,
      farmer_action_text: ruleEval.farmer_action_text,
      where_to_go: ruleEval.where_to_go,
      documents_required: ruleEval.documents_required,
      proof_to_close: ruleEval.proof_to_close,
      next_step_text: ruleEval.next_step_text,
    };

    // Enrich farmer object with joined fields for easy querying
    (farmer as any).status = caseRecord.status;
    (farmer as any).call_status = caseRecord.call_status;
    (farmer as any).local_body_name = farmer.local_body;
    (farmer as any).phone = farmer.mobile_masked;
    (farmer as any).bank_name = account.bank_name;
    (farmer as any).bank_ifsc = account.ifsc;
    (farmer as any).stage = caseRecord.status === 'Ready' ? 'VALIDATION_PASSED' : 'TRIAGE_ASSIGNED';

    joinedRecords.push({
      farmer,
      account,
      npci,
      pfms,
      payments,
      caseRecord,
    });

    cases.push(caseRecord);
  });

  return { joinedRecords, cases };
}

export async function loadInitialDataset(): Promise<LoadedDataset> {
  try {
    // Attempt to fetch from /data/mock/*.csv via PapaParse
    const [farmersRes, accountsRes, npciRes, pfmsRes, payRes] = await Promise.all([
      fetch('/data/mock/farmers.csv').then((r) => r.text()),
      fetch('/data/mock/bank_accounts.csv').then((r) => r.text()),
      fetch('/data/mock/npci_mapper.csv').then((r) => r.text()),
      fetch('/data/mock/pfms_validation.csv').then((r) => r.text()),
      fetch('/data/mock/payment_status.csv').then((r) => r.text()),
    ]);

    const farmers = Papa.parse<Farmer>(farmersRes, { header: true }).data.filter(
      (f) => Boolean(f.farmer_id)
    );
    const bankAccounts = Papa.parse<BankAccount>(accountsRes, { header: true }).data.filter(
      (a) => Boolean(a.farmer_id)
    );
    const npciMapper = Papa.parse<NpciMapperRecord>(npciRes, { header: true }).data.filter(
      (n) => Boolean(n.aadhaar_token)
    );
    const pfmsValidation = Papa.parse<PfmsValidationRecord>(pfmsRes, { header: true }).data.filter(
      (p) => Boolean(p.farmer_id)
    );
    const paymentStatus = Papa.parse<PaymentInstalment>(payRes, {
      header: true,
      dynamicTyping: true,
    }).data.filter((p) => Boolean(p.farmer_id));

    if (farmers.length > 0) {
      const { joinedRecords, cases } = buildCasesFromData(
        farmers,
        bankAccounts,
        npciMapper,
        pfmsValidation,
        paymentStatus
      );

      return {
        farmers,
        bankAccounts,
        npciMapper,
        pfmsValidation,
        paymentStatus,
        joinedRecords,
        cases,
      };
    }
  } catch (err) {
    console.warn('CSV fetch error, using synthetic in-memory dataset:', err);
  }

  // Resilient fallback to generator
  const generated = generateAllData();
  const { joinedRecords, cases } = buildCasesFromData(
    generated.farmers,
    generated.bankAccounts,
    generated.npciMapper,
    generated.pfmsValidation,
    generated.paymentStatus
  );

  return {
    farmers: generated.farmers,
    bankAccounts: generated.bankAccounts,
    npciMapper: generated.npciMapper,
    pfmsValidation: generated.pfmsValidation,
    paymentStatus: generated.paymentStatus,
    joinedRecords,
    cases,
  };
}
