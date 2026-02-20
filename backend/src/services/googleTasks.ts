import { google, tasks_v1 } from 'googleapis';
import { getOAuth2Client, getValidToken } from './tokenManager';

export interface GroceryItem {
  id: string;
  name: string;
  category?: string;
  checked: boolean;
  addedAt: string;
}

const GROCERY_LIST_NAME = 'Family Groceries';

let cachedListId: string | null = null;

async function getTasksClient(): Promise<tasks_v1.Tasks> {
  const accessToken = await getValidToken();
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.tasks({ version: 'v1', auth: oauth2Client });
}

export async function getOrCreateGroceryList(): Promise<string> {
  // Return cached list ID if available
  if (cachedListId) {
    return cachedListId;
  }

  const tasks = await getTasksClient();

  // Check if list already exists
  const listsResponse = await tasks.tasklists.list();
  const existingList = listsResponse.data.items?.find(
    (list) => list.title === GROCERY_LIST_NAME
  );

  if (existingList && existingList.id) {
    cachedListId = existingList.id;
    return existingList.id;
  }

  // Create new list
  const newListResponse = await tasks.tasklists.insert({
    requestBody: {
      title: GROCERY_LIST_NAME,
    },
  });

  if (!newListResponse.data.id) {
    throw new Error('Failed to create grocery list');
  }

  cachedListId = newListResponse.data.id;
  return newListResponse.data.id;
}

function parseTaskMetadata(notes: string | null | undefined): { category?: string } {
  if (!notes) return {};

  try {
    const metadata = JSON.parse(notes);
    return {
      category: metadata.category || undefined,
    };
  } catch {
    return {};
  }
}

function mapTaskToGroceryItem(task: tasks_v1.Schema$Task): GroceryItem {
  const metadata = parseTaskMetadata(task.notes);

  return {
    id: task.id || '',
    name: task.title || 'Untitled Item',
    category: metadata.category,
    checked: task.status === 'completed',
    addedAt: task.updated || task.created || new Date().toISOString(),
  };
}

export async function getGroceryItems(): Promise<GroceryItem[]> {
  try {
    const listId = await getOrCreateGroceryList();
    const tasks = await getTasksClient();

    const tasksResponse = await tasks.tasks.list({
      tasklist: listId,
      showCompleted: true,
      showHidden: false,
      maxResults: 100,
    });

    const items = (tasksResponse.data.items || []).map(mapTaskToGroceryItem);

    // Sort: unchecked first, then checked (by date added)
    items.sort((a, b) => {
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }
      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
    });

    return items;
  } catch (error) {
    console.error('Error fetching grocery items:', error);
    throw error;
  }
}

export async function addGroceryItem(
  name: string,
  category?: string
): Promise<GroceryItem> {
  try {
    const listId = await getOrCreateGroceryList();
    const tasks = await getTasksClient();

    const metadata = category ? { category } : {};

    const response = await tasks.tasks.insert({
      tasklist: listId,
      requestBody: {
        title: name,
        notes: JSON.stringify(metadata),
        status: 'needsAction',
      },
    });

    if (!response.data) {
      throw new Error('Failed to add grocery item');
    }

    return mapTaskToGroceryItem(response.data);
  } catch (error) {
    console.error('Error adding grocery item:', error);
    throw error;
  }
}

export async function updateGroceryItem(
  taskId: string,
  checked: boolean
): Promise<GroceryItem> {
  try {
    const listId = await getOrCreateGroceryList();
    const tasks = await getTasksClient();

    const response = await tasks.tasks.patch({
      tasklist: listId,
      task: taskId,
      requestBody: {
        status: checked ? 'completed' : 'needsAction',
      },
    });

    if (!response.data) {
      throw new Error('Failed to update grocery item');
    }

    return mapTaskToGroceryItem(response.data);
  } catch (error) {
    console.error('Error updating grocery item:', error);
    throw error;
  }
}

export async function deleteGroceryItem(taskId: string): Promise<void> {
  try {
    const listId = await getOrCreateGroceryList();
    const tasks = await getTasksClient();

    await tasks.tasks.delete({
      tasklist: listId,
      task: taskId,
    });
  } catch (error) {
    console.error('Error deleting grocery item:', error);
    throw error;
  }
}

export async function clearCompletedItems(): Promise<void> {
  try {
    const listId = await getOrCreateGroceryList();
    const tasks = await getTasksClient();

    const tasksResponse = await tasks.tasks.list({
      tasklist: listId,
      showCompleted: true,
      showHidden: false,
      maxResults: 100,
    });

    const completedTasks = (tasksResponse.data.items || []).filter(
      (task) => task.status === 'completed'
    );

    // Delete all completed tasks
    await Promise.all(
      completedTasks.map((task) =>
        task.id
          ? tasks.tasks.delete({ tasklist: listId, task: task.id })
          : Promise.resolve()
      )
    );

    console.log(`Cleared ${completedTasks.length} completed grocery items`);
  } catch (error) {
    console.error('Error clearing completed items:', error);
    throw error;
  }
}
