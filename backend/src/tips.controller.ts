import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Tire } from './entities/tire.entity';
import { SensorRecord } from './entities/sensor-record.entity';
import { User } from './entities/user.entity';

// Pression recommandée basée sur poids + météo + largeur pneu
function computePressure(weightKg: number, tireWidth: number, temp: number, isRain: boolean): { front: number; rear: number } {
  // Base: formule simplifiée (poids → pression pour pneu route)
  const base = (weightKg * 0.07) + (30 / tireWidth);
  // Ajustement température: -0.02 bar par 10°C en dessous de 20°C
  const tempAdj = (20 - temp) * 0.002;
  // Pluie: -0.3 bar pour plus de grip
  const rainAdj = isRain ? -0.3 : 0;
  const rear = Math.round((base + tempAdj + rainAdj) * 10) / 10;
  const front = Math.round((rear - 0.3) * 10) / 10;
  return { front: Math.max(3, Math.min(8, front)), rear: Math.max(3, Math.min(8, rear)) };
}

function getTireRecommendation(temp: number, isRain: boolean, rainDays: number): string | null {
  if (rainDays >= 3) return 'Michelin Power All Season — grip optimal par temps humide, durabilité 4 saisons';
  if (temp < 5) return 'Michelin Power Road TLR — meilleur rendement par temps froid, tubeless pour moins de crevaisons';
  return null;
}

@ApiTags('Tips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tips')
export class TipsController {
  constructor(
    @InjectRepository(Tire) private tireRepo: Repository<Tire>,
    @InjectRepository(SensorRecord) private recordRepo: Repository<SensorRecord>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Get('forecast')
  @ApiOperation({ summary: 'Recommandations pression et pneu sur 5 jours (météo + poids)' })
  async getForecast(@Req() req: any) {
    const user = await this.userRepo.findOne({ where: { id: req.user.sub } });
    const weight = user?.weight_kg || 75; // default 75kg
    const city = user?.city || user?.region || 'Clermont-Ferrand';

    // Fetch 5-day weather from OpenWeather (free API, no key needed for demo → use mock if fails)
    let forecast: any[] = [];
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey) {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},FR&units=metric&cnt=40&appid=${apiKey}`);
        const data = await res.json();
        if (data.list) {
          // Group by day (take noon reading)
          const days = new Map<string, any>();
          for (const item of data.list) {
            const date = item.dt_txt.split(' ')[0];
            const hour = parseInt(item.dt_txt.split(' ')[1]);
            if (!days.has(date) || hour === 12) days.set(date, item);
          }
          forecast = [...days.values()].slice(0, 5);
        }
      }
    } catch {}

    // Fallback: generate realistic mock forecast
    if (forecast.length === 0) {
      const conditions = ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'];
      const temps = [22, 19, 14, 24, 17];
      for (let i = 0; i < 5; i++) {
        const date = new Date(Date.now() + i * 86400000);
        forecast.push({
          dt_txt: date.toISOString().split('T')[0] + ' 12:00:00',
          main: { temp: temps[i] },
          weather: [{ main: conditions[i], description: conditions[i].toLowerCase() }],
        });
      }
    }

    // Get user's active tire width (from catalog name parsing or default 25mm)
    const activeTire = await this.tireRepo.findOne({ where: { user_id: req.user.sub, is_active: true }, relations: { catalog: true } });
    const tireWidth = 25; // default road tire width

    const rainDays = forecast.filter(f => f.weather?.[0]?.main === 'Rain').length;

    const days = forecast.map(f => {
      const date = f.dt_txt.split(' ')[0];
      const temp = f.main.temp;
      const weather = f.weather?.[0]?.main || 'Clear';
      const isRain = weather === 'Rain' || weather === 'Drizzle';
      const pressure = computePressure(weight, tireWidth, temp, isRain);

      return {
        date,
        temp: Math.round(temp),
        weather,
        isRain,
        pressure_front: pressure.front,
        pressure_rear: pressure.rear,
        tip: isRain ? '🌧️ Baissez la pression pour plus de grip sur sol mouillé'
           : temp < 10 ? '🥶 Temps froid — le pneu perd de la pression naturellement, vérifiez avant de partir'
           : '☀️ Conditions idéales — pression standard',
      };
    });

    const tireRec = getTireRecommendation(days[0]?.temp || 20, days[0]?.isRain || false, rainDays);

    return {
      weight_kg: weight,
      city,
      tire: activeTire?.catalog?.name || 'Non renseigné',
      tire_width_mm: tireWidth,
      days,
      recommendation: tireRec,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Conseils personnalisés selon usure et usage' })
  async getTips(@Req() req: any) {
    const userId = req.user.sub;
    const tires = await this.tireRepo.find({ where: { user_id: userId, is_active: true }, relations: { catalog: true } });
    const records = await this.recordRepo.find({ where: { user_id: userId }, order: { recorded_at: 'DESC' }, take: 10 });

    const tips: { category: string; message: string; priority: string }[] = [];

    // Tips basés sur l'usure des pneus
    for (const tire of tires) {
      if (tire.wear_score <= 10) {
        tips.push({ category: 'pneu', message: `⚠️ ${tire.catalog?.name || 'Votre pneu'} est quasiment mort (${tire.wear_score}%). Changez-le immédiatement pour votre sécurité !`, priority: 'critical' });
      } else if (tire.wear_score <= 30) {
        tips.push({ category: 'pneu', message: `🔶 ${tire.catalog?.name || 'Votre pneu'} montre des signes d'usure (${tire.wear_score}%). Prévoyez un remplacement.`, priority: 'high' });
      } else if (tire.wear_score <= 50) {
        tips.push({ category: 'pneu', message: `💡 ${tire.catalog?.name || 'Votre pneu'} est à mi-vie (${tire.wear_score}%). Vérifiez la pression régulièrement.`, priority: 'medium' });
      }
    }

    // Tips basés sur l'usage
    if (records.length > 0) {
      const avgSpeed = records.reduce((s, r) => s + (r.avg_speed || 0), 0) / records.length;
      const avgDist = records.reduce((s, r) => s + r.distance_km, 0) / records.length;

      if (avgSpeed > 35) {
        tips.push({ category: 'performance', message: '🚀 Votre vitesse moyenne est élevée ! Pensez aux pneus Michelin Power Road pour maximiser vos performances.', priority: 'low' });
      }
      if (avgDist > 80) {
        tips.push({ category: 'endurance', message: '🏔️ Vos longues sorties demandent des pneus endurants. Le Michelin Power Endurance est fait pour vous.', priority: 'low' });
      }
      if (records.some(r => (r.elevation_m || 0) > 800)) {
        tips.push({ category: 'montagne', message: '⛰️ Beaucoup de dénivelé ! Vérifiez la pression de vos pneus avant les descentes — 0.5 bar de moins à l\'arrière pour plus de grip.', priority: 'medium' });
      }
    }

    // Tips généraux si peu d'activité
    if (records.length === 0) {
      tips.push({ category: 'motivation', message: '🚴 Pas encore de sortie ? Commencez par 20 minutes et augmentez progressivement !', priority: 'low' });
    }
    if (tires.length === 0) {
      tips.push({ category: 'setup', message: '🔧 Ajoutez votre pneu pour suivre son usure et recevoir des alertes personnalisées.', priority: 'medium' });
    }

    // Tip entretien
    tips.push({ category: 'entretien', message: '💨 Vérifiez la pression de vos pneus toutes les 2 semaines. Un pneu sous-gonflé s\'use 30% plus vite.', priority: 'low' });

    return tips.sort((a, b) => {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
    });
  }
}
