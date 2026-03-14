import { useCallback, useState } from "react";
import Sidebar from "./Sidebar";
import Visualizer from "./Visualizer";
import "./App.css";

const ALGO_KEY = "sortvis-algo";

function loadAlgo(): number {
  try {
    const v = Number(localStorage.getItem(ALGO_KEY));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch { return 0; }
}

function App() {
  const [selected, setSelected] = useState(loadAlgo);
  const [playing, setPlaying] = useState(false);

  const handleSelect = useCallback((i: number) => {
    setSelected(i);
    try { localStorage.setItem(ALGO_KEY, String(i)); } catch { /* ignore */ }
  }, []);

  return (
    <div className="app">
      <Sidebar
        selected={selected}
        onSelect={handleSelect}
        disabled={playing}
      />
      <Visualizer algorithmIndex={selected} onPlayingChange={setPlaying} />
    </div>
  );
}

export default App;
