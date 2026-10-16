import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { FileDropzone } from '../components/FileDropzone';

export const ImportSync: React.FC = () => {
  const { farmers, loadDemoData, resetDemo } = useAppStore();
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleLoadDemo = async () => {
    setIsLoading(true);
    await loadDemoData();
    setIsLoading(false);
    addToast(isMl ? 'ഡെമോ ഡാറ്റ വിജയകരമായി ലോഡ് ചെയ്തു' : '1,000 PM-KISAN pilot records loaded into DBT-GUARD', 'success');
  };

  const handleReset = () => {
    resetDemo();
    addToast('Demo database reset to clean 1,000 baseline', 'info');
  };

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
            Import &amp; Sync (PFMS / PM-KISAN)
          </li>
        </ol>
      </nav>

      {/* Main Container */}
      <section className="bg-surface-card rounded-xl p-space-lg shadow-sm mb-space-lg border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md border-b border-border-subtle">
          <div className="space-y-1">
            <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
              Ingest &amp; Synchronize Beneficiary Data
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Upload central PFMS transaction response files, NPCI mapper clearing logs, or load the pre-configured 1,000-farmer Thrissur Pilot benchmark dataset.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadDemo}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm font-bold disabled:opacity-50"
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>database</span>
              <span>Load Demo Data (1,000 Farmers)</span>
            </button>

            <button
              onClick={handleReset}
              className="bg-surface-container-high hover:bg-surface-variant text-status-error font-label-md text-label-md px-4 py-2.5 rounded-lg transition-colors font-bold border border-border-subtle"
              type="button"
            >
              Reset Baseline
            </button>
          </div>
        </div>

        {/* Dataset Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-md my-space-lg">
          <div className="bg-surface-container-low p-space-md rounded-lg border border-border-subtle">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Loaded Records</span>
            <p className="font-display-lg text-headline-lg font-black text-primary mt-1">{farmers.length}</p>
            <span className="text-xs text-status-ready font-bold">Thrissur Pilot Cohort</span>
          </div>

          <div className="bg-status-ready-bg p-space-md rounded-lg border border-status-ready/30">
            <span className="text-xs uppercase font-bold text-status-ready">Clean / Ready</span>
            <p className="font-display-lg text-headline-lg font-black text-status-ready mt-1">720</p>
            <span className="text-xs text-on-surface-variant">72.0% Passing</span>
          </div>

          <div className="bg-status-error-bg p-space-md rounded-lg border border-status-error/30">
            <span className="text-xs uppercase font-bold text-status-error">Issues Identified</span>
            <p className="font-display-lg text-headline-lg font-black text-status-error mt-1">250</p>
            <span className="text-xs text-on-surface-variant">Payment Bounced (R01-R07)</span>
          </div>

          <div className="bg-status-warning-bg p-space-md rounded-lg border border-status-warning/40">
            <span className="text-xs uppercase font-bold text-disclaimer-banner-text">Needs Verification</span>
            <p className="font-display-lg text-headline-lg font-black text-disclaimer-banner-text mt-1">20</p>
            <span className="text-xs text-on-surface-variant">Biometric / RoR Re-check</span>
          </div>
        </div>

        {/* Drag and Drop Box */}
        <div className="mt-space-lg">
          <h3 className="font-title-md text-title-md font-bold text-primary mb-2">
            Upload External CSV / PFMS Export
          </h3>
          <FileDropzone
            onFileSelect={(file) => {
              setUploadedFile(file);
              addToast(`Selected file: ${file.name}. Parsed 1,000 synthetic records.`, 'info');
            }}
          />
        </div>
      </section>
    </div>
  );
};
