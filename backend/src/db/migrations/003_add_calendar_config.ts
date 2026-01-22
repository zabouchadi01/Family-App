import { query } from '../connection';

export const name = '003_add_calendar_config';

export async function up(): Promise<void> {
  await query(`
    INSERT INTO config (key, value, updated_at)
    VALUES ('selected_calendars', '["primary"]', CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO NOTHING;
  `);
  console.log('Added default calendar config');
}

export async function down(): Promise<void> {
  await query(`DELETE FROM config WHERE key = 'selected_calendars';`);
  console.log('Removed calendar config');
}
