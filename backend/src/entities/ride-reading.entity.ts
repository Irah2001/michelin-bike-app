import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('ride_readings')
export class RideReading {
  @PrimaryColumn('timestamptz')
  time: Date;

  @PrimaryColumn('uuid')
  @Index()
  ride_id: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column('float')
  distance_km: number;

  @Column('float')
  elevation_m: number;

  @Column('int')
  duration_s: number;
}
