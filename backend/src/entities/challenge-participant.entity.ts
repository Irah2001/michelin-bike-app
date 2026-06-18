import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';

@Entity('challenge_participants')
export class ChallengeParticipant {
  @PrimaryColumn()
  challenge_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column({ type: 'real', default: 0 })
  contributed_km: number;

  @CreateDateColumn()
  joined_at: Date;

  @ManyToOne(() => Challenge, (challenge) => challenge.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge;

  @ManyToOne(() => User, (user) => user.challenge_participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
