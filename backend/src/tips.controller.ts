import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Tire } from './entities/tire.entity';
import { SensorRecord } from './entities/sensor-record.entity';

@ApiTags('Tips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tips')
export class TipsController {
  constructor(
    @InjectRepository(Tire) private tireRepo: Repository<Tire>,
    @InjectRepository(SensorRecord) private recordRepo: Repository<SensorRecord>,
  ) {}

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
