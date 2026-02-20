import { Router } from 'express';
import * as groceryController from '../controllers/groceryController';

const router = Router();

// Get all grocery items from Google Tasks
router.get('/list', groceryController.getGroceryList);

// Add a new grocery item to Google Tasks
router.post('/items', groceryController.addGroceryItem);

// Update a grocery item (check/uncheck)
router.patch('/items/:taskId', groceryController.updateGroceryItem);

// Delete a grocery item
router.delete('/items/:taskId', groceryController.deleteGroceryItem);

// Clear all completed items
router.delete('/checked', groceryController.clearCompletedItems);

// Get common grocery items from database
router.get('/common', groceryController.getCommonItems);

// Get grocery checklist (all common items with checked status)
router.get('/checklist', groceryController.getChecklist);

export default router;
