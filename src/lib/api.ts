export const scrcpy = {
  status: async () => {
    // Check local storage or state to return a dynamic simulation
    const running = localStorage.getItem('scrcpy_running') === 'true';
    return { running };
  },
  start: async (opts: any) => {
    localStorage.setItem('scrcpy_running', 'true');
    return { ok: true, pid: Math.floor(Math.random() * 9000) + 1000 };
  },
  stop: async () => {
    localStorage.setItem('scrcpy_running', 'false');
    return { ok: true };
  }
};

export const hotkeys = {
  fire: async (key: string, steps: any[], serial?: string) => {
    // Delay slightly to simulate hardware ADB tapping speed
    await new Promise(resolve => setTimeout(resolve, 150));
    return { ok: true };
  },
  stream: (callback: (key: string) => void) => {
    // Set up a listener for simulated hotkey presses from external components
    const handleSimulatedKeyPress = (e: CustomEvent) => {
      if (e.detail && e.detail.key) {
        callback(e.detail.key);
      }
    };
    window.addEventListener('simulated_hotkey' as any, handleSimulatedKeyPress);
    return () => {
      window.removeEventListener('simulated_hotkey' as any, handleSimulatedKeyPress);
    };
  }
};

const api = {
  scrcpy,
  hotkeys
};

export default api;
