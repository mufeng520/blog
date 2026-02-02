export interface Timer {
    project: string;
    alliance: string;
    startTime: string;
    createdAt: string;
  }
  
  export interface RemainingTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    currentPhase: 1 | 2;
    phaseRemaining: number;
    phaseHours: number;
    phaseMinutes: number;
    phaseSeconds: number;
    phaseProgress: number;
    totalRemaining: number;
    totalCycleSeconds: number;
    currentCycle: number;
    elapsedInCurrentCycle: number;
    formatted: string;
    phaseFormatted: string;
  }
  
  export type FilterType = 'all' | 'phase1' | 'phase2';