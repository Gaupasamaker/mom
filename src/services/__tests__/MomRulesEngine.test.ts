import { describe, expect, it } from 'vitest';

import { MomRulesEngine } from '../MomRulesEngine';
import type { MomCheckInput } from '../../types';

const input: MomCheckInput = {
  today: '2026-05-13',
  userProfile: {
    id: 'user-1',
    name: 'Sofia',
    personality: 'sweet',
    reminderInterests: ['weather', 'birthdays', 'calendar', 'shopping', 'family'],
  },
  weatherAlerts: [
    {
      id: 'weather-1',
      type: 'rain',
      date: '2026-05-13',
      severity: 'medium',
      title: 'Rain later',
      message: 'Rain expected after lunch.',
    },
  ],
  weatherForecast: {
    cityName: 'Alicante',
    country: 'Spain',
    latitude: 38.3452,
    longitude: -0.481,
    currentConditionLabel: 'Rain',
    rainExpectedToday: true,
    rainExpectedLaterToday: true,
    updatedAt: '2026-05-14T09:00:00.000Z',
  },
  calendarEvents: [
    {
      id: 'event-1',
      title: 'Morning workout',
      startsAt: '2026-05-13T07:30:00',
      category: 'personal',
    },
    {
      id: 'event-2',
      title: 'Project meeting',
      startsAt: '2026-05-13T09:00:00',
      category: 'work',
    },
    {
      id: 'event-3',
      title: 'Doctor appointment',
      startsAt: '2026-05-14T10:00:00',
      category: 'medical',
      preparationNote: 'Bring your health card.',
    },
    {
      id: 'event-4',
      title: 'Lunch with Emma',
      startsAt: '2026-05-13T12:30:00',
      category: 'family',
    },
    {
      id: 'event-5',
      title: 'Dinner with family',
      startsAt: '2026-05-13T18:30:00',
      category: 'family',
    },
  ],
  birthdays: [
    {
      id: 'birthday-1',
      name: 'Noah',
      date: '2026-05-16',
      relationship: 'nephew',
      note: 'He loves chocolate cake.',
    },
  ],
  shoppingList: {
    id: 'shopping-1',
    title: 'Groceries',
    items: [
      { id: 'milk', label: 'Milk', checked: false, essential: true },
      { id: 'eggs', label: 'Eggs', checked: false, essential: true },
      { id: 'bread', label: 'Bread', checked: true, essential: true },
      { id: 'flowers', label: 'Flowers', checked: false },
    ],
  },
  reminders: [
    {
      id: 'overdue-1',
      title: 'Pay school fee',
      message: 'School fee is due.',
      dueAt: '2026-05-12T18:00:00',
      category: 'family',
      completed: false,
    },
  ],
};

describe('MomRulesEngine', () => {
  it('prioritizes rule-based MOM Check insights from mock data', () => {
    const result = MomRulesEngine.evaluate(input);

    expect(result.insights.map((insight) => insight.type)).toEqual(
      expect.arrayContaining(['weather', 'routine', 'medical-prep', 'birthday', 'shopping', 'busy-day']),
    );
    expect(result.insights[0].message).toContain('umbrella');
    expect(result.insights.some((insight) => insight.title.includes('Overdue'))).toBe(true);
    expect(result.insights.some((insight) => insight.message.includes('health card'))).toBe(true);
    expect(result.insights.find((insight) => insight.type === 'birthday')?.daysUntil).toBe(3);
    expect(result.insights.some((insight) => insight.message.includes('Milk, Eggs'))).toBe(true);
    expect(result.summary).toContain('8 little things');
  });

  it('flags tomorrow morning events and incomplete daily essentials', () => {
    const result = MomRulesEngine.evaluate({
      ...input,
      calendarEvents: [
        {
          id: 'event-early',
          title: 'School drop-off',
          startsAt: '2026-05-14T08:00:00',
          category: 'family',
        },
      ],
      reminders: [],
      birthdays: [],
      shoppingList: { id: 'list', title: 'Groceries', items: [] },
      weatherAlerts: [],
      weatherForecast: null,
      littleReminders: [
        { id: 'plants', title: 'Water plants', completed: false },
        { id: 'book', title: 'Read 10 pages', completed: true },
      ],
    });

    expect(result.insights.map((insight) => insight.title)).toEqual([
      'School drop-off',
      'Water plants',
    ]);
  });

  it('groups MOM Check insights by urgent, important, and later priorities', () => {
    const result = MomRulesEngine.evaluate({
      ...input,
      today: '2026-05-14',
      weatherAlerts: [],
      weatherForecast: null,
      calendarEvents: [
        { id: 'soon', title: 'Leave for dentist', startsAt: '2026-05-14T09:30:00', category: 'health' },
        { id: 'morning', title: 'School drop-off', startsAt: '2026-05-15T08:00:00', category: 'school' },
      ],
      birthdays: [{ id: 'tomorrow-birthday', name: 'Emma', date: '2026-05-15', relationship: 'friend' }],
      reminders: [
        {
          id: 'due-high',
          title: 'Bring forms',
          message: 'Forms are due.',
          dueAt: '2026-05-14T16:00:00',
          category: 'school',
          priority: 'high',
          completed: false,
        },
        {
          id: 'due-tomorrow',
          title: 'Wrap gift',
          message: 'Wrap Emma gift.',
          dueAt: '2026-05-15T18:00:00',
          category: 'family',
          completed: false,
        },
      ],
      littleReminders: [{ id: 'plants', title: 'Water plants', completed: false }],
      shoppingList: {
        id: 'list',
        title: 'Groceries',
        items: [{ id: 'snacks', label: 'Snacks', checked: false }],
      },
    });

    expect(result.groups?.urgent.map((insight) => insight.title)).toEqual([
      'Event coming up',
      "Emma's birthday",
      'Bring forms',
    ]);
    expect(result.groups?.important.map((insight) => insight.title)).toContain('School drop-off');
    expect(result.groups?.important.map((insight) => insight.title)).toContain('Wrap gift');
    expect(result.groups?.later.map((insight) => insight.title)).toContain('Water plants');
  });

  it('creates MOM Check weather insights from a real normalized forecast', () => {
    const result = MomRulesEngine.evaluate({
      ...input,
      weatherAlerts: [],
      weatherForecast: {
        cityName: 'Alicante',
        country: 'Spain',
        latitude: 38.3452,
        longitude: -0.481,
        timezone: 'Europe/Madrid',
        currentTemperature: 25,
        currentConditionLabel: 'Rain',
        rainExpectedToday: true,
        rainExpectedLaterToday: true,
        highWindExpectedToday: true,
        hotDayExpected: true,
        coldDayExpected: false,
        updatedAt: '2026-05-14T09:00:00.000Z',
      },
    });

    expect(result.groups?.important.map((insight) => insight.title)).toEqual(
      expect.arrayContaining(['Umbrella check', 'Windy day', 'Warm day ahead']),
    );
    expect(result.groups?.important.find((insight) => insight.title === 'Umbrella check')?.message).toContain(
      'Rain is expected later today',
    );
  });

  it('includes generated preparation tasks as MOM Check insights', () => {
    const result = MomRulesEngine.evaluate({
      ...input,
      today: '2026-05-14',
      preferences: {
        hasCompletedOnboarding: true,
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
      weatherForecast: null,
      weatherAlerts: [],
      calendarEvents: [{ id: 'doctor', title: 'Doctor appointment', startsAt: '2026-05-15T10:00:00', category: 'health' }],
      birthdays: [
        {
          id: 'noah',
          name: 'Noah',
          date: '2026-05-16',
          relationship: 'nephew',
          favoriteCakeOrTreat: 'chocolate cake',
        },
      ],
      shoppingList: {
        id: 'groceries',
        title: 'Groceries',
        items: [{ id: 'milk', label: 'Milk', checked: false, isEssential: true }],
      },
      reminders: [],
    });

    expect(result.insights.map((insight) => insight.type)).toContain('preparation');
    expect(result.groups?.important.map((insight) => insight.title)).toEqual(
      expect.arrayContaining(['Prepare health documents', 'Plan Noah birthday', 'Pick up essentials']),
    );
  });
});
