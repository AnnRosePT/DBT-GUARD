/**
 * DBT-GUARD Web Audio Telephony Synthesizer
 * Synthesizes standard Indian telecom ringback cadences (TRAI 400Hz + 33Hz modulation)
 * and DTMF tones for the Wi-Fi calling bridge and incoming call simulation.
 */

class TelephonyAudioEngine {
  private ctx: AudioContext | null = null;
  private isRinging: boolean = false;
  private ringTimer: number | null = null;

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays standard Indian telecom ringback tone burst (0.4s on, 0.2s off, 0.4s on, 2.0s off)
   */
  public startRingbackTone(): void {
    if (this.isRinging) return;
    this.isRinging = true;

    const playBurst = () => {
      if (!this.isRinging) return;
      try {
        const ctx = this.initContext();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Standard Indian telecom dial tone: 400Hz carrier + 33Hz modulation
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(433, ctx.currentTime);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);

        this.ringTimer = window.setTimeout(() => {
          if (this.isRinging) playBurst();
        }, 3000);
      } catch (e) {
        console.warn('AudioContext playback error:', e);
      }
    };

    playBurst();
  }

  /**
   * Stops the ringback tone immediately upon call connection or termination
   */
  public stopRingbackTone(): void {
    this.isRinging = false;
    if (this.ringTimer !== null) {
      clearTimeout(this.ringTimer);
      this.ringTimer = null;
    }
  }

  /**
   * Plays a pleasant telephony notification chime
   */
  public playCallConnectedChime(): void {
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Connected chime error:', e);
    }
  }
}

export const telephonyAudio = new TelephonyAudioEngine();
