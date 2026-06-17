import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorRecord } from './entities/sensor-record.entity';
import { User } from './entities/user.entity';
import { Tire } from './entities/tire.entity';
import { StravaService } from './strava/strava.service';
import { CreateSensorDataDto } from './dto/sensor-data.dto';

@Injectable()
export class SensorDataService {
  constructor(
    @InjectRepository(SensorRecord) private recordRepo: Repository<SensorRecord>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tire) private tireRepo: Repository<Tire>,
    private stravaService: StravaService,
  ) {}

  async findAll(userId: string) {
    return this.recordRepo.find({ where: { user_id: userId }, order: { recorded_at: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    return this.recordRepo.findOne({ where: { id, user_id: userId } });
  }

  async create(userId: string, dto: CreateSensorDataDto) {
    const record = this.recordRepo.create({
      user_id: userId,
      source: 'sensor',
      distance_km: dto.distance_km,
      elevation_m: dto.elevation_m || 0,
      avg_speed: dto.avg_speed,
      max_speed: dto.max_speed,
      duration_seconds: dto.duration_seconds,
      avg_watts: dto.avg_watts,
      calories: dto.calories,
      avg_cadence: dto.avg_cadence,
      avg_temp: dto.avg_temp,
      tire_id: dto.tire_id || undefined,
      recorded_at: new Date(),
    } as any);
    const saved = await this.recordRepo.save(record);

    // Update tire km + wear_score
    if (dto.tire_id) {
      await this.updateTireWear(dto.tire_id, dto.distance_km);
    }

    // Update user stats
    await this.updateUserStats(userId, dto.distance_km, dto.elevation_m || 0);

    return saved;
  }

  async syncStrava(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.strava_access_token) return { synced: 0 };

    let token = user.strava_access_token;
    // Refresh token if expired
    if (user.strava_token_expires_at && Number(user.strava_token_expires_at) < Date.now() / 1000) {
      const refreshed = await this.stravaService.refreshToken(user.strava_refresh_token);
      token = refreshed.access_token;
      user.strava_access_token = refreshed.access_token;
      user.strava_refresh_token = refreshed.refresh_token;
      user.strava_token_expires_at = String(refreshed.expires_at);
      await this.userRepo.save(user);
    }

    const activities = await this.stravaService.getActivities(token);
    let synced = 0;

    for (const act of activities) {
      const exists = await this.recordRepo.findOne({ where: { strava_activity_id: String(act.id) } });
      if (exists) continue;

      await this.recordRepo.save(this.recordRepo.create({
        user_id: userId,
        source: 'strava',
        strava_activity_id: String(act.id),
        distance_km: act.distance / 1000,
        elevation_m: act.total_elevation_gain || 0,
        avg_speed: act.average_speed ? act.average_speed * 3.6 : null,
        max_speed: act.max_speed ? act.max_speed * 3.6 : null,
        duration_seconds: act.moving_time,
        avg_watts: act.average_watts || null,
        calories: act.calories || null,
        avg_cadence: act.average_cadence || null,
        avg_temp: act.average_temp || null,
        recorded_at: new Date(act.start_date),
      } as any));
      synced++;

      await this.updateUserStats(userId, act.distance / 1000, act.total_elevation_gain || 0);
    }

    return { synced };
  }

  private async updateTireWear(tireId: string, distanceKm: number) {
    const tire = await this.tireRepo.findOne({ where: { id: tireId }, relations: { catalog: true } });
    if (!tire) return;
    tire.total_km += distanceKm;
    const lifespan = tire.catalog?.expected_lifespan_km || 5000;
    tire.wear_score = Math.max(0, Math.round(100 - (tire.total_km / lifespan) * 100));
    await this.tireRepo.save(tire);
  }

  private async updateUserStats(userId: string, distanceKm: number, elevationM: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    if (distanceKm > user.best_distance_km) user.best_distance_km = distanceKm;
    if (elevationM > user.best_elevation_m) user.best_elevation_m = elevationM;
    // XP: 10 per km
    user.xp += Math.round(distanceKm * 10);
    // Level up every 1000 xp
    const levels = ['Rookie', 'Rider', 'Sportif', 'Expert', 'Pro', 'Légende'];
    user.level = Math.min(levels.length, Math.floor(user.xp / 1000) + 1);
    user.level_name = levels[user.level - 1] || 'Légende';
    await this.userRepo.save(user);
  }
}
