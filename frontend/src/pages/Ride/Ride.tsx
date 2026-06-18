import { useEffect, useState, useRef } from 'react';
import { RefreshCw, Loader2, Bike, Clock, Mountain, Gauge, Activity, Thermometer, Battery, Radio } from 'lucide-react';
import { sensorData } from '../../services/api';
import { io, Socket } from 'socket.io-client';
import { PageWrapper } from '../../components/ui/PageWrapper';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function Ride() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Live sensor state
  const [simRunning, setSimRunning] = useState(false);
  const [sensorLive, setSensorLive] = useState<any>(null);
  const [rideLive, setRideLive] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('sensor_reading', (data: any) => { setSensorLive(data); setSimRunning(true); });
    socket.on('ride_reading', (data: any) => setRideLive(data));
    return () => { socket.disconnect(); };
  }, []);

  const toggleSimulator = async () => {
    try {
      if (simRunning) {
        await fetch(`${API}/simulator/stop`, { method: 'POST' });
        setSimRunning(false);
        setTimeout(() => fetchRides(1), 1000);
      } else {
        const token = localStorage.getItem('token');
        let userId: string | undefined;
        if (token) {
          try { userId = JSON.parse(atob(token.split('.')[1])).sub; } catch {}
        }
        await fetch(`${API}/simulator/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        setSimRunning(true);
        setSensorLive(null);
        setRideLive(null);
      }
    } catch (e) { console.error(e); }
  };

  const fetchRides = (p = 1) => {
    setLoading(true);
    sensorData.list({ page: p, limit: 10 })
      .then(res => { setRides(res?.data || []); setTotal(res?.total || 0); setPage(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRides(); }, []);

  const handleSync = () => {
    setSyncing(true);
    sensorData.sync()
      .then(() => fetchRides(1))
      .catch(console.error)
      .finally(() => setSyncing(false));
  };

  return (
    <PageWrapper>
    <div className="p-6 flex flex-col gap-6">
      {/* Live Sensor Panel */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Radio size={16} className={simRunning ? 'text-green-400 animate-pulse' : 'text-slate-500'} />
            Capteur ESP32
          </h2>
          <button onClick={toggleSimulator} className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${simRunning ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-[#FCE500] text-black'}`}>
            {simRunning ? '⏹ Stop' : '▶ Simuler une sortie'}
          </button>
        </div>

        {simRunning && sensorLive ? (
          <div className="grid grid-cols-3 gap-2">
            <LiveStat icon={<Activity size={14} />} label="Pression AV" value={`${sensorLive.front?.pressure?.toFixed(1) || '—'}`} unit="bar" />
            <LiveStat icon={<Activity size={14} />} label="Pression AR" value={`${sensorLive.rear?.pressure?.toFixed(1) || '—'}`} unit="bar" />
            <LiveStat icon={<Thermometer size={14} />} label="Temp AV" value={`${sensorLive.front?.temperature?.toFixed(0) || '—'}`} unit="°C" />
            <LiveStat icon={<Thermometer size={14} />} label="Temp AR" value={`${sensorLive.rear?.temperature?.toFixed(0) || '—'}`} unit="°C" />
            <LiveStat icon={<Battery size={14} />} label="Batterie" value={`${sensorLive.front?.battery_pct?.toFixed(0) || '—'}`} unit="%" />
            <LiveStat icon={<Gauge size={14} />} label="Distance" value={`${rideLive?.distance_km?.toFixed(2) || '0'}`} unit="km" />
          </div>
        ) : simRunning ? (
          <p className="text-xs text-slate-400 text-center py-2">En attente de données capteur...</p>
        ) : (
          <p className="text-xs text-slate-500 text-center py-2">Lancez la simulation pour voir les remontées capteur en temps réel (toutes les 2s)</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes sorties</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-[#FCE500] text-black px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sync...' : 'Sync Strava'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#FCE500]" size={32} /></div>
      ) : rides.length === 0 ? (
        <p className="text-slate-400 text-center py-12">Aucune sortie. Synchronisez Strava ou utilisez le simulateur.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rides.map((r: any) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-medium text-slate-200">{new Date(r.recorded_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-300">{r.source || 'sensor'}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <MiniStat icon={<Bike size={14} />} value={`${r.distance_km?.toFixed(1)}`} unit="km" />
                <MiniStat icon={<Gauge size={14} />} value={`${r.avg_speed?.toFixed(0) || '—'}`} unit="km/h" />
                <MiniStat icon={<Mountain size={14} />} value={`${Math.round(r.elevation_m || 0)}`} unit="m" />
                <MiniStat icon={<Clock size={14} />} value={`${r.duration_seconds ? Math.round(r.duration_seconds / 60) : '—'}`} unit="min" />
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => fetchRides(page - 1)} className="px-3 py-1 bg-white/10 rounded-lg text-sm disabled:opacity-30">←</button>
          <span className="text-sm text-slate-400">Page {page}</span>
          <button disabled={rides.length < 10} onClick={() => fetchRides(page + 1)} className="px-3 py-1 bg-white/10 rounded-lg text-sm disabled:opacity-30">→</button>
        </div>
      )}
    </div>
    </PageWrapper>
  );
}

function MiniStat({ icon, value, unit }: { icon: React.ReactNode; value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[#FCE500]">{icon}</span>
      <span className="text-sm font-bold">{value}</span>
      <span className="text-[10px] text-slate-400">{unit}</span>
    </div>
  );
}

function LiveStat({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[#FCE500] mb-1">{icon}</div>
      <p className="text-sm font-bold">{value}<span className="text-[10px] text-slate-400 ml-0.5">{unit}</span></p>
      <p className="text-[9px] text-slate-500">{label}</p>
    </div>
  );
}
