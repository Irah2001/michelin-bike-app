import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tire } from './tire.entity';

@Entity('catalog')
export class Catalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  usage_type: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ type: 'real', default: 5000 })
  expected_lifespan_km: number;

  @Column({ type: 'real', nullable: true })
  price: number;

  @Column({ nullable: true })
  purchase_url: string;

  @OneToMany(() => Tire, (tire) => tire.catalog)
  tires: Tire[];
}
