import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SensorSnap {
  time: string;
  sensor_id: string;
  pressure: number;
  temperature: number;
  battery_pct: number;
}

interface SensorReadingEvent {
  front: SensorSnap;
  rear: SensorSnap;
}

interface RideReadingEvent {
  time: string;
  ride_id: string;
  lat: number;
  lng: number;
  distance_km: number;
  elevation_m: number;
  duration_s: number;
}

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function BatteryBar({ pct }: { pct: number }) {
  const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-gray-700">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-300">{pct.toFixed(1)}%</span>
    </div>
  );
}

function SensorCard({ label, data }: { label: string; data: SensorSnap | null }) {
  return (
    <div className="rounded-xl bg-gray-800 p-4 flex flex-col gap-3 min-w-[180px]">
      <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">{label}</p>
      {data ? (
        <>
          <div>
            <p className="text-3xl font-bold text-white">{data.pressure.toFixed(2)}</p>
            <p className="text-xs text-gray-400">bar</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-orange-400">{data.temperature.toFixed(1)}°C</p>
            <p className="text-xs text-gray-400">température</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">batterie</p>
            <BatteryBar pct={data.battery_pct} />
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">En attente…</p>
      )}
    </div>
  );
}

export function SensorDashboard() {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001';
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rideId, setRideId] = useState<string | null>(null);
  const [sensors, setSensors] = useState<SensorReadingEvent | null>(null);
  const [ride, setRide] = useState<RideReadingEvent | null>(null);

  useEffect(() => {
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('sensor_reading', (data: SensorReadingEvent) => setSensors(data));
    socket.on('ride_reading', (data: RideReadingEvent) => setRide(data));
    return () => { socket.disconnect(); };
  }, [backendUrl]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/simulator/start`, { method: 'POST' });
      const json = (await res.json()) as { rideId: string };
      setRideId(json.rideId);
      setRunning(true);
      setSensors(null);
      setRide(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await fetch(`${backendUrl}/simulator/stop`, { method: 'POST' });
      setRunning(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Capteurs ESP32</h2>
          {rideId && (
            <p className="mt-1 text-xs text-gray-500 font-mono">ride: {rideId}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
          <span className="text-gray-400">{connected ? 'WebSocket connecté' : 'WebSocket déconnecté'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-8 flex gap-3">
        <button
          onClick={() => void handleStart()}
          disabled={running || loading}
          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white shadow hover:bg-green-500 disabled:opacity-40 transition-colors"
        >
          ▶ Démarrer
        </button>
        <button
          onClick={() => void handleStop()}
          disabled={!running || loading}
          className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white shadow hover:bg-red-500 disabled:opacity-40 transition-colors"
        >
          ■ Arrêter
        </button>
      </div>

      {/* Sensor cards */}
      <div className="mb-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">Pneus</h3>
        <div className="flex gap-4 flex-wrap">
          <SensorCard label="Avant" data={sensors?.front ?? null} />
          <SensorCard label="Arrière" data={sensors?.rear ?? null} />
        </div>
      </div>

      {/* Ride stats */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">Trajet</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Distance" value={ride ? `${ride.distance_km.toFixed(2)} km` : '—'} />
          <Stat label="Dénivelé" value={ride ? `${ride.elevation_m.toFixed(0)} m` : '—'} />
          <Stat label="Durée" value={ride ? fmt(ride.duration_s) : '—'} mono />
          <Stat
            label="GPS"
            value={ride ? `${ride.lat.toFixed(5)}, ${ride.lng.toFixed(5)}` : '—'}
            mono
            small
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono = false,
  small = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl bg-gray-800 p-4">
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest">{label}</p>
      <p className={`font-semibold text-white truncate ${mono ? 'font-mono' : ''} ${small ? 'text-sm' : 'text-xl'}`}>
        {value}
      </p>
    </div>
  );
}
