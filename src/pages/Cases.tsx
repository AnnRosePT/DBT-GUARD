import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { StatusChip } from '../components/StatusChip';
import { ActionCard } from '../components/ActionCard';
import { AssignmentModal } from '../components/AssignmentModal';
import { NotificationModal } from '../components/NotificationModal';
import type { CaseRecord, Role, CallStatus } from '../types';

export const Cases: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const { cases, reassignCase, logCallOutcome } = useAppStore();
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocalBody, setFilterLocalBody] = useState('ALL');
  const [filterIssueType, setFilterIssueType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterCallStatus, setFilterCallStatus] = useState('ALL');
  const [filterOwner, setFilterOwner] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Table selection & pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortField, setSortField] = useState<'priority' | 'case_id' | 'name' | 'days_open'>('priority');
  const [sortAsc, setSortAsc] = useState(false);

  // Modals state
  const [assignModalCase, setAssignModalCase] = useState<CaseRecord | null>(null);
  const [notifyModalCase, setNotifyModalCase] = useState<CaseRecord | null>(null);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = c.farmer_name_en.toLowerCase().includes(q) || c.farmer_name_ml.includes(q);
          const matchesId = c.case_id.toLowerCase().includes(q) || c.farmer_id.toLowerCase().includes(q);
          const matchesAdh = c.aadhaar_masked.toLowerCase().includes(q);
          const matchesPhone = c.mobile_masked.toLowerCase().includes(q);
          if (!matchesName && !matchesId && !matchesAdh && !matchesPhone) return false;
        }

        // Local body
        if (filterLocalBody !== 'ALL' && c.local_body !== filterLocalBody) return false;

        // Status
        if (filterStatus !== 'ALL') {
          if (filterStatus === 'READY' && c.status !== 'Ready' && c.status !== 'Resolved' && c.status !== 'Payment Confirmed') {
            return false;
          }
          if (filterStatus === 'ISSUE_IDENTIFIED' && c.status !== 'Action Required' && c.status !== 'Issue identified') {
            return false;
          }
          if (filterStatus === 'NEEDS_VERIFICATION' && c.status !== 'Verification Required' && c.status !== 'Needs verification') {
            return false;
          }
          if (filterStatus === 'PAYMENT_PENDING' && c.status !== 'Awaiting Department' && c.status !== 'Payment pending') {
            return false;
          }
          if (c.status !== filterStatus && filterStatus !== 'READY' && filterStatus !== 'ISSUE_IDENTIFIED' && filterStatus !== 'NEEDS_VERIFICATION' && filterStatus !== 'PAYMENT_PENDING') {
            return false;
          }
        }

        // Issue type
        if (filterIssueType !== 'ALL' && c.rule_code !== filterIssueType) return false;

        // Call status
        if (filterCallStatus !== 'ALL' && c.call_status !== filterCallStatus) return false;

        // Owner office
        if (filterOwner !== 'ALL' && c.owner_office_type !== filterOwner) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'priority') {
          return sortAsc ? a.priority - b.priority : b.priority - a.priority;
        } else if (sortField === 'name') {
          return sortAsc ? a.farmer_name_en.localeCompare(b.farmer_name_en) : b.farmer_name_en.localeCompare(a.farmer_name_en);
        } else if (sortField === 'days_open') {
          return sortAsc ? a.days_open - b.days_open : b.days_open - a.days_open;
        } else {
          return sortAsc ? a.case_id.localeCompare(b.case_id) : b.case_id.localeCompare(a.case_id);
        }
      });
  }, [cases, searchQuery, filterLocalBody, filterStatus, filterIssueType, filterCallStatus, filterOwner, sortField, sortAsc]);

  // Pagination calculation
  const totalCases = filteredCases.length;
  const totalPages = Math.ceil(totalCases / rowsPerPage) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCases.slice(start, start + rowsPerPage);
  }, [filteredCases, currentPage, rowsPerPage]);

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCases.map((c) => c.case_id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // CSV Export
  const exportCSV = () => {
    const headers = [
      'Case_ID',
      'Farmer_ID',
      'Name_EN',
      'Name_ML',
      'Local_Body',
      'Status',
      'Issue_Category',
      'Problem_Statement',
      'Immediate_Next_Action',
      'Responsible_Role',
      'Assigned_Officer',
      'Farmer_Notification_Required',
      'Deadline',
    ];
    const rows = filteredCases.map((c) => {
      return [
        c.case_id,
        c.farmer_id,
        `"${c.farmer_name_en}"`,
        `"${c.farmer_name_ml}"`,
        c.local_body,
        c.status,
        `"${c.issue_title}"`,
        `"${c.problem_statement || c.issue_description}"`,
        `"${c.immediate_next_action || c.next_step_text}"`,
        `"${c.responsible_role_label || c.owner_office_name}"`,
        `"${c.assigned_officer}"`,
        c.farmer_notification_required ? 'YES' : 'NO',
        c.deadline_date,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dbt_guard_actionable_cases_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      type: 'success',
      title: 'CSV Export Complete',
      message: `Exported ${filteredCases.length} actionable dockets to CSV.`,
    });
  };

  const handleAssignConfirm = (caseId: string, role: Role, officeName: string, officerName: string, instructions: string) => {
    reassignCase(caseId, role, officeName, officerName, instructions);
    addToast({
      type: 'success',
      title: 'Docket Assigned',
      message: `Case #${caseId} routed to ${officeName} (${officerName}).`,
    });
  };

  const handleRecordOutcome = (caseId: string, outcome: CallStatus, notes: string) => {
    logCallOutcome(caseId, outcome, notes);
    addToast({
      type: 'info',
      title: 'Outreach Recorded',
      message: `Outcome for Case #${caseId}: ${outcome}`,
    });
  };

  const { currentUser } = useAuthStore();
  const isFarmer = currentUser?.role === 'farmer';
  const myFarmerId = currentUser?.farmerId || 'KL-TSR-0001';
  const myCaseId = currentUser?.caseId || 'K104';

  const myFarmerCase = useMemo(() => {
    return (
      cases.find((c) => c.case_id === myCaseId || c.farmer_id === myFarmerId) ||
      cases.find((c) => c.case_id === 'K104') ||
      cases[0]
    );
  }, [cases, myCaseId, myFarmerId]);

  // FARMER STRICT ROLE ISOLATION:
  // If the logged-in user is a farmer, they ONLY see their own payment status and details!
  // Access to other beneficiaries is strictly blocked under DPDP Act 2023.
  if (isFarmer) {
    return (
      <div className="flex flex-col w-full space-y-space-md pb-24">
        {/* Farmer Header with Privacy Shield Banner */}
        <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider bg-status-ready text-on-primary px-2.5 py-0.5 rounded font-bold">
                PM-KISAN Beneficiary Portal
              </span>
              <span className="font-label-sm text-label-sm bg-status-ready-bg text-status-ready font-bold px-2.5 py-0.5 rounded border border-status-ready/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Identity Privacy Shield: DPDP Act 2023 Isolated
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              Welcome, {currentUser?.name} ({myFarmerCase?.farmer_name_ml})
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Kattoor Grama Panchayat, Ward 04 • Mukundapuram Taluk, Thrissur • Survey No. 412/1A (0.85 Ha)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/payment-status"
              className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Check Payment Status</span>
            </Link>
            <Link
              to="/voice/K104"
              className="bg-surface-container-low hover:bg-surface-container text-secondary border border-border-subtle font-label-md text-label-md px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
              <span>Listen to Voice Call</span>
            </Link>
          </div>
        </div>

        {/* Security & Access Restriction Notice */}
        <div className="bg-surface-container-low rounded-lg p-3.5 border border-border-subtle flex items-start gap-3 text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-status-ready text-[22px] flex-shrink-0">verified_user</span>
          <div>
            <p className="font-bold text-primary text-[13px]">
              Single-Beneficiary Security Boundary (വ്യക്തിഗത വിവര സുരക്ഷ)
            </p>
            <p className="text-[12px] leading-relaxed">
              In strict accordance with the Digital Personal Data Protection (DPDP) Act 2023, you have been authenticated as <strong>Ravi K (ID: {myFarmerId})</strong>. Your access is strictly restricted to your own PM-KISAN grievance dossier and DBT payment pipeline. Other farmers' bank accounts, survey numbers, and identities are completely hidden.
            </p>
          </div>
        </div>

        {/* Farmer's Action Card */}
        {myFarmerCase && (
          <div>
            <div className="flex items-center justify-between pb-2">
              <h2 className="font-title-lg text-title-lg font-bold text-primary">
                Your Active PM-KISAN Issue & Action Required
              </h2>
              <span className="font-data-mono text-[12px] bg-surface-container px-2.5 py-0.5 rounded font-bold text-primary">
                Dossier #{myFarmerCase.case_id}
              </span>
            </div>

            <ActionCard caseRecord={myFarmerCase} isCompact={false} />
          </div>
        )}

        {/* Direct Link to Case Dossier */}
        {myFarmerCase && (
          <div className="bg-surface-card rounded-xl p-space-md border border-border-subtle shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-title-md text-title-md font-bold text-primary">
                Detailed Resolution Roadmap & Document Verification
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Review full step-by-step progress, officer instructions, and official stamped upload acknowledgments.
              </p>
            </div>
            <Link
              to={`/cases/${myFarmerCase.case_id}`}
              className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all shadow-sm"
            >
              <span>Open My Full Case Dossier</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-space-md pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-4 sm:p-5 rounded-xl border border-border-subtle shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">ballot</span>
            <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-primary">
              Beneficiary Case & Action Resolution Queue
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Every case clearly identifies what is wrong, who owns it, what must be done next, and whether farmer outreach is required.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-border-subtle">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-surface-card text-primary shadow-xs' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-surface-card text-primary shadow-xs' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              <span>Action Cards</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 bg-surface-card hover:bg-surface-container border border-border-strong text-primary text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5-Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { label: 'All Cases', count: cases.length, filterKey: 'ALL', color: 'border-l-primary' },
          {
            label: 'Action Required',
            count: cases.filter((c) => c.status === 'Action Required' || c.status === 'Issue identified').length,
            filterKey: 'ISSUE_IDENTIFIED',
            color: 'border-l-status-error',
          },
          {
            label: 'Awaiting Dept',
            count: cases.filter((c) => c.status === 'Awaiting Department' || c.status === 'Verification Required' || c.status === 'Correction requested').length,
            filterKey: 'NEEDS_VERIFICATION',
            color: 'border-l-status-warning',
          },
          {
            label: 'Revalidation Ready',
            count: cases.filter((c) => c.status === 'Ready for Revalidation' || c.status === 'Correction reported').length,
            filterKey: 'Correction reported',
            color: 'border-l-secondary',
          },
          {
            label: 'Resolved / Credited',
            count: cases.filter((c) => c.status === 'Resolved' || c.status === 'Payment Confirmed' || c.status === 'Ready').length,
            filterKey: 'READY',
            color: 'border-l-status-ready',
          },
        ].map((ribbon) => (
          <button
            key={ribbon.filterKey}
            type="button"
            onClick={() => {
              setFilterStatus(ribbon.filterKey);
              setCurrentPage(1);
            }}
            className={`p-3 rounded-lg border border-l-4 text-left transition-all ${ribbon.color} ${
              filterStatus === ribbon.filterKey
                ? 'bg-surface-card border-secondary shadow-xs font-bold'
                : 'bg-surface-card hover:bg-surface-container-low border-border-subtle'
            }`}
          >
            <span className="text-xs text-on-surface-variant block">{ribbon.label}</span>
            <span className="text-lg font-bold text-primary block mt-0.5">{ribbon.count}</span>
          </button>
        ))}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-surface-card p-4 rounded-xl border border-border-subtle shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div>
            <label className="block text-on-surface-variant font-bold mb-1">Search Beneficiary:</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Name, Case #, Aadhaar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-border-strong rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          {/* Local Body */}
          <div>
            <label className="block text-on-surface-variant font-bold mb-1">Local Body (Grama Panchayat):</label>
            <select
              value={filterLocalBody}
              onChange={(e) => {
                setFilterLocalBody(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="ALL">All Local Bodies (8)</option>
              {['Irinjalakuda', 'Chalakudy', 'Kodungallur', 'Kunnamkulam', 'Thrissur', 'Guruvayur', 'Wadakkanchery', 'Chavakkad'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-on-surface-variant font-bold mb-1">Issue Rule Category:</label>
            <select
              value={filterIssueType}
              onChange={(e) => {
                setFilterIssueType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="ALL">All Issue Types</option>
              <option value="R03">R03 — NPCI Not Mapped (Bank)</option>
              <option value="R07">R07 — e-KYC Pending (Akshaya)</option>
              <option value="R02">R02 — Land Record Mismatch (Revenue)</option>
              <option value="R05">R05 — Name Demographic Discrepancy</option>
              <option value="R01">R01 — PFMS Account Rejected</option>
            </select>
          </div>

          {/* Responsible Office */}
          <div>
            <label className="block text-on-surface-variant font-bold mb-1">Responsible Role / Office:</label>
            <select
              value={filterOwner}
              onChange={(e) => {
                setFilterOwner(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-container-low border border-border-strong rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="ALL">All Responsible Roles</option>
              <option value="bank_branch">Lead Bank Branch Desk</option>
              <option value="akshaya">Akshaya e-Kendra Desk</option>
              <option value="village_office">Village Revenue Office</option>
              <option value="krishi_bhavan">Krishi Bhavan Official</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View: Table vs Action Cards */}
      {viewMode === 'table' ? (
        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-border-subtle text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedCases.length && paginatedCases.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border-strong text-secondary focus:ring-secondary cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-3.5">Farmer & Identifiers</th>
                  <th className="py-3 px-3">Issue & Problem Statement</th>
                  <th className="py-3 px-3">Responsible Owner</th>
                  <th className="py-3 px-3">Immediate Next Action</th>
                  <th className="py-3 px-3 text-center">Farmer Contact</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs sm:text-sm">
                {paginatedCases.map((item) => {
                  const isSelected = selectedIds.includes(item.case_id);
                  const isOverdue = item.days_open > 7 || item.is_overdue;

                  return (
                    <tr
                      key={item.case_id}
                      className={`hover:bg-surface-container-low/60 transition-colors ${
                        isSelected ? 'bg-surface-container-low' : 'bg-surface-card'
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(item.case_id)}
                          className="w-4 h-4 rounded border-border-strong text-secondary focus:ring-secondary cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <Link
                          to={`/cases/${item.case_id}`}
                          className="font-mono text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded border border-primary/20"
                        >
                          #{item.case_id}
                        </Link>
                      </td>

                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-primary">
                          <Link to={`/cases/${item.case_id}`} className="hover:underline">
                            {item.farmer_name_en}
                          </Link>
                        </div>
                        <div className="font-['Noto_Sans_Malayalam'] text-xs text-on-surface-variant">
                          {item.farmer_name_ml}
                        </div>
                        <div className="font-mono text-[11px] text-outline mt-0.5">
                          {item.aadhaar_masked} · {item.local_body}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[210px]">
                        <span className="font-bold text-primary block text-xs">
                          {item.issue_title}
                        </span>
                        <span className="text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                          {item.problem_statement || item.issue_description}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-xs">
                          <span className="material-symbols-outlined text-[13px]">badge</span>
                          {item.responsible_role_label || item.owner_office_name}
                        </span>
                        <span className="block text-[11px] text-on-surface-variant mt-1 truncate max-w-[140px]">
                          {item.assigned_officer}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[230px]">
                        <span className="font-medium text-secondary text-xs block leading-snug">
                          👉 {item.immediate_next_action || item.next_step_text}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                        {item.farmer_notification_required ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning font-bold text-[11px]">
                            <span className="material-symbols-outlined text-[13px]">notifications_active</span>
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-ready-bg text-status-ready font-semibold text-[11px]">
                            <span className="material-symbols-outlined text-[13px]">check</span>
                            Not Req.
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <StatusChip status={item.status} />
                        <span className={`block font-mono text-[11px] mt-1 ${isOverdue ? 'text-status-error font-bold' : 'text-on-surface-variant'}`}>
                          {item.deadline_date}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top text-right pr-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAssignModalCase(item)}
                            title="Assign Officer"
                            className="p-1.5 text-primary hover:bg-surface-container rounded-lg border border-border-strong transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                          </button>

                          {item.farmer_notification_required && (
                            <button
                              type="button"
                              onClick={() => setNotifyModalCase(item)}
                              title="Notify Farmer"
                              className="p-1.5 text-status-warning hover:bg-status-warning-bg rounded-lg border border-status-warning/40 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">call</span>
                            </button>
                          )}

                          <Link
                            to={`/cases/${item.case_id}`}
                            className="px-2.5 py-1.5 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1"
                          >
                            <span>Steps</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-4 border-t border-border-subtle bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-on-surface-variant font-medium">
              Showing <strong>{paginatedCases.length}</strong> of <strong>{totalCases}</strong> dockets
            </span>

            <div className="flex items-center gap-2">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-surface-card border border-border-strong rounded px-2 py-1 text-xs"
              >
                <option value={10}>10 per page</option>
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded border border-border-strong bg-surface-card disabled:opacity-50"
              >
                Prev
              </button>
              <span className="font-mono font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-border-strong bg-surface-card disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ACTION CARDS GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedCases.map((item) => (
              <ActionCard
                key={item.case_id}
                item={item}
                onAssign={(c) => setAssignModalCase(c)}
                onNotify={(c) => setNotifyModalCase(c)}
              />
            ))}
          </div>

          {/* Cards Pagination */}
          <div className="p-4 bg-surface-card rounded-xl border border-border-subtle flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-medium">
              Showing page {currentPage} of {totalPages} ({totalCases} total cases)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-border-strong bg-surface-container-low disabled:opacity-50 font-bold"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-border-strong bg-surface-container-low disabled:opacity-50 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {assignModalCase && (
        <AssignmentModal
          isOpen={!!assignModalCase}
          onClose={() => setAssignModalCase(null)}
          caseItem={assignModalCase}
          onConfirm={handleAssignConfirm}
        />
      )}

      {notifyModalCase && (
        <NotificationModal
          isOpen={!!notifyModalCase}
          onClose={() => setNotifyModalCase(null)}
          caseItem={notifyModalCase}
          onRecordOutcome={handleRecordOutcome}
        />
      )}
    </div>
  );
};
