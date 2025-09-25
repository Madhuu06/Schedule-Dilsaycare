require('ts-node/register');
require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'scheduler_db',
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || 'password')
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD),
      ssl: {
        rejectUnauthorized: false
      }
    },
    migrations: {
      directory: './dist/database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './dist/database/seeds',
      extension: 'js'
    }
  }
};