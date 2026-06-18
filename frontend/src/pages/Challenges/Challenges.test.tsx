import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Challenges from './Challenges';

vi.mock('../../services/api', () => ({
  challenges: {
    list: vi.fn().mockResolvedValue({ data: [{
      id: '1', title: '100 000 km en 7 jours', target_km: 100000, current_km: 67466,
      end_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      participant_count: 7, is_participant: true, created_by: 'ambassador-id',
    }] }),
    leaderboard: vi.fn().mockResolvedValue([
      { user_id: 'u1', name: 'Théo Lambert', contributed_km: 612, rank: 1 },
      { user_id: 'u2', name: 'Marie Dubois', contributed_km: 587, rank: 2 },
    ]),
    join: vi.fn().mockResolvedValue({}),
  },
  users: {
    me: vi.fn().mockResolvedValue({ id: 'me', name: 'Damien Nerriere', level: 3 }),
    getPublicProfile: vi.fn().mockResolvedValue({
      id: 'ambassador-id', name: 'Paul Seixas', is_ambassador: true,
      level_name: 'Légende', city: 'Mont Ventoux',
      best_distance_km: 28400, best_elevation_m: 412000,
    }),
  },
  tires: { list: vi.fn().mockResolvedValue([{ id: 't1', is_active: true }]) },
}));

describe('Challenges', () => {
  beforeEach(() => { localStorage.setItem('token', 'fake-token'); });

  it('renders challenge title', async () => {
    render(<MemoryRouter><Challenges /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('100 000 km en 7 jours')).toBeInTheDocument());
  });

  it('shows progress percentage', async () => {
    render(<MemoryRouter><Challenges /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('67%')).toBeInTheDocument());
  });

  it('renders ambassador card', async () => {
    render(<MemoryRouter><Challenges /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Paul Seixas')).toBeInTheDocument());
  });

  it('renders leaderboard members', async () => {
    render(<MemoryRouter><Challenges /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Théo Lambert')).toBeInTheDocument());
  });

  it('shows enrolled state', async () => {
    render(<MemoryRouter><Challenges /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Inscrit/)).toBeInTheDocument());
  });
});
