/**
 * Event Icon Mapper
 * Maps event titles/descriptions to contextual icons and colors
 * Uses Ionicons from react-native-vector-icons
 */

import { colors, EventCategory } from '../theme/colors';

export interface EventIconMapping {
  keywords: string[];
  icon: string;
  color: string;
  category: EventCategory;
}

// Icon mappings with intelligent keyword detection
export const EVENT_ICON_MAPPINGS: EventIconMapping[] = [
  // Celebrations
  {
    keywords: ['birthday', 'bday', 'anniversary', 'celebration'],
    icon: 'balloon-outline',
    color: '#FF8C42', // Orange
    category: 'celebration',
  },
  {
    keywords: ['party', 'gathering', 'social'],
    icon: 'people-outline',
    color: '#FF8C42', // Orange
    category: 'celebration',
  },
  {
    keywords: ['wedding', 'marriage'],
    icon: 'heart-outline',
    color: '#E84C3D', // Red
    category: 'celebration',
  },

  // Work & Meetings
  {
    keywords: ['meeting', 'call', 'zoom', 'teams', 'video call', 'conference'],
    icon: 'videocam-outline',
    color: '#5B9BD5', // Blue
    category: 'work',
  },
  {
    keywords: ['interview', 'presentation', 'demo'],
    icon: 'people-circle-outline',
    color: '#5B9BD5', // Blue
    category: 'work',
  },
  {
    keywords: ['deadline', 'due', 'submit'],
    icon: 'time-outline',
    color: '#E84C3D', // Red
    category: 'work',
  },
  {
    keywords: ['work', 'office', 'shift'],
    icon: 'briefcase-outline',
    color: '#757575', // Gray
    category: 'work',
  },

  // Health & Wellness
  {
    keywords: ['doctor', 'dentist', 'appointment', 'medical', 'clinic', 'hospital', 'checkup'],
    icon: 'medical-outline',
    color: '#E84C3D', // Red
    category: 'health',
  },
  {
    keywords: ['workout', 'gym', 'exercise', 'fitness', 'yoga'],
    icon: 'fitness-outline',
    color: '#4CAF50', // Green
    category: 'health',
  },
  {
    keywords: ['therapy', 'counseling'],
    icon: 'chatbubbles-outline',
    color: '#5B9BD5', // Blue
    category: 'health',
  },

  // Travel & Transportation
  {
    keywords: ['flight', 'fly', 'airport', 'plane'],
    icon: 'airplane-outline',
    color: '#5B9BD5', // Blue
    category: 'travel',
  },
  {
    keywords: ['vacation', 'holiday', 'trip', 'travel'],
    icon: 'earth-outline',
    color: '#5B9BD5', // Blue
    category: 'travel',
  },
  {
    keywords: ['car', 'drive', 'road trip'],
    icon: 'car-outline',
    color: '#757575', // Gray
    category: 'travel',
  },
  {
    keywords: ['train', 'subway', 'metro'],
    icon: 'train-outline',
    color: '#757575', // Gray
    category: 'travel',
  },

  // Food & Dining
  {
    keywords: ['lunch', 'dinner', 'breakfast', 'brunch', 'meal'],
    icon: 'restaurant-outline',
    color: '#FF8C42', // Orange
    category: 'food',
  },
  {
    keywords: ['coffee', 'cafe'],
    icon: 'cafe-outline',
    color: '#FF8C42', // Orange
    category: 'food',
  },

  // Education & Learning
  {
    keywords: ['class', 'lesson', 'course', 'lecture', 'school'],
    icon: 'school-outline',
    color: '#5B9BD5', // Blue
    category: 'education',
  },
  {
    keywords: ['study', 'exam', 'test', 'quiz'],
    icon: 'book-outline',
    color: '#5B9BD5', // Blue
    category: 'education',
  },

  // Entertainment & Leisure
  {
    keywords: ['movie', 'film', 'cinema', 'theater'],
    icon: 'film-outline',
    color: '#FF8C42', // Orange
    category: 'entertainment',
  },
  {
    keywords: ['concert', 'show', 'performance', 'gig'],
    icon: 'musical-notes-outline',
    color: '#FF8C42', // Orange
    category: 'entertainment',
  },
  {
    keywords: ['game', 'match', 'sport'],
    icon: 'football-outline',
    color: '#4CAF50', // Green
    category: 'entertainment',
  },

  // Home & Errands
  {
    keywords: ['home', 'house', 'cleaning', 'chores'],
    icon: 'home-outline',
    color: '#757575', // Gray
    category: 'default',
  },
  {
    keywords: ['shopping', 'groceries', 'store', 'buy'],
    icon: 'cart-outline',
    color: '#FF8C42', // Orange
    category: 'default',
  },
  {
    keywords: ['haircut', 'salon', 'barber'],
    icon: 'cut-outline',
    color: '#757575', // Gray
    category: 'default',
  },
];

// Default icon for events that don't match any keywords
const DEFAULT_ICON = {
  icon: 'calendar-outline',
  color: colors.textSecondary,
  category: 'default' as EventCategory,
};

/**
 * Gets the appropriate icon and color for an event based on its title and optional description
 * @param title - Event title (required)
 * @param description - Event description (optional)
 * @returns Object with icon name, color, and category
 */
export const getEventIcon = (
  title: string,
  description?: string,
): { icon: string; color: string; category: EventCategory } => {
  const searchText = `${title} ${description || ''}`.toLowerCase();

  // Find the first matching mapping
  const mapping = EVENT_ICON_MAPPINGS.find((mapping) =>
    mapping.keywords.some((keyword) => searchText.includes(keyword)),
  );

  return mapping
    ? { icon: mapping.icon, color: mapping.color, category: mapping.category }
    : DEFAULT_ICON;
};
