import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Farmer,
  BankAccount,
  NpciMapperRecord,
  PfmsValidationRecord,
  PaymentInstalment,
  CaseRecord,
  AuditLogEntry,
  CaseStatus,
  CallStatus,
  Role,
} from '../types';
import { loadInitialDataset, buildCasesFromData } from '../data/loader';
import { generateAllData } from '../data/mockGenerator';
import { enrichCaseWithWorkflow } from '../lib/workflows';

// Build initial synchronous dataset so application never renders blank on startup
const defaultData = generateAllData();
const defaultBuild = buildCasesFromData(
  defaultData.farmers,
  defaultData.bankAccounts,
  defaultData.npciMapper,
  defaultData.pfmsValidation,
  defaultData.paymentStatus
);

const enrichedDefaultCases = defaultBuild.cases.map((c) => enrichCaseWithWorkflow(c));

function buildDiagnosticsMap(cases: CaseRecord[]): Record<string, any> {
  const map: Record<string, any> = {};
  cases.forEach((c) => {
    const diag = {
      ...c,
      rule_id: c.rule_code,
      rule_code: c.rule_code,
      title_en: c.issue_title,
      action_en: c.farmer_action_text || c.immediate_next_action,
      action_ml: c.evidence_text,
      action_agency:
        c.owner_office_type === 'bank_branch'
          ? 'LEAD_BANK'
          : c.owner_office_type === 'akshaya'
          ? 'AKSHAYA'
          : c.owner_office_type === 'village_office'
          ? 'VILLAGE_OFFICE'
          : 'KRISHI_BHAVAN',
      priority_score: c.priority,
      status: c.status,
      days_open: c.days_open,
      deadline: c.deadline_date,
      diagnostic_summary: c.problem_statement || c.issue_description,
    };
    map[c.farmer_id] = diag;
    map[c.case_id] = diag;
  });
  return map;
}

const initialDiagnostics = buildDiagnosticsMap(enrichedDefaultCases);

const defaultInitialAudit: AuditLogEntry[] = [
  {
    id: 'log_init_01',
    timestamp: '14 Oct 2026, 09:42 IST',
    user_name: 'System (PFMS Daemon)',
    role: 'System',
    case_id: 'K104',
    action: 'Automated Ingestion',
    old_state: 'New',
    new_state: 'Action Required',
    reason: 'PFMS rejection code R01 flagged by daily ingest batch PFMS-KL-TSR-2026-B892',
  },
  {
    id: 'log_init_02',
    timestamp: '14 Oct 2026, 10:15 IST',
    user_name: 'System Triage Engine',
    role: 'System',
    case_id: 'K104',
    action: 'Automated Triage Routing',
    old_state: 'Action Required',
    new_state: 'Action Required',
    reason: 'Case #K104 auto-routed to SBI Irinjalakuda desk; Priority set to Priority 5 (Urgent)',
  },
  {
    id: 'log_init_03',
    timestamp: '15 Oct 2026, 11:24 IST',
    user_name: 'Malayalam IVR Gateway',
    role: 'Voice Assist',
    case_id: 'K104',
    action: 'Malayalam IVR Call Outreach',
    old_state: 'Pending Call',
    new_state: 'Answered',
    reason: 'Automated call to +91 98460XXXXX completed (1m 18s). Farmer acknowledged consent requirement.',
  },
];

interface AppState {
  farmers: Farmer[];
  bankAccounts: BankAccount[];
  npciMapper: NpciMapperRecord[];
  pfmsValidation: PfmsValidationRecord[];
  paymentStatus: PaymentInstalment[];
  cases: CaseRecord[];
  diagnostics: Record<string, any>;
  auditLogs: AuditLogEntry[];
  auditLog: AuditLogEntry[];
  isLoaded: boolean;

  // Actions
  loadDemoData: () => Promise<void>;
  resetDemo: () => void;
  getCaseById: (caseId: string) => CaseRecord | undefined;
  getFarmerById: (farmerId: string) => Farmer | undefined;
  getAccountByFarmerId: (farmerId: string) => BankAccount | undefined;
  getPaymentsByFarmerId: (farmerId: string) => PaymentInstalment[];
  
  updateCaseStatus: (
    caseId: string,
    newStatus: CaseStatus,
    action: string,
    reason: string,
    userName?: string,
    role?: string
  ) => void;

  completeWorkflowStep: (
    caseId: string,
    stepId: string,
    note?: string,
    evidenceRef?: string,
    userName?: string,
    userRole?: string
  ) => void;

  reassignCase: (
    caseId: string,
    role: Role,
    officeName: string,
    officerName: string,
    instructions: string,
    userName?: string,
    userRole?: string
  ) => void;

  escalateCase: (
    caseId: string,
    authority: string,
    reason: string,
    userName?: string,
    userRole?: string
  ) => void;

  resolveCase: (
    caseId: string,
    resolutionType: 'Resolved' | 'Payment Confirmed',
    referenceNo: string,
    notes: string,
    userName?: string,
    userRole?: string
  ) => void;

  approveAndAssignCase: (
    caseId: string,
    targetOfficeName: string,
    targetOfficer: string,
    userName?: string,
    userRole?: string
  ) => void;

  submitTaskProof: (
    caseId: string,
    proof: {
      proof_type: string;
      reference_no: string;
      file_name: string;
      officer_note: string;
      officer_name: string;
    },
    userName?: string,
    userRole?: string
  ) => void;

  logCallOutcome: (
    caseId: string,
    outcome: CallStatus,
    notes?: string,
    userName?: string,
    userRole?: string
  ) => void;

  toggleWhatIf: (caseId: string) => void;

  simulateFreshResults: (userName?: string, userRole?: string) => {
    revalidatedCount: number;
    creditedCount: number;
  };

  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Convenience Aliases for Legacy Pages
  approveAndAssign: (farmerIdOrCaseId: string, targetOfficeName?: string, targetOfficer?: string) => void;
  askEvidence: (farmerIdOrCaseId: string) => void;
  dismissCase: (farmerIdOrCaseId: string, reason?: string) => void;
  whatIfSimulate: (farmerIdOrCaseId: string) => void;
  updateFarmerCallStatus: (farmerId: string, status: any, note?: string) => void;
  assignCase: (farmerId: string, agency: string, officer: string) => void;
  uploadProof: (farmerId: string, proofDataOrFileName: any, refId?: string, officerName?: string) => void;
  logAudit: (farmerIdOrCaseIdOrObj: any, action?: string, detail?: string) => void;
  revalidateBatch: () => { revalidatedCount: number; creditedCount: number };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      farmers: defaultData.farmers,
      bankAccounts: defaultData.bankAccounts,
      npciMapper: defaultData.npciMapper,
      pfmsValidation: defaultData.pfmsValidation,
      paymentStatus: defaultData.paymentStatus,
      cases: enrichedDefaultCases,
      diagnostics: initialDiagnostics,
      auditLogs: defaultInitialAudit,
      auditLog: defaultInitialAudit,
      isLoaded: true,

      loadDemoData: async () => {
        const dataset = await loadInitialDataset();
        const enriched = dataset.cases.map((c) => enrichCaseWithWorkflow(c));
        const diags = buildDiagnosticsMap(enriched);
        set({
          farmers: dataset.farmers,
          bankAccounts: dataset.bankAccounts,
          npciMapper: dataset.npciMapper,
          pfmsValidation: dataset.pfmsValidation,
          paymentStatus: dataset.paymentStatus,
          cases: enriched,
          diagnostics: diags,
          isLoaded: true,
        });
      },

      resetDemo: () => {
        const generated = generateAllData();
        const { cases } = buildCasesFromData(
          generated.farmers,
          generated.bankAccounts,
          generated.npciMapper,
          generated.pfmsValidation,
          generated.paymentStatus
        );
        const enriched = cases.map((c) => enrichCaseWithWorkflow(c));
        const diags = buildDiagnosticsMap(enriched);

        set({
          farmers: generated.farmers,
          bankAccounts: generated.bankAccounts,
          npciMapper: generated.npciMapper,
          pfmsValidation: generated.pfmsValidation,
          paymentStatus: generated.paymentStatus,
          cases: enriched,
          diagnostics: diags,
          auditLogs: defaultInitialAudit,
          auditLog: defaultInitialAudit,
          isLoaded: true,
        });
      },

      getCaseById: (caseId: string) => {
        return get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
      },

      getFarmerById: (farmerId: string) => {
        return get().farmers.find((f) => f.farmer_id === farmerId);
      },

      getAccountByFarmerId: (farmerId: string) => {
        return get().bankAccounts.find((a) => a.farmer_id === farmerId);
      },

      getPaymentsByFarmerId: (farmerId: string) => {
        return get().paymentStatus.filter((p) => p.farmer_id === farmerId);
      },

      updateCaseStatus: (
        caseId: string,
        newStatus: CaseStatus,
        action: string,
        reason: string,
        userName = 'Officer Anitha R',
        role = 'Krishi Bhavan Official'
      ) => {
        const targetCase = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        if (!targetCase) return;

        const resolvedCaseId = targetCase.case_id;
        const oldStatus = targetCase.status;
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        const updatedCases = get().cases.map((c) =>
          c.case_id === resolvedCaseId ? { ...c, status: newStatus } : c
        );
        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const newLog: AuditLogEntry = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: nowStr,
          user_name: userName,
          role,
          case_id: resolvedCaseId,
          action,
          old_state: oldStatus,
          new_state: newStatus,
          reason,
        };

        const updatedAudit = [newLog, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      completeWorkflowStep: (
        caseId: string,
        stepId: string,
        note = '',
        evidenceRef = '',
        userName = 'Anitha R',
        userRole = 'Krishi Bhavan Official'
      ) => {
        const targetCase = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        if (!targetCase) return;

        const resolvedCaseId = targetCase.case_id;
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        let completedStepTitle = '';
        let stepNumber = 1;

        const updatedCases = get().cases.map((c) => {
          if (c.case_id !== resolvedCaseId) return c;

          const updatedSteps = (c.workflow_steps || []).map((s) => {
            if (s.id === stepId || `step_${c.case_id}_${s.step_number}` === stepId) {
              completedStepTitle = s.title;
              stepNumber = s.step_number;
              return {
                ...s,
                is_completed: true,
                completed_at: nowStr,
                completed_by: userName,
                notes: note || s.notes,
                evidence_reference: evidenceRef || s.evidence_reference,
              };
            }
            return s;
          });

          // Check if intermediate or all steps are done
          const allCompleted = updatedSteps.every((s) => s.is_completed);
          let newStatus = c.status;
          if (allCompleted) {
            newStatus = 'Resolved';
          } else if (stepNumber >= 3 && (c.status === 'Action Required' || c.status === 'New')) {
            newStatus = 'Correction in Progress';
          }

          return {
            ...c,
            status: newStatus,
            workflow_steps: updatedSteps,
          };
        });

        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const newLog: AuditLogEntry = {
          id: `log_step_${Date.now()}`,
          timestamp: nowStr,
          user_name: userName,
          role: userRole,
          case_id: resolvedCaseId,
          action: `Step Completed: ${completedStepTitle || `Step #${stepNumber}`}`,
          old_state: targetCase.status,
          new_state: targetCase.status,
          reason: note ? `${note} (Ref: ${evidenceRef || 'Verified'})` : `Step #${stepNumber} action executed and verified by ${userName}.`,
        };

        const updatedAudit = [newLog, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      reassignCase: (
        caseId: string,
        role: Role,
        officeName: string,
        officerName: string,
        instructions: string,
        userName = 'Anitha R',
        userRole = 'Krishi Bhavan Official'
      ) => {
        const targetCase = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        if (!targetCase) return;

        const resolvedCaseId = targetCase.case_id;
        const oldStatus = targetCase.status;
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        const updatedCases = get().cases.map((c) =>
          c.case_id === resolvedCaseId
            ? {
                ...c,
                owner_office_type: role,
                owner_office_name: officeName,
                assigned_officer: officerName,
                status: 'Awaiting Department' as CaseStatus,
                deadline_date: deadline,
                waiting_for: (role === 'bank_branch' ? 'Bank' : role === 'akshaya' ? 'Akshaya' : role === 'village_office' ? 'Village Office' : 'Department') as 'Bank' | 'Akshaya' | 'Village Office' | 'Department',
              }
            : c
        );

        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const newLog: AuditLogEntry = {
          id: `log_assign_${Date.now()}`,
          timestamp: nowStr,
          user_name: userName,
          role: userRole,
          case_id: resolvedCaseId,
          action: `Reassigned Docket to ${officeName}`,
          old_state: oldStatus,
          new_state: 'Awaiting Department',
          reason: `Assigned to ${officerName}. Instructions: ${instructions}`,
        };

        const updatedAudit = [newLog, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      escalateCase: (
        caseId: string,
        authority: string,
        reason: string,
        userName = 'Anitha R',
        userRole = 'Krishi Bhavan Official'
      ) => {
        const targetCase = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        if (!targetCase) return;

        const resolvedCaseId = targetCase.case_id;
        const oldStatus = targetCase.status;
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        const updatedCases = get().cases.map((c) =>
          c.case_id === resolvedCaseId
            ? {
                ...c,
                status: 'Escalated' as CaseStatus,
                escalation_recipient: authority,
              }
            : c
        );

        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const newLog: AuditLogEntry = {
          id: `log_esc_${Date.now()}`,
          timestamp: nowStr,
          user_name: userName,
          role: userRole,
          case_id: resolvedCaseId,
          action: `Escalated to ${authority}`,
          old_state: oldStatus,
          new_state: 'Escalated',
          reason,
        };

        const updatedAudit = [newLog, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      resolveCase: (
        caseId: string,
        resolutionType: 'Resolved' | 'Payment Confirmed',
        referenceNo: string,
        notes: string,
        userName = 'Anitha R',
        userRole = 'Krishi Bhavan Official'
      ) => {
        const targetCase = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        if (!targetCase) return;

        const resolvedCaseId = targetCase.case_id;
        const oldStatus = targetCase.status;
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        const updatedCases = get().cases.map((c) => {
          if (c.case_id !== resolvedCaseId) return c;
          const completedSteps = (c.workflow_steps || []).map((s) => ({
            ...s,
            is_completed: true,
            completed_at: s.completed_at || nowStr,
            completed_by: s.completed_by || userName,
          }));

          return {
            ...c,
            status: resolutionType as CaseStatus,
            verification_status: 'Resolved issue' as const,
            severity: 'Green' as const,
            proof_to_close: referenceNo,
            workflow_steps: completedSteps,
          };
        });

        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const newLog: AuditLogEntry = {
          id: `log_res_${Date.now()}`,
          timestamp: nowStr,
          user_name: userName,
          role: userRole,
          case_id: resolvedCaseId,
          action: `Case Resolved (${resolutionType})`,
          old_state: oldStatus,
          new_state: resolutionType,
          reason: `Official Reference: ${referenceNo}. ${notes}`,
        };

        const updatedAudit = [newLog, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      approveAndAssignCase: (
        caseId: string,
        targetOfficeName: string,
        targetOfficer: string,
        userName = 'Anitha R',
        userRole = 'Krishi Bhavan Official'
      ) => {
        get().reassignCase(
          caseId,
          'bank_branch',
          targetOfficeName,
          targetOfficer,
          'Approved & assigned to lead bank liaison desk.',
          userName,
          userRole
        );
      },

      submitTaskProof: (
        caseId: string,
        proof: {
          proof_type: string;
          reference_no: string;
          file_name: string;
          officer_note: string;
          officer_name: string;
        },
        userName = 'Suresh Menon',
        userRole = 'Bank Branch Desk'
      ) => {
        const targetCase = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        if (!targetCase) return;

        const resolvedCaseId = targetCase.case_id;
        const oldStatus = targetCase.status;
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        const proofObj = {
          ...proof,
          submitted_at: nowStr,
        };

        const updatedCases = get().cases.map((c) =>
          c.case_id === resolvedCaseId
            ? {
                ...c,
                status: 'Ready for Revalidation' as CaseStatus,
                waiting_for: 'Department' as const,
                proof_attachment: proofObj,
              }
            : c
        );
        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const newLog: AuditLogEntry = {
          id: `log_${Date.now()}`,
          timestamp: nowStr,
          user_name: userName,
          role: userRole,
          case_id: resolvedCaseId,
          action: 'Proof Uploaded & Marked Ready for Revalidation',
          old_state: oldStatus,
          new_state: 'Ready for Revalidation',
          reason: `Annexure-I proof ref ${proof.reference_no} uploaded by ${proof.officer_name}. Bank CBS re-mapping executed.`,
        };

        const updatedAudit = [newLog, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      logCallOutcome: (
        caseId: string,
        outcome: CallStatus,
        notes = '',
        userName = 'Anitha R',
        userRole = 'Krishi Bhavan Official'
      ) => {
        const targetCase = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        if (!targetCase) return;

        const resolvedCaseId = targetCase.case_id;
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        const nextAttempts = targetCase.call_attempts + 1;
        const fieldVisitNeeded =
          nextAttempts >= 2 && (outcome === 'Not reached' || outcome === 'Help requested');

        const updatedCases = get().cases.map((c) =>
          c.case_id === resolvedCaseId
            ? {
                ...c,
                call_status: outcome,
                call_attempts: nextAttempts,
                call_notes: notes,
                last_call_timestamp: nowStr,
                field_visit_needed: fieldVisitNeeded,
              }
            : c
        );
        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const newLog: AuditLogEntry = {
          id: `log_${Date.now()}`,
          timestamp: nowStr,
          user_name: userName,
          role: userRole,
          case_id: resolvedCaseId,
          action: `Voice Assist Outreach: ${outcome}`,
          old_state: targetCase.call_status,
          new_state: outcome,
          reason: notes || `Farmer contacted via IVR. Call outcome marked as ${outcome}.`,
        };

        const updatedAudit = [newLog, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      toggleWhatIf: (caseId: string) => {
        const resolved = get().cases.find((c) => c.case_id === caseId || c.farmer_id === caseId);
        const cid = resolved?.case_id || caseId;

        const updatedCases = get().cases.map((c) => {
          if (c.case_id !== cid) return c;
          return {
            ...c,
            what_if_active: !c.what_if_active,
          };
        });
        const updatedDiags = buildDiagnosticsMap(updatedCases);

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
        });
      },

      simulateFreshResults: (
        userName = 'System Revalidation Engine',
        userRole = 'Automated Clearinghouse'
      ) => {
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        let revalidatedCount = 0;
        let creditedCount = 0;
        const newLogs: AuditLogEntry[] = [];

        const updatedCases = get().cases.map((c) => {
          if (
            c.status === 'Ready for Revalidation' ||
            c.status === 'Correction reported' ||
            c.status === 'Awaiting verification' ||
            c.status === 'Awaiting Department'
          ) {
            revalidatedCount++;
            creditedCount++;

            newLogs.push({
              id: `log_reval_${c.case_id}_${Date.now()}`,
              timestamp: nowStr,
              user_name: userName,
              role: userRole,
              case_id: c.case_id,
              action: 'Clearinghouse NPCI Re-Ping Validation Passed',
              old_state: c.status,
              new_state: 'Resolved',
              reason: 'NPCI mapper 200 OK verified. Aadhaar successfully linked to active account.',
            });

            newLogs.push({
              id: `log_credit_${c.case_id}_${Date.now()}`,
              timestamp: nowStr,
              user_name: 'PFMS Treasury Disbursal Gateway',
              role: 'System',
              case_id: c.case_id,
              action: 'DBT Instalment Credited & Closed',
              old_state: 'Resolved',
              new_state: 'Payment Confirmed',
              reason: 'Stalled 23rd instalment (₹2,000) credited via supplementary clearing batch.',
            });

            return {
              ...c,
              status: 'Payment Confirmed' as CaseStatus,
              verification_status: 'Resolved issue' as const,
              severity: 'Green' as const,
              issue_title: 'Remediated & Credited',
              waiting_for: 'System' as const,
              rule_code: 'CLEAN',
            };
          }
          return c;
        });

        const updatedDiags = buildDiagnosticsMap(updatedCases);
        const updatedAudit = [...newLogs, ...get().auditLogs];

        set({
          cases: updatedCases,
          diagnostics: updatedDiags,
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });

        return { revalidatedCount, creditedCount };
      },

      addAuditLog: (entry) => {
        const nowStr =
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';

        const newLog: AuditLogEntry = {
          ...entry,
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: nowStr,
        };

        const updatedAudit = [newLog, ...get().auditLogs];
        set({
          auditLogs: updatedAudit,
          auditLog: updatedAudit,
        });
      },

      // Convenience Aliases for all components
      approveAndAssign: (farmerIdOrCaseId, targetOfficeName = 'SBI Irinjalakuda Branch', targetOfficer = 'Suresh Menon (Scale II)') => {
        get().approveAndAssignCase(farmerIdOrCaseId, targetOfficeName, targetOfficer);
      },

      askEvidence: (farmerIdOrCaseId) => {
        get().updateCaseStatus(farmerIdOrCaseId, 'Verification Required', 'Evidence Requested', 'Additional revenue mutation certificate requested from farmer.');
      },

      dismissCase: (farmerIdOrCaseId, reason = 'Duplicate / Ineligible record resolved') => {
        get().updateCaseStatus(farmerIdOrCaseId, 'Resolved', 'Case Closed / Cleared', reason);
      },

      whatIfSimulate: (farmerIdOrCaseId) => {
        get().toggleWhatIf(farmerIdOrCaseId);
      },

      updateFarmerCallStatus: (farmerId, status, note = '') => {
        get().logCallOutcome(farmerId, status, note);
      },

      assignCase: (farmerId, agency, officer) => {
        get().reassignCase(farmerId, agency as any, `${agency} Office`, officer, 'Assigned via case queue');
      },

      uploadProof: (farmerId: string, proofDataOrFileName: any, refId?: string, officerName?: string) => {
        let proofObj;
        if (typeof proofDataOrFileName === 'object') {
          proofObj = proofDataOrFileName;
        } else {
          proofObj = {
            proof_type: 'Annexure-I Mandate Stamped Counterfoil',
            reference_no: refId || `REF-${Date.now().toString().slice(-6)}`,
            file_name: proofDataOrFileName || 'Official_Stamped_Ack.pdf',
            officer_note: 'Aadhaar mandate linked in CBS',
            officer_name: officerName || 'Suresh Menon',
          };
        }
        get().submitTaskProof(farmerId, proofObj);
      },

      logAudit: (farmerIdOrCaseIdOrObj: any, action?: string, detail?: string) => {
        if (typeof farmerIdOrCaseIdOrObj === 'object' && farmerIdOrCaseIdOrObj !== null) {
          get().addAuditLog({
            case_id: farmerIdOrCaseIdOrObj.farmer_id || farmerIdOrCaseIdOrObj.case_id || 'AUDIT',
            action: farmerIdOrCaseIdOrObj.action || 'Audit Log Event',
            reason: farmerIdOrCaseIdOrObj.details || farmerIdOrCaseIdOrObj.reason || '',
            user_name: farmerIdOrCaseIdOrObj.officer_name || 'System User',
            role: farmerIdOrCaseIdOrObj.office_type || 'Officer',
            old_state: 'Current',
            new_state: 'Updated',
          });
        } else {
          get().addAuditLog({
            case_id: farmerIdOrCaseIdOrObj || 'AUDIT',
            action: action || 'Audit Log Event',
            reason: detail || '',
            user_name: 'System User',
            role: 'Officer',
            old_state: 'Current',
            new_state: 'Updated',
          });
        }
      },

      revalidateBatch: () => {
        return get().simulateFreshResults();
      },
    }),
    {
      name: 'dbtguard-storage-v3',
      partialize: (state) => ({
        cases: state.cases,
        auditLogs: state.auditLogs.slice(0, 50),
      }),
    }
  )
);
