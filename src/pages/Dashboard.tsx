import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { StatCounter } from '../components/StatCounter';
import { StatusChip } from '../components/StatusChip';
import { ActionCard } from '../components/ActionCard';
import { AssignmentModal } from '../components/AssignmentModal';
import { NotificationModal } from '../components/NotificationModal';
import type { CaseRecord, Role, CallStatus } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { cases, reassignCase, logCallOutcome } = useAppStore();
  const { addToast } = useUIStore();

  const [activeCategory, setActiveCategory] = useState<'All' | 'NPCI' | 'EKYC' | 'Land' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);

  // Modals state
  const [assignModalCase, setAssignModalCase] = useState<CaseRecord | null>(null);
  const [notifyModalCase, setNotifyModalCase] = useState<CaseRecord | null>(null);

  // KPI Calculations according to Section 6
  const activeCases = useMemo(() => {
    return cases.filter((c) => c.status !== 'Resolved' && c.status !== 'Payment Confirmed' && c.status !== 'Ready');
  }, [cases]);

  const actionRequiredCount = useMemo(() => {
    return cases.filter((c) => c.status === 'Action Required' || c.status === 'Issue identified').length;
  }, [cases]);

  const awaitingExternalCount = useMemo(() => {
    return cases.filter(
      (c) =>
        c.status === 'Awaiting Department' ||
        c.status === 'Verification Required' ||
        c.status === 'Correction requested' ||
        c.status === 'Awaiting Farmer'
    ).length;
  }, [cases]);

  const overdueCount = useMemo(() => {
    return cases.filter((c) => c.days_open > 7 || c.is_overdue || c.status === 'Escalated').length;
  }, [cases]);

  // Filtered Priority Action Queue
  const filteredQueue = useMemo(() => {
    let list = activeCases;

    if (activeCategory === 'NPCI') {
      list = list.filter((c) => c.rule_code === 'R03' || c.rule_code === 'R04' || c.rule_code === 'R01');
    } else if (activeCategory === 'EKYC') {
      list = list.filter((c) => c.rule_code === 'R07');
    } else if (activeCategory === 'Land') {
      list = list.filter((c) => c.rule_code === 'R02' || c.rule_code === 'R11');
    } else if (activeCategory === 'Overdue') {
      list = list.filter((c) => c.days_open > 7 || c.is_overdue || c.status === 'Escalated');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.case_id.toLowerCase().includes(q) ||
          c.farmer_id.toLowerCase().includes(q) ||
          c.farmer_name_en.toLowerCase().includes(q) ||
          c.farmer_name_ml.includes(q) ||
          c.aadhaar_masked.toLowerCase().includes(q)
      );
    }

    // Sort by priority descending, then days open
    return list.sort((a, b) => b.priority - a.priority || b.days_open - a.days_open);
  }, [activeCases, activeCategory, searchQuery]);

  // Top 5 by default on Dashboard
  const displayItems = useMemo(() => {
    const start = (page - 1) * 5;
    return filteredQueue.slice(start, start + 5);
  }, [filteredQueue, page]);

  const totalPages = Math.ceil(filteredQueue.length / 5) || 1;

  const handleAssignConfirm = (caseId: string, role: Role, officeName: string, officerName: string, instructions: string) => {
    reassignCase(caseId, role, officeName, officerName, instructions);
    addToast({
      type: 'success',
      title: 'Docket Successfully Routed',
      message: `Case #${caseId} assigned to ${officeName} (${officerName}). SLA set to +7 days.`,
    });
  };

  const handleRecordOutcome = (caseId: string, outcome: CallStatus, notes: string) => {
    logCallOutcome(caseId, outcome, notes);
    addToast({
      type: 'info',
      title: 'Outreach Outcome Logged',
      message: `Outcome for Case #${caseId} recorded as: ${outcome}.`,
    });
  };

  return (
    <div className="flex flex-col w-full space-y-space-md pb-16">
      {/* Jurisdiction Breadcrumb & System State Bar */}
      <section className="bg-surface-card rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant flex-wrap">
            <span className="material-symbols-outlined text-[16px] text-primary">home</span>
            <span>Home</span>
            <span className="text-outline">/</span>
            <span>Kerala State Krishi Portal</span>
            <span className="text-outline">/</span>
            <span className="text-primary font-bold">Krishi Bhavan Thrissur Circle (തൃശ്ശൂർ)</span>
          </nav>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
              Action-Oriented DBT Issue Resolution Console
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-status-ready-bg text-status-ready border border-status-ready/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-ready animate-pulse" /> Live Operational
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Do not merely describe problems. Direct each responsible officer to the immediate next action required.
          </p>
        </div>

        {/* Quick Sync & View All Cases */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md rounded-lg shadow-sm transition-colors font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            <span>View All Cases ({cases.length})</span>
          </Link>
          <button
            type="button"
            onClick={() =>
              addToast({
                type: 'success',
                title: 'PFMS Feed Synchronized',
                message: 'Pulled latest morning batch. 0 new anomalies detected.',
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border-strong text-primary hover:bg-surface-container-low font-label-md text-label-md rounded-lg shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">sync</span>
            <span>Sync PFMS Feed (08:30 AM)</span>
          </button>
        </div>
      </section>

      {/* SECTION 6: 4 CORE KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm" aria-label="Key Action Metrics">
        <StatCounter
          title="Total Active Cases"
          value={activeCases.length}
          subtitle="Open DBT remediation dockets"
          color="primary"
          icon="assignment"
          badge="Actionable"
          badgeColor="bg-primary/10 text-primary"
        />
        <StatCounter
          title="Action Required"
          value={actionRequiredCount}
          subtitle="Immediate officer step pending"
          color="error"
          icon="error"
          badge="Immediate"
          badgeColor="bg-status-error-bg text-status-error"
        />
        <StatCounter
          title="Awaiting Verification"
          value={awaitingExternalCount}
          subtitle="Bank / Akshaya / Village Office"
          color="warning"
          icon="pending_actions"
          badge="In Progress"
          badgeColor="bg-status-warning-bg text-status-warning"
        />
        <StatCounter
          title="Overdue Follow-ups"
          value={overdueCount}
          subtitle="SLA > 7 days or escalated"
          color="warning"
          icon="warning"
          badge="SLA Breach"
          badgeColor="bg-status-error-bg text-status-error"
        />
      </section>

      {/* SECTION 6: FOLLOW-UP ALERTS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-surface-card rounded-xl p-4 border border-border-subtle shadow-xs">
        <div
          onClick={() => setActiveCategory('Overdue')}
          className="p-3 rounded-lg bg-status-error-bg/70 border border-status-error/30 hover:border-status-error cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-status-error">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Officer Tasks</span>
            <span className="material-symbols-outlined text-[18px]">alarm_off</span>
          </div>
          <div className="text-xl font-bold text-status-error mt-1">{overdueCount} cases</div>
          <span className="text-[11px] text-on-surface-variant block mt-0.5">Exceeded 7-day SLA window</span>
        </div>

        <div
          onClick={() => {
            setActiveCategory('All');
            setSearchQuery('');
          }}
          className="p-3 rounded-lg bg-status-warning-bg/70 border border-status-warning/30 hover:border-status-warning cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-status-warning">
            <span className="text-xs font-bold uppercase tracking-wider">Farmer Contact Required</span>
            <span className="material-symbols-outlined text-[18px]">contact_phone</span>
          </div>
          <div className="text-xl font-bold text-status-warning mt-1">
            {cases.filter((c) => c.farmer_notification_required && c.status !== 'Resolved').length} cases
          </div>
          <span className="text-[11px] text-on-surface-variant block mt-0.5">Beneficiary action needed</span>
        </div>

        <div
          onClick={() => setActiveCategory('NPCI')}
          className="p-3 rounded-lg bg-surface-container-low border border-border-strong hover:border-secondary cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-primary">
            <span className="text-xs font-bold uppercase tracking-wider">Waiting for Bank Response</span>
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
          </div>
          <div className="text-xl font-bold text-primary mt-1">
            {cases.filter((c) => c.owner_office_type === 'bank_branch' && c.status !== 'Resolved').length} cases
          </div>
          <span className="text-[11px] text-on-surface-variant block mt-0.5">NPCI / CBS mandate verification</span>
        </div>

        <div
          onClick={() => navigate('/revalidate')}
          className="p-3 rounded-lg bg-status-ready-bg/70 border border-status-ready/30 hover:border-status-ready cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-status-ready">
            <span className="text-xs font-bold uppercase tracking-wider">Revalidation Ready</span>
            <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
          </div>
          <div className="text-xl font-bold text-status-ready mt-1">
            {cases.filter((c) => c.status === 'Ready for Revalidation' || c.status === 'Correction reported').length} cases
          </div>
          <span className="text-[11px] text-on-surface-variant block mt-0.5">Proof submitted; ready to poll</span>
        </div>
      </section>

      {/* SECTION 6: PRIORITY ACTION QUEUE (TOP 5 URGENT CASES) */}
      <section className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        {/* Table & Queue Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-accent-saffron">bolt</span>
              <h2 className="font-title-lg text-title-lg font-bold text-primary">
                Priority Action Queue (Top Urgent Cases)
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Showing top actionable cases sorted by priority and urgency. Each entry tells you what is wrong, who owns it, and the immediate next action.
            </p>
          </div>

          {/* Search, Filter Pills & View Mode */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Search case, name, Aadhaar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-surface-container-low border border-border-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary w-48 sm:w-60"
              />
            </div>

            {/* Filter Categories */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-border-subtle text-xs">
              {(['All', 'NPCI', 'EKYC', 'Land', 'Overdue'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded font-bold transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-border-subtle">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${viewMode === 'table' ? 'bg-surface-card text-primary shadow-xs' : 'text-outline'}`}
                title="Table View"
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1 rounded ${viewMode === 'cards' ? 'bg-surface-card text-primary shadow-xs' : 'text-outline'}`}
                title="Action Cards View"
              >
                <span className="material-symbols-outlined text-[18px]">view_agenda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content View: Table vs Cards */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-border-subtle text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-3.5">Case & Beneficiary</th>
                  <th className="py-3 px-3">Issue & Problem Statement</th>
                  <th className="py-3 px-3">Responsible Owner</th>
                  <th className="py-3 px-3">Next Action Required</th>
                  <th className="py-3 px-3 text-center">Farmer Contact</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3 text-right">Primary Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/70 text-xs sm:text-sm">
                {displayItems.map((item) => {
                  const isOverdue = item.days_open > 7 || item.is_overdue;
                  return (
                    <tr
                      key={`${item.case_id}-${item.farmer_id}`}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      {/* Case & Beneficiary */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            #{item.case_id}
                          </span>
                          <StatusChip status={item.status} />
                        </div>
                        <div className="font-bold text-primary text-xs sm:text-sm">
                          {item.farmer_name_en}
                        </div>
                        <div className="font-['Noto_Sans_Malayalam'] text-xs text-on-surface-variant">
                          {item.farmer_name_ml}
                        </div>
                        <div className="font-mono text-[11px] text-outline mt-0.5">
                          {item.aadhaar_masked}
                        </div>
                      </td>

                      {/* Issue */}
                      <td className="py-3 px-3 align-top max-w-[220px]">
                        <span className="font-bold text-primary block text-xs">
                          {item.issue_title}
                        </span>
                        <span className="text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                          {item.problem_statement || item.issue_description}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 align-top">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-xs">
                          <span className="material-symbols-outlined text-[13px]">badge</span>
                          {item.responsible_role_label || item.owner_office_name}
                        </span>
                        <span className="block text-[11px] text-on-surface-variant mt-1 truncate max-w-[150px]">
                          {item.assigned_officer}
                        </span>
                      </td>

                      {/* Next Action */}
                      <td className="py-3 px-3 align-top max-w-[240px]">
                        <span className="font-medium text-secondary text-xs block leading-snug">
                          👉 {item.immediate_next_action || item.next_step_text}
                        </span>
                      </td>

                      {/* Farmer Contact */}
                      <td className="py-3 px-3 align-top text-center">
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

                      {/* Deadline */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className={`font-mono text-xs block font-bold ${isOverdue ? 'text-status-error' : 'text-on-surface'}`}>
                          {item.deadline_date || '23 Oct 2026'}
                        </span>
                        <span className={`text-[11px] block mt-0.5 ${isOverdue ? 'text-status-error font-bold' : 'text-on-surface-variant'}`}>
                          {isOverdue ? `⚠️ Overdue (${item.days_open}d)` : `Open ${item.days_open}d`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAssignModalCase(item)}
                            title="Assign / Reassign Officer"
                            className="p-1.5 text-primary hover:bg-surface-container rounded-lg transition-colors border border-border-strong"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                          </button>

                          {item.farmer_notification_required && (
                            <button
                              type="button"
                              onClick={() => setNotifyModalCase(item)}
                              title="Notify Farmer"
                              className="p-1.5 text-status-warning hover:bg-status-warning-bg rounded-lg transition-colors border border-status-warning/40"
                            >
                              <span className="material-symbols-outlined text-[16px]">call</span>
                            </button>
                          )}

                          <Link
                            to={`/cases/${item.case_id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-bold text-xs shadow-xs transition-colors"
                          >
                            <span>Open Workflow</span>
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
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayItems.map((item) => (
              <ActionCard
                key={`${item.case_id}-${item.farmer_id}`}
                item={item}
                onAssign={(c) => setAssignModalCase(c)}
                onNotify={(c) => setNotifyModalCase(c)}
              />
            ))}
          </div>
        )}

        {/* Footer: Pagination & Full Queue Link */}
        <div className="p-4 border-t border-border-subtle bg-surface-container-low/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant font-medium">
            Showing <strong>{displayItems.length}</strong> of <strong>{filteredQueue.length}</strong> prioritized urgent cases
          </div>

          <div className="flex items-center gap-3">
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2 py-1 rounded border border-border-strong bg-surface-card disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-2 font-mono font-bold">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 py-1 rounded border border-border-strong bg-surface-card disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            <Link
              to="/cases"
              className="px-4 py-1.5 bg-surface-card hover:bg-surface-container text-primary font-bold text-xs rounded-lg border border-border-strong shadow-xs flex items-center gap-1 transition-colors"
            >
              <span>Explore Master Case Queue (1,000)</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
        </div>
      </section>

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
