import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Badge } from './badge.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  badge_id: string;

  @CreateDateColumn()
  unlocked_at: Date;

  @ManyToOne(() => User, (user) => user.user_badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Badge, (badge) => badge.user_badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge;
}
