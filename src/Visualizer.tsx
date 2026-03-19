import { useCallback, useEffect, useRef, useState } from "react";
import { algorithms, type SortGenerator, type SortStep } from "./algorithms";
import { initAudio, playTone, playClick, playToggle, playSliderTick } from "./audio";

const STORAGE_KEY = "sortvis-options";
const ELEMENT_MIN = 10;
const ELEMENT_MAX = 150;

type SavedOptions = {
  size: number;
  ascending: boolean;
  evenGaps: boolean;
  finalSweep: boolean;
  soundEnabled: boolean;
  freqMin: number;
  freqMax: number;
  speed: number;
};

function loadOptions(): Partial<SavedOptions> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveOptions(opts: SavedOptions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
  } catch { /* ignore */ }
}

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

export default function Visualizer({ algorithmIndex, onPlayingChange }: Props) {
  const saved = useRef(loadOptions()).current;
  const [size, setSize] = useState(saved.size ?? 30);
  const [ascending, setAscending] = useState(saved.ascending ?? true);
  const [evenGaps, setEvenGaps] = useState(saved.evenGaps ?? false);
  const [finalSweep, setFinalSweep] = useState(saved.finalSweep ?? false);
  const [soundEnabled, setSoundEnabled] = useState(saved.soundEnabled ?? false);
  const [freqMin, setFreqMin] = useState(saved.freqMin ?? 200);
  const [freqMax, setFreqMax] = useState(saved.freqMax ?? 1200);
  const [speed, setSpeed] = useState(saved.speed ?? 20);
  const [array, setArray] = useState(() => generateArray(saved.size ?? 30, saved.evenGaps ?? false));
  const [initialArray, setInitialArray] = useState<number[]>(() => [...array]);
  const [comparing, setComparing] = useState<[number, number] | null>(null);
  const [swapping, setSwapping] = useState<[number, number] | null>(null);
  const [sweepIndex, setSweepIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [arrayFromUserInput, setArrayFromUserInput] = useState(false);
  const [initialArrayFromUserInput, setInitialArrayFromUserInput] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [userInputText, setUserInputText] = useState("");
  const [userInputError, setUserInputError] = useState("");

  const generatorRef = useRef<SortGenerator | null>(null);
  const frameRef = useRef<number>(0);
  const speedRef = useRef(saved.speed ?? 20);
  const playingRef = useRef(false);
  const sweepingRef = useRef(false);
  const soundRef = useRef(saved.soundEnabled ?? false);
  const freqMinRef = useRef(saved.freqMin ?? 200);
  const freqMaxRef = useRef(saved.freqMax ?? 1200);
  const finalSweepRef = useRef(saved.finalSweep ?? false);
  const suppressAutoResetRef = useRef(false);

  soundRef.current = soundEnabled;
  freqMinRef.current = freqMin;
  freqMaxRef.current = freqMax;
  finalSweepRef.current = finalSweep;

  // Persist options to localStorage
  useEffect(() => {
    saveOptions({ size, ascending, evenGaps, finalSweep, soundEnabled, freqMin, freqMax, speed });
  }, [size, ascending, evenGaps, finalSweep, soundEnabled, freqMin, freqMax, speed]);

  // Draft states for number inputs (validate on blur, not on every keystroke)
  const [sizeDraft, setSizeDraft] = useState<string | null>(null);
  const [speedDraft, setSpeedDraft] = useState<string | null>(null);
  const [freqMinDraft, setFreqMinDraft] = useState<string | null>(null);
  const [freqMaxDraft, setFreqMaxDraft] = useState<string | null>(null);

  // Pre-warm audio context
  useEffect(() => {
    initAudio().catch(() => {});
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
        playTone(arr[idx], maxVal, freqMinRef.current, freqMaxRef.current).catch(() => {}); // Fire and forget
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
    setArrayFromUserInput(false);
    setInitialArrayFromUserInput(false);
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
    setArrayFromUserInput(initialArrayFromUserInput);
  }, [initialArray, initialArrayFromUserInput]);

  // Re-randomize when size or evenGaps change
  useEffect(() => {
    if (suppressAutoResetRef.current) {
      suppressAutoResetRef.current = false;
      return;
    }
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
      setArrayFromUserInput(initialArrayFromUserInput);
    }
  }, [algorithmIndex, initialArray, initialArrayFromUserInput]);

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
        playTone(val.array[val.comparing[0]], maxVal, freqMinRef.current, freqMaxRef.current).catch(() => {}); // Fire and forget
      } else if (val.swapping) {
        playTone(val.array[val.swapping[0]], maxVal, freqMinRef.current, freqMaxRef.current).catch(() => {}); // Fire and forget
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

  const applyUserInput = useCallback(() => {
    const tokens = userInputText
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);

    if (tokens.length === 0) {
      setUserInputError("Enter at least one number.");
      return;
    }

    if (tokens.length < ELEMENT_MIN || tokens.length > ELEMENT_MAX) {
      setUserInputError(`Element count must be between ${ELEMENT_MIN} and ${ELEMENT_MAX} to match the slider limits.`);
      return;
    }

    const parsed = tokens.map((token) => Number(token));
    if (parsed.some((value) => !Number.isFinite(value))) {
      setUserInputError("Use only valid numbers separated by commas or spaces.");
      return;
    }

    if (parsed.some((value) => value < 0)) {
      setUserInputError("Only non-negative numbers are supported in the visualizer.");
      return;
    }

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

    suppressAutoResetRef.current = true;
    setSize(parsed.length);
    setSizeDraft(null);
    setArray(parsed);
    setInitialArray([...parsed]);
    setArrayFromUserInput(true);
    setInitialArrayFromUserInput(true);

    setUserInputError("");
    setShowInputModal(false);
  }, [userInputText]);

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
            className={`playback-btn input-btn${arrayFromUserInput ? " active" : ""}`}
            onClick={() => {
              playClick();
              setUserInputError("");
              setUserInputText(initialArray.join(", "));
              setShowInputModal(true);
            }}
            disabled={playing}
            title="Custom Input"
            aria-label="Open custom input"
          >
            <span className="brace-icon">{"{"}</span>
            <span className="brace-icon">{"}"}</span>
          </button>
          <button
            className="playback-btn"
            onClick={() => { playClick(); reset(); }}
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
              onClick={done ? () => { playClick(); reset(); } : () => { playClick(); play(); }}
              title={done ? "Replay" : "Play"}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <polygon points="7,4 21,12 7,20" />
              </svg>
            </button>
          ) : (
            <button
              className="playback-btn play-btn"
              onClick={() => { playClick(); pause(); }}
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
            onClick={() => { playClick(); goBack(); }}
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
                  onClick={() => { if (!playing) { setAscending((a) => { playToggle(!a); return !a; }); } }}
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
                  onClick={() => { if (!playing) { setEvenGaps((v) => { playToggle(!v); return !v; }); } }}
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
                  onClick={() => setFinalSweep((v) => { playToggle(!v); return !v; })}
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
                  min={ELEMENT_MIN}
                  max={ELEMENT_MAX}
                  value={size}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setSize(v);
                    playSliderTick((v - ELEMENT_MIN) / (ELEMENT_MAX - ELEMENT_MIN));
                  }}
                  disabled={playing}
                />
                <input
                  className="slider-num"
                  type="number"
                  min={ELEMENT_MIN}
                  max={ELEMENT_MAX}
                  value={sizeDraft ?? size}
                  onFocus={() => setSizeDraft(String(size))}
                  onChange={(e) => setSizeDraft(e.target.value)}
                  onBlur={() => {
                    const v = Math.max(ELEMENT_MIN, Math.min(ELEMENT_MAX, Number(sizeDraft) || ELEMENT_MIN));
                    setSize(v);
                    setSizeDraft(null);
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
                    playSliderTick(Number(e.target.value) / 50);
                  }}
                />
                <input
                  className="slider-num"
                  type="number"
                  min={1}
                  max={50}
                  value={speedDraft ?? (51 - speed)}
                  onFocus={() => setSpeedDraft(String(51 - speed))}
                  onChange={(e) => setSpeedDraft(e.target.value)}
                  onBlur={() => {
                    const raw = Math.max(1, Math.min(50, Number(speedDraft) || 1));
                    const v = 51 - raw;
                    setSpeed(v);
                    speedRef.current = v;
                    setSpeedDraft(null);
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
                  onClick={() => setSoundEnabled((v) => { playToggle(!v); return !v; })}
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
                    onChange={(e) => { const v = Number(e.target.value); setFreqMin(v); playSliderTick((v - 50) / 750); }}
                    disabled={!soundEnabled}
                  />
                  <input
                    className="slider-num"
                    type="number"
                    min={50}
                    max={800}
                    value={freqMinDraft ?? freqMin}
                    onFocus={() => setFreqMinDraft(String(freqMin))}
                    onChange={(e) => setFreqMinDraft(e.target.value)}
                    onBlur={() => {
                      setFreqMin(Math.max(50, Math.min(800, Number(freqMinDraft) || 50)));
                      setFreqMinDraft(null);
                    }}
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
                    onChange={(e) => { const v = Number(e.target.value); setFreqMax(v); playSliderTick((v - 400) / 3600); }}
                    disabled={!soundEnabled}
                  />
                  <input
                    className="slider-num"
                    type="number"
                    min={400}
                    max={4000}
                    value={freqMaxDraft ?? freqMax}
                    onFocus={() => setFreqMaxDraft(String(freqMax))}
                    onChange={(e) => setFreqMaxDraft(e.target.value)}
                    onBlur={() => {
                      setFreqMax(Math.max(400, Math.min(4000, Number(freqMaxDraft) || 400)));
                      setFreqMaxDraft(null);
                    }}
                    disabled={!soundEnabled}
                  />
                  <span className="slider-unit">Hz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInputModal && (
        <div className="input-modal-overlay" onClick={() => setShowInputModal(false)}>
          <div className="input-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="input-modal-title">Custom Array Input</h3>
            <p className="input-modal-hint">
              Enter numbers separated by commas or spaces. Element count must stay between {ELEMENT_MIN} and {ELEMENT_MAX}.
            </p>
            <textarea
              className="input-modal-textarea"
              value={userInputText}
              onChange={(e) => {
                setUserInputText(e.target.value);
                if (userInputError) setUserInputError("");
              }}
              rows={5}
              placeholder="Example: 42, 7, 19 3 88"
              autoFocus
            />
            {userInputError && <div className="input-modal-error">{userInputError}</div>}
            <div className="input-modal-actions">
              <button
                className="input-modal-btn"
                onClick={() => setShowInputModal(false)}
              >
                Cancel
              </button>
              <button
                className="input-modal-btn primary"
                onClick={applyUserInput}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
