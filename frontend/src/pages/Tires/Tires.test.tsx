import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Tires from './Tires';

vi.mock('../../services/api', () => ({
  tires: {
    list: vi.fn().mockResolvedValue([
      { id: 't1', position: 'rear', total_km: 2310, wear_score: 54, is_active: true, catalog: { name: 'Michelin Power Cup', usage_type: 'road' } },
      { id: 't2', position: 'front', total_km: 1850, wear_score: 63, is_active: true, catalog: { name: 'Michelin Power Cup', usage_type: 'road' } },
    ]),
    readings: vi.fn().mockResolvedValue({ sensor_readings: [] }),
    create: vi.fn(),
  },
  catalog: { list: vi.fn().mockResolvedValue([{ id: 'c1', name: 'Michelin Power Cup', usage_type: 'road' }]) },
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({ on: vi.fn(), disconnect: vi.fn() })),
}));

vi.mock('leaflet', () => ({
  default: { map: vi.fn(() => ({ setView: vi.fn().mockReturnThis(), remove: vi.fn() })), tileLayer: vi.fn(() => ({ addTo: vi.fn() })), circleMarker: vi.fn(() => ({ addTo: vi.fn() })) },
  map: vi.fn(() => ({ setView: vi.fn().mockReturnThis(), remove: vi.fn() })),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  circleMarker: vi.fn(() => ({ addTo: vi.fn() })),
}));

describe('Tires', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
  });

  it('renders tire list with names', async () => {
    render(<Tires />);
    await waitFor(() => {
      const cups = screen.getAllByText('Michelin Power Cup');
      expect(cups.length).toBe(2);
    });
  });

  it('shows sensor status bar', async () => {
    render(<Tires />);
    await waitFor(() => {
      expect(screen.getByText('2 capteurs connectés')).toBeInTheDocument();
    });
  });

  it('shows wear percentage in tire cards', async () => {
    render(<Tires />);
    await waitFor(() => {
      expect(screen.getByText('Usure 46%')).toBeInTheDocument();
      expect(screen.getByText('Usure 37%')).toBeInTheDocument();
    });
  });

  it('opens detail view on tire click', async () => {
    render(<Tires />);
    await waitFor(() => screen.getAllByText('Michelin Power Cup'));
    const cards = screen.getAllByText('Michelin Power Cup');
    fireEvent.click(cards[0].closest('[class*="cursor-pointer"]')!);
    await waitFor(() => {
      expect(screen.getByText('Capteur ESP32')).toBeInTheDocument();
    });
  });
});
