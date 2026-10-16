import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';

export const Home: React.FC = () => {
  const { farmers, diagnostics, auditLog } = useAppStore();
  const { language } = useUIStore();
  const isMl = language === 'ml';

  // Metrics calculation
  const stats = useMemo(() => {
    const total = farmers.length;
    let ready = 0;
    let issues = 0;
    let verify = 0;
    let pending = 0;

    farmers.forEach(f => {
      if (f.status === 'READY') ready++;
      else if (f.status === 'ISSUE_IDENTIFIED') issues++;
      else if (f.status === 'NEEDS_VERIFICATION') verify++;
      else if (f.status === 'PAYMENT_PENDING') pending++;
    });

    const issueDistribution: { [key: string]: number } = {};
    const localBodyDistribution: { [key: string]: number } = {};

    farmers.forEach(f => {
      const diag = diagnostics[f.farmer_id];
      if (f.status === 'ISSUE_IDENTIFIED' && diag && diag.rule_id) {
        issueDistribution[diag.title_en] = (issueDistribution[diag.title_en] || 0) + 1;
        const lb = f.local_body_name || f.local_body || 'Other';
        localBodyDistribution[lb] = (localBodyDistribution[lb] || 0) + 1;
      }
    });

    return {
      total,
      ready,
      issues,
      verify,
      pending,
      readyPct: total ? ((ready / total) * 100).toFixed(1) : '0',
      issuesPct: total ? ((issues / total) * 100).toFixed(1) : '0',
      verifyPct: total ? ((verify / total) * 100).toFixed(1) : '0',
      pendingPct: total ? ((pending / total) * 100).toFixed(1) : '0',
      issueDistribution,
      localBodyDistribution
    };
  }, [farmers, diagnostics]);

  // Circumference for Donut Chart (r=38 => C = 2 * PI * 38 ≈ 238.76)
  const C = 238.76;
  const readyLen = (stats.ready / (stats.total || 1)) * C;
  const issueLen = (stats.issues / (stats.total || 1)) * C;
  const verifyLen = (stats.verify / (stats.total || 1)) * C;
  const pendingLen = (stats.pending / (stats.total || 1)) * C;

  const issueOffset = -readyLen;
  const verifyOffset = -(readyLen + issueLen);
  const pendingOffset = -(readyLen + issueLen + verifyLen);

  // Issues by type ranked
  const issueList = [
    { title: 'Aadhaar not mapped to NPCI', count: 60, pct: '24%', bar: 100, color: 'bg-status-error' },
    { title: 'e-KYC Pending (Akshaya/Portal)', count: 50, pct: '20%', bar: 83.3, color: 'bg-accent-saffron' },
    { title: 'Land Seeding Pending (RoR)', count: 40, pct: '16%', bar: 66.6, color: 'bg-secondary' },
    { title: 'De-seeded / Inactive Aadhaar', count: 30, pct: '12%', bar: 50, color: 'bg-status-pending' },
    { title: 'Account Closed / Dormant', count: 30, pct: '12%', bar: 50, color: 'bg-status-error/80' },
    { title: 'Invalid IFSC (Bank Merge)', count: 20, pct: '8%', bar: 33.3, color: 'bg-secondary/70' },
    { title: 'Bank KYC Renewal Pending', count: 20, pct: '8%', bar: 33.3, color: 'bg-status-warning/70' }
  ];

  // Local bodies ranked
  const localBodies = [
    { name: 'Irinjalakuda (M)', count: 45, width: '100%' },
    { name: 'Kattoor', count: 38, width: '84.4%' },
    { name: 'Padiyur', count: 34, width: '75.5%' },
    { name: 'Muriyad', count: 31, width: '68.8%' },
    { name: 'Karalam', count: 28, width: '62.2%' },
    { name: 'Aloor', count: 26, width: '57.7%' },
    { name: 'Vellookkara', count: 25, width: '55.5%' },
    { name: 'Poomangalam', count: 23, width: '51.1%' }
  ];

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* BREADCRUMB & ADMINISTRATIVE DASHBOARD HEADER */}
      <div className="flex flex-col gap-space-xs bg-surface-card p-space-md rounded-lg shadow-sm border border-border-subtle">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant flex-wrap">
          <Link to="/home" className="hover:text-secondary flex items-center gap-1 text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[15px]">home</span>
            <span>{isMl ? 'ഹോം' : 'Home'}</span>
          </Link>
          <span className="text-border-strong text-xs">/</span>
          <span className="text-on-surface-variant">Kerala State Krishi Portal</span>
          <span className="text-border-strong text-xs">/</span>
          <span className="text-on-surface-variant">Thrissur District</span>
          <span className="text-border-strong text-xs">/</span>
          <span aria-current="page" className="text-primary font-bold">
            {isMl ? 'ഡാഷ്‌ബോർഡ് അവലോകനം' : 'DBT-GUARD Dashboard Home'}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-black flex items-center gap-2">
                <span>{isMl ? 'പി.എം. കിസാൻ ഡി.ബി.ടി നിലയും പരിഹാര അവലോകനവും' : 'PM-KISAN DBT Beneficiary Status & Remediation Overview'}</span>
                <span className="font-title-md text-title-md text-secondary font-semibold font-['Noto_Sans_Malayalam']">
                  (ഡാഷ്‌ബോർഡ്)
                </span>
              </h1>
              <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-label-sm font-bold uppercase tracking-wider">
                Cycle 24 Active
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Live analytical dashboard for Agricultural Extension Officers across Thrissur block panchayats · Krishi Bhavan West Circle
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap self-start lg:self-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-surface-card hover:bg-surface-container-low text-primary border border-border-strong px-space-md py-2 rounded-lg font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all focus:ring-2 focus:ring-secondary"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">refresh</span>
              <span>Refresh Feeds</span>
              <span className="text-[10px] bg-surface-container-high px-1.5 py-0.2 rounded font-mono text-on-surface-variant">
                Live
              </span>
            </button>
            <Link
              to="/cases"
              className="bg-primary-container hover:bg-primary text-on-primary px-space-md py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>Open Case Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* METRIC TILES BAND */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {/* Stat 1: Total Checked */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle border-t-4 border-t-primary shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
              {isMl ? 'പരിശോധിച്ച കർഷകർ' : 'Farmers Checked'}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-display-lg text-display-lg text-primary font-black tracking-tight leading-none">
              {stats.total.toLocaleString()}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Total audited in current cycle</p>
          </div>
          <div className="mt-space-sm pt-2 border-t border-border-subtle flex items-center justify-between text-label-sm">
            <span className="text-status-ready font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 100% Batched
            </span>
            <span className="text-on-surface-variant font-mono">Thrissur West</span>
          </div>
        </div>

        {/* Stat 2: Issues Identified */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle border-t-4 border-t-status-error shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-status-error uppercase tracking-wider font-bold">
              {isMl ? 'തടസ്സങ്ങൾ കണ്ടെത്തി' : 'Issues Identified'}
            </span>
            <div className="w-8 h-8 rounded-full bg-status-error-bg flex items-center justify-center text-status-error">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-display-lg text-display-lg text-status-error font-black tracking-tight leading-none">
              {stats.issues.toLocaleString()}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Immediate intervention needed</p>
          </div>
          <div className="mt-space-sm pt-2 border-t border-border-subtle flex items-center justify-between text-label-sm">
            <span className="text-status-error font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">warning</span> {stats.issuesPct}% Rejection Rate
            </span>
            <Link to="/cases?status=ISSUE_IDENTIFIED" className="text-secondary hover:underline font-bold">
              Triage →
            </Link>
          </div>
        </div>

        {/* Stat 3: Needs Verification */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle border-t-4 border-t-status-warning shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-disclaimer-banner-text uppercase tracking-wider font-bold">
              {isMl ? 'പരിശോധന വേണം' : 'Needs Verification'}
            </span>
            <div className="w-8 h-8 rounded-full bg-status-warning-bg flex items-center justify-center text-status-warning">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-display-lg text-display-lg text-disclaimer-banner-text font-black tracking-tight leading-none">
              {stats.verify.toLocaleString()}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Document / biometric re-check</p>
          </div>
          <div className="mt-space-sm pt-2 border-t border-border-subtle flex items-center justify-between text-label-sm">
            <span className="text-status-warning font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Akshaya Queue
            </span>
            <span className="text-on-surface-variant font-mono">{stats.verifyPct}%</span>
          </div>
        </div>

        {/* Stat 4: Payment Pending */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle border-t-4 border-t-status-pending shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
              {isMl ? 'പേയ്‌മെന്റ് ബാക്കി' : 'Payment Pending'}
            </span>
            <div className="w-8 h-8 rounded-full bg-status-pending-bg flex items-center justify-center text-status-pending">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-display-lg text-display-lg text-on-surface font-black tracking-tight leading-none">
              {stats.pending.toLocaleString()}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Awaiting bank credit advice</p>
          </div>
          <div className="mt-space-sm pt-2 border-t border-border-subtle flex items-center justify-between text-label-sm">
            <span className="text-on-surface-variant font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> NPCI In-Flight
            </span>
            <span className="text-on-surface-variant font-mono">{stats.pendingPct}%</span>
          </div>
        </div>

        {/* Stat 5: Calls Made Today */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle border-t-4 border-t-accent-green shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-status-ready uppercase tracking-wider font-bold">
              {isMl ? 'മലയാളം ഐ.വി.ആർ' : 'Malayalam IVR Dispatched'}
            </span>
            <div className="w-8 h-8 rounded-full bg-status-ready-bg flex items-center justify-center text-status-ready">
              <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-display-lg text-display-lg text-status-ready font-black tracking-tight leading-none">
              48
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Dialed today via Voice Assist</p>
          </div>
          <div className="mt-space-sm pt-2 border-t border-border-subtle flex items-center justify-between text-label-sm">
            <span className="text-status-ready font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">phone_in_talk</span> 89% Connected
            </span>
            <Link to="/voice/KL-TSR-0001" className="text-secondary hover:underline font-bold">
              Voice →
            </Link>
          </div>
        </div>
      </div>

      {/* 3-COLUMN ANALYTICS CARD GRID (EQUAL HEIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
        {/* COL 1: Status Distribution (Donut Chart) */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle">
              <div className="flex flex-col">
                <h2 className="font-title-md text-title-md text-primary font-bold">
                  {isMl ? 'ഗുണഭോക്തൃ സ്ഥിതി' : 'Status Distribution'}
                </h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-['Noto_Sans_Malayalam']">
                  ഗുണഭോക്തൃ സ്ഥിതി വിശകലനം
                </span>
              </div>
              <span className="bg-surface-container-high px-2 py-0.5 rounded text-label-sm font-mono text-on-surface font-bold">
                4 Statuses
              </span>
            </div>

            {/* Donut Vector Chart Container */}
            <div className="relative flex items-center justify-center py-space-md">
              <svg aria-label="Status Donut Chart" className="w-44 h-44 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="#E5E7EB" strokeWidth="12" />
                {/* Ready Segment */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#138808"
                  strokeDasharray={`${readyLen} ${C}`}
                  strokeDashoffset="0"
                  strokeWidth="12"
                />
                {/* Issue Segment */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#DC2626"
                  strokeDasharray={`${issueLen} ${C}`}
                  strokeDashoffset={issueOffset}
                  strokeWidth="12"
                />
                {/* Verify Segment */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#D97706"
                  strokeDasharray={`${verifyLen} ${C}`}
                  strokeDashoffset={verifyOffset}
                  strokeWidth="12"
                />
                {/* Pending Segment */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#6B7280"
                  strokeDasharray={`${pendingLen} ${C}`}
                  strokeDashoffset={pendingOffset}
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-display-lg text-headline-lg font-black text-primary leading-tight">
                  {stats.total.toLocaleString()}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Farmers
                </span>
              </div>
            </div>

            {/* Legend Stack */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-status-ready flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Ready / തയ്യാറാണ്
                    </span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">
                      Clean validation, ready for DBT
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-md text-label-md font-bold text-status-ready">{stats.ready}</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant block">{stats.readyPct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-status-error flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Issue Identified / പ്രശ്നം കണ്ടെത്തി
                    </span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">
                      Critical roadblock, payment stopped
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-md text-label-md font-bold text-status-error">{stats.issues}</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant block">{stats.issuesPct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-status-warning flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Needs Verification / പരിശോധന
                    </span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">
                      Discrepancy in biometric or RoR
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-md text-label-md font-bold text-disclaimer-banner-text">{stats.verify}</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant block">{stats.verifyPct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-status-pending flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Payment Pending / പേയ്‌മെന്റ് ബാക്കി
                    </span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">
                      Bank credit advice in progress
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-md text-label-md font-bold text-on-surface">{stats.pending}</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant block">{stats.pendingPct}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-space-sm mt-space-xs border-t border-border-subtle flex justify-between items-center text-label-sm">
            <span className="text-on-surface-variant">Source: PFMS Gateway v4.2</span>
            <Link to="/cases" className="text-secondary font-bold hover:underline flex items-center gap-0.5">
              Filter Cohort →
            </Link>
          </div>
        </div>

        {/* COL 2: Issues by Type (Horizontal Bar Chart) */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle">
              <div className="flex flex-col">
                <h2 className="font-title-md text-title-md text-primary font-bold">
                  {isMl ? 'തകരാറുകളുടെ തരം' : 'Issues by Type'}
                </h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-['Noto_Sans_Malayalam']">
                  തകരാറുകളുടെ തരം തിരിച്ചുള്ള പട്ടിക
                </span>
              </div>
              <span className="bg-status-error-bg text-status-error px-2 py-0.5 rounded text-label-sm font-bold">
                {stats.issues} Faults
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 mb-3">
              Categorized bottlenecks causing rejection at PFMS or NPCI clearinghouse:
            </p>

            <div className="flex flex-col gap-2.5">
              {issueList.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-bold flex items-center gap-1">
                      <span className="text-status-error font-mono font-black">#{idx + 1}</span> {item.title}
                    </span>
                    <span className="text-status-error font-bold font-mono">
                      {item.count} cases ({item.pct})
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-space-sm mt-space-xs border-t border-border-subtle flex justify-between items-center text-label-sm">
            <span className="text-on-surface-variant">Top Fault: NPCI Mapper (44% total)</span>
            <Link to="/voice/KL-TSR-0001" className="text-secondary font-bold hover:underline flex items-center gap-0.5">
              Automate IVR Alert →
            </Link>
          </div>
        </div>

        {/* COL 3: Issues by Local Body (Panchayat / Municipality) */}
        <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle">
              <div className="flex flex-col">
                <h2 className="font-title-md text-title-md text-primary font-bold">
                  {isMl ? 'തദ്ദേശ സ്ഥാപനം തിരിച്ച്' : 'Issues by Local Body'}
                </h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-['Noto_Sans_Malayalam']">
                  പഞ്ചായത്ത് / മുനിസിപ്പാലിറ്റി തിരിച്ച്
                </span>
              </div>
              <span className="bg-surface-container-high px-2 py-0.5 rounded text-label-sm font-mono text-on-surface font-bold">
                8 Blocks
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 mb-3">
              Geographic concentration across Thrissur South &amp; West administrative blocks:
            </p>

            <div className="flex flex-col gap-2">
              {localBodies.map((b, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-1 rounded hover:bg-surface-container-low transition-colors">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold w-28 truncate">
                    {b.name}
                  </span>
                  <div className="flex-1 bg-surface-container-high rounded h-3 overflow-hidden">
                    <div className="bg-primary-container h-3 rounded" style={{ width: b.width }} />
                  </div>
                  <span className="font-mono text-label-sm font-bold text-primary w-8 text-right">
                    {b.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-space-sm mt-space-xs border-t border-border-subtle flex justify-between items-center text-label-sm">
            <span className="text-on-surface-variant">Highest: Irinjalakuda Block</span>
            <Link to="/tasks" className="text-secondary font-bold hover:underline flex items-center gap-0.5">
              Dispatch Camp →
            </Link>
          </div>
        </div>
      </div>

      {/* INSTALMENT TIMELINE STRIP */}
      <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle shadow-sm flex flex-col gap-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-space-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-secondary-container text-on-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timeline</span>
            </div>
            <div className="flex flex-col">
              <h2 className="font-title-md text-title-md text-primary font-bold">
                PM-KISAN Instalment Disbursement &amp; Reconciliation Milestones
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-['Noto_Sans_Malayalam']">
                ഗഡു വിതരണ ടൈംലൈൻ
              </span>
            </div>
          </div>
          <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface px-2.5 py-1 rounded font-mono font-bold">
            FY 2025–26 Schedule
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md pt-space-xs relative">
          {/* Step 1 */}
          <div className="flex flex-col bg-surface-container-low/50 p-space-sm rounded-lg border border-border-subtle relative">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-status-ready-bg text-status-ready border border-status-ready/30 font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span> Credited
              </span>
              <span className="font-mono text-label-sm font-bold text-on-surface">₹2,000 / Farmer</span>
            </div>
            <h3 className="font-title-md text-title-md text-primary font-bold">21st Instalment</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span> 19 Nov 2025
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Reconciled with 99.4% success across Thrissur District. Residual 0.6% resolved via Akshaya special camp.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col bg-surface-container-low/50 p-space-sm rounded-lg border border-border-subtle relative">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-status-ready-bg text-status-ready border border-status-ready/30 font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span> Cleared
              </span>
              <span className="font-mono text-label-sm font-bold text-on-surface">₹2,000 / Farmer</span>
            </div>
            <h3 className="font-title-md text-title-md text-primary font-bold">22nd Instalment</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span> 13 Mar 2026
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              State treasury PFMS clearinghouse batch clearance. Over 22.8 lakh beneficiary accounts credited statewide.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col bg-surface-container-low/50 p-space-sm rounded-lg border border-border-subtle relative">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-status-ready-bg text-status-ready border border-status-ready/30 font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span> Disbursed
              </span>
              <span className="font-mono text-label-sm font-bold text-on-surface">₹2,000 / Farmer</span>
            </div>
            <h3 className="font-title-md text-title-md text-primary font-bold">23rd Instalment</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span> 20 Jun 2026
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              1,000 pilot cohort tracked under DBT-GUARD beta. Identified initial 250 failure anomalies.
            </p>
          </div>

          {/* Step 4: Active */}
          <div className="flex flex-col bg-status-warning-bg/40 p-space-sm rounded-lg border-2 border-accent-saffron relative shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-accent-saffron text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] animate-spin">sync</span> In Remediation
              </span>
              <span className="font-mono text-label-sm font-bold text-status-error">Active Target</span>
            </div>
            <h3 className="font-title-md text-title-md text-primary font-black">24th Instalment (Active)</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px] text-accent-saffron">event_upcoming</span> Target: Oct 2026
            </p>
            <p className="font-body-sm text-body-sm text-on-surface mt-2 font-medium">
              Remediation window open for {stats.issues} stalled cases. Automated IVR Malayalam calls and bank camp coordination underway.
            </p>
          </div>
        </div>
      </div>

      {/* LOWER WORKSPACE: ACTIVITY FEED & SPOTLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT COLUMN: Recent Activity Feed */}
        <div className="lg:col-span-7 bg-surface-card rounded-lg p-space-md border border-border-subtle shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-space-xs mb-space-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                </div>
                <div>
                  <h2 className="font-title-md text-title-md text-primary font-bold">
                    {isMl ? 'അവസാന പ്രവർത്തനങ്ങൾ' : 'Recent Remediation Activity Feed'}
                  </h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-['Noto_Sans_Malayalam']">
                    തത്സമയ ലോഗ്
                  </span>
                </div>
              </div>
              <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-ready animate-ping" /> Real-time
              </span>
            </div>

            <div className="flex flex-col divide-y divide-border-subtle">
              {auditLog.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="py-space-sm flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-status-ready-bg text-status-ready flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {entry.action.includes('CALL') ? 'phone_in_talk' : entry.action.includes('PROOF') ? 'task_alt' : 'verified'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-label-md text-label-md text-primary font-bold">{entry.action}</span>
                      <span className="font-mono text-label-sm text-on-surface-variant">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface mt-0.5">{entry.details}</p>
                    <div className="flex items-center gap-2 mt-1.5 font-label-sm text-[11px] text-on-surface-variant">
                      <span className="bg-surface-container-high px-1.5 py-0.2 rounded font-mono">
                        {entry.farmer_id}
                      </span>
                      <span>By: {entry.officer_name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-space-md border-t border-border-subtle flex flex-wrap items-center justify-between gap-space-sm">
            <Link
              to="/escalations"
              className="bg-surface-container-high hover:bg-surface-variant text-primary font-label-md text-label-md px-space-md py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>View Comprehensive Audit Log</span>
            </Link>
            <Link
              to="/cases"
              className="text-secondary hover:text-primary font-label-md text-label-md font-bold flex items-center gap-1"
            >
              <span>View All Cases</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Empirical Evidence & State Context */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-card rounded-lg p-space-md border border-border-subtle shadow-sm flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between border-b border-border-subtle pb-space-xs mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-accent-saffron/20 text-accent-saffron flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">policy</span>
                  </div>
                  <div>
                    <h2 className="font-title-md text-title-md text-primary font-bold">
                      Thrissur Pilot Remediation Impact
                    </h2>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-['Noto_Sans_Malayalam']">
                      തത്സമയ വിശകലനം
                    </span>
                  </div>
                </div>
                <span className="bg-status-ready-bg text-status-ready font-label-sm px-2 py-0.5 rounded font-bold">
                  Target: 95%
                </span>
              </div>

              <div className="space-y-3 font-body-sm text-body-sm text-on-surface">
                <p>
                  <strong>DBT-GUARD</strong> proactively intercepts payment failures prior to PFMS clearinghouse batch submission.
                </p>
                <div className="p-3 bg-surface-container-low rounded-lg border border-border-subtle space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Active Beneficiaries</span>
                    <span className="font-mono font-bold text-primary">1,000 farmers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Eligible Corpus @ ₹2,000</span>
                    <span className="font-mono font-bold text-primary">₹20,00,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">At-Risk Value (250 cases)</span>
                    <span className="font-mono font-bold text-status-error">₹5,00,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Resolved via Desk Triage</span>
                    <span className="font-mono font-bold text-status-ready">
                      ₹{(stats.ready * 2000).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-status-warning-bg/40 rounded-lg border border-status-warning/30">
                  <h4 className="font-bold text-disclaimer-banner-text flex items-center gap-1 text-label-md">
                    <span className="material-symbols-outlined text-[16px]">campaign</span>
                    Key Takeaway for Agriculture Officers:
                  </h4>
                  <p className="text-xs text-on-surface mt-1">
                    44% of payment stops in Thrissur South are attributable to bank Aadhaar unmapping or account dormancy. Directing farmers with pre-filled NPCI mandate slips cuts resolution time from 42 days to 72 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-label-sm">
              <span className="text-on-surface-variant">Lead Bank Desk: SBI Irinjalakuda</span>
              <Link to="/tasks" className="text-secondary font-bold hover:underline">
                View My Tasks →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
