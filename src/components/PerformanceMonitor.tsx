import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Wifi } from 'lucide-react';
import { PerformanceData } from '../types';

const generateMockData = (): PerformanceData => {
  const now = new Date();
  return {
    time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
    fps: Math.max(30, Math.min(60, 50 + Math.random() * 20 - 10)),
    ping: Math.max(10, Math.min(120, 45 + Math.random() * 30 - 15)),
    cpu: Math.max(20, Math.min(95, 60 + Math.random() * 20 - 10)),
  };
};

export function PerformanceMonitor() {
  const [data, setData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    // Initial data
    const initialData = Array.from({ length: 20 }, generateMockData);
    setData(initialData);

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData, generateMockData()];
        if (newData.length > 20) {
          newData.shift();
        }
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1] || { fps: 0, ping: 0, cpu: 0 };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 p-4 shadow-xl">
      <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4 flex items-center space-x-2">
        <Activity className="w-4 h-4 text-emerald-500" />
        <span>Telemetry</span>
      </h2>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
          <div className="text-xs text-gray-500 mb-1 flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>FPS</span>
          </div>
          <div className="text-xl font-mono text-gray-100">{Math.round(latest.fps)}</div>
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
          <div className="text-xs text-gray-500 mb-1 flex items-center space-x-1">
            <Wifi className="w-3 h-3" />
            <span>Ping</span>
          </div>
          <div className="text-xl font-mono text-gray-100">{Math.round(latest.ping)}<span className="text-xs text-gray-500 ml-1">ms</span></div>
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
          <div className="text-xs text-gray-500 mb-1 flex items-center space-x-1">
            <Cpu className="w-3 h-3" />
            <span>CPU</span>
          </div>
          <div className="text-xl font-mono text-gray-100">{Math.round(latest.cpu)}%</div>
        </div>
      </div>

      <div className="flex-1 min-h-[150px] mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis yAxisId="left" domain={[0, 70]} hide />
            <YAxis yAxisId="right" orientation="right" domain={[0, 150]} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#f3f4f6' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="fps" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="ping" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
