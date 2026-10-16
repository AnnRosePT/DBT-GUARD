import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

export const PaymentStatus: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { cases, farmers, bankAccounts, npciMapper, pfmsValidation } = useAppStore();

  const isFarmer = currentUser.role === 'farmer';

  // For officers: farmer search & selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(
    isFarmer ? (currentUser.farmerId || 'KL-TSR-0001') : 'KL-TSR-0001'
  );

  // If farmer, force selected ID to their own identity
  const activeFarmerId = isFarmer ? (currentUser.farmerId || 'KL-TSR-0001') : selectedFarmerId;

  // Resolve target farmer & case
  const activeFarmer = useMemo(() => {
    return farmers.find((f) => f.farmer_id === activeFarmerId) || farmers[0];
  }, [farmers, activeFarmerId]);

  const activeCase = useMemo(() => {
    return (
      cases.find((c) => c.farmer_id === activeFarmerId || (activeFarmerId === 'KL-TSR-0001' && c.case_id === 'K104')) ||
      cases[0]
    );
  }, [cases, activeFarmerId]);

  const activeAccount = useMemo(() => {
    return bankAccounts.find((b) => b.farmer_id === activeFarmerId) || bankAccounts[0];
  }, [bankAccounts, activeFarmerId]);

  const activeNpci = useMemo(() => {
    return npciMapper.find((n) => n.aadhaar_token === activeFarmer?.aadhaar_token) || {
      mapped_status: 'Not mapped',
      bank_name: activeAccount?.bank_name || 'State Bank of India',
      last_updated_date: '2026-09-14',
    };
  }, [npciMapper, activeFarmer, activeAccount]);

  const activePfms = useMemo(() => {
    return (
      pfmsValidation.find((p) => p.farmer_id === activeFarmerId) || {
        validation_status: 'Rejected',
        error_code: 'R01',
        error_description: 'Account Closed or Transferred / Aadhaar not linked in NPCI mapper',
        validation_date: '2026-10-01',
      }
    );
  }, [pfmsValidation, activeFarmerId]);

  // Filtered farmers list for officer search
  const filteredSearchFarmers = useMemo(() => {
    if (isFarmer || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return farmers
      .filter(
        (f) =>
          f.name_en.toLowerCase().includes(q) ||
          f.name_ml.includes(q) ||
          f.farmer_id.toLowerCase().includes(q) ||
          f.local_body.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [farmers, searchQuery, isFarmer]);

  // Determine stage progression
  const isNpciMapped = activeNpci.mapped_status === 'Mapped';
  const isResolved = activeCase?.status === 'Resolved' || activeCase?.status === 'Payment Confirmed';
  const isPaid = activeCase?.status === 'Payment Confirmed';

  return (
    <div className="space-y-space-md">
      {/* Top Header & Breadcrumb */}
      <div className="w-full bg-surface-card px-gutter py-space-xs rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-space-xs text-on-surface border border-border-subtle">
        <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-primary">account_balance_wallet</span>
          <span className="text-on-surface-variant">Portal</span>
          <span className="text-outline-variant">/</span>
          <span className="font-bold text-primary">
            {isFarmer
              ? 'My PM-KISAN Payment Processing Status (എൻ്റെ പേയ്മെന്റ് സ്ഥിതി)'
              : 'PM-KISAN DBT Payment Processing Status & Treasury Clearinghouse Console'}
          </span>
        </div>
        <div className="flex items-center gap-space-sm">
          <span className="font-label-sm text-label-sm flex items-center gap-1 text-status-ready font-bold bg-status-ready-bg px-2.5 py-0.5 rounded-full border border-status-ready/30">
            <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
            PFMS-NPCI Disbursal Gateway 200 OK
          </span>
          <span className="font-data-mono text-body-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
            Batch: KL-TSR-2026-B9
          </span>
        </div>
      </div>

      {/* Main Directive Banner */}
      <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider bg-primary text-on-primary px-2.5 py-0.5 rounded font-bold">
                DBT Disbursal Tracking
              </span>
              <span className="font-label-sm text-label-sm bg-surface-container text-secondary font-bold px-2.5 py-0.5 rounded border border-border-subtle">
                24th Instalment Cycle (October 2026)
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              {isFarmer
                ? `PM-KISAN Payment Status: ${activeFarmer?.name_en} (${activeFarmer?.name_ml})`
                : 'Inter-Agency Payment Processing Status & Disbursal Telemetry'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isFarmer
                ? 'Review the end-to-end processing lifecycle of your PM-KISAN ₹2,000 instalment across PFMS, NPCI Aadhaar Mapper, and Bank CBS.'
                : 'Unified payment lifecycle status visible across Krishi Bhavan, Lead Bank, Akshaya, Revenue Dept, and District Authority.'}
            </p>
          </div>

          {/* Quick Stat / Status Summary */}
          <div className="bg-surface-container-low p-space-md rounded-xl border border-border-subtle flex items-center gap-space-md flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-accent-saffron">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {isFarmer ? 'Active Instalment Value' : 'Thrissur Stalled Instalments'}
              </span>
              <p className="font-headline-md text-headline-md font-bold text-primary">
                {isFarmer ? '₹2,000' : '₹49.60 Lakh'}
              </p>
              <span className="text-[12px] font-medium text-status-ready flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {isFarmer ? '24th Instalment Scheduled' : '10,400 Credited Successfully'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICER ONLY: Search Beneficiary Payment Record */}
      {!isFarmer && (
        <div className="bg-surface-card rounded-xl p-space-md border border-border-subtle shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-title-md text-title-md font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">person_search</span>
                <span>Lookup Beneficiary Payment Status</span>
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Search any of the 1,000 Thrissur farmer records by name or farmer ID to inspect their live payment pipeline.
              </p>
            </div>
            <div className="relative min-w-[280px]">
              <span className="material-symbols-outlined text-outline absolute left-3 top-2.5 text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farmer name or ID..."
                className="w-full pl-9 pr-3 py-2 bg-surface-card border border-border-strong rounded-lg font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          {filteredSearchFarmers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-border-subtle">
              {filteredSearchFarmers.map((f) => (
                <button
                  key={f.farmer_id}
                  type="button"
                  onClick={() => {
                    setSelectedFarmerId(f.farmer_id);
                    setSearchQuery('');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    f.farmer_id === activeFarmerId
                      ? 'bg-primary text-on-primary border-primary font-bold'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-border-subtle'
                  }`}
                >
                  <p className="font-label-md text-label-md truncate">{f.name_en}</p>
                  <p className="text-[11px] opacity-80 truncate">{f.local_body} • {f.farmer_id}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5-STAGE PAYMENT PROCESSING PIPELINE (Common for All Roles) */}
      <div className="bg-surface-card rounded-xl p-space-lg border border-border-subtle shadow-sm space-y-space-md">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">linear_scale</span>
              <span>5-Stage DBT Payment Processing Pipeline (തത്സമയ വിതരണ ഘട്ടങ്ങൾ)</span>
            </h3>
            <span className="font-data-mono text-[12px] bg-surface-container px-2.5 py-1 rounded text-primary font-bold border border-border-subtle">
              Beneficiary ID: {activeFarmer?.farmer_id}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Official tracking across the Public Financial Management System (PFMS), National Payments Corporation of India (NPCI), and Core Banking Solution (CBS).
          </p>
        </div>

        {/* Visual Pipeline Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Stage 1 */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border-2 border-status-ready/60 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-status-ready text-on-primary flex items-center justify-center font-bold text-xs">
                1
              </span>
              <span className="font-label-sm text-[11px] bg-status-ready-bg text-status-ready px-2 py-0.2 rounded font-bold">
                Passed
              </span>
            </div>
            <h4 className="font-title-sm text-title-sm font-bold text-primary">PFMS Validation</h4>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Demographic records authenticated against UIDAI Aadhaar registry.
            </p>
            <div className="text-[11px] font-data-mono text-on-surface-variant pt-1 border-t border-border-subtle">
              Code: {activePfms.validation_status === 'Passed' ? '00: Clean' : activePfms.error_code}
            </div>
          </div>

          {/* Stage 2 */}
          <div
            className={`rounded-xl p-3.5 border-2 space-y-2 relative ${
              isNpciMapped
                ? 'bg-surface-container-low border-status-ready/60'
                : 'bg-status-error-bg/30 border-status-error'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  isNpciMapped ? 'bg-status-ready text-on-primary' : 'bg-status-error text-on-primary'
                }`}
              >
                2
              </span>
              <span
                className={`font-label-sm text-[11px] px-2 py-0.2 rounded font-bold ${
                  isNpciMapped
                    ? 'bg-status-ready-bg text-status-ready'
                    : 'bg-status-error-bg text-status-error border border-status-error/40'
                }`}
              >
                {isNpciMapped ? 'Mapped OK' : 'Bottleneck: Delinked'}
              </span>
            </div>
            <h4 className="font-title-sm text-title-sm font-bold text-primary">NPCI Mapper</h4>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              {isNpciMapped
                ? 'Aadhaar successfully seeded in NPCI clearinghouse mapper.'
                : 'Aadhaar delinked from bank account. Mandate required.'}
            </p>
            <div className="text-[11px] font-data-mono text-on-surface-variant pt-1 border-t border-border-subtle">
              Status: {activeNpci.mapped_status || 'Not mapped'}
            </div>
          </div>

          {/* Stage 3 */}
          <div
            className={`rounded-xl p-3.5 border-2 space-y-2 relative ${
              isResolved
                ? 'bg-surface-container-low border-status-ready/60'
                : 'bg-surface-container-low border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  isResolved ? 'bg-status-ready text-on-primary' : 'bg-outline text-white'
                }`}
              >
                3
              </span>
              <span
                className={`font-label-sm text-[11px] px-2 py-0.2 rounded font-bold ${
                  isResolved ? 'bg-status-ready-bg text-status-ready' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {isResolved ? 'Verified' : 'Waiting Action'}
              </span>
            </div>
            <h4 className="font-title-sm text-title-sm font-bold text-primary">State Clearing Batch</h4>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Department of Agriculture clearinghouse batch assembly.
            </p>
            <div className="text-[11px] font-data-mono text-on-surface-variant pt-1 border-t border-border-subtle">
              Batch: KL-TSR-2026-B9
            </div>
          </div>

          {/* Stage 4 */}
          <div
            className={`rounded-xl p-3.5 border-2 space-y-2 relative ${
              isPaid
                ? 'bg-surface-container-low border-status-ready/60'
                : 'bg-surface-container-low border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  isPaid ? 'bg-status-ready text-on-primary' : 'bg-outline text-white'
                }`}
              >
                4
              </span>
              <span
                className={`font-label-sm text-[11px] px-2 py-0.2 rounded font-bold ${
                  isPaid ? 'bg-status-ready-bg text-status-ready' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {isPaid ? 'Released' : 'Pending Batch'}
              </span>
            </div>
            <h4 className="font-title-sm text-title-sm font-bold text-primary">Treasury Disbursal</h4>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Central treasury fund push of ₹2,000 via RBI NEFT/NACH conduit.
            </p>
            <div className="text-[11px] font-data-mono text-on-surface-variant pt-1 border-t border-border-subtle">
              Amount: ₹2,000.00
            </div>
          </div>

          {/* Stage 5 */}
          <div
            className={`rounded-xl p-3.5 border-2 space-y-2 relative ${
              isPaid
                ? 'bg-status-ready-bg/30 border-status-ready'
                : 'bg-surface-container-low border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  isPaid ? 'bg-status-ready text-on-primary' : 'bg-outline text-white'
                }`}
              >
                5
              </span>
              <span
                className={`font-label-sm text-[11px] px-2 py-0.2 rounded font-bold ${
                  isPaid
                    ? 'bg-status-ready text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {isPaid ? 'Credited' : 'Awaiting CBS'}
              </span>
            </div>
            <h4 className="font-title-sm text-title-sm font-bold text-primary">Bank Credit & UTR</h4>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Credited directly to farmer's active bank account with unique UTR.
            </p>
            <div className="text-[11px] font-data-mono text-on-surface-variant pt-1 border-t border-border-subtle truncate">
              {isPaid ? 'UTR: RBI20261015984' : 'Pending Stage 2-4'}
            </div>
          </div>
        </div>
      </div>

      {/* BENEFICIARY ACCOUNT & DIRECTIVE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left: Account & Remediation Details */}
        <div className="lg:col-span-7 bg-surface-card rounded-xl p-space-md border border-border-subtle shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h3 className="font-title-md text-title-md font-bold text-primary">
              Beneficiary DBT Account & Land Cadastre Details
            </h3>
            <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-bold">
              K-SWAN Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
            <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
              <span className="text-[11px] text-on-surface-variant font-bold uppercase">Farmer Name</span>
              <p className="font-bold text-primary text-[15px]">{activeFarmer?.name_en}</p>
              <p className="text-secondary font-medium text-[13px]">{activeFarmer?.name_ml}</p>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
              <span className="text-[11px] text-on-surface-variant font-bold uppercase">Aadhaar Token (Masked)</span>
              <p className="font-data-mono font-bold text-primary text-[15px]">{activeFarmer?.aadhaar_masked}</p>
              <p className="text-status-ready text-[11px] font-medium flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                UIDAI Biometric Seeded
              </p>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
              <span className="text-[11px] text-on-surface-variant font-bold uppercase">Designated Bank Account</span>
              <p className="font-bold text-primary text-[14px]">{activeAccount?.bank_name}</p>
              <p className="font-data-mono text-on-surface-variant text-[12px]">
                A/C: {activeAccount?.account_number_masked} • IFSC: {activeAccount?.ifsc}
              </p>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
              <span className="text-[11px] text-on-surface-variant font-bold uppercase">Panchayat & Land Holding</span>
              <p className="font-bold text-primary text-[14px]">{activeFarmer?.local_body} (Ward {activeFarmer?.ward})</p>
              <p className="text-on-surface-variant text-[12px]">
                Krishi Bhavan: {activeFarmer?.krishi_bhavan}
              </p>
            </div>
          </div>

          {/* Action Required Directive Box */}
          <div className="bg-status-warning-bg/40 border border-status-warning/60 p-4 rounded-xl space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-disclaimer-banner-text text-[22px]">warning</span>
              <h4 className="font-title-sm text-title-sm font-bold text-disclaimer-banner-text">
                Current Bottleneck & Next Action Required
              </h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              {activeCase?.problem_statement ||
                'Aadhaar number is currently not mapped to your bank account in the central NPCI database. Your ₹2,000 instalment cannot be deposited until the mandate is submitted.'}
            </p>
            <div className="pt-2 border-t border-status-warning/30 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-primary">
                Responsible Desk: {activeCase?.owner_office_name || 'State Bank of India (Irinjalakuda Branch)'}
              </span>
              <Link
                to={`/cases/${activeCase?.case_id}`}
                className="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-all"
              >
                <span>View Full Resolution Roadmap</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Past Instalments Ledger */}
        <div className="lg:col-span-5 bg-surface-card rounded-xl p-space-md border border-border-subtle shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h3 className="font-title-md text-title-md font-bold text-primary">
              PM-KISAN Instalment History
            </h3>
            <span className="text-[12px] text-on-surface-variant font-medium">₹2,000 / Cycle</span>
          </div>

          <div className="space-y-2.5">
            {/* Current 24th Instalment */}
            <div className="p-3 rounded-lg border border-status-error/40 bg-status-error-bg/20 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-[14px]">24th Instalment (Oct 2026)</span>
                  <span className="font-label-sm text-[10px] bg-status-error text-on-primary px-1.5 py-0.2 rounded font-bold uppercase">
                    Stalled (R01)
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Aadhaar not mapped in NPCI • Bank Mandate Required
                </p>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-status-error">₹2,000</span>
            </div>

            {/* 23rd Instalment */}
            <div className="p-3 rounded-lg border border-border-subtle bg-surface-container-low flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-[14px]">23rd Instalment (June 2026)</span>
                  <span className="font-label-sm text-[10px] bg-status-ready-bg text-status-ready px-1.5 py-0.2 rounded font-bold uppercase border border-status-ready/30">
                    Credited
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5 font-data-mono">
                  UTR: RBI20260618009214 • SBI Irinjalakuda
                </p>
              </div>
              <span className="font-title-md text-title-md font-bold text-primary">₹2,000</span>
            </div>

            {/* 22nd Instalment */}
            <div className="p-3 rounded-lg border border-border-subtle bg-surface-container-low flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-[14px]">22nd Instalment (Feb 2026)</span>
                  <span className="font-label-sm text-[10px] bg-status-ready-bg text-status-ready px-1.5 py-0.2 rounded font-bold uppercase border border-status-ready/30">
                    Credited
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5 font-data-mono">
                  UTR: RBI20260224008192 • SBI Irinjalakuda
                </p>
              </div>
              <span className="font-title-md text-title-md font-bold text-primary">₹2,000</span>
            </div>

            {/* 21st Instalment */}
            <div className="p-3 rounded-lg border border-border-subtle bg-surface-container-low flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-[14px]">21st Instalment (Oct 2025)</span>
                  <span className="font-label-sm text-[10px] bg-status-ready-bg text-status-ready px-1.5 py-0.2 rounded font-bold uppercase border border-status-ready/30">
                    Credited
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5 font-data-mono">
                  UTR: RBI20251028004128 • SBI Irinjalakuda
                </p>
              </div>
              <span className="font-title-md text-title-md font-bold text-primary">₹2,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
