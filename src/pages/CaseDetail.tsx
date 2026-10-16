import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { StatusChip } from '../components/StatusChip';
import { AssignmentModal } from '../components/AssignmentModal';
import { NotificationModal } from '../components/NotificationModal';
import { EscalationModal } from '../components/EscalationModal';
import { ResolutionModal } from '../components/ResolutionModal';
import { MalayalamVoicePlayer } from '../lib/speech';
import type { Role, CallStatus, WorkflowStep } from '../types';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    cases,
    farmers,
    diagnostics,
    auditLog,
    completeWorkflowStep,
    reassignCase,
    escalateCase,
    resolveCase,
    logCallOutcome,
    toggleWhatIf,
    revalidateBatch,
  } = useAppStore();

  const { currentUser } = useAuthStore();
  const currentPersona = currentUser;
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

  const isFarmer = currentUser?.role === 'farmer';
  const myFarmerId = currentUser?.farmerId || 'KL-TSR-0001';
  const myCaseId = currentUser?.caseId || 'K104';

  // Find target case (supports K104, KL-TSR-0001, etc.)
  const targetCase = useMemo(() => {
    // If farmer, strictly lock to their own case
    if (isFarmer) {
      return (
        cases.find((c) => c.case_id === myCaseId || c.farmer_id === myFarmerId) ||
        cases.find((c) => c.case_id === 'K104') ||
        cases[0]
      );
    }

    if (!id) return cases[0];
    const match = cases.find(
      (c) =>
        c.case_id.toLowerCase() === id.toLowerCase() ||
        c.farmer_id.toLowerCase() === id.toLowerCase() ||
        (id === 'K104' && c.farmer_id === 'KL-TSR-0001')
    );
    return match || cases[0];
  }, [id, cases, isFarmer, myCaseId, myFarmerId]);

  // Security check: If farmer tried to load a URL for another case
  const isBlockedFarmer =
    isFarmer &&
    id &&
    id.toLowerCase() !== myCaseId.toLowerCase() &&
    id.toLowerCase() !== myFarmerId.toLowerCase() &&
    !(id === 'K104' && myFarmerId === 'KL-TSR-0001');

  const farmer = useMemo(() => {
    return farmers.find((f) => f.farmer_id === targetCase?.farmer_id) || farmers[0];
  }, [farmers, targetCase]);

  const diag = diagnostics[targetCase?.farmer_id || ''] || targetCase;

  // Modals state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'workflow' | 'diagnostics' | 'ledger'>('workflow');

  // Step notes state
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});
  const [stepEvidences, setStepEvidences] = useState<Record<string, string>>({});

  // Render strict 403 screen if farmer attempts to access another beneficiary
  if (isBlockedFarmer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-surface-card rounded-2xl p-space-lg border-2 border-status-error/40 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-status-error-bg text-status-error flex items-center justify-center mx-auto border border-status-error/40">
            <span className="material-symbols-outlined text-[36px]">gpp_bad</span>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-status-error font-bold bg-status-error-bg px-2.5 py-0.5 rounded-full border border-status-error/30 inline-block">
              Security Boundary Violation • DPDP Act 2023
            </span>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              Access Denied: Beneficiary Identity Isolated
            </h2>
            <p className="font-title-sm text-title-sm text-secondary">
              (മറ്റൊരു കർഷകന്റെ രേഖകൾ പരിശോധിക്കാൻ അനുവാദമില്ല)
            </p>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Under the Digital Personal Data Protection (DPDP) Act 2023 and PM-KISAN Aadhaar Privacy Guidelines, beneficiary accounts are strictly isolated. You cannot view another farmer's bank account, survey number, or DBT grievance dossier (Attempted: {id}).
          </p>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-border-subtle text-left text-body-sm space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Authenticated Citizen:</span>
              <span className="font-bold text-primary">{currentUser?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Authorized Beneficiary ID:</span>
              <span className="font-data-mono font-bold text-secondary">{myFarmerId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Authorized Case Dossier:</span>
              <span className="font-data-mono font-bold text-on-surface">#{myCaseId}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to={`/cases/${myCaseId}`}
              className="bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-6 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-2 font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>Go to My Personal PM-KISAN Record (#{myCaseId})</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!targetCase) {
    return (
      <div className="p-8 text-center bg-surface-card rounded-xl border border-border-subtle">
        <h2 className="text-xl font-bold text-primary">Case Dossier Not Found</h2>
        <Link to="/cases" className="text-secondary underline mt-4 inline-block font-bold">
          Return to Case Queue
        </Link>
      </div>
    );
  }

  const isWhatIfActive = !!targetCase.what_if_active;
  const isUrgent = targetCase.priority >= 5;
  const isOverdue = targetCase.is_overdue || targetCase.days_open > 7;

  // Handle step completion
  const handleCompleteStep = (step: WorkflowStep) => {
    const note = stepNotes[step.id] || '';
    const evidence = stepEvidences[step.id] || '';
    completeWorkflowStep(
      targetCase.case_id,
      step.id,
      note,
      evidence,
      currentPersona?.name || 'Officer Anitha R',
      currentPersona?.designation || 'Krishi Bhavan Official'
    );
    addToast({
      type: 'success',
      title: `Step #${step.step_number} Completed`,
      message: `Action recorded for "${step.title}". Audit trail updated.`,
    });
  };

  // Handle reassign
  const handleAssignConfirm = (caseId: string, role: Role, officeName: string, officerName: string, instructions: string) => {
    reassignCase(caseId, role, officeName, officerName, instructions, currentPersona?.name, currentPersona?.designation);
    addToast({
      type: 'success',
      title: 'Case Docket Reassigned',
      message: `Assigned to ${officeName} (${officerName}). SLA set to +7 days.`,
    });
  };

  // Handle escalation
  const handleEscalateConfirm = (caseId: string, authority: string, reason: string) => {
    escalateCase(caseId, authority, reason, currentPersona?.name, currentPersona?.designation);
    addToast({
      type: 'warning',
      title: 'Docket Escalated',
      message: `Escalated to ${authority}. Summons recorded.`,
    });
  };

  // Handle resolve
  const handleResolveConfirm = (caseId: string, resolutionType: 'Resolved' | 'Payment Confirmed', referenceNo: string, notes: string) => {
    resolveCase(caseId, resolutionType, referenceNo, notes, currentPersona?.name, currentPersona?.designation);
    addToast({
      type: 'success',
      title: `Case Marked ${resolutionType}`,
      message: `Official reference ${referenceNo} recorded. Docket closed.`,
    });
  };

  // Handle Revalidate
  const handleRevalidateCase = () => {
    const res = revalidateBatch();
    addToast({
      type: 'success',
      title: 'Clearinghouse Revalidation Executed',
      message: `Re-ran automated NPCI/PFMS checks. Status updated.`,
    });
  };

  return (
    <div className="flex flex-col w-full space-y-space-md pb-24">
      {/* 1. TOP DOSSIER MASTER CARD */}
      <section className="bg-surface-card rounded-xl border border-border-subtle shadow-xs overflow-hidden">
        {/* Tricolor / State Header Stripe */}
        <div
          className={`h-1.5 w-full ${
            targetCase.severity === 'Red'
              ? 'bg-status-error'
              : targetCase.severity === 'Amber'
              ? 'bg-status-warning'
              : 'bg-status-ready'
          }`}
        />

        <div className="p-4 sm:p-6 flex flex-col gap-4">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant flex-wrap">
              <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[16px]">home</span>
                <span>Dashboard</span>
              </Link>
              <span className="text-outline">/</span>
              <Link to="/cases" className="hover:text-primary transition-colors">
                Cases
              </Link>
              <span className="text-outline">/</span>
              <span className="text-primary font-bold">Case #{targetCase.case_id}</span>
            </nav>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAuditDrawer(!showAuditDrawer)}
                className="px-3 py-1.5 bg-surface-card border border-border-strong text-primary hover:bg-surface-container font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">history</span>
                <span>View Audit Trail</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-surface-card border border-border-strong text-on-surface-variant hover:text-primary font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Docket</span>
              </button>
            </div>
          </div>

          {/* Beneficiary Header & What-If Simulator */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-border-subtle">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                  CASE #{targetCase.case_id}
                </span>
                <StatusChip status={targetCase.status} pulse={isUrgent} />
                <span className="font-mono text-xs font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface">
                  ID: {targetCase.farmer_id}
                </span>
                {isOverdue && (
                  <span className="bg-status-error text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">warning</span> Overdue ({targetCase.days_open}d)
                  </span>
                )}
              </div>

              <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-primary mt-1 flex items-center gap-2 flex-wrap">
                <span>{targetCase.farmer_name_en}</span>
                <span className="font-normal text-on-surface-variant font-['Noto_Sans_Malayalam'] text-base sm:text-lg">
                  ({targetCase.farmer_name_ml})
                </span>
              </h1>

              {/* Masked Identifiers */}
              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono mt-1 flex-wrap">
                <span className="bg-surface-container-low px-2 py-0.5 rounded border border-border-subtle">
                  Aadhaar: <strong className="text-on-surface">{targetCase.aadhaar_masked}</strong>
                </span>
                <span className="bg-surface-container-low px-2 py-0.5 rounded border border-border-subtle">
                  A/C: <strong className="text-on-surface">{targetCase.account_masked}</strong>
                </span>
                <span>·</span>
                <span>{targetCase.bank_name} ({targetCase.branch_name || 'Irinjalakuda'})</span>
                <span>·</span>
                <span>{targetCase.local_body} Grama Panchayat</span>
              </div>
            </div>

            {/* WHAT-IF DIAGNOSTIC SIMULATOR (Interactive Toggle) */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-strong flex flex-col gap-1 max-w-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-accent-saffron">science</span>
                  What-If Diagnostic Simulator
                </span>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded uppercase">
                  Sandbox
                </span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isWhatIfActive}
                  onChange={() => toggleWhatIf(targetCase.case_id)}
                  className="mt-0.5 h-4 w-4 rounded accent-primary text-on-primary cursor-pointer"
                />
                <span className="text-xs text-on-surface leading-tight">
                  Simulate resolved state: <strong className="text-status-ready">"Aadhaar Mapped & Active"</strong> without committing to bank CBS.
                </span>
              </label>
              {isWhatIfActive && (
                <div className="mt-1 text-[11px] text-status-ready font-bold bg-status-ready-bg p-1.5 rounded flex items-center gap-1 border border-status-ready/30 animate-in fade-in">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Simulation Active: PFMS code clears to OK; Payment Readiness = 100%.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. STRUCTURED RESOLUTION PANEL (IN EXACT REQUIRED ORDER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* MAIN COLUMN (8 COLS): Section A, B, C, D */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">

          {/* SECTION A: ISSUE SUMMARY */}
          <section className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-accent-saffron">info</span>
                <h2 className="font-title-md text-base font-bold text-primary">
                  Section A: Issue Summary & Diagnostic State
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">
                Detected: {targetCase.detection_date || '14 Oct 2026'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs sm:text-sm">
              <div>
                <span className="text-on-surface-variant block text-xs font-medium">Issue Name & Category:</span>
                <span className="font-bold text-primary text-base block mt-0.5">
                  {targetCase.issue_title}
                </span>
                <span className="font-mono text-xs text-outline block mt-0.5">
                  Rule Code: {targetCase.rule_code}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs font-medium">Severity & Priority:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      targetCase.severity === 'Red'
                        ? 'bg-status-error-bg text-status-error border border-status-error/30'
                        : targetCase.severity === 'Amber'
                        ? 'bg-status-warning-bg text-status-warning border border-status-warning/30'
                        : 'bg-status-ready-bg text-status-ready border border-status-ready/30'
                    }`}
                  >
                    {targetCase.severity} Severity
                  </span>
                  <span className="font-bold text-primary text-xs">
                    {targetCase.priority_label || `Priority ${targetCase.priority}`}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 bg-surface-container-low p-3.5 rounded-lg border border-border-subtle">
                <span className="text-on-surface-variant block text-xs font-medium">Detected Condition (Plain Language):</span>
                <p className="font-semibold text-primary mt-1 leading-relaxed">
                  {targetCase.problem_statement || targetCase.issue_description}
                </p>
                <div className="mt-2 pt-2 border-t border-border-subtle/60 flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="font-bold text-on-surface">Clearinghouse Finding:</span>
                  <span className="font-mono">{targetCase.evidence_text || 'NPCI mapper token status: NOT_MAPPED'}</span>
                </div>
              </div>

              {/* Verification Status (Distinguish Confirmed vs Suspected vs Required vs Resolved) */}
              <div className="sm:col-span-2">
                <span className="text-on-surface-variant block text-xs font-medium mb-1">
                  Verification Classification:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'Confirmed issue', label: 'Confirmed Issue', desc: 'Independently verified by clearinghouse' },
                    { key: 'Suspected issue', label: 'Suspected Issue', desc: 'Automated flag awaiting check' },
                    { key: 'Verification required', label: 'Verification Required', desc: 'Desk check necessary' },
                    { key: 'Resolved issue', label: 'Resolved Issue', desc: 'Remediation completed' },
                  ].map((v) => {
                    const isActive = targetCase.verification_status === v.key || (!targetCase.verification_status && v.key === 'Verification required');
                    return (
                      <div
                        key={v.key}
                        className={`p-2.5 rounded-lg border text-xs transition-all ${
                          isActive
                            ? 'border-secondary bg-secondary/10 font-bold text-primary shadow-xs'
                            : 'border-border-subtle bg-surface-container-low/50 text-on-surface-variant opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold">
                          {isActive && <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>}
                          <span>{v.label}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 leading-tight">{v.desc}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-on-surface-variant italic mt-1.5">
                  * Note: Unverified suspicions are never presented as confirmed banking or eligibility failures.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION B: RESPONSIBLE ROLE */}
          <section className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">badge</span>
                <h2 className="font-title-md text-base font-bold text-primary">
                  Section B: Role Responsibility & Task Ownership
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignOpen(true)}
                className="px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Assign / Reassign Role</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-4 text-xs">
              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                <span className="text-on-surface-variant block text-[11px] font-medium">Primary Responsible Role:</span>
                <span className="font-bold text-primary text-sm mt-0.5 inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">account_balance</span>
                  {targetCase.responsible_role_label || 'Bank Branch Officer'}
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5 truncate">
                  {targetCase.owner_office_name}
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                <span className="text-on-surface-variant block text-[11px] font-medium">Supporting Role:</span>
                <span className="font-bold text-primary text-sm mt-0.5 inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-accent-green">agriculture</span>
                  {targetCase.supporting_role_label || 'Krishi Bhavan Agricultural Officer'}
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Triage coordination & monitoring
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                <span className="text-on-surface-variant block text-[11px] font-medium">Assigned Person & Owner:</span>
                <span className="font-bold text-primary text-sm mt-0.5 block truncate">
                  {targetCase.assigned_officer || 'Suresh Menon (Scale II, SBI)'}
                </span>
                <span className="text-[11px] text-secondary font-semibold block mt-0.5">
                  Current Task Owner: {targetCase.current_task_owner || targetCase.responsible_role_label}
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                <span className="text-on-surface-variant block text-[11px] font-medium">Escalation Recipient:</span>
                <span className="font-bold text-primary text-xs mt-0.5 block">
                  {targetCase.escalation_recipient || 'District Nodal Officer (PM-KISAN)'}
                </span>
                <span className="text-[10px] text-on-surface-variant block mt-0.5">
                  Triggered if SLA breaches
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                <span className="text-on-surface-variant block text-[11px] font-medium">SLA Deadline:</span>
                <span className={`font-mono text-xs font-bold block mt-0.5 ${isOverdue ? 'text-status-error' : 'text-primary'}`}>
                  {targetCase.deadline_date || '2026-10-23'}
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Standard 7-Day Resolution Cycle
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => setIsEscalateOpen(true)}
                  className="w-full py-2 bg-surface-card hover:bg-status-error-bg text-status-error border border-status-error/30 hover:border-status-error font-bold text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                  <span>Escalate to Nodal Authority</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECTION C: STEP-BY-STEP RESOLUTION INSTRUCTIONS */}
          <section className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">format_list_numbered</span>
                <h2 className="font-title-md text-base font-bold text-primary">
                  Section C: Step-by-Step Resolution Instructions
                </h2>
              </div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded">
                Protocol: {targetCase.issue_title}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant mt-2 mb-4">
              Numbered, actionable protocol steps tailored specifically for this issue. Each step requires designated role execution, verified evidence, and an expected outcome.
            </p>

            <div className="space-y-4">
              {(targetCase.workflow_steps || []).map((step, idx) => {
                const isStepCompleted = step.is_completed;
                const isMyRoleOwner =
                  currentPersona?.role === step.responsible_role ||
                  (currentPersona?.role === 'krishi_bhavan' && step.responsible_role === 'krishi_bhavan');

                return (
                  <div
                    key={step.id || `step_${idx}`}
                    className={`p-4 rounded-xl border transition-all ${
                      isStepCompleted
                        ? 'bg-status-ready-bg/30 border-status-ready/40'
                        : 'bg-surface-card border-border-subtle hover:border-border-strong'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Step Number Circle */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                            isStepCompleted
                              ? 'bg-status-ready text-white'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}
                        >
                          {isStepCompleted ? '✓' : step.step_number}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-primary text-sm sm:text-base">
                              {step.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container font-medium text-[11px] text-on-surface">
                              <span className="material-symbols-outlined text-[13px]">badge</span>
                              {step.responsible_role_label}
                            </span>
                            {isStepCompleted && (
                              <span className="bg-status-ready-bg text-status-ready font-bold text-[11px] px-2 py-0.2 rounded border border-status-ready/30">
                                Completed: {step.completed_at || 'Verified'} by {step.completed_by || 'Officer'}
                              </span>
                            )}
                          </div>

                          {/* Action Description */}
                          <p className="text-xs sm:text-sm text-on-surface mt-1 leading-relaxed">
                            {step.action_description}
                          </p>

                          {/* Evidence & Expected Outcome Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-border-subtle/60 text-xs">
                            <div>
                              <span className="text-on-surface-variant font-medium">Required Input / Evidence:</span>
                              <span className="font-mono text-primary block mt-0.5">
                                {step.required_input_evidence || 'Official verification record'}
                              </span>
                            </div>
                            <div>
                              <span className="text-on-surface-variant font-medium">Expected Outcome:</span>
                              <span className="font-semibold text-secondary block mt-0.5">
                                {step.expected_outcome}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action / Checkbox Control */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {isStepCompleted ? (
                          <div className="flex items-center gap-1 text-status-ready font-bold text-xs bg-status-ready-bg px-2.5 py-1 rounded">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Recorded</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCompleteStep(step)}
                            className="px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">task_alt</span>
                            <span>{step.action_button_label || 'Mark Complete'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step Notes & Evidence Input (when incomplete) */}
                    {!isStepCompleted && (
                      <div className="mt-3 pt-2.5 border-t border-border-subtle flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Evidence Ref (e.g. CBS-MANDATE-7782)..."
                          value={stepEvidences[step.id] || ''}
                          onChange={(e) =>
                            setStepEvidences({ ...stepEvidences, [step.id]: e.target.value })
                          }
                          className="w-full sm:w-1/3 bg-surface-container-low border border-border-strong rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                        <input
                          type="text"
                          placeholder="Officer findings or note..."
                          value={stepNotes[step.id] || ''}
                          onChange={(e) =>
                            setStepNotes({ ...stepNotes, [step.id]: e.target.value })
                          }
                          className="w-full sm:w-2/3 bg-surface-container-low border border-border-strong rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION D: PROMINENT FARMER NOTIFICATION PANEL (SECTION 4) */}
          <section
            className={`rounded-xl border p-5 shadow-xs transition-all ${
              targetCase.farmer_notification_required
                ? 'bg-status-warning-bg/40 border-status-warning/50'
                : 'bg-surface-card border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    targetCase.farmer_notification_required ? 'text-accent-saffron' : 'text-status-ready'
                  }`}
                >
                  {targetCase.farmer_notification_required ? 'notifications_active' : 'mark_chat_read'}
                </span>
                <div>
                  <h2 className="font-title-md text-base font-bold text-primary">
                    Section D: Farmer Notification & Telephony Panel
                  </h2>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {targetCase.farmer_notification_required
                      ? 'Action Required from Beneficiary — High Visibility Notification'
                      : 'Farmer Notification: Not Required (Internal Department Resolution)'}
                  </span>
                </div>
              </div>

              {targetCase.farmer_notification_required && (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-status-warning text-white uppercase tracking-wider">
                  Outreach Needed
                </span>
              )}
            </div>

            {targetCase.farmer_notification_required ? (
              <div className="mt-4 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-surface-card p-3 rounded-lg border border-border-subtle">
                    <span className="text-on-surface-variant text-xs block font-medium">Why Contact Needed:</span>
                    <span className="font-bold text-primary block mt-0.5 text-xs">
                      {targetCase.farmer_notification_reason || 'Mandate execution required at bank branch.'}
                    </span>
                  </div>

                  <div className="bg-surface-card p-3 rounded-lg border border-border-subtle">
                    <span className="text-on-surface-variant text-xs block font-medium">Action Farmer Must Take:</span>
                    <span className="font-bold text-secondary block mt-0.5 text-xs">
                      {targetCase.farmer_required_action || 'Visit home branch with Aadhaar & Passbook.'}
                    </span>
                  </div>

                  <div className="bg-surface-card p-3 rounded-lg border border-border-subtle">
                    <span className="text-on-surface-variant text-xs block font-medium">Channel & Language:</span>
                    <span className="font-bold text-primary block mt-0.5 text-xs">
                      Malayalam IVR Voice + SMS · {targetCase.mobile_masked}
                    </span>
                  </div>
                </div>

                {/* Delivery & Compliance Status */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-card p-2.5 rounded-lg border border-border-subtle flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span>Consent: <strong className="text-status-ready">Verified (Y)</strong></span>
                    <span>·</span>
                    <span>Last Attempt: <strong>{targetCase.last_call_timestamp || '15 Oct 2026, 11:24'}</strong></span>
                    <span>·</span>
                    <span>Next Follow-up: <strong>17 Oct 2026</strong></span>
                  </div>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                    Delivery: {targetCase.notification_delivery_status || 'Delivered'}
                  </span>
                </div>

                {/* Notification Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => setIsNotifyOpen(true)}
                    className="px-3 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                    <span>Preview & Send Malayalam SMS (Demo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNotifyOpen(true)}
                    className="px-3 py-2 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                    <span>Trigger Voice Assist Call (Demo)</span>
                  </button>

                  <Link
                    to={`/voice/${targetCase.farmer_id}`}
                    className="px-3 py-2 bg-surface-card hover:bg-surface-container text-primary border border-border-strong font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">headphones</span>
                    <span>Dedicated Malayalam IVR Console</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-surface-container-low rounded-lg border border-border-subtle text-xs text-on-surface-variant">
                <p>
                  <strong>Internal Resolution in Progress:</strong> This issue (e.g. land survey cross-matching or clearinghouse batch synchronization) does not require beneficiary physical attendance. Krishi Bhavan and Village Revenue Office are resolving this via inter-departmental data reconciliation.
                </p>
              </div>
            )}
          </section>

          {/* SECTION E: ROLE-SPECIFIC INSTRUCTIONS (SECTION 5) */}
          <section className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">manage_accounts</span>
                <h2 className="font-title-md text-base font-bold text-primary">
                  Section E: Role-Specific Action Panel
                </h2>
              </div>
              <span className="text-xs bg-secondary/10 text-primary font-bold px-2.5 py-0.5 rounded border border-secondary/20">
                Viewing as: {currentPersona?.name} ({currentPersona?.designation})
              </span>
            </div>

            <div className="mt-4">
              {currentPersona?.role === 'bank_branch' && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-secondary/40 space-y-3">
                  <h3 className="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary">account_balance</span>
                    Bank Officer Action Checklist (Lead Bank Desk)
                  </h3>
                  <ul className="text-xs space-y-1.5 text-on-surface list-disc list-inside">
                    <li>Verify CBS account status for A/C {targetCase.account_masked} (Finacle Inquiry).</li>
                    <li>Check NPCI Mapper response code for Aadhaar token {targetCase.aadhaar_masked}.</li>
                    <li>Collect stamped Annexure-I mandate counterfoil upon customer branch visit.</li>
                    <li>Upload stamped proof to Krishi Bhavan to advance case to <em>Ready for Revalidation</em>.</li>
                  </ul>
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to="/tasks"
                      className="px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-lg shadow-xs flex items-center gap-1"
                    >
                      <span>Open Bank Desk Task Queue</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )}

              {currentPersona?.role === 'akshaya' && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-accent-saffron/40 space-y-3">
                  <h3 className="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-accent-saffron">fingerprint</span>
                    Akshaya Operator Action Checklist (e-KYC Desk)
                  </h3>
                  <ul className="text-xs space-y-1.5 text-on-surface list-disc list-inside">
                    <li>Check whether beneficiary e-KYC assistance is required (biometric vs OTP).</li>
                    <li>Facilitate biometric fingerprint capture on certified UIDAI scanner.</li>
                    <li>Record attendance and issue official transaction slip.</li>
                    <li>Escalate technical portal timeouts to District IT Mission.</li>
                  </ul>
                </div>
              )}

              {currentPersona?.role === 'village_office' && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-accent-green/40 space-y-3">
                  <h3 className="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-accent-green">landscape</span>
                    Village Revenue Officer Checklist (ReLIS Desk)
                  </h3>
                  <ul className="text-xs space-y-1.5 text-on-surface list-disc list-inside">
                    <li>Verify specified land survey discrepancy in digital Village Revenue register.</li>
                    <li>Cross-reference Thandapper volume and tax receipt validity.</li>
                    <li>Record revenue verification reference number in docket.</li>
                  </ul>
                </div>
              )}

              {currentPersona?.role === 'krishi_bhavan' && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-primary/30 space-y-3">
                  <h3 className="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">agriculture</span>
                    Krishi Bhavan Agricultural Officer Action Checklist
                  </h3>
                  <ul className="text-xs space-y-1.5 text-on-surface list-disc list-inside">
                    <li>Review detected anomaly evidence and assign target department desk.</li>
                    <li>Monitor 7-day SLA resolution timeline and trigger farmer SMS/voice outreach when needed.</li>
                    <li>Execute clearinghouse revalidation after correction is reported by bank/agency.</li>
                    <li>Verify independent payment credit before final docket closure.</li>
                  </ul>
                </div>
              )}

              {currentPersona?.role === 'district_nodal' && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-status-error/40 space-y-3">
                  <h3 className="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-status-error">gavel</span>
                    District Nodal Authority Checklist (Apex Review)
                  </h3>
                  <ul className="text-xs space-y-1.5 text-on-surface list-disc list-inside">
                    <li>Review overdue or blocked dockets exceeding 7-day resolution window.</li>
                    <li>Issue administrative summons to non-responsive bank branches or departments.</li>
                    <li>Review cross-department bottlenecks across Thrissur District.</li>
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (4 COLS): Action Controls, Payment Ledger, Supplementary Protocol */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* PRIMARY WORKFLOW ACTIONS BAR */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-sm space-y-3">
            <h3 className="font-title-md text-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">play_circle</span>
              <span>Case Workflow Actions</span>
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsAssignOpen(true)}
                className="w-full py-2.5 px-3 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs rounded-lg transition-colors flex items-center justify-between border border-border-subtle shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">person_add</span>
                  <span>Assign / Reassign Officer</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNotifyOpen(true)}
                className="w-full py-2.5 px-3 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs rounded-lg transition-colors flex items-center justify-between border border-border-subtle shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent-saffron">call</span>
                  <span>Notify Farmer (Voice / SMS)</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={handleRevalidateCase}
                className="w-full py-2.5 px-3 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs rounded-lg transition-colors flex items-center justify-between border border-border-subtle shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent-green">published_with_changes</span>
                  <span>Revalidate Case (NPCI Poll)</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResolveOpen(true)}
                className="w-full py-3 px-3 bg-status-ready hover:bg-status-ready/90 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Resolve & Close Case</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEscalateOpen(true)}
                className="w-full py-2 px-3 bg-status-error-bg hover:bg-status-error/20 text-status-error border border-status-error/30 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                <span>Escalate Case</span>
              </button>
            </div>
          </div>

          {/* PAYMENT LEDGER SUMMARY */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-xs">
            <h3 className="font-title-md text-sm font-bold text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-accent-green">currency_rupee</span>
                <span>Payment Instalment Ledger</span>
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant font-bold">PM-KISAN</span>
            </h3>

            <div className="space-y-2 mt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between border border-border-subtle">
                <div>
                  <span className="font-bold text-primary">21st Instalment (₹2,000)</span>
                  <span className="text-[11px] text-on-surface-variant block">Credited: 27 Feb 2026</span>
                </div>
                <span className="bg-status-ready-bg text-status-ready font-bold px-2 py-0.5 rounded text-[11px]">
                  Credited ✓
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between border border-border-subtle">
                <div>
                  <span className="font-bold text-primary">22nd Instalment (₹2,000)</span>
                  <span className="text-[11px] text-on-surface-variant block">Credited: 18 Jun 2026</span>
                </div>
                <span className="bg-status-ready-bg text-status-ready font-bold px-2 py-0.5 rounded text-[11px]">
                  Credited ✓
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-status-error-bg/60 border border-status-error/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-status-error">23rd Instalment (₹2,000)</span>
                  <span className="text-[11px] text-status-error font-mono block">Status: Stalled / R01</span>
                </div>
                <span className="bg-status-error text-white font-bold px-2 py-0.5 rounded text-[11px]">
                  Failed ✗
                </span>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant mt-3 leading-snug">
              Total disbursed to date: <strong>₹44,000</strong>. Stalled 23rd instalment (₹2,000) will be credited automatically upon clearinghouse revalidation.
            </p>
          </div>

          {/* AUDIT TIMELINE PREVIEW */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h3 className="font-title-md text-sm font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-outline">history</span>
                <span>Case Audit History</span>
              </h3>
              <span className="text-xs text-on-surface-variant font-mono">
                {auditLog.filter((a) => a.case_id === targetCase.case_id).length} Entries
              </span>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              {auditLog
                .filter((a) => a.case_id === targetCase.case_id)
                .slice(0, 3)
                .map((log) => (
                  <div key={log.id} className="relative pl-3 border-l-2 border-secondary pb-1">
                    <span className="text-[10px] text-on-surface-variant font-mono block">
                      {log.timestamp}
                    </span>
                    <span className="font-bold text-primary block mt-0.5">{log.action}</span>
                    <span className="text-on-surface-variant text-[11px] line-clamp-2 mt-0.5 leading-snug">
                      {log.reason}
                    </span>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAuditDrawer(true)}
              className="w-full mt-3 py-1.5 text-xs font-bold text-secondary hover:underline flex items-center justify-center gap-1"
            >
              <span>View Complete Audit Ledger</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUDIT LOG DRAWER MODAL */}
      {showAuditDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-card rounded-2xl max-w-2xl w-full border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-primary text-on-primary px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-accent-saffron">history_edu</span>
                <h3 className="font-title-md text-base font-bold">
                  Immutable Audit Ledger — Case #{targetCase.case_id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditDrawer(false)}
                className="text-on-primary/80 hover:text-on-primary p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs sm:text-sm">
              {auditLog
                .filter((a) => a.case_id === targetCase.case_id)
                .map((log) => (
                  <div key={log.id} className="p-3 bg-surface-container-low rounded-lg border border-border-subtle">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                      <span>{log.timestamp}</span>
                      <span className="font-bold text-primary">{log.user_name} ({log.role})</span>
                    </div>
                    <div className="font-bold text-primary text-xs sm:text-sm mt-1">{log.action}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{log.reason}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW MODALS */}
      {isAssignOpen && (
        <AssignmentModal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          caseItem={targetCase}
          onConfirm={handleAssignConfirm}
        />
      )}

      {isNotifyOpen && (
        <NotificationModal
          isOpen={isNotifyOpen}
          onClose={() => setIsNotifyOpen(false)}
          caseItem={targetCase}
          onRecordOutcome={(cId, outcome, notes) => {
            logCallOutcome(cId, outcome, notes);
            addToast({
              type: 'info',
              title: 'Outreach Outcome Recorded',
              message: `Recorded outcome: ${outcome}`,
            });
          }}
        />
      )}

      {isEscalateOpen && (
        <EscalationModal
          isOpen={isEscalateOpen}
          onClose={() => setIsEscalateOpen(false)}
          caseItem={targetCase}
          onEscalate={handleEscalateConfirm}
        />
      )}

      {isResolveOpen && (
        <ResolutionModal
          isOpen={isResolveOpen}
          onClose={() => setIsResolveOpen(false)}
          caseItem={targetCase}
          onResolve={handleResolveConfirm}
        />
      )}
    </div>
  );
};
