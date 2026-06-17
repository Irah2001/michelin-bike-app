import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { User } from './entities/user.entity';
import { SensorRecord } from './entities/sensor-record.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge) private userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(SensorRecord) private recordRepo: Repository<SensorRecord>,
  ) {}

  async checkAndAward(userId: string): Promise<string[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return [];

    const badges = await this.badgeRepo.find();
    const existing = await this.userBadgeRepo.find({ where: { user_id: userId } });
    const existingIds = new Set(existing.map(e => e.badge_id));

    const totalRecords = await this.recordRepo.count({ where: { user_id: userId } });
    const totalKm = await this.recordRepo.createQueryBuilder('r')
      .where('r.user_id = :userId', { userId })
      .select('SUM(r.distance_km)', 'total')
      .getRawOne();
    const km = totalKm?.total || 0;

    const awarded: string[] = [];

    for (const badge of badges) {
      if (existingIds.has(badge.id)) continue;

      let earned = false;
      switch (badge.condition_type) {
        case 'total_km':
          earned = km >= badge.condition_value;
          break;
        case 'total_rides':
          earned = totalRecords >= badge.condition_value;
          break;
        case 'single_distance':
          earned = user.best_distance_km >= badge.condition_value;
          break;
        case 'single_elevation':
          earned = user.best_elevation_m >= badge.condition_value;
          break;
        case 'xp':
          earned = user.xp >= badge.condition_value;
          break;
        case 'level':
          earned = user.level >= badge.condition_value;
          break;
      }

      if (earned) {
        await this.userBadgeRepo.save(this.userBadgeRepo.create({ user_id: userId, badge_id: badge.id }));
        awarded.push(badge.name);
      }
    }

    return awarded;
  }
}
