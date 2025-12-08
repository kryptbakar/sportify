import { Pool } from 'pg';
import fs from 'fs';

const DATABASE_URL = "postgresql://postgres:REPbIzOuDgNvbDTgUbmAZjrfQdaTtPmB@yamabiko.proxy.rlwy.net:35713/railway";

const pool = new Pool({ connectionString: DATABASE_URL });

async function runMigration() {
  try {
    const sql = fs.readFileSync('./migrations/0001_init.sql', 'utf-8');
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
