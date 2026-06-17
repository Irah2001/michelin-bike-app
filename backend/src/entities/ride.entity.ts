import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @CreateDateColumn()
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at: Date | null;

  @Column({ type: 'float', default: 0 })
  total_km: number;

  @Column({ type: 'float', default: 0 })
  total_elevation: number;

  @Column({ type: 'float', nullable: true })
  battery_end: number | null;
}
