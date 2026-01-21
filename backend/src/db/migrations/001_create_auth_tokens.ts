import { query } from '../connection';

export const name = '001_create_auth_tokens';

export async function up(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id SERIAL PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created auth_tokens table');
}

export async function down(): Promise<void> {
  await query('DROP TABLE IF EXISTS auth_tokens;');
  console.log('Dropped auth_tokens table');
}
