import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserCard } from './UserCard';
import { describe, it, expect } from 'vitest';

describe('UserCard Component', () => {
    const mockUser = {
        id: '123',
        initials: 'CR',
        firstName: 'Camille',
        lastName: 'Roussel',
        location: 'Lyon • Auvergne-Rhône-Alpes',
        level: 3,
        title: 'Endurci',
        isCertified: true,
        sensorType: 'Capteur de puissance',
        xpCurrent: 830,
        xpMax: 1000,
    };

    it('affiche correctement tous les détails de l\'utilisateur', () => {
        render(<UserCard user={mockUser} />);

        expect(screen.getByText('CR')).toBeInTheDocument();
        expect(screen.getByText('Camille Roussel')).toBeInTheDocument();
        expect(screen.getByText(/Lyon • Auvergne-Rhône-Alpes/)).toBeInTheDocument();

        expect(screen.getByText(/NIV. 3/)).toBeInTheDocument();
        const titleElements = screen.getAllByText(/Endurci/);
        expect(titleElements).toHaveLength(2);
        expect(titleElements[0]).toBeInTheDocument();

        expect(screen.getByText(/Rouleur certifié/)).toBeInTheDocument();
        expect(screen.getByText(/Capteur de puissance/)).toBeInTheDocument();

        expect(screen.getByText(/830 \/ 1000 XP/)).toBeInTheDocument();
    });
});