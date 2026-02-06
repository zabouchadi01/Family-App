export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  condition: string;
  icon: string;
  windSpeed: number;
  location: string;
}

export interface DriveTime {
  destination: string;
  address: string;
  duration: string;
  durationInTraffic?: string;
  distance: string;
}

export interface AuthStatus {
  authenticated: boolean;
}

export interface Calendar {
  id: string;
  name: string;
  primary: boolean;
  backgroundColor?: string;
}

export interface CalendarListResponse {
  calendars: Calendar[];
}

export interface CalendarSelectionRequest {
  calendarIds: string[];
}

export interface CalendarSelectionResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface CalendarResponse {
  events: CalendarEvent[];
}

export interface DriveTimesResponse {
  driveTimes: DriveTime[];
}

export interface BartDeparture {
  destination: string;
  minutes: number;
  departing: boolean;
  platform: string;
  color: string;
  length: string;
  delay: number;
}

export interface BartAdvisory {
  id: string;
  type: string;
  description: string;
  posted: string;
  station: string;
}

export interface BartData {
  departures: BartDeparture[];
  advisories: BartAdvisory[];
  fetchedAt: string;
  stationName: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface DashboardData {
  calendar: {
    events: CalendarEvent[];
    state: LoadingState;
    error?: string;
  };
  weather: {
    data: WeatherData | null;
    state: LoadingState;
    error?: string;
  };
  driveTimes: {
    data: DriveTime[];
    state: LoadingState;
    error?: string;
  };
}
