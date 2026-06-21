export interface PerformanceData {
  time: string;
  fps: number;
  ping: number;
  cpu: number;
}

export type AIStrategy = 'aggressive' | 'defensive' | 'balanced' | 'evasive';

export interface AIState {
  isActive: boolean;
  strategy: AIStrategy;
  confidence: number;
  targetAcquired: boolean;
  logs: string[];
}

export type InputType = 'joystick' | 'button' | 'swipe';

export interface InputMap {
  id: string;
  type: InputType;
  x: number;
  y: number;
  label: string;
  size: number;
}

export interface MacroStep {
  type: 'tap' | 'swipe';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  duration?: number;
  delay: number;
}

export interface HotkeyMacro {
  id: string;
  key: string;
  label: string;
  color: string;
  description: string;
  steps: MacroStep[];
}
