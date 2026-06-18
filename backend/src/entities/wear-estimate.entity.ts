import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('wear_estimates')
export class WearEstimate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  sensor_id: string;

  @Column('uuid')
  @Index()
  ride_id: string;

  @Column('float')
  wear_pct: number;

  @CreateDateColumn()
  calculated_at: Date;
}
