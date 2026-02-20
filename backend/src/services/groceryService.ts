import { query } from '../db/connection';

export interface CommonGroceryItem {
  id: number;
  name: string;
  category: string | null;
  usage_count: number;
  last_added: Date | null;
  typical_frequency_days: number | null;
  created_at: Date;
  updated_at: Date;
}

export async function getAllCommonItems(): Promise<CommonGroceryItem[]> {
  const result = await query<CommonGroceryItem>(
    `SELECT * FROM common_grocery_items ORDER BY usage_count DESC, name ASC`
  );
  return result.rows;
}

export async function getCommonItemByName(name: string): Promise<CommonGroceryItem | null> {
  const result = await query<CommonGroceryItem>(
    `SELECT * FROM common_grocery_items WHERE LOWER(name) = LOWER($1)`,
    [name]
  );
  return result.rows[0] || null;
}

export async function incrementUsageCount(name: string): Promise<void> {
  await query(
    `UPDATE common_grocery_items
     SET usage_count = usage_count + 1,
         last_added = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(name) = LOWER($1)`,
    [name]
  );
}

