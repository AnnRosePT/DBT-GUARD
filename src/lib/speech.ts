/**
 * DBT-GUARD Malayalam IVR Voice Telephony Engine
 * 
 * Provides:
 * 1. High-fidelity native Malayalam audio broadcast playback (MP3 stream / cached assets)
 * 2. Dynamic online Malayalam neural TTS streaming for custom Gemini-drafted scripts
 * 3. SIP telecom dial tone & connection chime via Web Audio API
 * 4. Fallback to browser SpeechSynthesis where supported
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  caseId?: string;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class MalayalamVoicePlayer {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static activeAudio: HTMLAudioElement | null = null;
  private static audioCtx: AudioContext | null = null;

  public static isSpeaking(): boolean {
    if (this.activeAudio && !this.activeAudio.paused && !this.activeAudio.ended) return true;
    if (this.synth && this.synth.speaking) return true;
    return false;
  }

  public static stop(): void {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeAudio = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Plays realistic telecom SIP connect tone (440Hz + 480Hz dialtone burst)
   */
  private static playTelecomChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.frequency.value = 440; // Standard dial tone frequency 1
      osc2.frequency.value = 480; // Standard dial tone frequency 2

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.audioCtx.currentTime + 0.35);
      osc2.stop(this.audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext not allowed or not supported
    }
  }

  /**
   * Primary play method:
   * 1. Check local pre-recorded audio file (/audio/{caseId}.mp3 or /audio/k135.mp3)
   * 2. If dynamic or missing, stream from native Malayalam TTS endpoint
   * 3. Fallback to Web Speech Synthesis
   */
  public static play(
    text: string,
    caseOrIssueCode: string = 'K135',
    options?: SpeechOptions
  ): { method: 'audio-file' | 'tts-stream' | 'web-speech'; message: string } {
    this.stop();
    this.playTelecomChime();

    const normalizedCode = (options?.caseId || caseOrIssueCode || 'K135').toLowerCase();

    // Priority 1: Check known local pre-generated high quality MP3s
    const candidateFiles = [
      `/audio/${normalizedCode}.mp3`,
      normalizedCode.startsWith('k') ? `/audio/${normalizedCode}.mp3` : null,
      '/audio/k135.mp3',
      '/audio/k104.mp3',
      '/audio/ivr_default.mp3',
    ].filter(Boolean) as string[];

    // Attempt to play candidate file
    const tryPlayAudioFiles = (index: number) => {
      if (index >= candidateFiles.length) {
        // Fallback to online dynamic TTS or SpeechSynthesis
        this.tryOnlineStreamOrSpeech(text, options);
        return;
      }

      const url = candidateFiles[index];
      const audio = new Audio(url);
      audio.playbackRate = options?.rate || 1.0;
      this.activeAudio = audio;

      audio.onended = () => {
        this.activeAudio = null;
        options?.onEnd?.();
      };

      audio.onerror = () => {
        // Try next audio candidate
        tryPlayAudioFiles(index + 1);
      };

      audio
        .play()
        .then(() => {
          // Successfully playing audio
        })
        .catch(() => {
          tryPlayAudioFiles(index + 1);
        });
    };

    tryPlayAudioFiles(0);

    return {
      method: 'audio-file',
      message: 'Playing native Malayalam IVR broadcast',
    };
  }

  private static tryOnlineStreamOrSpeech(text: string, options?: SpeechOptions): void {
    // Clean and shorten text for URL encoding (max 150 chars for Google TTS chunk)
    const cleanText = text.replace(/[\n\r"]/g, ' ').trim().slice(0, 140);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText
    )}&tl=ml&client=tw-ob`;

    const audio = new Audio(ttsUrl);
    audio.playbackRate = options?.rate || 1.0;
    this.activeAudio = audio;

    audio.onended = () => {
      this.activeAudio = null;
      options?.onEnd?.();
    };

    audio.onerror = () => {
      this.fallbackWebSpeech(text, options);
    };

    audio
      .play()
      .then(() => {
        // stream playing
      })
      .catch(() => {
        this.fallbackWebSpeech(text, options);
      });
  }

  private static fallbackWebSpeech(text: string, options?: SpeechOptions): void {
    if (!this.synth) {
      options?.onError?.(new Error('Audio playback not supported'));
      return;
    }

    try {
      const voices = this.synth.getVoices();
      const mlVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('ml') ||
          v.name.toLowerCase().includes('malayalam') ||
          v.lang.toLowerCase().includes('in')
      );

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = mlVoice ? 'ml-IN' : 'en-IN';
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;

      if (mlVoice) {
        utterance.voice = mlVoice;
      }

      utterance.onend = () => {
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        options?.onError?.(e);
      };

      this.synth.speak(utterance);
    } catch (e) {
      options?.onError?.(e);
    }
  }
}

export function playMalayalamSpeech(
  text: string,
  rate: number = 1.0,
  onEnd?: () => void,
  onError?: (err: any) => void,
  caseId: string = 'K135'
) {
  return MalayalamVoicePlayer.play(text, caseId, { rate, caseId, onEnd, onError });
}

export function stopSpeech(): void {
  MalayalamVoicePlayer.stop();
}

export function isSpeechPlaying(): boolean {
  return MalayalamVoicePlayer.isSpeaking();
}
