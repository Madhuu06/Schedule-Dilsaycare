require('dotenv').config();
const knex = require('knex');

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
};

async function setupDatabase() {
  const db = knex(config);
  
  try {
    console.log('🔌 Connecting to database...');
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful!');
    
    // Check if slots table exists
    const tableExists = await db.schema.hasTable('slots');
    console.log(`📋 Slots table exists: ${tableExists}`);
    
    if (!tableExists) {
      console.log('🏗️ Creating slots table...');
      
      // Create the slots table
      await db.schema.createTable('slots', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('title').notNullable();
        table.text('description');
        table.time('start_time').notNullable();
        table.time('end_time').notNullable();
        table.integer('day_of_week').notNullable(); // 0 = Sunday, 1 = Monday, etc.
        table.date('start_date').notNullable();
        table.date('end_date');
        table.string('recurrence_pattern').defaultTo('weekly');
        table.uuid('original_slot_id').references('id').inTable('slots');
        table.boolean('is_exception').defaultTo(false);
        table.date('exception_date');
        table.boolean('is_deleted').defaultTo(false);
        table.timestamps(true, true);
        
        // Add indexes for better performance
        table.index(['day_of_week', 'start_time']);
        table.index(['start_date', 'end_date']);
        table.index(['is_exception', 'exception_date']);
        table.index(['original_slot_id']);
      });
      
      console.log('✅ Slots table created successfully!');
    } else {
      console.log('ℹ️ Slots table already exists, checking structure...');
      
      // Check if all required columns exist
      const columns = await db('information_schema.columns')
        .select('column_name')
        .where({ table_name: 'slots', table_schema: 'public' });
      
      const columnNames = columns.map(col => col.column_name);
      console.log('📋 Existing columns:', columnNames);
      
      const requiredColumns = [
        'id', 'title', 'description', 'start_time', 'end_time', 
        'day_of_week', 'start_date', 'end_date', 'recurrence_pattern',
        'original_slot_id', 'is_exception', 'exception_date', 'is_deleted',
        'created_at', 'updated_at'
      ];
      
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Missing columns:', missingColumns);
        
        // Add missing columns
        await db.schema.alterTable('slots', (table) => {
          missingColumns.forEach(col => {
            switch(col) {
              case 'original_slot_id':
                table.uuid('original_slot_id').references('id').inTable('slots');
                break;
              case 'is_exception':
                table.boolean('is_exception').defaultTo(false);
                break;
              case 'exception_date':
                table.date('exception_date');
                break;
              case 'is_deleted':
                table.boolean('is_deleted').defaultTo(false);
                break;
              case 'created_at':
              case 'updated_at':
                table.timestamps(true, true);
                break;
              default:
                console.log(`Skipping column: ${col}`);
            }
          });
        });
        
        console.log('✅ Missing columns added!');
      }
    }
    
    // Verify table structure
    console.log('🔍 Verifying table structure...');
    const finalColumns = await db('information_schema.columns')
      .select('column_name', 'data_type', 'is_nullable')
      .where({ table_name: 'slots', table_schema: 'public' })
      .orderBy('ordinal_position');
    
    console.log('📋 Final table structure:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    
    // Test a simple query
    console.log('🧪 Testing query...');
    const count = await db('slots').count('* as count').first();
    console.log(`✅ Query test successful! Current slots count: ${count.count}`);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await db.destroy();
    console.log('🔌 Database connection closed.');
  }
}

setupDatabase();