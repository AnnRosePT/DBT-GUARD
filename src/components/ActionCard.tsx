import React from 'react';
import { Link } from 'react-router-dom';
import type { CaseRecord } from '../types';
import { StatusChip } from './StatusChip';

interface ActionCardProps {
  item?: CaseRecord;
  caseRecord?: CaseRecord;
  onAssign?: (item: CaseRecord) => void;
  onNotify?: (item: CaseRecord) => void;
  onViewSteps?: (item: CaseRecord) => void;
  compact?: boolean;
  isCompact?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  item,
  caseRecord,
  onAssign,
  onNotify,
  onViewSteps,
  compact = false,
  isCompact = false,
}) => {
  const activeItem = item || caseRecord;
  if (!activeItem) return null;

  const isUrgent = (activeItem.priority || 1) >= 5;
  const isOverdue = activeItem.is_overdue || (activeItem.days_open || 0) > 7;

  return (
    <div
      className={`bg-surface-card rounded-xl border transition-all relative overflow-hidden shadow-sm hover:shadow-md ${
        isUrgent ? 'border-status-error/40' : 'border-border-subtle'
      }`}
    >
      {/* Top Severity / Tricolor indicator */}
      <div
        className={`h-1 w-full ${
          activeItem.severity === 'Red'
            ? 'bg-status-error'
            : activeItem.severity === 'Amber'
            ? 'bg-status-warning'
            : activeItem.severity === 'Green'
            ? 'bg-status-ready'
            : 'bg-outline-variant'
        }`}
      />

      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Header: Case ID, Name, Status, Severity */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
              #{activeItem.case_id}
            </span>
            <span className="font-bold text-primary text-sm sm:text-base">
              {activeItem.farmer_name_en}
            </span>
            <span className="font-['Noto_Sans_Malayalam'] text-xs text-on-surface-variant">
              ({activeItem.farmer_name_ml})
            </span>
            <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
              Aadhaar: {activeItem.aadhaar_masked}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StatusChip status={activeItem.status} pulse={isUrgent} />
            {isOverdue && (
              <span className="bg-status-error text-white font-bold text-[10px] uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">warning</span> Overdue
              </span>
            )}
          </div>
        </div>

        {/* Action Summary Matrix (The 5 Vital Questions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs bg-surface-container-low/70 p-3 rounded-lg border border-border-subtle/60">
          <div>
            <span className="text-on-surface-variant block font-medium">Issue & Problem:</span>
            <span className="font-bold text-primary block mt-0.5">
              {activeItem.issue_title} — <span className="font-normal text-on-surface">{activeItem.problem_statement || activeItem.issue_description}</span>
            </span>
          </div>

          <div>
            <span className="text-on-surface-variant block font-medium">Responsible Role / Owner:</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[11px]">
                <span className="material-symbols-outlined text-[13px]">badge</span>
                {activeItem.responsible_role_label || activeItem.owner_office_name}
              </span>
              {activeItem.assigned_officer && (
                <span className="text-on-surface-variant text-[11px] truncate">
                  ({activeItem.assigned_officer})
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-on-surface-variant block font-medium">Immediate Next Action:</span>
            <span className="font-semibold text-secondary block mt-0.5">
              👉 {activeItem.immediate_next_action || activeItem.next_step_text || 'Verify records with responsible institution'}
            </span>
          </div>

          <div>
            <span className="text-on-surface-variant block font-medium">Farmer Notification:</span>
            <span className="inline-flex items-center gap-1 mt-0.5 font-medium">
              {activeItem.farmer_notification_required ? (
                <span className="text-status-warning font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                  Required (Action needed)
                </span>
              ) : (
                <span className="text-status-ready font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Not Required (Internal)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Footer Actions: Assign, View Steps, Notify, Open Workflow */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/60 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[14px]">event</span>
              Due: {activeItem.deadline_date || '7 days'}
            </span>
            <span>·</span>
            <span>Open {activeItem.days_open || 1}d</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onAssign && (
              <button
                type="button"
                onClick={() => onAssign(activeItem)}
                className="px-2.5 py-1.5 text-xs font-bold text-primary bg-surface-card border border-border-strong hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">person_add</span>
                <span>Assign Officer</span>
              </button>
            )}

            {onNotify && activeItem.farmer_notification_required && (
              <button
                type="button"
                onClick={() => onNotify(activeItem)}
                className="px-2.5 py-1.5 text-xs font-bold text-status-warning bg-status-warning-bg border border-status-warning/40 hover:bg-status-warning/20 rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">call</span>
                <span>Notify Farmer</span>
              </button>
            )}

            <Link
              to={`/cases/${activeItem.case_id}`}
              className="px-3 py-1.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary-container rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Open Workflow</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
