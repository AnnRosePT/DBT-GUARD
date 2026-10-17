import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { smsGateway, type SMSDispatchResult } from '../lib/smsGateway';
import { SmsGatewaySettingsModal } from './SmsGatewaySettingsModal';

interface NicSmsSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhone?: string;
  initialMessage?: string;
  initialFarmerName?: string;
}

export const NicSmsSimulatorModal: React.FC<NicSmsSimulatorModalProps> = ({
  isOpen,
  onClose,
  initialPhone = '+91 9846078412',
  initialMessage,
  initialFarmerName = 'Ravi K (രവി കെ)',
}) => {
  if (!isOpen) return null;

  const { addToast } = useUIStore();
  const [recipientPhone, setRecipientPhone] = useState(initialPhone);
  const [farmerName, setFarmerName] = useState(initialFarmerName);
  const [language, setLanguage] = useState<'ml' | 'en'>('ml');
  const [selectedTemplate, setSelectedTemplate] = useState<'npci' | 'ekyc' | 'land' | 'payment'>('npci');

  // Real Mobile Dispatch State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [realDispatchResult, setRealDispatchResult] = useState<SMSDispatchResult | null>(null);
  const [isRealDispatching, setIsRealDispatching] = useState(false);

  // Transmission Pipeline State
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [deliveryReceipt, setDeliveryReceipt] = useState<{
    messageId: string;
    timestamp: string;
    smppStatus: string;
    operator: string;
    dltTemplateId: string;
    parts: number;
    charCount: number;
  } | null>(null);

  const [receivedMessages, setReceivedMessages] = useState<
    Array<{
      id: string;
      sender: string;
      text: string;
      time: string;
      dltId: string;
    }>
  >([]);

  // Default Template Content
  const templates = {
    npci: {
      ml: `ബഹുമാനപ്പെട്ട കർഷകൻ ${farmerName}, അങ്ങയുടെ പി.എം-കിസാൻ അക്കൗണ്ടിൽ (എസ്.ബി.ഐ ഇരിഞ്ഞാലക്കുട) ആധാർ സീഡിംഗ് അടിയന്തരമായി പൂർത്തിയാക്കേണ്ടതുണ്ട്. ആധാർ കാർഡും പാസ്ബുക്കുമായി ബാങ്ക് ശാഖ സന്ദർശിക്കുക. കൃഷി ഭവൻ തൃശ്ശൂർ. (ഡെമോ)`,
      en: `Respected Farmer ${farmerName}, Aadhaar seeding is pending for your PM-KISAN bank account at SBI Irinjalakuda. Please visit the branch with your Aadhaar card and passbook. Krishi Bhavan Thrissur.`,
      dltId: '1407161829384729182',
    },
    ekyc: {
      ml: `ബഹുമാനപ്പെട്ട ഗുണഭോക്താവ് ${farmerName}, അങ്ങയുടെ പി.എം-കിസാൻ ഇ-കെ.വൈ.സി പുതുക്കേണ്ട കാലാവധി കഴിഞ്ഞിരിക്കുന്നു. അടുത്തുള്ള അക്ഷയ കേന്ദ്രം വഴിയോ പി.എം-കിസാൻ പോർട്ടൽ വഴിയോ ഉടൻ പൂർത്തിയാക്കുക. കൃഷി വകുപ്പ്, കേരളം.`,
      en: `Respected Beneficiary ${farmerName}, your PM-KISAN e-KYC renewal is due. Complete biometric verification at your nearest Akshaya Center or via PM-KISAN portal immediately. Dept of Agriculture, Kerala.`,
      dltId: '1407161829384729183',
    },
    land: {
      ml: `അടിയന്തര അറിയിപ്പ്: കർഷകൻ ${farmerName}, അങ്ങയുടെ റവന്യൂ ഭൂമി രേഖകളിലെ സർവേ നമ്പർ പൊരുത്തക്കേട് പരിഹരിക്കാൻ വില്ലേജ് ഓഫീസുമായി ബന്ധപ്പെടുക. കൃഷി ഭവൻ തൃശ്ശൂർ.`,
      en: `Urgent Notice: Farmer ${farmerName}, please submit your Land Tax Receipt (ROR) at Village Office to reconcile survey number variance for PM-KISAN. Krishi Bhavan Thrissur.`,
      dltId: '1407161829384729184',
    },
    payment: {
      ml: `പി.എം-കിസാൻ 23-ാം ഗഡു തുക രൂപ 2,000/- അങ്ങയുടെ അക്കൗണ്ടിലേക്ക് (SBIN0000845) ട്രഷറി ക്ലിയറിംഗ് വഴി ക്രെഡിറ്റ് ചെയ്തിരിക്കുന്നു. കൃഷി ഭവൻ തൃശ്ശൂർ.`,
      en: `PM-KISAN 23rd instalment of Rs. 2,000/- has been credited to your bank account via state treasury clearing. Ref: UTR-KL2026-9812. Krishi Bhavan Thrissur.`,
      dltId: '1407161829384729185',
    },
  };

  const activeMessageText = initialMessage || templates[selectedTemplate][language];
  const activeDltId = templates[selectedTemplate].dltId;

  // Initialize with at least one historical message
  useEffect(() => {
    if (receivedMessages.length === 0) {
      setReceivedMessages([
        {
          id: 'MSG-INIT-01',
          sender: 'KL-KRISHI',
          text: templates.npci.ml,
          time: '10:15 AM',
          dltId: templates.npci.dltId,
        },
      ]);
    }
  }, []);

  const handleStartTransmission = async () => {
    setIsTransmitting(true);
    setCurrentStep(1); // Stage 1: DLT & Policy Verification
    setDeliveryReceipt(null);

    // Stage 1 -> 2
    await new Promise((r) => setTimeout(r, 600));
    setCurrentStep(2); // Stage 2: NIC National SMS Gateway SMPP PDU Assembly

    // Stage 2 -> 3
    await new Promise((r) => setTimeout(r, 700));
    setCurrentStep(3); // Stage 3: Telecom Cellular Gateway (BSNL / Jio Kerala LSA)

    // Stage 3 -> 4
    await new Promise((r) => setTimeout(r, 600));
    setCurrentStep(4); // Stage 4: Handset Radio Link Delivery

    const msgId = `NIC-TSR-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const receipt = {
      messageId: msgId,
      timestamp: new Date().toISOString(),
      smppStatus: 'DELIVRD',
      operator: 'BSNL Mobile (Kerala Telecom Circle - LSA 19)',
      dltTemplateId: activeDltId,
      parts: 1,
      charCount: activeMessageText.length,
    };

    setDeliveryReceipt(receipt);

    // Push new message to virtual phone
    setReceivedMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: 'KL-KRISHI',
        text: activeMessageText,
        time: nowTime,
        dltId: activeDltId,
      },
    ]);

    setIsTransmitting(false);
    addToast(`NIC SMS Transmitted to ${recipientPhone} [ID: ${msgId}]`, 'success');

    // Also auto-dispatch if external provider configured
    const currentGateway = smsGateway.getConfig();
    if (currentGateway.provider !== 'simulation') {
      smsGateway.sendSMS(recipientPhone, activeMessageText).then((res) => {
        setRealDispatchResult(res);
        if (res.success) {
          addToast(`Live SMS sent to ${recipientPhone} via ${res.provider}!`, 'success');
        }
      });
    }
  };

  // Normalize phone for real cellular dispatch & WhatsApp
  const cleanDigits = recipientPhone.replace(/\D/g, '');
  const cleanPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+${cleanDigits}`;
  const fullWaNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

  const handleRealSmsDispatch = async () => {
    setIsRealDispatching(true);
    setRealDispatchResult(null);
    try {
      const res = await smsGateway.sendSMS(recipientPhone, activeMessageText);
      setRealDispatchResult(res);
      if (res.success) {
        addToast(`Real SMS dispatched to ${recipientPhone} via ${res.provider}!`, 'success');
      } else {
        addToast(`Gateway dispatch: ${res.details || res.error}`, 'error');
      }
    } catch (e: any) {
      addToast(`Error: ${e.message}`, 'error');
    } finally {
      setIsRealDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-card rounded-2xl max-w-5xl w-full border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* National Informatics Centre (NIC) Official Header */}
        <div className="bg-[#041534] text-white px-5 py-3.5 flex items-center justify-between border-b border-primary/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5 border border-white/20">
              <span className="material-symbols-outlined text-accent-saffron text-[26px]">
                cell_tower
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-title-md text-sm sm:text-base font-bold text-white tracking-wide">
                  NIC e-Gov SMS Gateway Simulator
                </span>
                <span className="bg-accent-saffron text-primary font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  TRAI DLT Verified
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                National Informatics Centre (NIC) · CDAC Mobile Seva Platform · State Data Center, Thiruvananthapuram
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Gateway Telemetry Bar */}
        <div className="bg-primary/95 text-white/90 px-5 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono border-b border-white/10 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
              Node: <strong className="text-white">NIC-KL-TSR-GW01</strong>
            </span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:inline">Protocol: <strong>SMPP v3.4 (TLS 1.3)</strong></span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline">Sender Header: <strong className="text-accent-saffron">KL-KRISHI</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Entity ID: <strong className="text-white">1401552340000021482</strong></span>
            <span className="bg-status-ready/20 text-status-ready font-bold px-2 py-0.5 rounded text-[10px]">
              1,240 TPS ACTIVE
            </span>
          </div>
        </div>

        {/* Modal Main Content: Split View (Console & Transmission Left, Phone Mockup Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* LEFT COLUMN: Controls & Transmission Pipeline (7 Cols) */}
          <div className="lg:col-span-7 p-5 space-y-5 border-b lg:border-b-0 lg:border-r border-border-subtle overflow-y-auto">
            {/* Beneficiary & Template Selector */}
            <div className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-border-subtle">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider">
                1. Outbound Message Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                    Beneficiary Name:
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-card border border-border-strong text-xs text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant flex items-center justify-between mb-1">
                    <span>Destination Mobile:</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Enter your actual mobile number</span>
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-card border-2 border-emerald-500/50 text-xs font-mono font-bold text-on-surface focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Template Buttons */}
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1.5">
                  Select Govt Remediation Template:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('npci')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-left ${
                      selectedTemplate === 'npci'
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface-card hover:bg-surface-container border-border-subtle text-on-surface'
                    }`}
                  >
                    NPCI Seeding
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('ekyc')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-left ${
                      selectedTemplate === 'ekyc'
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface-card hover:bg-surface-container border-border-subtle text-on-surface'
                    }`}
                  >
                    e-KYC Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('land')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-left ${
                      selectedTemplate === 'land'
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface-card hover:bg-surface-container border-border-subtle text-on-surface'
                    }`}
                  >
                    Land Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('payment')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-left ${
                      selectedTemplate === 'payment'
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface-card hover:bg-surface-container border-border-subtle text-on-surface'
                    }`}
                  >
                    Payment Credit
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-on-surface-variant">Encoding / Script:</span>
                <div className="flex rounded-lg overflow-hidden border border-border-strong">
                  <button
                    type="button"
                    onClick={() => setLanguage('ml')}
                    className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                      language === 'ml'
                        ? 'bg-accent-saffron text-primary'
                        : 'bg-surface-card text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    മലയാളം (Unicode UCS-2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                      language === 'en'
                        ? 'bg-accent-saffron text-primary'
                        : 'bg-surface-card text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    English (GSM-7)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Message Preview & DLT Header Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-primary">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">terminal</span>
                  Message Payload & TRAI DLT Headers
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  DLT Template ID: {activeDltId}
                </span>
              </div>
              <div className="p-3 bg-surface-container rounded-xl border border-border-subtle font-['Noto_Sans_Malayalam'] text-xs sm:text-sm leading-relaxed text-on-surface">
                {activeMessageText}
              </div>
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                <span>Sender Header: <strong>KL-KRISHI</strong> (Govt Approved)</span>
                <span>Length: {activeMessageText.length} chars · 1 Part</span>
              </div>
            </div>

            {/* TRANSMISSION ANIMATION PIPELINE */}
            <div className="space-y-2 bg-[#061B3A] text-white p-4 rounded-xl border border-primary/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-saffron flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  Live Cellular Dispatch Pipeline
                </span>
                <span className="font-mono text-[10px] text-white/70">
                  {isTransmitting ? 'TRANSMITTING PACKETS...' : currentStep === 4 ? 'DISPATCH SUCCESSFUL' : 'READY FOR DISPATCH'}
                </span>
              </div>

              {/* 4-Stage Stepper Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px]">
                {/* Stage 1 */}
                <div
                  className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 1
                      ? 'bg-status-ready/20 border-status-ready text-status-ready font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] block mb-1">policy</span>
                  <span>1. DLT Policy</span>
                </div>

                {/* Stage 2 */}
                <div
                  className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 2
                      ? 'bg-status-ready/20 border-status-ready text-status-ready font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] block mb-1">hub</span>
                  <span>2. NIC Gateway</span>
                </div>

                {/* Stage 3 */}
                <div
                  className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 3
                      ? 'bg-status-ready/20 border-status-ready text-status-ready font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] block mb-1">cell_tower</span>
                  <span>3. BSNL Tower</span>
                </div>

                {/* Stage 4 */}
                <div
                  className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 4
                      ? 'bg-status-ready/20 border-status-ready text-status-ready font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] block mb-1">smartphone</span>
                  <span>4. Handset DLR</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isTransmitting}
                  onClick={handleStartTransmission}
                  className="w-full py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isTransmitting ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                      <span>Routing through Telecom Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Transmit via NIC SMPP Gateway Simulator</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SMPP Telecom Delivery Receipt Log (DLR) */}
            {deliveryReceipt && (
              <div className="p-3 bg-surface-container rounded-xl border border-status-ready/40 text-xs font-mono space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between text-status-ready font-bold">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    SMPP Delivery Report (DLR) Received
                  </span>
                  <span>STATUS: {deliveryReceipt.smppStatus}</span>
                </div>
                <div className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
                  <div>Message ID: <strong className="text-primary">{deliveryReceipt.messageId}</strong></div>
                  <div>Carrier Circle: {deliveryReceipt.operator}</div>
                  <div>DLT Template ID: {deliveryReceipt.dltTemplateId}</div>
                  <div>Timestamp: {new Date(deliveryReceipt.timestamp).toLocaleTimeString('en-IN')} · Char Count: {deliveryReceipt.charCount}</div>
                </div>
              </div>
            )}

            {/* REAL HANDSET DISPATCH ACCELERATOR */}
            <div className="bg-emerald-950/10 border-2 border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-[18px]">send_to_mobile</span>
                  <span>Deliver to Your Real Phone ({cleanPhone})</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                  REAL DISPATCH
                </span>
              </div>

              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                To receive this exact Malayalam/English message on your actual smartphone right now, tap an option below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={`sms:${cleanPhone}?body=${encodeURIComponent(activeMessageText)}`}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  title="Open native SMS messaging app on your phone / PC"
                >
                  <span className="material-symbols-outlined text-[16px]">sms</span>
                  <span>1. Open in Phone SMS App</span>
                </a>

                <a
                  href={`https://wa.me/${fullWaNumber}?text=${encodeURIComponent(activeMessageText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  title="Deliver instantly via WhatsApp"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>2. Deliver via WhatsApp (+91)</span>
                </a>
              </div>

              <div className="pt-1 flex items-center justify-between border-t border-border-subtle text-[11px]">
                <button
                  type="button"
                  disabled={isRealDispatching}
                  onClick={handleRealSmsDispatch}
                  className="text-secondary hover:text-primary font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Trigger background dispatch via Twilio / Vonage / TextBee"
                >
                  <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                  <span>{isRealDispatching ? 'Dispatching via Gateway...' : '3. Trigger Cloud Gateway (Twilio/TextBee)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="text-on-surface-variant hover:text-primary flex items-center gap-0.5 font-medium"
                >
                  <span className="material-symbols-outlined text-[13px]">settings</span>
                  <span>Gateway Keys</span>
                </button>
              </div>

              {realDispatchResult && (
                <div
                  className={`p-2.5 rounded-lg text-[11px] font-mono ${
                    realDispatchResult.success
                      ? 'bg-status-ready/20 text-status-ready border border-status-ready/40'
                      : 'bg-status-error/20 text-status-error border border-status-error/40'
                  }`}
                >
                  <div className="font-bold">
                    {realDispatchResult.success ? '✓ Gateway Dispatch Queued' : '✕ Gateway Notice'}
                  </div>
                  <div>{realDispatchResult.details || realDispatchResult.error}</div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic Virtual Farmer Handset (5 Cols) */}
          <div className="lg:col-span-5 p-5 bg-[#EEF2F6] flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">phone_android</span>
              Beneficiary Smartphone View (Live Screen)
            </span>

            {/* Virtual Smartphone Outer Shell */}
            <div className="w-full max-w-[320px] bg-[#1A1A1A] rounded-[36px] p-2.5 shadow-2xl border-4 border-[#2D2D2D] relative">
              {/* Phone Notch */}
              <div className="w-24 h-3.5 bg-[#111111] mx-auto rounded-b-xl flex items-center justify-center gap-1.5 mb-1.5">
                <div className="w-8 h-1 bg-neutral-700 rounded-full" />
                <div className="w-2 h-2 bg-neutral-800 rounded-full" />
              </div>

              {/* Phone Screen Display */}
              <div className="bg-[#F8FAFC] rounded-[24px] overflow-hidden flex flex-col h-[460px] text-neutral-900 shadow-inner border border-neutral-300">
                {/* Status Bar */}
                <div className="bg-[#041534] text-white px-3 py-1 flex items-center justify-between text-[10px] font-mono">
                  <span>10:48 AM</span>
                  <div className="flex items-center gap-1">
                    <span>4G</span>
                    <span className="material-symbols-outlined text-[12px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[12px]">battery_5_bar</span>
                  </div>
                </div>

                {/* SMS App Top Header */}
                <div className="bg-[#0B3B60] text-white px-3 py-2 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <div className="w-7 h-7 rounded-full bg-accent-saffron text-primary font-bold flex items-center justify-center text-[10px]">
                      KB
                    </div>
                    <div>
                      <div className="font-bold text-xs tracking-wider leading-tight">KL-KRISHI</div>
                      <div className="text-[9px] text-white/70">Govt of Kerala · PM-KISAN</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">more_vert</span>
                </div>

                {/* Messages List Area */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 flex flex-col justify-end bg-[#E8EEF5]">
                  <div className="text-center">
                    <span className="bg-neutral-300/80 text-neutral-600 text-[9px] px-2 py-0.5 rounded-full font-medium">
                      Today
                    </span>
                  </div>

                  {receivedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-white rounded-2xl rounded-tl-none p-2.5 shadow-xs border border-neutral-200 text-left space-y-1 self-start max-w-[94%] animate-in fade-in"
                    >
                      <div className="flex items-center gap-1 text-accent-saffron font-bold text-[10px]">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        <span>OFFICIAL PM-KISAN ALERT</span>
                      </div>
                      <p className="text-[11px] text-neutral-800 leading-relaxed font-['Noto_Sans_Malayalam']">
                        {msg.text}
                      </p>
                      <div className="pt-1 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-500 font-mono">
                        <span>DLT: {msg.dltId.slice(0, 10)}...</span>
                        <span className="text-status-ready font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">done_all</span>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input Bottom Bar */}
                <div className="bg-white p-2 border-t border-neutral-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-neutral-400 text-[16px]">add_circle</span>
                  <div className="flex-1 bg-neutral-100 rounded-full px-2.5 py-1 text-[11px] text-neutral-400">
                    Text message (BSNL Gateway)...
                  </div>
                  <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px]">send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-surface-container-low px-5 py-3 border-t border-border-subtle flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-status-ready">shield</span>
            Simulates TRAI Commercial Communications Customer Preference Regulations (TCCCPR 2018) DLT compliance.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors shadow-xs"
          >
            Close Simulator
          </button>
        </div>
      </div>

      <SmsGatewaySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};
