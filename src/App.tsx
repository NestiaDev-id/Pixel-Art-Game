import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

type AppState = 'CHECKING_ASSETS' | 'UPDATING' | 'MAIN_MENU';
type SubMenu = 'main' | 'new_game' | 'load_game' | 'settings' | 'credits' | 'exit';
type ClassRank = 'A' | 'B' | 'C' | 'D';

interface StudentStats {
  academic: number;
  physical: number;
  adaptability: number;
  cooperativeness: number;
}

const CLASS_DETAILS: Record<ClassRank, { name: string; description: string; stats: StudentStats }> = {
  A: {
    name: "Class A // Intellectual Elite",
    description: "Highest start resources. Excellent akademis & support, but you are the primary target for all sabotage and manipulation.",
    stats: { academic: 95, physical: 80, adaptability: 75, cooperativeness: 85 }
  },
  B: {
    name: "Class B // Stable Coalition",
    description: "Highly cohesive environment with high trust. Moderate resources with high cooperation, enabling stable tactical progression.",
    stats: { academic: 80, physical: 78, adaptability: 85, cooperativeness: 95 }
  },
  C: {
    name: "Class C // Volatile Rebels",
    description: "Fierce competition and internal friction. Unpredictable tactics, high physical capacity, but low core cooperation.",
    stats: { academic: 65, physical: 90, adaptability: 70, cooperativeness: 40 }
  },
  D: {
    name: "Class D // Deficit Anomalies",
    description: "Severely penalized starting point. High individual potential but extreme social deficit. The ultimate uphill strategic battle.",
    stats: { academic: 45, physical: 55, adaptability: 95, cooperativeness: 30 }
  }
};

// Custom high-tech synthesized sound effects using Web Audio API
const playSound = (type: 'hover' | 'click' | 'power' | 'back' | 'success') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'power') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'back') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(780, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Silent catch if audio is blocked before user interaction
  }
};

function App() {
  const [appState, setAppState] = useState<AppState>('CHECKING_ASSETS');
  const [progress, setProgress] = useState(0);
  const [activeMenu, setActiveMenu] = useState<SubMenu>('main');
  const [selectedClass, setSelectedClass] = useState<ClassRank>('D');
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
      }, 1500);
      return () => clearTimeout(timer);
    } else if (appState === 'UPDATING') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setAppState('MAIN_MENU');
              playSound('power');
            }, 500); 
            return 100;
          }
          return Math.min(p + Math.floor(Math.random() * 18) + 6, 100);
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const launchProceduralWorld = async () => {
    playSound('success');
    // Invoke Godot simulation
    await invoke("send_to_godot", { msg: `GENERATE_CLASS:${selectedClass}` });
  };

  const updateConfig = async (key: string, value: number) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    // Send dynamic config update to Godot
    await invoke("send_to_godot", { msg: `SET_CONFIG:${key}:${value}` });
  };

  const handleMenuChange = (menu: SubMenu) => {
    playSound('click');
    setActiveMenu(menu);
  };

  const handleBack = () => {
    playSound('back');
    setActiveMenu('main');
  };

  // Rendering stats bars helper
  const renderStatBar = (label: string, value: number, colorClass: string) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] tracking-wider text-white/40 uppercase">
        <span>{label}</span>
        <span className="font-mono text-white/80">{value} / 100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-sm overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${colorClass} rounded-sm`}
        />
      </div>
    </div>
  );

  return (
    <main className="w-screen h-screen flex bg-[#060608] overflow-hidden relative font-sans text-white select-none">
      
      {/* Premium Widescreen Background Elements (Right area space) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-[#060608] to-[#040405] z-0"></div>
      
      {/* Dynamic light grids simulating the "Manipulator Chessboard" theme of Shadow Academy */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none opacity-40"></div>
      
      {/* Floating abstract rings and blur glow on the right */}
      <div className="absolute top-[20%] right-[15%] w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-[10%] right-[30%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-screen"></div>

      {/* Cyber overlay elements */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,6px_100%] opacity-30"></div>

      {/* Grid Coordinates (Chess style - right side decorative) */}
      <div className="absolute top-8 right-8 font-mono text-[9px] text-white/5 flex gap-12 select-none z-10">
        <div>SECTOR: 04 // STAGE: 01</div>
        <div>SYS_VAL: ACTIVE</div>
      </div>

      <div className="absolute bottom-8 right-8 font-mono text-[9px] text-white/5 flex gap-12 select-none z-10">
        <div>EVALUATION INDEX: {selectedClass ? `CLASS_${selectedClass}` : "PENDING"}</div>
        <div>AUTH_KEY_VERIFIED // SA-8802</div>
      </div>

      {/* ================= BOOT SCREEN SEQUENCE ================= */}
      <AnimatePresence mode="wait">
        {(appState === 'CHECKING_ASSETS' || appState === 'UPDATING') && (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#060608]/95"
          >
            <div className="flex flex-col items-center max-w-sm px-8 w-full">
              {/* Academy Crest Mockup */}
              <div className="w-16 h-16 mb-8 relative flex items-center justify-center">
                <div className="absolute inset-0 border border-amber-500/30 rotate-45 animate-spin duration-[10s]"></div>
                <div className="absolute inset-2 border border-cyan-500/30 -rotate-45 animate-reverse-spin"></div>
                <span className="text-amber-300 font-serif text-lg tracking-widest font-bold">S</span>
              </div>

              <h1 className="text-2xl font-light tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 font-serif mb-2 uppercase">
                Shadow Academy
              </h1>
              <p className="text-[9px] tracking-[0.4em] text-cyan-400/60 uppercase font-mono mb-12">INTRANET PROTOCOL</p>

              {/* Progress Bar Container */}
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-[9px] tracking-[0.2em] font-mono text-cyan-300/70 uppercase">
                  <span>{appState === 'CHECKING_ASSETS' ? 'Syncing Records...' : 'Configuring Sandbox...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-amber-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN APPLICATION LAYOUT ================= */}
      {appState === 'MAIN_MENU' && (
        <div className="relative z-10 w-full h-full flex">
          
          {/* LEFT SIDEBAR MAIN MENU (Width is perfectly calibrated, leaving the right side empty) */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[440px] h-screen bg-[#07070a]/70 backdrop-blur-3xl border-r border-white/5 flex flex-col justify-between p-10 md:p-12 relative shadow-[10px_0_40px_rgba(0,0,0,0.6)]"
          >
            {/* Ambient cyber border highlights */}
            <div className="absolute top-0 right-0 w-[1px] h-32 bg-gradient-to-b from-cyan-500/40 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-[1px] h-32 bg-gradient-to-t from-amber-500/40 to-transparent"></div>

            {/* Sidebar Header */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                {/* Micro Academy Emblem */}
                <div className="w-10 h-10 border border-amber-500/20 bg-amber-500/5 rounded-sm flex items-center justify-center relative rotate-45">
                  <span className="text-amber-200 font-serif text-sm -rotate-45 font-bold">SA</span>
                </div>
                <div>
                  <h1 className="text-lg font-light tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 font-serif leading-none uppercase">
                    Shadow Academy
                  </h1>
                  <span className="text-[8px] tracking-[0.3em] font-mono text-cyan-400/50 uppercase block mt-1">
                    Terminal System v2.0.1
                  </span>
                </div>
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent mb-8"></div>
            </div>

            {/* Dynamic Menu Area */}
            <div className="flex-1 flex flex-col justify-center my-6 min-h-[350px]">
              <AnimatePresence mode="wait">
                
                {/* 1. MAIN LIST VIEW */}
                {activeMenu === 'main' && (
                  <motion.div 
                    key="main-menu-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-6 font-mono">Select Session Operation</div>
                    
                    <button 
                      onClick={() => handleMenuChange('new_game')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full text-left group py-3 px-4 border border-white/5 hover:border-cyan-500/30 rounded-sm bg-white/[0.01] hover:bg-cyan-500/[0.03] transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-white/70 group-hover:text-cyan-200 tracking-[0.2em] text-xs uppercase transition-colors">
                        New Evaluation
                      </span>
                      <span className="text-[10px] font-mono text-white/20 group-hover:text-cyan-400 transition-colors">
                        [ NEW GAME ]
                      </span>
                    </button>

                    <button 
                      onClick={() => handleMenuChange('load_game')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full text-left group py-3 px-4 border border-white/5 hover:border-amber-500/30 rounded-sm bg-white/[0.01] hover:bg-amber-500/[0.03] transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-white/70 group-hover:text-amber-200 tracking-[0.2em] text-xs uppercase transition-colors">
                        Load Savefile
                      </span>
                      <span className="text-[10px] font-mono text-white/20 group-hover:text-amber-400 transition-colors">
                        [ LOAD ]
                      </span>
                    </button>

                    <button 
                      onClick={() => handleMenuChange('settings')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full text-left group py-3 px-4 border border-white/5 hover:border-cyan-500/30 rounded-sm bg-white/[0.01] hover:bg-cyan-500/[0.03] transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-white/70 group-hover:text-cyan-200 tracking-[0.2em] text-xs uppercase transition-colors">
                        Calibration
                      </span>
                      <span className="text-[10px] font-mono text-white/20 group-hover:text-cyan-400 transition-colors">
                        [ SETTINGS ]
                      </span>
                    </button>

                    <button 
                      onClick={() => handleMenuChange('credits')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full text-left group py-3 px-4 border border-white/5 hover:border-white/20 rounded-sm bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-white/70 group-hover:text-white tracking-[0.2em] text-xs uppercase transition-colors">
                        Intelligence Info
                      </span>
                      <span className="text-[10px] font-mono text-white/20 group-hover:text-white/80 transition-colors">
                        [ CREDITS ]
                      </span>
                    </button>

                    <button 
                      onClick={() => handleMenuChange('exit')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full text-left group py-3 px-4 border border-white/5 hover:border-rose-500/30 rounded-sm bg-white/[0.01] hover:bg-rose-500/[0.03] transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-white/50 group-hover:text-rose-400 tracking-[0.2em] text-xs uppercase transition-colors font-light">
                        Lock Terminal
                      </span>
                      <span className="text-[10px] font-mono text-white/10 group-hover:text-rose-500 transition-colors">
                        [ EXIT ]
                      </span>
                    </button>
                  </motion.div>
                )}

                {/* 2. NEW GAME / CLASS PLACEMENT SCREEN */}
                {activeMenu === 'new_game' && (
                  <motion.div 
                    key="new-game-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] tracking-[0.25em] text-cyan-400/80 uppercase font-mono">Class Placement Selection</span>
                        <button 
                          onClick={handleBack}
                          className="text-[9px] tracking-widest text-white/40 hover:text-white uppercase transition-colors border border-white/10 px-2 py-0.5 rounded-sm hover:bg-white/5"
                        >
                          &lt; Back
                        </button>
                      </div>

                      {/* Class Buttons Grid */}
                      <div className="grid grid-cols-4 gap-2 mb-5">
                        {(['A', 'B', 'C', 'D'] as ClassRank[]).map((rank) => (
                          <button
                            key={rank}
                            onClick={() => { playSound('click'); setSelectedClass(rank); }}
                            className={`py-2 text-center rounded-sm font-serif text-sm tracking-wider font-bold transition-all duration-300 ${
                              selectedClass === rank 
                                ? 'bg-amber-500/20 border border-amber-400/80 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                                : 'bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/[0.05] hover:text-white/90'
                            }`}
                          >
                            Class {rank}
                          </button>
                        ))}
                      </div>

                      {/* Class Details display */}
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm mb-5 space-y-2">
                        <h4 className="text-[11px] font-bold tracking-wider text-amber-300 uppercase font-serif">
                          {CLASS_DETAILS[selectedClass].name}
                        </h4>
                        <p className="text-[10px] leading-relaxed text-white/60">
                          {CLASS_DETAILS[selectedClass].description}
                        </p>
                      </div>

                      {/* Stat Radar Mockup */}
                      <div className="space-y-3 p-4 border border-white/5 bg-white/[0.01] rounded-sm">
                        <div className="text-[9px] tracking-[0.2em] font-mono text-cyan-300/60 uppercase mb-2">Student Evaluation Parameters</div>
                        {renderStatBar("Academic Aptitude", CLASS_DETAILS[selectedClass].stats.academic, "bg-cyan-500")}
                        {renderStatBar("Physical Capacity", CLASS_DETAILS[selectedClass].stats.physical, "bg-amber-500")}
                        {renderStatBar("Adaptability Matrix", CLASS_DETAILS[selectedClass].stats.adaptability, "bg-emerald-500")}
                        {renderStatBar("Social Cooperation", CLASS_DETAILS[selectedClass].stats.cooperativeness, "bg-indigo-500")}
                      </div>
                    </div>

                    <button 
                      onClick={launchProceduralWorld}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-cyan-500 hover:to-cyan-600 border border-amber-400/20 rounded-sm text-black hover:text-white text-[11px] tracking-[0.3em] font-bold uppercase transition-all duration-500 shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                    >
                      Begin Evaluation
                    </button>
                  </motion.div>
                )}

                {/* 3. LOAD SAVEFILE SCREEN */}
                {activeMenu === 'load_game' && (
                  <motion.div 
                    key="load-game-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] tracking-[0.25em] text-amber-400/80 uppercase font-mono">Classified Archives</span>
                      <button onClick={handleBack} className="text-[9px] tracking-widest text-white/40 hover:text-white uppercase transition-colors border border-white/10 px-2 py-0.5 rounded-sm hover:bg-white/5">
                        &lt; Back
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Save Slot 1 */}
                      <button 
                        onClick={launchProceduralWorld}
                        onMouseEnter={() => playSound('hover')}
                        className="w-full p-4 border border-white/5 bg-white/[0.01] hover:bg-cyan-500/[0.02] hover:border-cyan-500/30 rounded-sm text-left transition-all duration-300 block group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-serif text-white/80 group-hover:text-cyan-200 font-bold uppercase tracking-wider">Record File #0812</span>
                          <span className="text-[9px] font-mono text-cyan-400/60 uppercase">Class D // Active</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-white/40">
                          <span>Progress: 14%</span>
                          <span>Points: 24,500 Pt</span>
                        </div>
                      </button>

                      {/* Save Slot 2 */}
                      <button 
                        onClick={launchProceduralWorld}
                        onMouseEnter={() => playSound('hover')}
                        className="w-full p-4 border border-white/5 bg-white/[0.01] hover:bg-amber-500/[0.02] hover:border-amber-500/30 rounded-sm text-left transition-all duration-300 block group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-serif text-white/80 group-hover:text-amber-200 font-bold uppercase tracking-wider">Record File #9201</span>
                          <span className="text-[9px] font-mono text-amber-400/60 uppercase">Class B // Standby</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-white/40">
                          <span>Progress: 68%</span>
                          <span>Points: 120,400 Pt</span>
                        </div>
                      </button>

                      {/* Empty Save Slot */}
                      <div className="w-full p-5 border border-dashed border-white/10 bg-transparent rounded-sm text-center">
                        <span className="text-[10px] tracking-[0.2em] font-mono text-white/20 uppercase">
                          [ Empty Terminal Core Slot ]
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. SETTINGS / CALIBRATION SCREEN */}
                {activeMenu === 'settings' && (
                  <motion.div 
                    key="settings-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] tracking-[0.25em] text-cyan-400/80 uppercase font-mono">Parameters Calibration</span>
                      <button onClick={handleBack} className="text-[9px] tracking-widest text-white/40 hover:text-white uppercase transition-colors border border-white/10 px-2 py-0.5 rounded-sm hover:bg-white/5">
                        &lt; Back
                      </button>
                    </div>

                    <div className="space-y-6 p-4 border border-white/5 bg-white/[0.01] rounded-sm">
                      {/* Speed Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] tracking-[0.15em] text-cyan-300/70 uppercase font-mono">
                          <span>Tactical Velocity</span>
                          <span className="text-amber-300 font-bold font-mono">{config.speed.toFixed(1)} m/s</span>
                        </div>
                        <input 
                          type="range" min="1" max="15" step="0.5" 
                          value={config.speed}
                          onChange={(e) => updateConfig('speed', parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
                        />
                        <p className="text-[8px] text-white/30 tracking-wider">Modulates character reaction times during dialog decisions.</p>
                      </div>

                      {/* Amplitude Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] tracking-[0.15em] text-cyan-300/70 uppercase font-mono">
                          <span>VFX Amplitude</span>
                          <span className="text-amber-300 font-bold font-mono">{config.amplitude.toFixed(2)} Hz</span>
                        </div>
                        <input 
                          type="range" min="0.1" max="1.5" step="0.05" 
                          value={config.amplitude}
                          onChange={(e) => updateConfig('amplitude', parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
                        />
                        <p className="text-[8px] text-white/30 tracking-wider">Defines terminal ambient grid distortion and scanline ripple levels.</p>
                      </div>

                      {/* Cycle Frequency Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] tracking-[0.15em] text-cyan-300/70 uppercase font-mono">
                          <span>VFX Cycle Pulse</span>
                          <span className="text-amber-300 font-bold font-mono">{config.breathSpeed.toFixed(1)}s</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="5" step="0.1" 
                          value={config.breathSpeed}
                          onChange={(e) => updateConfig('breathSpeed', parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
                        />
                        <p className="text-[8px] text-white/30 tracking-wider">Frequency calibration for the main menu glowing pulse rhythm.</p>
                      </div>
                    </div>

                    <button 
                      onClick={handleBack}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full py-2.5 border border-cyan-500/30 text-cyan-200/80 hover:bg-cyan-500/10 hover:text-cyan-200 rounded-sm text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                    >
                      Save Parameters
                    </button>
                  </motion.div>
                )}

                {/* 5. CREDITS / SECRET INTELLIGENCE */}
                {activeMenu === 'credits' && (
                  <motion.div 
                    key="credits-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase font-mono">Developer Intel Report</span>
                      <button onClick={handleBack} className="text-[9px] tracking-widest text-white/40 hover:text-white uppercase transition-colors border border-white/10 px-2 py-0.5 rounded-sm hover:bg-white/5">
                        &lt; Back
                      </button>
                    </div>

                    <div className="space-y-4 p-5 bg-white/[0.01] border border-white/5 rounded-sm font-mono text-[10px] text-white/60 leading-relaxed">
                      <div>
                        <span className="text-amber-300 block mb-1 uppercase font-bold tracking-wider">[ LEAD DESIGN & CODE ]</span>
                        <span>NESTIA_DEV</span>
                      </div>
                      <div className="h-[1px] bg-white/5"></div>
                      <div>
                        <span className="text-cyan-300 block mb-1 uppercase font-bold tracking-wider">[ BACKEND SYSTEM CORES ]</span>
                        <span>RUST ENGINE // TAURI // GODOT</span>
                      </div>
                      <div className="h-[1px] bg-white/5"></div>
                      <div>
                        <span className="text-white block mb-1 uppercase font-bold tracking-wider">[ INTELLECTUAL BASIS ]</span>
                        <span>CLASSROOM OF ELITE (COTE) STYLE DEEP-STRATEGY CHESSBOARD ENGINE</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 6. EXIT / LOCK TERMINAL */}
                {activeMenu === 'exit' && (
                  <motion.div 
                    key="exit-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-center py-6"
                  >
                    <div className="w-12 h-12 rounded-full border border-rose-500/20 bg-rose-500/5 mx-auto flex items-center justify-center text-rose-400 text-lg mb-4 shadow-[0_0_12px_rgba(244,63,94,0.2)] animate-pulse">
                      ✕
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-rose-300">Terminate Intranet Session?</h3>
                      <p className="text-[10px] text-white/40 max-w-[250px] mx-auto leading-relaxed">
                        Unsaved evaluation metrics, student class standings, and calibration protocols will remain locked in standard cache.
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => handleMenuChange('main')}
                        className="flex-1 py-2 border border-white/10 hover:bg-white/5 text-[9px] uppercase tracking-widest rounded-sm transition-all"
                      >
                        Keep Session
                      </button>
                      <button 
                        onClick={() => window.close()} 
                        className="flex-1 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/40 hover:text-white text-[9px] uppercase tracking-widest rounded-sm transition-all"
                      >
                        Confirm Lock
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Footer */}
            <div>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>
              <div className="flex justify-between items-center text-[8px] font-mono text-white/30 tracking-widest">
                <span>INTEL_RATING: 98.6</span>
                <span className="animate-pulse text-cyan-400">● SECURITY ACTIVE</span>
              </div>
            </div>

          </motion.div>

          {/* ================= RIGHT EMPTY SIDEBAR AREA ================= */}
          {/* We keep this area clean, but styled beautifully to give it depth and high visual wow-factor! */}
          <div className="flex-1 h-screen pointer-events-none relative flex flex-col justify-between p-12">
            
            {/* Elegant corner borders simulating the tactical visor monitor overlay */}
            <div className="absolute top-12 left-12 w-6 h-6 border-t border-l border-white/10"></div>
            <div className="absolute top-12 right-12 w-6 h-6 border-t border-r border-white/10"></div>
            <div className="absolute bottom-12 left-12 w-6 h-6 border-b border-l border-white/10"></div>
            <div className="absolute bottom-12 right-12 w-6 h-6 border-b border-r border-white/10"></div>
            
            {/* A gorgeous HUD element positioned subtly at the bottom right */}
            <div className="self-end mt-auto opacity-10 flex flex-col items-end">
              <div className="font-serif text-lg tracking-widest font-bold text-white uppercase mb-1">
                TACTICAL SANDBOX
              </div>
              <div className="font-mono text-[9px] tracking-[0.25em] text-white uppercase">
                GRID MATRIX // READY FOR INITIALIZATION
              </div>
            </div>

          </div>

        </div>
      )}
    </main>
  );
}

export default App;
