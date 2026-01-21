import { query } from '../connection';

export const name = '002_create_config';

export async function up(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS config (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created config table');
}

export async function down(): Promise<void> {
  await query('DROP TABLE IF EXISTS config;');
  console.log('Dropped config table');
}
