import React, { useState } from 'react';
import type { CaseRecord } from '../types';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseRecord;
  onEscalate: (caseId: string, authority: string, reason: string) => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onEscalate,
}) => {
  if (!isOpen) return null;

  const [authority, setAuthority] = useState('District DBT Nodal Officer (Thrissur Collectorate)');
  const [reason, setReason] = useState(
    `SLA breach (> 7 days). Inter-departmental response pending from ${caseItem.owner_office_name}. Escalated for administrative summons.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEscalate(caseItem.case_id, authority, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-card rounded-2xl max-w-lg w-full border border-border-subtle shadow-2xl overflow-hidden">
        <div className="bg-status-error text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
            <h2 className="font-title-md text-base font-bold">
              Escalate Case #{caseItem.case_id} to Higher Authority
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
          <div className="bg-status-error-bg p-3 rounded-lg border border-status-error/30 text-status-error text-xs">
            <strong>Case Identifier:</strong> #{caseItem.case_id} · {caseItem.farmer_name_en} · Open for {caseItem.days_open} days (Deadline was {caseItem.deadline_date})
          </div>

          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              1. Escalate To Authority / Desk:
            </label>
            <select
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-secondary focus:outline-none"
            >
              <option>District DBT Nodal Officer (Thrissur Collectorate)</option>
              <option>Lead District Bank Manager (LDM Thrissur)</option>
              <option>Tahsildar & Sub-Collector (Revenue Division)</option>
              <option>State PM-KISAN Nodal Office (Vikas Bhavan Trivandrum)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              2. Formal Escalation Justification:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-secondary focus:outline-none resize-none"
            />
          </div>

          <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle text-[11px] text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-status-warning flex-shrink-0 mt-0.5">info</span>
            <span>
              Escalation notifies the District Nodal Officer on the Apex Escalation Board and issues a formal administrative summons docket.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border-strong text-xs font-bold text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-status-error hover:bg-status-error/90 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              <span>Confirm Escalation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
