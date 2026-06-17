import type { Badge } from '../types';

export const PROFILE_TABS = ['Semaine', 'Mois', 'Saison', 'All-time'] as const;

export const MOCK_BADGES: Badge[] = [
  { id: '1', iconName: 'Trophy', label: 'Premier 1 000 km', unlocked: true },
  { id: '2', iconName: 'Timer', label: '100 sorties', unlocked: true },
  { id: '3', iconName: 'ShieldCheck', label: '1 an équipé', unlocked: true },
  { id: '4', iconName: 'Mountain', label: 'Défi Ventoux', unlocked: true },
  { id: '5', iconName: 'Zap', label: 'Nocturne', unlocked: false },
  { id: '6', iconName: 'Repeat', label: '5 000 km', unlocked: false },
];