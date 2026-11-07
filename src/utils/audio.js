// Web Audio ile tel sesi (Karplus-Strong): gürültü bir gecikme hattında süzülerek telin titreşimini taklit eder

let audioCtx = null;
const bufferCache = new Map();

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function createPluckBuffer(ctx, midi, duration = 2.5) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  const period = Math.max(2, Math.round(sampleRate / midiToFrequency(midi)));
  // Tiz notalar daha hızlı söner, pes notalar daha uzun çınlar
  const decay = 0.996 - (midi - 40) * 0.00004;

  for (let i = 0; i < period && i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  for (let i = period; i < length; i++) {
    data[i] = decay * 0.5 * (data[i - period] + data[i - period + 1]);
  }
  return buffer;
}

export function playMidi(midi, delay = 0, volume = 0.35) {
  const ctx = getContext();
  if (!bufferCache.has(midi)) {
    bufferCache.set(midi, createPluckBuffer(ctx, midi));
  }

  const source = ctx.createBufferSource();
  source.buffer = bufferCache.get(midi);

  const startAt = ctx.currentTime + delay;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + source.buffer.duration);

  source.connect(gain).connect(ctx.destination);
  source.start(startAt);
}

// Akoru kalın telden ince tele doğru tarayarak çal (strum)
export function playChord(midis) {
  [...midis].sort((a, b) => a - b).forEach((midi, i) => playMidi(midi, i * 0.035, 0.2));
}
