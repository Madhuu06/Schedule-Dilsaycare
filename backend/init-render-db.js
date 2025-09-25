require('dotenv').config();
const { Client } = require('pg');

// Database connection configuration with proper SSL settings
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  query_timeout: 60000,
  statement_timeout: 60000
};

async function setupDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    console.log(`📍 Host: ${dbConfig.host}`);
    console.log(`📊 Database: ${dbConfig.database}`);
    
    await client.connect();
    console.log('✅ Successfully connected to database!');
    
    // Drop table if exists (for clean setup)
    console.log('\n🗑️ Dropping existing slots table if it exists...');
    await client.query('DROP TABLE IF EXISTS slots CASCADE;');
    console.log('✅ Existing table dropped (if it existed)');
    
    // Create slots table
    console.log('\n🔧 Creating slots table...');
    const createTableQuery = `
      CREATE TABLE slots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255),
        description TEXT,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        is_recurring BOOLEAN DEFAULT true,
        is_exception BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        original_slot_id UUID REFERENCES slots(id) ON DELETE SET NULL,
        exception_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log('✅ Slots table created successfully!');
    
    // Create indexes for better performance
    console.log('\n📇 Creating database indexes...');
    
    const indexes = [
      'CREATE INDEX idx_slots_day_of_week ON slots(day_of_week);',
      'CREATE INDEX idx_slots_is_exception ON slots(is_exception);',
      'CREATE INDEX idx_slots_is_deleted ON slots(is_deleted);',
      'CREATE INDEX idx_slots_exception_date ON slots(exception_date);',
      'CREATE INDEX idx_slots_original_slot_id ON slots(original_slot_id);',
      'CREATE INDEX idx_slots_recurring_active ON slots(day_of_week, is_recurring, is_deleted) WHERE is_exception = false;'
    ];
    
    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Database indexes created successfully!');
    
    // Create updated_at trigger function
    console.log('\n⚡ Creating trigger for updated_at...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    await client.query(`
      CREATE TRIGGER update_slots_updated_at 
      BEFORE UPDATE ON slots 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Trigger created successfully!');
    
    // Verify table structure
    console.log('\n🔍 Verifying table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'slots'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });
    
    // Insert sample data for testing
    console.log('\n📝 Inserting sample data...');
    const sampleData = `
      INSERT INTO slots (title, description, start_time, end_time, day_of_week, is_recurring)
      VALUES 
        ('Morning Meeting', 'Daily standup meeting', '09:00', '09:30', 1, true),
        ('Lunch Break', 'Team lunch', '12:00', '13:00', 2, true),
        ('Review Session', 'Code review', '15:00', '16:00', 3, true);
    `;
    
    await client.query(sampleData);
    console.log('✅ Sample data inserted successfully!');
    
    // Test query
    console.log('\n🧪 Testing data retrieval...');
    const testQuery = await client.query('SELECT COUNT(*) as total_slots FROM slots;');
    console.log(`📊 Total slots in database: ${testQuery.rows[0].total_slots}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 Your application should now work properly!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('📝 Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

// Run the setup
setupDatabase();