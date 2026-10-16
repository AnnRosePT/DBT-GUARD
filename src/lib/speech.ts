export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class MalayalamVoicePlayer {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static activeAudio: HTMLAudioElement | null = null;

  public static isSpeaking(): boolean {
    if (this.synth && this.synth.speaking) return true;
    if (this.activeAudio && !this.activeAudio.paused) return true;
    return false;
  }

  public static stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
  }

  public static play(
    text: string,
    issueCode: string = 'R01',
    options?: SpeechOptions
  ): { method: 'web-speech' | 'audio-file' | 'fallback-text'; message: string } {
    this.stop();

    if (this.synth) {
      const voices = this.synth.getVoices();
      const mlVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('ml') ||
          v.name.toLowerCase().includes('malayalam') ||
          v.lang.toLowerCase().includes('in')
      );

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ml-IN';
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;

      if (mlVoice) {
        utterance.voice = mlVoice;
      }

      utterance.onend = () => {
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error, attempting audio fallback:', e);
        this.fallbackAudio(issueCode, options);
      };

      try {
        this.synth.speak(utterance);
        return {
          method: 'web-speech',
          message: mlVoice
            ? 'Speaking with Malayalam system voice'
            : 'Speaking with Indic regional synthesizer',
        };
      } catch (err) {
        console.warn('SpeechSynthesis speak failed:', err);
      }
    }

    return this.fallbackAudio(issueCode, options);
  }

  private static fallbackAudio(
    issueCode: string,
    options?: SpeechOptions
  ): { method: 'web-speech' | 'audio-file' | 'fallback-text'; message: string } {
    const audioUrl = `/audio/${issueCode.toLowerCase()}.mp3`;
    const audio = new Audio(audioUrl);
    this.activeAudio = audio;

    audio.onended = () => {
      options?.onEnd?.();
    };

    audio.onerror = () => {
      console.info(`No local audio file at ${audioUrl}, using text notice.`);
      options?.onError?.(new Error('No audio file found'));
    };

    audio
      .play()
      .then(() => {
        // audio playing
      })
      .catch((e) => {
        console.info('Audio play error / text fallback active:', e);
      });

    return {
      method: 'audio-file',
      message: 'Playing recorded audio broadcast or vernacular transcript',
    };
  }
}

export function playMalayalamSpeech(
  text: string,
  rate: number = 1.0,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  return MalayalamVoicePlayer.play(text, 'R01', { rate, onEnd, onError });
}

export function stopSpeech(): void {
  MalayalamVoicePlayer.stop();
}

export function isSpeechPlaying(): boolean {
  return MalayalamVoicePlayer.isSpeaking();
}
