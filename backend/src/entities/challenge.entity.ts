import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ChallengeParticipant } from './challenge-participant.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  created_by: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'real' })
  target_km: number;

  @Column({ type: 'real', default: 0 })
  current_km: number;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  reward_description: string;

  @ManyToOne(() => User, (user) => user.created_challenges)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ChallengeParticipant, (cp) => cp.challenge)
  participants: ChallengeParticipant[];
}
