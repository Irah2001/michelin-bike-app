import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { Badge } from './entities/badge.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Catalog) private catalogRepo: Repository<Catalog>,
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
  ) {}

  async onModuleInit() {
    await this.seedCatalog();
    await this.seedBadges();
  }

  private async seedCatalog() {
    const count = await this.catalogRepo.count();
    if (count > 0) return;

    const tires = [
      { name: 'Michelin Power Road', category: 'Performance', usage_type: 'road', expected_lifespan_km: 6000, price: 49.99, image_url: 'https://www.michelin.fr/content/dam/michelin/power-road.png' },
      { name: 'Michelin Power Endurance', category: 'Endurance', usage_type: 'road', expected_lifespan_km: 8000, price: 39.99, image_url: 'https://www.michelin.fr/content/dam/michelin/power-endurance.png' },
      { name: 'Michelin Power Gravel', category: 'Gravel', usage_type: 'gravel', expected_lifespan_km: 5000, price: 44.99, image_url: 'https://www.michelin.fr/content/dam/michelin/power-gravel.png' },
      { name: 'Michelin Wild Enduro Front', category: 'VTT', usage_type: 'mtb', expected_lifespan_km: 3000, price: 54.99, image_url: 'https://www.michelin.fr/content/dam/michelin/wild-enduro.png' },
      { name: 'Michelin Wild AM2', category: 'VTT All-Mountain', usage_type: 'mtb', expected_lifespan_km: 3500, price: 52.99, image_url: 'https://www.michelin.fr/content/dam/michelin/wild-am2.png' },
      { name: 'Michelin City Street', category: 'Urbain', usage_type: 'urban', expected_lifespan_km: 10000, price: 29.99, image_url: 'https://www.michelin.fr/content/dam/michelin/city-street.png' },
      { name: 'Michelin Protek Max', category: 'Anti-crevaison', usage_type: 'urban', expected_lifespan_km: 8000, price: 34.99, image_url: 'https://www.michelin.fr/content/dam/michelin/protek-max.png' },
      { name: 'Michelin Power Time Trial', category: 'Compétition', usage_type: 'road', expected_lifespan_km: 3000, price: 59.99, image_url: 'https://www.michelin.fr/content/dam/michelin/power-tt.png' },
    ];

    for (const tire of tires) {
      await this.catalogRepo.save(this.catalogRepo.create(tire));
    }
  }

  private async seedBadges() {
    const count = await this.badgeRepo.count();
    if (count > 0) return;

    const badges = [
      { name: 'Premier Tour', description: 'Première sortie enregistrée', image_url: '🚴', condition_type: 'total_rides', condition_value: 1 },
      { name: '10 Sorties', description: '10 sorties effectuées', image_url: '🔥', condition_type: 'total_rides', condition_value: 10 },
      { name: '50 Sorties', description: '50 sorties effectuées', image_url: '💪', condition_type: 'total_rides', condition_value: 50 },
      { name: 'Centenaire', description: '100km en une seule sortie', image_url: '💯', condition_type: 'single_distance', condition_value: 100 },
      { name: 'Grimpeur', description: '1000m de dénivelé en une sortie', image_url: '⛰️', condition_type: 'single_elevation', condition_value: 1000 },
      { name: 'Marathonien', description: '500km total parcourus', image_url: '🏅', condition_type: 'total_km', condition_value: 500 },
      { name: 'Explorateur', description: '1000km total parcourus', image_url: '🗺️', condition_type: 'total_km', condition_value: 1000 },
      { name: 'Ultra', description: '5000km total parcourus', image_url: '🏆', condition_type: 'total_km', condition_value: 5000 },
      { name: 'Niveau 3', description: 'Atteindre le niveau 3', image_url: '⭐', condition_type: 'level', condition_value: 3 },
      { name: 'Niveau 5', description: 'Atteindre le niveau 5', image_url: '🌟', condition_type: 'level', condition_value: 5 },
    ];

    for (const badge of badges) {
      await this.badgeRepo.save(this.badgeRepo.create(badge));
    }
  }
}
