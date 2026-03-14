import { useState } from "react";
import Sidebar from "./Sidebar";
import Visualizer from "./Visualizer";
import "./App.css";

function App() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="app">
      <Sidebar
        selected={selected}
        onSelect={setSelected}
        disabled={playing}
      />
      <Visualizer algorithmIndex={selected} onPlayingChange={setPlaying} />
    </div>
  );
}

export default App;
