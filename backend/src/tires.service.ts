import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tire } from './entities/tire.entity';
import { Catalog } from './entities/catalog.entity';
import { CreateTireDto, UpdateTireDto } from './dto/tires.dto';

@Injectable()
export class TiresService {
  constructor(
    @InjectRepository(Tire) private tireRepo: Repository<Tire>,
    @InjectRepository(Catalog) private catalogRepo: Repository<Catalog>,
  ) {}

  async findAll(userId: string) {
    const tires = await this.tireRepo.find({ where: { user_id: userId }, relations: { catalog: true } });
    return tires.map(t => ({
      ...t,
      alert: t.wear_score <= 20 ? { level: 'critical', message: `Pneu usé à ${100 - t.wear_score}% — remplacement recommandé !` }
           : t.wear_score <= 40 ? { level: 'warning', message: `Usure avancée (${100 - t.wear_score}%) — surveillez votre pneu` }
           : null,
      recommended_replacement: t.wear_score <= 20 ? t.catalog?.name || 'Voir catalogue' : null,
    }));
  }

  async create(userId: string, dto: CreateTireDto) {
    const catalog = await this.catalogRepo.findOne({ where: { id: dto.catalog_id } });
    if (!catalog) throw new NotFoundException('Ce pneu n\'existe pas dans le catalogue Michelin');
    const tire = this.tireRepo.create({ user_id: userId, catalog_id: dto.catalog_id });
    return this.tireRepo.save(tire);
  }

  async update(id: string, userId: string, dto: UpdateTireDto) {
    const tire = await this.tireRepo.findOne({ where: { id, user_id: userId } });
    if (!tire) throw new NotFoundException('Pneu non trouvé');
    if (dto.is_active !== undefined) tire.is_active = dto.is_active;
    if (dto.total_km !== undefined) {
      tire.total_km = dto.total_km;
      tire.wear_score = Math.max(0, Math.round(100 - (tire.total_km / 5000) * 100));
    }
    return this.tireRepo.save(tire);
  }
}
