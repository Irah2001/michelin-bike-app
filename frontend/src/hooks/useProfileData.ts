import { useState, useEffect } from 'react';
import type { UserProfile, UserStats, Badge } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

type Period = 'Semaine' | 'Mois' | 'Saison' | 'All-time';

interface SensorRecord {
  distance_km: number;
  elevation_m: number | null;
  avg_speed: number | null;
  max_speed: number | null;
  duration_seconds: number | null;
}

interface ApiBadge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  current: number;
  target: number;
  unit: string;
}

function getSinceDate(period: Period): string | undefined {
  const now = new Date();
  switch (period) {
    case 'Semaine': return new Date(now.getTime() - 7 * 24 * 3600000).toISOString();
    case 'Mois': return new Date(now.getTime() - 30 * 24 * 3600000).toISOString();
    case 'Saison': return new Date(now.getTime() - 90 * 24 * 3600000).toISOString();
    default: return undefined;
  }
}

export function useProfileData(period: Period = 'All-time') {
  const hasToken = Boolean(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(hasToken);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    let cancelled = false;

    const fetchData = async () => {
      try {
        const since = getSinceDate(period);
        const [profileRes, sensorRes, badgesRes] = await Promise.all([
          fetch(`${BACKEND_URL}/users/me`, { headers }),
          fetch(`${BACKEND_URL}/sensor-data?limit=100${since ? `&since=${since}` : ''}`, { headers }),
          fetch(`${BACKEND_URL}/users/me/badges`, { headers }),
        ]);

        const profile = await profileRes.json();
        const sensorData = await sensorRes.json();
        const allBadges = await badgesRes.json();

        if (cancelled) return;

        const names: string[] = profile.name?.split(' ') || ['?'];
        const initials = names.map((n: string) => n[0]?.toUpperCase()).join('').slice(0, 2);

        const levelThresholds = [0, 2000, 5000, 10000, 20000, 50000];
        const currentLevelXp = levelThresholds[profile.level - 1] || 0;
        const nextLevelXp = levelThresholds[profile.level] || 50000;

        setUser({
          id: profile.id,
          initials,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          location: [profile.city, profile.region, profile.country].filter(Boolean).join(' • '),
          level: profile.level,
          title: profile.level_name,
          xpCurrent: profile.xp - currentLevelXp,
          xpMax: nextLevelXp - currentLevelXp,
          isCertified: profile.is_ambassador,
          badge: profile.level_name,
          sensorType: 'Capteur ESP32',
          avatarUrl: profile.avatar_url,
        });

        setBadges(
          (Array.isArray(allBadges) ? allBadges : []).map((b: ApiBadge) => ({
            id: b.id,
            iconName: 'Trophy',
            label: b.name,
            description: b.description,
            unlocked: b.unlocked,
            progress: b.progress || 0,
            current: b.current,
            target: b.target,
            unit: b.unit,
          }))
        );

        const records: SensorRecord[] = sensorData?.data || [];
        const totalDist = records.reduce((s, r) => s + r.distance_km, 0);
        const totalElev = records.reduce((s, r) => s + (r.elevation_m || 0), 0);
        const maxSpd = Math.max(0, ...records.map(r => r.max_speed || r.avg_speed || 0));
        const totalTime = records.reduce((s, r) => s + (r.duration_seconds || 0), 0);

        setStats({
          totalDistance: Math.round(totalDist * 10) / 10,
          totalElevation: Math.round(totalElev),
          maxSpeed: Math.round(maxSpd * 10) / 10,
          timeInSaddle: totalTime >= 3600 ? Math.round((totalTime / 3600) * 10) / 10 : Math.round(totalTime / 60),
          timeUnit: totalTime >= 3600 ? 'h' : 'min',
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [period]);

  return { user, stats, badges, isLoading };
}
