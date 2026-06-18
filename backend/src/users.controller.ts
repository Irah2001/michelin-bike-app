import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { SensorRecord } from './entities/sensor-record.entity';
import { Friendship } from './entities/friendship.entity';
import { Challenge } from './entities/challenge.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateUserDto } from './dto/users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Friendship) private friendRepo: Repository<Friendship>,
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil complet : infos, stats, badges, level' })
  async getMe(@Req() req: any) {
    const user = await this.userRepo.findOne({
      where: { id: req.user.sub },
      relations: { user_badges: { badge: true } },
    });
    if (!user) throw new NotFoundException();
    return this.formatProfile(user);
  }

  @Get('me/badges')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tous les badges avec progression' })
  async getMyBadges(@Req() req: any) {
    const allBadges = await this.userRepo.manager.find(Badge);
    const userBadges = await this.userRepo.manager.find(UserBadge, { where: { user_id: req.user.sub } });
    const user = await this.userRepo.findOne({ where: { id: req.user.sub } });
    const records = await this.userRepo.manager.count(SensorRecord, { where: { user_id: req.user.sub } });
    const totalKmResult = await this.userRepo.manager
      .createQueryBuilder(SensorRecord, 'r')
      .where('r.user_id = :id', { id: req.user.sub })
      .select('COALESCE(SUM(r.distance_km), 0)', 'total')
      .getRawOne();
    const totalKm = Number(totalKmResult?.total || 0);

    const unlockedIds = new Set(userBadges.map(ub => ub.badge_id));

    return allBadges.map(badge => {
      const unlocked = unlockedIds.has(badge.id);
      let progress = 0;
      let currentValue = 0;
      const targetValue = badge.condition_value;

      if (user) {
        switch (badge.condition_type) {
          case 'total_km': currentValue = Math.round(totalKm); break;
          case 'total_rides': currentValue = records; break;
          case 'single_distance': currentValue = Math.round(user.best_distance_km); break;
          case 'single_elevation': currentValue = Math.round(user.best_elevation_m); break;
          case 'xp': currentValue = user.xp; break;
          case 'level': currentValue = user.level; break;
        }
        progress = unlocked ? 100 : Math.min(100, (currentValue / targetValue) * 100);
      }

      const unit = badge.condition_type === 'total_km' || badge.condition_type === 'single_distance' ? 'km'
        : badge.condition_type === 'single_elevation' ? 'm'
        : badge.condition_type === 'xp' ? 'XP'
        : '';

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        image_url: badge.image_url,
        unlocked,
        progress: Math.round(progress),
        current: Math.min(currentValue, targetValue),
        target: targetValue,
        unit,
      };
    });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier son profil (nom, avatar, localisation)' })
  async updateMe(@Req() req: any, @Body() body: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: req.user.sub } });
    if (!user) throw new NotFoundException();
    if (body.name !== undefined) user.name = body.name;
    if (body.avatar_url !== undefined) user.avatar_url = body.avatar_url;
    if (body.country !== undefined) user.country = body.country;
    if (body.region !== undefined) user.region = body.region;
    if (body.city !== undefined) user.city = body.city;
    if (body.weight_kg !== undefined) user.weight_kg = body.weight_kg;
    await this.userRepo.save(user);
    const updated = await this.userRepo.findOne({ where: { id: req.user.sub }, relations: { user_badges: { badge: true } } });
    return this.formatProfile(updated!);
  }

  @Patch('me/onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marquer l\'onboarding comme terminé' })
  async completeOnboarding(@Req() req: any) {
    await this.userRepo.update(req.user.sub, { has_completed_onboarding: true });
    return { success: true };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Leaderboard global (classement par XP ou km, filtrable par région/pays/amis)' })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'filter', required: false, enum: ['global', 'friends'] })
  @ApiQuery({ name: 'sort', required: false, enum: ['xp', 'km'] })
  async leaderboard(
    @Query('country') country?: string,
    @Query('region') region?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: string,
    @Query('sort') sort?: string,
    @Req() req?: any,
  ) {
    if (sort === 'km') {
      // Leaderboard by total distance from sensor_records
      const qb = this.userRepo.manager.createQueryBuilder('users', 'u')
        .leftJoin('sensor_records', 'r', 'r.user_id = u.id')
        .select(['u.id AS id', 'u.name AS name', 'u.avatar_url AS avatar_url', 'u.level AS level', 'u.level_name AS level_name'])
        .addSelect('COALESCE(SUM(r.distance_km), 0)', 'total_km')
        .groupBy('u.id')
        .orderBy('total_km', 'DESC')
        .limit(Number(limit) || 50);

      if (filter === 'friends' && req?.user?.sub) {
        const friendships = await this.friendRepo.find({ where: { user_id: req.user.sub } });
        const friendIds = friendships.map(f => f.friend_id);
        friendIds.push(req.user.sub);
        if (friendIds.length > 0) qb.andWhere('u.id IN (:...friendIds)', { friendIds });
      }
      if (country) qb.andWhere('u.country = :country', { country });
      if (region) qb.andWhere('u.region = :region', { region });

      const results = await qb.getRawMany();
      return results.map((u, i) => ({ rank: i + 1, ...u, total_km: Math.round(Number(u.total_km) * 10) / 10 }));
    }

    const qb = this.userRepo.createQueryBuilder('u')
      .select(['u.id', 'u.name', 'u.avatar_url', 'u.xp', 'u.level', 'u.level_name', 'u.country', 'u.region', 'u.city'])
      .orderBy('u.xp', 'DESC');

    if (filter === 'friends' && req?.user?.sub) {
      const friendships = await this.friendRepo.find({ where: { user_id: req.user.sub } });
      const friendIds = friendships.map(f => f.friend_id);
      friendIds.push(req.user.sub);
      if (friendIds.length > 0) {
        qb.andWhere('u.id IN (:...friendIds)', { friendIds });
      }
    }

    if (country) qb.andWhere('u.country = :country', { country });
    if (region) qb.andWhere('u.region = :region', { region });
    qb.take(Number(limit) || 50);

    const users = await qb.getMany();
    return users.map((u, i) => ({ rank: i + 1, ...u }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil public d\'un utilisateur' })
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { user_badges: { badge: true }, tires: { catalog: true } },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const statsResult = await this.userRepo.manager
      .createQueryBuilder('sensor_records', 'r')
      .where('r.user_id = :id', { id })
      .select([
        'COALESCE(SUM(r.distance_km), 0) as total_km',
        'COALESCE(SUM(r.elevation_m), 0) as total_elevation',
        'COALESCE(MAX(r.max_speed), 0) as max_speed',
        'COALESCE(SUM(r.duration_seconds), 0) as total_seconds',
        'COUNT(*) as ride_count',
      ])
      .getRawOne();

    const tireStats = (() => {
      const byModel = new Map<string, { name: string; total_km: number; count: number; purchase_url: string | null }>();
      for (const t of user.tires || []) {
        const name = t.catalog?.name || 'Pneu inconnu';
        const entry = byModel.get(name) || { name, total_km: 0, count: 0, purchase_url: t.catalog?.purchase_url || null };
        entry.total_km += t.total_km;
        entry.count += 1;
        byModel.set(name, entry);
      }
      return [...byModel.values()].map(e => ({ name: e.name, total_km: Math.round(e.total_km), count: e.count, purchase_url: e.purchase_url }));
    })();

    return {
      ...this.formatProfile(user),
      stats: {
        total_km: Math.round(Number(statsResult?.total_km || 0)),
        total_elevation: Math.round(Number(statsResult?.total_elevation || 0)),
        max_speed: Math.round(Number(statsResult?.max_speed || 0) * 10) / 10,
        total_hours: Math.round(Number(statsResult?.total_seconds || 0) / 3600),
        ride_count: Number(statsResult?.ride_count || 0),
      },
      tires: tireStats,
    };
  }

  private formatProfile(user: User) {
    return {
      id: user.id,
      name: user.name,
      avatar_url: user.avatar_url || undefined,
      country: user.country || undefined,
      region: user.region || undefined,
      city: user.city || undefined,
      xp: user.xp,
      level: user.level,
      level_name: user.level_name,
      is_ambassador: user.is_ambassador,
      has_completed_onboarding: user.has_completed_onboarding,
      best_distance_km: user.best_distance_km,
      best_elevation_m: user.best_elevation_m,
      badges: user.user_badges?.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        image_url: ub.badge.image_url,
        earned_at: ub.unlocked_at,
      })) || [],
    };
  }
}
