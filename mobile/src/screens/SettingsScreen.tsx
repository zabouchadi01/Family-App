import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { checkAuthStatus, getAuthUrl, logout, getCalendarList, updateCalendarSelection } from '../services/api';
import { getLastRefreshTime, clearAllCache } from '../services/storage';
import { Calendar } from '../types';

export function SettingsScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [status, refreshTime] = await Promise.all([
        checkAuthStatus(),
        getLastRefreshTime(),
      ]);

      setIsAuthenticated(status.authenticated);

      if (refreshTime) {
        setLastRefresh(
          refreshTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        );
      }

      // Fetch calendars if authenticated
      if (status.authenticated) {
        setLoadingCalendars(true);
        try {
          const calendarList = await getCalendarList();
          setCalendars(calendarList);
          // Set primary calendar as initially selected
          setSelectedCalendarIds(
            calendarList.filter(cal => cal.primary).map(cal => cal.id)
          );
        } catch (error) {
          console.error('Failed to fetch calendars:', error);
        } finally {
          setLoadingCalendars(false);
        }
      }
    } catch (error) {
      console.error('Failed to load settings data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignIn = useCallback(() => {
    const authUrl = getAuthUrl();
    Linking.openURL(authUrl);
  }, []);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your cached data will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setIsAuthenticated(false);
            } catch (error) {
              console.error('Failed to sign out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. The app will refetch data on the next refresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllCache();
              setLastRefresh(null);
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch (error) {
              console.error('Failed to clear cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleToggleCalendar = useCallback((calendarId: string) => {
    setSelectedCalendarIds(prev => {
      if (prev.includes(calendarId)) {
        if (prev.length === 1) {
          Alert.alert('Error', 'At least one calendar must be selected');
          return prev;
        }
        return prev.filter(id => id !== calendarId);
      } else {
        return [...prev, calendarId];
      }
    });
  }, []);

  const handleSaveCalendarSelection = useCallback(async () => {
    try {
      await updateCalendarSelection(selectedCalendarIds);
      Alert.alert('Success', 'Calendar selection saved. Pull to refresh to see updates.');
    } catch (error) {
      console.error('Failed to save calendar selection:', error);
      Alert.alert('Error', 'Failed to save calendar selection.');
    }
  }, [selectedCalendarIds]);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Google Account</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  isAuthenticated ? styles.statusConnected : styles.statusDisconnected,
                ]}
              />
              <Text style={styles.statusText}>
                {isAuthenticated ? 'Connected' : 'Not connected'}
              </Text>
            </View>
          </View>

          {isAuthenticated ? (
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
              <Text style={styles.buttonTextDanger}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSignIn}
            >
              <Text style={styles.buttonTextPrimary}>Sign In with Google</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar Selection</Text>
          <View style={styles.card}>
            {loadingCalendars ? (
              <Text style={styles.label}>Loading calendars...</Text>
            ) : calendars.length === 0 ? (
              <Text style={styles.label}>No calendars found</Text>
            ) : (
              <>
                {calendars.map(calendar => (
                  <TouchableOpacity
                    key={calendar.id}
                    style={styles.calendarRow}
                    onPress={() => handleToggleCalendar(calendar.id)}
                  >
                    <View style={styles.calendarInfo}>
                      <View
                        style={[
                          styles.calendarColorDot,
                          { backgroundColor: calendar.backgroundColor || '#4285F4' },
                        ]}
                      />
                      <Text style={styles.calendarName}>
                        {calendar.name}
                        {calendar.primary && <Text style={styles.primaryLabel}> (Primary)</Text>}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selectedCalendarIds.includes(calendar.id) && styles.checkboxSelected,
                      ]}
                    >
                      {selectedCalendarIds.includes(calendar.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleSaveCalendarSelection}
                  disabled={selectedCalendarIds.length === 0}
                >
                  <Text style={styles.buttonTextPrimary}>Save Selection</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Last Refresh</Text>
            <Text style={styles.value}>{lastRefresh || 'Never'}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleClearCache}>
            <Text style={styles.buttonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Refresh Interval</Text>
            <Text style={styles.value}>15 minutes</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  primaryButton: {
    backgroundColor: '#4285F4',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonTextPrimary: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  buttonTextDanger: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  calendarName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  primaryLabel: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
