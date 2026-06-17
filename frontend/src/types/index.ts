export interface UserProfile {
  id: string;
  initials: string;
  firstName: string;
  lastName: string;
  location: string;
  level: number;
  title: string;
  xpCurrent: number;
  xpMax: number;
  isCertified: boolean;
  badge?: string;
  sensorType: string;
}

export interface UserStats {
  totalDistance: number;
  totalElevation: number;
  maxSpeed: number;
  timeInSaddle: number;
}

export interface Badge {
  id: string;
  iconName: string;
  label: string;
  unlocked: boolean;
}