import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type AppState = 'CHECKING_ASSETS' | 'UPDATING' | 'MAIN_MENU';

function App() {
  const [appState, setAppState] = useState<AppState>('CHECKING_ASSETS');
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    speed: 5.0,
    amplitude: 0.35,
    breathSpeed: 1.5
  });

  // Mock Startup Sequence
  useEffect(() => {
    if (appState === 'CHECKING_ASSETS') {
      const timer = setTimeout(() => {
        setAppState('UPDATING');
      }, 2000);
      return () => clearTimeout(timer);
    } else if (appState === 'UPDATING') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setAppState('MAIN_MENU'), 500); 
            return 100;
          }
          return Math.min(p + Math.floor(Math.random() * 15) + 5, 100);
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const launchProceduralWorld = async () => {
    await invoke("send_to_godot", { msg: "GENERATE" });
  };

  const updateConfig = async (key: string, value: number) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    // Send to Godot
    await invoke("send_to_godot", { msg: `SET_CONFIG:${key}:${value}` });
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-[#0a0a0c] overflow-hidden relative font-sans text-white select-none">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-[#0a0a0c] to-[#050505] z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-screen"></div>

      {/* Settings Panel Overlay */}
      <div className={`absolute inset-0 z-50 transition-all duration-700 ease-in-out flex items-center justify-center ${showSettings ? 'backdrop-blur-xl bg-black/40 opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`w-full max-w-sm p-10 bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl transition-all duration-500 transform ${showSettings ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-light tracking-[0.2em] text-amber-200/80 uppercase">Settings</h2>
            <button 
              onClick={() => setShowSettings(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-8">
            {/* Speed Setting */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] tracking-[0.2em] text-cyan-500/60 uppercase">
                <span>Movement Speed</span>
                <span className="text-amber-200">{config.speed.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="1" max="15" step="0.5" 
                value={config.speed}
                onChange={(e) => updateConfig('speed', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Amplitude Setting */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] tracking-[0.2em] text-cyan-500/60 uppercase">
                <span>VFX Amplitude</span>
                <span className="text-amber-200">{config.amplitude.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.1" max="1.5" step="0.05" 
                value={config.amplitude}
                onChange={(e) => updateConfig('amplitude', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Breath Setting */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] tracking-[0.2em] text-cyan-500/60 uppercase">
                <span>Cycle Frequency</span>
                <span className="text-amber-200">{config.breathSpeed.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.5" max="5" step="0.1" 
                value={config.breathSpeed}
                onChange={(e) => updateConfig('breathSpeed', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          <button 
            onClick={() => setShowSettings(false)}
            className="w-full mt-12 py-3 border border-cyan-500/30 text-cyan-200/60 text-[10px] tracking-[0.3em] uppercase hover:bg-cyan-500/10 hover:text-cyan-200 transition-all duration-300"
          >
            Apply Changes
          </button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
        {/* Title Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)] font-serif mb-3">
            SHADOW ACADEMY
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <p className="text-[0.65rem] tracking-[0.4em] font-light text-cyan-200/60 uppercase">Terminal Interface</p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>

        {/* Dynamic State Content */}
        <div className="w-full flex flex-col items-center min-h-[150px] justify-center transition-all duration-700 ease-in-out">
          {(appState === 'CHECKING_ASSETS' || appState === 'UPDATING') && (
            <div className="w-full max-w-xs animate-pulse opacity-90 flex flex-col items-center transition-opacity duration-500">
               <div className="text-[10px] text-cyan-300/80 mb-4 tracking-[0.2em] uppercase flex items-center gap-3">
                 <div className="relative flex items-center justify-center w-2 h-2">
                    <div className="absolute w-full h-full bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
                 </div>
                 {appState === 'CHECKING_ASSETS' ? 'Synchronizing Records...' : 'Decrypting Assets...'}
               </div>
               <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 relative">
                 <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-amber-200 shadow-[0_0_10px_#06b6d4] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                 ></div>
               </div>
               {appState === 'UPDATING' && (
                 <div className="text-[9px] text-cyan-200/40 mt-3 font-mono tracking-widest">{progress}%</div>
               )}
            </div>
          )}

          {appState === 'MAIN_MENU' && (
            <div className="flex flex-col gap-5 w-64 animate-fade-in-up">
              <button 
                onClick={launchProceduralWorld}
                className="group relative px-6 py-3 bg-transparent border border-white/10 hover:border-cyan-500/50 rounded-sm overflow-hidden transition-all duration-500 backdrop-blur-md"
              >
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-900/40 to-transparent transition-all duration-500 ease-out group-hover:w-full"></div>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-amber-300 to-cyan-400 transition-all duration-500 ease-out group-hover:w-full"></div>
                <span className="relative text-cyan-100/90 group-hover:text-amber-100 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] tracking-[0.25em] uppercase text-xs font-light transition-colors duration-300">
                  Initialize
                </span>
              </button>
              
              <button className="px-6 py-2 bg-transparent border border-transparent hover:border-white/5 rounded-sm transition-all duration-300 text-white/30 hover:text-white/70 tracking-[0.2em] uppercase text-[10px] font-light">
                Archives
              </button>
              
              <button 
                onClick={() => setShowSettings(true)}
                className="px-6 py-2 bg-transparent border border-transparent hover:border-white/5 rounded-sm transition-all duration-300 text-white/40 hover:text-white tracking-[0.2em] uppercase text-[10px] font-light"
              >
                Settings
              </button>
              <button className="px-6 py-2 bg-transparent border border-transparent hover:border-white/5 rounded-sm transition-all duration-300 text-white/20 hover:text-white/60 tracking-[0.2em] uppercase text-[10px] font-light">
                Exit
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute top-6 left-6 w-6 h-6 border-t border-l border-cyan-500/20"></div>
      <div className="absolute top-6 right-6 w-6 h-6 border-t border-r border-cyan-500/20"></div>
      <div className="absolute bottom-6 left-6 w-6 h-6 border-b border-l border-cyan-500/20"></div>
      <div className="absolute bottom-6 right-6 w-6 h-6 border-b border-r border-cyan-500/20"></div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-white/10 font-mono tracking-widest uppercase">
        System Ver 0.1.0 // Auth Level: Null
      </div>
    </main>
  );
}
export default App;
