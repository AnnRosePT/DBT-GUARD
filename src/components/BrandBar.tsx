import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';

interface BrandBarProps {
  onSearch?: (query: string, category: string) => void;
  onTriageTagClick?: (tag: string) => void;
}

export const BrandBar: React.FC<BrandBarProps> = ({ onSearch, onTriageTagClick }) => {
  const navigate = useNavigate();
  const { searchCategory, searchQuery, setSearchCategory, setSearchQuery, t } = useUIStore();
  const { currentUser, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, searchCategory);
    } else {
      navigate(`/cases?q=${encodeURIComponent(searchQuery)}&cat=${encodeURIComponent(searchCategory)}`);
    }
  };

  const handleTagClick = (tag: string) => {
    if (onTriageTagClick) {
      onTriageTagClick(tag);
    } else {
      navigate(`/cases?issue=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="bg-surface-card border-b border-border-subtle py-space-sm flex-shrink-0">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col lg:flex-row items-center justify-between gap-space-md">
        {/* Brand & Logo Section */}
        <div
          className="flex items-center gap-space-md cursor-pointer select-none"
          onClick={() => navigate('/dashboard')}
        >
          {/* Custom Shield + Leaf Logo (No government emblem) */}
          <div className="w-12 h-12 rounded-lg bg-primary flex flex-col items-center justify-center text-center p-1 shadow-sm flex-shrink-0 border border-primary-container">
            <div className="flex items-center justify-center text-accent-saffron">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <span className="font-label-sm text-[9px] font-black tracking-widest text-on-primary -mt-1 uppercase">
              DBT
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display-lg text-[26px] leading-tight text-primary tracking-tight font-black">
                {t('appName')}
              </span>
              <span className="font-label-sm text-label-sm bg-status-ready-bg text-status-ready px-2 py-0.5 rounded-full font-bold uppercase border border-status-ready/30">
                {t('pilotBadge')}
              </span>
            </div>
            <p className="font-label-md text-label-md text-secondary font-bold tracking-wide uppercase">
              {t('tagline')}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
              {t('subtagline')}
            </p>
          </div>
        </div>

        {/* Global Search & Triage Bar (Officers) or Identity Shield Bar (Farmer) */}
        {currentUser.role === 'farmer' ? (
          <div className="w-full lg:max-w-xl bg-surface-container-low p-3 rounded-xl border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-status-ready/20 text-status-ready flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-primary text-[13px]">{currentUser.name}</span>
                  <span className="text-[10px] bg-status-ready-bg text-status-ready px-1.5 py-0.2 rounded font-bold uppercase">
                    Verified Citizen
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant block font-data-mono">
                  PM-KISAN ID: KL-TSR-0001 • Dossier #K104
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate('/payment-status')}
                className="bg-primary hover:bg-primary-container text-on-primary text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">payments</span>
                <span>Payment Status</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/cases/K104')}
                className="bg-surface-card hover:bg-surface-container text-secondary text-[11px] font-bold px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1 transition-colors"
              >
                <span>My Dossier</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full lg:max-w-xl flex flex-col gap-1.5">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center shadow-sm rounded-lg overflow-hidden border border-border-strong bg-surface-card focus-within:ring-2 focus-within:ring-secondary"
            >
              <label className="sr-only" htmlFor="portal-category-select">
                {t('allCategories')}
              </label>
              <select
                id="portal-category-select"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="bg-surface-container-low text-on-surface font-label-md text-label-md px-3 py-2 border-r border-border-subtle focus:outline-none cursor-pointer hidden sm:block"
              >
                <option value="All Categories">{t('allCategories')}</option>
                <option value="Farmers">{t('catFarmers')}</option>
                <option value="Cases">{t('catCases')}</option>
                <option value="Offices">{t('catOffices')}</option>
              </select>

              <div className="relative flex-1 flex items-center">
                <span className="material-symbols-outlined text-outline absolute left-3 pointer-events-none text-[20px]">
                  search
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none bg-surface-card"
                />
              </div>

              <button
                type="submit"
                className="bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg px-space-md py-2 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span className="hidden sm:inline">{t('searchBtn')}</span>
              </button>
            </form>

            {/* Quick Trending Triage Chips */}
            <div className="flex items-center gap-1.5 flex-wrap font-label-sm text-label-sm text-on-surface-variant">
              <span className="font-bold text-on-surface flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] text-accent-saffron">trending_up</span>
                {t('trendingTriage')}
              </span>
              <button
                type="button"
                onClick={() => handleTagClick('Pending e-KYC')}
                className="bg-status-warning-bg text-disclaimer-banner-text border border-status-warning/40 px-2 py-0.5 rounded-full hover:bg-status-warning/20 transition-colors"
              >
                Pending e-KYC (142)
              </button>
              <button
                type="button"
                onClick={() => handleTagClick('Aadhaar not mapped in NPCI')}
                className="bg-status-error-bg text-status-error border border-status-error/40 px-2 py-0.5 rounded-full hover:bg-status-error/20 transition-colors font-semibold"
              >
                Aadhaar not mapped (89)
              </button>
              <button
                type="button"
                onClick={() => handleTagClick('Land Seeding')}
                className="bg-surface-container-high text-on-surface border border-outline-variant px-2 py-0.5 rounded-full hover:bg-surface-variant transition-colors"
              >
                Land Seeding (34)
              </button>
              <button
                type="button"
                onClick={() => handleTagClick('Overdue')}
                className="bg-status-error-bg text-status-error font-bold border border-status-error/40 px-2 py-0.5 rounded-full hover:bg-status-error/20 transition-colors"
              >
                Overdue &gt; 7 days (58)
              </button>
            </div>
          </div>
        )}

        {/* User Identity & Logout Profile */}
        <div className="hidden xl:flex items-center gap-space-md border-l border-border-subtle pl-space-lg flex-shrink-0">
          <div className="flex flex-col text-right">
            <span className="font-title-md text-title-md text-primary font-bold leading-tight">
              {currentUser.name}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {currentUser.office}
            </span>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-label-sm text-label-sm text-secondary hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">switch_account</span>
                Switch Role
              </button>
              <span className="text-border-strong text-xs">·</span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-label-sm text-label-sm text-status-error hover:underline flex items-center gap-0.5"
                title="Secure Sign Out"
              >
                <span className="material-symbols-outlined text-[12px]">logout</span>
                Logout
              </button>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm border border-secondary">
            <span className="material-symbols-outlined text-on-primary text-[20px]">
              {currentUser.avatarIcon || 'person'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
