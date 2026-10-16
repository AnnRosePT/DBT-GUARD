import React from 'react';

interface PhoneSMSMockupProps {
  caseId: string;
  farmerNameEn?: string;
  farmerNameMl?: string;
  messageText?: string;
  onResendSMS?: () => void;
  onWhatsAppShare?: () => void;
}

export const PhoneSMSMockup: React.FC<PhoneSMSMockupProps> = ({
  caseId,
  messageText,
  onResendSMS,
  onWhatsAppShare,
}) => {
  const defaultText =
    messageText ||
    `OFFICIAL PM-KISAN ALERT:\n\nDEMO PM-KISAN case ${caseId}: Aadhaar payment mapping needs correction. Visit your bank with Aadhaar and passbook. Request DBT/NPCI seeding and obtain stamped acknowledgement. Never share an OTP with our staff.\n\n— Krishi Bhavan Thrissur`;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Smartphone Outer Shell */}
      <div className="w-full bg-[#1A1A1A] rounded-[36px] p-3 shadow-2xl border-4 border-[#2D2D2D] relative">
        {/* Notch / Speaker Bar */}
        <div className="w-32 h-4 bg-[#111111] mx-auto rounded-b-xl flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-1 bg-neutral-700 rounded-full" />
          <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full" />
        </div>

        {/* Screen Display */}
        <div className="bg-[#F8FAFC] rounded-[24px] overflow-hidden flex flex-col min-h-[480px] text-on-surface shadow-inner border border-neutral-300">
          {/* Top Status Bar */}
          <div className="bg-[#041534] text-white px-4 py-1.5 flex items-center justify-between text-[11px] font-mono">
            <span>10:45 AM</span>
            <div className="flex items-center gap-1.5">
              <span>4G VoLTE</span>
              <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
              <span className="material-symbols-outlined text-[13px]">battery_5_bar</span>
            </div>
          </div>

          {/* SMS App Header */}
          <div className="bg-[#0B3B60] text-white px-3 py-2.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <div className="w-8 h-8 rounded-full bg-accent-saffron text-primary font-bold flex items-center justify-center text-xs">
                KB
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-wider">VK-AGRIKRISHI</span>
                <span className="text-[10px] text-white/70">Govt of Kerala · PM-KISAN</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 bg-[#EEF2F6] flex flex-col justify-end space-y-3">
            <div className="text-center">
              <span className="bg-neutral-300/80 text-neutral-700 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                Today, 10:32 AM
              </span>
            </div>

            {/* Received SMS Bubble */}
            <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-neutral-200 max-w-[90%] text-left space-y-1.5 self-start">
              <div className="flex items-center gap-1 text-accent-saffron font-bold text-[11px]">
                <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                <span>OFFICIAL PM-KISAN ALERT</span>
              </div>

              <p className="text-[12px] text-neutral-800 leading-relaxed whitespace-pre-line font-sans">
                {defaultText}
              </p>

              <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>DLT: 140716...398</span>
                <span className="text-status-ready font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">done_all</span>
                  10:32 AM
                </span>
              </div>
            </div>

            {/* Delivery Receipt Pill */}
            <div className="self-center">
              <span className="bg-status-ready-bg text-status-ready text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-status-ready/30">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Delivered via BSNL Kerala Gateway
              </span>
            </div>
          </div>

          {/* Bottom Chat Bar */}
          <div className="bg-white p-2 border-t border-neutral-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-400 text-[18px]">add_circle</span>
            <div className="flex-1 bg-neutral-100 rounded-full px-3 py-1.5 text-xs text-neutral-500">
              Text message (BSNL Gateway)...
            </div>
            <span className="material-symbols-outlined text-secondary text-[20px]">send</span>
          </div>
        </div>
      </div>

      {/* External Action Controls */}
      <div className="w-full mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onResendSMS}
          className="w-full bg-primary hover:bg-primary-container text-white font-label-md text-label-md py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">sms</span>
          <span>Resend Bilingual SMS (വീണ്ടും അയക്കുക)</span>
        </button>

        <button
          type="button"
          onClick={onWhatsAppShare}
          className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-label-md text-label-md py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          <span>Send Audio Clip on WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
