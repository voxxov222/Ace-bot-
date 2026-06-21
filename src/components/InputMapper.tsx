import React, { useState } from 'react';
import { Gamepad2, Move, Focus, ArrowUpCircle } from 'lucide-react';
import { InputMap } from '../types';
import { cn } from '../lib/utils';

export function InputMapper() {
  const [inputs, setInputs] = useState<InputMap[]>([
    { id: '1', type: 'joystick', x: 15, y: 70, label: 'L-Stick', size: 100 },
    { id: '2', type: 'button', x: 85, y: 75, label: 'Fire', size: 60 },
    { id: '3', type: 'button', x: 75, y: 85, label: 'Boost', size: 50 },
    { id: '4', type: 'button', x: 80, y: 60, label: 'Reload', size: 40 },
    { id: '5', type: 'button', x: 92, y: 60, label: 'Lock', size: 40 },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl relative">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-gray-950/80 backdrop-blur border border-gray-800 px-3 py-1.5 rounded-full">
        <Gamepad2 className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">Input Overlay</span>
      </div>

      <div className="flex-1 relative w-full h-full bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center">
        {/* Simulate phone screen overlay */}
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"></div>
        
        {/* Render Inputs */}
        {inputs.map(input => (
          <div
            key={input.id}
            onClick={() => setActiveId(input.id)}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-colors backdrop-blur-sm",
              input.type === 'joystick' ? "border-4" : "border-2",
              activeId === input.id 
                ? "bg-blue-500/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                : "bg-white/10 border-white/30 hover:border-white/50"
            )}
            style={{
              left: `${input.x}%`,
              top: `${input.y}%`,
              width: `${input.size}px`,
              height: `${input.size}px`,
            }}
          >
            {input.type === 'joystick' && (
              <div className={cn(
                "w-1/3 h-1/3 rounded-full",
                activeId === input.id ? "bg-blue-400" : "bg-white/50"
              )} />
            )}
            <span className={cn(
              "absolute -bottom-6 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded",
              activeId === input.id ? "bg-blue-500/80 text-white" : "bg-black/50 text-gray-300"
            )}>
              {input.label}
            </span>
          </div>
        ))}
      </div>

      <div className="h-20 bg-gray-950 border-t border-gray-800 p-4 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Select an element above to modify mapping or position.
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors">
            Reset
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
}
