import knex from 'knex';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Database configuration with explicit string conversion for password
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: String(process.env.DB_HOST || 'localhost'),
    port: parseInt(process.env.DB_PORT || '5432'),
    database: String(process.env.DB_NAME || 'scheduler_db'),
    user: String(process.env.DB_USER || 'postgres'),
    password: String(process.env.DB_PASSWORD || 'password'),
    // Enable SSL for external connections (Render requires SSL)
    ssl: process.env.DB_HOST?.includes('render.com') ? {
      rejectUnauthorized: false
    } : false,
    connectTimeout: 60000,
    requestTimeout: 30000
  },
  pool: {
    min: 1,
    max: 5
  },
  acquireConnectionTimeout: 60000
};

console.log('Database connection config:', {
  host: dbConfig.connection.host,
  port: dbConfig.connection.port,
  database: dbConfig.connection.database,
  user: dbConfig.connection.user,
  passwordLength: dbConfig.connection.password.length,
  environment
});

const db = knex(dbConfig);

export default db;