import React, { useState, useRef } from 'react';
import { Upload, Package, Download, Terminal, Loader2, AlertCircle, CheckCircle2, Cog, Flame, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

type InjectStatus = 'idle' | 'uploading' | 'decompiling' | 'injecting' | 'recompiling' | 'signing' | 'done' | 'error';

export function ApkInjector() {
  const [status, setStatus] = useState<InjectStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().substring(11, 19)}] ${msg}`]);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const simulateProcess = async (file: File) => {
    setStatus('uploading');
    setTargetFile(file);
    setLogs([]);
    setProgress(0);
    addLog(`Uploading ${file.name}...`);
    
    // Simulate File Upload
    for (let i = 0; i <= 100; i += 20) {
      setProgress(i);
      await delay(200);
    }
    
    // Decompiling
    setStatus('decompiling');
    setProgress(0);
    addLog('Starting Apktool v2.9.3-dev...');
    await delay(500);
    addLog('I: Using Apktool 2.9.3 on target.apk');
    addLog('I: Loading resource table...');
    await delay(600);
    addLog('I: Decoding AndroidManifest.xml with resources...');
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      if (i === 40) addLog('I: Decoding file-resources...');
      if (i === 80) addLog('I: Decoding values */* XMLs...');
      await delay(300);
    }
    addLog('I: Baksmaling classes.dex...');
    await delay(1000);
    
    // Injecting
    setStatus('injecting');
    setProgress(0);
    addLog('Locating MainActivity entry point...');
    await delay(600);
    addLog('Found target: com.tencent.tmgp.aceforce.MainActivity');
    addLog('Injecting payload.smali and mod_menu_overlay.smali...');
    for (let i = 0; i <= 100; i += 25) {
      setProgress(i);
      await delay(400);
    }
    addLog('Patching AndroidManifest.xml to add SYSTEM_ALERT_WINDOW permission...');
    await delay(800);
    addLog('Adding Ace Force Co-Pilot hooks...');
    await delay(500);

    // Recompiling
    setStatus('recompiling');
    setProgress(0);
    addLog('I: Using Apktool 2.9.3');
    addLog('I: Smaling smali folder into classes.dex...');
    for (let i = 0; i <= 100; i += 15) {
      setProgress(i);
      if (i === 45) addLog('I: Building resources...');
      if (i === 90) addLog('I: Building apk file...');
      await delay(350);
    }

    // Signing
    setStatus('signing');
    setProgress(0);
    addLog('Generating keystore and signing APK...');
    addLog('Signing APK (v1/v2 schema) to prevent parse error during installation...');
    for (let i = 0; i <= 100; i += 33) {
      setProgress(i);
      await delay(500);
    }
    addLog('Signature verification successful.');
    addLog('Zipaligning APK (align 4)...');
    await delay(800);

    setStatus('done');
    setProgress(100);
    addLog(`Process complete! Download ready: modded_${file.name}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.apk')) {
      alert("Please select a valid .apk file.");
      return;
    }

    simulateProcess(file);
  };

  const handleDownload = () => {
    if (!targetFile) return;
    
    // Create a dummy blob representing the "modded" APK
    const blob = new Blob(["Simulated Modded APK Content"], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `modded_${targetFile.name}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'idle': return { label: 'Awaiting APK', icon: <Package className="w-8 h-8 text-gray-500" />, color: 'text-gray-500' };
      case 'uploading': return { label: 'Uploading APK...', icon: <Upload className="w-8 h-8 text-blue-400 animate-bounce" />, color: 'text-blue-400' };
      case 'decompiling': return { label: 'Decompiling (Apktool)...', icon: <Cog className="w-8 h-8 text-amber-500 animate-spin" />, color: 'text-amber-500' };
      case 'injecting': return { label: 'Injecting Mod Menu Overlay...', icon: <Flame className="w-8 h-8 text-orange-500 animate-pulse" />, color: 'text-orange-500' };
      case 'recompiling': return { label: 'Building APK...', icon: <Cog className="w-8 h-8 text-purple-400 animate-spin" />, color: 'text-purple-400' };
      case 'signing': return { label: 'Signing & Aligning...', icon: <ShieldAlert className="w-8 h-8 text-emerald-400 animate-pulse" />, color: 'text-emerald-400' };
      case 'done': return { label: 'Ready for Download', icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />, color: 'text-emerald-500' };
      case 'error': return { label: 'Injection Failed', icon: <AlertCircle className="w-8 h-8 text-red-500" />, color: 'text-red-500' };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] rounded-xl border border-gray-800/80 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 to-[#0a0c10] border-b border-gray-800/60 font-sans">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-gray-100 uppercase">APK Mod Injector</span>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">Decompile • Inject Overlay • Recompile</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden h-64 flex-shrink-0">
          
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:16px_16px]" />
          
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className={cn("p-4 rounded-full bg-gray-950 border border-gray-800 shadow-xl", statusInfo.color)}>
              {statusInfo.icon}
            </div>
            
            <div>
              <h3 className={cn("text-lg font-bold tracking-tight", statusInfo.color)}>
                {statusInfo.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {status === 'idle' 
                  ? "Upload the original Ace Force APK. We will inject the Co-Pilot Mod Menu overlay and rebuild it."
                  : status === 'done' 
                  ? "Injection successful. Download your modded APK to install on your device."
                  : "Please wait, do not close this window during the build process."}
              </p>
            </div>

            {status === 'idle' && (
              <div className="pt-4">
                <input
                  type="file"
                  accept=".apk"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-wider text-sm rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select Target APK</span>
                </button>
              </div>
            )}

            {status === 'done' && (
              <div className="pt-4 flex space-x-3">
                <button
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold uppercase tracking-wider text-xs rounded-lg transition-colors border border-gray-700"
                >
                  Inject Another
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Mod APK</span>
                </button>
              </div>
            )}

            {(status !== 'idle' && status !== 'done' && status !== 'error') && (
              <div className="w-full max-w-sm pt-4">
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] font-mono text-gray-500">
                  <span>{progress}%</span>
                  <span>{status}</span>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Console Log Output */}
        <div className="flex-1 flex flex-col bg-black border border-gray-800 rounded-xl overflow-hidden min-h-[200px]">
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Apktool Build Log</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Waiting for injection process to start...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={
                  log.includes('Injecting') || log.includes('Patching') ? 'text-amber-400' :
                  log.includes('Found target') || log.includes('succesful') ? 'text-emerald-400' : ''
                }>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
