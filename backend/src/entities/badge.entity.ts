import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserBadge } from './user-badge.entity';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  image_url: string;

  @Column()
  condition_type: string;

  @Column({ type: 'real' })
  condition_value: number;

  @OneToMany(() => UserBadge, (ub) => ub.badge)
  user_badges: UserBadge[];
}
