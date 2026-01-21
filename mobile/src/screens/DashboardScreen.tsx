import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { CalendarWidget } from '../components/CalendarWidget';
import { WeatherWidget } from '../components/WeatherWidget';
import { DriveTimeWidget } from '../components/DriveTimeWidget';
import {
  checkAuthStatus,
  getAuthUrl,
  getCalendarEvents,
  getWeather,
  getDriveTimes,
} from '../services/api';
import {
  cacheCalendarEvents,
  cacheWeatherData,
  cacheDriveTimes,
  getCachedCalendarEvents,
  getCachedWeatherData,
  getCachedDriveTimes,
  setLastRefreshTime,
} from '../services/storage';
import { REFRESH_INTERVAL_MS } from '../config/constants';
import { CalendarEvent, DriveTime, LoadingState, WeatherData } from '../types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export function DashboardScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarState, setCalendarState] = useState<LoadingState>('idle');
  const [calendarError, setCalendarError] = useState<string | undefined>();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherState, setWeatherState] = useState<LoadingState>('idle');
  const [weatherError, setWeatherError] = useState<string | undefined>();

  const [driveTimesData, setDriveTimesData] = useState<DriveTime[]>([]);
  const [driveTimesState, setDriveTimesState] = useState<LoadingState>('idle');
  const [driveTimesError, setDriveTimesError] = useState<string | undefined>();

  const loadCachedData = useCallback(async () => {
    const [cachedEvents, cachedWeather, cachedDriveTimes] = await Promise.all([
      getCachedCalendarEvents(),
      getCachedWeatherData(),
      getCachedDriveTimes(),
    ]);

    if (cachedEvents) setCalendarEvents(cachedEvents);
    if (cachedWeather) setWeatherData(cachedWeather);
    if (cachedDriveTimes) setDriveTimesData(cachedDriveTimes);
  }, []);

  const fetchAuthStatus = useCallback(async () => {
    try {
      const status = await checkAuthStatus();
      setIsAuthenticated(status.authenticated);
      return status.authenticated;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return false;
    }
  }, []);

  const fetchCalendarEvents = useCallback(async () => {
    setCalendarState('loading');
    try {
      const events = await getCalendarEvents();
      setCalendarEvents(events);
      setCalendarState('success');
      setCalendarError(undefined);
      await cacheCalendarEvents(events);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      setCalendarState('error');
      setCalendarError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    setWeatherState('loading');
    try {
      const weather = await getWeather();
      setWeatherData(weather);
      setWeatherState('success');
      setWeatherError(undefined);
      await cacheWeatherData(weather);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setWeatherState('error');
      setWeatherError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  const fetchDriveTimes = useCallback(async () => {
    setDriveTimesState('loading');
    try {
      const driveTimes = await getDriveTimes();
      setDriveTimesData(driveTimes);
      setDriveTimesState('success');
      setDriveTimesError(undefined);
      await cacheDriveTimes(driveTimes);
    } catch (error) {
      console.error('Failed to fetch drive times:', error);
      setDriveTimesState('error');
      setDriveTimesError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    const authenticated = await fetchAuthStatus();

    const promises = [fetchWeather(), fetchDriveTimes()];

    if (authenticated) {
      promises.push(fetchCalendarEvents());
    }

    await Promise.all(promises);
    await setLastRefreshTime(new Date());
  }, [fetchAuthStatus, fetchCalendarEvents, fetchWeather, fetchDriveTimes]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const handleSignIn = useCallback(() => {
    const authUrl = getAuthUrl();
    Linking.openURL(authUrl);
  }, []);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Set up polling interval
  useEffect(() => {
    const interval = setInterval(fetchAllData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <View style={styles.container}>
      {!isAuthenticated && (
        <View style={styles.authBanner}>
          <Text style={styles.authBannerText}>
            Sign in to see your calendar events
          </Text>
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isTablet ? (
          <View style={styles.tabletLayout}>
            <View style={styles.leftColumn}>
              <CalendarWidget
                events={calendarEvents}
                state={calendarState}
                error={calendarError}
              />
            </View>
            <View style={styles.rightColumn}>
              <WeatherWidget
                data={weatherData}
                state={weatherState}
                error={weatherError}
              />
              <View style={styles.spacer} />
              <DriveTimeWidget
                driveTimes={driveTimesData}
                state={driveTimesState}
                error={driveTimesError}
              />
            </View>
          </View>
        ) : (
          <View style={styles.phoneLayout}>
            <WeatherWidget
              data={weatherData}
              state={weatherState}
              error={weatherError}
            />
            <View style={styles.spacer} />
            <DriveTimeWidget
              driveTimes={driveTimesData}
              state={driveTimesState}
              error={driveTimesError}
            />
            <View style={styles.spacer} />
            <View style={styles.calendarContainer}>
              <CalendarWidget
                events={calendarEvents}
                state={calendarState}
                error={calendarError}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authBanner: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  authBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
  },
  signInButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabletLayout: {
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  rightColumn: {
    width: 320,
    marginLeft: 8,
  },
  phoneLayout: {
    flex: 1,
  },
  calendarContainer: {
    height: 400,
  },
  spacer: {
    height: 16,
  },
});
