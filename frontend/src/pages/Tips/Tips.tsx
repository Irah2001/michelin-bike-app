import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, AlertCircle, Lightbulb, Info, CloudRain, Sun, Cloud, Thermometer } from 'lucide-react';
import { tips } from '../../services/api';
import { PageWrapper } from '../../components/ui/PageWrapper';

const priorityConfig: Record<string, { icon: React.ReactNode; border: string }> = {
  critical: { icon: <AlertTriangle size={18} className="text-red-400" />, border: 'border-red-500/40' },
  high: { icon: <AlertCircle size={18} className="text-orange-400" />, border: 'border-orange-500/40' },
  medium: { icon: <Lightbulb size={18} className="text-yellow-400" />, border: 'border-yellow-500/40' },
  low: { icon: <Info size={18} className="text-blue-400" />, border: 'border-blue-500/40' },
};

const weatherIcon = (w: string) => {
  if (w === 'Rain' || w === 'Drizzle') return <CloudRain size={18} className="text-blue-400" />;
  if (w === 'Clouds') return <Cloud size={18} className="text-slate-400" />;
  return <Sun size={18} className="text-yellow-400" />;
};

export default function Tips() {
  const [tipsList, setTipsList] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tips.list(), tips.forecast()])
      .then(([t, f]) => { setTipsList(t); setForecast(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  return (
    <PageWrapper>
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Conseils personnalisés</h1>

      {/* 5-day Pressure Forecast */}
      {forecast && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Thermometer size={16} className="text-[#FCE500]" />
              Pression recommandée — 5 jours
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mb-3">
            Basé sur votre poids ({forecast.weight_kg}kg) • {forecast.tire} • {forecast.city}
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {forecast.days?.map((day: any, i: number) => (
              <div key={i} className={`flex-shrink-0 w-[72px] bg-white/5 border rounded-xl p-2 text-center ${day.isRain ? 'border-blue-500/30' : 'border-white/10'}`}>
                <p className="text-[9px] text-slate-500">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                <div className="flex justify-center my-1">{weatherIcon(day.weather)}</div>
                <p className="text-[10px] text-slate-300">{day.temp}°C</p>
                <div className="mt-1.5 border-t border-white/10 pt-1.5">
                  <p className="text-[10px] font-bold text-[#FCE500]">AV {day.pressure_front}</p>
                  <p className="text-[10px] font-bold text-[#FCE500]">AR {day.pressure_rear}</p>
                </div>
              </div>
            ))}
          </div>

          {forecast.recommendation && (
            <div className="mt-3 bg-[#FCE500]/10 border border-[#FCE500]/30 rounded-xl p-3">
              <p className="text-xs text-[#FCE500] font-medium">💡 {forecast.recommendation}</p>
            </div>
          )}
        </div>
      )}

      {/* Tips List */}
      {tipsList.length === 0 ? (
        <p className="text-slate-400 text-center py-6">Aucun conseil supplémentaire pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tipsList.map((tip, i) => {
            const cfg = priorityConfig[tip.priority] || priorityConfig.low;
            return (
              <div key={i} className={`bg-white/5 border ${cfg.border} rounded-xl p-4 flex gap-3 items-start`}>
                <span className="mt-0.5">{cfg.icon}</span>
                <div>
                  <p className="text-sm">{tip.message}</p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{tip.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </PageWrapper>
  );
}
