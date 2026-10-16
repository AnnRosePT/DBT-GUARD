import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, USER_PERSONAS } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useAppStore } from '../store/useAppStore';
import type { Role } from '../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, login, signup, lockoutUntil, failedAttempts, resetLockout } = useAuthStore();
  const { addToast } = useUIStore();
  const { cases, loadDemoData } = useAppStore();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Common role state
  const [selectedRole, setSelectedRole] = useState<Role>('krishi_bhavan');

  // Sign in form state
  const [username, setUsername] = useState('anitha.agri');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [captchaCode, setCaptchaCode] = useState('84927');
  const [enteredCaptcha, setEnteredCaptcha] = useState('84927');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign up form state
  const [signupRole, setSignupRole] = useState<Role>('krishi_bhavan');
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [signupCaptcha, setSignupCaptcha] = useState('51294');
  const [enteredSignupCaptcha, setEnteredSignupCaptcha] = useState('51294');

  // Lockout countdown timer
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemaining(0);
      return;
    }
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining === 0) {
        resetLockout();
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil, resetLockout]);

  // When selected role changes, update default demo credentials for easy testing
  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setErrorMessage(null);
    switch (role) {
      case 'krishi_bhavan':
        setUsername('anitha.agri');
        break;
      case 'bank_branch':
        setUsername('suresh.sbi');
        break;
      case 'akshaya':
        setUsername('shabna.akshaya');
        break;
      case 'village_office':
        setUsername('thomas.rev');
        break;
      case 'district_nodal':
        setUsername('latha.nodal');
        break;
      case 'farmer':
        setUsername('ravi.farmer');
        break;
    }
    setPassword('password123');
  };

  const handleSignupRoleChange = (role: Role) => {
    setSignupRole(role);
    const template = USER_PERSONAS[role];
    setOfficeName(template.office);
    switch (role) {
      case 'krishi_bhavan':
        setEmployeeId('AGRI-TSR-');
        break;
      case 'bank_branch':
        setEmployeeId('SM-');
        break;
      case 'akshaya':
        setEmployeeId('AKSH-');
        break;
      case 'village_office':
        setEmployeeId('VRO-KLM-');
        break;
      case 'district_nodal':
        setEmployeeId('JDA-TSR-');
        break;
      case 'farmer':
        setEmployeeId('KL-TSR-');
        break;
    }
  };

  const reloadCaptcha = () => {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setCaptchaCode(code);
    setEnteredCaptcha(code);
  };

  const reloadSignupCaptcha = () => {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setSignupCaptcha(code);
    setEnteredSignupCaptcha(code);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredCaptcha.trim() !== captchaCode.trim()) {
      setErrorMessage('Captcha verification failed. Please enter the displayed 5-digit security code.');
      reloadCaptcha();
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = login(selectedRole, username, password);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication rejected. Please check your credentials.');
        return;
      }

      const persona = USER_PERSONAS[selectedRole];
      addToast({
        type: 'success',
        title: `Authenticated as ${persona.name}`,
        message: `Active Operational Role: ${persona.designation} (${persona.office})`,
      });

      // Navigate to destination or role default
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from);
      } else if (selectedRole === 'krishi_bhavan') {
        navigate('/dashboard');
      } else if (selectedRole === 'bank_branch' || selectedRole === 'akshaya' || selectedRole === 'village_office') {
        navigate('/tasks');
      } else if (selectedRole === 'district_nodal') {
        navigate('/escalations');
      } else {
        navigate('/cases');
      }
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter officer full name.');
      return;
    }
    if (!employeeId.trim()) {
      setErrorMessage('Please enter officer PEN / Employee / Farmer Registration ID.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid official email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter official mobile number.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter identical passwords.');
      return;
    }
    if (!declarationChecked) {
      setErrorMessage('You must confirm the statutory officer declaration to register.');
      return;
    }
    if (enteredSignupCaptcha.trim() !== signupCaptcha.trim()) {
      setErrorMessage('Captcha verification failed. Please enter the displayed security code.');
      reloadSignupCaptcha();
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedUsername = email.split('@')[0] || employeeId.toLowerCase();
      const result = signup({
        role: signupRole,
        name: fullName,
        username: generatedUsername,
        password: signupPassword,
        employeeId: employeeId,
        office: officeName || USER_PERSONAS[signupRole].office,
        email: email,
        phone: phone,
      });

      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed.');
        return;
      }

      addToast({
        type: 'success',
        title: 'Officer Account Created & Authenticated',
        message: `Registered as ${fullName} (${signupRole}). Secure session active.`,
      });

      if (signupRole === 'krishi_bhavan') {
        navigate('/dashboard');
      } else if (signupRole === 'bank_branch' || signupRole === 'akshaya' || signupRole === 'village_office') {
        navigate('/tasks');
      } else if (signupRole === 'district_nodal') {
        navigate('/escalations');
      } else {
        navigate('/cases');
      }
    }, 400);
  };

  // Quick 1-click persona launcher for instant testing
  const handleQuickLogin = (role: Role) => {
    handleRoleChange(role);
    login(role, USER_PERSONAS[role].id, 'password123');
    const persona = USER_PERSONAS[role];
    addToast({
      type: 'success',
      title: `Logged in as ${persona.name}`,
      message: `${persona.designation} (${persona.office})`,
    });
    if (role === 'krishi_bhavan') navigate('/dashboard');
    else if (role === 'bank_branch' || role === 'akshaya' || role === 'village_office') navigate('/tasks');
    else if (role === 'district_nodal') navigate('/escalations');
    else navigate('/cases');
  };

  // Calculate password strength score (0-4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const pwStrength = getPasswordStrength(signupPassword);

  const activePersona = USER_PERSONAS[selectedRole];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-br from-[#062418] via-[#0b3826] to-[#0f442f] text-on-surface px-4 py-6 sm:py-10 relative selection:bg-accent-saffron selection:text-primary">
      {/* Background Subtle Watermark & Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Government Title & Emblem Header */}
      <header className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-1.5 z-10 mb-4 sm:mb-6">
        {/* National Tricolor Line */}
        <div className="w-48 h-1 flex rounded-full overflow-hidden mb-2 shadow-sm">
          <span className="flex-1 bg-[#FF9933]" />
          <span className="flex-1 bg-white" />
          <span className="flex-1 bg-[#138808]" />
        </div>

        <div className="flex items-center gap-2 text-white/90 font-label-md text-label-md tracking-wider uppercase font-semibold">
          <span className="material-symbols-outlined text-accent-saffron text-[18px]">verified</span>
          <span>Government of Kerala • Department of Agriculture & Farmers' Welfare</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5 text-xs text-white/70">
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
            NIC Jan Samarth • MeriPehchaan Single Sign-On
          </span>
          <span className="hidden sm:inline text-white/40">•</span>
          <span className="bg-status-ready/20 text-status-ready px-2.5 py-0.5 rounded-full font-bold border border-status-ready/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-ready animate-pulse" />
            K-SWAN Secure Node 04: Active
          </span>
        </div>
      </header>

      {/* CENTERED CARD BOX */}
      <div className="w-full max-w-xl mx-auto bg-surface-card rounded-2xl shadow-2xl border border-border-subtle/80 overflow-hidden z-10 transition-all duration-300">
        {/* Card Header Strip with Tricolor */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Brand Banner */}
        <div className="bg-surface-container-low px-6 py-5 border-b border-border-subtle flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary flex flex-col items-center justify-center text-center p-1 shadow-md border border-primary-container flex-shrink-0">
              <span className="material-symbols-outlined text-[24px] text-accent-saffron">shield</span>
              <span className="text-[9px] font-black tracking-widest text-on-primary -mt-1 uppercase">DBT</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-sm text-headline-sm text-primary font-black tracking-tight leading-tight">
                  DBT-GUARD
                </h1>
                <span className="font-label-sm text-[10px] bg-status-ready-bg text-status-ready px-2 py-0.5 rounded-full font-bold border border-status-ready/30 uppercase">
                  Thrissur Pilot
                </span>
              </div>
              <p className="font-label-md text-label-md text-secondary font-bold">
                PM-KISAN DBT Beneficiary Resolution Platform
              </p>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                ഏകീകൃത ഡി.ബി.ടി ഗുണഭോക്തൃ പരിഹാര പോർട്ടൽ
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[11px] font-label-sm uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-status-ready">lock</span>
              TLS 1.3
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono">NIC-AES-256</span>
          </div>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 bg-surface-container-high/50 border-b border-border-subtle p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage(null);
            }}
            className={`py-2 px-4 rounded-lg font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'signin'
                ? 'bg-surface-card text-primary shadow-sm border border-border-subtle'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-card/50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Sign In (പ്രവേശനം)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2 px-4 rounded-lg font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'signup'
                ? 'bg-surface-card text-primary shadow-sm border border-border-subtle'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-card/50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Sign Up (രജിസ്ട്രേഷൻ)</span>
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="p-6 space-y-5">
          {/* Lockout Notice */}
          {lockoutRemaining > 0 && (
            <div className="bg-status-error-bg border border-status-error/40 rounded-xl p-3.5 text-status-error space-y-1">
              <div className="flex items-center gap-2 font-bold text-label-md">
                <span className="material-symbols-outlined text-[20px]">gpp_bad</span>
                <span>Security Rate-Limit Lockout Active</span>
              </div>
              <p className="text-body-sm text-status-error/90 text-[13px]">
                5 consecutive failed authentication attempts detected. This terminal is temporarily restricted for{' '}
                <strong>{lockoutRemaining} seconds</strong> under Section 8 of the Kerala Cyber Security Guidelines.
              </p>
              <button
                type="button"
                onClick={resetLockout}
                className="text-xs text-secondary hover:underline font-bold mt-1 inline-block"
              >
                Reset Lockout (Sandbox Testing Bypass)
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-status-error-bg border border-status-error/40 text-status-error p-3 rounded-lg text-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
              <span className="flex-1 text-[13px]">{errorMessage}</span>
            </div>
          )}

          {/* ================= SIGN IN TAB ================= */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* DROPDOWN TO SPECIFY ROLE (Core Requirement) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="role-select"
                  className="block font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider"
                >
                  Stakeholder Role / ചുമതല <span className="text-status-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                    className="w-full bg-surface-card border-2 border-border-strong rounded-xl p-3 pr-10 font-label-md text-label-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 cursor-pointer transition-all shadow-xs"
                  >
                    <option value="krishi_bhavan">🌾 Krishi Bhavan Official (Agricultural Officer / AEO)</option>
                    <option value="bank_branch">🏦 Bank Branch Desk (Scale II Manager / NPCI Desk)</option>
                    <option value="akshaya">🖨️ CSC / Akshaya e-Kendra (Master Operator)</option>
                    <option value="village_office">🏛️ Village Revenue Office (VRO / RoR Desk)</option>
                    <option value="district_nodal">🛡️ District DBT Nodal Officer (Collectorate Apex Desk)</option>
                    <option value="farmer">👨‍🌾 PM-KISAN Farmer / Beneficiary Self-Service</option>
                  </select>
                </div>
              </div>

              {/* Role Context Preview Badge */}
              <div className="bg-surface-container-low rounded-xl p-3 border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">{activePersona.avatarIcon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-md text-label-md text-primary font-bold">{activePersona.name}</span>
                      <span className="text-[11px] font-label-sm bg-primary/10 text-primary px-1.5 py-0.2 rounded font-semibold">
                        {activePersona.badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface-variant line-clamp-1">
                      {activePersona.office} • {activePersona.jurisdiction}
                    </p>
                  </div>
                </div>
                <span className="text-secondary font-label-sm text-[11px] font-bold hidden sm:inline whitespace-nowrap">
                  Demo Pre-filled
                </span>
              </div>

              {/* Username / PEN Field */}
              <div className="space-y-1">
                <label
                  htmlFor="username-input"
                  className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase"
                >
                  Officer ID / SPARK PEN / Username <span className="text-status-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined text-outline absolute left-3 text-[18px]">badge</span>
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter PEN code or username"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-card border border-border-strong rounded-lg font-data-mono text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password-input"
                    className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase"
                  >
                    Portal Security PIN / Password <span className="text-status-error">*</span>
                  </label>
                  <span className="text-[11px] text-on-surface-variant">Default: password123</span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined text-outline absolute left-3 text-[18px]">lock</span>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-surface-card border border-border-strong rounded-lg font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-outline hover:text-on-surface transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Security CAPTCHA */}
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-surface-card border border-border-strong px-3 py-1.5 rounded font-mono font-black text-headline-sm tracking-widest text-primary line-through select-none shadow-xs"
                    aria-label={`Security Captcha: ${captchaCode}`}
                  >
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={reloadCaptcha}
                    className="p-1 rounded hover:bg-surface-card text-on-surface-variant transition-colors"
                    title="Reload Security Captcha"
                  >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                  </button>
                </div>
                <div className="flex-1 max-w-[160px]">
                  <input
                    type="text"
                    value={enteredCaptcha}
                    onChange={(e) => setEnteredCaptcha(e.target.value)}
                    placeholder="Enter Captcha"
                    maxLength={6}
                    required
                    className="w-full px-2.5 py-1.5 bg-surface-card border border-border-strong rounded-lg font-data-mono text-body-sm text-on-surface text-center focus:outline-none focus:ring-2 focus:ring-secondary uppercase tracking-widest font-bold"
                  />
                </div>
              </div>

              {/* Remember Terminal */}
              <div className="flex items-center justify-between text-body-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface-variant text-[13px]">
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    className="w-4 h-4 rounded text-secondary"
                  />
                  <span>Remember session (K-SWAN IP bound)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPassword('password123');
                    addToast({
                      type: 'info',
                      title: 'Sandbox Password Reset',
                      message: 'Password restored to default: password123',
                    });
                  }}
                  className="text-secondary hover:underline text-[12px] font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || lockoutRemaining > 0}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>Validating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal (പോർട്ടലിൽ പ്രവേശിക്കുക)</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Quick 1-Click Role Access Pills */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px bg-border-subtle" />
                  <span className="text-[11px] font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                    Or Quick 1-Click Persona Login
                  </span>
                  <div className="flex-1 h-px bg-border-subtle" />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('krishi_bhavan')}
                    className="p-1.5 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-surface-container text-center transition-all group"
                    title="Login as Anitha R (Krishi Bhavan)"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary block mx-auto">eco</span>
                    <span className="text-[10px] font-bold text-on-surface block truncate">Krishi Bhavan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('bank_branch')}
                    className="p-1.5 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-surface-container text-center transition-all group"
                    title="Login as Suresh Menon (SBI Bank Desk)"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary block mx-auto">account_balance</span>
                    <span className="text-[10px] font-bold text-on-surface block truncate">Bank Desk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('akshaya')}
                    className="p-1.5 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-surface-container text-center transition-all group"
                    title="Login as Shabna K (Akshaya e-Kendra)"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary block mx-auto">fingerprint</span>
                    <span className="text-[10px] font-bold text-on-surface block truncate">Akshaya</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('village_office')}
                    className="p-1.5 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-surface-container text-center transition-all group"
                    title="Login as Thomas P J (Village Revenue Office)"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary block mx-auto">landscape</span>
                    <span className="text-[10px] font-bold text-on-surface block truncate">Village Office</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('district_nodal')}
                    className="p-1.5 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-surface-container text-center transition-all group"
                    title="Login as Dr. Latha V (District Nodal Officer)"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary block mx-auto">shield_with_house</span>
                    <span className="text-[10px] font-bold text-on-surface block truncate">District Desk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('farmer')}
                    className="p-1.5 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-surface-container text-center transition-all group"
                    title="Login as Ravi K (Farmer Beneficiary)"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary block mx-auto">agriculture</span>
                    <span className="text-[10px] font-bold text-on-surface block truncate">Farmer Self</span>
                  </button>
                </div>
              </div>

              {/* Switch to Sign Up */}
              <div className="text-center pt-2 border-t border-border-subtle">
                <span className="text-body-sm text-on-surface-variant text-[13px]">
                  New officer or desk operator?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                  className="font-label-md text-label-md text-secondary font-bold hover:underline"
                >
                  Sign Up & Register New Account ↗
                </button>
              </div>
            </form>
          )}

          {/* ================= SIGN UP TAB ================= */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* DROPDOWN TO SPECIFY ROLE (Core Requirement in Sign Up too) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-role-select"
                  className="block font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider"
                >
                  Select Stakeholder Role to Register <span className="text-status-error">*</span>
                </label>
                <select
                  id="signup-role-select"
                  value={signupRole}
                  onChange={(e) => handleSignupRoleChange(e.target.value as Role)}
                  className="w-full bg-surface-card border-2 border-border-strong rounded-xl p-3 pr-10 font-label-md text-label-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 cursor-pointer transition-all shadow-xs"
                >
                  <option value="krishi_bhavan">🌾 Krishi Bhavan Official (Agricultural Extension Officer)</option>
                  <option value="bank_branch">🏦 Bank Branch Officer (Lead Bank / Scale II Desk)</option>
                  <option value="akshaya">🖨️ CSC / Akshaya Kendra Operator</option>
                  <option value="village_office">🏛️ Village Revenue Officer (VRO / RoR Desk)</option>
                  <option value="district_nodal">🛡️ District DBT Nodal Authority</option>
                  <option value="farmer">👨‍🌾 Farmer / Beneficiary Self-Registration</option>
                </select>
              </div>

              {/* Full Name & Employee ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
                    Officer Full Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Priya Nair"
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
                    PEN / Employee / Farmer ID <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. AGRI-TSR-9912"
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg font-data-mono text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary uppercase"
                  />
                </div>
              </div>

              {/* Office & Jurisdiction */}
              <div className="space-y-1">
                <label className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
                  Designated Office / Branch Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder="e.g. Krishi Bhavan Ollur, Thrissur"
                  required
                  className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
                    Official Email <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@kerala.gov.in"
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
                    Official Mobile <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94470 XXXXX"
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
                    Create Password <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min. 6 alphanumeric"
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
                    Confirm Password <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-3 py-2 bg-surface-card border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {signupPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-on-surface-variant">Password Strength:</span>
                    <span
                      className={
                        pwStrength >= 3 ? 'text-status-ready' : pwStrength === 2 ? 'text-status-warning' : 'text-status-error'
                      }
                    >
                      {pwStrength >= 3 ? 'Strong' : pwStrength === 2 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
                    <span className={`flex-1 rounded-full ${pwStrength >= 1 ? 'bg-status-error' : 'bg-transparent'}`} />
                    <span className={`flex-1 rounded-full ${pwStrength >= 2 ? 'bg-status-warning' : 'bg-transparent'}`} />
                    <span className={`flex-1 rounded-full ${pwStrength >= 3 ? 'bg-status-ready' : 'bg-transparent'}`} />
                    <span className={`flex-1 rounded-full ${pwStrength >= 4 ? 'bg-accent-green' : 'bg-transparent'}`} />
                  </div>
                </div>
              )}

              {/* Statutory Declaration */}
              <div className="bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={declarationChecked}
                    onChange={(e) => setDeclarationChecked(e.target.checked)}
                    required
                    className="w-4 h-4 rounded text-secondary mt-0.5"
                  />
                  <span className="text-[12px] text-on-surface-variant leading-relaxed">
                    I solemnly affirm that I am an authorized stakeholder officer under the Government of Kerala /
                    SLBC / Revenue Dept / KSITM. False declaration is punishable under IT Act 2000 & Kerala Public
                    Services Code.
                  </span>
                </label>
              </div>

              {/* Signup Captcha */}
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-surface-card border border-border-strong px-3 py-1.5 rounded font-mono font-black text-headline-sm tracking-widest text-primary line-through select-none shadow-xs">
                    {signupCaptcha}
                  </div>
                  <button
                    type="button"
                    onClick={reloadSignupCaptcha}
                    className="p-1 rounded hover:bg-surface-card text-on-surface-variant transition-colors"
                    title="Reload Security Captcha"
                  >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                  </button>
                </div>
                <div className="flex-1 max-w-[160px]">
                  <input
                    type="text"
                    value={enteredSignupCaptcha}
                    onChange={(e) => setEnteredSignupCaptcha(e.target.value)}
                    placeholder="Captcha"
                    maxLength={6}
                    required
                    className="w-full px-2.5 py-1.5 bg-surface-card border border-border-strong rounded-lg font-data-mono text-body-sm text-on-surface text-center focus:outline-none focus:ring-2 focus:ring-secondary uppercase tracking-widest font-bold"
                  />
                </div>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all font-bold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>Creating Officer Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Register & Create Officer Account</span>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </>
                )}
              </button>

              {/* Switch back to Sign In */}
              <div className="text-center pt-2 border-t border-border-subtle">
                <span className="text-body-sm text-on-surface-variant text-[13px]">
                  Already have an authorized account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                  }}
                  className="font-label-md text-label-md text-secondary font-bold hover:underline"
                >
                  Sign In to Portal ↗
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Info Strip */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-white/70 font-body-sm text-[12px] z-10 mt-6 pt-3 border-t border-white/10 text-center sm:text-left">
        <div>
          <span>Toll-Free Kisan Call Centre: <strong>1800-180-1551</strong></span>
          <span className="mx-2 hidden sm:inline">|</span>
          <span>District DBT Cell Thrissur: <strong>0487-2361245</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>GIGW 3.0 & DPDP Act 2023 Compliant</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              loadDemoData();
              addToast({
                type: 'info',
                title: 'Data Synced',
                message: `Active 1,000 baseline cases ready.`,
              });
            }}
            className="text-accent-saffron hover:underline font-bold"
          >
            Reload Dataset ({cases.length || 1000})
          </button>
        </div>
      </footer>
    </div>
  );
};
