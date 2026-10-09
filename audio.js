import { frequency } from './core.js';
export class TonePlayer {
  constructor(Context = globalThis.AudioContext || globalThis.webkitAudioContext) {
    this.Context = Context; this.context = null; this.active = null; this.token = 0;
  }
  stop() {
    this.token++;
    const voice = this.active;
    this.active = null;
    if (!voice) return;
    const now = this.context.currentTime;
    try {
      // Replace the remaining envelope with a short release. A new voice starts
      // after this release, so rapid taps cannot stack oscillators.
      if (voice.gain.gain.cancelAndHoldAtTime) voice.gain.gain.cancelAndHoldAtTime(now);
      else { voice.gain.gain.cancelScheduledValues(now); voice.gain.gain.setValueAtTime(0, now); }
      voice.gain.gain.linearRampToValueAtTime(0, now + 0.012);
      voice.osc.stop(now + 0.015);
    } catch { this.disconnect(voice); }
  }
  disconnect(voice) { try { voice.osc.disconnect(); voice.gain.disconnect(); } catch { /* Already disconnected. */ } }
  async play(midi, duration) {
    this.stop();
    const token = this.token;
    if (!this.Context) throw new Error('This browser does not support Web Audio. Open the app in Safari.');
    // Context creation and resume are initiated directly inside the tap handler.
    if (!this.context || this.context.state === 'closed') this.context = new this.Context();
    if (this.context.state !== 'running') await this.context.resume();
    if (token !== this.token) return false;
    if (this.context.state !== 'running') throw new Error('Audio is paused. Tap Play Note again.');
    const start = this.context.currentTime + 0.02;
    const fade = Math.min(0.02, duration / 4);
    const osc = this.context.createOscillator(), gain = this.context.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(frequency(midi), start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18, start + fade);
    gain.gain.setValueAtTime(0.18, start + duration - fade);
    gain.gain.linearRampToValueAtTime(0, start + duration);
    osc.connect(gain); gain.connect(this.context.destination);
    const voice = { osc, gain }; this.active = voice;
    osc.onended = () => { this.disconnect(voice); if (this.active === voice) this.active = null; };
    osc.start(start); osc.stop(start + duration);
    return true;
  }
  deactivate() { this.stop(); if (this.context && this.context.state === 'running') this.context.suspend().catch(() => {}); }
}
