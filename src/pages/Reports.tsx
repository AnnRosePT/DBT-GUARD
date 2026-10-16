import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';

export const Reports: React.FC = () => {
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

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
              PM-KISAN DBT Remediation Analytical Reports
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Comprehensive MIS reporting for State Level Bankers' Committee (SLBC) and Department of Agriculture.
            </p>
          </div>
          <button
            onClick={() => addToast('Analytical PDF report generated', 'success')}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 self-start"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download MIS Report</span>
          </button>
        </div>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md my-space-lg">
          <div className="bg-surface-container-low p-space-md rounded-lg border border-border-subtle">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Direct Resolution Rate</span>
            <p className="font-display-lg text-headline-lg font-black text-status-ready mt-1">72.0%</p>
            <p className="text-xs text-on-surface-variant mt-1">720 of 1,000 farmers clear for instant DBT credit</p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg border border-border-subtle">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Target Stalled Corpus</span>
            <p className="font-display-lg text-headline-lg font-black text-status-error mt-1">₹5,00,000</p>
            <p className="text-xs text-on-surface-variant mt-1">250 stalled beneficiaries @ ₹2,000 / instalment</p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg border border-border-subtle">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Average Remediation Turnaround</span>
            <p className="font-display-lg text-headline-lg font-black text-primary mt-1">3.2 Days</p>
            <p className="text-xs text-on-surface-variant mt-1">Down from state baseline of 42 days</p>
          </div>
        </div>

        {/* Agency Breakdown Table */}
        <div className="mt-space-lg">
          <h3 className="font-title-md text-title-md text-primary font-bold mb-3">
            Agency Bottleneck &amp; Remediation Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm divide-y divide-border-subtle">
              <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface uppercase">
                <tr>
                  <th className="py-2.5 px-3">Remediation Desk</th>
                  <th className="py-2.5 px-3">Primary Fault</th>
                  <th className="py-2.5 px-3">Active Cases</th>
                  <th className="py-2.5 px-3">Corpus At Risk</th>
                  <th className="py-2.5 px-3">Resolution Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-body-sm">
                <tr className="hover:bg-surface-container-low">
                  <td className="py-2.5 px-3 font-bold text-primary">Lead Bank Branches (SBI/Federal/Canara)</td>
                  <td className="py-2.5 px-3 text-status-error font-medium">NPCI Mapper de-linked / Dormant</td>
                  <td className="py-2.5 px-3 font-bold">140</td>
                  <td className="py-2.5 px-3 font-mono font-bold">₹2,80,000</td>
                  <td className="py-2.5 px-3">Annexure-I Mandate Form</td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="py-2.5 px-3 font-bold text-primary">Akshaya e-Kendras</td>
                  <td className="py-2.5 px-3 text-status-warning font-medium">Biometric e-KYC Pending</td>
                  <td className="py-2.5 px-3 font-bold">50</td>
                  <td className="py-2.5 px-3 font-mono font-bold">₹1,00,000</td>
                  <td className="py-2.5 px-3">Biometric POS Authentication</td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="py-2.5 px-3 font-bold text-primary">Village Revenue Offices</td>
                  <td className="py-2.5 px-3 text-secondary font-medium">Land RoR Mutation Split</td>
                  <td className="py-2.5 px-3 font-bold">40</td>
                  <td className="py-2.5 px-3 font-mono font-bold">₹80,000</td>
                  <td className="py-2.5 px-3">ReLIS Survey Cadastre Linkage</td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="py-2.5 px-3 font-bold text-primary">Krishi Bhavan Circles</td>
                  <td className="py-2.5 px-3 text-on-surface-variant font-medium">Bank Merger IFSC Outdated</td>
                  <td className="py-2.5 px-3 font-bold">20</td>
                  <td className="py-2.5 px-3 font-mono font-bold">₹40,000</td>
                  <td className="py-2.5 px-3">PFMS Portal Batch Remapping</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
