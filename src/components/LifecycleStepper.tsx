import type { CaseStatus } from '../types';

interface LifecycleStepperProps {
  currentStatus: CaseStatus;
  date?: string;
}

// Five-stage progress tracker: Detect → Assign → Correct → Revalidate → Confirm payment
const STAGES = ['Detect', 'Assign', 'Correct', 'Revalidate', 'Confirm payment'];

function stageIndex(status: CaseStatus): number {
  switch (status) {
    case 'New':
    case 'Issue identified':
    case 'Action Required':
    case 'Needs verification':
      return 1;
    case 'Verification Required':
    case 'Correction requested':
    case 'Awaiting Farmer':
      return 2;
    case 'Correction in Progress':
    case 'Awaiting Department':
    case 'Correction reported':
    case 'Escalated':
      return 3;
    case 'Ready for Revalidation':
    case 'Awaiting verification':
    case 'Validation passed':
    case 'Resolved':
    case 'Retry pending':
    case 'Payment pending':
      return 4;
    case 'Payment Confirmed':
    case 'Credited':
    case 'Ready':
      return 6; // all five complete
    default:
      return 1;
  }
}

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({ currentStatus }) => {
  const active = stageIndex(currentStatus);
  const blocked = currentStatus === 'Escalated';

  return (
    <div className="w-full bg-surface-card rounded-xl border border-border-subtle px-4 py-3 shadow-xs" aria-label="Case progress">
      <ol className="flex items-center gap-2 flex-wrap">
        {STAGES.map((name, i) => {
          const n = i + 1;
          const done = n < active;
          const current = n === active;
          const circle = done
            ? 'bg-status-ready text-white'
            : current && blocked
            ? 'bg-status-error text-white'
            : current
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container-high text-on-surface-variant';
          const label = done
            ? 'text-status-ready'
            : current && blocked
            ? 'text-status-error font-bold'
            : current
            ? 'text-primary font-bold'
            : 'text-on-surface-variant';
          return (
            <li key={name} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${circle}`}>
                {done ? <span className="material-symbols-outlined text-[14px]">check</span> : n}
              </span>
              <span className={`text-sm ${label}`}>
                {name}
                {current && blocked ? ' (blocked)' : ''}
              </span>
              {n < STAGES.length && <span className="w-6 sm:w-10 h-px bg-border-strong" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
