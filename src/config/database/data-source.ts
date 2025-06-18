import { DataSource } from 'typeorm';
import { User } from '../../users/user.entity';
import { FavoritePair } from '../../favorites/favorite-pair.entity';
import { Alert } from '../../alerts/alert.entity';
import { ConversionHistory } from '../../currency/conversion-history.entity';
import * as dotenv from 'dotenv';
import { pathFromSrc } from '../helper/general';
dotenv.config();

// Validate environment variables
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export default new DataSource({
  type: 'postgres',
  host: requiredEnvVars.DB_HOST,
  port: Number(requiredEnvVars.DB_PORT),
  username: requiredEnvVars.DB_USERNAME,
  password: requiredEnvVars.DB_PASSWORD,
  database: requiredEnvVars.DB_NAME,
  entities: [pathFromSrc('**/*.entity.{js,ts}')],
  migrations: [pathFromSrc('config/migrations/**/*.{js,ts}')],
});