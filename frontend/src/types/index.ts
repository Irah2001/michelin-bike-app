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
  avatarUrl?: string;
  levelImage?: string;
}

export interface UserStats {
  totalDistance: number;
  totalElevation: number;
  maxSpeed: number;
  timeInSaddle: number;
  timeUnit?: string;
}

export interface Badge {
  id: string;
  iconName: string;
  label: string;
  description?: string;
  unlocked: boolean;
  progress?: number;
  current?: number;
  target?: number;
  unit?: string;
}

export interface AmbassadorProfile {
  id: string;
  roleLabel: string;
  isStatsVerified: boolean;
  name: string;
  isVerifiedUser: boolean;
  description: string;
  stats: {
    seasonKm: string;
    seasonElevation: string;
    membersCount: string;
  };
}

export interface CollectiveChallenge {
  id: string;
  typeLabel: string;
  isLive: boolean;
  title: string;
  currentValue: number;
  targetValue: number;
  unitLabel: string;
  stats: {
    percentage: number;
    timeLeft: string;
    ridersCount: number;
  };
}
