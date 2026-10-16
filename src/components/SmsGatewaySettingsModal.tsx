import React, { useState } from 'react';
import { smsGateway, type SMSProvider, type SMSGatewayConfig } from '../lib/smsGateway';
import { useUIStore } from '../store/useUIStore';
import { NicSmsSimulatorModal } from './NicSmsSimulatorModal';

interface SmsGatewaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsGatewaySettingsModal: React.FC<SmsGatewaySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { addToast } = useUIStore();
  const [config, setConfig] = useState<SMSGatewayConfig>(smsGateway.getConfig());
  const [selectedProvider, setSelectedProvider] = useState<SMSProvider>(config.provider);
  const [testPhone, setTestPhone] = useState('+91 9846012345');
  const [isTesting, setIsTesting] = useState(false);
  const [showNicSimulator, setShowNicSimulator] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    details: string;
    messageId?: string;
  } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = smsGateway.saveConfig({
      ...config,
      provider: selectedProvider,
    });
    setConfig(updated);
    addToast(`SMS Gateway updated to ${getProviderLabel(selectedProvider)}`, 'success');
    onClose();
  };

  const handleTestDispatch = async () => {
    if (!testPhone) {
      addToast('Please enter a valid phone number for the test dispatch.', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const testMessage = `[DBT-GUARD Verification] Test SMS from PM-KISAN Krishi Bhavan Portal. Gateway: ${getProviderLabel(
      selectedProvider
    )}. Timestamp: ${new Date().toLocaleTimeString('en-IN')}`;

    try {
      const result = await smsGateway.sendSMS(testPhone, testMessage, selectedProvider);
      if (result.success) {
        setTestResult({
          success: true,
          details: result.details,
          messageId: result.messageId,
        });
        addToast(`Test SMS dispatched via ${getProviderLabel(selectedProvider)}!`, 'success');
      } else {
        setTestResult({
          success: false,
          details: result.error || 'Failed to dispatch test SMS',
        });
        addToast(`Test dispatch failed: ${result.error}`, 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        details: err.message || 'Network exception',
      });
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const getProviderLabel = (p: SMSProvider) => {
    switch (p) {
      case 'textbee':
        return 'TextBee.dev (Free Android Gateway)';
      case 'sms_mobile_api':
        return 'SMS Mobile API / Custom Webhook';
      case 'twilio':
        return 'Twilio SMS Sandbox';
      case 'vonage':
        return 'Vonage Messaging API';
      case 'simulation':
      default:
        return 'In-Browser Simulation (NIC Mock)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-card rounded-2xl max-w-2xl w-full border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between text-on-primary border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent-saffron text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">cell_tower</span>
            </div>
            <div>
              <h2 className="font-title-md text-base font-bold text-on-primary">
                SMS Gateway & Outreach Telephony Architecture
              </h2>
              <span className="text-xs text-on-primary/80 font-medium">
                Configure real Android phone gateways or cloud testing APIs for farmer outreach
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-primary/70 hover:text-on-primary p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto text-xs sm:text-sm">
          {/* Provider Selection Cards */}
          <div className="space-y-2">
            <label className="font-bold text-primary block text-xs uppercase tracking-wider">
              Select Outbound SMS Dispatch Engine:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: TextBee.dev */}
              <div
                onClick={() => setSelectedProvider('textbee')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedProvider === 'textbee'
                    ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20 shadow-xs'
                    : 'border-border-subtle bg-surface-card hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-saffron text-[22px]">
                      android
                    </span>
                    <span className="font-bold text-primary text-xs">TextBee.dev</span>
                  </div>
                  <span className="bg-status-ready-bg text-status-ready font-bold text-[10px] px-2 py-0.5 rounded-full border border-status-ready/30">
                    Free 300/mo
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                  Turn an Android phone into an automated SMS Gateway. Direct REST API via personal SIM card with no credit card required.
                </p>
              </div>

              {/* Option 2: Twilio */}
              <div
                onClick={() => setSelectedProvider('twilio')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedProvider === 'twilio'
                    ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20 shadow-xs'
                    : 'border-border-subtle bg-surface-card hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">cloud</span>
                    <span className="font-bold text-primary text-xs">Twilio SMS API</span>
                  </div>
                  <span className="bg-primary/10 text-primary font-bold text-[10px] px-2 py-0.5 rounded-full border border-primary/20">
                    Cloud Sandbox
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                  Enterprise CPaaS sandbox with free trial credits. Sends automated texts to verified testing numbers.
                </p>
              </div>

              {/* Option 3: SMS Mobile API / Webhook */}
              <div
                onClick={() => setSelectedProvider('sms_mobile_api')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedProvider === 'sms_mobile_api'
                    ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20 shadow-xs'
                    : 'border-border-subtle bg-surface-card hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-status-warning text-[22px]">webhook</span>
                    <span className="font-bold text-primary text-xs">SMS Mobile / Webhook</span>
                  </div>
                  <span className="bg-surface-container text-on-surface font-bold text-[10px] px-2 py-0.5 rounded-full border border-border-subtle">
                    Custom HTTP
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                  Connect any Android Gateway app from Google Play Store or custom backend webhook dispatcher.
                </p>
              </div>

              {/* Option 4: In-Browser Simulation */}
              <div
                onClick={() => setSelectedProvider('simulation')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedProvider === 'simulation'
                    ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20 shadow-xs'
                    : 'border-border-subtle bg-surface-card hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[22px]">devices</span>
                    <span className="font-bold text-primary text-xs">Simulation Mode</span>
                  </div>
                  <span className="bg-surface-container-high text-on-surface-variant font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Built-in Demo
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                  Instant realistic simulation of NIC / CDAC Bulk SMS dispatch with visual delivery timeline without credentials.
                </p>
              </div>
            </div>
          </div>

          {/* Provider Specific Configuration Fields */}
          {selectedProvider === 'textbee' && (
            <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-accent-saffron text-[18px]">key</span>
                  TextBee.dev API Credentials
                </span>
                <a
                  href="https://textbee.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-secondary hover:underline flex items-center gap-0.5 font-bold"
                >
                  <span>textbee.dev</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>

              <div className="p-3 bg-surface-card rounded-lg border border-border-subtle text-[11px] text-on-surface-variant leading-relaxed">
                <strong>How to get free 300 SMS/mo:</strong>
                <ol className="list-decimal pl-4 mt-1 space-y-0.5">
                  <li>Download the free TextBee app on any Android device with a SIM card.</li>
                  <li>Register for a free account at textbee.dev (no credit card).</li>
                  <li>Copy your <strong>Device ID</strong> and <strong>API Key</strong> into the fields below.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">
                    TextBee Device ID:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 660f9e1a4d8c230012345678"
                    value={config.textbeeDeviceId || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, textbeeDeviceId: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">
                    TextBee API Key:
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. tb_live_sec_..."
                    value={config.textbeeApiKey || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, textbeeApiKey: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedProvider === 'twilio' && (
            <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">cloud</span>
                  Twilio Cloud Sandbox Setup
                </span>
                <span className="bg-primary/10 text-primary font-bold text-[10px] px-2 py-0.5 rounded-full border border-primary/20">
                  Vercel Serverless Ready
                </span>
              </div>

              <div className="p-3 bg-surface-card rounded-lg border border-border-subtle text-[11px] text-on-surface-variant leading-relaxed">
                <strong>Two Ways to Connect Twilio:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>
                    <strong>Vercel Backend (Production):</strong> Add <code className="bg-surface-container px-1 py-0.2 rounded font-mono">TWILIO_ACCOUNT_SID</code>, <code className="bg-surface-container px-1 py-0.2 rounded font-mono">TWILIO_AUTH_TOKEN</code>, and <code className="bg-surface-container px-1 py-0.2 rounded font-mono">TWILIO_FROM_NUMBER</code> to your Vercel Project Settings &gt; Environment Variables. DBT-GUARD automatically dispatches via <code className="bg-surface-container px-1 py-0.2 rounded font-mono">/api/send-sms</code>.
                  </li>
                  <li>
                    <strong>Direct Local Testing:</strong> Or enter your sandbox credentials below to test immediately without re-deploying.
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Account SID:</label>
                  <input
                    type="text"
                    placeholder="ACXXXXXXXXXXXXXXXXX"
                    value={config.twilioAccountSid || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, twilioAccountSid: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Auth Token:</label>
                  <input
                    type="password"
                    placeholder="Your Twilio Auth Token"
                    value={config.twilioAuthToken || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, twilioAuthToken: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">From Number:</label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={config.twilioFromNumber || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, twilioFromNumber: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedProvider === 'sms_mobile_api' && (
            <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle space-y-3">
              <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-status-warning text-[18px]">http</span>
                Custom Webhook / Android Gateway Endpoint
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Webhook Endpoint URL:</label>
                  <input
                    type="url"
                    placeholder="https://your-gateway.com/send"
                    value={config.customEndpoint || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, customEndpoint: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Bearer Token (Optional):</label>
                  <input
                    type="password"
                    placeholder="Bearer token or API Secret"
                    value={config.customApiKey || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, customApiKey: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedProvider === 'simulation' && (
            <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-accent-saffron text-[18px]">sensors</span>
                  In-Browser National Informatics Centre (NIC) Gateway Simulator
                </span>
                <span className="bg-status-ready/20 text-status-ready font-bold text-[10px] px-2 py-0.5 rounded-full border border-status-ready/30">
                  TRAI DLT Ready
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Experience the authentic end-to-end cellular dispatch pipeline from Kerala State Data Center (Thiruvananthapuram) through BSNL/Jio cellular towers to the farmer's smartphone mockup with live Unicode Malayalam rendering.
              </p>
              <button
                type="button"
                onClick={() => setShowNicSimulator(true)}
                className="px-4 py-2 rounded-lg bg-accent-saffron hover:bg-accent-saffron/90 text-primary font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span>Launch Interactive NIC SMS Simulator</span>
              </button>
            </div>
          )}

          {/* Live Dispatch Test Section */}
          <div className="p-4 bg-status-info-bg border border-status-info/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-status-info text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">send_to_mobile</span>
                Verify Live SMS Gateway Dispatch
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Testing via: {getProviderLabel(selectedProvider)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="tel"
                placeholder="Enter mobile number with country code (e.g. +91 9846012345)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-strong text-xs font-mono text-on-surface focus:outline-none"
              />
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestDispatch}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isTesting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Send Test SMS</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 animate-in fade-in ${
                  testResult.success
                    ? 'bg-status-ready-bg border-status-ready/30 text-status-ready'
                    : 'bg-status-error-bg border-status-error/30 text-status-error'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
                  {testResult.success ? 'check_circle' : 'error'}
                </span>
                <div>
                  <strong>{testResult.success ? 'Dispatch Confirmed:' : 'Dispatch Failed:'}</strong>{' '}
                  {testResult.details}
                  {testResult.messageId && (
                    <span className="block mt-0.5 font-mono text-[11px] opacity-80">
                      Message ID: {testResult.messageId}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
            <span className="text-[11px] text-on-surface-variant">
              * Supports UTF-8 Malayalam text encoding and standard 160-character pagination.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <NicSmsSimulatorModal
        isOpen={showNicSimulator}
        onClose={() => setShowNicSimulator(false)}
        initialPhone={testPhone}
      />
    </div>
  );
};
