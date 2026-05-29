export type MomPersonality = 'sweet' | 'funny' | 'strict' | 'minimal';

export type ReminderInterest =
  | 'weather'
  | 'birthdays'
  | 'calendar'
  | 'shopping'
  | 'family'
  | 'routines';

export type Priority = 'high' | 'medium' | 'low';
export type MomCheckPriority = 'urgent' | 'important' | 'later';
export type ReminderPriority = 'low' | 'normal' | 'high';
export type ReminderCategory = 'home' | 'work' | 'health' | 'family' | 'shopping' | 'personal' | 'school' | 'other';
export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type UserProfile = {
  id: string;
  name: string;
  personality: MomPersonality;
  reminderInterests: ReminderInterest[];
};

export type UserPreferences = {
  hasCompletedOnboarding: boolean;
  personality: MomPersonality;
  notificationsEnabled: boolean;
  dailySummaryTime: string;
  eveningReminderEnabled: boolean;
  preferredCity: string;
  selectedCity?: WeatherCity;
  timeFormat: '12h' | '24h';
  morningRoutineEnabled: boolean;
  morningRoutineTime: string;
  eveningRoutineEnabled: boolean;
  eveningRoutineTime: string;
  includeWeatherInRoutines: boolean;
  includeBirthdaysInRoutines: boolean;
  includeShoppingInRoutines: boolean;
  includeCalendarPrepInRoutines: boolean;
};

export type Reminder = {
  id: string;
  title: string;
  message: string;
  dueAt?: string;
  category: ReminderInterest | ReminderCategory;
  completed?: boolean;
  priority?: ReminderPriority;
  repeat?: ReminderRepeat;
};

export type LittleReminder = {
  id: string;
  title: string;
  message?: string;
  completed: boolean;
  dueAt?: string;
};

export type CalendarEventCategory = 'work' | 'personal' | 'medical' | 'health' | 'family' | 'school' | 'other';

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  category: CalendarEventCategory;
  preparationNote?: string;
  isImportant?: boolean;
};

export type Birthday = {
  id: string;
  name: string;
  date: string;
  relationship: string;
  note?: string;
  giftIdea?: string;
  favoriteCakeOrTreat?: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  birthday?: string;
  favoriteThings?: string[];
  careNote?: string;
  notes?: string;
};

export type ShoppingItem = {
  id: string;
  label: string;
  checked: boolean;
  essential?: boolean;
  isEssential?: boolean;
};

export type ShoppingListItem = ShoppingItem;

export type ShoppingList = {
  id: string;
  title: string;
  items: ShoppingItem[];
};

export type WeatherAlert = {
  id: string;
  type: 'rain' | 'storm' | 'heat' | 'cold';
  date: string;
  severity: Priority;
  title: string;
  message: string;
};

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'windy'
  | 'unknown';

export type WeatherCity = {
  id: string;
  name: string;
  country?: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type WeatherForecast = {
  cityName: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  currentTemperature?: number;
  dailyMaxTemperature?: number;
  dailyMinTemperature?: number;
  currentConditionCode?: number;
  currentConditionLabel: string;
  currentConditionIcon?: string;
  precipitationProbabilityMaxToday?: number;
  rainExpectedToday: boolean;
  rainExpectedLaterToday: boolean;
  nextRainTime?: string;
  highWindExpectedToday?: boolean;
  hotDayExpected?: boolean;
  coldDayExpected?: boolean;
  updatedAt: string;
  unavailable?: boolean;
  stale?: boolean;
};

export type MomInsightType =
  | 'weather'
  | 'birthday'
  | 'medical-prep'
  | 'shopping'
  | 'busy-day'
  | 'routine'
  | 'preparation';

export type MomInsight = {
  id: string;
  type: MomInsightType;
  priority: Priority;
  momPriority?: MomCheckPriority;
  title: string;
  message: string;
  categoryLabel?: string;
  momNote?: string;
  actionLabel?: string;
  sourceId?: string;
  daysUntil?: number;
};

export type DailyHighlightType = 'event' | 'reminder' | 'birthday' | 'shopping' | 'health' | 'family' | 'suggestion';
export type DailyHighlightPriority = 'urgent' | 'important' | 'normal' | 'later';

export type DailyHighlight = {
  type: DailyHighlightType;
  priority: DailyHighlightPriority;
  title: string;
  message: string;
  sourceId?: string;
};

export type DailySummary = {
  date: string;
  eventCountToday: number;
  overdueReminderCount: number;
  dueReminderCount: number;
  upcomingBirthdayCount: number;
  incompleteEssentialShoppingCount: number;
  isBusyDay: boolean;
  topMessage: string;
  highlights: DailyHighlight[];
};

export type MomSuggestion = {
  id: string;
  title: string;
  message: string;
  priority: Priority;
};

export type MomCheckResult = {
  generatedAt: string;
  summary: string;
  insights: MomInsight[];
  groups?: Record<MomCheckPriority, MomInsight[]>;
  suggestions: MomSuggestion[];
};

export type MomCheckInput = {
  today: string;
  userProfile: UserProfile;
  preferences?: UserPreferences;
  reminders?: Reminder[];
  calendarEvents: CalendarEvent[];
  birthdays: Birthday[];
  familyMembers?: FamilyMember[];
  shoppingList: ShoppingList;
  shoppingLists?: ShoppingList[];
  littleReminders?: LittleReminder[];
  weatherAlerts: WeatherAlert[];
  weatherForecast?: WeatherForecast | null;
};

export type PreparationTaskSourceType = 'event' | 'birthday' | 'weather' | 'reminder' | 'shopping' | 'routine';
export type PreparationTaskCategory =
  | 'health'
  | 'school'
  | 'work'
  | 'family'
  | 'weather'
  | 'travel'
  | 'home'
  | 'shopping'
  | 'personal'
  | 'other';
export type PreparationTaskPriority = 'urgent' | 'important' | 'normal' | 'later';

export type PreparationTask = {
  id: string;
  sourceType: PreparationTaskSourceType;
  sourceId?: string;
  title: string;
  message?: string;
  category: PreparationTaskCategory;
  priority: PreparationTaskPriority;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
};

export type RoutineType = 'morning' | 'evening';

export type Routine = {
  id: string;
  type: RoutineType;
  title: string;
  message: string;
  tasks: PreparationTask[];
  generatedAt: string;
};

export type MomAppData = {
  preferences: UserPreferences;
  reminders: Reminder[];
  calendarEvents: CalendarEvent[];
  birthdays: Birthday[];
  familyMembers: FamilyMember[];
  shoppingLists: ShoppingList[];
  littleReminders: LittleReminder[];
  weatherAlerts: WeatherAlert[];
  weatherForecast?: WeatherForecast | null;
};
