import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Tire } from './tire.entity';
import { SensorRecord } from './sensor-record.entity';
import { UserBadge } from './user-badge.entity';
import { Challenge } from './challenge.entity';
import { ChallengeParticipant } from './challenge-participant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  city: string;

  // Strava (optionnel)
  @Column({ type: 'bigint', unique: true, nullable: true })
  strava_id: string;

  @Column({ nullable: true })
  strava_access_token: string;

  @Column({ nullable: true })
  strava_refresh_token: string;

  @Column({ type: 'bigint', nullable: true })
  strava_token_expires_at: string;

  // Gamification
  @Column({ default: 0 })
  xp: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 'Rookie' })
  level_name: string;

  // Statut
  @Column({ default: false })
  is_ambassador: boolean;

  @Column({ default: false })
  is_verified: boolean;

  // Records
  @Column({ type: 'real', default: 0 })
  best_distance_km: number;

  @Column({ type: 'real', default: 0 })
  best_elevation_m: number;

  @Column({ type: 'real', nullable: true })
  weight_kg: number;

  @Column({ default: false })
  has_completed_onboarding: boolean;

  @Column({ unique: true, nullable: true })
  friend_code: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Tire, (tire) => tire.user)
  tires: Tire[];

  @OneToMany(() => SensorRecord, (sr) => sr.user)
  sensor_records: SensorRecord[];

  @OneToMany(() => UserBadge, (ub) => ub.user)
  user_badges: UserBadge[];

  @OneToMany(() => Challenge, (c) => c.creator)
  created_challenges: Challenge[];

  @OneToMany(() => ChallengeParticipant, (cp) => cp.user)
  challenge_participations: ChallengeParticipant[];
}
