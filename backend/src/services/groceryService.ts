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

export async function createCommonItem(
  name: string,
  category?: string,
  typicalFrequencyDays?: number
): Promise<CommonGroceryItem> {
  const result = await query<CommonGroceryItem>(
    `INSERT INTO common_grocery_items (name, category, typical_frequency_days)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, category || null, typicalFrequencyDays || null]
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to create common grocery item');
  }

  return result.rows[0];
}

export async function updateCommonItem(
  id: number,
  updates: {
    category?: string;
    typical_frequency_days?: number;
  }
): Promise<CommonGroceryItem> {
  const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.category !== undefined) {
    setClauses.push(`category = $${paramIndex++}`);
    values.push(updates.category);
  }

  if (updates.typical_frequency_days !== undefined) {
    setClauses.push(`typical_frequency_days = $${paramIndex++}`);
    values.push(updates.typical_frequency_days);
  }

  values.push(id);

  const result = await query<CommonGroceryItem>(
    `UPDATE common_grocery_items
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Common grocery item not found');
  }

  return result.rows[0];
}

export async function deleteCommonItem(id: number): Promise<void> {
  await query(`DELETE FROM common_grocery_items WHERE id = $1`, [id]);
}
