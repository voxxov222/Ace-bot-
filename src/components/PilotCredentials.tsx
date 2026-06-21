import React, { useState } from 'react';
import { ShieldAlert, Key, Smartphone, HelpCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface PilotCredentialsProps {
  onConnectDevice: (ip: string, port: string) => void;
  isConnected: boolean;
}

export function PilotCredentials({ onConnectDevice, isConnected }: PilotCredentialsProps) {
  const [callsign, setCallsign] = useState('');
  const [deviceIp, setDeviceIp] = useState('192.168.1.100');
  const [port, setPort] = useState('5555');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAdbGuide, setShowAdbGuide] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) {
      setErrorMsg('Pilot callsign is required for logging session data.');
      return;
    }
    setErrorMsg('');
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      onConnectDevice(deviceIp, port);
    }, 1500);
  };

  return (
    <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 p-4 shadow-xl">
      <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4 flex items-center space-x-2">
        <Key className="w-4 h-4 text-amber-500" />
        <span>Pilot Login & Device Bridge</span>
      </h2>

      {isConnected ? (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
          <p className="text-sm font-semibold text-emerald-400">Tactical Connection Active</p>
          <p className="text-xs text-gray-400 mt-1">ADB Bridge streaming input maps to device.</p>
          <div className="mt-3 text-xs bg-gray-950 p-2 rounded border border-gray-800 font-mono text-gray-500">
            ADDR: {deviceIp}:{port}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Pilot Callsign / ID</label>
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="e.g., Maverick"
              className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-700 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Android Device IP</label>
              <input
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-700 outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Port</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="5555"
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-700 outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-500 flex items-center space-x-1.5 bg-rose-950/20 p-2 rounded border border-rose-900/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowAdbGuide(!showAdbGuide)}
              className="text-xs text-gray-500 hover:text-gray-300 flex items-center space-x-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>ADB Setup Help</span>
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className={cn(
                "px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center space-x-1.5",
                isVerifying && "opacity-50 cursor-not-allowed"
              )}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Verify & Sync</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {showAdbGuide && (
        <div className="mt-4 p-3 bg-gray-950 border border-gray-800 rounded-lg text-[11px] text-gray-400 space-y-2 font-mono">
          <div className="font-semibold text-gray-200">ADB over Wi-Fi Setup Guide:</div>
          <div>1. Enable Developer Options on your mobile phone.</div>
          <div>2. Turn on Wireless Debugging.</div>
          <div>3. Connect phone to the same Wi-Fi network.</div>
          <div>4. Set port (usually 5555) and match your phone's local IP address above.</div>
        </div>
      )}
    </div>
  );
}
