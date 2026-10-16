import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';

export const Revalidate: React.FC = () => {
  const { farmers, diagnostics, revalidateBatch, simulateFreshResults } = useAppStore();
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('16 Oct 2026, 11:30 IST');

  // Count reported cases waiting for revalidation
  const reportedCases = farmers.filter(f => f.stage === 'PROOF_UPLOADED' || f.stage === 'ACTION_IN_PROGRESS');

  const handleSimulateFreshResults = () => {
    setIsProcessing(true);
    setTimeout(() => {
      simulateFreshResults();
      setIsProcessing(false);
      setLastCheckTime(new Date().toLocaleTimeString());
      addToast(
        isMl
          ? 'പുതിയ ബാച്ച് ഫലങ്ങൾ സിമുലേറ്റ് ചെയ്തു: തിരുത്തൽ വരുത്തിയ കേസുകൾ ക്ലിയർ ചെയ്തു'
          : 'Fresh NPCI clearinghouse results simulated: Verified cases passed validation and marked Ready/Credited!',
        'success'
      );
    }, 1200);
  };

  const handleRevalidateBatch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      revalidateBatch();
      setIsProcessing(false);
      setLastCheckTime(new Date().toLocaleTimeString());
      addToast('NPCI Mapper & PFMS batch verification poll completed', 'info');
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-space-md">
        <ol className="flex items-center flex-wrap gap-1.5 font-label-md text-label-md text-on-surface-variant">
          <li>
            <Link to="/home" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>{isMl ? 'ഹോം' : 'Home'}</span>
            </Link>
          </li>
          <li className="text-outline">/</li>
          <li aria-current="page" className="text-primary font-bold">
            Revalidate &amp; NPCI Check (പുനഃപരിശോധന)
          </li>
        </ol>
      </nav>

      {/* Header */}
      <section className="bg-surface-card rounded-xl p-space-lg shadow-sm mb-space-lg border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-saffron text-3xl">fact_check</span>
              <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                NPCI Central Mapper &amp; PFMS Clearinghouse Revalidation
              </h1>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Poll live clearinghouse queues, execute automated bi-directional status checks, and release disbursements for verified beneficiaries.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRevalidateBatch}
              disabled={isProcessing}
              className="bg-surface-container-high hover:bg-surface-variant text-primary font-label-md text-label-md px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm font-bold disabled:opacity-50"
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${isProcessing ? 'animate-spin' : ''}`}>sync</span>
              <span>Poll NPCI Queue</span>
            </button>

            <button
              onClick={handleSimulateFreshResults}
              disabled={isProcessing}
              className="bg-status-ready text-on-primary hover:bg-status-ready/90 font-label-md text-label-md px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm font-black disabled:opacity-50"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span>Simulate Fresh Results (പുതിയ ഫലങ്ങൾ)</span>
            </button>
          </div>
        </div>

        {/* Live Status Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-lg pt-space-md border-t border-border-subtle">
          <div className="bg-surface-container-low p-space-sm rounded-lg border border-border-subtle">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase font-bold">Clearinghouse Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-status-ready animate-pulse" />
              <span className="font-bold text-primary">PFMS Node-04 Online</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-sm rounded-lg border border-border-subtle">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase font-bold">Reported Cases Waiting Revalidation</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-display-lg text-headline-lg font-bold text-accent-saffron">
                {reportedCases.length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">Ready to clear</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-sm rounded-lg border border-border-subtle">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase font-bold">Last Automated Sync</span>
            <p className="font-mono text-sm font-bold text-primary mt-1">{lastCheckTime}</p>
          </div>
        </div>
      </section>

      {/* Reported Cases Pending Final Validation */}
      <section className="bg-surface-card rounded-xl p-space-md shadow-sm border border-border-subtle">
        <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-border-subtle">
          <div>
            <h2 className="font-title-md text-title-md text-primary font-bold">
              Beneficiaries Pending Clearinghouse Push
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Farmers with uploaded proof or active branch remediations waiting for electronic NPCI re-validation ping:
            </p>
          </div>
          <span className="bg-surface-container-high text-primary font-label-sm px-2.5 py-1 rounded font-bold">
            {reportedCases.length} Active Dockets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm divide-y divide-border-subtle">
            <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface uppercase">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Beneficiary</th>
                <th className="py-2.5 px-3">Bank &amp; Account</th>
                <th className="py-2.5 px-3">Current Stage</th>
                <th className="py-2.5 px-3">Remediation Action</th>
                <th className="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-sm">
              {reportedCases.map(f => {
                const cCode = f.farmer_id === 'KL-TSR-0001' ? 'K104' : `K${100 + parseInt(f.farmer_id.replace(/\D/g, '') || '1')}`;
                return (
                  <tr key={f.farmer_id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">#{cCode}</td>
                    <td className="py-2.5 px-3 font-bold text-on-surface">{f.name_en} ({f.name_ml})</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{f.bank_name} - {f.account_no_masked}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-status-warning-bg text-disclaimer-banner-text font-label-sm px-2 py-0.5 rounded font-bold uppercase">
                        {f.stage}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-on-surface-variant">{diagnostics[f.farmer_id]?.action_en}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/cases/${f.farmer_id}`}
                        className="bg-primary text-on-primary px-3 py-1 rounded text-xs font-bold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {reportedCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant italic">
                    No cases waiting in proof uploaded stage. Go to <Link to="/tasks" className="text-secondary underline font-bold">My Tasks</Link> to submit proof for #K104 Ravi K.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
