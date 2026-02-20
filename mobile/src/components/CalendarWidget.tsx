import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CalendarEvent, LoadingState } from '../types';
import { colors, typography, DayType, shadows, borderRadius, spacing, getCategoryCardColor } from '../theme/colors';
import { getEventIcon } from '../utils/eventIconMapper';

/**
 * Adjusts a hex color's brightness.
 * amount > 0 lightens, amount < 0 darkens.
 */
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

interface Props {
  events: CalendarEvent[];
  state: LoadingState;
  error?: string;
  onOpenSettings?: () => void;
}

interface FlatListItem {
  type: 'event' | 'separator';
  id: string;
  event?: CalendarEvent;
  dayType?: DayType;
  date?: string;
  dateLabel?: string;
}

function getDayType(dateString: string): DayType {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'today';
  if (isTomorrow) return 'tomorrow';
  return 'upcoming';
}

/**
 * Formats a date string into a bold header label.
 * Today: "TODAY · THURSDAY, 7 FEBRUARY"
 * Tomorrow: "TOMORROW · FRIDAY, 8 FEBRUARY"
 * Other: "SATURDAY, 9 FEBRUARY"
 */
function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const datePart = `${weekday}, ${day} ${month}`;

  if (date.toDateString() === now.toDateString()) {
    return `TODAY  ·  ${datePart}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `TOMORROW  ·  ${datePart}`;
  }
  return datePart;
}

/**
 * Formats time for the left time column.
 * Returns { time: "02:30 PM", duration: "2h" } or { time: "ALL DAY", duration: "" }
 */
function formatTimeColumn(event: CalendarEvent): { time: string; duration: string } {
  if (event.allDay) {
    return { time: 'ALL DAY', duration: '' };
  }

  const start = new Date(event.start);
  const end = new Date(event.end);

  const time = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  let duration = '';
  if (hours > 0 && mins > 0) {
    duration = `${hours}h${mins.toString().padStart(2, '0')}`;
  } else if (hours > 0) {
    duration = `${hours}h`;
  } else if (mins > 0) {
    duration = `${mins}m`;
  }

  return { time, duration };
}

/**
 * Extracts venue name from full address.
 * Takes everything before the first comma, or full text if no comma.
 */
function getVenueName(location: string): string {
  const commaIndex = location.indexOf(',');
  if (commaIndex === -1) {
    return location;
  }
  return location.substring(0, commaIndex).trim();
}

function transformEventsToFlatList(events: CalendarEvent[]): FlatListItem[] {
  if (events.length === 0) return [];

  // Sort events chronologically by start date
  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const flatList: FlatListItem[] = [];
  let currentDate: string | null = null;

  for (const event of sortedEvents) {
    const eventDate = new Date(event.start).toDateString();
    const dayType = getDayType(event.start);

    // Insert date header when date changes (including before first event)
    if (eventDate !== currentDate) {
      flatList.push({
        type: 'separator',
        id: `separator-${eventDate}`,
        dateLabel: formatDateHeader(event.start),
        dayType,
      });
    }

    // Add event item
    flatList.push({
      type: 'event',
      id: event.id,
      event,
      dayType,
      date: eventDate,
    });

    currentDate = eventDate;
  }

  return flatList;
}

function DateHeader({ label, dayType }: { label: string; dayType?: DayType }) {
  const isHighlighted = dayType === 'today';
  return (
    <View style={styles.dateHeader}>
      <Text style={[
        styles.dateHeaderText,
        isHighlighted && styles.dateHeaderTextToday,
      ]}>
        {label}
      </Text>
    </View>
  );
}

function EventItem({ event }: { event: CalendarEvent }) {
  const { icon, color, category } = getEventIcon(event.title);
  const { time, duration } = formatTimeColumn(event);
  const categoryColor = getCategoryCardColor(category);
  const gradientColors = [
    adjustColor(categoryColor, -30),
    categoryColor,
    adjustColor(categoryColor, 25),
  ];
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImage = !!event.image?.thumbUrl;

  return (
    <View style={styles.eventRow}>
      {/* Time Column */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{time}</Text>
        {duration !== '' && (
          <Text style={styles.durationText}>{duration}</Text>
        )}
      </View>

      {/* Event Card */}
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0.3}}
        style={styles.eventCard}
      >
        {/* Visual Area (left) */}
        <View style={styles.visualArea}>
          {/* Icon fallback — visible until image loads */}
          {!imageLoaded && (
            <MaterialIcon
              name={icon}
              size={48}
              color="rgba(255, 255, 255, 0.4)"
            />
          )}
          {/* Stock photo overlay */}
          {hasImage && (
            <Image
              source={{ uri: event.image!.thumbUrl }}
              style={styles.eventImage}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </View>

        {/* Info Panel (right) */}
        <View style={styles.infoPanel}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          {event.location && (
            <View style={styles.locationRow}>
              <Icon
                name="location-outline"
                size={14}
                color="rgba(255, 255, 255, 0.85)"
                style={styles.locationIcon}
              />
              <Text style={styles.eventLocation} numberOfLines={1}>
                {getVenueName(event.location)}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

export function CalendarWidget({ events, state, error }: Props) {
  const flatListData = useMemo(() => {
    if (events.length === 0) return [];
    return transformEventsToFlatList(events);
  }, [events]);

  const renderContent = () => {
    if (state === 'loading' && events.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      );
    }

    if (state === 'error' && events.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Failed to load events'}</Text>
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No upcoming events</Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      >
        {flatListData.map((item) => {
          if (item.type === 'separator') {
            return (
              <DateHeader
                key={item.id}
                label={item.dateLabel || ''}
                dayType={item.dayType}
              />
            );
          }
          return item.event ? (
            <EventItem key={item.id} event={item.event} />
          ) : null;
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {state === 'loading' && events.length > 0 && (
        <ActivityIndicator
          size="small"
          color="#4285F4"
          style={styles.loadingIndicator}
        />
      )}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const TIME_COLUMN_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    ...shadows.card,
    overflow: 'hidden',
  },
  loadingIndicator: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Date Header
  dateHeader: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textSecondary,
    fontFamily: 'Helvetica',
  },
  dateHeaderTextToday: {
    color: colors.todayAccent,
  },

  // Event Row (time column + card)
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  // Time Column
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
    alignItems: 'flex-end',
    paddingRight: spacing.md,
    paddingTop: spacing.md,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Helvetica',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textLight,
    fontFamily: 'Helvetica',
    marginTop: 2,
  },

  // Event Card
  eventCard: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    height: 140,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  // Visual Area (left ~55%)
  visualArea: {
    width: '55%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  eventImage: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  // Info Panel (right ~45%)
  infoPanel: {
    width: '45%',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
  },
  eventTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 42,
    fontFamily: 'Helvetica',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  locationIcon: {
    marginRight: 4,
  },
  eventLocation: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'Helvetica',
    flex: 1,
  },

  // Status states
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
