import React from 'react';
import { Bot, Crosshair, Shield, Zap, Wind, Skull, Power } from 'lucide-react';
import { AIState, AIStrategy } from '../types';
import { cn } from '../lib/utils';

interface AutopilotControlsProps {
  state: AIState;
  onToggle: () => void;
  onStrategyChange: (strategy: AIStrategy) => void;
}

export function AutopilotControls({ state, onToggle, onStrategyChange }: AutopilotControlsProps) {
  const strategies: { id: AIStrategy; icon: React.ReactNode; label: string; desc: string }[] = [
    { id: 'aggressive', icon: <Skull className="w-4 h-4" />, label: 'Aggressive', desc: 'Prioritize dogfighting and damage output.' },
    { id: 'balanced', icon: <Crosshair className="w-4 h-4" />, label: 'Balanced', desc: 'Adapt automatically to threats and targets.' },
    { id: 'defensive', icon: <Shield className="w-4 h-4" />, label: 'Defensive', desc: 'Maintain distance, shield priority.' },
    { id: 'evasive', icon: <Wind className="w-4 h-4" />, label: 'Evasive', desc: 'Maximize speed and break lock-ons.' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 p-4 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase flex items-center space-x-2">
          <Bot className="w-4 h-4 text-purple-500" />
          <span>Autopilot AI</span>
        </h2>
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            state.isActive 
              ? "bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
              : "bg-gray-800 text-gray-500 hover:text-gray-300"
          )}
        >
          <Power className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>AI Confidence</span>
          <span className="text-gray-300 font-mono">{state.confidence}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500" 
            style={{ width: `${state.confidence}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {strategies.map(strat => (
          <button
            key={strat.id}
            onClick={() => onStrategyChange(strat.id)}
            disabled={!state.isActive}
            className={cn(
              "w-full flex items-center p-3 rounded-lg border transition-all text-left group",
              state.strategy === strat.id 
                ? "bg-purple-500/10 border-purple-500/50" 
                : "bg-gray-800/40 border-transparent hover:bg-gray-800",
              !state.isActive && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "p-2 rounded-md mr-3 transition-colors",
              state.strategy === strat.id ? "bg-purple-500/20 text-purple-400" : "bg-gray-700 text-gray-400 group-hover:text-gray-300"
            )}>
              {strat.icon}
            </div>
            <div>
              <div className={cn(
                "font-medium text-sm transition-colors",
                state.strategy === strat.id ? "text-purple-300" : "text-gray-300"
              )}>
                {strat.label}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">{strat.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto bg-[#0a0a0a] rounded-lg border border-gray-800 overflow-hidden flex flex-col h-32">
        <div className="px-3 py-2 bg-gray-900 border-b border-gray-800 text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center">
          <Zap className="w-3 h-3 mr-2" /> Action Log
        </div>
        <div className="p-3 text-xs font-mono text-gray-400 overflow-y-auto space-y-1.5 flex-1 flex flex-col justify-end">
          {state.logs.map((log, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-gray-600 mr-2">{(new Date()).toISOString().substring(11,19)}</span>
              <span className={log.includes('Target') || log.includes('Firing') ? 'text-purple-400' : 'text-gray-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
