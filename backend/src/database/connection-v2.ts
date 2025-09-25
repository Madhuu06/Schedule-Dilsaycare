import knex from 'knex';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const environment = (process.env.NODE_ENV || 'development') as 'development' | 'production';

const config = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'scheduler_db',
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || 'password'),
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: String(process.env.DB_HOST),
      port: parseInt(process.env.DB_PORT || '5432'),
      database: String(process.env.DB_NAME),
      user: String(process.env.DB_USER),
      password: String(process.env.DB_PASSWORD),
      ssl: {
        rejectUnauthorized: false
      }
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};

const db = knex(config[environment as keyof typeof config]);

export default db;