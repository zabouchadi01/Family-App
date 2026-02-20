/**
 * Event Icon Mapper
 * Maps event titles/descriptions to contextual icons and colors
 * Uses MaterialCommunityIcons from react-native-vector-icons
 *
 * Priority-ordered: Birthday/Wedding/Holiday match before Party,
 * so "Christmas Party" → holiday, "Birthday Party" → birthday.
 */

import { EventCategory } from '../theme/colors';

export interface EventIconMapping {
  keywords: string[];
  icon: string;
  color: string;
  category: EventCategory;
}

// Icon mappings ordered by priority (first match wins)
export const EVENT_ICON_MAPPINGS: EventIconMapping[] = [
  // 1. Birthday
  {
    keywords: ['birthday', 'bday', 'anniversary', 'b-day'],
    icon: 'cake-variant',
    color: '#FF8C42',
    category: 'celebration',
  },
  // 2. Wedding
  {
    keywords: ['wedding', 'marriage', 'engagement', 'bridal'],
    icon: 'heart',
    color: '#E84C3D',
    category: 'celebration',
  },
  // 3. Holiday (before party/travel so "Eid (holiday)" and "Christmas Party" match here)
  {
    keywords: [
      'eid', 'christmas', 'thanksgiving', 'easter', 'hanukkah', 'diwali',
      'holiday', 'new year', 'ramadan', 'halloween', 'valentine', 'galette',
      'kwanzaa',
    ],
    icon: 'star-four-points',
    color: '#FF8C42',
    category: 'holiday',
  },
  // 4. Party / Social
  {
    keywords: ['party', 'gathering', 'social', 'potluck', 'get-together'],
    icon: 'party-popper',
    color: '#FF8C42',
    category: 'celebration',
  },
  // 5. Medical
  {
    keywords: [
      'doctor', 'dentist', 'checkup', 'medical', 'clinic', 'hospital',
      'physical', 'pediatrician', 'optometrist', 'vaccination', 'vaccine',
    ],
    icon: 'stethoscope',
    color: '#E84C3D',
    category: 'health',
  },
  // 6. Fitness
  {
    keywords: ['workout', 'gym', 'exercise', 'fitness', 'yoga', 'run', 'swim', 'pilates'],
    icon: 'dumbbell',
    color: '#4CAF50',
    category: 'health',
  },
  // 7. Flight (before general travel)
  {
    keywords: ['flight', 'fly', 'airport', 'plane'],
    icon: 'airplane-takeoff',
    color: '#5B9BD5',
    category: 'travel',
  },
  // 8. Accommodation (before general travel)
  {
    keywords: [
      'stay at', 'hotel', 'airbnb', 'bluestay', 'vrbo', 'check-in',
      'checkout', 'resort', 'cabin',
    ],
    icon: 'bed',
    color: '#5B9BD5',
    category: 'travel',
  },
  // 9. Travel (general)
  {
    keywords: ['vacation', 'trip', 'travel', 'road trip'],
    icon: 'earth',
    color: '#5B9BD5',
    category: 'travel',
  },
  // 10. Family
  {
    keywords: ['visiting', 'parents', 'family', 'in-laws', 'reunion'],
    icon: 'account-group',
    color: '#5B9BD5',
    category: 'family',
  },
  // 11. School
  {
    keywords: ['school', 'class', 'lesson', 'course', 'graduation', 'recital', 'field trip'],
    icon: 'school',
    color: '#5B9BD5',
    category: 'education',
  },
  // 12. Food
  {
    keywords: [
      'lunch', 'dinner', 'breakfast', 'brunch', 'meal', 'restaurant',
      'reservation', 'bbq', 'barbecue', 'picnic',
    ],
    icon: 'silverware-fork-knife',
    color: '#FF8C42',
    category: 'food',
  },
  // 13. Coffee
  {
    keywords: ['coffee', 'cafe'],
    icon: 'coffee',
    color: '#FF8C42',
    category: 'food',
  },
  // 14. Meeting / Work
  {
    keywords: ['meeting', 'call', 'zoom', 'teams', 'conference', 'standup', 'sync', '1:1'],
    icon: 'briefcase',
    color: '#5B9BD5',
    category: 'work',
  },
  // 15. Deadline / Admin
  {
    keywords: [
      'tax', 'deadline', 'due', 'submit', 'payment', 'bill', 'insurance',
      'renew', 'registration', 'filing',
    ],
    icon: 'file-document',
    color: '#757575',
    category: 'admin',
  },
  // 16. Outdoor
  {
    keywords: [
      'ranch', 'park', 'zoo', 'museum', 'aquarium', 'beach', 'camping',
      'farm', 'garden', 'trail',
    ],
    icon: 'pine-tree',
    color: '#4CAF50',
    category: 'outdoor',
  },
  // 17. Entertainment
  {
    keywords: ['movie', 'film', 'cinema', 'theater'],
    icon: 'movie-open',
    color: '#FF8C42',
    category: 'entertainment',
  },
  // 18. Music
  {
    keywords: ['concert', 'show', 'performance', 'gig', 'musical'],
    icon: 'music',
    color: '#FF8C42',
    category: 'entertainment',
  },
  // 19. Sports
  {
    keywords: ['game', 'match', 'sport', 'soccer', 'basketball', 'football', 'baseball', 'tennis'],
    icon: 'trophy',
    color: '#4CAF50',
    category: 'entertainment',
  },
  // 20. Shopping
  {
    keywords: ['shopping', 'groceries', 'store', 'buy', 'mall', 'market'],
    icon: 'cart',
    color: '#FF8C42',
    category: 'default',
  },
  // 21. Grooming
  {
    keywords: ['haircut', 'salon', 'barber', 'spa', 'massage'],
    icon: 'content-cut',
    color: '#757575',
    category: 'default',
  },
  // 22. Car
  {
    keywords: ['car', 'drive', 'pickup', 'drop-off', 'carpool', 'uber', 'lyft'],
    icon: 'car',
    color: '#757575',
    category: 'travel',
  },
];

// Default icon for events that don't match any keywords
const DEFAULT_ICON = {
  icon: 'calendar',
  color: '#9E9E9E',
  category: 'default' as EventCategory,
};

/**
 * Gets the appropriate icon and color for an event based on its title and optional description.
 * Returns MaterialCommunityIcons icon names.
 */
export const getEventIcon = (
  title: string,
  description?: string,
): { icon: string; color: string; category: EventCategory } => {
  const searchText = `${title} ${description || ''}`.toLowerCase();

  const mapping = EVENT_ICON_MAPPINGS.find((m) =>
    m.keywords.some((keyword) => searchText.includes(keyword)),
  );

  return mapping
    ? { icon: mapping.icon, color: mapping.color, category: mapping.category }
    : DEFAULT_ICON;
};
