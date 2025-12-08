import { Pool } from 'pg';
import fs from 'fs';

const DATABASE_URL = "postgresql://postgres:hYKPwBdpsuDbqcrgPkpxgQmMFWOULqsq@caboose.proxy.rlwy.net:29526/railway";

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  let retries = 3;
  while (retries > 0) {
    try {
      console.log(`Attempting connection (${4 - retries}/3)...`);
      const client = await pool.connect();
      console.log('✅ Connected to database!');
      
      const sql = fs.readFileSync('./migrations/0001_init.sql', 'utf-8');
      const statements = sql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.substring(0, 50) + '...');
          await client.query(statement);
        }
      }
      
      client.release();
      console.log('✅ Database migration completed successfully!');
      process.exit(0);
    } catch (err: any) {
      console.error(`❌ Attempt failed:`, err.message);
      retries--;
      if (retries > 0) {
        console.log(`Retrying in 3 seconds...`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        console.error('❌ All retries failed');
        process.exit(1);
      }
    }
  }
  await pool.end();
}

runMigration();
