import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1718700000000 implements MigrationInterface {
  name = 'InitSchema1718700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Baseline migration — schema already exists from synchronize:true
    // All future schema changes go in new migrations
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op
  }
}
