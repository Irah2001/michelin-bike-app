import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USER || 'michelin_admin',
  password: process.env.DB_PASSWORD || 'michelin_password',
  database: process.env.DB_NAME || 'michelin_bike_db',
  entities: ['src/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
});
