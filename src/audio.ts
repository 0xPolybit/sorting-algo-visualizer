// Audio context singleton
let audioCtx: AudioContext | null = null;

async function getAudioCtx(): Promise<AudioContext> {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
  return audioCtx;
}

/** Pre-warm audio context so it's ready when needed. */
export async function initAudio() {
  try {
    await getAudioCtx();
  } catch {
    // Silently fail
  }
}

/** Play a frequency-mapped tone during sorting visualization. */
export async function playTone(
  value: number,
  maxVal: number,
  freqMin: number,
  freqMax: number,
) {
  try {
    const ctx = await getAudioCtx();
    const freq = freqMin + (value / maxVal) * (freqMax - freqMin);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Silently fail
  }
}

// ---- UI interaction sounds ----

/** Short click for playback buttons (play, pause, reset, go back). */
export async function playClick() {
  try {
    const ctx = await getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Silently fail
  }
}

/** Toggle sound — rising pitch for on, falling pitch for off. */
export async function playToggle(on: boolean) {
  try {
    const ctx = await getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(on ? 500 : 700, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(
      on ? 700 : 500,
      ctx.currentTime + 0.06,
    );
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Silently fail
  }
}

/** Sidebar algorithm selection — a crisp high blip. */
export async function playSelect() {
  try {
    const ctx = await getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 1050;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Silently fail
  }
}

/** Slider tick — maps the slider's normalised position (0-1) to a pitch. */
export async function playSliderTick(ratio: number) {
  try {
    const ctx = await getAudioCtx();
    const freq = 300 + ratio * 600;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // Silently fail
  }
}
