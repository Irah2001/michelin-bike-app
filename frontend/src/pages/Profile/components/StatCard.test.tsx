import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { StatCard } from './StatCard';
import { Clock, Repeat } from 'lucide-react';

describe('StatCard Component', () => {
    it('rend correctement les informations passées en props', () => {
        render(
            <StatCard
                icon={<Clock data-testid="clock-icon" />}
                value="214"
                unit="h"
                label="Temps en selle"
            />
        );

        expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
        expect(screen.getByText('214')).toBeInTheDocument();
        expect(screen.getByText('h')).toBeInTheDocument();
        expect(screen.getByText('Temps en selle')).toBeInTheDocument();
    });

    it('affiche correctement le chiffre 0 (Edge case JavaScript)', () => {
        render(
            <StatCard
                icon={<Repeat data-testid="repeat-icon" />}
                value={0}
                unit="km"
                label="Distance totale"
            />
        );

        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('km')).toBeInTheDocument();
    });
});