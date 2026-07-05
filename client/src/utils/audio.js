/**
 * Synthesizes high-fidelity productivity alarm sounds client-side
 * using the Web Audio API (avoids missing asset or network latency issues).
 */
export const playAlarmSound = (soundType) => {
  if (!soundType || soundType === 'none') return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();

  const playChime = () => {
    const now = ctx.currentTime;

    // Tone 1: High crisp A5-A6 slide
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Tone 2: Delayed bright C6-C7 resonance
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(2093, now + 0.18);
    gain2.gain.setValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);
  };

  const playBell = () => {
    const now = ctx.currentTime;
    // Harmonic frequencies for a warm brass bell
    const frequencies = [587.33, 880, 1174.66, 1479.98];
    const gains = [0.12, 0.06, 0.04, 0.02];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(gains[idx], now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2 - idx * 0.15);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  };

  if (soundType === 'chime') {
    playChime();
  } else if (soundType === 'bell') {
    playBell();
  }
};
