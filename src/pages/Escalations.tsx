import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';

export const Escalations: React.FC = () => {
  const { farmers, diagnostics, auditLog } = useAppStore();
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

  const [activeTab, setActiveTab] = useState<'overdue' | 'audit'>('overdue');
  const [searchFilter, setSearchFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState<'ALL' | 'LEAD_BANK' | 'AKSHAYA' | 'VILLAGE_OFFICE'>('ALL');

  // Overdue cases (simulated overdue > 7 days from ISSUE_IDENTIFIED cohort)
  const overdueFarmers = useMemo(() => {
    return farmers.filter(f => {
      if (f.status !== 'ISSUE_IDENTIFIED') return false;
      const diag = diagnostics[f.farmer_id];
      if (agencyFilter !== 'ALL' && diag?.action_agency !== agencyFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return f.name_en.toLowerCase().includes(q) || f.farmer_id.toLowerCase().includes(q) || (f.phone || '').includes(q);
      }
      return true;
    });
  }, [farmers, diagnostics, agencyFilter, searchFilter]);

  // Group by agency
  const sbiOverdue = useMemo(() => overdueFarmers.filter(f => diagnostics[f.farmer_id]?.action_agency === 'LEAD_BANK' || !diagnostics[f.farmer_id]?.action_agency), [overdueFarmers, diagnostics]);
  const akshayaOverdue = useMemo(() => overdueFarmers.filter(f => diagnostics[f.farmer_id]?.action_agency === 'AKSHAYA'), [overdueFarmers, diagnostics]);
  const villageOverdue = useMemo(() => overdueFarmers.filter(f => diagnostics[f.farmer_id]?.action_agency === 'VILLAGE_OFFICE'), [overdueFarmers, diagnostics]);

  const handleIssueNotice = (caseId: string) => {
    addToast(isMl ? `നോട്ടീസ് അയച്ചു: #${caseId}` : `Apex Collector Notice issued for #${caseId}`, 'warning');
  };

  const handleIssueSummons = () => {
    addToast(isMl ? 'എൽ.ഡി.എം സമ്മൻസ് പുറപ്പെടുവിച്ചു' : 'Apex Summons transmitted to Lead District Manager & Branch Heads', 'error');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top District Officer Summary & Scope Banner */}
      <section className="bg-surface-card rounded-xl p-space-lg shadow-sm mb-space-lg border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">gavel</span>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <h1 className="font-headline-lg text-headline-lg text-primary font-bold">
                  Dr. Latha V
                </h1>
                <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  District Apex Authority
                </span>
                <span className="bg-status-error-bg text-status-error font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-error animate-ping" />
                  SLA Strict Enforcement Mode
                </span>
              </div>
              <p className="font-title-md text-title-md text-secondary font-semibold mt-0.5">
                Joint Director of Agriculture &amp; District DBT Nodal Officer, Thrissur Collectorate
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">location_city</span>
                  <strong>Jurisdiction:</strong> Thrissur District (16 Blocks · 86 Grama Panchayats · 94 Krishi Bhavans)
                </span>
                <span className="text-outline">·</span>
                <span className="font-data-mono text-data-mono text-primary font-semibold">
                  SLBC Order #2026/AGRI-DBT/44
                </span>
              </div>
            </div>
          </div>

          {/* Apex Actions */}
          <div className="flex flex-wrap items-center gap-space-sm self-start lg:self-auto">
            <button
              onClick={() => addToast('District telemetry refreshed from PFMS gateway', 'info')}
              className="bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md px-3.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Refresh Telemetry</span>
            </button>
            <button
              onClick={handleIssueSummons}
              className="bg-status-error text-on-primary hover:bg-status-error/90 font-label-md text-label-md px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm font-bold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">send_time_extension</span>
              <span>Send Apex Summons</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip for Overdue Cases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-md border-t border-border-subtle">
          <div className="bg-status-error-bg/70 rounded-lg p-space-md flex flex-col justify-between border border-status-error/20">
            <div className="flex items-center justify-between text-status-error mb-1">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">Total Overdue (&gt; 7 Days)</span>
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg font-black text-status-error">58</span>
              <span className="font-title-md text-title-md font-semibold text-status-error">Dockets</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="bg-status-error text-on-error font-label-sm text-label-sm px-2 py-0.5 rounded font-bold">
                Urgent Action Required
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between border border-border-subtle">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">Blocked DBT Corpus</span>
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display-lg text-display-lg font-black text-primary">₹1,16,000</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              58 beneficiaries × ₹2,000 stalled instalments
            </p>
          </div>

          <div className="bg-status-warning-bg/70 rounded-lg p-space-md flex flex-col justify-between border border-status-warning/30">
            <div className="flex items-center justify-between text-disclaimer-banner-text mb-1">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">Lead Agency in Default</span>
              <span className="material-symbols-outlined text-[20px]">domain_disabled</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">State Bank of India</span>
              <span className="font-body-sm text-body-sm font-bold text-status-warning">26 Cases in Default (44.8%)</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Irinjalakuda Circle Cluster Lead
            </p>
          </div>

          <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between border border-border-subtle">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">Avg. Overdue Duration</span>
              <span className="material-symbols-outlined text-[20px]">timer_off</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg font-black text-primary">11.4</span>
              <span className="font-title-md text-title-md font-semibold text-on-surface-variant">Days</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant">Target SLA: ≤ 3 Days</span>
              <span className="text-status-error font-bold font-label-sm text-label-sm">+8.4d Deviation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tab Bar */}
      <div className="bg-surface-card rounded-t-xl px-space-md pt-2 flex items-center gap-space-xs shadow-sm border-b border-border-subtle">
        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-space-md py-3 font-label-lg text-label-lg font-bold rounded-t-lg transition-colors relative ${
            activeTab === 'overdue' ? 'text-primary bg-surface-container-low' : 'text-on-surface-variant hover:text-primary'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-status-error">notifications_active</span>
          <span>Overdue Cases by Office &amp; Issue</span>
          <span className="bg-status-error text-on-error font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold ml-1">58</span>
          {activeTab === 'overdue' && <span className="absolute bottom-0 left-0 right-0 h-1 bg-accent-saffron rounded-t" />}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-space-md py-3 font-label-lg text-label-lg font-medium rounded-t-lg transition-colors relative ${
            activeTab === 'audit' ? 'text-primary bg-surface-container-low font-bold' : 'text-on-surface-variant hover:text-primary'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Audit Trail &amp; Compliance Log</span>
          <span className="bg-surface-container-high text-on-surface font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold ml-1">
            {auditLog.length} Records
          </span>
          {activeTab === 'audit' && <span className="absolute bottom-0 left-0 right-0 h-1 bg-accent-saffron rounded-t" />}
        </button>
      </div>

      {/* TAB 1: Overdue Cases by Office and by Issue */}
      {activeTab === 'overdue' && (
        <div className="flex flex-col w-full bg-surface-card rounded-b-xl p-space-md shadow-sm mb-space-lg border border-border-subtle">
          {/* Controls Bar */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-md border border-border-subtle">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Filter Agency:</span>
              <div className="inline-flex rounded-lg bg-surface-card p-1 shadow-xs border border-border-subtle">
                <button
                  onClick={() => setAgencyFilter('ALL')}
                  className={`px-3 py-1 font-label-sm text-label-sm font-bold rounded-md transition-colors ${
                    agencyFilter === 'ALL' ? 'bg-primary text-on-primary' : 'text-on-surface'
                  }`}
                  type="button"
                >
                  All Agencies
                </button>
                <button
                  onClick={() => setAgencyFilter('LEAD_BANK')}
                  className={`px-3 py-1 font-label-sm text-label-sm font-bold rounded-md transition-colors ${
                    agencyFilter === 'LEAD_BANK' ? 'bg-primary text-on-primary' : 'text-on-surface'
                  }`}
                  type="button"
                >
                  Banks
                </button>
                <button
                  onClick={() => setAgencyFilter('AKSHAYA')}
                  className={`px-3 py-1 font-label-sm text-label-sm font-bold rounded-md transition-colors ${
                    agencyFilter === 'AKSHAYA' ? 'bg-primary text-on-primary' : 'text-on-surface'
                  }`}
                  type="button"
                >
                  Akshaya
                </button>
                <button
                  onClick={() => setAgencyFilter('VILLAGE_OFFICE')}
                  className={`px-3 py-1 font-label-sm text-label-sm font-bold rounded-md transition-colors ${
                    agencyFilter === 'VILLAGE_OFFICE' ? 'bg-primary text-on-primary' : 'text-on-surface'
                  }`}
                  type="button"
                >
                  Revenue
                </button>
              </div>

              <div className="relative flex-1 sm:w-72">
                <span className="material-symbols-outlined text-outline absolute left-3 top-2.5 text-[18px]">search</span>
                <input
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filter by Case ID / Beneficiary..."
                  type="text"
                  className="w-full pl-9 pr-3 py-2 bg-surface-card text-on-surface font-body-sm text-body-sm rounded-lg border border-border-subtle focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* GROUP 1: Banking Lead Bank Jurisdiction (SBI) */}
          {(agencyFilter === 'ALL' || agencyFilter === 'LEAD_BANK') && (
            <div className="rounded-xl overflow-hidden mb-space-lg bg-surface-card border border-border-subtle shadow-sm">
              <div className="bg-primary text-on-primary px-space-md py-3 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-accent-saffron">account_balance</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold">State Bank of India — Irinjalakuda Circle</span>
                      <span className="bg-status-error text-on-error font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                        Level 2 SLA Triggered
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-primary/80">
                      Lead District Bank Jurisdiction · Lead District Manager: Suresh Menon
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-md">
                  <span className="font-label-md text-label-md bg-primary-container px-2.5 py-1 rounded text-on-primary">
                    <strong>{sbiOverdue.length} Cases</strong>
                  </span>
                  <button
                    onClick={handleIssueSummons}
                    className="bg-accent-saffron text-primary font-label-sm text-label-sm font-bold px-3 py-1 rounded hover:bg-accent-saffron/90 transition-colors flex items-center gap-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    <span>Issue Lead Summons</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-space-md">Case ID</th>
                      <th className="py-3 px-space-md">Farmer / Beneficiary</th>
                      <th className="py-3 px-space-md">Failure Issue (Code)</th>
                      <th className="py-3 px-space-md">Days Overdue</th>
                      <th className="py-3 px-space-md">Assigned Officer / Desk</th>
                      <th className="py-3 px-space-md">Current Bottleneck</th>
                      <th className="py-3 px-space-md text-right">Nodal Directives</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-on-surface">
                    {sbiOverdue.slice(0, 5).map((f, i) => {
                      const cCode = f.farmer_id === 'KL-TSR-0001' ? 'K104' : `K${104 + i}`;
                      const diagF = diagnostics[f.farmer_id];
                      return (
                        <tr key={f.farmer_id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-3 px-space-md font-data-mono font-bold text-primary whitespace-nowrap">
                            #{cCode}
                          </td>
                          <td className="py-3 px-space-md">
                            <div className="flex flex-col">
                              <span className="font-title-sm font-bold text-on-surface">{f.name_en} ({f.name_ml})</span>
                              <span className="font-data-mono text-[11px] text-on-surface-variant">Adh: {f.aadhaar_masked} · A/C: {f.account_no_masked}</span>
                            </div>
                          </td>
                          <td className="py-3 px-space-md">
                            <span className="font-bold text-status-error flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">link_off</span>
                              {diagF?.title_en || 'Aadhaar not mapped NPCI'}
                            </span>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">Code: {diagF?.rule_id || 'R03'}</span>
                          </td>
                          <td className="py-3 px-space-md whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 bg-status-error text-on-error font-label-md text-label-md px-2.5 py-1 rounded-full font-bold shadow-xs">
                              <span className="material-symbols-outlined text-[14px]">error</span>
                              {9 + i} Days Overdue
                            </span>
                          </td>
                          <td className="py-3 px-space-md">
                            <span className="font-bold text-on-surface">Suresh Menon</span>
                            <span className="block text-on-surface-variant text-[11px]">{f.bank_name}</span>
                          </td>
                          <td className="py-3 px-space-md">
                            <div className="bg-status-warning-bg/80 text-disclaimer-banner-text p-2 rounded text-[12px] max-w-xs leading-snug">
                              Overdue for Annexure-I confirmation slip upload
                            </div>
                          </td>
                          <td className="py-3 px-space-md text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleIssueNotice(cCode)}
                                className="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm px-2.5 py-1.5 rounded transition-colors"
                                type="button"
                              >
                                Notice
                              </button>
                              <Link
                                to={`/cases/${f.farmer_id}`}
                                className="bg-surface-container-high hover:bg-surface-variant text-primary font-label-sm text-label-sm px-2.5 py-1.5 rounded transition-colors font-bold"
                              >
                                Dossier #{cCode}
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GROUP 2: Akshaya Kendra Desk */}
          {(agencyFilter === 'ALL' || agencyFilter === 'AKSHAYA') && (
            <div className="rounded-xl overflow-hidden mb-space-lg bg-surface-card border border-border-subtle shadow-sm">
              <div className="bg-secondary text-on-primary px-space-md py-3 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-accent-saffron">fingerprint</span>
                  </div>
                  <div>
                    <span className="font-title-md text-title-md font-bold">Akshaya e-Kendras — Thrissur District</span>
                    <p className="font-body-sm text-body-sm text-on-primary/80">Biometric e-KYC Renewal &amp; Demographics Verification</p>
                  </div>
                </div>
                <span className="font-label-md text-label-md bg-secondary-container text-on-secondary-fixed px-2.5 py-1 rounded font-bold">
                  {akshayaOverdue.length} Cases
                </span>
              </div>

              <div className="p-4 text-sm text-on-surface-variant">
                Showing {akshayaOverdue.length} pending biometric verification tasks routed to Akshaya District Project Coordinator.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Comprehensive Audit Trail & Compliance Log */}
      {activeTab === 'audit' && (
        <div className="flex flex-col w-full bg-surface-card rounded-b-xl p-space-md shadow-sm mb-space-lg border border-border-subtle">
          <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-border-subtle">
            <div>
              <h2 className="font-title-lg text-title-lg text-primary font-bold">Immutable System Audit Trail</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Full chronological ledger of triage directives, IVR calls, proof submissions, and simulated validations.
              </p>
            </div>
            <button
              onClick={() => addToast('Audit trail exported to encrypted audit log CSV', 'success')}
              className="bg-primary text-on-primary px-3 py-1.5 rounded font-label-md text-label-md flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Audit Log</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm divide-y divide-border-subtle">
              <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface uppercase">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Beneficiary</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Officer / Desk</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-body-sm">
                {auditLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-primary whitespace-nowrap">
                      {log.farmer_id}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="bg-surface-container-high text-primary px-2 py-0.5 rounded font-mono text-xs font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {log.officer_name}
                    </td>
                    <td className="py-2.5 px-3 text-on-surface-variant">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
