import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { Badge } from './entities/badge.entity';
import { User } from './entities/user.entity';
import { Challenge } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Catalog) private catalogRepo: Repository<Catalog>,
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant) private participantRepo: Repository<ChallengeParticipant>,
  ) {}

  async onModuleInit() {
    await this.seedCatalog();
    await this.seedBadges();
    await this.seedCommunity();
  }

  private async seedCatalog() {
    const count = await this.catalogRepo.count();
    if (count > 0) return;

    const tires = [
      { name: 'Michelin Power Cup', category: 'Performance', usage_type: 'road', expected_lifespan_km: 5000, price: 54.99, image_url: '' },
      { name: 'Michelin Power Road', category: 'Performance', usage_type: 'road', expected_lifespan_km: 6000, price: 49.99, image_url: '' },
      { name: 'Michelin Power Endurance', category: 'Endurance', usage_type: 'road', expected_lifespan_km: 8000, price: 39.99, image_url: '' },
      { name: 'Michelin Power Gravel', category: 'Gravel', usage_type: 'gravel', expected_lifespan_km: 5000, price: 44.99, image_url: '' },
      { name: 'Michelin Wild Enduro Front', category: 'VTT', usage_type: 'mtb', expected_lifespan_km: 3000, price: 54.99, image_url: '' },
      { name: 'Michelin Wild AM2', category: 'VTT All-Mountain', usage_type: 'mtb', expected_lifespan_km: 3500, price: 52.99, image_url: '' },
      { name: 'Michelin City Street', category: 'Urbain', usage_type: 'urban', expected_lifespan_km: 10000, price: 29.99, image_url: '' },
      { name: 'Michelin Power Time Trial', category: 'Compétition', usage_type: 'road', expected_lifespan_km: 3000, price: 59.99, image_url: '' },
    ];

    for (const tire of tires) {
      await this.catalogRepo.save(this.catalogRepo.create(tire));
    }
  }

  private async seedBadges() {
    const count = await this.badgeRepo.count();
    if (count > 0) return;

    const badges = [
      { name: 'Premier 1 000 km', description: '1000 km parcourus', image_url: '🗺️', condition_type: 'total_km', condition_value: 1000 },
      { name: '100 sorties', description: '100 sorties effectuées', image_url: '🔥', condition_type: 'total_rides', condition_value: 100 },
      { name: '1 an équipé', description: '1 an avec capteur actif', image_url: '🛡️', condition_type: 'total_rides', condition_value: 365 },
      { name: 'Défi Ventoux', description: 'Challenge Mont Ventoux terminé', image_url: '⛰️', condition_type: 'single_elevation', condition_value: 1912 },
      { name: 'Nocturne', description: 'Sortie de nuit enregistrée', image_url: '🌙', condition_type: 'total_rides', condition_value: 1 },
      { name: '5 000 km', description: '5000 km parcourus', image_url: '🏆', condition_type: 'total_km', condition_value: 5000 },
    ];

    for (const badge of badges) {
      await this.badgeRepo.save(this.badgeRepo.create(badge));
    }
  }

  private async seedCommunity() {
    // Check if challenge already exists
    const challengeCount = await this.challengeRepo.count();
    if (challengeCount > 0) return;

    const hash = await bcrypt.hash('password123', 10);

    // Create ambassador + fictitious riders
    const fakeUsers = [
      { name: 'Paul Seixas', email: 'paul.seixas@michelin.com', is_ambassador: true, is_verified: true, xp: 98000, level: 5, level_name: 'Légende', city: 'Mont Ventoux', region: 'Provence-Alpes-Côte d\'Azur', country: 'France' },
      { name: 'Théo Lambert', email: 'theo.lambert@demo.com', is_ambassador: false, is_verified: true, xp: 24000, level: 4, level_name: 'Expert', city: 'Lyon', region: 'Auvergne-Rhône-Alpes', country: 'France' },
      { name: 'Marie Dubois', email: 'marie.dubois@demo.com', is_ambassador: false, is_verified: true, xp: 21000, level: 4, level_name: 'Expert', city: 'Grenoble', region: 'Auvergne-Rhône-Alpes', country: 'France' },
      { name: 'Antoine Mercier', email: 'antoine.mercier@demo.com', is_ambassador: false, is_verified: false, xp: 18500, level: 3, level_name: 'Endurci', city: 'Annecy', region: 'Auvergne-Rhône-Alpes', country: 'France' },
      { name: 'Léa Garnier', email: 'lea.garnier@demo.com', is_ambassador: false, is_verified: true, xp: 15000, level: 3, level_name: 'Endurci', city: 'Chambéry', region: 'Auvergne-Rhône-Alpes', country: 'France' },
      { name: 'Yanis Cohen', email: 'yanis.cohen@demo.com', is_ambassador: false, is_verified: false, xp: 12000, level: 3, level_name: 'Endurci', city: 'Nice', region: 'Provence-Alpes-Côte d\'Azur', country: 'France' },
    ];

    const createdUsers: User[] = [];
    for (const u of fakeUsers) {
      const existing = await this.userRepo.findOne({ where: { email: u.email } });
      if (existing) {
        createdUsers.push(existing);
        continue;
      }
      const user = this.userRepo.create({ ...u, password_hash: hash, has_completed_onboarding: true });
      createdUsers.push(await this.userRepo.save(user));
    }

    // Create the collective challenge
    const now = new Date();
    const endDate = new Date(now.getTime() + 3 * 86400000 + 14 * 3600000); // 3j 14h from now
    const challenge = this.challengeRepo.create({
      created_by: createdUsers[0].id, // Paul Seixas
      title: '100 000 km en 7 jours',
      description: 'Défi collectif de la communauté Paul Seixas — roulons ensemble vers 100 000 km !',
      target_km: 100000,
      current_km: 67466,
      start_date: new Date(now.getTime() - 4 * 86400000),
      end_date: endDate,
      is_active: true,
      reward_description: 'Badge exclusif + 10% sur Michelin Power Cup',
    });
    const savedChallenge = await this.challengeRepo.save(challenge);

    // Add participants with contributed_km
    const contributions = [
      { user: createdUsers[0], km: 1842 }, // Paul Seixas
      { user: createdUsers[1], km: 612 },  // Théo Lambert
      { user: createdUsers[2], km: 587 },  // Marie Dubois
      { user: createdUsers[3], km: 561 },  // Antoine Mercier
      { user: createdUsers[4], km: 498 },  // Léa Garnier
      { user: createdUsers[5], km: 463 },  // Yanis Cohen
    ];

    for (const c of contributions) {
      await this.participantRepo.save(this.participantRepo.create({
        challenge_id: savedChallenge.id,
        user_id: c.user.id,
        contributed_km: c.km,
      }));
    }
  }
}
