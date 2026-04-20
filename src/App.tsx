import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type AppState = 'CHECKING_ASSETS' | 'UPDATING' | 'MAIN_MENU';

function App() {
  const [appState, setAppState] = useState<AppState>('CHECKING_ASSETS');
  const [progress, setProgress] = useState(0);

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
            setTimeout(() => setAppState('MAIN_MENU'), 500); // Small delay before transition
            return 100;
          }
          return Math.min(p + Math.floor(Math.random() * 15) + 5, 100);
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const launchProceduralWorld = async () => {
    // We keep the old Godot signal just for testing purposes for now
    await invoke("send_to_godot", { msg: "GENERATE" });
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-[#0a0a0c] overflow-hidden relative font-sans text-white select-none">
      {/* Mystical / Tech Hybrid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-[#0a0a0c] to-[#050505] z-0"></div>
      
      {/* Central Portal Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
        
        {/* Title Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)] font-serif mb-3">
            SHADOW ACADEMY
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <p className="text-[0.65rem] tracking-[0.4em] font-light text-cyan-200/60 uppercase">
              Terminal Interface
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>

       

        {/* Dynamic State Content */}
        <div className="w-full flex flex-col items-center min-h-[150px] justify-center transition-all duration-700 ease-in-out">
          
          {/* Phase 1: Splash Screen / Loading */}
          {(appState === 'CHECKING_ASSETS' || appState === 'UPDATING') && (
            <div className="w-full max-w-xs animate-pulse opacity-90 flex flex-col items-center transition-opacity duration-500">
               <div className="text-[10px] text-cyan-300/80 mb-4 tracking-[0.2em] uppercase flex items-center gap-3">
                 <div className="relative flex items-center justify-center w-2 h-2">
                   <div className="absolute w-full h-full bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                   <div className="relative w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
                 </div>
                 {appState === 'CHECKING_ASSETS' ? 'Synchronizing Records...' : 'Decrypting Assets...'}
               </div>
               
               {/* Progress Bar Body */}
               <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 relative">
                 <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-amber-200 shadow-[0_0_10px_#06b6d4] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                 ></div>
               </div>
               
               {/* Percentage */}
               {appState === 'UPDATING' && (
                 <div className="text-[9px] text-cyan-200/40 mt-3 font-mono tracking-widest">
                   {progress}%
                 </div>
               )}
            </div>
          )}

          {/* Phase 2: Main Menu */}
          {appState === 'MAIN_MENU' && (
            <div className="flex flex-col gap-5 w-64 animate-fade-in-up">
              
              <button 
                onClick={launchProceduralWorld}
                className="group relative px-6 py-3 bg-transparent border border-white/10 hover:border-cyan-500/50 rounded-sm overflow-hidden transition-all duration-500 backdrop-blur-md"
              >
                {/* Hover Fill Effect */}
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-900/40 to-transparent transition-all duration-500 ease-out group-hover:w-full"></div>
                {/* Glow Line */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-amber-300 to-cyan-400 transition-all duration-500 ease-out group-hover:w-full"></div>
                
                <span className="relative text-cyan-100/90 group-hover:text-amber-100 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] tracking-[0.25em] uppercase text-xs font-light transition-colors duration-300">
                  Initialize
                </span>
              </button>
              
              <button className="px-6 py-2 bg-transparent border border-transparent hover:border-white/5 rounded-sm transition-all duration-300 text-white/30 hover:text-white/70 tracking-[0.2em] uppercase text-[10px] font-light">
                Archives
              </button>
              
              <button className="px-6 py-2 bg-transparent border border-transparent hover:border-white/5 rounded-sm transition-all duration-300 text-white/20 hover:text-white/60 tracking-[0.2em] uppercase text-[10px] font-light">
                Settings
              </button>
              <button className="px-6 py-2 bg-transparent border border-transparent hover:border-white/5 rounded-sm transition-all duration-300 text-white/20 hover:text-white/60 tracking-[0.2em] uppercase text-[10px] font-light">
                Exit
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Technical UI Corners */}
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
