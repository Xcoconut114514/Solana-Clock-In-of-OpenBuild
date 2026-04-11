export enum UserState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTED = 'CONNECTED',
  STAKED = 'STAKED'
}

export interface DayStatus {
  day: number;
  date: string;
  status: 'completed' | 'missed' | 'current' | 'future';
}

export interface BootcampStats {
  totalPool: number;
  participants: number;
  daysRemaining: number;
}