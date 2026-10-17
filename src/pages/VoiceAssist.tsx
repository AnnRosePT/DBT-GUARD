import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { playMalayalamSpeech, stopSpeech } from '../lib/speech';
import { geminiAI } from '../lib/gemini';
import { WiFiCallModal } from '../components/WiFiCallModal';

export const VoiceAssist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { farmers, diagnostics, updateFarmerCallStatus, logAudit } = useAppStore();
  const { currentUser } = useAuthStore();
  const { language, addToast } = useUIStore();
  const isMl = language === 'ml';

  const isFarmer = currentUser?.role === 'farmer';

  // Target farmer
  const farmer = useMemo(() => {
    // If farmer, force to own record
    if (isFarmer) {
      return farmers.find((f) => f.farmer_id === 'KL-TSR-0001') || farmers[0];
    }
    if (!id) return farmers[0];
    if (id === 'K104' || id === 'KL-TSR-0001') {
      return farmers.find((f) => f.farmer_id === 'KL-TSR-0001') || farmers[0];
    }
    return farmers.find((f) => f.farmer_id === id) || farmers[0];
  }, [id, farmers, isFarmer]);

  const diag = diagnostics[farmer?.farmer_id || ''];
  const caseCode = farmer?.farmer_id === 'KL-TSR-0001' ? 'K104' : `K${100 + parseInt(farmer?.farmer_id.replace(/\D/g, '') || '1')}`;

  // Wi-Fi Calling Modal State
  const [showWifiModal, setShowWifiModal] = useState(false);

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const totalSeconds = 84;

  // Malayalam script content
  const mlScript = `നമസ്കാരം ${farmer?.name_ml || 'കർഷക സുഹൃത്തേ'}. നിങ്ങളുടെ ആനുകൂല്യവുമായി ബന്ധപ്പെട്ട ആധാർ–ബാങ്ക് ബന്ധിപ്പിക്കൽ നില പരിശോധിക്കേണ്ടതുണ്ട്. കേന്ദ്ര സർക്കാരിന്റെ പി.എം-കിസാൻ പദ്ധതിയിലെ 23-ാം ഗഡു തുക ലഭിക്കുന്നതിന്, നിങ്ങളുടെ ${farmer?.bank_name || 'ബാങ്ക്'} അക്കൗണ്ടുമായി ആധാർ കാർഡ് എൻ.പി.സി.ഐ മാപ്പറിൽ ലിങ്ക് ചെയ്യേണ്ടതുണ്ട്. ദയവായി നിങ്ങളുടെ ആധാർ കാർഡും ${farmer?.bank_name || 'ബാങ്ക്'} ${farmer?.local_body_name || 'ഇരിഞ്ഞാലക്കുട'} ശാഖയിലെ പാസ്സ്ബുക്കുമായി ബാങ്ക് സന്ദർശിച്ച് ഡി.ബി.ടി കൺസെന്റ് ഫോം പൂരിപ്പിച്ചു നൽകുക. അക്നോളജ്മെന്റ് രസീത് സൂക്ഷിക്കുക. ശ്രദ്ധിക്കുക: ഒ.ടി.പി രഹസ്യ വിവരങ്ങൾ ആരോടും പങ്കുവെക്കരുത്.`;

  const enTranslation = `Greetings ${farmer?.name_en || 'Farmer'}. Your PM-KISAN benefit disbursement requires Aadhaar-bank account seeding verification. To receive your 23rd instalment, your ${farmer?.bank_name || 'bank'} account must be actively mapped to the NPCI Aadhaar payment bridge. Please visit your bank branch with your Aadhaar card, passbook, and submit the DBT mandate consent form. Retain the stamped acknowledgement receipt. Note: Official staff will NEVER ask for your OTP or PIN.`;

  const [activeMlScript, setActiveMlScript] = useState(mlScript);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAiRegenerateScript = async () => {
    if (!farmer) return;
    setIsAiGenerating(true);
    try {
      const res = await geminiAI.generateVoiceScript(
        farmer.name_ml || farmer.name_en,
        farmer.bank_name || 'ബാങ്ക്',
        diag?.title_en || 'ആധാർ മാപ്പിംഗ് പൊരുത്തക്കേട്',
        farmer.local_body_name || 'കൃഷി ഭവൻ'
      );
      if (res.success && res.text) {
        setActiveMlScript(res.text);
        addToast('Voice script regenerated with Google Gemini AI!', 'success');
      } else {
        addToast('Could not regenerate script via Gemini: ' + (res.error || 'Unknown error'), 'error');
      }
    } catch (err: any) {
      addToast('Error generating AI script: ' + err.message, 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Telephony outcome state
  const [selectedOutcome, setSelectedOutcome] = useState<'ANSWERED' | 'REPLAYED' | 'HELP_REQUESTED' | 'NOT_REACHED' | 'OPTED_OUT'>('ANSWERED');
  const [officerRemarks, setOfficerRemarks] = useState('Beneficiary confirmed understanding DBT bank visit instructions and will visit branch with Aadhaar.');

  // Timer effect for audio waveform simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSeconds(prev => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            stopSpeech();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const togglePlayAudio = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playMalayalamSpeech(
        activeMlScript,
        playbackSpeed,
        () => {
          setIsPlaying(false);
          setCurrentSeconds(0);
        },
        undefined,
        farmer?.farmer_id || caseCode || 'K135'
      );
    }
  };

  const handleRewind = () => {
    setCurrentSeconds(prev => Math.max(0, prev - 10));
  };

  const handleSaveOutcome = () => {
    if (!farmer) return;
    updateFarmerCallStatus(farmer.farmer_id, selectedOutcome);
    logAudit({
      farmer_id: farmer.farmer_id,
      action: `IVR_DISPOSITION_${selectedOutcome}`,
      officer_name: 'K. R. Rajesh, AO',
      office_type: 'KRISHI_BHAVAN',
      details: `Call outcome logged as ${selectedOutcome}. Remarks: ${officerRemarks}`
    });
    addToast(isMl ? 'കോൾ ഫലം വിജയകരമായി രേഖപ്പെടുത്തി' : `Call outcome saved as ${selectedOutcome}`, 'success');
  };

  if (!farmer) return null;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Breadcrumb & Administrative Context Strip */}
      <nav aria-label="Breadcrumb Navigation" className="flex flex-wrap items-center gap-space-xs font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <Link to="/home" className="text-secondary hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>{isMl ? 'ഹോം' : 'Home'}</span>
        </Link>
        <span className="text-border-strong">/</span>
        <Link to="/cases" className="text-secondary hover:text-primary transition-colors">
          {isMl ? 'കേസുകൾ' : 'Cases & Grievances'}
        </Link>
        <span className="text-border-strong">/</span>
        <Link to={`/cases/${farmer.farmer_id}`} className="text-secondary hover:text-primary transition-colors font-semibold">
          Case #{caseCode} ({farmer.name_en})
        </Link>
        <span className="text-border-strong">/</span>
        <span className="text-primary font-bold bg-surface-container-high px-2 py-0.5 rounded-full flex items-center gap-1.5 text-on-surface">
          <span className="material-symbols-outlined text-[16px] text-accent-saffron">settings_voice</span>
          <span>Malayalam Voice Assist (വോയ്‌സ് അസിസ്റ്റ് &amp; SMS കൺസോൾ)</span>
        </span>
      </nav>

      {/* Beneficiary Case Context Master Banner */}
      <section className="bg-surface-card rounded-lg border border-border-subtle p-space-md shadow-sm mb-space-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-saffron" />
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
            <div className="w-14 h-14 rounded-lg bg-primary-container text-on-primary flex flex-col items-center justify-center flex-shrink-0 shadow-xs border border-primary/40">
              <span className="font-data-mono text-data-mono font-black text-accent-saffron">#{caseCode}</span>
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-primary/70">PRIORITY</span>
            </div>
            <div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">{farmer.name_en}</h1>
                <span className="font-title-md text-title-md text-secondary font-medium font-['Noto_Sans_Malayalam']">({farmer.name_ml})</span>
                <span className="font-label-sm text-label-sm bg-status-error-bg text-status-error font-bold px-2 py-0.5 rounded-full uppercase border border-status-error/30">
                  {diag?.priority_level || 'P5'} (Critical)
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface font-semibold px-2 py-0.5 rounded-full">
                  Reg: {farmer.farmer_id}
                </span>
              </div>
              <div className="flex items-center gap-x-space-md gap-y-1 flex-wrap mt-1 font-body-sm text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-outline">badge</span>
                  <strong className="text-on-surface">Aadhaar:</strong> <span className="font-data-mono text-on-surface bg-surface-container-low px-1 rounded">{farmer.aadhaar_masked}</span>
                </span>
                <span className="text-border-subtle">·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-outline">call</span>
                  <strong className="text-on-surface">Mobile:</strong> <span className="font-data-mono text-on-surface bg-surface-container-low px-1 rounded">{farmer.phone}</span>
                </span>
                <span className="text-border-subtle">·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-outline">location_city</span>
                  <strong className="text-on-surface">Panchayat:</strong> {farmer.local_body_name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-space-md pt-space-xs xl:pt-0 border-t xl:border-t-0 border-border-subtle w-full xl:w-auto justify-between xl:justify-end">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-status-error text-[16px]">cancel</span>
                <span className="text-status-error font-bold uppercase tracking-wider">{diag?.rule_id || 'R03'}: {diag?.title_en || 'Aadhaar not mapped in NPCI mapper'}</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">account_balance</span>
                <span>{farmer.bank_name} ({farmer.bank_ifsc})</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-status-ready-bg border border-status-ready/30 px-2.5 py-1 rounded-md text-center flex items-center gap-1 text-status-ready">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span className="font-label-sm text-label-sm font-bold uppercase">Consent: Yes</span>
              </div>
              <div className="bg-status-warning-bg border border-status-warning/40 px-2.5 py-1 rounded-md text-center">
                <span className="block font-label-sm text-[10px] uppercase text-disclaimer-banner-text font-bold">Telephony Status</span>
                <span className="font-label-sm text-label-sm font-bold text-status-warning flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-ping" />
                  {farmer.call_status || 'Ready to Log'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Voice Assist IVR Audio & Bilingual Script Console */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Card: Malayalam IVR Audio Telephony Synthesizer */}
          <section className="bg-surface-card rounded-lg border border-border-subtle p-space-md shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm border-b border-border-subtle gap-2">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded bg-primary-container text-accent-saffron flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
                </div>
                <div>
                  <h2 className="font-title-md text-title-md text-primary font-bold">Automated Malayalam IVR Voice Broadcast</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Web Speech Malayalam Engine (ml-IN) · Bhashini Indic Fallback</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
                <span className="font-label-sm text-label-sm text-status-ready font-bold uppercase">SIP Line Active</span>
              </div>
            </div>

            {/* Master Interactive Audio Controller */}
            <div className="mt-space-md bg-surface-container-low rounded-lg border border-border-subtle p-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={togglePlayAudio}
                    className={`font-label-lg text-label-lg px-space-md py-2.5 rounded shadow-sm flex items-center gap-2 transition-all active:scale-95 focus:outline-none ${
                      isPlaying ? 'bg-accent-saffron text-primary font-bold' : 'bg-primary hover:bg-primary-container text-on-primary'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                    <span>{isPlaying ? 'Pause Call (താൽക്കാലികം)' : 'Play Call (വോയ്സ് കേൾക്കുക)'}</span>
                  </button>

                  <button
                    onClick={() => setShowWifiModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2.5 rounded shadow-sm flex items-center gap-1.5 transition active:scale-95"
                    type="button"
                    title="Call your phone over Wi-Fi so your actual mobile rings and speaks the Malayalam advisory"
                  >
                    <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                    <span>Call My Phone via Wi-Fi</span>
                  </button>

                  <button
                    onClick={handleRewind}
                    className="bg-surface-card hover:bg-surface-container-high text-primary border border-border-strong p-2 rounded transition-colors"
                    title="Rewind 10 seconds"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay_10</span>
                  </button>

                  <div className="font-data-mono text-data-mono font-bold text-primary tracking-wider bg-surface-card px-2 py-1 rounded border border-border-subtle">
                    <span>{String(Math.floor(currentSeconds / 60)).padStart(2, '0')}:{String(currentSeconds % 60).padStart(2, '0')}</span> / <span className="text-outline">01:24</span>
                  </div>
                </div>

                {/* Playback Speed Controls */}
                <div className="flex items-center gap-1 bg-surface-card border border-border-subtle p-1 rounded-md">
                  <span className="font-label-sm text-[11px] text-outline font-bold px-1.5 uppercase">Speed:</span>
                  <button
                    onClick={() => setPlaybackSpeed(0.8)}
                    className={`px-2 py-1 rounded font-label-sm text-label-sm font-bold transition-colors ${
                      playbackSpeed === 0.8 ? 'bg-primary text-on-primary' : 'text-secondary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    0.8x (Senior)
                  </button>
                  <button
                    onClick={() => setPlaybackSpeed(1.0)}
                    className={`px-2 py-1 rounded font-label-sm text-label-sm font-bold transition-colors ${
                      playbackSpeed === 1.0 ? 'bg-primary text-on-primary' : 'text-secondary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    1.0x
                  </button>
                  <button
                    onClick={() => setPlaybackSpeed(1.2)}
                    className={`px-2 py-1 rounded font-label-sm text-label-sm font-bold transition-colors ${
                      playbackSpeed === 1.2 ? 'bg-primary text-on-primary' : 'text-secondary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    1.2x
                  </button>
                </div>
              </div>

              {/* Interactive Audio Waveform Visualization */}
              <div className="relative w-full bg-surface-card rounded border border-border-subtle p-space-sm my-space-sm overflow-hidden group">
                <div className="flex items-center justify-between gap-[3px] h-16 w-full cursor-pointer relative">
                  {/* Scrubhead */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-accent-saffron z-20 pointer-events-none shadow-sm flex flex-col justify-between items-center transition-all duration-300"
                    style={{ left: `${(currentSeconds / totalSeconds) * 100}%` }}
                  >
                    <span className="w-2 h-2 rounded-full bg-accent-saffron -top-1" />
                    <span className="w-2 h-2 rounded-full bg-accent-saffron -bottom-1" />
                  </div>

                  {/* 40 Waveform Bars */}
                  {Array.from({ length: 40 }).map((_, i) => {
                    const isPlayed = (i / 40) <= (currentSeconds / totalSeconds);
                    const heights = [16, 24, 40, 56, 32, 48, 20, 12, 36, 64, 44, 28, 52, 60, 24, 16, 40, 56, 32, 48, 64, 36, 44, 20, 12, 32, 52, 60, 40, 24, 48, 56, 36, 44, 28, 16, 36, 56, 48, 20];
                    const h = heights[i % heights.length];
                    return (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-colors ${
                          isPlayed ? (isPlaying ? 'bg-accent-saffron animate-pulse' : 'bg-primary') : 'bg-border-subtle'
                        }`}
                        style={{ height: `${h}px` }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-[10px] font-data-mono text-outline mt-1 px-1">
                  <span>00:00 (Intro)</span>
                  <span className="text-primary font-bold">00:46 (Bank Instructions)</span>
                  <span>01:05 (Fraud Warning)</span>
                  <span>01:24 (End)</span>
                </div>
              </div>

              {/* Telephony Telemetry Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-space-xs font-label-sm text-label-sm">
                <div className="bg-surface-card rounded p-2 border border-border-subtle flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-accent-green">record_voice_over</span>
                  <div>
                    <span className="block text-[10px] text-outline font-semibold">LANGUAGE / DIALECT</span>
                    <span className="text-on-surface font-bold">Malayalam (Central Thrissur)</span>
                  </div>
                </div>
                <div className="bg-surface-card rounded p-2 border border-border-subtle flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">memory</span>
                  <div>
                    <span className="block text-[10px] text-outline font-semibold">SYNTHESIZER MODEL</span>
                    <span className="text-on-surface font-bold">Bhashini Indic TTS / WebSpeech</span>
                  </div>
                </div>
                <div className="bg-surface-card rounded p-2 border border-border-subtle flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">graphic_eq</span>
                  <div>
                    <span className="block text-[10px] text-outline font-semibold">CARRIER AUDIO FIDELITY</span>
                    <span className="text-on-surface font-bold">24kHz PCM Telephony (SIP)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bilingual Script Side-by-Side */}
            <div className="mt-space-md grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Malayalam Script */}
              <div className="bg-surface-card rounded-lg border border-border-subtle p-space-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle mb-space-sm flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">record_voice_over</span>
                      <h3 className="font-title-md text-title-md text-primary font-bold font-['Noto_Sans_Malayalam']">മലയാളം സന്ദേശം (IVR Script)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isAiGenerating}
                        onClick={handleAiRegenerateScript}
                        className="px-2.5 py-1 rounded bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                        title="Regenerate voice script using Google Gemini 2.5 Flash"
                      >
                        {isAiGenerating ? (
                          <>
                            <span className="animate-spin material-symbols-outlined text-[13px]">progress_activity</span>
                            <span>Gemini Drafting...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[13px] text-accent-saffron">auto_awesome</span>
                            <span>AI Regenerate (Gemini)</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={togglePlayAudio}
                        className="text-secondary hover:text-primary transition-colors flex items-center gap-0.5 text-xs font-bold"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">volume_up</span>
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface font-['Noto_Sans_Malayalam'] leading-relaxed">
                    "{activeMlScript}"
                  </p>
                </div>
                <div className="mt-space-md pt-space-xs border-t border-border-subtle flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="font-label-sm text-[11px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-bold">128 Words · 84 Sec</span>
                  <span className="text-accent-green font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Approved Cadre Text
                  </span>
                </div>
              </div>

              {/* English Translation */}
              <div className="bg-surface-card rounded-lg border border-border-subtle p-space-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle mb-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">translate</span>
                      <h3 className="font-title-md text-title-md text-primary font-bold">English Translation</h3>
                    </div>
                    <span className="font-label-sm text-[10px] uppercase font-bold bg-secondary-container text-on-secondary-fixed px-2 py-0.5 rounded">Verbatim Record</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                    "{enTranslation}"
                  </p>
                </div>
                <div className="mt-space-md pt-space-xs border-t border-border-subtle flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="font-label-sm text-[11px] text-outline">Certified Nodal Translation</span>
                  <span className="font-data-mono text-[11px] text-secondary font-semibold">SHA-256: 7f8c9b2...verified</span>
                </div>
              </div>
            </div>
          </section>

          {/* Telemetry Session Details */}
          <section className="bg-surface-container-low rounded-lg border border-border-subtle p-space-md">
            <h4 className="font-title-md text-title-md text-primary font-bold mb-space-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">analytics</span>
              <span>Krishi Bhavan Voice Trunk Telemetry (Session #SIP-TSR-2026-904)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm font-label-sm text-label-sm mt-space-sm">
              <div className="bg-surface-card p-2.5 rounded border border-border-subtle">
                <span className="text-outline text-[11px] block">CALL INITIATED</span>
                <span className="font-data-mono font-bold text-on-surface">10:31:05 AM IST</span>
              </div>
              <div className="bg-surface-card p-2.5 rounded border border-border-subtle">
                <span className="text-outline text-[11px] block">RING DURATION</span>
                <span className="font-data-mono font-bold text-on-surface">14 Seconds (Answered)</span>
              </div>
              <div className="bg-surface-card p-2.5 rounded border border-border-subtle">
                <span className="text-outline text-[11px] block">CARRIER / GATEWAY</span>
                <span className="font-bold text-on-surface">BSNL Kerala PSTN</span>
              </div>
              <div className="bg-surface-card p-2.5 rounded border border-border-subtle">
                <span className="text-outline text-[11px] block">DTMF KEYPRESS</span>
                <span className="font-data-mono font-bold text-status-ready">Key 1 (Acknowledged)</span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Mobile SMS Mockup + Call Outcome Action Box */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Vernacular SMS Realistic Phone Mockup */}
          <section className="bg-surface-card rounded-lg border border-border-subtle p-space-md shadow-sm">
            <div className="flex items-center justify-between pb-space-sm border-b border-border-subtle mb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">sms</span>
                <h3 className="font-title-md text-title-md text-primary font-bold">Vernacular SMS Dispatch</h3>
              </div>
              <span className="font-label-sm text-label-sm text-status-ready bg-status-ready-bg border border-status-ready/30 px-2 py-0.5 rounded font-bold uppercase">
                DLT Approved
              </span>
            </div>

            {/* Smartphone Graphic */}
            <div className="max-w-[340px] mx-auto bg-primary rounded-[28px] p-2.5 shadow-md border-2 border-border-strong">
              <div className="w-full flex justify-center mb-1">
                <div className="h-1.5 w-16 bg-on-primary-container rounded-full opacity-60" />
              </div>
              <div className="bg-surface-card rounded-[20px] overflow-hidden flex flex-col border border-border-subtle min-h-[380px]">
                <div className="bg-surface-container-high px-3 py-1 flex items-center justify-between text-[11px] font-label-sm text-on-surface">
                  <span className="font-bold">10:45 AM</span>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="text-[10px] font-bold">4G VoLTE</span>
                    <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[14px]">battery_std</span>
                    <span className="font-bold text-[10px]">92%</span>
                  </div>
                </div>

                <div className="bg-primary text-on-primary px-3 py-2 flex items-center gap-2 border-b border-primary/20 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <div className="w-7 h-7 rounded-full bg-accent-saffron text-primary font-black text-xs flex items-center justify-center font-data-mono">
                    KB
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-bold text-on-primary tracking-wide leading-none">VK-AGRIKRISHI</span>
                    <span className="text-[10px] text-on-primary/70 leading-tight">Govt of Kerala · DBT-GUARD</span>
                  </div>
                </div>

                <div className="p-3 bg-background-slate flex-1 flex flex-col justify-start gap-2.5 overflow-y-auto">
                  <div className="text-center">
                    <span className="bg-surface-card border border-border-subtle text-outline font-label-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Today, 10:32 AM</span>
                  </div>
                  <div className="bg-surface-card border border-border-subtle rounded-lg rounded-tl-none p-3 shadow-xs max-w-[95%] self-start relative">
                    <div className="font-label-sm text-[10px] font-bold text-accent-saffron uppercase mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">security</span> Official PM-KISAN Alert
                    </div>
                    <p className="font-body-sm text-[12px] leading-relaxed text-on-surface font-['Noto_Sans_Malayalam']">
                      പ്രിയ കർഷകൻ {farmer.name_ml}, നിങ്ങളുടെ പിഎം-കിസാൻ 23-ാം ഗഡു തടസ്സപ്പെട്ടിരിക്കുന്നു. ഉടൻ തന്നെ ആധാർ കാർഡും പാസ്ബുക്കുമായി {farmer.bank_name} {farmer.local_body_name} ശാഖയിൽ എത്തി NPCI മാപ്പിംഗ് പൂർത്തിയാക്കുക. ഒ.ടി.പി ആരുമായും പങ്കുവെക്കരുത്. കൃഷി ഭവൻ തൃശ്ശൂർ.
                    </p>
                    <div className="mt-2 pt-1 border-t border-border-subtle flex items-center justify-between text-[9px] text-outline font-data-mono">
                      <span>DLT ID: 140716...398</span>
                      <span className="flex items-center text-secondary font-bold gap-0.5">
                        10:32 AM <span className="material-symbols-outlined text-[12px] text-status-ready">done_all</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-label-sm text-status-ready bg-status-ready-bg/80 border border-status-ready/20 rounded py-1 px-2 mx-auto">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Delivered (BSNL Gateway DLT)</span>
                  </div>
                </div>

                <div className="p-2 bg-surface-card border-t border-border-subtle flex items-center gap-1.5 text-outline">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <div className="flex-1 bg-surface-container-low rounded-full px-3 py-1 text-[11px] text-outline">
                    Text message (BSNL Gateway)...
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-secondary">send</span>
                </div>
              </div>
            </div>

            <div className="mt-space-md flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => addToast('Bilingual SMS redelivered via BSNL DLT Gateway', 'info')}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-2 px-3 rounded border border-primary transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                <span>Resend Bilingual SMS</span>
              </button>
            </div>
          </section>

          {/* Call Logging & Outcome Console */}
          <section className="bg-surface-card rounded-lg border border-border-subtle p-space-md shadow-sm">
            <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle mb-space-sm">
              <div>
                <h3 className="font-title-md text-title-md text-primary font-bold">Log IVR Call Outcome</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant font-['Noto_Sans_Malayalam']">കോൾ ഫലം രേഖപ്പെടുത്തുക · AO Disposition</p>
              </div>
              <span className="font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-fixed px-2.5 py-0.5 rounded-full">
                Officer Action
              </span>
            </div>

            <div className="flex items-center justify-between bg-surface-container-low p-2 rounded border border-border-subtle mb-space-sm font-label-sm text-label-sm">
              <div className="flex items-center gap-2">
                <span className="text-outline uppercase text-[11px]">Dialing Attempt:</span>
                <span className="font-bold text-primary bg-surface-card px-2 py-0.5 rounded border border-border-subtle">1 of 2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-outline uppercase text-[11px]">Farmer Consent:</span>
                <span className="font-bold text-status-ready flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Yes Recorded
                </span>
              </div>
            </div>

            {/* 5 Telephony Outcome Radio Options */}
            <div className="flex flex-col gap-1.5 mb-space-md">
              {[
                { key: 'ANSWERED', label: '1. Answered (കർഷകൻ പ്രതികരിച്ചു)', desc: 'Beneficiary confirmed understanding DBT bank visit instructions', icon: 'phone_callback', color: 'text-status-ready' },
                { key: 'REPLAYED', label: '2. Replayed (വീണ്ടും കേട്ടു)', desc: 'Beneficiary pressed 1 to repeat the Malayalam IVR audio message', icon: 'replay', color: 'text-secondary' },
                { key: 'HELP_REQUESTED', label: '3. Help requested (സഹായം ആവശ്യപ്പെട്ടു)', desc: 'Beneficiary requested Akshaya volunteer doorstep assistance', icon: 'support_agent', color: 'text-status-warning' },
                { key: 'NOT_REACHED', label: '4. Not reached (ലഭ്യമല്ല)', desc: 'No answer, line busy, or outside network coverage area', icon: 'phone_missed', color: 'text-status-error' },
                { key: 'OPTED_OUT', label: '5. Opted out (ഒഴിവാക്കി)', desc: 'Beneficiary declined automated phone announcements', icon: 'block', color: 'text-status-pending' }
              ].map(opt => {
                const isSelected = selectedOutcome === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedOutcome(opt.key as any)}
                    className={`w-full p-2.5 rounded-md border text-on-surface flex items-center justify-between transition-all focus:outline-none ${
                      isSelected ? 'border-2 border-accent-green bg-status-ready-bg/50' : 'border-border-subtle bg-surface-card hover:bg-surface-container-low'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <span className={`material-symbols-outlined text-[22px] ${opt.color}`}>{opt.icon}</span>
                      <div>
                        <span className="font-label-md text-label-md font-bold text-on-surface block">{opt.label}</span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">{opt.desc}</span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-status-ready font-bold' : 'text-outline'}`}>
                      {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Policy Directive */}
            <div className="bg-disclaimer-banner-bg border border-disclaimer-banner-border rounded-md p-space-sm mb-space-md flex items-start gap-2 text-disclaimer-banner-text">
              <span className="material-symbols-outlined text-status-warning text-[20px] flex-shrink-0 mt-0.5">notification_important</span>
              <div className="font-body-sm text-body-sm">
                <strong className="font-bold block text-disclaimer-banner-text">Policy Directive (G.O.(Rt) No. 428/2024/AGRI):</strong>
                <span>After 2 'Not reached' attempts, the case is automatically escalated and flagged for a Krishi Bhavan Field Visit / Akshaya Volunteer doorstep verification.</span>
              </div>
            </div>

            {/* Officer Remarks */}
            <div className="flex flex-col gap-1.5 mb-space-md">
              <label className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between" htmlFor="officer-remarks">
                <span>Officer Telephony Remarks / Action Log:</span>
                <span className="text-outline font-normal text-xs font-data-mono">Max 250 characters</span>
              </label>
              <textarea
                id="officer-remarks"
                value={officerRemarks}
                onChange={e => setOfficerRemarks(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded border border-border-strong bg-surface-card font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveOutcome}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg py-2.5 px-space-md rounded shadow-sm transition-all flex items-center justify-center gap-2 font-bold focus:outline-none"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                <span>Save &amp; Submit Outcome</span>
              </button>

              <Link
                to={`/cases/${farmer.farmer_id}`}
                className="w-full text-center py-2 text-secondary hover:text-primary font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Case File #{caseCode} ({farmer.name_en})</span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      <WiFiCallModal
        isOpen={showWifiModal}
        onClose={() => setShowWifiModal(false)}
        caseCode={caseCode}
        farmerNameEn={farmer?.name_en || 'Beneficiary'}
        farmerNameMl={farmer?.name_ml || 'ഗുണഭോക്താവ്'}
        defaultPhone={farmer?.mobile_masked || '+91 9846012345'}
        problemSummary={diag?.title_en || diag?.diagnostic_summary}
      />
    </div>
  );
};
