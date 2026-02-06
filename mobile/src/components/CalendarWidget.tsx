import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CalendarEvent, LoadingState } from '../types';
import { colors, typography, DayType, shadows, borderRadius, spacing } from '../theme/colors';
import { getEventIcon } from '../utils/eventIconMapper';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

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

function formatRelativeDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'today';
  if (isTomorrow) return 'tomorrow';

  // Calculate days until event
  const daysDiff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 7) {
    // Within next 6 days: "Next [weekday]"
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `Next ${weekday}`;
  }

  // 7+ days away: "[Weekday], [Month] [day]"
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatRelativeDateTime(dateString: string, allDay: boolean): string {
  const relativeDate = formatRelativeDateLabel(dateString);

  if (allDay) {
    return `All day ${relativeDate}`;
  }

  const date = new Date(dateString);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${relativeDate.charAt(0).toUpperCase() + relativeDate.slice(1)} at ${time}`;
}

/**
 * Extracts venue name from full address
 * Takes everything before the first comma, or full text if no comma
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

    // Insert separator when date changes (but not before first event)
    if (currentDate !== null && eventDate !== currentDate) {
      flatList.push({
        type: 'separator',
        id: `separator-${eventDate}`,
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

function DateSeparator() {
  return (
    <View style={styles.separator}>
      <View style={styles.separatorLine} />
    </View>
  );
}

function EventItem({ event }: { event: CalendarEvent }) {
  const { icon, color, category } = getEventIcon(event.title);

  return (
    <View
      style={[
        styles.eventItem,
        {
          borderLeftColor: color,
        },
      ]}
    >
      <View style={styles.eventContent}>
        <View style={styles.eventTitleRow}>
          <Icon
            name={icon}
            size={typography.eventIcon.size}
            color={color}
            style={styles.eventIcon}
          />
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
        </View>
        <Text style={styles.eventTime}>
          {formatRelativeDateTime(event.start, event.allDay)}
        </Text>
        {event.location && (
          <Text style={styles.eventLocation} numberOfLines={1}>
            {getVenueName(event.location)}
          </Text>
        )}
      </View>
    </View>
  );
}

export function CalendarWidget({ events, state, error, onOpenSettings }: Props) {
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

    if (isTablet) {
      // Tablet: custom 2-column flex layout
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        >
          <View style={styles.tabletGrid}>
            {flatListData.map((item) => {
              if (item.type === 'separator') {
                return <DateSeparator key={item.id} />;
              }
              return item.event ? (
                <View key={item.id} style={styles.eventContainer}>
                  <EventItem event={item.event} />
                </View>
              ) : null;
            })}
          </View>
        </ScrollView>
      );
    }

    // Phone: single column FlatList
    return (
      <FlatList
        data={flatListData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'separator') {
            return <DateSeparator />;
          }
          return item.event ? <EventItem event={item.event} /> : null;
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onLongPress={onOpenSettings}
        delayLongPress={5000}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Calendar widget header"
        accessibilityHint="Long press for 5 seconds to open settings"
        style={styles.labelContainer}
      >
        <Text style={styles.label}>Upcoming Events</Text>
        {state === 'loading' && events.length > 0 && (
          <ActivityIndicator size="small" color="#4285F4" style={styles.loadingIndicator} />
        )}
      </Pressable>
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    ...shadows.card,
    overflow: 'hidden',
  },
  labelContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingIndicator: {
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: 36,
    paddingBottom: spacing.sm,
  },
  tabletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  eventContainer: {
    width: '48%',
    marginHorizontal: '1%',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  separator: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  separatorLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  eventItem: {
    flex: isTablet ? 1 : undefined,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 4,
    borderTopColor: '#E5E5E5',
    borderRightColor: '#E5E5E5',
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  eventContent: {
    padding: spacing.md,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  eventIcon: {
    marginRight: typography.eventIcon.marginRight,
    marginTop: 0, // Larger icons align better
  },
  eventTime: {
    ...typography.eventTime,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  eventTitle: {
    ...typography.eventTitle,
    color: colors.textPrimary,
    flex: 1,
  },
  eventLocation: {
    ...typography.eventLocation,
    color: colors.textSecondary,
  },
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
