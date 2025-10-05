// Script to check if the required database tables exist

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL');
  console.log('Set it with: export DATABASE_URL="your_database_url"');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    console.log('================================');
    
    // Check if tg_login_tokens table exists
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'tg_login_tokens'
    `);
    
    if (rows.length > 0) {
      console.log('✅ tg_login_tokens table exists');
      
      // Check table structure
      const { rows: columns } = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'tg_login_tokens'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check if there are any existing tokens
      const { rows: tokens } = await pool.query(`
        SELECT COUNT(*) as count FROM tg_login_tokens
      `);
      
      console.log(`\n📊 Total tokens: ${tokens[0].count}`);
      
      // Check feedback table
      const { rows: feedbackExists } = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'tg_user_feedback'
        );
      `);
      
      if (feedbackExists[0].exists) {
        console.log('\n✅ tg_user_feedback table exists');
        const { rows: feedbackCount } = await pool.query('SELECT COUNT(*) as count FROM tg_user_feedback');
        console.log(`📊 Total feedback entries: ${feedbackCount[0].count}`);
      } else {
        console.log('\n❌ tg_user_feedback table does not exist');
      }
      
    } else {
      console.log('❌ tg_login_tokens table does not exist');
      console.log('\n🔧 Creating the table...');
      
      await pool.query(`
        CREATE TABLE tg_login_tokens (
          id bigserial primary key,
          token text unique not null,
          telegram_id bigint not null,
          telegram_username text,
          first_name text,
          last_name text,
          created_at timestamptz not null default now(),
          expires_at timestamptz not null,
          consumed_at timestamptz
        );
        CREATE INDEX idx_tg_login_tokens_token ON tg_login_tokens(token);
        CREATE INDEX idx_tg_login_tokens_expires ON tg_login_tokens(expires_at);
      `);
      
      console.log('✅ Table created successfully!');
    }
    
    // Check Supabase tables
    console.log('\n🔍 Checking Supabase tables...');
    
    const { rows: supabaseTables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'questions', 'answers', 'badges')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Supabase tables:');
    supabaseTables.forEach(table => {
      console.log(`  ✅ ${table.table_name}`);
    });
    
    const missingTables = ['profiles', 'questions', 'answers', 'badges'].filter(
      table => !supabaseTables.some(t => t.table_name === table)
    );
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing Supabase tables:');
      missingTables.forEach(table => {
        console.log(`  ❌ ${table}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the check
checkTables().catch(console.error);
