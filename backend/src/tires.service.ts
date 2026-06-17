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
    return this.tireRepo.find({ where: { user_id: userId }, relations: { catalog: true } });
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
