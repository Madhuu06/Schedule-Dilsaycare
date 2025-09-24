require('dotenv').config();
const knex = require('knex');

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'scheduler_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  }
};

async function testConnection() {
  const db = knex(config);
  
  try {
    console.log('Testing database connection...');
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful!');
    
    // Test the slots table
    const result = await db('slots').select('*').limit(5);
    console.log('✅ Slots query successful!');
    console.log('Found slots:', result.length);
    console.log('Slots:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testConnection();
