import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('levels')
export class Level {
  @PrimaryColumn()
  level: number;

  @Column()
  name: string;

  @Column()
  xp_required: number;
}
