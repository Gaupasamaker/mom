import { describe, expect, it } from 'vitest';

import { DailySummaryService } from '../DailySummaryService';
import type { MomCheckInput } from '../../types';

const input: MomCheckInput = {
  today: '2026-05-14',
  userProfile: {
    id: 'user-1',
    name: 'Sofia',
    personality: 'sweet',
    reminderInterests: ['calendar', 'family', 'shopping'],
  },
  weatherAlerts: [],
  calendarEvents: [
    { id: 'event-1', title: 'Project meeting', startsAt: '2026-05-14T09:00:00', category: 'work' },
    { id: 'event-2', title: 'Doctor appointment', startsAt: '2026-05-15T10:00:00', category: 'health' },
    { id: 'event-3', title: 'Dinner with family', startsAt: '2026-05-14T19:00:00', category: 'family' },
  ],
  reminders: [
    {
      id: 'reminder-1',
      title: 'Pay school fee',
      message: 'School fee is due.',
      dueAt: '2026-05-13T18:00:00',
      category: 'school',
      completed: false,
      priority: 'high',
    },
    {
      id: 'reminder-2',
      title: 'Send permission slip',
      message: 'Send it before lunch.',
      dueAt: '2026-05-14T11:00:00',
      category: 'school',
      completed: false,
    },
  ],
  birthdays: [
    {
      id: 'birthday-1',
      name: 'Noah',
      date: '2026-05-16',
      relationship: 'nephew',
      favoriteCakeOrTreat: 'chocolate cake',
    },
  ],
  shoppingList: {
    id: 'shopping-1',
    title: 'Groceries',
    items: [
      { id: 'milk', label: 'Milk', checked: false, isEssential: true },
      { id: 'flowers', label: 'Flowers', checked: false },
    ],
  },
  littleReminders: [{ id: 'plants', title: 'Water plants', completed: false }],
};

describe('DailySummaryService', () => {
  it('creates a structured daily summary with tone-specific copy', () => {
    const summary = DailySummaryService.create(input);

    expect(summary).toMatchObject({
      date: '2026-05-14',
      eventCountToday: 2,
      overdueReminderCount: 1,
      dueReminderCount: 1,
      upcomingBirthdayCount: 1,
      incompleteEssentialShoppingCount: 1,
      isBusyDay: false,
    });
    expect(summary.topMessage).toContain('Good morning');
    expect(summary.highlights.map((highlight) => highlight.type)).toContain('health');
    expect(summary.highlights.map((highlight) => highlight.type)).toContain('shopping');
    expect(summary.highlights[0].priority).toBe('urgent');
  });

  it('uses minimal copy for Minimal Mom', () => {
    const summary = DailySummaryService.create({
      ...input,
      userProfile: { ...input.userProfile, personality: 'minimal' },
    });

    expect(summary.topMessage).toContain('2 events');
    expect(summary.topMessage).toContain('2 reminders');
  });
});
