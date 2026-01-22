import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CalendarEvent, LoadingState } from '../types';
import { colors, typography, DayType, getAccentColors, shadows, borderRadius, spacing } from '../theme/colors';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface Props {
  events: CalendarEvent[];
  state: LoadingState;
  error?: string;
}

interface DaySection {
  title: string;
  date: string;
  dayType: DayType;
  events: CalendarEvent[];
}

interface EventItemData {
  id: string;
  event?: CalendarEvent;
  daySection?: DaySection;
  isHeader?: boolean;
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

function getDayLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatEventTime(dateString: string, allDay: boolean): string {
  if (allDay) {
    return 'All day';
  }
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function groupEventsByDay(events: CalendarEvent[]): DaySection[] {
  const groups = new Map<string, DaySection>();

  for (const event of events) {
    const dateKey = new Date(event.start).toDateString();
    const dayType = getDayType(event.start);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        title: getDayLabel(event.start),
        date: dateKey,
        dayType,
        events: [],
      });
    }

    groups.get(dateKey)!.events.push(event);
  }

  return Array.from(groups.values());
}

function DaySectionHeader({ section }: { section: DaySection }) {
  const accentColors = getAccentColors(section.dayType);

  return (
    <View
      style={[
        styles.daySectionHeader,
        {
          backgroundColor: accentColors.background,
          borderLeftColor: accentColors.accent,
        },
      ]}
    >
      <Text style={[styles.daySectionTitle, { color: accentColors.accent }]}>
        {section.title}
      </Text>
    </View>
  );
}

function EventItem({ event, dayType }: { event: CalendarEvent; dayType: DayType }) {
  const accentColors = getAccentColors(dayType);

  return (
    <View
      style={[
        styles.eventItem,
        {
          backgroundColor: accentColors.background,
          borderLeftColor: accentColors.accent,
        },
      ]}
    >
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTime}>
            {formatEventTime(event.start, event.allDay)}
          </Text>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        {event.location && (
          <Text style={styles.eventLocation} numberOfLines={1}>
            {event.location}
          </Text>
        )}
      </View>
    </View>
  );
}

export function CalendarWidget({ events, state, error }: Props) {
  const daySections = useMemo(() => {
    if (events.length === 0) return [];
    return groupEventsByDay(events);
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
      <FlatList
        data={daySections}
        keyExtractor={(section) => section.date}
        renderItem={({ item: section }) => (
          <View key={section.date}>
            <DaySectionHeader section={section} />
            <View style={styles.eventsGrid}>
              <FlatList
                data={section.events}
                keyExtractor={(event) => event.id}
                key={isTablet ? 'two-column' : 'one-column'}
                numColumns={isTablet ? 2 : 1}
                columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
                renderItem={({ item: event }) => (
                  <EventItem event={event} dayType={section.dayType} />
                )}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        {state === 'loading' && events.length > 0 && (
          <ActivityIndicator size="small" color="#4285F4" />
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.widgetHeader,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  columnWrapper: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  daySectionHeader: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderLeftWidth: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  daySectionTitle: {
    ...typography.dayHeader,
  },
  eventsGrid: {
    marginBottom: spacing.md,
  },
  eventItem: {
    flex: isTablet ? 1 : undefined,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    ...shadows.subtle,
  },
  eventContent: {
    padding: spacing.md,
  },
  eventHeader: {
    marginBottom: spacing.xs,
  },
  eventTime: {
    ...typography.eventTime,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  eventTitle: {
    ...typography.eventTitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
