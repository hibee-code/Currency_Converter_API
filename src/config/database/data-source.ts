import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '../../**/*.entity.{js,ts}')],
  migrations: [join(__dirname, '../../config/migrations/**/*.{js,ts}')],
  synchronize: false, // Set to false for production
};

export const AppDataSource = new DataSource(dataSourceOptions);
