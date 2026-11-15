import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { Home } from './Home';

export const Reports: React.FC = () => {
  const { language, addToast } = useUIStore();
  const { cases } = useAppStore();
  const isMl = language === 'ml';

  const closed = ['Resolved', 'Payment Confirmed', 'Ready', 'Credited'];
  const openCases = cases.filter((c) => !closed.includes(c.status));
  const readyCount = cases.filter((c) => c.status === 'Ready').length;
  const readyPct = cases.length ? ((readyCount / cases.length) * 100).toFixed(1) : '0';
  const avgDays = openCases.length
    ? (openCases.reduce((sum, c) => sum + (c.days_open || 0), 0) / openCases.length).toFixed(1)
    : '0';
  const officeRows = [
    { key: 'bank_branch', label: 'Bank branches' },
    { key: 'akshaya', label: 'Akshaya centres' },
    { key: 'village_office', label: 'Village Offices' },
    { key: 'krishi_bhavan', label: 'Krishi Bhavan' },
  ].map((o) => {
    const list = openCases.filter((c) => c.owner_office_type === o.key);
    return { ...o, open: list.length, overdue: list.filter((c) => c.is_overdue || c.days_open > 7).length };
  });

  return (
    <div className="flex flex-col w-full pb-16">
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
            Reports &amp; MIS (സ്ഥിതിവിവരക്കണക്കുകൾ)
          </li>
        </ol>
      </nav>

      <section className="bg-surface-card rounded-xl p-space-lg shadow-sm mb-space-lg border border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b border-border-subtle">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
              Reports
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Charts and history, moved off the dashboard to keep it focused on action.
            </p>
          </div>
          <button
            onClick={() => addToast('Demo: report export is simulated', 'info')}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 self-start"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download MIS Report</span>
          </button>
        </div>

        <p className="mt-space-md text-xs font-bold text-status-warning uppercase tracking-wide">
          Demo metrics (synthetic data). All numbers are calculated live from the 1,000 synthetic records in this prototype.
        </p>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md my-space-md">
          <div className="bg-surface-container-low p-space-md rounded-lg border border-border-subtle" title="Records with status Ready ÷ all records">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Records passing all checks</span>
            <p className="font-display-lg text-headline-lg font-black text-status-ready mt-1">{readyPct}%</p>
            <p className="text-xs text-on-surface-variant mt-1">{readyCount.toLocaleString()} of {cases.length.toLocaleString()} records (not money recovered)</p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg border border-border-subtle" title="Open cases × ₹2,000 per instalment">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Instalment value on hold</span>
            <p className="font-display-lg text-headline-lg font-black text-status-error mt-1">₹{(openCases.length * 2000).toLocaleString('en-IN')}</p>
            <p className="text-xs text-on-surface-variant mt-1">{openCases.length} open cases × ₹2,000 per instalment</p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg border border-border-subtle" title="Average days_open across open cases">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Average days open</span>
            <p className="font-display-lg text-headline-lg font-black text-primary mt-1">{avgDays} days</p>
            <p className="text-xs text-on-surface-variant mt-1">Across open cases (synthetic)</p>
          </div>
        </div>

        {/* Agency Breakdown Table */}
        <div className="mt-space-lg">
          <h3 className="font-title-md text-title-md text-primary font-bold mb-3">Open cases by responsible office</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm divide-y divide-border-subtle">
              <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface uppercase">
                <tr>
                  <th className="py-2.5 px-3">Responsible office</th>
                  <th className="py-2.5 px-3">Open cases</th>
                  <th className="py-2.5 px-3">Overdue</th>
                  <th className="py-2.5 px-3">Value on hold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-body-sm">
                {officeRows.map((r) => (
                  <tr key={r.key} className="hover:bg-surface-container-low">
                    <td className="py-2.5 px-3 font-bold text-primary">{r.label}</td>
                    <td className="py-2.5 px-3 font-bold">{r.open}</td>
                    <td className={`py-2.5 px-3 font-bold ${r.overdue ? 'text-status-error' : ''}`}>{r.overdue}</td>
                    <td className="py-2.5 px-3 font-mono">₹{(r.open * 2000).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Detailed charts moved here from the dashboard */}
      <Home embedded />
    </div>
  );
};
