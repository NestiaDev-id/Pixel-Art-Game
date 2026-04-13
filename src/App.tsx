import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [count, setCount] = useState(50);

  const spawnCubes = async () => {
    await invoke("send_to_godot", { msg: `SPAWN:${count}` });
  };

  const clearCubes = async () => {
    await invoke("send_to_godot", { msg: "CLEAR" });
  };

  return (
    <main className="container">
      <div className="glass-card">
        <h1 className="title">Godot <span className="accent">Control Center</span></h1>
        <p className="subtitle">Procedural Generation Controller</p>

        <div className="control-group">
          <label>Cube Density: <span className="count-value">{count}</span></label>
          <input 
            type="range" 
            min="1" 
            max="500" 
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <div className="button-group">
          <button className="btn-primary" onClick={spawnCubes}>
            Spawn Objects
          </button>
          <button className="btn-secondary" onClick={clearCubes}>
            Clear World
          </button>
        </div>
      </div>
      
      <div className="status-footer">
        <div className="status-item">
          <span className="status-dot online"></span> Bridge Active (UDP:9001)
        </div>
      </div>
    </main>
  );
}

export default App;
