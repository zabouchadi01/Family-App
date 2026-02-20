import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { CalendarWidget } from '../components/CalendarWidget';
import { WeatherWidget } from '../components/WeatherWidget';
import { DriveTimeWidget } from '../components/DriveTimeWidget';
import { BartWidget } from '../components/BartWidget';
import { GroceryWidget } from '../components/GroceryWidget';
import { PageIndicator } from '../components/PageIndicator';
import {
  checkAuthStatus,
  getAuthUrl,
  getCalendarEvents,
  getWeather,
  getDriveTimes,
  getBartDepartures,
  getGroceryChecklist,
  addGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
  clearCompletedGroceries,
} from '../services/api';
import {
  cacheCalendarEvents,
  cacheWeatherData,
  cacheDriveTimes,
  cacheBartData,
  cacheGroceryList,
  getCachedCalendarEvents,
  getCachedWeatherData,
  getCachedDriveTimes,
  getCachedBartData,
  getCachedGroceryList,
  setLastRefreshTime,
} from '../services/storage';
import { REFRESH_INTERVAL_MS, BART_REFRESH_INTERVAL_MS } from '../config/constants';
import { BartData, CalendarEvent, DriveTime, LoadingState, WeatherData, GroceryItem } from '../types';
import { colors, typography } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export function DashboardScreen() {
  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
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

  const [bartData, setBartData] = useState<BartData | null>(null);
  const [bartState, setBartState] = useState<LoadingState>('idle');
  const [bartError, setBartError] = useState<string | undefined>();

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [groceryState, setGroceryState] = useState<LoadingState>('idle');
  const [groceryError, setGroceryError] = useState<string | undefined>();

  const handleOpenSettings = useCallback(() => {
    navigation.navigate('Settings' as never);
  }, [navigation]);

  const loadCachedData = useCallback(async () => {
    const [cachedEvents, cachedWeather, cachedDriveTimes, cachedBart, cachedGrocery] = await Promise.all([
      getCachedCalendarEvents(),
      getCachedWeatherData(),
      getCachedDriveTimes(),
      getCachedBartData(),
      getCachedGroceryList(),
    ]);

    if (cachedEvents) setCalendarEvents(cachedEvents);
    if (cachedWeather) setWeatherData(cachedWeather);
    if (cachedDriveTimes) setDriveTimesData(cachedDriveTimes);
    if (cachedBart) setBartData(cachedBart);
    if (cachedGrocery) setGroceryItems(cachedGrocery);
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

  const fetchBartDepartures = useCallback(async () => {
    setBartState('loading');
    try {
      const data = await getBartDepartures();
      setBartData(data);
      setBartState('success');
      setBartError(undefined);
      await cacheBartData(data);
    } catch (error) {
      console.error('Failed to fetch BART departures:', error);
      setBartState('error');
      setBartError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  const fetchGroceryList = useCallback(async () => {
    setGroceryState('loading');
    try {
      const items = await getGroceryChecklist();
      setGroceryItems(items);
      setGroceryState('success');
      setGroceryError(undefined);
      await cacheGroceryList(items);
    } catch (error) {
      console.error('Failed to fetch grocery checklist:', error);
      setGroceryState('error');
      setGroceryError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    const authenticated = await fetchAuthStatus();

    const promises = [fetchWeather(), fetchDriveTimes(), fetchBartDepartures()];

    if (authenticated) {
      promises.push(fetchCalendarEvents());
      promises.push(fetchGroceryList());
    }

    await Promise.all(promises);
    await setLastRefreshTime(new Date());
  }, [fetchAuthStatus, fetchCalendarEvents, fetchWeather, fetchDriveTimes, fetchBartDepartures, fetchGroceryList]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const handleSignIn = useCallback(() => {
    const authUrl = getAuthUrl();
    Linking.openURL(authUrl);
  }, []);

  const handleToggleCheck = useCallback(async (item: GroceryItem) => {
    try {
      if (item.isActive) {
        // Item is currently in Google Tasks - remove it
        if (item.taskId) {
          await deleteGroceryItem(item.taskId);
        }
      } else {
        // Item is not in Google Tasks - add it
        await addGroceryItem(item.name, item.category);
      }
      await fetchGroceryList();
    } catch (error) {
      console.error('Failed to toggle grocery item:', error);
    }
  }, [fetchGroceryList]);

  const handleMarkComplete = useCallback(async (taskId: string, checked: boolean) => {
    try {
      await updateGroceryItem(taskId, checked);
      await fetchGroceryList();
    } catch (error) {
      console.error('Failed to mark item complete:', error);
    }
  }, [fetchGroceryList]);

  const handleClearCompleted = useCallback(async () => {
    try {
      await clearCompletedGroceries();
      await fetchGroceryList();
    } catch (error) {
      console.error('Failed to clear completed items:', error);
    }
  }, [fetchGroceryList]);

  // Handle OAuth callback deep link
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url.startsWith('familycalendar://oauth-callback')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const success = params.get('success') === 'true';
        if (success) {
          // Refresh auth status and data after successful login
          fetchAllData();
        }
      }
    };

    // Check if app was opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [fetchAllData]);

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

  // Separate 5-minute BART polling interval
  useEffect(() => {
    const interval = setInterval(fetchBartDepartures, BART_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchBartDepartures]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Calendar</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
          <Icon name="settings-outline" size={28} color="#666" />
        </TouchableOpacity>
      </View>

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

      <PageIndicator pageCount={3} currentPage={currentPage} />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        <View key="events" style={styles.page}>
          <ScrollView
            contentContainerStyle={styles.pageContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <CalendarWidget
              events={calendarEvents}
              state={calendarState}
              error={calendarError}
              onOpenSettings={handleOpenSettings}
            />
          </ScrollView>
        </View>

        <View key="info" style={styles.page}>
          <ScrollView
            contentContainerStyle={styles.pageContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
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
            <BartWidget
              data={bartData}
              state={bartState}
              error={bartError}
            />
          </ScrollView>
        </View>

        <View key="grocery" style={styles.page}>
          <ScrollView
            contentContainerStyle={styles.pageContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <GroceryWidget
              items={groceryItems}
              state={groceryState}
              error={groceryError}
              onToggleCheck={handleToggleCheck}
              onMarkComplete={handleMarkComplete}
              onClearCompleted={handleClearCompleted}
            />
          </ScrollView>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
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
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    padding: 16,
    flexGrow: 1,
  },
  spacer: {
    height: 16,
  },
});
