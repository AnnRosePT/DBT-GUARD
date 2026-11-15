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

  const green = 'bg-status-ready-bg text-status-ready border-status-ready/30';
  const amber = 'bg-status-warning-bg text-status-warning border-status-warning/40';
  const red = 'bg-status-error-bg text-status-error border-status-error/40';
  const blue = 'bg-status-info-bg text-status-info border-status-info/30';

  switch (status) {
    // Green: verified completion only
    case 'Payment Confirmed':
    case 'Credited':
    case 'Ready':
    case 'Validation passed':
    case 'Resolved':
      bgClass = green;
      dotClass = 'bg-status-ready';
      break;
    // Amber: action required
    case 'Action Required':
    case 'Issue identified':
    case 'Verification Required':
    case 'Needs verification':
    case 'Awaiting Farmer':
    case 'Correction requested':
      bgClass = amber;
      dotClass = 'bg-status-warning';
      break;
    // Red: urgent failures
    case 'Escalated':
    case 'Failed again':
      bgClass = red;
      dotClass = 'bg-status-error';
      break;
    // Blue: information / in progress
    default:
      bgClass = blue;
      dotClass = 'bg-status-info';
      break;
  }

  if (status === 'Resolved') text = 'Issue resolved';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold border ${bgClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ${pulse ? 'animate-ping' : ''}`} />
      <span>{text}</span>
    </span>
  );
};
