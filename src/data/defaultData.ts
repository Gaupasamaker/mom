import {
  birthdays,
  calendarEvents,
  familyMembers,
  reminders,
  shoppingList,
  userProfile,
  weatherAlerts,
} from './mockData';
import type { LittleReminder, MomAppData, UserPreferences } from '../types';
import { getDeviceLanguage } from '../i18n';

export const defaultPreferences: UserPreferences = {
  hasCompletedOnboarding: false,
  language: getDeviceLanguage(),
  personality: userProfile.personality,
  notificationsEnabled: true,
  dailySummaryTime: '08:00',
  eveningReminderEnabled: true,
  preferredCity: 'Madrid',
  selectedCity: undefined,
  timeFormat: '12h',
  morningRoutineEnabled: true,
  morningRoutineTime: '07:30',
  eveningRoutineEnabled: true,
  eveningRoutineTime: '20:30',
  includeWeatherInRoutines: true,
  includeBirthdaysInRoutines: true,
  includeShoppingInRoutines: true,
  includeCalendarPrepInRoutines: true,
};

export const defaultLittleReminders: LittleReminder[] = reminders.map((reminder) => ({
  id: reminder.id,
  title: reminder.title,
  message: reminder.message,
  completed: false,
}));

export const defaultAppData: MomAppData = {
  preferences: defaultPreferences,
  reminders: [
    {
      id: 'reminder-school-fee',
      title: 'Pay school fee',
      message: 'School fee is due.',
      dueAt: '2026-05-12T18:00:00',
      category: 'family',
      completed: false,
      priority: 'high',
      repeat: 'none',
    },
  ],
  calendarEvents,
  birthdays,
  familyMembers,
  shoppingLists: [shoppingList],
  littleReminders: defaultLittleReminders,
  weatherAlerts,
  weatherForecast: null,
};
