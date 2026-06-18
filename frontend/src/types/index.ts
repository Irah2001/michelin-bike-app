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
  name: string;
  is_ambassador: boolean;
  level_name: string;
  city?: string;
  region?: string;
  best_distance_km: number;
  best_elevation_m: number;
  roleLabel: string;
  isStatsVerified: boolean;
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
  current_km: number;
  target_km: number;
  end_date: string;
  participant_count: number;
  is_participant: boolean;
  currentValue: number;
  targetValue: number;
  unitLabel: string;
  stats: {
    percentage: number;
    timeLeft: string;
    ridersCount: number;
  };
}

export interface ApiChallenge {
  id: string;
  title: string;
  current_km: number;
  target_km: number;
  end_date: string;
  participant_count: number;
  is_participant: boolean;
  created_by?: string;
}
