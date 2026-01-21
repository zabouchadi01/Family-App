import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { CalendarEvent, LoadingState } from '../types';

interface Props {
  events: CalendarEvent[];
  state: LoadingState;
  error?: string;
}

function formatEventDate(dateString: string, allDay: boolean): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  let dayLabel: string;
  if (isToday) {
    dayLabel = 'Today';
  } else if (isTomorrow) {
    dayLabel = 'Tomorrow';
  } else {
    dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  if (allDay) {
    return dayLabel;
  }

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${dayLabel} at ${time}`;
}

function EventItem({ event }: { event: CalendarEvent }) {
  return (
    <View style={styles.eventItem}>
      <View style={styles.eventTimeContainer}>
        <Text style={styles.eventTime}>
          {formatEventDate(event.start, event.allDay)}
        </Text>
      </View>
      <View style={styles.eventDetails}>
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
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventItem event={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eventItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  eventTimeContainer: {
    width: 100,
    marginRight: 12,
  },
  eventTime: {
    fontSize: 13,
    color: '#666',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#888',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
