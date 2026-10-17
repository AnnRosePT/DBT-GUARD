import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { MalayalamVoicePlayer } from '../lib/speech';

export function IncomingCall() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases } = useAppStore();

  const caseId = id || 'K135';
  const caseItem = cases.find((c) => c.case_id.toLowerCase() === caseId.toLowerCase()) || cases[0];

  // Call States: 'RINGING' | 'IN_CALL' | 'ENDED'
  const [callState, setCallState] = useState<'RINGING' | 'IN_CALL' | 'ENDED'>('RINGING');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [keypadPressed, setKeypadPressed] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize authentic phone ring tone (440Hz + 480Hz dual tone cadence)
  const playRingToneBurst = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);

      // Trigger phone vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([800, 400, 800, 400]);
      }
    } catch {
      // AudioContext unavailable
    }
  };

  useEffect(() => {
    if (callState === 'RINGING') {
      playRingToneBurst();
      ringIntervalRef.current = setInterval(() => {
        playRingToneBurst();
      }, 4000);
    } else {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
        ringIntervalRef.current = null;
      }
    }

    return () => {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
      }
      MalayalamVoicePlayer.stop();
    };
  }, [callState]);

  // In-Call Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'IN_CALL') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleAnswerCall = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    setCallState('IN_CALL');

    // Play real Malayalam voice explaining the problem
    const voiceText = `നമസ്കാരം ${caseItem?.farmer_name_ml || 'കർഷകരേ'}, തൃശ്ശൂർ കൃഷി ഭവനിൽ നിന്നുള്ള അടിയന്തര അറിയിപ്പാണ്. നിങ്ങളുടെ പി എം കിസാൻ ഗഡു തടസ്സപ്പെട്ടിരിക്കുന്നു. ആധാർ മാപ്പിംഗ് എത്രയും വേഗം പൂർത്തിയാക്കുക.`;
    MalayalamVoicePlayer.play(voiceText, caseItem?.case_id || 'K135', {
      caseId: caseItem?.case_id,
      onEnd: () => {
        // Voice broadcast completed
      },
    });
  };

  const handleEndCall = () => {
    MalayalamVoicePlayer.stop();
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
    }
    setCallState('ENDED');
  };

  const handleKeypad = (num: string) => {
    setKeypadPressed(num);
    if (num === '2') {
      // Replay
      const voiceText = `നമസ്കാരം, സന്ദേശം വീണ്ടും കേൾപ്പിക്കുന്നു. ആധാർ മാപ്പിംഗ് എത്രയും വേഗം പൂർത്തിയാക്കുക.`;
      MalayalamVoicePlayer.play(voiceText, caseItem?.case_id || 'K135');
    }
    setTimeout(() => setKeypadPressed(null), 1500);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
            {callState === 'RINGING' ? 'INCOMING WI-FI CALL' : callState === 'IN_CALL' ? 'CALL ACTIVE (HD VOICE)' : 'CALL ENDED'}
          </span>
        </div>
        <Link
          to="/dashboard"
          className="text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700 transition text-[11px]"
        >
          Exit to Dashboard
        </Link>
      </div>

      {/* Main Calling Stage */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 my-auto">
        {/* Caller Avatar with Pulse Ring */}
        <div className="relative">
          <div
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all duration-500 border-4 ${
              callState === 'RINGING'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400 animate-pulse'
                : callState === 'IN_CALL'
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 border-blue-400'
                : 'bg-slate-800 border-slate-700 opacity-60'
            }`}
          >
            🏛️
          </div>
          {callState === 'RINGING' && (
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-40 pointer-events-none" />
          )}
        </div>

        {/* Caller Info */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Krishi Bhavan Thrissur
          </h1>
          <p className="text-sm sm:text-base text-emerald-400 font-medium">
            0487-2331122 • PM-KISAN DBT Remediation Cell
          </p>
          <p className="text-xs text-slate-400 font-['Noto_Sans_Malayalam']">
            ഗുണഭോക്താവ്: <strong className="text-white">{caseItem?.farmer_name_ml || caseItem?.farmer_name_en}</strong>
          </p>
        </div>

        {/* Status / Timer */}
        <div>
          {callState === 'RINGING' && (
            <div className="text-sm text-slate-300 font-mono tracking-wide animate-pulse">
              Incoming Wi-Fi VoIP Call... (ഫോൺ ബെല്ലടിക്കുന്നു)
            </div>
          )}

          {callState === 'IN_CALL' && (
            <div className="space-y-3">
              <div className="text-2xl font-mono text-emerald-400 font-bold">
                {formatSeconds(callDuration)}
              </div>

              {/* Problem Explanation Banner */}
              <div className="max-w-md bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-left space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase">
                  <span>⚠️ Remediation Advisory Playing</span>
                  <span>Rule: {caseItem?.rule_code}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-['Noto_Sans_Malayalam'] leading-relaxed">
                  "{caseItem?.problem_statement || caseItem?.issue_description || 'നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ടിൽ ആധാർ മാപ്പിംഗ് ആവശ്യമാണ്.'}"
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold border-t border-slate-800 pt-1.5">
                  → നിർദ്ദേശം: {caseItem?.farmer_action_text || caseItem?.immediate_next_action || 'അടുത്തുള്ള പോസ്റ്റ് ഓഫീസിലോ ബാങ്കിലോ ആധാർ കാർഡുമായി എത്തുക.'}
                </div>
              </div>

              {/* Keypad Quick Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleKeypad('1')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Press 1: ബാങ്കിൽ പോകാം
                </button>
                <button
                  onClick={() => handleKeypad('2')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Press 2: വീണ്ടും കേൾക്കുക
                </button>
              </div>

              {keypadPressed && (
                <div className="text-xs text-emerald-400 font-mono">
                  ✓ DTMF Tone '{keypadPressed}' Received
                </div>
              )}
            </div>
          )}

          {callState === 'ENDED' && (
            <div className="space-y-4">
              <div className="text-lg text-slate-300 font-bold">
                Call Ended • Duration: {formatSeconds(callDuration)}
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Call disposition logged to Krishi Bhavan audit registry. Beneficiary notified via automated IVR.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCallState('RINGING');
                    setCallDuration(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Call Again (വീണ്ടും വിളിക്കുക)
                </button>
                <button
                  onClick={() => navigate(`/cases/${caseItem?.case_id}`)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  View Case Dossier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="w-full max-w-md mx-auto pt-6 border-t border-slate-800/80">
        {callState === 'RINGING' && (
          <div className="flex items-center justify-around gap-6">
            {/* Decline Button */}
            <button
              onClick={handleEndCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-2xl shadow-xl shadow-rose-600/30 transition transform group-active:scale-95">
                ✕
              </div>
              <span className="text-xs font-semibold text-rose-400">Decline (നിരസിക്കുക)</span>
            </button>

            {/* Answer Button */}
            <button
              onClick={handleAnswerCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/40 transition transform group-active:scale-95 animate-bounce">
                📞
              </div>
              <span className="text-xs font-bold text-emerald-400">Answer (കോൾ എടുക്കുക)</span>
            </button>
          </div>
        )}

        {callState === 'IN_CALL' && (
          <div className="space-y-4">
            <div className="flex items-center justify-around text-xs text-slate-400">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition ${
                  isMuted ? 'bg-amber-500/20 text-amber-300 border-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {isMuted ? '🔇 Muted' : '🎙️ Mute'}
              </button>
              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`p-3 rounded-full border transition ${
                  isSpeaker ? 'bg-blue-500/20 text-blue-300 border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                🔊 Speaker
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-2xl shadow-xl shadow-rose-600/40 transition"
                title="Hang Up"
              >
                ☎️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
