/**
 * DBT-GUARD Working-Day SLA Calculator
 * Computes statutory turnaround deadlines taking into account Indian banking holidays,
 * 2nd & 4th Saturdays, and Sundays to ensure precise escalations.
 */

export interface SLACalculationResult {
  calendarDaysOpen: number;
  workingDaysOpen: number;
  slaLimitWorkingDays: number;
  isOverdue: boolean;
  severityLevel: 'Green' | 'Amber' | 'Red';
  urgencyLabel: string;
}

/**
 * Checks if a given date is a banking holiday or weekend in Kerala
 */
export function isBankingHoliday(date: Date): boolean {
  const day = date.getDay();
  // Sundays are always holidays
  if (day === 0) return true;

  // Saturdays: 2nd and 4th Saturday of the month are banking holidays in India
  if (day === 6) {
    const dayOfMonth = date.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    if (weekNumber === 2 || weekNumber === 4) return true;
  }

  return false;
}

/**
 * Calculates working days elapsed between an issue date and a reference date (defaults to today)
 */
export function calculateWorkingDays(startDateStr: string, endDate: Date = new Date()): number {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return 0;

  let current = new Date(start);
  let workingDays = 0;

  while (current <= endDate) {
    if (!isBankingHoliday(current)) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(0, workingDays - 1);
}

/**
 * Computes full SLA metrics for an active DBT-GUARD case
 */
export function evaluateCaseSLA(
  createdDateStr: string,
  slaLimitWorkingDays: number = 7
): SLACalculationResult {
  const createdDate = new Date(createdDateStr);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const calendarDaysOpen = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const workingDaysOpen = calculateWorkingDays(createdDateStr, now);
  const isOverdue = workingDaysOpen >= slaLimitWorkingDays;

  let severityLevel: 'Green' | 'Amber' | 'Red' = 'Green';
  let urgencyLabel = 'Within SLA';

  if (workingDaysOpen >= slaLimitWorkingDays) {
    severityLevel = 'Red';
    urgencyLabel = `Overdue (${workingDaysOpen} working days)`;
  } else if (workingDaysOpen >= Math.floor(slaLimitWorkingDays * 0.6)) {
    severityLevel = 'Amber';
    urgencyLabel = `Approaching SLA (${workingDaysOpen}/${slaLimitWorkingDays} days)`;
  } else {
    severityLevel = 'Green';
    urgencyLabel = `On Track (${workingDaysOpen}/${slaLimitWorkingDays} days)`;
  }

  return {
    calendarDaysOpen,
    workingDaysOpen,
    slaLimitWorkingDays,
    isOverdue,
    severityLevel,
    urgencyLabel,
  };
}
