import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';
import { pathFromSrc } from '../helper/general';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  entities: [pathFromSrc('/**/*.entity.{js,ts}')],
  migrations: [pathFromSrc('config/migrations/**/*.{js,ts}')],
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

dataSource
  .initialize()
  .then(() => {
    console.log('Database connection established successfully!');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
