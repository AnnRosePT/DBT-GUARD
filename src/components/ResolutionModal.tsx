import React, { useState } from 'react';
import type { CaseRecord } from '../types';

interface ResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseRecord;
  onResolve: (caseId: string, resolutionType: 'Resolved' | 'Payment Confirmed', referenceNo: string, officerNotes: string) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onResolve,
}) => {
  if (!isOpen) return null;

  const [resolutionType, setResolutionType] = useState<'Resolved' | 'Payment Confirmed'>('Resolved');
  const [referenceNo, setReferenceNo] = useState(`REF-RES-${Date.now().toString().slice(-6)}`);
  const [officerNotes, setOfficerNotes] = useState(
    `All required protocol steps verified. Official clearinghouse response confirmed for ${caseItem.issue_title}.`
  );
  const [confirmPaymentCredit, setConfirmPaymentCredit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check how many workflow steps are completed
  const totalSteps = caseItem.workflow_steps?.length || 6;
  const completedSteps = caseItem.workflow_steps?.filter((s) => s.is_completed).length || 0;
  const allStepsCompleted = completedSteps >= totalSteps;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onResolve(caseItem.case_id, resolutionType, referenceNo, officerNotes);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-card rounded-2xl max-w-lg w-full border border-border-subtle shadow-2xl overflow-hidden">
        <div className="bg-status-ready text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">verified</span>
            <h2 className="font-title-md text-base font-bold">
              Resolve / Close Case #{caseItem.case_id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Step Progress Checklist Verification */}
          <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Protocol Progress:</span>
              <span className="font-bold text-primary">
                {completedSteps} / {totalSteps} Steps Recorded
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-status-ready h-full transition-all duration-300"
                style={{ width: `${Math.round((completedSteps / totalSteps) * 100)}%` }}
              />
            </div>
            {!allStepsCompleted && (
              <p className="text-[11px] text-status-warning mt-1.5 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Note: Some intermediate steps were left unchecked. An official reference ID is required to override and resolve.
              </p>
            )}
          </div>

          {/* Resolution Outcome Type */}
          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              1. Select Resolution Scope (Preserve Data Issue vs Payment Credit):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setResolutionType('Resolved');
                  setConfirmPaymentCredit(false);
                }}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  resolutionType === 'Resolved'
                    ? 'border-secondary bg-secondary/10 font-bold text-primary shadow-xs'
                    : 'border-border-subtle hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <div className="font-bold">Data Issue Corrected</div>
                <div className="text-[11px] text-on-surface-variant">Records aligned; pending next disbursal run</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResolutionType('Payment Confirmed');
                  setConfirmPaymentCredit(true);
                }}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  resolutionType === 'Payment Confirmed'
                    ? 'border-status-ready bg-status-ready-bg font-bold text-status-ready shadow-xs'
                    : 'border-border-subtle hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <div className="font-bold">Payment Confirmed</div>
                <div className="text-[11px] text-on-surface-variant">Independently verified funds credited</div>
              </button>
            </div>
          </div>

          {/* Evidence Reference Number */}
          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              2. Official Reference / Checksum Number <span className="text-status-error">*</span>:
            </label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-secondary focus:outline-none"
              placeholder="e.g. CBS-MANDATE-2026-SBI-8912"
            />
          </div>

          {/* Officer Closure Rationale */}
          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              3. Officer Closure Findings / Audit Summary:
            </label>
            <textarea
              rows={2}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-secondary focus:outline-none resize-none"
            />
          </div>

          {/* Mandatory Checkbox */}
          <div className="bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2 border border-border-subtle">
            <input
              type="checkbox"
              id="confirm-closure-check"
              required
              defaultChecked
              className="mt-0.5 h-4 w-4 rounded accent-primary text-on-primary cursor-pointer"
            />
            <label htmlFor="confirm-closure-check" className="text-[11px] text-on-surface leading-snug cursor-pointer">
              I certify under authorised government protocol that verified source evidence exists and this case closure complies with DBT audit standards.
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg border border-border-strong text-xs font-bold text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-status-ready hover:bg-status-ready/90 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSubmitting ? 'hourglass_top' : 'task_alt'}
              </span>
              <span>{isSubmitting ? 'Recording Outcome...' : 'Execute Case Closure'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
