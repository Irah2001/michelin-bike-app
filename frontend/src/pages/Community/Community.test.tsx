import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import Community from './Community';

describe('Community Page', () => {
    it('affiche le header de la page', () => {
        render(<Community />);

        expect(screen.getByText('Communautés')).toBeInTheDocument();
    });

    it('rend les composants enfants avec les données mockées', () => {
        render(<Community />);

        expect(screen.getByText('Paul Seixas')).toBeInTheDocument();
        expect(screen.getByText('100 000 km en 7 jours')).toBeInTheDocument();
    });
});