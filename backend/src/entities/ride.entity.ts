import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Tire } from './tire.entity';

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  tire_id: string;

  // Source
  @Column({ default: 'manual' })
  source: string;

  @Column({ type: 'bigint', unique: true, nullable: true })
  strava_activity_id: string;

  // Données sortie
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  sport_type: string;

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

  @Column({ nullable: true })
  elapsed_seconds: number;

  // Données enrichies Strava
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

  // Géo
  @Column({ type: 'real', nullable: true })
  start_lat: number;

  @Column({ type: 'real', nullable: true })
  start_lng: number;

  @Column({ type: 'text', nullable: true })
  polyline: string;

  // Gamification
  @Column({ default: 0 })
  xp_earned: number;

  // Dates
  @Column({ type: 'timestamp' })
  ride_date: Date;

  @CreateDateColumn()
  synced_at: Date;

  @ManyToOne(() => User, (user) => user.rides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tire, (tire) => tire.rides, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tire_id' })
  tire: Tire;
}
