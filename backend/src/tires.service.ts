import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tire } from './entities/tire.entity';
import { Catalog } from './entities/catalog.entity';
import { SensorRecord } from './entities/sensor-record.entity';
import { SensorReading } from './entities/sensor-reading.entity';
import { Ride } from './entities/ride.entity';
import { CreateTireDto, UpdateTireDto } from './dto/tires.dto';

@Injectable()
export class TiresService {
  constructor(
    @InjectRepository(Tire) private tireRepo: Repository<Tire>,
    @InjectRepository(Catalog) private catalogRepo: Repository<Catalog>,
    @InjectRepository(SensorRecord) private sensorRecordRepo: Repository<SensorRecord>,
    @InjectRepository(SensorReading) private sensorReadingRepo: Repository<SensorReading>,
    @InjectRepository(Ride) private rideRepo: Repository<Ride>,
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
    const tire = this.tireRepo.create({ user_id: userId, catalog_id: dto.catalog_id, position: dto.position });
    return this.tireRepo.save(tire);
  }

  async remove(id: string, userId: string) {
    const tire = await this.tireRepo.findOne({ where: { id, user_id: userId } });
    if (!tire) throw new NotFoundException('Pneu non trouvé');
    await this.tireRepo.remove(tire);
    return { deleted: true };
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

  async getReadings(tireId: string, userId: string) {
    const tire = await this.tireRepo.findOne({ where: { id: tireId, user_id: userId } });
    if (!tire) throw new NotFoundException('Pneu non trouvé');

    // Get sensor_records linked to this tire to find ride_ids
    const records = await this.sensorRecordRepo.find({
      where: { tire_id: tireId },
      order: { recorded_at: 'DESC' },
      take: 20,
    });

    // Get sensor readings from linked rides
    const sensorPosition = tire.position === 'front' ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222';
    const readings = await this.sensorReadingRepo
      .createQueryBuilder('sr')
      .where('sr.sensor_id = :sensorId', { sensorId: sensorPosition })
      .orderBy('sr.time', 'DESC')
      .limit(50)
      .getMany();

    // Get the last ride for this user (to display GPS trace)
    const lastRide = await this.rideRepo.findOne({ where: { user_id: userId }, order: { started_at: 'DESC' } });

    return {
      tire: { id: tire.id, position: tire.position, total_km: tire.total_km, wear_score: tire.wear_score, installed_at: tire.installed_at },
      last_ride_id: lastRide?.id || null,
      rides: records.map(r => ({
        id: r.id,
        distance_km: r.distance_km,
        elevation_m: r.elevation_m,
        avg_speed: r.avg_speed,
        duration_seconds: r.duration_seconds,
        avg_temp: r.avg_temp,
        recorded_at: r.recorded_at,
      })),
      sensor_readings: readings.map(r => ({
        time: r.time,
        pressure: r.pressure,
        temperature: r.temperature,
        battery_pct: r.battery_pct,
      })),
    };
  }
}
