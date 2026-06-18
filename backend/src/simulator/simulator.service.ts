import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from '../entities/sensor.entity';
import { Ride } from '../entities/ride.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { RideReading } from '../entities/ride-reading.entity';
import { WearEstimate } from '../entities/wear-estimate.entity';
import { SensorGateway } from './sensor.gateway';
import { SensorDataService } from '../sensor-data.service';

const FRONT_SENSOR_ID = '11111111-1111-1111-1111-111111111111';
const REAR_SENSOR_ID = '22222222-2222-2222-2222-222222222222';
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

// Starting point: Clermont-Ferrand (Michelin HQ)
const BASE_LAT = 45.7796;
const BASE_LNG = 3.0869;

@Injectable()
export class SimulatorService {
  private isRunning = false;
  private currentRideId: string | null = null;
  private elapsedSeconds = 0;
  private totalDistanceKm = 0;
  private totalElevationM = 0;
  private currentLat = BASE_LAT;
  private currentLng = BASE_LNG;
  private frontBattery = 100;
  private rearBattery = 100;
  private recentTemperatures: number[] = [];

  private dataInterval: ReturnType<typeof setInterval> | null = null;
  private wearInterval: ReturnType<typeof setInterval> | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private lastSyncedKm = 0;

  constructor(
    @InjectRepository(Sensor) private sensorRepo: Repository<Sensor>,
    @InjectRepository(Ride) private rideRepo: Repository<Ride>,
    @InjectRepository(SensorReading) private sensorReadingRepo: Repository<SensorReading>,
    @InjectRepository(RideReading) private rideReadingRepo: Repository<RideReading>,
    @InjectRepository(WearEstimate) private wearEstimateRepo: Repository<WearEstimate>,
    private readonly sensorGateway: SensorGateway,
    private readonly sensorDataService: SensorDataService,
  ) {}

  private activeUserId: string = DEV_USER_ID;

  async start(userId?: string): Promise<{ rideId: string }> {
    if (this.isRunning) throw new ConflictException('Simulator is already running');

    this.activeUserId = userId || DEV_USER_ID;
    await this.ensureSensors();

    const ride = await this.rideRepo.save(
      this.rideRepo.create({ user_id: this.activeUserId }),
    );
    this.currentRideId = ride.id;

    this.elapsedSeconds = 0;
    this.totalDistanceKm = 0;
    this.totalElevationM = 0;
    this.currentLat = BASE_LAT;
    this.currentLng = BASE_LNG;
    this.frontBattery = 100;
    this.rearBattery = 100;
    this.recentTemperatures = [];
    this.lastSyncedKm = 0;
    this.isRunning = true;

    this.dataInterval = setInterval(() => void this.generateData(), 2000);
    this.wearInterval = setInterval(() => void this.calculateWear(), 30000);
    this.syncInterval = setInterval(() => void this.periodicSync(), 60000);

    return { rideId: this.currentRideId };
  }

  async stop(): Promise<{ synced: boolean }> {
    if (!this.isRunning) return { synced: false };

    if (this.dataInterval) clearInterval(this.dataInterval);
    if (this.wearInterval) clearInterval(this.wearInterval);
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.dataInterval = null;
    this.wearInterval = null;
    this.syncInterval = null;

    if (this.currentRideId) {
      await this.rideRepo.update(this.currentRideId, {
        ended_at: new Date(),
        total_km: this.totalDistanceKm,
        total_elevation: this.totalElevationM,
        battery_end: +((this.frontBattery + this.rearBattery) / 2).toFixed(1),
      });

      // Sync to user stats (XP, badges, challenges)
      if (this.totalDistanceKm > this.lastSyncedKm) {
        const deltaKm = this.totalDistanceKm - this.lastSyncedKm;
        const avgSpeed = this.totalDistanceKm / (this.elapsedSeconds / 3600);
        // Update ALL active tires for this user
        const activeTires = await this.sensorDataService['tireRepo'].find({ where: { user_id: this.activeUserId, is_active: true } });
        const tireId = activeTires[0]?.id;
        await this.sensorDataService.create(this.activeUserId, {
          distance_km: +deltaKm.toFixed(2),
          elevation_m: +this.totalElevationM.toFixed(0),
          avg_speed: +avgSpeed.toFixed(1),
          duration_seconds: this.elapsedSeconds,
          tire_id: tireId,
        });
        // Update km on the second tire too
        if (activeTires[1]) {
          const tire2 = activeTires[1];
          tire2.total_km += deltaKm;
          const lifespan = tire2.catalog?.expected_lifespan_km || 5000;
          tire2.wear_score = Math.max(0, Math.round(100 - (tire2.total_km / lifespan) * 100));
          await this.sensorDataService['tireRepo'].save(tire2);
        }
      }
    }

    this.isRunning = false;
    this.currentRideId = null;
    return { synced: true };
  }

  async getSensorReadings(rideId: string): Promise<SensorReading[]> {
    return this.sensorReadingRepo.find({
      where: { ride_id: rideId },
      order: { time: 'ASC' },
    });
  }

  async getRideReadings(rideId: string): Promise<RideReading[]> {
    return this.rideReadingRepo.find({
      where: { ride_id: rideId },
      order: { time: 'ASC' },
    });
  }

  async getWearEstimates(rideId: string): Promise<WearEstimate[]> {
    return this.wearEstimateRepo.find({
      where: { ride_id: rideId },
      order: { calculated_at: 'ASC' },
    });
  }

  private async ensureSensors(): Promise<void> {
    const sensors = [
      { id: FRONT_SENSOR_ID, position: 'front' as const, label: 'Capteur avant' },
      { id: REAR_SENSOR_ID, position: 'rear' as const, label: 'Capteur arrière' },
    ];
    for (const s of sensors) {
      const exists = await this.sensorRepo.findOne({ where: { id: s.id } });
      if (!exists) {
        await this.sensorRepo.save(
          this.sensorRepo.create({ ...s, user_id: this.activeUserId }),
        );
      }
    }
  }

  private async generateData(): Promise<void> {
    if (!this.currentRideId) return;
    this.elapsedSeconds += 2;

    const now = new Date();

    // Temperature: 20°C → 70°C over 10 minutes, then stabilises
    const tempProgress = Math.min(1, this.elapsedSeconds / 600);
    const baseTemp = 20 + tempProgress * 50;
    const frontTemp = +(baseTemp + (Math.random() - 0.5) * 2).toFixed(1);
    const rearTemp = +(baseTemp + (Math.random() - 0.5) * 2 + 2).toFixed(1);

    this.frontBattery = +Math.max(0, this.frontBattery - 0.05).toFixed(1);
    this.rearBattery = +Math.max(0, this.rearBattery - 0.04).toFixed(1);

    // Movement at 15–20 km/h
    const speedKmh = 15 + Math.random() * 5;
    const distanceStep = (speedKmh / 3600) * 2;
    this.totalDistanceKm += distanceStep;

    // Elevation: gentle sinusoidal gain
    const elevGain = Math.max(0, Math.sin(this.elapsedSeconds / 120) * 0.3);
    this.totalElevationM += elevGain;

    // GPS drift NE from Clermont-Ferrand
    const latPerKm = 1 / 111.0;
    const lngPerKm = 1 / (111.0 * Math.cos(this.currentLat * (Math.PI / 180)));
    this.currentLat += distanceStep * latPerKm * 0.7;
    this.currentLng += distanceStep * lngPerKm * 0.7;

    const frontReading = {
      time: now,
      sensor_id: FRONT_SENSOR_ID,
      ride_id: this.currentRideId,
      pressure: +(5.8 + Math.random() * 0.6).toFixed(2),
      temperature: frontTemp,
      battery_pct: this.frontBattery,
    };
    const rearReading = {
      time: now,
      sensor_id: REAR_SENSOR_ID,
      ride_id: this.currentRideId,
      pressure: +(5.8 + Math.random() * 0.6).toFixed(2),
      temperature: rearTemp,
      battery_pct: this.rearBattery,
    };

    try {
      await this.sensorReadingRepo.insert(frontReading);
      await this.sensorReadingRepo.insert(rearReading);

      this.recentTemperatures.push((frontTemp + rearTemp) / 2);

      const rideReading = {
        time: now,
        ride_id: this.currentRideId,
        lat: +this.currentLat.toFixed(6),
        lng: +this.currentLng.toFixed(6),
        distance_km: +this.totalDistanceKm.toFixed(3),
        elevation_m: +this.totalElevationM.toFixed(1),
        duration_s: this.elapsedSeconds,
      };
      await this.rideReadingRepo.insert(rideReading);

      this.sensorGateway.emitSensorReading({ front: frontReading, rear: rearReading });
      this.sensorGateway.emitRideReading(rideReading);
    } catch {
      // Timestamp collision (extremely rare at 2s interval) — skip this tick
    }
  }

  private async periodicSync(): Promise<void> {
    if (!this.isRunning || this.totalDistanceKm <= this.lastSyncedKm) return;
    const deltaKm = this.totalDistanceKm - this.lastSyncedKm;
    if (deltaKm < 0.1) return;

    try {
      const avgSpeed = this.totalDistanceKm / (this.elapsedSeconds / 3600);
      const activeTires = await this.sensorDataService['tireRepo'].find({
        where: { user_id: this.activeUserId, is_active: true },
        relations: { catalog: true },
      });

      // Update both tires' km and wear
      for (const tire of activeTires) {
        tire.total_km += deltaKm;
        const lifespan = tire.catalog?.expected_lifespan_km || 5000;
        tire.wear_score = Math.max(0, Math.round(100 - (tire.total_km / lifespan) * 100));
        await this.sensorDataService['tireRepo'].save(tire);
      }

      // Update user XP, challenges, etc.
      await this.sensorDataService.create(this.activeUserId, {
        distance_km: +deltaKm.toFixed(2),
        elevation_m: 0,
        avg_speed: +avgSpeed.toFixed(1),
        duration_seconds: 60,
        tire_id: activeTires[0]?.id,
      });

      this.lastSyncedKm = this.totalDistanceKm;
    } catch {}
  }

  private async calculateWear(): Promise<void> {
    if (!this.currentRideId || !this.isRunning) return;

    const avgTemp =
      this.recentTemperatures.length > 0
        ? this.recentTemperatures.reduce((a, b) => a + b, 0) / this.recentTemperatures.length
        : 20;
    this.recentTemperatures = [];

    const wearPct = +Math.min(
      100,
      this.totalDistanceKm * 0.5 + (avgTemp - 20) * 0.4,
    ).toFixed(2);

    for (const sensorId of [FRONT_SENSOR_ID, REAR_SENSOR_ID]) {
      await this.wearEstimateRepo.save(
        this.wearEstimateRepo.create({
          sensor_id: sensorId,
          ride_id: this.currentRideId!,
          wear_pct: wearPct,
        }),
      );
    }
  }
}
