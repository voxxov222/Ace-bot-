import React, { useState, useEffect } from 'react';
import { Target, Server, Smartphone, Activity, Layers, ExternalLink, Minimize2, Maximize2, ShieldAlert, Wifi, Info, Swords, CircleDot, Terminal } from 'lucide-react';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { AutopilotControls } from './components/AutopilotControls';
import { InputMapper } from './components/InputMapper';
import { PilotCredentials } from './components/PilotCredentials';
import { AutomationConsole } from './components/AutomationConsole';
import { CompanionOverlay } from './components/CompanionOverlay';
import { AIState, AIStrategy } from './types';
import { cn } from './lib/utils';

export default function App() {
  const isOverlayParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'overlay';
  const [viewMode, setViewMode] = useState<'dashboard' | 'hud-overlay'>(isOverlayParam ? 'hud-overlay' : 'dashboard');
  const [connected, setConnected] = useState(true);
  const [activeTab, setActiveTab] = useState<'mapping' | 'autopilot' | 'stats' | 'automation' | 'overlay'>('overlay');
  const [centerTab, setCenterTab] = useState<'mapping' | 'automation'>('mapping');
  const [rightTab, setRightTab] = useState<'autopilot' | 'overlay'>('overlay');
  const [aiState, setAiState] = useState<AIState>({
    isActive: false,
    strategy: 'balanced',
    confidence: 85,
    targetAcquired: false,
    logs: [
      'System initialized.',
      'Awaiting autopilot engagement.'
    ]
  });

  useEffect(() => {
    if (!aiState.isActive) return;

    const interval = setInterval(() => {
      setAiState(prev => {
        const newLogs = [...prev.logs];
        const isTargeting = Math.random() > 0.7;
        
        if (newLogs.length > 5) newLogs.shift();
        
        if (isTargeting && !prev.targetAcquired) {
          newLogs.push('Target Acquired. Calculating trajectory...');
        } else if (!isTargeting && prev.targetAcquired) {
          newLogs.push('Target lost. Scanning...');
        } else if (isTargeting && prev.targetAcquired) {
            newLogs.push(prev.strategy === 'aggressive' ? 'Firing primary weapons.' : 'Maintaining lock, evading fire.');
        }

        return {
          ...prev,
          confidence: Math.max(40, Math.min(99, prev.confidence + (Math.random() * 10 - 5))),
          targetAcquired: isTargeting,
          logs: newLogs
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [aiState.isActive]);

  const toggleAI = () => {
    setAiState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      logs: [...prev.logs, prev.isActive ? 'Autopilot disengaged.' : 'Autopilot engaged. Analyzing battle space.'].slice(-5)
    }));
  };

  const handlePopout = () => {
    if (typeof window !== 'undefined') {
      const popoutUrl = `${window.location.origin}${window.location.pathname}?mode=overlay`;
      window.open(
        popoutUrl,
        'ace_force_overlay',
        'width=420,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      );
    }
  };

  // Render hyper-compact overlay view for pop-out screen
  if (viewMode === 'hud-overlay') {
    return (
      <div className="min-h-screen bg-neutral-950 text-gray-100 p-3 font-sans flex flex-col selection:bg-amber-500/30">
        {/* HUD Header */}
        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase">HUD OVERLAY MODULE</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                if (isOverlayParam) {
                  alert("This is a stand-alone popped-out window. Close it directly to return.");
                } else {
                  setViewMode('dashboard');
                }
              }}
              title="Return to Command Center"
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white rounded transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Tabs for compact view */}
        <div className="grid grid-cols-5 gap-1 mb-3 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800/60">
          <button
            onClick={() => setActiveTab('mapping')}
            className={cn(
              "py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-all",
              activeTab === 'mapping' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={cn(
              "py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-all",
              activeTab === 'overlay' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Macros
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={cn(
              "py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-all",
              activeTab === 'automation' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Scripts
          </button>
          <button
            onClick={() => setActiveTab('autopilot')}
            className={cn(
              "py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-all",
              activeTab === 'autopilot' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-500 hover:text-gray-300"
            )}
          >
            AI
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-all",
              activeTab === 'stats' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Stats
          </button>
        </div>

        {/* Dynamic Tab Body */}
        <div className="flex-1 min-h-0 flex flex-col">
          {activeTab === 'mapping' && (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-200">
              <div className="flex-1 relative rounded-lg overflow-hidden border border-neutral-800">
                <InputMapper />
              </div>
            </div>
          )}

          {activeTab === 'overlay' && (
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-200">
              <CompanionOverlay isConnected={connected} />
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-200">
              <AutomationConsole />
            </div>
          )}

          {activeTab === 'autopilot' && (
            <div className="flex-1 min-h-0 overflow-y-auto animate-in fade-in duration-200">
              <AutopilotControls 
                state={aiState} 
                onToggle={toggleAI}
                onStrategyChange={(s) => setAiState(prev => ({ ...prev, strategy: s }))}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="flex-1 flex flex-col space-y-3 min-h-0">
              <div className="flex-1 min-h-[160px]">
                <PerformanceMonitor />
              </div>
              <PilotCredentials 
                onConnectDevice={(ip, port) => {
                  setConnected(true);
                  setAiState(prev => ({
                    ...prev,
                    logs: [...prev.logs, `Joined bridge ${ip}:${port}`].slice(-5)
                  }));
                }}
                isConnected={connected}
              />
            </div>
          )}
        </div>

        <div className="mt-3 text-[10px] font-mono text-center text-neutral-600 border-t border-neutral-900 pt-2 flex items-center justify-center space-x-1">
          <Info className="w-3 h-3 text-neutral-500" />
          <span>Stream/Overlay Ready. Fit to corner of game stream.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 font-sans selection:bg-purple-500/30">
      <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header Ribbon */}
        <header className="h-16 mb-4 flex items-center justify-between px-6 bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">ACE FORCE CO-PILOT</h1>
              <p className="text-[10px] tracking-widest text-amber-500 font-mono uppercase mt-1">Joint Combat Integration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Switching controls */}
            <div className="flex items-center bg-gray-950 p-1.5 rounded-lg border border-gray-805 space-x-2">
              <button 
                onClick={() => setViewMode('dashboard')}
                className={cn(
                  "px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all",
                  viewMode === 'dashboard' ? "bg-amber-500 text-neutral-950 shadow-md" : "text-gray-500 hover:text-gray-300"
                )}
              >
                Full Dashboard
              </button>
              <button 
                onClick={() => setViewMode('hud-overlay')}
                className={cn(
                  "px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1",
                  viewMode === 'hud-overlay' ? "bg-amber-500 text-neutral-950 shadow-md" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>HUD Overlay</span>
              </button>
            </div>

            {/* Float window pop out */}
            <button
              onClick={handlePopout}
              title="Pop out separate HUD overlay window"
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/20 flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Pop Out Window</span>
            </button>

            <div className="h-6 w-[1px] bg-gray-800" />

            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={cn("relative inline-flex rounded-full h-3 w-3", connected ? "bg-emerald-500" : "bg-red-500")}></span>
              </span>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden md:inline">
                {connected ? "Device Linked" : "Awaiting Client"}
              </span>
            </div>
            <button 
              onClick={() => setConnected(!connected)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
              title="Toggle Device Connection Status"
            >
              <Smartphone className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          
          {/* Left Column: Telemetry & Pilot Sync */}
          <div className="col-span-1 lg:col-span-3 flex flex-col space-y-4">
            <div className="flex-1 min-h-[250px]">
              <PerformanceMonitor />
            </div>
            <PilotCredentials 
              onConnectDevice={(ip, port) => {
                setConnected(true);
                setAiState(prev => ({
                  ...prev,
                  logs: [...prev.logs, `Bridge linked at ${ip}:${port}`].slice(-5)
                }));
              }}
              isConnected={connected}
            />
          </div>

          {/* Center Column: Visual Mapping & Automation console tabs */}
          <div className="col-span-1 lg:col-span-6 flex flex-col space-y-4">
            
            {/* Tab selection bar for center-panel */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1.5 self-start">
              <button
                onClick={() => setCenterTab('mapping')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5",
                  centerTab === 'mapping' ? "bg-amber-500 text-neutral-950 font-bold" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Input Overlay</span>
              </button>
              <button
                onClick={() => setCenterTab('automation')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5",
                  centerTab === 'automation' ? "bg-amber-500 text-neutral-950 font-bold" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Scripting & ADB</span>
              </button>
            </div>

            <div className="flex-1 relative min-h-[450px]">
              {!connected && (
                <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-800">
                  <div className="text-center p-6 max-w-md">
                    <Server className="w-12 h-12 text-amber-500 mb-4 mx-auto animate-pulse" />
                    <p className="text-lg font-bold text-gray-100 tracking-tight">Active Connection Required</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Please use the Pilot Login & Device Bridge on the left column to authorize your Ace Force account and connect via ADB over your home Wi-Fi network.
                    </p>
                  </div>
                </div>
              )}
              {centerTab === 'mapping' ? <InputMapper /> : <AutomationConsole />}
            </div>
          </div>

          {/* Right Column: AI Autopilot & Companion Overlay */}
          <div className="col-span-1 lg:col-span-3 flex flex-col space-y-4">
            
            {/* Tab selection bar for right-panel */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1.5 self-start">
              <button
                onClick={() => setRightTab('overlay')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5",
                  rightTab === 'overlay' ? "bg-amber-500 text-neutral-950 font-bold" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Macro Overlay</span>
              </button>
              <button
                onClick={() => setRightTab('autopilot')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5",
                  rightTab === 'autopilot' ? "bg-amber-500 text-neutral-950 font-bold" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Autopilot AI</span>
              </button>
            </div>

            <div className="flex-1">
              {rightTab === 'autopilot' ? (
                <AutopilotControls 
                  state={aiState} 
                  onToggle={toggleAI}
                  onStrategyChange={(s) => setAiState(prev => ({ ...prev, strategy: s }))}
                />
              ) : (
                <CompanionOverlay isConnected={connected} />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

