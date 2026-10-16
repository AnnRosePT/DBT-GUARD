import type { CaseStatus } from '../types';

interface LifecycleStepperProps {
  currentStatus: CaseStatus;
  date?: string;
}

const STAGES: { id: number; name: string; statusMatch: CaseStatus[]; note: string }[] = [
  { id: 1, name: '1. Issue Identified', statusMatch: ['Issue identified'], note: 'R01 Error' },
  { id: 2, name: '2. Correction Requested', statusMatch: ['Correction requested'], note: 'Liaison Assigned' },
  { id: 3, name: '3. Correction Reported', statusMatch: ['Correction reported'], note: 'Proof Submitted' },
  { id: 4, name: '4. Awaiting Verify', statusMatch: ['Awaiting verification'], note: 'Clearinghouse Pull' },
  { id: 5, name: '5. Validation Passed', statusMatch: ['Validation passed'], note: 'Automated NPCI Check' },
  { id: 6, name: '6. Retry Pending', statusMatch: ['Retry pending', 'Payment pending'], note: 'Supplementary Cycle' },
  { id: 7, name: '7. Credited (Closed)', statusMatch: ['Credited', 'Ready'], note: '₹2,000 Disbursement' },
];

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({ currentStatus }) => {
  // Determine current active index (1-based)
  let activeIndex = 1;
  if (currentStatus === 'New' || currentStatus === 'Action Required' || currentStatus === 'Issue identified') activeIndex = 1;
  else if (currentStatus === 'Verification Required' || currentStatus === 'Needs verification' || currentStatus === 'Awaiting Farmer' || currentStatus === 'Correction requested') activeIndex = 2;
  else if (currentStatus === 'Correction in Progress' || currentStatus === 'Correction reported' || currentStatus === 'Ready for Revalidation') activeIndex = 3;
  else if (currentStatus === 'Awaiting Department' || currentStatus === 'Awaiting verification') activeIndex = 4;
  else if (currentStatus === 'Resolved' || currentStatus === 'Validation passed') activeIndex = 5;
  else if (currentStatus === 'Retry pending' || currentStatus === 'Payment pending') activeIndex = 6;
  else if (currentStatus === 'Payment Confirmed' || currentStatus === 'Credited' || currentStatus === 'Ready') activeIndex = 7;
  else if (currentStatus === 'Escalated') activeIndex = 4;

  return (
    <div className="w-full bg-surface-card rounded-lg border border-border-subtle p-space-md shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-space-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">alt_route</span>
          <h3 className="font-title-md text-title-md text-primary font-bold">
            Case Progression Lifecycle
          </h3>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
          Stage {activeIndex} of 7 Complete
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {STAGES.map((stage) => {
          const isCurrent = stage.id === activeIndex;
          const isPassed = stage.id < activeIndex;

          return (
            <div
              key={stage.id}
              className={`rounded-lg p-2.5 border transition-all text-center flex flex-col justify-between min-h-[90px] ${
                isCurrent
                  ? 'bg-status-error-bg/60 border-status-error ring-1 ring-status-error shadow-xs'
                  : isPassed
                  ? 'bg-status-ready-bg/50 border-status-ready/40 text-on-surface'
                  : 'bg-surface-container-low/60 border-border-subtle text-on-surface-variant'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-status-error text-white'
                      : isPassed
                      ? 'bg-status-ready text-white'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {isPassed ? (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  ) : (
                    stage.id
                  )}
                </span>
              </div>

              <div className="font-label-sm text-[11px] font-bold leading-tight">
                {stage.name}
              </div>

              <div className="text-[10px] text-on-surface-variant mt-1 font-mono">
                {stage.note}
              </div>

              {isCurrent && (
                <span className="mt-1 bg-status-error text-white text-[9px] font-bold uppercase py-0.5 rounded px-1 self-center">
                  Active Stage
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
