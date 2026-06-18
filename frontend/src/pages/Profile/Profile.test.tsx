import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Profile from './Profile';

vi.mock('../../services/api', () => ({
  users: {
    me: vi.fn(),
    leaderboard: vi.fn().mockResolvedValue([]),
  },
  tires: { list: vi.fn().mockResolvedValue([]) },
  sensorData: { list: vi.fn().mockResolvedValue({ data: [] }) },
}));

vi.mock('../../hooks/useProfileData', () => ({
  useProfileData: () => ({
    user: {
      id: '1', initials: 'DN', firstName: 'Damien', lastName: 'Nerriere',
      location: 'Lyon', level: 3, title: 'Endurci', xpCurrent: 12450, xpMax: 15000,
      isCertified: true, sensorType: 'Capteur ESP32',
    },
    stats: { totalDistance: 1124, totalElevation: 13823, maxSpeed: 68.4, timeInSaddle: 42, timeUnit: 'h' },
    badges: [
      { id: '1', iconName: 'Trophy', label: 'Premier 1 000 km', unlocked: true },
      { id: '2', iconName: 'Timer', label: '100 sorties', unlocked: false, progress: 25 },
    ],
    isLoading: false,
  }),
}));

describe('Profile', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
  });

  it('renders user name and level', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Damien Nerriere')).toBeInTheDocument();
      expect(screen.getByText(/NIV. 3/)).toBeInTheDocument();
    });
  });

  it('renders stats correctly', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('1124')).toBeInTheDocument();
      expect(screen.getByText('13823')).toBeInTheDocument();
      expect(screen.getByText('68.4')).toBeInTheDocument();
    });
  });

  it('renders badges section', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByText('Premier 1 000 km')).toBeInTheDocument();
      expect(screen.getByText('1 / 2 débloqués')).toBeInTheDocument();
    });
  });

  it('shows certified badge when user is certified', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Rouleur certifié/)).toBeInTheDocument();
    });
  });

  it('renders regional leaderboard CTA', async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Mon classement régional')).toBeInTheDocument();
    });
  });
});
