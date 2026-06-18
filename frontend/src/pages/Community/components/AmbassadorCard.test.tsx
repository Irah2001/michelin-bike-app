import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { AmbassadorCard } from './AmbassadorCard';
import type { AmbassadorProfile } from '../../../types';

describe('AmbassadorCard Component', () => {
    const mockAmbassador: AmbassadorProfile = {
        id: '1',
        roleLabel: 'Ambassadeur Michelin',
        isStatsVerified: true,
        name: 'Paul Seixas',
        isVerifiedUser: true,
        description: 'Coureur professionnel',
        stats: {
            seasonKm: '28 400',
            seasonElevation: '412 k',
            membersCount: '1284',
        }
    };

    it('affiche toutes les informations du profil ambassadeur', () => {
        render(<AmbassadorCard ambassador={mockAmbassador} />);

        expect(screen.getByText('Ambassadeur Michelin')).toBeInTheDocument();
        expect(screen.getByText('Paul Seixas')).toBeInTheDocument();
        expect(screen.getByText('Coureur professionnel')).toBeInTheDocument();

        expect(screen.getByText('28 400')).toBeInTheDocument();
        expect(screen.getByText('412 k')).toBeInTheDocument();
        expect(screen.getByText('1284')).toBeInTheDocument();
    });

    it('affiche les badges de vérification quand isStatsVerified et isVerifiedUser sont true', () => {
        render(<AmbassadorCard ambassador={mockAmbassador} />);
        expect(screen.getByText('Stats vérifiées')).toBeInTheDocument();
    });

    it('masque les badges de vérification quand les flags sont false', () => {
        const unverifiedAmbassador = {
            ...mockAmbassador,
            isStatsVerified: false,
            isVerifiedUser: false,
        };
        render(<AmbassadorCard ambassador={unverifiedAmbassador} />);

        expect(screen.queryByText('Stats vérifiées')).not.toBeInTheDocument();
    });
});