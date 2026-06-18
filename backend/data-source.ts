import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USER || 'michelin_admin',
  password: process.env.DB_PASSWORD || 'michelin_password',
  database: process.env.DB_NAME || 'michelin_bike_db',
  ssl: isProd ? { rejectUnauthorized: false } : false,
  entities: isProd ? ['dist/entities/*.js'] : ['src/entities/*.ts'],
  migrations: isProd ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],
});
