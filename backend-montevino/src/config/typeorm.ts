import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenvConfig({ path: '.development.env' });

const isProd = process.env.NODE_ENV === 'production';

export const config: DataSourceOptions = isProd
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL, // Render la provee
      synchronize: true,
      logging: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*{.ts,.js}'],
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      dropSchema: true,
      synchronize: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*{.ts,.js}'],
    };

export default registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config);
