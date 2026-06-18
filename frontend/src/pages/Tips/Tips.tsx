import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, AlertCircle, Lightbulb, Info, CloudRain, Sun, Cloud, Thermometer } from 'lucide-react';
import { tips } from '../../services/api';
import { PageWrapper } from '../../components/ui/PageWrapper';

interface Tip {
  priority: string;
  message: string;
  category: string;
}

interface ForecastDay {
  date: string;
  isRain: boolean;
  weather: string;
  temp: number;
  pressure_front: number | string;
  pressure_rear: number | string;
}

interface Forecast {
  weight_kg: number;
  tire: string;
  city: string;
  recommendation?: string;
  days: ForecastDay[];
}

// Design premium : L'icône a son propre fond coloré translucide au lieu de colorer toute la carte
const priorityConfig: Record<string, { icon: React.ReactNode; iconBg: string }> = {
  critical: { icon: <AlertTriangle size={18} className="text-[#FF5B5B]" />, iconBg: 'bg-[#FF5B5B]/15 border-[#FF5B5B]/30' },
  high: { icon: <AlertCircle size={18} className="text-[#FFB03A]" />, iconBg: 'bg-[#FFB03A]/15 border-[#FFB03A]/30' },
  medium: { icon: <Lightbulb size={18} className="text-[#FCE500]" />, iconBg: 'bg-[#FCE500]/15 border-[#FCE500]/30' },
  low: { icon: <Info size={18} className="text-[#84BD00]" />, iconBg: 'bg-[#84BD00]/15 border-[#84BD00]/30' },
};

const weatherIcon = (w: string) => {
  if (w === 'Rain' || w === 'Drizzle') return <CloudRain size={22} className="text-[#8FB8FF]" />;
  if (w === 'Clouds') return <Cloud size={22} className="text-white/60" />;
  return <Sun size={22} className="text-[#FCE500]" />;
};

export default function Tips() {
  const [tipsList, setTipsList] = useState<Tip[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tips.list(), tips.forecast()])
      .then(([t, f]) => { setTipsList(t as unknown as Tip[]); setForecast(f as unknown as Forecast); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#FCE500]" size={40} /></div>;

  return (
    <PageWrapper>
      {/* Background Glows Subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#27509B]/20 blur-[80px]" />
      </div>

      <div className="relative p-6 flex flex-col gap-6">

        {/* En-tête */}
        <div className="pt-2">
          <h1 className="font-archivo font-extrabold text-[24px]">Conseils personnalisés</h1>
          <p className="text-white/50 text-[13px] mt-1">Recommandations basées sur votre équipement et la météo.</p>
        </div>

        {/* 5-day Pressure Forecast */}
        {forecast && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-archivo font-bold text-[16px] flex items-center gap-2">
                <Thermometer size={18} className="text-[#FCE500]" />
                Pression recommandée
              </h2>
            </div>

            <p className="text-[11px] text-white/50 mb-5 font-medium">
              Calculé pour {forecast.weight_kg}kg · {forecast.tire} · {forecast.city}
            </p>

            {/* Scroll horizontal caché ([&::-webkit-scrollbar]:hidden) */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden snap-x">
              {forecast.days?.map((day, i) => (
                <div
                  key={i}
                  className={`snap-center flex-shrink-0 w-[78px] flex flex-col items-center border rounded-[18px] p-3 transition-all ${day.isRain
                    ? 'border-[#27509B]/40 bg-[#27509B]/10 shadow-[inset_0_0_12px_rgba(39,80,155,0.1)]'
                    : 'border-white/10 bg-white/5'
                    }`}
                >
                  <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                    {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </p>

                  <div className="my-2">{weatherIcon(day.weather)}</div>

                  <p className="font-archivo font-bold text-[15px]">{day.temp}°</p>

                  <div className="w-full h-px bg-white/10 my-2.5" />

                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[9px] text-white/40 font-bold">AV</span>
                      <span className="font-archivo text-[11px] font-extrabold text-[#FCE500]">{day.pressure_front}</span>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[9px] text-white/40 font-bold">AR</span>
                      <span className="font-archivo text-[11px] font-extrabold text-[#FCE500]">{day.pressure_rear}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Insight block */}
            {forecast.recommendation && (
              <div className="mt-4 bg-gradient-to-r from-[#FCE500]/15 to-transparent border-l-[3px] border-[#FCE500] rounded-r-[14px] rounded-l-sm p-4">
                <p className="text-[13px] text-white/90 leading-relaxed font-medium">
                  <span className="text-[#FCE500] font-bold mr-1">Smart Insight :</span>
                  {forecast.recommendation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tips List */}
        <div>
          <h2 className="font-archivo font-bold text-[16px] mb-4">À surveiller</h2>

          {tipsList.length === 0 ? (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-[20px] p-8 text-center">
              <p className="text-white/60 text-[13px]">Votre vélo est en parfait état pour rouler.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tipsList.map((tip, i) => {
                const cfg = priorityConfig[tip.priority] || priorityConfig.low;
                return (
                  <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[20px] p-4 flex gap-4 items-start shadow-lg">
                    {/* Boîte icône colorée */}
                    <div className={`w-10 h-10 rounded-[12px] border flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                      {cfg.icon}
                    </div>

                    <div className="flex-1 mt-0.5">
                      <p className="text-[13.5px] text-white/90 leading-snug font-medium">
                        {tip.message}
                      </p>
                      <p className="text-[11px] font-bold text-white/40 mt-1.5 uppercase tracking-wide">
                        {tip.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}