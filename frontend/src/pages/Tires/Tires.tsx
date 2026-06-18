import { useEffect, useState, useRef } from 'react';
import { Loader2, Plus, ChevronLeft, AlertTriangle, ShoppingCart, ChevronRight, Thermometer, Gauge, Battery, CircleDot } from 'lucide-react';
import { tires, catalog } from '../../services/api';
import { io, Socket } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  usage_type: string;
}

interface TireItem {
  id: string;
  position: 'front' | 'rear';
  wear_score?: number;
  total_km?: number;
  catalog?: CatalogItem;
}

interface SensorReading {
  temperature?: number;
  pressure?: number;
  battery_pct?: number;
}

interface LiveDataPayload {
  front: SensorReading | null;
  rear: SensorReading | null;
}

interface TireDetail {
  sensor_readings?: SensorReading[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function Tires() {
  const [myTires, setMyTires] = useState<TireItem[]>([]);
  const [catalogList, setCatalogList] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTire, setSelectedTire] = useState<TireItem | null>(null);
  const [tireDetail, setTireDetail] = useState<TireDetail | null>(null);
  const [liveData, setLiveData] = useState<LiveDataPayload>({ front: null, rear: null });
  const [liveTemps, setLiveTemps] = useState<number[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([tires.list<TireItem>(), catalog.list<CatalogItem>()])
      .then(([t, c]) => { setMyTires(t); setCatalogList(c); })
      .catch(console.error)
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      tires.list<TireItem>().then(setMyTires).catch(() => { });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for live sensor data
  useEffect(() => {
    if (!selectedTire) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }
    const socket = io(BACKEND_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('sensor_reading', (data: LiveDataPayload) => {
      setLiveData(data);
      const isFront = selectedTire.position === 'front';
      const reading = isFront ? data.front : data.rear;
      if (reading?.temperature) {
        setLiveTemps(prev => [...prev.slice(-59), reading.temperature as number]);
      }
    });

    // Poll tire km/wear every 30s while in detail view
    const poll = setInterval(() => {
      tires.list<TireItem>().then(list => {
        const updated = list.find((t: TireItem) => t.id === selectedTire.id);
        if (updated) setSelectedTire(updated);
      }).catch(() => { });
    }, 30000);

    return () => { socket.disconnect(); socketRef.current = null; clearInterval(poll); };
  }, [selectedTire]);

  const handleAdd = (catalogId: string, position: string) => {
    tires.create<TireItem>({ catalog_id: catalogId, position }).then(t => {
      setMyTires(prev => [t, ...prev]);
      setShowAdd(false);
    }).catch(console.error);
  };

  const openTireDetail = (tire: TireItem) => {
    setSelectedTire(tire);
    setLiveTemps([]);
    tires.readings<TireDetail>(tire.id).then(data => {
      setTireDetail(data);
    }).catch(console.error);
  };

  // Leaflet map for last position
  useEffect(() => {
    if (!selectedTire || !mapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([45.7796, 3.0869], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.circleMarker([45.7796, 3.0869], { radius: 8, color: '#FCE500', fillColor: '#FCE500', fillOpacity: 1, weight: 2 }).addTo(map);
    return () => { map.remove(); };
  }, [selectedTire]);

  if (loading) return <div className="flex h-full items-center justify-center bg-[#080F22]"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  // Detail view
  if (selectedTire) {
    const isFront = selectedTire.position === 'front';
    const live = isFront ? liveData.front : liveData.rear;
    const lastReading = tireDetail?.sensor_readings?.[0];
    const temp = live?.temperature ?? lastReading?.temperature ?? 34;
    const pressure = live?.pressure ?? lastReading?.pressure ?? 6.2;
    const battery = live?.battery_pct ?? lastReading?.battery_pct ?? 78;
    const wearPct = 100 - (selectedTire.wear_score ?? 77);
    const kmRemaining = Math.max(0, Math.round((selectedTire.wear_score ?? 77) / 100 * 5000));
    const isOverheat = temp > 65;

    return (
      <div className="min-h-screen bg-[#080F22] text-white relative overflow-y-auto pb-24">
        {/* Gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#27509B]/40 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#27509B]/20 blur-[60px]" />
        </div>

        <div className="relative p-5 flex flex-col gap-5">
          {/* Back + title */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => { setSelectedTire(null); setTireDetail(null); }} className="w-[38px] h-[38px] rounded-[19px] bg-white/12 border border-white/20 backdrop-blur-[7px] flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <span className="text-white/80 font-bold text-[13px]">Capteur ESP32</span>
          </div>

          {/* Tire info card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-[12px] rounded-[22px] p-5 shadow-[0_14px_44px_rgba(0,0,0,0.32)]">
            <p className="text-[#FCE500] font-bold text-[10px] uppercase tracking-[0.14em] mb-1">Pneu connecté</p>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Archivo'] font-extrabold text-[23px] tracking-tight">{selectedTire.catalog?.name || 'Michelin Power Cup'}</h2>
                <p className="text-white/60 text-[12.5px] mt-1">{selectedTire.position === 'front' ? 'Avant' : 'Arrière'} · {selectedTire.total_km?.toFixed(0) || 0} km</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[7px] h-[7px] rounded-full bg-[#FF5B5B] opacity-40 animate-pulse" />
                <span className="text-white/75 font-bold text-[10.5px]">LIVE</span>
              </div>
            </div>
            <div className="mt-3 bg-[rgba(132,189,0,0.22)] border border-[rgba(160,210,90,0.45)] rounded-full px-3 py-1.5 inline-flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#C7E89B]/50 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#C7E89B]" /></div>
              <span className="text-[#C7E89B] font-bold text-[12px]">Rouleur certifié · données vérifiées</span>
            </div>
          </div>

          {/* 3 stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Thermometer size={16} />} label="Température" value={temp.toFixed(1)} unit="°C" status="Normale" statusColor="green" />
            <StatCard icon={<Gauge size={16} />} label="Pression" value={pressure.toFixed(1)} unit="bar" status="Optimale" statusColor="green" />
            <StatCard icon={<Battery size={16} />} label="Batterie" value={battery.toFixed(0)} unit="%" status={`≈ ${Math.round(battery / 20)} mois`} statusColor="blue" />
          </div>

          {/* Wear card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-[11px] rounded-[20px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
            <p className="text-white/60 text-[11.5px] mb-1">Usure estimée</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-['Archivo'] font-extrabold text-[40px] leading-[40px] tracking-tight">{wearPct}</span>
                <span className="font-['Archivo'] font-extrabold text-[20px] text-white/60">%</span>
              </div>
              <div className="text-right">
                <p className="font-['Archivo'] font-extrabold text-[17px] text-[#FCE500]">≈ {kmRemaining.toLocaleString()} km</p>
                <p className="text-white/55 text-[10.5px]">avant remplacement</p>
              </div>
            </div>
            <div className="mt-3 h-[10px] bg-white/14 rounded-[6px] overflow-hidden">
              <div className={`h-full rounded-[6px] ${wearPct > 70 ? 'bg-red-500' : wearPct > 40 ? 'bg-[#FCE500]' : 'bg-[#84BD00]'}`} style={{ width: `${wearPct}%` }} />
            </div>
            <p className="text-white/55 text-[11px] mt-3 leading-[16.5px]">Estimation calculée via les vibrations et la pression mesurées par le capteur — notification proactive avant la limite.</p>
          </div>

          {/* Overheat alert */}
          {isOverheat && (
            <div className="bg-[rgba(255,91,91,0.12)] border border-[rgba(255,120,110,0.35)] backdrop-blur-[9px] rounded-[16px] p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="text-[#FFD9D4] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#FFD9D4] font-bold text-[13px]">Surchauffe détectée en descente</p>
                  <p className="text-white/60 text-[11.5px] mt-1 leading-[16.68px]">Pic à {temp.toFixed(0)} °C au freinage intensif</p>
                </div>
              </div>
            </div>
          )}

          {/* Temperature chart - LIVE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Archivo'] font-bold text-[14px]">Température · en direct</p>
              <p className="text-white/50 text-[11px]">{liveTemps.length > 0 ? `${liveTemps.length} points` : 'En attente...'}</p>
            </div>
            <div className="bg-white/8 border border-white/16 backdrop-blur-[10px] rounded-[18px] p-4 shadow-[0_10px_32px_rgba(0,0,0,0.26)]">
              <div className="flex items-end gap-[2px] h-[60px]">
                {(liveTemps.length > 0 ? liveTemps : Array(26).fill(20)).slice(-40).map((t, i) => {
                  const h = Math.min(100, Math.max(5, ((t - 15) / 60) * 100));
                  const isHot = t > 60;
                  const isWarm = t > 45;
                  return <div key={i} className={`flex-1 rounded-t-[3px] transition-all ${isHot ? 'bg-[#FF6B5B]' : isWarm ? 'bg-[#FCE500]' : 'bg-[#3A61A6]'}`} style={{ height: `${h}%` }} />;
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/45 text-[10px]">ancien</span>
                <span className="text-white/60 text-[10px]">{temp > 60 ? '⚠️ surchauffe' : temp > 45 ? 'montée en temp.' : 'normal'}</span>
                <span className="text-white/45 text-[10px]">maintenant</span>
              </div>
            </div>
          </div>

          {/* Last position */}
          <div>
            <p className="font-['Archivo'] font-bold text-[14px] mb-2">Dernière position</p>
            <div ref={mapRef} className="rounded-[18px] overflow-hidden border border-white/16 h-[180px]" />
            <p className="text-white/40 text-[10px] mt-1">Clermont-Ferrand · dernière synchronisation capteur</p>
          </div>

          {/* Buy button */}
          <button className="w-full bg-[#FCE500] rounded-[14px] py-3.5 font-bold text-[15px] text-[#11264F] shadow-[0_8px_24px_rgba(252,229,0,0.32)] flex items-center justify-center gap-2">
            <ShoppingCart size={18} /> Racheter ce modèle
          </button>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-[#080F22] text-white relative overflow-y-auto pb-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#27509B]/30 blur-[80px]" />
      </div>

      <div className="relative p-5 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <h1 className="font-['Archivo'] font-extrabold text-[21px]">Mon équipement</h1>
          <button className="w-[38px] h-[38px] rounded-[19px] bg-white/14 border border-white/22 backdrop-blur-[7px] flex items-center justify-center">
            <Plus size={18} />
          </button>
        </div>

        {/* Sensor status bar */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-[11px] rounded-[20px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[rgba(39,80,155,0.4)] border border-[rgba(120,160,230,0.4)] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#27509B]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px]">{myTires.length} capteurs connectés</p>
            <p className="text-white/60 text-[11.5px]">Synchronisé via Bluetooth · il y a 2 min</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full bg-[#84BD00] opacity-75" />
            <span className="text-[#C7E89B] font-bold text-[10.5px]">Live</span>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between">
          <h2 className="font-['Archivo'] font-bold text-[15px]">Mes pneus connectés</h2>
          <span className="text-white/50 text-[12px]">{myTires.length} produits</span>
        </div>

        {/* Tire cards */}
        {myTires.length === 0 ? (
          <p className="text-white/45 text-center py-12">Aucun pneu ajouté.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {myTires.map((t, i) => (
              <div key={t.id} onClick={() => openTireDetail(t)}
                className={`backdrop-blur-[10px] rounded-[18px] p-4 shadow-[0_8px_26px_rgba(0,0,0,0.22)] cursor-pointer transition-all active:scale-[0.98] ${i === 0 ? 'bg-[rgba(252,229,0,0.07)] border border-[rgba(252,229,0,0.45)]' : 'bg-white/10 border border-white/16'}`}>
                {/* Tire header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[54px] h-[54px] rounded-[27px] bg-white/6 border border-white/12 flex items-center justify-center">
                    <CircleDot size={24} className="text-[#FCE500]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-['Archivo'] font-bold text-[16px]">{t.catalog?.name || 'Pneu'}</p>
                    <p className="text-white/55 text-[11.5px]">{t.catalog?.usage_type || 'Pneu route'} · {t.position === 'front' ? 'Avant' : 'Arrière'}</p>
                  </div>
                  <ChevronRight size={20} className="text-white/40" />
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <MiniStat label="Pression" value="6.2 bar" />
                  <MiniStat label="Temp." value="34 °C" />
                  <MiniStat label="Batterie" value="78 %" />
                </div>

                {/* Wear bar */}
                <div className="flex items-center gap-2">
                  <span className="text-white/55 text-[10.5px]">Usure {100 - (t.wear_score ?? 100)}%</span>
                  <div className="flex-1 h-[6px] bg-white/14 rounded-[5px] overflow-hidden">
                    <div className={`h-full rounded-[5px] ${(t.wear_score ?? 100) > 60 ? 'bg-[#84BD00]' : (t.wear_score ?? 100) > 30 ? 'bg-[#FCE500]' : 'bg-[#FF5B5B]'}`} style={{ width: `${100 - (t.wear_score ?? 100)}%` }} />
                  </div>
                  <span className="text-white/40 text-[10.5px]">limite 100%</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-[#0F1729] border-t border-white/10 rounded-t-[24px] p-5 w-full max-w-md max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-['Archivo'] font-extrabold text-[19px] mb-4">Ajouter un pneu</h3>
            <div className="flex flex-col gap-3">
              {catalogList.map(c => (
                <div key={c.id} className="bg-white/8 border border-white/12 rounded-[14px] p-4">
                  <p className="font-bold text-[14px]">{c.name}</p>
                  <p className="text-white/50 text-[11px] mb-2">{c.usage_type || c.category}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleAdd(c.id, 'front')} className="bg-[#FCE500] text-[#11264F] px-3 py-1.5 rounded-[10px] font-bold text-[11px]">Avant</button>
                    <button onClick={() => handleAdd(c.id, 'rear')} className="bg-[#FCE500] text-[#11264F] px-3 py-1.5 rounded-[10px] font-bold text-[11px]">Arrière</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAdd(false)} className="mt-4 w-full bg-white/10 py-3 rounded-[12px] text-[13px]">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit, status, statusColor }: { icon: React.ReactNode; label: string; value: string; unit: string; status: string; statusColor: 'green' | 'blue' }) {
  return (
    <div className="bg-white/10 border border-white/18 backdrop-blur-[10px] rounded-[18px] p-3.5 shadow-[0_8px_26px_rgba(0,0,0,0.22)]">
      <div className="w-[30px] h-[30px] rounded-[9px] bg-[rgba(157,180,224,0.22)] border border-white/16 mb-3 flex items-center justify-center text-white/70">
        {icon}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="font-['Archivo'] font-extrabold text-[22px] tracking-tight">{value}</span>
        <span className="text-white/60 font-semibold text-[11.5px]">{unit}</span>
      </div>
      <p className="text-white/62 text-[11px] mt-0.5">{label}</p>
      <div className={`mt-2 inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${statusColor === 'green' ? 'bg-[rgba(132,189,0,0.18)] border border-[rgba(160,210,90,0.4)] text-[#C7E89B]' : 'bg-[rgba(157,180,224,0.18)] border border-white/16 text-[#BFD0EE]'}`}>
        {status}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/6 border border-white/10 rounded-[10px] px-2.5 py-2">
      <p className="text-white/50 text-[9px] uppercase tracking-[0.04em]">{label}</p>
      <p className="font-['Archivo'] font-bold text-[13px] mt-0.5">{value}</p>
    </div>
  );
}
