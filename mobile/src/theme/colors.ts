/**
 * Family Calendar Design System
 * Optimized for wall-mounted tablet viewing (6-8 feet distance)
 */

// Base Colors
export const colors = {
  // App backgrounds
  appBackground: '#FBF8F3',      // Soft warm cream
  cardBackground: '#FFFFFF',      // Pure white

  // Temporal accents (day-based visual hierarchy)
  todayAccent: '#FF8C42',         // Warm orange
  todayBackground: '#FFF4ED',     // Light orange tint
  tomorrowAccent: '#5B9BD5',      // Cool blue
  tomorrowBackground: '#EFF6FC',  // Light blue tint
  upcomingAccent: '#757575',      // Neutral gray
  upcomingBackground: '#FFFFFF',  // White (no tint)

  // Weather condition backgrounds
  weatherSunny: '#FFF9E6',        // Pale yellow
  weatherRainy: '#E8F4F8',        // Pale blue
  weatherCloudy: '#F5F5F5',       // Pale gray
  weatherSnowy: '#F0F8FF',        // Alice blue
  weatherDefault: '#FFFFFF',      // Default white

  // Event type backgrounds (subtle tints, 2-3% opacity)
  eventCelebration: '#FFF5F0',    // Very pale orange (birthday, party)
  eventWork: '#F0F5FA',           // Very pale blue (meetings, work)
  eventHealth: '#FFF0F0',         // Very pale red (medical, fitness)
  eventTravel: '#F0F8FF',         // Very pale blue (flights, trips)
  eventFood: '#FFF8E8',           // Very pale yellow (meals, coffee)
  eventEducation: '#F5F5FF',      // Very pale indigo (class, study)
  eventEntertainment: '#FFF5FA',  // Very pale pink (movies, concerts)
  eventHoliday: '#FFF5E6',        // Very pale warm orange (holidays)
  eventFamily: '#EFF6FC',         // Very pale blue (family visits)
  eventAdmin: '#F5F5F5',          // Very pale gray (admin, deadlines)
  eventOutdoor: '#F0F8F0',        // Very pale green (outdoor activities)
  eventDefault: '#FFFFFF',        // White (no special category)

  // Text hierarchy
  textPrimary: '#1A1A1A',         // Near black
  textSecondary: '#666666',       // Medium gray
  textLight: '#999999',           // Light gray

  // Status colors
  trafficRed: '#E84C3D',          // Traffic delay indicator
  trafficNormal: '#4CAF50',       // Normal traffic (green)

  // Status background colors (subtle, low opacity)
  statusBackgrounds: {
    normal: '#E8F5E9',            // Light green - good traffic
    caution: '#FFF3E0',           // Light orange - moderate delay
    alert: '#FFEBEE',             // Light red - heavy delay
    neutral: '#F5F5F5',           // Light gray - default/no data
  },

  // Muted text colors for colored backgrounds
  mutedText: {
    primary: '#4A4A4A',           // Darker muted for readability on light backgrounds
    secondary: '#757575',         // Medium gray
  },

  // Category card backgrounds (bold colors for event card visual area)
  categoryCard: {
    celebration: '#FF8C42',       // Warm orange
    work: '#5B9BD5',              // Blue
    health: '#E84C3D',            // Red
    travel: '#5B9BD5',            // Ocean blue
    food: '#FF8C42',              // Amber
    education: '#5B9BD5',         // Indigo blue
    entertainment: '#FF8C42',     // Deep orange
    holiday: '#FF8C42',           // Warm orange
    family: '#5B9BD5',            // Blue
    admin: '#757575',             // Gray
    outdoor: '#4CAF50',           // Green
    default: '#9E9E9E',          // Gray
  },

  // Grocery category colors
  groceryCategory: {
    produce:  { accent: '#4CAF50', tint: '#E8F5E9' },  // Green — fresh, natural
    dairy:    { accent: '#5B9BD5', tint: '#EFF6FC' },  // Cool blue
    protein:  { accent: '#E84C3D', tint: '#FFEBEE' },  // Warm red, bold
    pantry:   { accent: '#FF8C42', tint: '#FFF4ED' },  // Warm orange, staples
    frozen:   { accent: '#90CAF9', tint: '#E3F2FD' },  // Icy blue
    other:    { accent: '#757575', tint: '#F5F5F5' },  // Neutral gray
  },

  // Dividers and borders
  divider: '#E8E4DF',             // Warm gray divider
  border: '#D0CCC7',              // Subtle border

  // Settings icon
  settingsIcon: '#999999',        // Subtle gray for gear icon
};

// Typography Scale (optimized for distance viewing)
// 8px baseline grid with systematic scale: 14, 16, 20, 24, 32, 48
export const typography = {
  // Event card text (Tier 2 & Tier 3)
  eventTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    fontFamily: 'Helvetica',
  },
  eventTime: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Helvetica',
  },
  eventLocation: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Helvetica',
  },
  eventIcon: {
    size: 24,
    marginRight: 8,
  },

  // Weather widget - Display tier (48px) and details
  weatherTemp: {
    fontSize: 48,
    fontWeight: '200' as const,
    lineHeight: 56,
    fontFamily: 'Helvetica',
  },
  weatherIcon: {
    size: 120,
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Helvetica',
  },
  weatherDescription: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Helvetica',
  },
  weatherDetails: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Helvetica',
  },

  // Drive time widget (Tier 2, Tier 3 & Special)
  driveTime: {
    fontSize: 48,
    fontWeight: '200' as const,
    lineHeight: 56,
    fontFamily: 'Helvetica',
  },
  driveDestination: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Helvetica',
  },
  driveUsually: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Helvetica',
  },
  driveDistance: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: 'Helvetica',
  },

  // Widget headers (Tier 1)
  widgetHeader: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    fontFamily: 'Helvetica',
  },

  // Day section headers (Tier 2)
  dayHeader: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: 0,
    fontFamily: 'Helvetica',
  },

  // Settings icon
  settingsIcon: {
    size: 28,
  },
};

// Weather condition mapping
export const WEATHER_CONDITIONS: {
  [key: string]: { background: string; name: string };
} = {
  Clear: { background: colors.weatherSunny, name: 'Clear' },
  Clouds: { background: colors.weatherCloudy, name: 'Cloudy' },
  Rain: { background: colors.weatherRainy, name: 'Rainy' },
  Drizzle: { background: colors.weatherRainy, name: 'Drizzly' },
  Snow: { background: colors.weatherSnowy, name: 'Snowy' },
  Thunderstorm: { background: colors.weatherRainy, name: 'Stormy' },
  Mist: { background: colors.weatherCloudy, name: 'Misty' },
  Fog: { background: colors.weatherCloudy, name: 'Foggy' },
  Haze: { background: colors.weatherCloudy, name: 'Hazy' },
};

// Day type classification
export type DayType = 'today' | 'tomorrow' | 'upcoming';

// Event category type
export type EventCategory =
  | 'celebration'
  | 'work'
  | 'health'
  | 'travel'
  | 'food'
  | 'education'
  | 'entertainment'
  | 'holiday'
  | 'family'
  | 'admin'
  | 'outdoor'
  | 'default';

// Helper function to get category card background color
export const getCategoryCardColor = (category: EventCategory): string => {
  return colors.categoryCard[category] || colors.categoryCard.default;
};

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

// Shadows
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
};
