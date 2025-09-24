const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // First connect to postgres database to create our target database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const dbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME || 'scheduler_db']
    );

    if (dbExists.rows.length === 0) {
      // Create the database
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'scheduler_db'}`);
      console.log(`✅ Database '${process.env.DB_NAME || 'scheduler_db'}' created successfully!`);
    } else {
      console.log(`✅ Database '${process.env.DB_NAME || 'scheduler_db'}' already exists!`);
    }

  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();