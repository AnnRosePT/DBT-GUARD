import React from 'react';
import { useUIStore } from '../store/useUIStore';

export const Footer: React.FC = () => {
  const { t } = useUIStore();

  return (
    <footer className="w-full bg-[#041534] text-white pt-space-xl pb-space-lg mt-auto border-t border-border-strong/20">
      <div className="max-w-7xl mx-auto px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl pb-space-lg border-b border-white/10">
          {/* Column 1 */}
          <div className="space-y-space-sm">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-headline-md font-black tracking-tight text-white">
                DBT-GUARD
              </span>
              <span className="bg-primary-container text-accent-saffron text-label-sm font-bold px-2 py-0.5 rounded border border-accent-saffron/30">
                v3.2
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-white/70 leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="pt-1">
              <span className="block font-label-sm text-[11px] uppercase tracking-wider text-accent-saffron font-bold">
                Nodal Jurisdiction:
              </span>
              <span className="font-body-sm text-body-sm text-white/80">
                Krishi Bhavan, Thrissur West Block, Kerala 680001
              </span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-space-xs">
            <h4 className="font-title-md text-title-md font-bold text-white tracking-wide">
              {t('footerDataSources')}
            </h4>
            <ul className="space-y-1.5 font-body-sm text-body-sm text-white/70">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-saffron">chevron_right</span>
                <span>NPCI Aadhaar-Seeding Sandbox</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-saffron">chevron_right</span>
                <span>PFMS Public Financial Management Gateway</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-saffron">chevron_right</span>
                <span>Kerala ReLIS Land Record Cadastre</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-saffron">chevron_right</span>
                <span>PM-KISAN Central Registry v2.4</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-accent-saffron">chevron_right</span>
                <span>Akshaya e-Kendra Village Routing</span>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-space-xs">
            <h4 className="font-title-md text-title-md font-bold text-white tracking-wide">
              {t('footerPrivacy')}
            </h4>
            <p className="font-body-sm text-body-sm text-white/70 leading-relaxed">
              Complies with UIDAI Aadhaar Act 2016 regulations. Synthetic Aadhaar instances formatted as{' '}
              <strong className="text-white font-mono">XXXX-XXXX-7841</strong> and Bank Accounts as{' '}
              <strong className="text-white font-mono">XXXXXXXX9761</strong>.
            </p>
            <p className="font-body-sm text-body-sm text-white/60 pt-1">
              No real Personally Identifiable Information (PII) is stored or transferred outside this research prototype.
            </p>
          </div>

          {/* Column 4 */}
          <div className="space-y-space-xs">
            <h4 className="font-title-md text-title-md font-bold text-white tracking-wide">
              {t('footerSupport')}
            </h4>
            <div className="space-y-2 font-body-sm text-body-sm text-white/70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-status-ready">call</span>
                <span>Toll Free Krishi Helpdesk: <strong>1800-425-1661</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">mail</span>
                <span>dbt-support.thrissur@kerala.gov.in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-accent-saffron">schedule</span>
                <span>Hours: 10:00 AM – 05:00 PM (IST)</span>
              </div>
            </div>
            <div className="pt-2 text-white/50 text-[11px] font-mono">
              System Node: KB-TCR-CL04 · Server Time: 2026-10-16 IST
            </div>
          </div>
        </div>

        {/* Bottom Legal Strip */}
        <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-white/60 font-body-sm text-[12px]">
          <div>
            Academic Prototype for PM-KISAN Direct Benefit Transfer Error Remediation. Designed for Agricultural Officers.
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a href="#" className="hover:text-white transition-colors">{t('footerTerms')}</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">{t('footerHyperlink')}</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">{t('footerSecurity')}</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">{t('footerSitemap')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
