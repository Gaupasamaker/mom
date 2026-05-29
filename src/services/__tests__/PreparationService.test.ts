import { describe, expect, it } from 'vitest';

import { PreparationService } from '../PreparationService';
import type { MomCheckInput } from '../../types';

const input: MomCheckInput = {
  today: '2026-05-14',
  userProfile: {
    id: 'user-1',
    name: 'Sofia',
    personality: 'sweet',
    reminderInterests: ['weather', 'birthdays', 'calendar', 'shopping'],
  },
  preferences: {
    hasCompletedOnboarding: true,
    language: 'en',
    personality: 'sweet',
    notificationsEnabled: true,
    dailySummaryTime: '08:00',
    eveningReminderEnabled: true,
    preferredCity: 'Alicante',
    timeFormat: '24h',
    morningRoutineEnabled: true,
    morningRoutineTime: '07:30',
    eveningRoutineEnabled: true,
    eveningRoutineTime: '20:30',
    includeWeatherInRoutines: true,
    includeBirthdaysInRoutines: true,
    includeShoppingInRoutines: true,
    includeCalendarPrepInRoutines: true,
  },
  weatherAlerts: [],
  weatherForecast: {
    cityName: 'Alicante',
    country: 'Spain',
    latitude: 38.3452,
    longitude: -0.481,
    currentConditionLabel: 'Rain',
    rainExpectedToday: true,
    rainExpectedLaterToday: true,
    hotDayExpected: true,
    coldDayExpected: false,
    updatedAt: '2026-05-14T07:00:00.000Z',
  },
  calendarEvents: [
    { id: 'early', title: 'School drop-off', startsAt: '2026-05-14T08:00:00', category: 'school' },
    { id: 'doctor', title: 'Doctor appointment', startsAt: '2026-05-15T10:00:00', category: 'health' },
    { id: 'meeting', title: 'Project meeting', startsAt: '2026-05-14T11:00:00', category: 'work' },
    { id: 'pickup', title: 'Pick up dry cleaning', startsAt: '2026-05-14T16:00:00', category: 'personal' },
    { id: 'dinner', title: 'Dinner with family', startsAt: '2026-05-14T19:00:00', category: 'family' },
  ],
  birthdays: [
    {
      id: 'noah',
      name: 'Noah',
      date: '2026-05-16',
      relationship: 'nephew',
      giftIdea: 'Dinosaur book',
      favoriteCakeOrTreat: 'chocolate cake',
    },
  ],
  shoppingList: {
    id: 'groceries',
    title: 'Groceries',
    items: [
      { id: 'milk', label: 'Milk', checked: false, isEssential: true },
      { id: 'eggs', label: 'Eggs', checked: false, essential: true },
      { id: 'flowers', label: 'Flowers', checked: false },
    ],
  },
  reminders: [
    {
      id: 'overdue',
      title: 'Pay school fee',
      message: 'School fee is due.',
      dueAt: '2026-05-13T18:00:00',
      category: 'school',
      completed: false,
    },
  ],
};

describe('PreparationService', () => {
  it('generates preparation tasks from weather, calendar, birthday, shopping, and reminders', () => {
    const tasks = PreparationService.generate(input);

    expect(tasks.map((task) => task.title)).toEqual(
      expect.arrayContaining([
        'Take your umbrella',
        'Take water',
        'Prepare health documents',
        'Plan Noah birthday',
        'Pick up essentials',
        'Handle overdue reminder',
        'Prepare for the early start',
        'Keep the day simple',
      ]),
    );
    expect(tasks.find((task) => task.title === 'Plan Noah birthday')?.message).toContain('chocolate cake');
    expect(tasks.find((task) => task.title === 'Pick up essentials')?.message).toContain('Milk, Eggs');
  });

  it('respects routine inclusion preferences', () => {
    const tasks = PreparationService.generate({
      ...input,
      preferences: {
        ...input.preferences!,
        includeWeatherInRoutines: false,
        includeShoppingInRoutines: false,
      },
    });

    expect(tasks.map((task) => task.sourceType)).not.toContain('weather');
    expect(tasks.map((task) => task.sourceType)).not.toContain('shopping');
  });
});
