import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type SensorPosition = 'front' | 'rear';

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 10 })
  position: SensorPosition;

  @Column()
  label: string;

  @CreateDateColumn()
  created_at: Date;
}
