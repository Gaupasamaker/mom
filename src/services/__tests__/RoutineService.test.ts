import { describe, expect, it } from 'vitest';

import { RoutineService } from '../RoutineService';
import type { MomCheckInput } from '../../types';

const baseInput: MomCheckInput = {
  today: '2026-05-14',
  userProfile: {
    id: 'user-1',
    name: 'Sofia',
    personality: 'funny',
    reminderInterests: ['calendar', 'weather'],
  },
  preferences: {
    hasCompletedOnboarding: true,
    language: 'en',
    personality: 'funny',
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
    latitude: 38.3452,
    longitude: -0.481,
    currentConditionLabel: 'Rain',
    rainExpectedToday: true,
    rainExpectedLaterToday: true,
    updatedAt: '2026-05-14T07:00:00.000Z',
  },
  calendarEvents: [
    { id: 'today', title: 'Project meeting', startsAt: '2026-05-14T09:30:00', category: 'work' },
    { id: 'tomorrow-health', title: 'Doctor appointment', startsAt: '2026-05-15T10:00:00', category: 'health' },
  ],
  reminders: [],
  birthdays: [],
  shoppingList: { id: 'list', title: 'Groceries', items: [] },
};

describe('RoutineService', () => {
  it('generates morning and evening routines with tone-specific copy', () => {
    const morning = RoutineService.generate(baseInput, 'morning');
    const evening = RoutineService.generate(baseInput, 'evening');

    expect(morning.type).toBe('morning');
    expect(morning.message).toContain('prevent chaos');
    expect(morning.tasks.map((task) => task.title)).toContain('Take your umbrella');
    expect(evening.type).toBe('evening');
    expect(evening.message).toContain('Future you');
    expect(evening.tasks.map((task) => task.title)).toContain('Prepare health documents');
  });

  it('returns warm empty-state routines when there is nothing to prepare', () => {
    const routine = RoutineService.generate(
      {
        ...baseInput,
        weatherForecast: null,
        calendarEvents: [],
        shoppingList: { id: 'list', title: 'Groceries', items: [] },
      },
      'evening',
    );

    expect(routine.tasks).toEqual([]);
    expect(routine.message).toContain('rare calm');
  });
});
