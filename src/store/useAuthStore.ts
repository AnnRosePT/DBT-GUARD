import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, UserPersona, RegisteredUser } from '../types';
import { useAppStore } from './useAppStore';

export const USER_PERSONAS: Record<Role, UserPersona> = {
  krishi_bhavan: {
    id: 'kb_anitha',
    name: 'Anitha R',
    designation: 'Agricultural Officer (Gazetted)',
    role: 'krishi_bhavan',
    office: 'Krishi Bhavan Thrissur West',
    jurisdiction: 'Thrissur West Circle (8 Grama Panchayats)',
    avatarIcon: 'person',
    badge: 'AEO / Gazetted',
  },
  bank_branch: {
    id: 'bank_suresh',
    name: 'Suresh Menon',
    designation: 'Scale II Manager (ID: SM-7489)',
    role: 'bank_branch',
    office: 'State Bank of India (SBI Irinjalakuda)',
    jurisdiction: 'SBIN0008618 - Irinjalakuda',
    avatarIcon: 'account_balance',
    badge: 'Banking / NPCI Desk',
  },
  akshaya: {
    id: 'akshaya_shabna',
    name: 'Shabna K',
    designation: 'Master Operator',
    role: 'akshaya',
    office: 'Akshaya e-Kendra #042 (Kattoor)',
    jurisdiction: 'Kattoor Grama Panchayat',
    avatarIcon: 'fingerprint',
    badge: 'Citizen e-Kendra',
  },
  village_office: {
    id: 'village_thomas',
    name: 'Thomas P J',
    designation: 'Village Revenue Officer (VRO)',
    role: 'village_office',
    office: 'Karalam Village Revenue Office',
    jurisdiction: 'Mukundapuram Taluk',
    avatarIcon: 'landscape',
    badge: 'Land Cadastre / RoR',
  },
  district_nodal: {
    id: 'district_latha',
    name: 'Dr. Latha V',
    designation: 'Joint Director of Agriculture & District DBT Nodal Officer',
    role: 'district_nodal',
    office: 'District DBT Nodal Desk, Thrissur Collectorate',
    jurisdiction: 'Thrissur District (16 Blocks, 86 Panchayats)',
    avatarIcon: 'verified_user',
    badge: 'Apex District Authority',
  },
  farmer: {
    id: 'farmer_ravi',
    name: 'Ravi K',
    designation: 'PM-KISAN Beneficiary Farmer (ID: KL-TSR-0001)',
    role: 'farmer',
    office: 'Kattoor Grama Panchayat, Thrissur',
    jurisdiction: 'Survey No. 412/1A, Kattoor Village',
    avatarIcon: 'agriculture',
    badge: 'Beneficiary Self-Service',
    farmerId: 'KL-TSR-0001',
    caseId: 'K104',
  },
};

export const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: 'user_kb_anitha',
    username: 'anitha.agri',
    passwordHash: 'password123',
    role: 'krishi_bhavan',
    name: 'Anitha R',
    designation: 'Agricultural Officer (Gazetted)',
    office: 'Krishi Bhavan Thrissur West',
    jurisdiction: 'Thrissur West Circle (8 Grama Panchayats)',
    email: 'anitha.agri@kerala.gov.in',
    phone: '+91 94471 20042',
    employeeId: 'AGRI-TSR-4891',
    department: "Department of Agriculture & Farmers' Welfare (Krishi Bhavan)",
    createdAt: '2026-01-10T09:00:00Z',
    badge: 'AEO / Gazetted',
    avatarIcon: 'person',
  },
  {
    id: 'user_bank_suresh',
    username: 'suresh.sbi',
    passwordHash: 'password123',
    role: 'bank_branch',
    name: 'Suresh Menon',
    designation: 'Scale II Manager (ID: SM-7489)',
    office: 'State Bank of India (SBI Irinjalakuda)',
    jurisdiction: 'SBIN0008618 - Irinjalakuda',
    email: 'suresh.menon@sbi.co.in',
    phone: '+91 94460 31189',
    employeeId: 'SM-7489',
    department: 'Lead Bank & Commercial Banking Liaison (SLBC Kerala)',
    createdAt: '2026-01-12T10:15:00Z',
    badge: 'Banking / NPCI Desk',
    avatarIcon: 'account_balance',
  },
  {
    id: 'user_akshaya_shabna',
    username: 'shabna.akshaya',
    passwordHash: 'password123',
    role: 'akshaya',
    name: 'Shabna K',
    designation: 'Master Operator',
    office: 'Akshaya e-Kendra #042 (Kattoor)',
    jurisdiction: 'Kattoor Grama Panchayat',
    email: 'shabna.akshaya@kerala.gov.in',
    phone: '+91 98460 74123',
    employeeId: 'AKSH-042',
    department: 'Kerala State IT Mission (CSC / Akshaya e-Kendras)',
    createdAt: '2026-01-15T11:30:00Z',
    badge: 'Citizen e-Kendra',
    avatarIcon: 'fingerprint',
  },
  {
    id: 'user_village_thomas',
    username: 'thomas.rev',
    passwordHash: 'password123',
    role: 'village_office',
    name: 'Thomas P J',
    designation: 'Village Revenue Officer (VRO)',
    office: 'Karalam Village Revenue Office',
    jurisdiction: 'Mukundapuram Taluk',
    email: 'thomas.rev@kerala.gov.in',
    phone: '+91 94472 88419',
    employeeId: 'VRO-KLM-102',
    department: 'Department of Revenue & Land Cadastre (ReLIS / RoR)',
    createdAt: '2026-01-18T14:20:00Z',
    badge: 'Land Cadastre / RoR',
    avatarIcon: 'landscape',
  },
  {
    id: 'user_district_latha',
    username: 'latha.nodal',
    passwordHash: 'password123',
    role: 'district_nodal',
    name: 'Dr. Latha V',
    designation: 'Joint Director of Agriculture & District DBT Nodal Officer',
    office: 'District DBT Nodal Desk, Thrissur Collectorate',
    jurisdiction: 'Thrissur District (16 Blocks, 86 Panchayats)',
    email: 'latha.agri@kerala.gov.in',
    phone: '+91 94470 12001',
    employeeId: 'JDA-TSR-001',
    department: 'District Agriculture Office / Collectorate Apex DBT Cell',
    createdAt: '2026-01-05T08:45:00Z',
    badge: 'Apex District Authority',
    avatarIcon: 'verified_user',
  },
  {
    id: 'user_farmer_ravi',
    username: 'ravi.farmer',
    passwordHash: 'password123',
    role: 'farmer',
    name: 'Ravi K',
    designation: 'PM-KISAN Beneficiary Farmer (ID: KL-TSR-0001)',
    office: 'Kattoor Grama Panchayat, Thrissur',
    jurisdiction: 'Survey No. 412/1A, Kattoor Village',
    email: 'ravi.k@keralafarmer.in',
    phone: '+91 98460 78412',
    employeeId: 'KL-TSR-0001',
    department: 'Farmer / Beneficiary Self-Service Desk',
    createdAt: '2026-02-01T12:00:00Z',
    badge: 'Beneficiary Self-Service',
    avatarIcon: 'agriculture',
    farmerId: 'KL-TSR-0001',
    caseId: 'K104',
  },
];

interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserPersona;
  token: string | null;
  sessionExpiry: number | null;
  registeredUsers: RegisteredUser[];
  failedAttempts: number;
  lockoutUntil: number | null;

  login: (role: Role, username: string, password?: string) => { success: boolean; error?: string };
  signup: (userData: {
    role: Role;
    name: string;
    username: string;
    password: string;
    employeeId: string;
    office: string;
    jurisdiction?: string;
    email: string;
    phone: string;
    department?: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  setRole: (role: Role) => void;
  setUser: (user: UserPersona) => void;
  verifySession: () => boolean;
  resetLockout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false, // Default to false so initial landing page is Login!
      currentUser: USER_PERSONAS.krishi_bhavan,
      token: null,
      sessionExpiry: null,
      registeredUsers: DEFAULT_USERS,
      failedAttempts: 0,
      lockoutUntil: null,

      login: (role, username, password = '') => {
        const state = get();
        const now = Date.now();

        // Check rate limiting / lockout
        if (state.lockoutUntil && now < state.lockoutUntil) {
          const remainingSecs = Math.ceil((state.lockoutUntil - now) / 1000);
          return {
            success: false,
            error: `Security Lockout Active: Too many failed attempts. Please wait ${remainingSecs}s before retrying. (DPDP Act 2023 Rate Limiting)`,
          };
        }

        // Clean username comparison (case-insensitive trim)
        const cleanUser = username.trim().toLowerCase();

        // Find user by username or employeeId or fallback to persona for the selected role
        const matchedUser = state.registeredUsers.find(
          (u) =>
            u.role === role &&
            (u.username.toLowerCase() === cleanUser ||
              u.employeeId.toLowerCase() === cleanUser ||
              u.email.toLowerCase() === cleanUser)
        );

        // For convenience in testing / demo mode:
        // Accept password123, or matched password, or if username matches the persona
        const isValid =
          (matchedUser && (password === matchedUser.passwordHash || password === 'password123' || !password)) ||
          (!matchedUser && password === 'password123') ||
          cleanUser.includes(role.slice(0, 3));

        if (!isValid) {
          const newFailed = state.failedAttempts + 1;
          const isLocked = newFailed >= 5;
          const lockoutTime = isLocked ? now + 60 * 1000 : null; // 60s lockout

          set({
            failedAttempts: newFailed,
            lockoutUntil: lockoutTime,
          });

          // Log failed attempt in system audit log
          try {
            useAppStore.getState().addAuditLog({
              user_name: username || 'Unknown User',
              role: role,
              case_id: 'AUTH_GATEWAY',
              action: 'Security: Authentication Failed',
              old_state: 'Unauthenticated',
              new_state: isLocked ? 'Account Locked (60s)' : 'Authentication Rejected',
              reason: `Invalid credentials supplied for role ${role}. Failed attempt #${newFailed} of 5.`,
            });
          } catch {
            // Ignore audit store init lag
          }

          return {
            success: false,
            error: isLocked
              ? 'Security Threshold Reached: Account locked for 60 seconds due to 5 consecutive failed attempts.'
              : `Invalid Credentials. Please check username and password (Default: password123). Attempt ${newFailed}/5.`,
          };
        }

        // Resolve persona
        let persona: UserPersona;
        if (matchedUser) {
          persona = {
            id: matchedUser.id,
            name: matchedUser.name,
            designation: matchedUser.designation,
            role: matchedUser.role,
            office: matchedUser.office,
            jurisdiction: matchedUser.jurisdiction,
            avatarIcon: matchedUser.avatarIcon,
            badge: matchedUser.badge,
            farmerId: matchedUser.farmerId || (role === 'farmer' ? 'KL-TSR-0001' : undefined),
            caseId: matchedUser.caseId || (role === 'farmer' ? 'K104' : undefined),
          };
        } else {
          persona = USER_PERSONAS[role];
        }

        const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
        const sessionExpiry = now + sessionDuration;
        const mockJwt = `dbt_jwt_${btoa(JSON.stringify({ sub: persona.id, role: persona.role, exp: sessionExpiry, iss: 'kswan_auth' }))}`;

        set({
          isAuthenticated: true,
          currentUser: persona,
          token: mockJwt,
          sessionExpiry,
          failedAttempts: 0,
          lockoutUntil: null,
        });

        // Log successful auth in system audit log
        try {
          useAppStore.getState().addAuditLog({
            user_name: persona.name,
            role: persona.designation,
            case_id: 'AUTH_GATEWAY',
            action: 'User Authentication Successful',
            old_state: 'Unauthenticated',
            new_state: 'Session Active (K-SWAN)',
            reason: `Officer authenticated into ${persona.office} via Role-Based Access Control (RBAC). Session valid for 2h.`,
          });
        } catch {
          // Ignore
        }

        return { success: true };
      },

      signup: (userData) => {
        const state = get();
        const cleanUser = userData.username.trim().toLowerCase();

        // Check if username/PEN already registered
        const exists = state.registeredUsers.some(
          (u) =>
            u.username.toLowerCase() === cleanUser ||
            u.employeeId.toLowerCase() === userData.employeeId.trim().toLowerCase()
        );

        if (exists) {
          return {
            success: false,
            error: `Registration Conflict: An officer with username '${userData.username}' or ID '${userData.employeeId}' already exists. Please sign in or use unique credentials.`,
          };
        }

        if (userData.password.length < 6) {
          return {
            success: false,
            error: 'Password Policy Violation: Password must be at least 6 characters long.',
          };
        }

        const roleTemplate = USER_PERSONAS[userData.role];
        const newRegisteredUser: RegisteredUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          username: userData.username.trim(),
          passwordHash: userData.password,
          role: userData.role,
          name: userData.name.trim(),
          designation: `${userData.name.trim()} (${roleTemplate.badge})`,
          office: userData.office.trim() || roleTemplate.office,
          jurisdiction: userData.jurisdiction?.trim() || roleTemplate.jurisdiction,
          email: userData.email.trim(),
          phone: userData.phone.trim(),
          employeeId: userData.employeeId.trim(),
          department: userData.department?.trim() || "Department of Agriculture & Farmers' Welfare",
          createdAt: new Date().toISOString(),
          badge: roleTemplate.badge,
          avatarIcon: roleTemplate.avatarIcon,
        };

        const updatedUsers = [...state.registeredUsers, newRegisteredUser];
        set({ registeredUsers: updatedUsers });

        // Auto login the newly registered user
        const now = Date.now();
        const sessionExpiry = now + 2 * 60 * 60 * 1000;
        const mockJwt = `dbt_jwt_${btoa(JSON.stringify({ sub: newRegisteredUser.id, role: newRegisteredUser.role, exp: sessionExpiry, iss: 'kswan_auth' }))}`;

        const newPersona: UserPersona = {
          id: newRegisteredUser.id,
          name: newRegisteredUser.name,
          designation: newRegisteredUser.designation,
          role: newRegisteredUser.role,
          office: newRegisteredUser.office,
          jurisdiction: newRegisteredUser.jurisdiction,
          avatarIcon: newRegisteredUser.avatarIcon,
          badge: newRegisteredUser.badge,
        };

        set({
          isAuthenticated: true,
          currentUser: newPersona,
          token: mockJwt,
          sessionExpiry,
          failedAttempts: 0,
          lockoutUntil: null,
        });

        // Audit log registration
        try {
          useAppStore.getState().addAuditLog({
            user_name: newRegisteredUser.name,
            role: newRegisteredUser.designation,
            case_id: 'AUTH_GATEWAY',
            action: 'New Stakeholder Registered',
            old_state: 'Unregistered',
            new_state: 'Active Officer Account',
            reason: `New registration completed for ${newRegisteredUser.role} under ${newRegisteredUser.office} (ID: ${newRegisteredUser.employeeId}).`,
          });
        } catch {
          // Ignore
        }

        return { success: true };
      },

      logout: () => {
        const state = get();
        const prevUser = state.currentUser;

        set({
          isAuthenticated: false,
          token: null,
          sessionExpiry: null,
        });

        try {
          useAppStore.getState().addAuditLog({
            user_name: prevUser?.name || 'Officer',
            role: prevUser?.designation || 'Stakeholder',
            case_id: 'AUTH_GATEWAY',
            action: 'User Session Terminated',
            old_state: 'Session Active',
            new_state: 'Unauthenticated / Logged Out',
            reason: 'Explicit logout requested by user or session invalidated.',
          });
        } catch {
          // Ignore
        }
      },

      setRole: (role) => {
        set({ currentUser: USER_PERSONAS[role] });
      },

      setUser: (user) => set({ currentUser: user }),

      verifySession: () => {
        const state = get();
        if (!state.isAuthenticated || !state.sessionExpiry) return false;
        const now = Date.now();
        if (now > state.sessionExpiry) {
          get().logout();
          return false;
        }
        return true;
      },

      resetLockout: () => {
        set({ failedAttempts: 0, lockoutUntil: null });
      },
    }),
    {
      name: 'dbt_guard_auth_state_v2',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        token: state.token,
        sessionExpiry: state.sessionExpiry,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
