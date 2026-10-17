import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';

interface WiFiCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseCode: string;
  farmerNameEn: string;
  farmerNameMl: string;
  defaultPhone?: string;
  problemSummary?: string;
}

export const WiFiCallModal: React.FC<WiFiCallModalProps> = ({
  isOpen,
  onClose,
  caseCode,
  farmerNameEn,
  farmerNameMl,
  defaultPhone = '+91 9746515417',
  problemSummary,
}) => {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [isCopied, setIsCopied] = useState(false);

  // Current Wi-Fi local network IP
  const wifiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '192.168.63.89:5173'
    : window.location.host;

  const callUrl = `http://${wifiHost}/call/${caseCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(callUrl)}`;

  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const fullWaNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

  const waMessage = `📞 Krishi Bhavan Thrissur PM-KISAN Wi-Fi Call Link:\n\nTap this link to receive your automated advisory phone call:\n${callUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(callUrl);
    setIsCopied(true);
    addToast('Wi-Fi call link copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateHere = () => {
    onClose();
    navigate(`/call/${caseCode}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-surface-card rounded-2xl max-w-xl w-full border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#041534] to-[#0A2558] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[24px]">phone_in_talk</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title-md text-base font-bold text-white tracking-wide">
                  Wi-Fi Calling & Telephony Bridge
                </h3>
                <span className="bg-emerald-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                  Live Over Wi-Fi
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Trigger an automated spoken Malayalam phone call directly to your handset
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Target Info */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface">
                Beneficiary: <strong className="text-primary">{farmerNameMl} ({farmerNameEn})</strong>
              </span>
              <span className="font-mono text-secondary font-bold text-[11px]">
                Case #{caseCode}
              </span>
            </div>

            <div className="text-[11px] text-on-surface-variant font-['Noto_Sans_Malayalam']">
              പ്രശ്നം: {problemSummary || 'ബാങ്ക് അക്കൗണ്ടിൽ ആധാർ മാപ്പിംഗ് പ്രവർത്തനരഹിതം (NPCI Inactive).'}
            </div>
          </div>

          {/* Destination Mobile Input */}
          <div>
            <label className="text-xs font-bold text-on-surface block mb-1">
              Your Mobile Number (+91):
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-3 py-2 rounded-xl bg-surface-card border-2 border-emerald-500/40 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-emerald-600"
            />
            <span className="text-[11px] text-on-surface-variant block mt-1">
              Connect your phone to the same Wi-Fi network to receive the call on your handset.
            </span>
          </div>

          {/* Wi-Fi Calling Options */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-primary block uppercase tracking-wider">
              Choose How to Receive the Call:
            </span>

            {/* Option 1: Instant Local Wi-Fi Ring */}
            <div className="p-4 rounded-xl bg-emerald-950/10 border-2 border-emerald-500/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">wifi</span>
                    <span>Method 1: Open Call on Your Smartphone (Wi-Fi)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Scan this QR code with your phone camera, or send the call link to your WhatsApp. Your phone will immediately <strong>vibrate, ring like a real phone call</strong>, and speak the Malayalam advisory when answered!
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex-shrink-0 bg-white p-1.5 rounded-lg border border-border-subtle shadow-sm text-center">
                  <img
                    src={qrUrl}
                    alt="Scan for Wi-Fi Call"
                    className="w-24 h-24 rounded object-contain"
                  />
                  <span className="text-[9px] font-mono text-slate-600 block mt-0.5">Scan to Call</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/${fullWaNumber}?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Send Call Link via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-surface-card hover:bg-surface-container border border-border-strong text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>{isCopied ? 'Link Copied!' : 'Copy Wi-Fi Call Link'}</span>
                </button>
              </div>
            </div>

            {/* Option 2: Simulate Call on this Screen */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">computer</span>
                  <span>Method 2: Test Call on this Screen</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Hear the ringing bell and spoken Malayalam voice directly on your computer speakers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateHere}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs flex items-center gap-1.5 flex-shrink-0 shadow-sm transition"
              >
                <span className="material-symbols-outlined text-[16px]">ring_volume</span>
                <span>Ring Screen</span>
              </button>
            </div>

            {/* Option 3: Direct Native Dialer */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">call</span>
                  <span>Method 3: Native Wi-Fi Calling (`tel:`)</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Dials Krishi Bhavan IVR helpline <strong>0487-2331122</strong> using your device's native carrier dialer.
                </p>
              </div>

              <a
                href="tel:04872331122"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-1.5 flex-shrink-0 shadow-sm transition"
              >
                <span>Dial 0487</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-surface-container px-5 py-3 border-t border-border-subtle flex items-center justify-between text-xs text-on-surface-variant flex-shrink-0">
          <span>Wi-Fi Endpoint: <code className="text-primary font-mono">{callUrl}</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-card hover:bg-surface-container-high border border-border-strong text-on-surface font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
