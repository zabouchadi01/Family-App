import { query } from '../connection';

export const name = '006_seed_common_grocery_items';

export async function up(): Promise<void> {
  const commonItems = [
    { name: 'Maple syrup', category: 'pantry', frequency: 90 },
    { name: 'Garlic', category: 'produce', frequency: 30 },
    { name: 'Ginger', category: 'produce', frequency: 30 },
    { name: 'Salmon', category: 'meat', frequency: 14 },
    { name: 'Onions (White and Red)', category: 'produce', frequency: 30 },
    { name: 'Sweet Potatoes', category: 'produce', frequency: 30 },
    { name: 'Topo Chico', category: 'other', frequency: 30 },
    { name: 'Eggs', category: 'dairy', frequency: 14 },
    { name: 'Bell Peppers', category: 'produce', frequency: 14 },
    { name: 'Cauliflower', category: 'produce', frequency: 14 },
    { name: 'Broccoli', category: 'produce', frequency: 14 },
    { name: 'Ground Turkey', category: 'meat', frequency: 14 },
    { name: 'English Cucumbers', category: 'produce', frequency: 7 },
    { name: 'Avocados', category: 'produce', frequency: 7 },
    { name: 'Greek Yogurt', category: 'dairy', frequency: 7 },
    { name: 'Chicken', category: 'meat', frequency: 14 },
    { name: 'Cheddar Cheese', category: 'dairy', frequency: 30 },
    { name: 'Bananas', category: 'produce', frequency: 7 },
    { name: 'Black Boxes', category: 'other', frequency: 90 },
    { name: 'Frozen Berries', category: 'frozen', frequency: 30 },
    { name: 'Lemons', category: 'produce', frequency: 30 },
    { name: 'Rolled Oats', category: 'pantry', frequency: 60 },
    { name: 'Brussels Sprouts', category: 'produce', frequency: 14 },
    { name: 'Frozen Mixed Veggies', category: 'frozen', frequency: 30 },
  ];

  for (const item of commonItems) {
    await query(
      `INSERT INTO common_grocery_items (name, category, typical_frequency_days)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO NOTHING`,
      [item.name, item.category, item.frequency]
    );
  }

  console.log(`Seeded ${commonItems.length} common grocery items`);
}

export async function down(): Promise<void> {
  await query('DELETE FROM common_grocery_items');
  console.log('Removed all common grocery items');
}
