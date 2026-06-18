import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';

@Injectable()
export class CatalogService {
  constructor(@InjectRepository(Catalog) private catalogRepo: Repository<Catalog>) {}

  async findAll() {
    return this.catalogRepo.find();
  }

  async findOne(id: string) {
    const item = await this.catalogRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Pneu non trouvé dans le catalogue');
    return item;
  }

  async recommend(usageType?: string) {
    if (usageType) {
      return this.catalogRepo.find({ where: { usage_type: usageType } });
    }
    // Default: return top rated by lifespan
    return this.catalogRepo.find({ order: { expected_lifespan_km: 'DESC' }, take: 3 });
  }
}
