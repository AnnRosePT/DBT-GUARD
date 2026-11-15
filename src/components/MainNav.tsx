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
  const isOfficer = role === 'krishi_bhavan' || role === 'district_nodal';
  const isPartner = role === 'bank_branch' || role === 'akshaya' || role === 'village_office';
  const [moreOpen, setMoreOpen] = React.useState(false);

  // Main navigation kept to 4 items for officers; partner desks and farmers see only their own tools.
  const navItems: { to: string; label: string; visible: boolean; badge?: number; highlight?: boolean }[] = [
    { to: '/dashboard', label: t('navDashboard'), visible: isOfficer },
    {
      to: '/tasks',
      label: 'My Tasks',
      badge: taskCount > 0 ? taskCount : undefined,
      visible: isPartner,
    },
    { to: '/cases', label: role === 'farmer' ? 'My PM-KISAN Record (എൻ്റെ വിവരങ്ങൾ)' : 'Cases', visible: true },
    {
      to: '/voice/K104',
      label: role === 'farmer' ? 'Malayalam Audio Advice (ശബ്ദ സന്ദേശം)' : 'Voice & Follow-up',
      visible: isOfficer || role === 'farmer',
    },
    { to: '/reports', label: 'Reports', visible: isOfficer },
    {
      to: '/payment-status',
      label: role === 'farmer' ? 'Payment Status (പേയ്മെന്റ് സ്ഥിതി)' : 'Payment Status',
      visible: !isOfficer,
    },
  ];

  // Restricted tools, reachable from a single "More tools" menu (officers only)
  const moreItems = [
    { to: '/escalations', label: role === 'district_nodal' ? 'Escalation Board' : 'Escalations' },
    { to: '/revalidate', label: 'Revalidate' },
    { to: '/payment-status', label: 'Payment Status' },
    ...(role === 'district_nodal' ? [{ to: '/import', label: 'Import Data' }] : []),
  ];

  return (
    <nav
      aria-label="Primary Administrative Navigation"
      className="bg-primary-container text-on-primary shadow-sm flex-shrink-0"
    >
      <div className="max-w-7xl mx-auto px-gutter flex items-center justify-between flex-wrap">
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
          {isOfficer && (
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((o) => !o)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                className="px-space-md py-3.5 whitespace-nowrap font-label-md text-label-md flex items-center gap-1 text-on-primary/90 hover:text-on-primary hover:bg-primary/50 border-b-2 border-transparent"
              >
                <span>More tools</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              {moreOpen && (
                <div role="menu" className="absolute left-0 top-full z-50 mt-0.5 w-48 rounded-lg bg-surface-card text-on-surface shadow-lg border border-border-subtle py-1">
                  {moreItems.map((m) => (
                    <NavLink
                      key={m.to}
                      to={m.to}
                      role="menuitem"
                      className="block px-3 py-2 text-sm hover:bg-surface-container-low"
                    >
                      {m.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-space-xs text-on-primary/80 font-body-sm text-body-sm whitespace-nowrap pl-4">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-saffron" />
          <span>Demo mode · simulated PFMS / NPCI data</span>
        </div>
      </div>
    </nav>
  );
};
