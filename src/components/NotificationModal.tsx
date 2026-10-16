import React, { useState } from 'react';
import type { CaseRecord, CallStatus } from '../types';
import { MalayalamVoicePlayer } from '../lib/speech';
import { smsGateway, type SMSDispatchResult } from '../lib/smsGateway';
import { SmsGatewaySettingsModal } from './SmsGatewaySettingsModal';
import { NicSmsSimulatorModal } from './NicSmsSimulatorModal';

import { geminiAI } from '../lib/gemini';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseRecord;
  onRecordOutcome: (caseId: string, outcome: CallStatus, notes: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onRecordOutcome,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'sms' | 'voice' | 'outcome'>('sms');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<CallStatus>('Answered');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [smsDispatchResult, setSmsDispatchResult] = useState<SMSDispatchResult | null>(null);
  const [voiceCallSimulated, setVoiceCallSimulated] = useState(false);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [showNicSimulator, setShowNicSimulator] = useState(false);

  // Synthesized bilingual notification content (with AI override support)
  const defaultSmsMl = `ബഹുമാനപ്പെട്ട കർഷകൻ ${caseItem.farmer_name_ml}, അങ്ങയുടെ പി.എം-കിസാൻ അക്കൗണ്ടിൽ (${caseItem.bank_name || 'ബാങ്ക്'}) ആധാർ സീഡിംഗ് അടിയന്തരമായി പൂർത്തിയാക്കേണ്ടതുണ്ട്. ആധാർ കാർഡും ബാങ്ക് പാസ്ബുക്കുമായി ${caseItem.owner_office_name || 'ബാങ്ക് ശാഖ'} സന്ദർശിക്കുക. സഹായത്തിന് കൃഷി ഭവനുമായി ബന്ധപ്പെടുക. കൃഷി വകുപ്പ്, തൃശ്ശൂർ. (ഡെമോ സന്ദേശം)`;
  const defaultSmsEn = `Respected Beneficiary ${caseItem.farmer_name_en}, Aadhaar seeding is pending for your PM-KISAN account at ${caseItem.bank_name || 'Bank'}. Please visit ${caseItem.owner_office_name || 'branch'} with your Aadhaar and Passbook. Contact Krishi Bhavan for assistance. Dept of Agriculture, Thrissur. [Demo Simulation]`;

  const [customSmsMl, setCustomSmsMl] = useState(defaultSmsMl);
  const [customSmsEn, setCustomSmsEn] = useState(defaultSmsEn);

  const handleGenerateAiSms = async () => {
    setIsGeneratingAi(true);
    try {
      const mlResult = await geminiAI.generateFarmerSms(
        caseItem.farmer_name_en,
        caseItem.farmer_name_ml,
        caseItem.bank_name,
        caseItem.rule_code,
        caseItem.problem_statement || caseItem.issue_description,
        caseItem.immediate_next_action || caseItem.farmer_action_text,
        'ml'
      );
      if (mlResult.success && mlResult.text) {
        setCustomSmsMl(mlResult.text);
      }

      const enResult = await geminiAI.generateFarmerSms(
        caseItem.farmer_name_en,
        caseItem.farmer_name_ml,
        caseItem.bank_name,
        caseItem.rule_code,
        caseItem.problem_statement || caseItem.issue_description,
        caseItem.immediate_next_action || caseItem.farmer_action_text,
        'en'
      );
      if (enResult.success && enResult.text) {
        setCustomSmsEn(enResult.text);
      }
    } catch {
      // ignore
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const voiceScriptMalayalam = `നമസ്കാരം, തൃശ്ശൂർ കൃഷി ഭവനിൽ നിന്നുള്ള അറിയിപ്പാണ്. പി.എം-കിസാൻ ഗുണഭോക്താവായ ശ്രീ ${caseItem.farmer_name_ml}-ന്റെ ബാങ്ക് അക്കൗണ്ടിൽ ആധാർ മാപ്പിംഗ് പുതുക്കേണ്ടതുണ്ട്. അടുത്തുള്ള ബാങ്ക് ശാഖയിൽ നേരിട്ടെത്തി നിർദ്ദിഷ്ട ഫോറം പൂരിപ്പിച്ചു നൽകുക. നന്ദി.`;

  const handlePlayVoice = () => {
    if (MalayalamVoicePlayer.isSpeaking()) {
      MalayalamVoicePlayer.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    MalayalamVoicePlayer.play(voiceScriptMalayalam, caseItem.rule_code, {
      caseId: caseItem.case_id,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSendSms = async () => {
    setIsSendingSms(true);
    setSmsDispatchResult(null);
    try {
      const recipientPhone = caseItem.mobile_masked || '+91 9846012345';
      const result = await smsGateway.sendSMS(recipientPhone, customSmsMl);
      setSmsDispatchResult(result);
    } catch (err: any) {
      setSmsDispatchResult({
        success: false,
        provider: 'simulation',
        messageId: '',
        recipient: caseItem.mobile_masked,
        timestamp: new Date().toISOString(),
        deliveryStatus: 'Failed',
        error: err.message,
        details: 'Exception during dispatch',
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleSendSmsDemo = () => {
    handleSendSms();
  };

  const handleTriggerVoiceCallDemo = () => {
    setVoiceCallSimulated(true);
    handlePlayVoice();
    setTimeout(() => setVoiceCallSimulated(false), 4000);
  };

  const handleSubmitOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordOutcome(caseItem.case_id, selectedOutcome, outcomeNote || `Recorded outcome: ${selectedOutcome}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-card rounded-2xl max-w-xl w-full border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-status-warning-bg border-b border-status-warning/30 px-5 py-4 flex items-center justify-between text-disclaimer-banner-text">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-accent-saffron">notifications_active</span>
            <div>
              <h2 className="font-title-md text-base font-bold text-primary">
                Farmer Outreach & Notification Console
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                Case #{caseItem.case_id} · Beneficiary: {caseItem.farmer_name_en} ({caseItem.farmer_name_ml})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border-subtle bg-surface-container-low px-4">
          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'sms'
                ? 'border-secondary text-primary bg-surface-card'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sms</span>
            <span>SMS Notification</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'voice'
                ? 'border-secondary text-primary bg-surface-card'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
            <span>Voice Assist IVR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outcome')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'outcome'
                ? 'border-secondary text-primary bg-surface-card'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">call_log</span>
            <span>Log Call Outcome</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs sm:text-sm">
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-low p-3 rounded-lg border border-border-subtle text-xs">
            <div>
              <span className="text-on-surface-variant block text-[11px]">Mobile:</span>
              <span className="font-mono font-bold text-primary">{caseItem.mobile_masked}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[11px]">Preferred Lang:</span>
              <span className="font-bold text-primary">Malayalam (മലയാളം)</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[11px]">Consent Status:</span>
              <span className="font-bold text-status-ready flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
              </span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[11px]">Last Contact:</span>
              <span className="font-medium text-on-surface">{caseItem.last_call_timestamp || caseItem.last_contact_attempt || '15 Oct 2026'}</span>
            </div>
          </div>

          {/* TAB 1: SMS Notification */}
          {activeTab === 'sms' && (
            <div className="space-y-3">
              {/* Active Gateway Status Banner */}
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-border-subtle text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent-saffron">cell_tower</span>
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">Outbound Gateway:</span>
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      {smsGateway.getConfig().provider === 'textbee' ? 'TextBee.dev (Free Android)' :
                       smsGateway.getConfig().provider === 'twilio' ? 'Twilio Cloud Sandbox' :
                       smsGateway.getConfig().provider === 'sms_mobile_api' ? 'SMS Mobile API / Webhook' :
                       'In-Browser Simulation'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGatewayConfig(true)}
                  className="px-2.5 py-1.5 rounded-lg border border-border-strong bg-surface-card hover:bg-surface-container text-secondary text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">settings</span>
                  <span>Configure Gateway</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-primary text-xs uppercase tracking-wider">
                    Malayalam SMS Notification Script:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={handleGenerateAiSms}
                      className="px-2.5 py-1 rounded-md bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                      title="Use Google Gemini 2.5 Flash to generate a custom Malayalam SMS for this farmer's specific error"
                    >
                      {isGeneratingAi ? (
                        <>
                          <span className="animate-spin material-symbols-outlined text-[13px]">progress_activity</span>
                          <span>Gemini Drafting...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[13px] text-accent-saffron">auto_awesome</span>
                          <span>AI Tailor with Gemini</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {customSmsMl.length} chars · Unicode UTF-8
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-surface-container rounded-lg font-['Noto_Sans_Malayalam'] text-xs sm:text-sm leading-relaxed border border-border-subtle">
                  {customSmsMl}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface-variant text-xs">
                  English Reference Translation:
                </label>
                <div className="p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface-variant leading-relaxed">
                  {customSmsEn}
                </div>
              </div>

              {smsDispatchResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 animate-in fade-in ${
                    smsDispatchResult.success
                      ? 'bg-status-ready-bg border-status-ready/30 text-status-ready'
                      : 'bg-status-error-bg border-status-error/30 text-status-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
                    {smsDispatchResult.success ? 'check_circle' : 'error'}
                  </span>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span>{smsDispatchResult.success ? 'Dispatch Success:' : 'Dispatch Failure:'}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-black/5">
                        {smsDispatchResult.deliveryStatus}
                      </span>
                    </div>
                    <p className="mt-0.5">{smsDispatchResult.details}</p>
                    {smsDispatchResult.messageId && (
                      <span className="block mt-1 font-mono text-[11px] opacity-80">
                        Tracking ID: {smsDispatchResult.messageId} · Destination: {smsDispatchResult.recipient}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowNicSimulator(true)}
                  className="px-3 py-1.5 rounded-lg border border-accent-saffron/40 bg-accent-saffron/10 hover:bg-accent-saffron/20 text-primary text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-accent-saffron">sensors</span>
                  <span>Open NIC Live Simulator</span>
                </button>

                <button
                  type="button"
                  disabled={isSendingSms}
                  onClick={handleSendSms}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSendingSms ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                      <span>Dispatching SMS...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Dispatch SMS Notification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Voice Assist IVR */}
          {activeTab === 'voice' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-primary text-xs uppercase tracking-wider">
                  Automated Malayalam IVR Voice Script:
                </label>
                <div className="p-3 bg-surface-container rounded-lg font-['Noto_Sans_Malayalam'] text-xs sm:text-sm leading-relaxed border border-border-subtle">
                  {voiceScriptMalayalam}
                </div>
              </div>

              {voiceCallSimulated && (
                <div className="p-2.5 rounded-lg bg-status-ready-bg border border-status-ready/30 text-status-ready text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px]">ring_volume</span>
                  <span><strong>Demo Simulation Connected:</strong> Outbound SIP call dialed to {caseItem.mobile_masked}. Audio playing.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-border-subtle flex-wrap">
                <button
                  type="button"
                  onClick={handlePlayVoice}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isPlayingAudio
                      ? 'bg-status-error text-white'
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPlayingAudio ? 'stop' : 'volume_up'}
                  </span>
                  <span>{isPlayingAudio ? 'Stop Speech' : 'Play Sample Voice (മലയാളം)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerVoiceCallDemo}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                  <span>Trigger Voice Call (Demo Simulation)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Record Outcome */}
          {activeTab === 'outcome' && (
            <form onSubmit={handleSubmitOutcome} className="space-y-3">
              <div>
                <label className="block font-bold text-primary mb-1 text-xs uppercase tracking-wider">
                  Select Call / Contact Outcome:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'Answered' as CallStatus, label: 'Answered — Consent to Visit Desk' },
                    { key: 'Help requested' as CallStatus, label: 'Help requested — Field Visit Needed' },
                    { key: 'Replayed' as CallStatus, label: 'Replayed — Message Acknowledged' },
                    { key: 'Not reached' as CallStatus, label: 'Not reached — Phone Switched Off' },
                    { key: 'Opted out' as CallStatus, label: 'Opted out — Ineligible / Surrender' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedOutcome(opt.key)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                        selectedOutcome === opt.key
                          ? 'border-secondary bg-secondary/10 text-primary font-bold shadow-xs'
                          : 'border-border-subtle hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1 text-xs">
                  Officer Follow-up Notes / Remarks:
                </label>
                <textarea
                  rows={2}
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  placeholder="e.g. Beneficiary agreed to bring Aadhaar to SBI Irinjalakuda branch on Monday 10:00 AM."
                  className="w-full bg-surface-container-low border border-border-strong rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-secondary focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg border border-border-strong text-xs font-bold text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Outcome & Update Audit</span>
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Anti-Phishing Guardrail */}
          <div className="bg-surface-container-high/60 p-2.5 rounded-lg text-[11px] text-on-surface-variant flex items-start gap-2 border border-border-subtle">
            <span className="material-symbols-outlined text-[16px] text-status-warning flex-shrink-0 mt-0.5">shield</span>
            <span>
              <strong>Security Protocol:</strong> Automated DBT notifications never request OTPs, PINs, passwords, or full bank credentials. In student prototype mode, all communications are simulated without incurring SMS gateway charges.
            </span>
          </div>
        </div>
      </div>

      <SmsGatewaySettingsModal
        isOpen={showGatewayConfig}
        onClose={() => setShowGatewayConfig(false)}
      />

      <NicSmsSimulatorModal
        isOpen={showNicSimulator}
        onClose={() => setShowNicSimulator(false)}
        initialPhone={caseItem.mobile_masked}
        initialFarmerName={`${caseItem.farmer_name_en} (${caseItem.farmer_name_ml})`}
        initialMessage={customSmsMl}
      />
    </div>
  );
};
