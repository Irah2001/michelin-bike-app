import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ChallengeCard } from './ChallengeCard';
import type { CollectiveChallenge } from '../../../types';

describe('ChallengeCard Component', () => {
    const mockChallenge: CollectiveChallenge = {
        id: '1',
        typeLabel: 'Défi collectif',
        isLive: true,
        title: '100 000 km en 7 jours',
        currentValue: 67466,
        targetValue: 100000,
        unitLabel: 'kilomètres parcourus',
        stats: {
            percentage: 67,
            timeLeft: '3j 14h',
            ridersCount: 1284,
        }
    };

    it('affiche correctement le défi et formate les grands nombres', () => {
        render(<ChallengeCard challenge={mockChallenge} />);

        expect(screen.getByText('Défi collectif')).toBeInTheDocument();
        expect(screen.getByText('100 000 km en 7 jours')).toBeInTheDocument();
        expect(screen.getByText('kilomètres parcourus')).toBeInTheDocument();

        expect(screen.getByText(/67.*466/)).toBeInTheDocument();

        expect(screen.getByText('67%')).toBeInTheDocument();
        expect(screen.getByText('3j 14h')).toBeInTheDocument();
        expect(screen.getByText('1284')).toBeInTheDocument();
    });

    it('affiche le badge LIVE si isLive est true', () => {
        render(<ChallengeCard challenge={mockChallenge} />);
        expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('masque le badge LIVE si isLive est false', () => {
        const offlineChallenge = { ...mockChallenge, isLive: false };
        render(<ChallengeCard challenge={offlineChallenge} />);
        expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
    });
});