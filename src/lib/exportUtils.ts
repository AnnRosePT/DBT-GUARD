/**
 * DBT-GUARD Batch CSV & Data Export Utility
 * Enables Agriculture Extension Officers to export prioritized remediation
 * queues into standardized CSV format for SLBC and Lead Bank Branch review.
 */

import type { CaseRecord } from '../types';

export function convertCasesToCSV(cases: CaseRecord[]): string {
  if (!cases || cases.length === 0) {
    return 'No records available';
  }

  const headers = [
    'Case ID',
    'Farmer ID',
    'Farmer Name (English)',
    'Farmer Name (Malayalam)',
    'Local Body',
    'Assigned Department',
    'Rule Code',
    'Issue Title',
    'Status',
    'Severity',
    'Days Open',
    'Overdue Flag',
    'Call Attempts',
    'Call Status',
  ];

  const escapeCSV = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = cases.map((c) => [
    escapeCSV(c.case_id),
    escapeCSV(c.farmer_id),
    escapeCSV(c.farmer_name_en),
    escapeCSV(c.farmer_name_ml),
    escapeCSV(c.local_body),
    escapeCSV(c.owner_office_type),
    escapeCSV(c.rule_code),
    escapeCSV(c.issue_title),
    escapeCSV(c.status),
    escapeCSV(c.severity),
    escapeCSV(c.days_open),
    escapeCSV(c.is_overdue ? 'YES' : 'NO'),
    escapeCSV(c.call_attempts || 0),
    escapeCSV(c.call_status || 'Pending'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Triggers an immediate browser download of the case list as a CSV spreadsheet
 */
export function downloadCasesCSV(cases: CaseRecord[], filenamePrefix = 'DBT_GUARD_Remediation_Batch'): void {
  const csvContent = convertCasesToCSV(cases);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
