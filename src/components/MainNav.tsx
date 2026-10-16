import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

interface MainNavProps {
  taskCount?: number;
}

export const MainNav: React.FC<MainNavProps> = ({ taskCount = 14 }) => {
  const { currentUser } = useAuthStore();
  const { t } = useUIStore();

  const role = currentUser.role;

  // Role-relevant navigation items
  // Core requirement: "Every role need not have same access. they only need to access their relevent info, actions tehy need ot do . make status of payment processing status common for all roles."
  const navItems = [
    // Farmer Personal Record
    {
      to: '/cases',
      label: 'My PM-KISAN Record (എൻ്റെ വിവരങ്ങൾ)',
      visible: role === 'farmer',
    },

    // Krishi Bhavan & District Nodal Desks
    {
      to: '/dashboard',
      label: t('navDashboard'),
      visible: role === 'krishi_bhavan' || role === 'district_nodal',
    },
    {
      to: '/escalations',
      label: role === 'district_nodal' ? 'District Escalation Board' : t('navEscalations'),
      visible: role === 'district_nodal' || role === 'krishi_bhavan',
    },

    // Partner Agency Tasks (Bank, Akshaya, Village Office)
    {
      to: '/tasks',
      label:
        role === 'bank_branch'
          ? 'Banking & NPCI Tasks Desk'
          : role === 'akshaya'
          ? 'Akshaya e-KYC Desk'
          : role === 'village_office'
          ? 'Village Land RoR Desk'
          : t('navTasks'),
      badge: taskCount > 0 ? taskCount : undefined,
      visible: role === 'bank_branch' || role === 'akshaya' || role === 'village_office',
    },

    // Officer Cases Queue
    {
      to: '/cases',
      label:
        role === 'bank_branch'
          ? 'Bank Linked Cases'
          : role === 'akshaya'
          ? 'e-KYC Tokens'
          : role === 'village_office'
          ? 'Cadastre Disputes'
          : t('navCases'),
      visible: role !== 'farmer',
    },

    // COMMON TO ALL ROLES: Payment Processing Status
    {
      to: '/payment-status',
      label: role === 'farmer' ? 'Payment Status (പേയ്മെന്റ് സ്ഥിതി)' : 'Payment Processing Status (വിതരണ സ്ഥിതി)',
      visible: true, // Visible to all roles!
      highlight: true,
    },

    // Voice Assist
    {
      to: '/voice/K104',
      label: role === 'farmer' ? 'Malayalam Audio Advice (ശബ്ദ സന്ദേശം)' : t('navVoice'),
      visible: role === 'krishi_bhavan' || role === 'district_nodal' || role === 'farmer',
    },

    // Revalidate Engine
    {
      to: '/revalidate',
      label: t('navRevalidate'),
      visible: role === 'krishi_bhavan' || role === 'bank_branch' || role === 'district_nodal',
    },

    // Reports & Analytics
    {
      to: '/reports',
      label: t('navReports'),
      visible: role === 'krishi_bhavan' || role === 'district_nodal',
    },

    // System Import / Sync
    {
      to: '/import',
      label: t('navImport'),
      visible: role === 'district_nodal',
    },
  ];

  return (
    <nav
      aria-label="Primary Administrative Navigation"
      className="bg-primary-container text-on-primary shadow-sm flex-shrink-0"
    >
      <div className="max-w-7xl mx-auto px-gutter flex items-center justify-between overflow-x-auto">
        <div className="flex items-center">
          {navItems
            .filter((item) => item.visible)
            .map((item) => (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                className={({ isActive }) =>
                  `transition-colors px-space-md py-3.5 whitespace-nowrap font-label-md text-label-md flex items-center gap-1.5 border-b-2 ${
                    isActive
                      ? 'bg-primary text-on-primary font-bold border-accent-saffron'
                      : 'text-on-primary/90 hover:text-on-primary hover:bg-primary/50 border-transparent'
                  }`
                }
              >
                {item.highlight && (
                  <span className="material-symbols-outlined text-[16px] text-accent-saffron">
                    account_balance_wallet
                  </span>
                )}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-status-error text-on-primary font-label-sm text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-space-xs text-on-primary/80 font-body-sm text-body-sm whitespace-nowrap pl-4">
          <span className="inline-block w-2 h-2 rounded-full bg-status-ready animate-pulse" />
          <span>PFMS & NPCI Gateway: Operational</span>
        </div>
      </div>
    </nav>
  );
};
