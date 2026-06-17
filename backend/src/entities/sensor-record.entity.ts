import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Tire } from './tire.entity';

@Entity('sensor_records')
export class SensorRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  tire_id: string;

  // Source de la remontée
  @Column({ default: 'sensor' }) // 'sensor' | 'strava'
  source: string;

  @Column({ type: 'bigint', unique: true, nullable: true })
  strava_activity_id: string;

  // Données remontées
  @Column({ type: 'real' })
  distance_km: number;

  @Column({ type: 'real', default: 0 })
  elevation_m: number;

  @Column({ type: 'real', nullable: true })
  avg_speed: number;

  @Column({ type: 'real', nullable: true })
  max_speed: number;

  @Column({ nullable: true })
  duration_seconds: number;

  @Column({ type: 'real', nullable: true })
  avg_watts: number;

  @Column({ nullable: true })
  max_watts: number;

  @Column({ type: 'real', nullable: true })
  calories: number;

  @Column({ type: 'real', nullable: true })
  avg_cadence: number;

  @Column({ type: 'real', nullable: true })
  avg_temp: number;

  // Gamification
  @Column({ default: 0 })
  xp_earned: number;

  // Dates
  @Column({ type: 'timestamp' })
  recorded_at: Date;

  @CreateDateColumn()
  synced_at: Date;

  @ManyToOne(() => User, (user) => user.sensor_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tire, (tire) => tire.sensor_records, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tire_id' })
  tire: Tire;
}
