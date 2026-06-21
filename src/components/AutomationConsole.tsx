import React, { useState } from 'react';
import { Bot, Terminal, Copy, Check, Play, Settings2, Download, RefreshCw, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScriptTemplate {
  name: string;
  description: string;
  fileName: string;
  code: (ip: string, port: string, sens: number, interval: number) => string;
}

export function AutomationConsole() {
  const [deviceIp, setDeviceIp] = useState('192.168.1.100');
  const [port, setPort] = useState('5555');
  const [sensitivity, setSensitivity] = useState(85);
  const [refreshInterval, setRefreshInterval] = useState(100);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'botfather' | 'adb'>('botfather');

  const scriptTemplates: Record<string, ScriptTemplate> = {
    dogfight: {
      name: 'Autopilot Dogfight Logic',
      description: 'Uses Botfather Android API for screen OCR to lock targets and apply evasive vectors.',
      fileName: 'ace_force_autopilot.js',
      code: (ip, port, sens, interval) => `// Botfather Android Automation Script
// Targeting: Ace Force Joint Combat
// Configured device: ${ip}:${port}

const config = {
    aimSensitivity: ${sens},
    loopInterval: ${interval},
    targetColor: "#FF3B30", // Red crosshair indicator
    lockRange: 45 // Pixels
};

function main() {
    // Connect to local android device target frame
    log("Acquiring Ace Force process context...");
    const screen = device.getScreen();
    
    while (true) {
        // Step 1: Capture game state frame
        const frame = device.takeScreenshot();
        if (!frame) {
            sleep(config.loopInterval);
            continue;
        }

        // Step 2: Search for threat locking indicators
        const target = frame.findColor(config.targetColor, {
            similarity: 0.9,
            region: [200, 200, 1600, 900] // Centered battlefield bounding box
        });

        if (target) {
            log("Target acquired at: " + target.x + ", " + target.y);
            
            // Step 3: Trigger fire controls matching mapping Overlay button
            // Fire button coordinate: (85% width, 75% height)
            const fireX = Math.round(screen.width * 0.85);
            const fireY = Math.round(screen.height * 0.75);
            
            device.click(fireX, fireY);
            
            // Tactical micro-delay based on aiming sensitivity
            sleep(Math.max(50, 150 - config.aimSensitivity));
        } else {
            // Evasive movement if no target in focus
            // Left Stick swipe simulation for flight control
            const stickX = Math.round(screen.width * 0.15);
            const stickY = Math.round(screen.height * 0.70);
            device.swipe(stickX, stickY, stickX + (Math.random() * 40 - 20), stickY + (Math.random() * 40 - 20), 100);
        }

        sleep(config.loopInterval);
    }
}

main();`
    },
    autoFire: {
      name: 'Auto Lock & Fire Trigger',
      description: 'Simulates instantaneous trigger pull once target locking mechanism matches colors.',
      fileName: 'triggerbot.js',
      code: (ip, port, sens, interval) => `// Rapid-Fire Triggerbot Script
// Optimize trigger speed on target lock-on

const triggerConfig = {
    triggerKey: "Fire",
    aimSens: ${sens},
    pollMs: ${interval}
};

function runTrigger() {
    log("Trigger active. Watching lock coordinates.");
    
    while(true) {
        const screenshot = device.takeScreenshot();
        // Check for specific yellow/red pixel values indicating missile lock-on
        const lockAcquired = screenshot.findColor("#FFCC00", { similarity: 0.85 });
        
        if (lockAcquired) {
            log("Lock Confirmed. Simulating high-frequency presses.");
            // Press the mapped location
            device.click(1632, 810); // Coordinates derived from overlay profile
            sleep(40);
        }
        sleep(triggerConfig.pollMs);
    }
}

runTrigger();`
    }
  };

  const [activeTemplateKey, setActiveTemplateKey] = useState<keyof typeof scriptTemplates>('dogfight');
  const activeTemplate = scriptTemplates[activeTemplateKey];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const adbCommands = [
    { cmd: `adb connect ${deviceIp}:${port}`, desc: 'Establishes ADB wireless network link to your Android handset' },
    { cmd: `adb shell input tap 1632 810`, desc: 'Trigger absolute coordinates click matching Fire overlay action' },
    { cmd: `adb shell input swipe 288 756 320 756 120`, desc: 'Send mock flight control vector via directional swipe' },
    { cmd: `adb shell screencap -p /sdcard/play.png`, desc: 'Capture active frame buffer to debug coordinate misalignment' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 p-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>Automation Configurator</span>
        </h2>
        <div className="flex space-x-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveSubTab('botfather')}
            className={cn(
              "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded transition-all",
              activeSubTab === 'botfather' ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-gray-400"
            )}
          >
            Botfather
          </button>
          <button
            onClick={() => setActiveSubTab('adb')}
            className={cn(
              "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded transition-all",
              activeSubTab === 'adb' ? "bg-blue-500/20 text-blue-400" : "text-gray-500 hover:text-gray-400"
            )}
          >
            ADB Shell
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* Settings Deck */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 space-y-3.5">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase flex items-center space-x-1.5 border-b border-gray-800 pb-2">
              <Settings2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Integration Parameters</span>
            </h3>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-gray-500 uppercase">Device Address</label>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={deviceIp}
                  onChange={(e) => setDeviceIp(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-gray-100 outline-none w-2/3 font-mono"
                />
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-gray-100 outline-none w-1/3 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                <span>Aim Speed Offset</span>
                <span className="text-amber-400">{sensitivity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-gray-800 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                <span>OCR Interval</span>
                <span className="text-amber-400">{refreshInterval}ms</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-gray-800 rounded"
              />
            </div>
          </div>

          {activeSubTab === 'botfather' && (
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-850 space-y-2">
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Preset Profiles</label>
              {Object.entries(scriptTemplates).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setActiveTemplateKey(key)}
                  className={cn(
                    "w-full text-left p-2 rounded-md transition-colors text-xs flex items-center space-x-2 border",
                    activeTemplateKey === key
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : "bg-gray-900/40 border-transparent text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-650 truncate">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Code / Command Deck */}
        <div className="md:col-span-8 flex flex-col min-h-[300px]">
          {activeSubTab === 'botfather' ? (
            <div className="flex-1 flex flex-col bg-gray-950 border border-gray-850 rounded-lg overflow-hidden font-mono text-xs">
              <div className="bg-gray-900 px-3 py-2 border-b border-gray-850 flex justify-between items-center text-gray-400">
                <span className="text-[10px] text-amber-500/90 font-bold">{activeTemplate.fileName}</span>
                <div className="flex space-x-2.5">
                  <button
                    onClick={() => handleCopy(activeTemplate.code(deviceIp, port, sensitivity, refreshInterval))}
                    className="p-1 text-gray-500 hover:text-gray-300 transition-colors flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] uppercase font-semibold">Copy Script</span>
                  </button>
                </div>
              </div>
              <pre className="flex-1 p-3 overflow-auto text-gray-300 leading-relaxed text-[11px] select-text bg-[#080808]">
                {activeTemplate.code(deviceIp, port, sensitivity, refreshInterval)}
              </pre>
            </div>
          ) : (
            <div className="flex-1 bg-gray-950 border border-gray-850 rounded-lg p-3 font-mono text-xs space-y-3.5 overflow-y-auto">
              <div className="flex items-center space-x-1.5 text-blue-400 border-b border-gray-850 pb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">ADB Quick-Action Command Terminal</span>
              </div>
              <div className="space-y-3">
                {adbCommands.map((item, index) => (
                  <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-2.5 flex justify-between items-start space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">{item.desc}</div>
                      <div className="text-gray-200 select-all font-mono text-[11px] bg-black/60 p-1.5 rounded border border-gray-900 break-all">{item.cmd}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(item.cmd)}
                      className="p-1 px-2 border border-gray-800 bg-gray-950 hover:bg-gray-900 text-gray-400 hover:text-white rounded transition-colors text-[10px] font-semibold self-center"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
