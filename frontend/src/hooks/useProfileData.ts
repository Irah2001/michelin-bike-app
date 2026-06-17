import { useState, useEffect } from 'react';
import type { UserProfile, UserStats } from '../types';

export function useProfileData() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setUser({
        id: '123',
        initials: 'CR',
        firstName: 'Camille',
        lastName: 'Roussel',
        location: 'Lyon • Auvergne-Rhône-Alpes',
        level: 3,
        title: 'Endurci',
        xpCurrent: 12450,
        xpMax: 15000,
        isCertified: true,
        badge: 'Rouleur certifié',
        sensorType: 'Capteur ESP32',
      });

      setStats({
        totalDistance: 4287,
        totalElevation: 52140,
        maxSpeed: 68.4,
        timeInSaddle: 214,
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  return { user, stats, isLoading };
}