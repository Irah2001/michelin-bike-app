import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Catalog } from './catalog.entity';
import { SensorRecord } from './sensor-record.entity';

@Entity('tires')
export class Tire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  catalog_id: string;

  @CreateDateColumn()
  installed_at: Date;

  @Column({ type: 'real', default: 0 })
  total_km: number;

  @Column({ default: 100 })
  wear_score: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  position: string;

  @ManyToOne(() => User, (user) => user.tires, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Catalog, (catalog) => catalog.tires, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'catalog_id' })
  catalog: Catalog;

  @OneToMany(() => SensorRecord, (sr) => sr.tire)
  sensor_records: SensorRecord[];
}
