import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Monitor, MonitorOff, Keyboard, Zap, Play, Square,
  ChevronUp, ChevronDown, Settings, Wifi, RotateCcw,
  Crosshair, Shield, Wind, Skull, AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import api, { scrcpy, hotkeys } from '../lib/api';
import { HotkeyMacro, MacroStep } from '../types';

interface CompanionOverlayProps {
  activeSerial?: string;
  isConnected: boolean;
}

// ─── Default macro bindings (coords tuned for 1080p device) ──────────────────
const DEFAULT_MACROS: HotkeyMacro[] = [
  {
    id: 'fire-burst',
    key: 'F1',
    label: 'Fire Burst',
    color: 'red',
    description: 'Triple tap fire button',
    steps: [
      { type: 'tap', x: 1632, y: 810, delay: 0 },
      { type: 'tap', x: 1632, y: 810, delay: 60 },
      { type: 'tap', x: 1632, y: 810, delay: 60 },
    ],
  },
  {
    id: 'missile-lock',
    key: 'F2',
    label: 'Missile Lock',
    color: 'amber',
    description: 'Tap lock-on + fire sequence',
    steps: [
      { type: 'tap', x: 1750, y: 620, delay: 0 },
      { type: 'tap', x: 1632, y: 810, delay: 300 },
    ],
  },
  {
    id: 'barrel-roll',
    key: 'F3',
    label: 'Barrel Roll',
    color: 'blue',
    description: 'Evasive spiral swipe pattern',
    steps: [
      { type: 'swipe', x: 288, y: 756, x2: 288, y2: 690, duration: 70, delay: 0 },
      { type: 'swipe', x: 288, y: 690, x2: 340, y2: 720, duration: 70, delay: 70 },
      { type: 'swipe', x: 340, y: 720, x2: 288, y2: 756, duration: 70, delay: 70 },
      { type: 'swipe', x: 288, y: 756, x2: 240, y2: 725, duration: 70, delay: 70 },
    ],
  },
  {
    id: 'boost',
    key: 'F4',
    label: 'Boost',
    color: 'emerald',
    description: 'Tap afterburner boost',
    steps: [{ type: 'tap', x: 1530, y: 870, delay: 0 }],
  },
  {
    id: 'reload',
    key: 'F5',
    label: 'Reload',
    color: 'purple',
    description: 'Tap reload button',
    steps: [{ type: 'tap', x: 1430, y: 640, delay: 0 }],
  },
  {
    id: 'evasive-break',
    key: 'F6',
    label: 'Break Lock',
    color: 'orange',
    description: 'Hard left break to lose missile track',
    steps: [
      { type: 'swipe', x: 288, y: 756, x2: 180, y2: 680, duration: 120, delay: 0 },
      { type: 'swipe', x: 180, y: 680, x2: 288, y2: 756, duration: 120, delay: 120 },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string; active: string }> = {
  red:     { bg: 'bg-red-950/40',     border: 'border-red-700/50',     text: 'text-red-400',     glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',    active: 'bg-red-600' },
  amber:   { bg: 'bg-amber-950/40',   border: 'border-amber-700/50',   text: 'text-amber-400',   glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',   active: 'bg-amber-500' },
  blue:    { bg: 'bg-blue-950/40',    border: 'border-blue-700/50',    text: 'text-blue-400',    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',   active: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-950/40', border: 'border-emerald-700/50', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',   active: 'bg-emerald-600' },
  purple:  { bg: 'bg-purple-950/40',  border: 'border-purple-700/50',  text: 'text-purple-400',  glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',   active: 'bg-purple-600' },
  orange:  { bg: 'bg-orange-950/40',  border: 'border-orange-700/50',  text: 'text-orange-400',  glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',   active: 'bg-orange-600' },
};

export function CompanionOverlay({ activeSerial = 'Android_WSG_AF', isConnected }: CompanionOverlayProps) {
  const [macros, setMacros] = useState<HotkeyMacro[]>(DEFAULT_MACROS);
  const [firing, setFiring] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(['Overlay ready. Connect device to enable macros.']);
  const [scrcpyRunning, setScrcpyRunning] = useState(false);
  const [scrcpyChecking, setScrcpyChecking] = useState(false);
  const [scrcpyError, setScrcpyError] = useState('');
  const [scrcpyOpts, setScrcpyOpts] = useState({ maxFps: 60, maxSize: 720, noControl: true });
  const [showScrcpyOpts, setShowScrcpyOpts] = useState(false);
  const [hotkeysEnabled, setHotkeysEnabled] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [editingMacro, setEditingMacro] = useState<string | null>(null);
  const firingRef = useRef<string | null>(null);

  // ── Poll scrcpy status ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const r = await scrcpy.status();
        setScrcpyRunning(r.running);
      } catch {}
    };
    check();
    const id = setInterval(check, 3000);
    return () => clearInterval(id);
  }, []);

  // ── Log helper ──────────────────────────────────────────────────────────────
  const addLog = useCallback((msg: string) => {
    const ts = new Date().toISOString().substring(11, 19);
    setLog(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 40));
  }, []);

  // ── Fire a macro ────────────────────────────────────────────────────────────
  const fireMacro = useCallback(async (macro: HotkeyMacro) => {
    if (firingRef.current) return; // debounce
    if (!isConnected) { addLog(`⚠ ${macro.label}: no device connected`); return; }

    firingRef.current = macro.id;
    setFiring(macro.id);
    addLog(`▶ ${macro.key} → ${macro.label}`);

    try {
      const r = (await hotkeys.fire(macro.key, macro.steps, activeSerial)) as any;
      if (r.ok) {
        addLog(`✓ ${macro.label} done`);
      } else {
        addLog(`✗ ${macro.label}: ${r.error}`);
      }
    } catch (err: any) {
      addLog(`✗ ${macro.label}: ${err.message}`);
    } finally {
      firingRef.current = null;
      setFiring(null);
    }
  }, [isConnected, activeSerial, addLog]);

  // ── Keyboard listener ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!hotkeysEnabled) return;
    const handler = (e: KeyboardEvent) => {
      // Only fire if not typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      const macro = macros.find(m => m.key === e.key);
      if (macro) {
        e.preventDefault();
        fireMacro(macro);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hotkeysEnabled, macros, fireMacro]);

  // ── SSE stream from backend (catches hotkeys fired by other tools) ──────────
  useEffect(() => {
    const unsub = hotkeys.stream((key) => {
      const macro = macros.find(m => m.key === key);
      if (macro) fireMacro(macro);
    });
    return unsub;
  }, [macros, fireMacro]);

  // ── scrcpy launch / stop ────────────────────────────────────────────────────
  const handleScrcpyToggle = async () => {
    setScrcpyChecking(true);
    setScrcpyError('');
    try {
      if (scrcpyRunning) {
        await scrcpy.stop();
        setScrcpyRunning(false);
        addLog('📺 Screen mirror stopped');
      } else {
        const r = (await scrcpy.start({ serial: activeSerial, ...scrcpyOpts })) as any;
        if (r.ok) {
          setScrcpyRunning(true);
          addLog(`📺 Mirror started (PID ${r.pid}) — ${scrcpyOpts.noControl ? 'phone-only control' : 'PC+phone control'}`);
        } else {
          setScrcpyError(r.error ?? 'Failed to start scrcpy');
          if (r.installCmd) addLog(`💡 Install: ${r.installCmd}`);
        }
      }
    } catch (err: any) {
      setScrcpyError(err.message);
    } finally {
      setScrcpyChecking(false);
    }
  };

  const updateMacroCoord = (macroId: string, stepIdx: number, field: string, val: number) => {
    setMacros(prev => prev.map(m => {
      if (m.id !== macroId) return m;
      const steps = [...m.steps];
      steps[stepIdx] = { ...steps[stepIdx], [field]: val };
      return { ...m, steps };
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] rounded-xl border border-gray-800/80 overflow-hidden shadow-2xl">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 to-[#0a0c10] border-b border-gray-800/60 font-sans">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-gray-650")}>
              {isConnected && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
            </div>
          </div>
          <span className="text-xs font-mono font-bold tracking-[0.2em] text-gray-300 uppercase">Co-Pilot Overlay</span>
          {activeSerial && (
            <span className="text-[10px] font-mono text-gray-600 truncate max-w-[120px]">{activeSerial}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setHotkeysEnabled(v => !v)}
            title="Toggle keyboard hotkeys"
            className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border transition-all",
              hotkeysEnabled
                ? "bg-amber-500/15 border-amber-600/40 text-amber-400"
                : "bg-gray-800/60 border-gray-700/40 text-gray-600"
            )}
          >
            <Keyboard className="w-3" />
            <span>{hotkeysEnabled ? 'Keys ON' : 'Keys OFF'}</span>
          </button>
          <button onClick={() => setCollapsed(v => !v)} className="p-1 text-gray-650 hover:text-gray-300 transition-colors">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* ── Screen Mirror Control ────────────────────────────────────── */}
          <div className="px-4 py-3 border-b border-gray-800/40 bg-gray-900/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {scrcpyRunning
                  ? <Monitor className="w-4 h-4 text-emerald-400" />
                  : <MonitorOff className="w-4 h-4 text-gray-600" />}
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Screen Mirror</span>
                {scrcpyRunning && (
                  <span className="text-[10px] font-mono text-emerald-500 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <span>LIVE</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowScrcpyOpts(v => !v)}
                  className="p-1 text-gray-600 hover:text-gray-450 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleScrcpyToggle}
                  disabled={scrcpyChecking || !isConnected}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                    scrcpyRunning
                      ? "bg-red-950/40 border-red-700/50 text-red-400 hover:bg-red-900/50"
                      : isConnected
                      ? "bg-emerald-950/40 border-emerald-700/50 text-emerald-400 hover:bg-emerald-950/60"
                      : "bg-gray-800/40 border-gray-700/30 text-gray-600 cursor-not-allowed"
                  )}
                >
                  {scrcpyChecking
                    ? <RotateCcw className="w-3 h-3 animate-spin" />
                    : scrcpyRunning
                    ? <><Square className="w-3 h-3" /><span>Stop Mirror</span></>
                    : <><Monitor className="w-3 h-3" /><span>Start Mirror</span></>}
                </button>
              </div>
            </div>

            {showScrcpyOpts && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div>
                  <label className="block text-gray-600 uppercase mb-1">Max FPS</label>
                  <select
                    value={scrcpyOpts.maxFps}
                    onChange={e => setScrcpyOpts(p => ({ ...p, maxFps: Number(e.target.value) }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 outline-none"
                  >
                    {[30, 45, 60].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 uppercase mb-1">Max Size</label>
                  <select
                    value={scrcpyOpts.maxSize}
                    onChange={e => setScrcpyOpts(p => ({ ...p, maxSize: Number(e.target.value) }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 outline-none"
                  >
                    {[480, 720, 1080].map(v => <option key={v} value={v}>{v}p</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block text-gray-600 uppercase mb-1">PC Control</label>
                  <button
                    onClick={() => setScrcpyOpts(p => ({ ...p, noControl: !p.noControl }))}
                    className={cn(
                      "flex-1 rounded border text-center transition-all py-1",
                      scrcpyOpts.noControl
                        ? "border-gray-700 text-gray-600 bg-gray-900"
                        : "border-blue-700/50 text-blue-400 bg-blue-950/30"
                    )}
                  >
                    {scrcpyOpts.noControl ? 'Phone only' : 'PC + Phone'}
                  </button>
                </div>
              </div>
            )}

            {scrcpyError && (
              <div className="mt-2 flex items-start space-x-1.5 text-[10px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg p-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{scrcpyError}</span>
              </div>
            )}

            {!isConnected && (
              <p className="mt-2 text-[10px] font-mono text-gray-700">Connect a device to enable screen mirroring.</p>
            )}
          </div>

          {/* ── Macro Hotkeys Grid ───────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Macro Hotkeys</span>
              <span className="text-[10px] font-mono text-gray-600">Click or press keys directly to run macro</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {macros.map(macro => {
                const c = COLOR_MAP[macro.color] ?? COLOR_MAP.blue;
                const isFiring = firing === macro.id;
                return (
                  <div key={macro.id} className="space-y-1">
                    <button
                      onClick={() => fireMacro(macro)}
                      disabled={!isConnected}
                      className={cn(
                        "w-full relative flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border transition-all duration-150 group",
                        c.bg, c.border,
                        isFiring && cn(c.glow, "scale-[0.97]"),
                        !isConnected && "opacity-40 cursor-not-allowed",
                        isConnected && "hover:brightness-125 active:scale-[0.97]"
                      )}
                    >
                      {/* Key badge */}
                      <span className={cn(
                        "text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md border min-w-[28px] text-center transition-colors",
                        isFiring
                          ? cn(c.active, "text-white border-transparent")
                          : cn("bg-black/40 border-gray-700/60", c.text)
                      )}>
                        {macro.key}
                      </span>
                      <div className="flex-1 text-left min-w-0">
                        <p className={cn("text-xs font-bold truncate", c.text)}>{macro.label}</p>
                        <p className="text-[10px] text-gray-600 truncate">{macro.description}</p>
                      </div>
                      {isFiring && (
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", c.active)} />
                      )}
                    </button>

                    {/* Coord editor toggle */}
                    <button
                      onClick={() => setEditingMacro(editingMacro === macro.id ? null : macro.id)}
                      className="w-full text-[9px] font-mono text-gray-500 hover:text-gray-400 transition-colors text-center block"
                    >
                      {editingMacro === macro.id ? '▲ minimize coords' : '▼ edit coordinates'}
                    </button>

                    {editingMacro === macro.id && (
                      <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-2 space-y-1.5 text-[10px] font-mono">
                        {macro.steps.map((step, i) => (
                          <div key={i} className="grid grid-cols-4 gap-1 items-center">
                            <span className="text-gray-650 col-span-1">{step.type}[{i}]</span>
                            <input
                              type="number"
                              value={step.x}
                              onChange={e => updateMacroCoord(macro.id, i, 'x', Number(e.target.value))}
                              className="col-span-1 bg-gray-950 border border-gray-800 rounded px-1 py-0.5 text-gray-300 outline-none w-full text-center"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={step.y}
                              onChange={e => updateMacroCoord(macro.id, i, 'y', Number(e.target.value))}
                              className="col-span-1 bg-gray-950 border border-gray-800 rounded px-1 py-0.5 text-gray-300 outline-none w-full text-center"
                              placeholder="Y"
                            />
                            <span className="text-gray-700 text-center text-[9px]">delay: {step.delay}ms</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Action Log ──────────────────────────────────────────────── */}
          <div className="border-t border-gray-800/40 bg-black/40">
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-2.5 h-2.5 text-amber-500" /><span>Macro Execution Log</span>
              </span>
              <button onClick={() => setLog([])} className="text-[9px] font-mono text-gray-600 hover:text-gray-450">clear</button>
            </div>
            <div className="p-3 text-[10px] font-mono text-gray-400 overflow-y-auto space-y-1 h-24 max-h-24 select-text bg-gray-955/60">
              {log.length === 0 ? (
                <div className="text-gray-600 text-center py-4">No macros executed in this session.</div>
              ) : (
                log.map((entry, index) => (
                  <div key={index} className="truncate text-[10.5px]">
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
