// BadgeCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { BadgeCard } from './BadgeCard';
import { Trophy } from 'lucide-react';

describe('BadgeCard Component', () => {

    it('rend un badge débloqué correctement (Jaune, sans cadenas)', () => {
        render(<BadgeCard icon={<Trophy data-testid="trophy-icon" />} label="Test Badge" unlocked={true} />);

        expect(screen.getByText('Test Badge')).toBeInTheDocument();
        expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();

        expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument();

        const badgeContainer = screen.getByTestId('badge-card-container');
        expect(badgeContainer).toHaveClass('border-[#FCE500]/40');
        expect(badgeContainer).toHaveClass('text-[#FCE500]');

        expect(badgeContainer).not.toHaveClass('opacity-60');
    });

    it('rend un badge bloqué correctement (Gris, avec cadenas)', () => {
        render(<BadgeCard icon={<Trophy data-testid="trophy-icon" />} label="Locked Badge" unlocked={false} />);

        expect(screen.getByText('Locked Badge')).toBeInTheDocument();

        expect(screen.getByTestId('lock-icon')).toBeInTheDocument();

        const badgeContainer = screen.getByTestId('badge-card-container');
        expect(badgeContainer).toHaveClass('border-white/10');
        expect(badgeContainer).toHaveClass('text-slate-500');
        expect(badgeContainer).toHaveClass('opacity-60');

        expect(badgeContainer).not.toHaveClass('border-[#FCE500]/40');
    });
});