import type { CaseStatus } from '../types';

interface StatusChipProps {
  status: CaseStatus | string;
  className?: string;
  pulse?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className = '', pulse = false }) => {
  let text = status;
  let bgClass = 'bg-status-pending-bg text-status-pending border-status-pending/30';
  let dotClass = 'bg-status-pending';

  switch (status) {
    case 'Payment Confirmed':
    case 'Resolved':
    case 'Ready':
    case 'Credited':
    case 'Validation passed':
      bgClass = 'bg-status-ready-bg text-status-ready border-status-ready/30';
      dotClass = 'bg-status-ready';
      break;
    case 'Verification Required':
    case 'Needs verification':
    case 'Awaiting Farmer':
    case 'Correction requested':
    case 'Awaiting verification':
      bgClass = 'bg-status-warning-bg text-status-warning border-status-warning/40';
      dotClass = 'bg-status-warning';
      break;
    case 'Action Required':
    case 'Issue identified':
    case 'Failed again':
      bgClass = 'bg-status-error-bg text-status-error border-status-error/40';
      dotClass = 'bg-status-error';
      break;
    case 'Escalated':
      bgClass = 'bg-status-error text-white border-status-error';
      dotClass = 'bg-white';
      break;
    case 'Awaiting Department':
    case 'Correction in Progress':
    case 'Payment pending':
    case 'Retry pending':
    case 'New':
      bgClass = 'bg-status-pending-bg text-status-pending border-status-pending/30';
      dotClass = 'bg-status-pending';
      break;
    case 'Ready for Revalidation':
    case 'Correction reported':
      bgClass = 'bg-secondary-container text-on-secondary-container border-secondary/40';
      dotClass = 'bg-secondary';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold uppercase tracking-wider border shadow-xs ${bgClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ${pulse ? 'animate-ping' : ''}`} />
      <span>{text}</span>
    </span>
  );
};
