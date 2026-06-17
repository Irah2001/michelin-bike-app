import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import Profile from './Profile';
import type { UserProfile, UserStats } from '../../types';

import { useProfileData } from '../../hooks/useProfileData';
import { MOCK_BADGES } from '../../constants';

vi.mock('../../hooks/useProfileData', () => ({
    useProfileData: vi.fn(),
}));

vi.mock('../../constants', () => ({
    PROFILE_TABS: ['Semaine', 'Mois', 'Saison', 'All-time'],
    MOCK_BADGES: [
        { id: '1', iconName: 'Trophy', label: 'Premier 1 000 km', unlocked: true },
        { id: '2', iconName: 'Timer', label: 'Nocturne', unlocked: true },
        { id: '3', iconName: 'ShieldCheck', label: 'Grimpeur', unlocked: false },
        { id: '4', iconName: 'Mountain', label: 'Explorateur', unlocked: true },
        { id: '5', iconName: 'Zap', label: 'Sprinteur', unlocked: false },
        { id: '6', iconName: 'Repeat', label: 'Régulier', unlocked: true },
    ],
}));

const mockUser = {
    initials: 'CR',
    location: 'Lyon • Auvergne-Rhône-Alpes',
    level: 3,
    title: 'Rouleur certifié',
    badge: 'Rouleur certifié',
    sensorType: 'Capteur de puissance',
    xpCurrent: 830,
    xpMax: 1000,
};

const mockStats = {
    totalDistance: '4 287',
    totalElevation: '52 140',
    maxSpeed: '68.5',
    timeInSaddle: '214',
};

describe('Profile Component', () => {
    const mockedUseProfileData = vi.mocked(useProfileData);

    beforeEach(() => {
        mockedUseProfileData.mockReturnValue({
            user: mockUser as unknown as UserProfile,
            stats: mockStats as unknown as UserStats,
            isLoading: false,
        });
    });

    it('renders without crashing', () => {
        render(<Profile />);
        expect(screen.getByText('Mon profil')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        mockedUseProfileData.mockReturnValue({
            user: null,
            stats: null,
            isLoading: true,
        });

        const { container } = render(<Profile />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();

        expect(screen.queryByText('Mon profil')).not.toBeInTheDocument();
    });

    it('renders all tabs and changes active tab on click', () => {
        render(<Profile />);

        const semaineTab = screen.getByText('Semaine');
        const allTimeTab = screen.getByText('All-time');

        expect(semaineTab).toBeInTheDocument();
        expect(screen.getByText('Mois')).toBeInTheDocument();
        expect(screen.getByText('Saison')).toBeInTheDocument();
        expect(allTimeTab).toBeInTheDocument();

        expect(allTimeTab).toHaveClass('bg-[#FCE500]');
        expect(semaineTab).not.toHaveClass('bg-[#FCE500]');

        fireEvent.click(semaineTab);

        expect(semaineTab).toHaveClass('bg-[#FCE500]');
        expect(allTimeTab).not.toHaveClass('bg-[#FCE500]');
    });

    it('renders statistics correctly', () => {
        render(<Profile />);
        expect(screen.getByText(mockStats.totalDistance)).toBeInTheDocument();
        expect(screen.getByText('Distance totale')).toBeInTheDocument();

        expect(screen.getByText(mockStats.totalElevation)).toBeInTheDocument();
        expect(screen.getByText('Dénivelé cumulé')).toBeInTheDocument();
    });

    it('renders badges section correctly', () => {
        render(<Profile />);
        expect(screen.getByText('Badges')).toBeInTheDocument();

        const unlockedBadgesCount = MOCK_BADGES.filter(b => b.unlocked).length;
        expect(screen.getByText(`${unlockedBadgesCount} / ${MOCK_BADGES.length} débloqués`)).toBeInTheDocument();

        expect(screen.getByText('Premier 1 000 km')).toBeInTheDocument();
        expect(screen.getByText('Grimpeur')).toBeInTheDocument();
    });
});