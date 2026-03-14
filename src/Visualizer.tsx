import { useCallback, useEffect, useRef, useState } from "react";
import { algorithms, type SortGenerator, type SortStep } from "./algorithms";

type Props = {
  algorithmIndex: number;
  onPlayingChange?: (playing: boolean) => void;
};

function generateArray(size: number, evenGaps: boolean): number[] {
  if (evenGaps) {
    const values = Array.from({ length: size }, (_, i) =>
      Math.floor(((i + 1) / size) * 95 + 5)
    );
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  }
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
}

// Audio context singleton
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(value: number, maxVal: number, freqMin: number, freqMax: number) {
  const ctx = getAudioCtx();
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
}

function playWelcomeTone() {
  const ctx = getAudioCtx();
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.15);
  });
}

export default function Visualizer({ algorithmIndex, onPlayingChange }: Props) {
  const [size, setSize] = useState(30);
  const [ascending, setAscending] = useState(true);
  const [evenGaps, setEvenGaps] = useState(false);
  const [finalSweep, setFinalSweep] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [freqMin, setFreqMin] = useState(200);
  const [freqMax, setFreqMax] = useState(1200);
  const [speed, setSpeed] = useState(20);
  const [array, setArray] = useState(() => generateArray(30, false));
  const [initialArray, setInitialArray] = useState<number[]>(() => [...array]);
  const [comparing, setComparing] = useState<[number, number] | null>(null);
  const [swapping, setSwapping] = useState<[number, number] | null>(null);
  const [sweepIndex, setSweepIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const generatorRef = useRef<SortGenerator | null>(null);
  const frameRef = useRef<number>(0);
  const speedRef = useRef(20);
  const playingRef = useRef(false);
  const sweepingRef = useRef(false);
  const soundRef = useRef(false);
  const freqMinRef = useRef(200);
  const freqMaxRef = useRef(1200);
  const finalSweepRef = useRef(false);
  const welcomePlayedRef = useRef(false);

  soundRef.current = soundEnabled;
  freqMinRef.current = freqMin;
  freqMaxRef.current = freqMax;
  finalSweepRef.current = finalSweep;

  // Play welcome tone on first user interaction to initialize AudioContext
  useEffect(() => {
    const handler = () => {
      if (!welcomePlayedRef.current) {
        welcomePlayedRef.current = true;
        playWelcomeTone();
      }
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("click", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  const doSweep = useCallback((arr: number[]) => {
    sweepingRef.current = true;
    let idx = 0;
    const maxVal = Math.max(...arr, 1);
    const tick = () => {
      if (idx >= arr.length) {
        setSweepIndex(null);
        sweepingRef.current = false;
        setPlaying(false);
        setDone(true);
        playingRef.current = false;
        return;
      }
      setSweepIndex(idx);
      if (soundRef.current) {
        playTone(arr[idx], maxVal, freqMinRef.current, freqMaxRef.current);
      }
      idx++;
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  // Reset: re-randomize the bars
  const reset = useCallback(() => {
    playingRef.current = false;
    sweepingRef.current = false;
    setPlaying(false);
    setDone(false);
    setStarted(false);
    setComparing(null);
    setSwapping(null);
    setSweepIndex(null);
    cancelAnimationFrame(frameRef.current);
    generatorRef.current = null;
    const newArr = generateArray(size, evenGaps);
    setArray(newArr);
    setInitialArray([...newArr]);
  }, [size, evenGaps]);

  // Go back: restore initial array without re-randomizing
  const goBack = useCallback(() => {
    playingRef.current = false;
    sweepingRef.current = false;
    setPlaying(false);
    setDone(false);
    setStarted(false);
    setComparing(null);
    setSwapping(null);
    setSweepIndex(null);
    cancelAnimationFrame(frameRef.current);
    generatorRef.current = null;
    setArray([...initialArray]);
  }, [initialArray]);

  // Re-randomize when size or evenGaps change
  useEffect(() => {
    reset();
  }, [size, evenGaps, reset]);

  // When algorithm changes, just clear animation state but keep the same array
  const prevAlgoRef = useRef(algorithmIndex);
  useEffect(() => {
    if (prevAlgoRef.current !== algorithmIndex) {
      prevAlgoRef.current = algorithmIndex;
      playingRef.current = false;
      sweepingRef.current = false;
      setPlaying(false);
      setDone(false);
      setStarted(false);
      setComparing(null);
      setSwapping(null);
      setSweepIndex(null);
      cancelAnimationFrame(frameRef.current);
      generatorRef.current = null;
      // Restore to initial array (unsorted state)
      setArray([...initialArray]);
    }
  }, [algorithmIndex, initialArray]);

  const arrayRef = useRef(array);
  arrayRef.current = array;

  const step = useCallback(() => {
    if (!generatorRef.current) return;
    const next = generatorRef.current.next();
    if (next.done) {
      setComparing(null);
      setSwapping(null);
      if (finalSweepRef.current) {
        doSweep(arrayRef.current);
      } else {
        setPlaying(false);
        setDone(true);
        playingRef.current = false;
      }
      return;
    }
    const val = next.value as SortStep;
    setArray(val.array);
    setComparing(val.comparing);
    setSwapping(val.swapping);

    if (soundRef.current) {
      const maxVal = Math.max(...val.array, 1);
      if (val.comparing) {
        playTone(val.array[val.comparing[0]], maxVal, freqMinRef.current, freqMaxRef.current);
      } else if (val.swapping) {
        playTone(val.array[val.swapping[0]], maxVal, freqMinRef.current, freqMaxRef.current);
      }
    }
  }, [doSweep]);

  const runLoop = useCallback(() => {
    let count = 0;
    const tick = () => {
      if (!playingRef.current || sweepingRef.current) return;
      count++;
      if (count >= speedRef.current) {
        count = 0;
        step();
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [step]);

  const play = useCallback(() => {
    if (!generatorRef.current) {
      generatorRef.current = algorithms[algorithmIndex].fn(array, ascending);
    }
    playingRef.current = true;
    setPlaying(true);
    setStarted(true);
    setDone(false);
    runLoop();
  }, [algorithmIndex, array, ascending, runLoop]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    cancelAnimationFrame(frameRef.current);
  }, []);

  const maxVal = Math.max(...array, 1);

  // Go-back is enabled when not currently playing AND the animation has been started (paused or done)
  const canGoBack = !playing && started;

  return (
    <div className="visualizer">
      <div className="bars-container">
        {array.map((val, i) => {
          let cls = "bar";
          if (comparing && (i === comparing[0] || i === comparing[1])) cls += " comparing";
          if (swapping && (i === swapping[0] || i === swapping[1])) cls += " swapping";
          if (sweepIndex !== null && i <= sweepIndex) cls += " swept";
          if (sweepIndex !== null && i === sweepIndex) cls += " sweep-active";
          return (
            <div
              key={i}
              className={cls}
              style={{
                height: `${(val / maxVal) * 100}%`,
                width: `${Math.max(100 / array.length - 0.5, 1)}%`,
              }}
            />
          );
        })}
      </div>
      <div className="controls">
        {/* Playback row */}
        <div className="playback-row">
          <button
            className="playback-btn"
            onClick={reset}
            disabled={playing}
            title="Reset"
          >
            {/* Reset icon (circular arrow) */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
          {!playing ? (
            <button
              className="playback-btn play-btn"
              onClick={done ? () => { reset(); } : play}
              title={done ? "Replay" : "Play"}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <polygon points="7,4 21,12 7,20" />
              </svg>
            </button>
          ) : (
            <button
              className="playback-btn play-btn"
              onClick={pause}
              title="Pause"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          )}
          <button
            className="playback-btn"
            onClick={goBack}
            disabled={!canGoBack}
            title="Go Back"
          >
            {/* Skip-back / go-back icon */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <rect x="4" y="5" width="3" height="14" rx="1" />
              <polygon points="20,5 10,12 20,19" />
            </svg>
          </button>
        </div>

        {/* Options section - two columns */}
        <div className="options-section">
          <div className="options-title">Options</div>
          <div className="options-columns">
            {/* Column 1: general options */}
            <div className="options-col">
              <div className="toggle-row">
                <span className="toggle-label-text">{ascending ? "Ascending" : "Descending"}</span>
                <button
                  className={`toggle-switch${ascending ? " on" : ""}`}
                  onClick={() => { if (!playing) setAscending((a) => !a); }}
                  disabled={playing}
                  role="switch"
                  aria-checked={ascending}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
              <label className="toggle-row">
                <span className="toggle-label-text">Even Gaps</span>
                <button
                  className={`toggle-switch${evenGaps ? " on" : ""}`}
                  onClick={() => { if (!playing) setEvenGaps((v) => !v); }}
                  disabled={playing}
                  role="switch"
                  aria-checked={evenGaps}
                >
                  <span className="toggle-knob" />
                </button>
              </label>
              <label className="toggle-row">
                <span className="toggle-label-text">Final Sweep</span>
                <button
                  className={`toggle-switch${finalSweep ? " on" : ""}`}
                  onClick={() => setFinalSweep((v) => !v)}
                  role="switch"
                  aria-checked={finalSweep}
                >
                  <span className="toggle-knob" />
                </button>
              </label>
              <div className="slider-row">
                <span className="slider-label-text">Elements</span>
                <input
                  type="range"
                  min={10}
                  max={150}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  disabled={playing}
                />
                <input
                  className="slider-num"
                  type="number"
                  min={10}
                  max={150}
                  value={size}
                  onChange={(e) => {
                    const v = Math.max(10, Math.min(150, Number(e.target.value) || 10));
                    setSize(v);
                  }}
                  disabled={playing}
                />
              </div>
              <div className="slider-row">
                <span className="slider-label-text">Speed</span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={51 - speed}
                  onChange={(e) => {
                    const v = 51 - Number(e.target.value);
                    setSpeed(v);
                    speedRef.current = v;
                  }}
                />
                <input
                  className="slider-num"
                  type="number"
                  min={1}
                  max={50}
                  value={51 - speed}
                  onChange={(e) => {
                    const raw = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                    const v = 51 - raw;
                    setSpeed(v);
                    speedRef.current = v;
                  }}
                />
              </div>
            </div>

            {/* Column 2: sound options */}
            <div className="options-col">
              <label className="toggle-row">
                <span className="toggle-label-text">Sound</span>
                <button
                  className={`toggle-switch${soundEnabled ? " on" : ""}`}
                  onClick={() => setSoundEnabled((v) => !v)}
                  role="switch"
                  aria-checked={soundEnabled}
                >
                  <span className="toggle-knob" />
                </button>
              </label>
              <div className={`sound-options${soundEnabled ? "" : " disabled"}`}>
                <div className="slider-row">
                  <span className="slider-label-text">Freq Min</span>
                  <input
                    type="range"
                    min={50}
                    max={800}
                    value={freqMin}
                    onChange={(e) => setFreqMin(Number(e.target.value))}
                    disabled={!soundEnabled}
                  />
                  <input
                    className="slider-num"
                    type="number"
                    min={50}
                    max={800}
                    value={freqMin}
                    onChange={(e) => setFreqMin(Math.max(50, Math.min(800, Number(e.target.value) || 50)))}
                    disabled={!soundEnabled}
                  />
                  <span className="slider-unit">Hz</span>
                </div>
                <div className="slider-row">
                  <span className="slider-label-text">Freq Max</span>
                  <input
                    type="range"
                    min={400}
                    max={4000}
                    value={freqMax}
                    onChange={(e) => setFreqMax(Number(e.target.value))}
                    disabled={!soundEnabled}
                  />
                  <input
                    className="slider-num"
                    type="number"
                    min={400}
                    max={4000}
                    value={freqMax}
                    onChange={(e) => setFreqMax(Math.max(400, Math.min(4000, Number(e.target.value) || 400)))}
                    disabled={!soundEnabled}
                  />
                  <span className="slider-unit">Hz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
