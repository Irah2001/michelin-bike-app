import { useState, useEffect } from 'react';
import type { UserProfile, UserStats, Badge } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

type Period = 'Semaine' | 'Mois' | 'Saison' | 'All-time';

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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${BACKEND_URL}/users/me`, { headers }).then(r => r.json()),
      fetch(`${BACKEND_URL}/sensor-data?limit=100${getSinceDate(period) ? `&since=${getSinceDate(period)}` : ''}`, { headers }).then(r => r.json()),
      fetch(`${BACKEND_URL}/users/me/badges`, { headers }).then(r => r.json()),
    ])
      .then(([profile, sensorData, allBadges]) => {
        const names = profile.name?.split(' ') || ['?'];
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
          (Array.isArray(allBadges) ? allBadges : []).map((b: any) => ({
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

        const records = sensorData?.data || [];
        const totalDist = records.reduce((s: number, r: any) => s + r.distance_km, 0);
        const totalElev = records.reduce((s: number, r: any) => s + (r.elevation_m || 0), 0);
        const maxSpd = Math.max(0, ...records.map((r: any) => r.max_speed || 0));
        const totalTime = records.reduce((s: number, r: any) => s + (r.duration_seconds || 0), 0);

        setStats({
          totalDistance: Math.round(totalDist * 10) / 10,
          totalElevation: Math.round(totalElev),
          maxSpeed: Math.round(maxSpd * 10) / 10,
          timeInSaddle: Math.round(totalTime / 3600),
        });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [period]);

  return { user, stats, badges, isLoading };
}
