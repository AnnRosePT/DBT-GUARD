import React, { useState } from 'react';
import type { CaseRecord, Role } from '../types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseRecord;
  onConfirm: (caseId: string, role: Role, officeName: string, officerName: string, reason: string) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState<Role>(caseItem.owner_office_type || 'bank_branch');
  const [officeName, setOfficeName] = useState(
    caseItem.owner_office_name || (caseItem.bank_name ? `${caseItem.bank_name} ${caseItem.local_body} Branch` : 'SBI Irinjalakuda Branch')
  );
  const [officerName, setOfficerName] = useState(caseItem.assigned_officer || 'Suresh Menon (Scale II)');
  const [instructions, setInstructions] = useState(
    `Please verify ${caseItem.issue_title} for beneficiary ${caseItem.farmer_name_en} (#${caseItem.case_id}). Check official records and execute necessary correction.`
  );

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    if (role === 'bank_branch') {
      setOfficeName(`${caseItem.bank_name || 'SBI'} ${caseItem.local_body} Branch`);
      setOfficerName('Suresh Menon (Scale II)');
    } else if (role === 'akshaya') {
      setOfficeName(`Akshaya e-Kendra ${caseItem.local_body} Centre`);
      setOfficerName('Divya Nair (Center In-Charge)');
    } else if (role === 'village_office') {
      setOfficeName(`${caseItem.local_body} Village Revenue Office`);
      setOfficerName('M. K. Balan (Village Revenue Officer)');
    } else if (role === 'district_nodal') {
      setOfficeName('District DBT Nodal Office, Thrissur Collectorate');
      setOfficerName('Dr. K. S. Rajeev IAS (District Nodal Officer)');
    } else {
      setOfficeName(`Krishi Bhavan ${caseItem.local_body}`);
      setOfficerName('Anitha R (Agricultural Extension Officer)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(caseItem.case_id, selectedRole, officeName, officerName, instructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-card rounded-2xl max-w-lg w-full border border-border-subtle shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-on-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-accent-saffron">assignment_ind</span>
            <h2 className="font-title-md text-base font-bold">
              Assign / Route Case #{caseItem.case_id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-primary/80 hover:text-on-primary p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
            <span className="text-on-surface-variant text-xs block">Target Beneficiary:</span>
            <span className="font-bold text-primary text-sm">
              {caseItem.farmer_name_en} ({caseItem.farmer_name_ml}) · Aadhaar: {caseItem.aadhaar_masked}
            </span>
            <span className="text-xs text-on-surface-variant block mt-0.5">
              Issue: <strong className="text-status-error">{caseItem.issue_title}</strong> — {caseItem.problem_statement}
            </span>
          </div>

          {/* Department Role Selection */}
          <div>
            <label className="block font-bold text-primary mb-1 text-xs uppercase tracking-wider">
              1. Responsible Role / Institution
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'bank_branch' as Role, label: 'Bank Branch Desk', icon: 'account_balance' },
                { role: 'akshaya' as Role, label: 'Akshaya e-Kendra', icon: 'devices' },
                { role: 'village_office' as Role, label: 'Village Revenue Office', icon: 'landscape' },
                { role: 'krishi_bhavan' as Role, label: 'Krishi Bhavan Official', icon: 'agriculture' },
              ].map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => handleRoleChange(opt.role)}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    selectedRole === opt.role
                      ? 'border-secondary bg-secondary/10 font-bold text-primary shadow-xs'
                      : 'border-border-subtle hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Office Name */}
          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              2. Target Office / Branch
            </label>
            <input
              type="text"
              required
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          {/* Officer Name */}
          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              3. Assigned Officer / Desk In-Charge
            </label>
            <input
              type="text"
              required
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          {/* Instructions / Mandate Note */}
          <div>
            <label className="block font-bold text-primary mb-1 text-xs">
              4. Specific Action Instructions / Note
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-secondary focus:outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Notice */}
          <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/20 text-[11px] text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0 mt-0.5">info</span>
            <span>
              Assigning this docket updates SLA deadline to <strong>+7 days</strong>, sets case status to <em>Awaiting Department</em>, and records an immutable entry in the district audit trail.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border-strong text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Confirm & Route Docket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
