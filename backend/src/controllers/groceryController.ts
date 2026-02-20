import { Request, Response } from 'express';
import * as googleTasks from '../services/googleTasks';
import * as groceryService from '../services/groceryService';

export async function getGroceryList(req: Request, res: Response): Promise<void> {
  try {
    const items = await googleTasks.getGroceryItems();

    // Try to match each item to a common item for category enrichment
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const commonItem = await groceryService.getCommonItemByName(item.name);
        return {
          ...item,
          commonItemId: commonItem?.id,
          category: item.category || commonItem?.category || 'other',
        };
      })
    );

    res.json({ items: enrichedItems });
  } catch (error) {
    console.error('Error in getGroceryList:', error);
    res.status(500).json({ error: 'Failed to fetch grocery list' });
  }
}

export async function addGroceryItem(req: Request, res: Response): Promise<void> {
  try {
    const { name, category } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Item name is required' });
      return;
    }

    const trimmedName = name.trim();

    // Check if this is a common item and get its category
    const commonItem = await groceryService.getCommonItemByName(trimmedName);
    const finalCategory = category || commonItem?.category || 'other';

    // Add to Google Tasks
    const newItem = await googleTasks.addGroceryItem(trimmedName, finalCategory);

    // If it's a common item, increment usage count
    if (commonItem) {
      await groceryService.incrementUsageCount(trimmedName);
    }

    res.status(201).json({
      item: {
        ...newItem,
        commonItemId: commonItem?.id,
      },
    });
  } catch (error) {
    console.error('Error in addGroceryItem:', error);
    res.status(500).json({ error: 'Failed to add grocery item' });
  }
}

export async function updateGroceryItem(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const { checked } = req.body;

    if (typeof checked !== 'boolean') {
      res.status(400).json({ error: 'Checked status must be a boolean' });
      return;
    }

    const updatedItem = await googleTasks.updateGroceryItem(taskId, checked);
    res.json({ item: updatedItem });
  } catch (error) {
    console.error('Error in updateGroceryItem:', error);
    res.status(500).json({ error: 'Failed to update grocery item' });
  }
}

export async function deleteGroceryItem(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    await googleTasks.deleteGroceryItem(taskId);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteGroceryItem:', error);
    res.status(500).json({ error: 'Failed to delete grocery item' });
  }
}

export async function clearCompletedItems(req: Request, res: Response): Promise<void> {
  try {
    await googleTasks.clearCompletedItems();
    res.status(204).send();
  } catch (error) {
    console.error('Error in clearCompletedItems:', error);
    res.status(500).json({ error: 'Failed to clear completed items' });
  }
}

export async function getCommonItems(req: Request, res: Response): Promise<void> {
  try {
    const items = await groceryService.getAllCommonItems();
    res.json({ items });
  } catch (error) {
    console.error('Error in getCommonItems:', error);
    res.status(500).json({ error: 'Failed to fetch common items' });
  }
}

export async function getChecklist(req: Request, res: Response): Promise<void> {
  try {
    // Get all common items from database
    const commonItems = await groceryService.getAllCommonItems();

    // Get active items from Google Tasks
    const activeItems = await googleTasks.getGroceryItems();

    // Create a map of active item names (case-insensitive)
    const activeItemMap = new Map<string, { id: string; checked: boolean }>();
    activeItems.forEach(item => {
      activeItemMap.set(item.name.toLowerCase(), {
        id: item.id,
        checked: item.checked
      });
    });

    // Merge common items with active status
    const checklistItems = commonItems.map(commonItem => {
      const activeItem = activeItemMap.get(commonItem.name.toLowerCase());
      return {
        id: activeItem?.id || `common-${commonItem.id}`,
        name: commonItem.name,
        category: commonItem.category || 'other',
        checked: activeItem ? activeItem.checked : false,
        isActive: !!activeItem,
        taskId: activeItem?.id,
        commonItemId: commonItem.id,
        usageCount: commonItem.usage_count,
      };
    });

    // Sort: checked items first (uncompleted then completed), then unchecked by popularity
    checklistItems.sort((a, b) => {
      // If both checked or both unchecked
      if (a.isActive === b.isActive) {
        // Among active items, show unchecked (needed) before checked (completed)
        if (a.isActive) {
          if (a.checked !== b.checked) {
            return a.checked ? 1 : -1; // unchecked first
          }
        }
        // For items with same active/checked status, sort by usage count (popularity)
        return b.usageCount - a.usageCount;
      }
      // Active items (in list) come before inactive items
      return a.isActive ? -1 : 1;
    });

    res.json({ items: checklistItems });
  } catch (error) {
    console.error('Error in getChecklist:', error);
    res.status(500).json({ error: 'Failed to fetch grocery checklist' });
  }
}
