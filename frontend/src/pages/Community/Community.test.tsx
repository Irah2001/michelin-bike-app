import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import Community from './Community';

vi.mock('../../services/api', () => ({
  challenges: {
    list: vi.fn().mockResolvedValue({ data: [{
      id: '1', title: '100 000 km en 7 jours', target_km: 100000, current_km: 67466,
      end_date: new Date(Date.now() + 86400000).toISOString(),
      participant_count: 7, created_by: 'amb-id',
    }] }),
  },
  users: {
    getPublicProfile: vi.fn().mockResolvedValue({
      id: 'amb-id', name: 'Paul Seixas', is_ambassador: true,
      level_name: 'Légende', city: 'Mont Ventoux',
      best_distance_km: 28400, best_elevation_m: 412000,
    }),
  },
}));

describe('Community Page', () => {
  it('renders community header', async () => {
    render(<MemoryRouter><Community /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Communautés')).toBeInTheDocument());
  });

  it('renders ambassador name', async () => {
    render(<MemoryRouter><Community /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Paul Seixas')).toBeInTheDocument());
  });
});
