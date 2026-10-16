import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser, verifySession } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Validate session token on route navigation
  const isValidSession = isAuthenticated && verifySession();

  if (!isValidSession) {
    // Redirect to login page and keep attempted route in history
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if specified
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-surface-card rounded-2xl p-space-lg border border-status-error/30 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-status-error-bg text-status-error flex items-center justify-center mx-auto border border-status-error/40">
            <span className="material-symbols-outlined text-[36px]">security</span>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-status-error font-bold bg-status-error-bg px-2.5 py-0.5 rounded-full border border-status-error/30 inline-block">
              403 • Role Access Restriction
            </span>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              Jurisdiction Clearance Required
            </h2>
            <p className="font-title-sm text-title-sm text-secondary">
              (അധികാര പരിധിക്ക് പുറത്തുള്ള പേജ് • പ്രവേശനം അനുവദനീയമല്ല)
            </p>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl text-left border border-border-subtle space-y-2">
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Logged-in Officer:</span>
              <span className="font-bold text-primary">{currentUser.name}</span>
            </div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Operational Desk:</span>
              <span className="font-bold text-secondary">{currentUser.designation}</span>
            </div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Clearance Level:</span>
              <span className="font-bold text-on-surface">{currentUser.badge}</span>
            </div>
            <div className="pt-2 border-t border-border-subtle text-[12px] text-on-surface-variant leading-relaxed">
              Under Kerala Digital Personal Data Protection (DPDP) Act 2023 & PM-KISAN Inter-Agency Protocols, this desk is restricted to authorized departmental desks ({allowedRoles.join(', ')}).
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (currentUser.role === 'krishi_bhavan') navigate('/dashboard');
                else if (currentUser.role === 'bank_branch' || currentUser.role === 'akshaya' || currentUser.role === 'village_office') navigate('/tasks');
                else if (currentUser.role === 'district_nodal') navigate('/escalations');
                else navigate('/cases');
              }}
              className="bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Return to My Authorized Desk</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
