import { DataSource } from 'typeorm';
import { User } from '../../users/user.entity';
import { FavoritePair } from '../../favorites/favorite-pair.entity';
import { Alert } from '../../alerts/alert.entity';
import { ConversionHistory } from '../../currency/conversion-history.entity';
import * as dotenv from 'dotenv';
import { pathFromSrc } from '../../config/helper/general';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [pathFromSrc('/**/*.entity.{js,ts}')],
  migrations: [pathFromSrc('config/migrations/**/*.{js,ts}')],
});