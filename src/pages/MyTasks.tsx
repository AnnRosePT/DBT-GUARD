import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const MyTasks: React.FC = () => {
  const { farmers, diagnostics, uploadProof } = useAppStore();
  const { currentUser } = useAuthStore();
  const currentPersona = currentUser;
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

  // Focused active task
  const [activeFarmerId, setActiveFarmerId] = useState<string>('KL-TSR-0001');
  const [proofType, setProofType] = useState('Official Stamped Acknowledgement Slip (കൗണ്ടർഫോയിൽ രസീത്)');
  const [refId, setRefId] = useState('NPCI-TXN-2026-SBI-IRJ-88419');
  const [execDate, setExecDate] = useState('2026-10-16');
  const [fileName, setFileName] = useState<string | null>('Ravi_K_K104_SBI_Ack_Counterfoil_Stamped.pdf');
  const [officerNote, setOfficerNote] = useState('Beneficiary Ravi K presented Aadhaar and passbook at counter #3 today. Form Annexure-I executed. Aadhaar successfully linked in Finacle NPCI mapper table. Counterfoil issued with branch stamp.');
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);

  // Active farmer record
  const activeFarmer = useMemo(() => {
    return farmers.find(f => f.farmer_id === activeFarmerId) || farmers[0];
  }, [farmers, activeFarmerId]);

  // Tasks list (bank or assigned)
  const taskFarmers = useMemo(() => {
    return farmers.filter(f => {
      const diag = diagnostics[f.farmer_id];
      return (
        f.farmer_id === 'KL-TSR-0001' ||
        f.status === 'Issue identified' ||
        f.status === 'Correction requested' ||
        f.status === 'Correction reported' ||
        diag?.action_agency === 'LEAD_BANK'
      );
    }).slice(0, 8);
  }, [farmers, diagnostics]);

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarmer) return;

    uploadProof(
      activeFarmer.farmer_id,
      fileName || 'Official_Stamped_Ack.pdf',
      refId,
      currentPersona?.name || 'Suresh Menon'
    );

    setIsSuccessSubmitted(true);
    addToast(
      isMl
        ? 'രേഖകൾ കൃഷി ഭവനിലേക്ക് കൈമാറി'
        : `Proof submitted for #${activeFarmer.farmer_id === 'KL-TSR-0001' ? 'K104' : activeFarmer.farmer_id}. Stage advanced to Proof Uploaded.`,
      'success'
    );
  };

  const activeCaseCode = activeFarmer
    ? activeFarmer.farmer_id === 'KL-TSR-0001'
      ? 'K104'
      : `K${100 + parseInt(activeFarmer.farmer_id.replace(/\D/g, '') || '1')}`
    : 'K104';

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Submission Alert Banner */}
      {isSuccessSubmitted && (
        <div className="mb-space-md bg-status-ready-bg text-status-ready px-gutter py-space-md rounded-xl shadow-sm flex items-center justify-between border border-status-ready/30">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[28px] text-accent-green">check_circle</span>
            <div>
              <p className="font-title-md text-title-md font-bold text-status-ready">
                Rectification Proof Dispatched to Krishi Bhavan Thrissur West
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Case #{activeCaseCode} status switched to <span className="font-semibold text-primary">"Remediated (Proof Uploaded)"</span>. Ready for clearinghouse automated re-poll.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSuccessSubmitted(false)}
            className="text-on-surface-variant hover:text-on-surface p-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* Breadcrumb & Bank Authority Sub-Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
          <Link to="/home" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>{isMl ? 'ഹോം' : 'Home'}</span>
          </Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface-variant">Agency Desk</span>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold">{currentPersona?.office}</span>
          <span className="text-outline">/</span>
          <span className="text-accent-saffron font-bold">My Tasks (ടാസ്കുകൾ)</span>
        </nav>
        <div className="flex items-center gap-space-sm">
          <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded-full uppercase tracking-wider font-bold shadow-xs">
            {currentPersona?.badge}
          </span>
          <span className="bg-surface-container-high text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold">
            Officer: {currentPersona?.name}
          </span>
        </div>
      </div>

      {/* Header Banner & Title Block */}
      <div className="bg-surface-card rounded-xl p-space-lg shadow-sm mb-space-lg border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-accent-saffron flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
              </div>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                  Bank Branch Remediation Tasks — {currentPersona.institution || currentPersona.office}
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Direct action queue for PM-KISAN NPCI Aadhaar seeding, DBT account mandate updates, and clearinghouse bounce rectification.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addToast('Core Banking System feed re-synchronized', 'info')}
              className="bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-border-subtle"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Refresh CBS Feed</span>
            </button>
            <Link
              to="/revalidate"
              className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Revalidate &amp; Clear</span>
            </Link>
          </div>
        </div>

        {/* Quick Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-lg pt-space-md border-t border-border-subtle">
          <div className="bg-surface-container-low p-space-md rounded-xl flex items-start justify-between border border-border-subtle">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Assigned to Branch</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg font-bold text-primary">{taskFarmers.length}</span>
                <span className="font-label-sm text-label-sm text-status-warning font-bold">4 Due Today</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-status-warning" /> PM-KISAN Mandate Queue
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[20px]">checklist</span>
            </div>
          </div>

          <div className="bg-status-error-bg p-space-md rounded-xl flex items-start justify-between border border-status-error/30">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-status-error font-bold uppercase tracking-wider">SLA Alert (&lt; 48 hrs)</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg font-bold text-status-error">03</span>
                <span className="font-label-sm text-label-sm bg-status-error text-on-primary px-1.5 py-0.5 rounded-full font-bold">Immediate</span>
              </div>
              <span className="font-body-sm text-body-sm text-status-error/80 font-medium">Nearing SLBC Escalation</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-status-error shadow-xs">
              <span className="material-symbols-outlined text-[20px]">alarm</span>
            </div>
          </div>

          <div className="bg-status-warning-bg p-space-md rounded-xl flex items-start justify-between border border-status-warning/40">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-disclaimer-banner-text font-bold uppercase tracking-wider">Pending Upload / Proof</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg font-bold text-disclaimer-banner-text">06</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Awaiting Stamped Slip</span>
              </div>
              <span className="font-body-sm text-body-sm text-disclaimer-banner-text/90">Counterfoil receipt pending</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-status-warning shadow-xs">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
          </div>

          <div className="bg-status-ready-bg p-space-md rounded-xl flex items-start justify-between border border-status-ready/30">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-status-ready font-bold uppercase tracking-wider">Resolved This Month</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg font-bold text-status-ready">28</span>
                <span className="font-label-sm text-label-sm text-accent-green font-bold">100% Validated</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-semibold">₹56,000 released</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-status-ready shadow-xs">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area: 7 cols Left Tasks Queue, 5 cols Right Upload Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Tasks Queue */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {taskFarmers.map(f => {
            const isTarget = f.farmer_id === activeFarmerId;
            const cCode = f.farmer_id === 'KL-TSR-0001' ? 'K104' : `K${100 + parseInt(f.farmer_id.replace(/\D/g, '') || '1')}`;
            const diagF = diagnostics[f.farmer_id];
            const isUploaded = f.stage === 'PROOF_UPLOADED' || f.stage === 'VALIDATION_PASSED';

            return (
              <div
                key={f.farmer_id}
                className={`task-card-item bg-surface-card rounded-xl p-space-md border transition-all relative overflow-hidden ${
                  isTarget ? 'border-2 border-secondary shadow-md' : 'border-border-subtle shadow-sm hover:shadow'
                }`}
              >
                {isTarget && <div className="h-1 w-full bg-tricolor-gradient absolute top-0 left-0" />}

                <div className="flex items-start justify-between gap-space-sm pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded font-mono font-bold">
                      CASE #{cCode}
                    </span>
                    <span className="bg-status-warning-bg text-disclaimer-banner-text font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      ⏰ Due 23 Oct 2026
                    </span>
                    <span className="bg-status-error-bg text-status-error font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                      {diagF?.priority_level || 'P5'} (Urgent)
                    </span>
                  </div>
                  {isUploaded ? (
                    <span className="font-label-sm text-label-sm text-status-ready font-bold flex items-center gap-1 bg-status-ready-bg px-2 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Proof Uploaded
                    </span>
                  ) : (
                    <span className="font-label-sm text-label-sm text-status-warning font-bold flex items-center gap-1 bg-status-warning-bg px-2 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[14px]">campaign</span>
                      Farmer Visited Branch
                    </span>
                  )}
                </div>

                <div className="mt-space-sm pb-space-sm">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h2 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-2">
                        <span>{f.name_en}</span>
                        <span className="font-normal text-on-surface-variant font-['Noto_Sans_Malayalam'] text-[15px]">
                          ({f.name_ml})
                        </span>
                      </h2>
                      <div className="flex items-center gap-3 text-body-sm text-on-surface-variant mt-1 font-mono">
                        <span>Aadhaar: {f.aadhaar_masked}</span>
                        <span>·</span>
                        <span>A/C: {f.account_no_masked || f.account_masked || 'XXXXXXXX9761'}</span>
                      </div>
                    </div>
                    <span className="font-bold text-status-error text-title-md">₹2,000</span>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface mt-2">
                    <strong>Remediation:</strong> {diagF?.title_en || 'Aadhaar not mapped in NPCI'}. Collect stamped Annexure-I and seed in Core Banking System.
                  </p>
                </div>

                <div className="pt-space-sm border-t border-border-subtle flex items-center justify-between">
                  <Link to={`/cases/${f.farmer_id}`} className="text-secondary hover:underline font-bold text-xs flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>View Case File</span>
                  </Link>
                  <button
                    onClick={() => {
                      setActiveFarmerId(f.farmer_id);
                      setFileName(`${f.name_en.replace(/\s+/g, '_')}_${cCode}_SBI_Ack_Counterfoil_Stamped.pdf`);
                      setRefId(`NPCI-TXN-2026-SBI-IRJ-${Math.floor(10000 + Math.random() * 90000)}`);
                    }}
                    className={`font-label-md text-label-md px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                      isTarget ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary hover:bg-surface-variant'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>{isTarget ? 'Active in Drawer' : 'Upload Proof & Settle'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Upload Drawer Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-4 bg-surface-card rounded-xl p-space-lg shadow-md border border-border-subtle">
            <div className="pb-space-sm border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">fact_check</span>
                  Action Panel
                </span>
                <span className="font-label-sm text-label-sm text-accent-green font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                  Live Remediation Docket
                </span>
              </div>
              <h2 className="font-title-lg text-title-lg font-bold text-primary mt-2">
                Upload Proof of Rectification — Case #{activeCaseCode}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Beneficiary: <span className="font-bold text-on-surface">{activeFarmer?.name_en} ({activeFarmer?.name_ml})</span> · {activeFarmer?.bank_name} / A/C {activeFarmer?.account_no_masked || activeFarmer?.account_masked || 'XXXXXXXX9761'}
              </p>
            </div>

            <form className="mt-space-md space-y-space-md" onSubmit={handleSubmitProof}>
              {/* Proof Type */}
              <div className="space-y-1">
                <label className="block font-label-md text-label-md font-bold text-primary" htmlFor="proof-type-select">
                  1. Type of Remediation Proof Submitted <span className="text-error">*</span>
                </label>
                <select
                  id="proof-type-select"
                  value={proofType}
                  onChange={e => setProofType(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                >
                  <option>Official Stamped Acknowledgement Slip (കൗണ്ടർഫോയിൽ രസീത്)</option>
                  <option>NPCI Mapper Active Status Screenshot / Clearinghouse Report</option>
                  <option>Re-KYC / CBS System Confirmation Slip</option>
                  <option>Other / Field Visit Memo</option>
                </select>
                <p className="font-label-sm text-label-sm text-outline">Per SLBC guidelines, physically stamped counterfoil is mandatory for audit trail.</p>
              </div>

              {/* Reference & Processing Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-bold text-primary" htmlFor="cbs-ref-input">
                    2. CBS / NPCI Ref ID <span className="text-error">*</span>
                  </label>
                  <input
                    id="cbs-ref-input"
                    value={refId}
                    onChange={e => setRefId(e.target.value)}
                    type="text"
                    className="w-full bg-surface-container-low text-on-surface font-mono text-body-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-bold text-primary" htmlFor="process-date">
                    3. Branch Execution Date <span className="text-error">*</span>
                  </label>
                  <input
                    id="process-date"
                    value={execDate}
                    onChange={e => setExecDate(e.target.value)}
                    type="date"
                    className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Officer in charge */}
              <div className="space-y-1">
                <label className="block font-label-md text-label-md font-bold text-primary" htmlFor="officer-id-input">
                  4. Officer / Counter Staff In-charge <span className="text-error">*</span>
                </label>
                <input
                  id="officer-id-input"
                  readOnly
                  value={`${currentPersona?.name || 'Suresh Menon'} (${currentPersona?.designation || 'Lead Bank Officer'}, ${currentPersona?.office || 'SBI Irinjalakuda'})`}
                  className="w-full bg-surface-container-high/50 text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-lg cursor-not-allowed font-medium"
                />
              </div>

              {/* File Attachment */}
              <div className="space-y-1">
                <label className="block font-label-md text-label-md font-bold text-primary">
                  5. Upload Scanned Stamped Annexure-I / Form <span className="text-error">*</span>
                </label>
                <div
                  onClick={() => setFileName(`${activeFarmer.name_en.replace(/\s+/g, '_')}_${activeCaseCode}_SBI_Ack_Counterfoil_Stamped.pdf`)}
                  className="border-2 border-dashed border-outline-variant hover:border-secondary transition-colors rounded-xl p-space-md text-center bg-surface-container-low/50 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                  </div>
                  <p className="font-label-md text-label-md text-primary font-bold">
                    Click to attach scanned Annexure-I form or counterfoil PDF
                  </p>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">
                    Maximum file size: 5 MB · High resolution 200 DPI scan recommended
                  </p>
                </div>

                {fileName && (
                  <div className="mt-2 bg-surface-container p-2.5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="material-symbols-outlined text-status-ready text-[22px]">description</span>
                      <div className="truncate">
                        <span className="font-label-md text-label-md text-primary font-bold block truncate">
                          {fileName}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          420 KB · SHA-256 Verified Checksum ✓
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setFileName(null)}
                      className="text-outline hover:text-error p-1 transition-colors"
                      title="Remove file"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Officer Note */}
              <div className="space-y-1">
                <label className="block font-label-md text-label-md font-bold text-primary" htmlFor="officer-remarks">
                  6. Bank Officer Remediation Note / CBS Remark <span className="text-error">*</span>
                </label>
                <textarea
                  id="officer-remarks"
                  rows={3}
                  value={officerNote}
                  onChange={e => setOfficerNote(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary leading-relaxed resize-none"
                />
              </div>

              {/* Checkbox */}
              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-2.5">
                <input
                  id="compliance-check"
                  type="checkbox"
                  defaultChecked
                  className="mt-1 h-4 w-4 rounded accent-primary text-on-primary cursor-pointer"
                />
                <label className="font-body-sm text-body-sm text-on-surface leading-tight cursor-pointer" htmlFor="compliance-check">
                  I confirm this seeding adheres to RBI/NPCI master circular on Aadhaar-enabled DBT payments and UIDAI biometric consent norms.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-space-xs space-y-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md font-bold"
                >
                  <span className="material-symbols-outlined text-[20px]">send_and_archive</span>
                  <span>Submit Proof to Krishi Bhavan &amp; Settle Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
