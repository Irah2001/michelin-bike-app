import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('sensor_readings')
export class SensorReading {
  @PrimaryColumn('timestamptz')
  time: Date;

  @PrimaryColumn('uuid')
  sensor_id: string;

  @Column('uuid')
  @Index()
  ride_id: string;

  @Column('float')
  pressure: number;

  @Column('float')
  temperature: number;

  @Column('float')
  battery_pct: number;
}
