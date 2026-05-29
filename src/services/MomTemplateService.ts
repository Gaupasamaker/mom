import type { DailySummary, MomInsight, MomInsightType, MomPersonality, Priority, RoutineType } from '../types';

type TemplateContext = {
  title: string;
  detail?: string;
  names?: string;
  daysUntil?: number;
  sourceId?: string;
};

const categoryLabels: Record<MomInsightType, string> = {
  weather: 'Weather',
  birthday: 'Birthday',
  'medical-prep': 'Health',
  shopping: 'Shopping',
  'busy-day': 'Calendar',
  routine: 'Home',
  preparation: 'Preparation',
};

const momNotes: Record<MomInsightType, Record<MomPersonality, string | undefined>> = {
  weather: {
    sweet: 'Better safe than soaked.',
    funny: 'Dry socks are a tiny luxury.',
    strict: 'Put it by the door.',
    minimal: undefined,
  },
  birthday: {
    sweet: 'A little planning makes it feel special.',
    funny: 'Cake diplomacy is powerful.',
    strict: 'Choose the cake today.',
    minimal: undefined,
  },
  'medical-prep': {
    sweet: 'Pack it tonight and rest easy.',
    funny: 'Morning-you will be grateful.',
    strict: 'Prepare it before bed.',
    minimal: undefined,
  },
  shopping: {
    sweet: 'A quick shop now saves dinner later.',
    funny: 'A sad fridge is preventable.',
    strict: 'Finish the essentials first.',
    minimal: undefined,
  },
  'busy-day': {
    sweet: 'Leave yourself a little breathing room.',
    funny: 'No sprinting between everything, please.',
    strict: 'Add buffer time.',
    minimal: undefined,
  },
  routine: {
    sweet: 'Small things count.',
    funny: 'Tiny chore, big relief.',
    strict: 'Handle it today.',
    minimal: undefined,
  },
  preparation: {
    sweet: 'Little prep, big difference.',
    funny: 'Future-you is already applauding.',
    strict: 'Do this before it becomes urgent.',
    minimal: undefined,
  },
};

export const MomTemplateService = {
  buildInsight(
    personality: MomPersonality,
    type: MomInsightType,
    priority: Priority,
    context: TemplateContext,
  ): MomInsight {
    const id = `${type}-${context.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const message = messages[type](personality, context);

    return {
      id,
      type,
      priority,
      title: context.title,
      message,
      categoryLabel: categoryLabels[type],
      momNote: momNotes[type][personality],
      sourceId: context.sourceId,
      daysUntil: context.daysUntil,
    };
  },
  buildDailySummaryMessage(personality: MomPersonality, summary: Omit<DailySummary, 'topMessage'>): string {
    const reminderCount = summary.overdueReminderCount + summary.dueReminderCount;
    if (personality === 'funny') {
      return summary.isBusyDay
        ? 'Today has plans. Not chaos yet, but let’s keep an eye on it.'
        : `Today has ${summary.eventCountToday} plan${summary.eventCountToday === 1 ? '' : 's'}. Manageable, with snacks.`;
    }
    if (personality === 'strict') {
      return `You have ${summary.eventCountToday} events and ${reminderCount} pending reminders today. Let’s not leave them for later.`;
    }
    if (personality === 'minimal') {
      return `${summary.eventCountToday} events. ${reminderCount} reminders. ${summary.upcomingBirthdayCount} birthday soon.`;
    }

    return `Good morning, sweetheart. You have ${summary.eventCountToday} thing${summary.eventCountToday === 1 ? '' : 's'} today, and ${summary.upcomingBirthdayCount} birthday${summary.upcomingBirthdayCount === 1 ? '' : 's'} coming up. We’ll keep it under control.`;
  },
  buildRoutineMessage(personality: MomPersonality, type: RoutineType, isEmpty: boolean): string {
    if (isEmpty) {
      if (type === 'morning') {
        if (personality === 'minimal') return 'Nothing urgent.';
        if (personality === 'strict') return 'Nothing urgent to prepare. Keep it that way.';
        return 'Nothing urgent to prepare. Suspiciously peaceful.';
      }

      if (personality === 'minimal') return 'Light tomorrow.';
      if (personality === 'strict') return 'Tomorrow looks light. Keep your basics ready.';
      return 'Tomorrow looks light. Enjoy the rare calm.';
    }

    if (type === 'morning') {
      if (personality === 'funny') return 'Today has plans. Let’s prevent chaos before breakfast.';
      if (personality === 'strict') return 'You have things to do. Let’s get organized.';
      if (personality === 'minimal') return "Today's prep.";
      return 'Good morning, sweetheart. Let’s get the important little things out of the way.';
    }

    if (personality === 'funny') return 'Future you deserves a tiny bit of preparation. Present you can handle it.';
    if (personality === 'strict') return 'Prepare tonight. Do not leave everything for tomorrow morning.';
    if (personality === 'minimal') return 'Tomorrow prep.';
    return 'Before you rest, let’s make tomorrow a little easier.';
  },
};

const messages: Record<MomInsightType, (personality: MomPersonality, context: TemplateContext) => string> = {
  weather: (personality, context) => context.detail ?? 'Rain is expected later. Take your umbrella before leaving.',
  birthday: (personality, context) =>
    `${context.detail ?? 'Someone special'} is in ${context.daysUntil} days. You still have time to plan something nice.`,
  'medical-prep': (personality, context) =>
    `${context.detail ?? 'Your appointment is tomorrow.'} Prepare your health card tonight.`,
  shopping: (personality, context) =>
    `Your grocery list still needs ${context.names}.`,
  'busy-day': (personality, context) =>
    `${context.detail ?? 'Today is packed'}. Put a little breathing room between things.`,
  routine: (personality, context) => context.detail ?? 'One small routine is waiting for you.',
  preparation: (personality, context) => context.detail ?? 'One small preparation task is ready.',
};
