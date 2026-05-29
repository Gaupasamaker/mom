import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Birthday, CalendarEvent, Reminder, UserPreferences } from '../types';

type NotificationPlan = {
  id: string;
  title: string;
  body: string;
  date: Date;
};

const isFutureDate = (date: Date) => date.getTime() > Date.now();

const parseTime = (value: string) => {
  const [hour, minute] = value.split(':').map((part) => Number(part));
  return {
    hour: Number.isFinite(hour) ? hour : 8,
    minute: Number.isFinite(minute) ? minute : 0,
  };
};

const dayBeforeAt = (isoDate: string, hour = 18, minute = 0) => {
  const date = new Date(isoDate);
  date.setDate(date.getDate() - 1);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const NotificationScheduler = {
  async requestPermissions() {
    if (Platform.OS === 'web') {
      return false;
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  },

  async syncSchedules(input: {
    preferences: UserPreferences;
    reminders: Reminder[];
    birthdays: Birthday[];
    calendarEvents: CalendarEvent[];
  }) {
    if (!input.preferences.notificationsEnabled || Platform.OS === 'web') {
      return;
    }

    const granted = await this.requestPermissions();
    if (!granted) {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    const plans = buildNotificationPlans(input);

    await Promise.all(
      plans.filter((plan) => isFutureDate(plan.date)).map((plan) => schedulePlan(plan)),
    );
  },
};

function buildNotificationPlans({
  preferences,
  reminders,
  birthdays,
  calendarEvents,
}: {
  preferences: UserPreferences;
  reminders: Reminder[];
  birthdays: Birthday[];
  calendarEvents: CalendarEvent[];
}): NotificationPlan[] {
  const plans: NotificationPlan[] = [];

  reminders.forEach((reminder) => {
    if (reminder.dueAt && !reminder.completed) {
      plans.push({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        body: reminder.message,
        date: new Date(reminder.dueAt),
      });
    }
  });

  birthdays.forEach((birthday) => {
    plans.push({
      id: `birthday-${birthday.id}`,
      title: `${birthday.name}'s birthday is tomorrow`,
      body: birthday.note ?? 'You still have time to make it sweet.',
      date: dayBeforeAt(birthday.date, 9, 0),
    });
  });

  calendarEvents.forEach((event) => {
    plans.push({
      id: `event-${event.id}`,
      title: `${event.title} tomorrow`,
      body: event.preparationNote ?? 'A little prep tonight will help tomorrow.',
      date: dayBeforeAt(event.startsAt, 19, 0),
    });
  });

  const { hour, minute } = parseTime(preferences.dailySummaryTime);
  const summaryDate = new Date();
  summaryDate.setDate(summaryDate.getDate() + 1);
  summaryDate.setHours(hour, minute, 0, 0);
  plans.push({
    id: 'daily-summary',
    title: 'MOM has your day ready',
    body: 'Take a quick look before the day starts.',
    date: summaryDate,
  });

  if (preferences.morningRoutineEnabled) {
    const routineTime = parseTime(preferences.morningRoutineTime);
    const routineDate = new Date();
    routineDate.setHours(routineTime.hour, routineTime.minute, 0, 0);
    if (!isFutureDate(routineDate)) {
      routineDate.setDate(routineDate.getDate() + 1);
    }

    plans.push({
      id: 'morning-routine',
      title: 'MOM has your morning prep',
      body: 'A tiny check now can save a scramble later.',
      date: routineDate,
    });
  }

  if (preferences.eveningRoutineEnabled) {
    const routineTime = parseTime(preferences.eveningRoutineTime);
    const routineDate = new Date();
    routineDate.setHours(routineTime.hour, routineTime.minute, 0, 0);
    if (!isFutureDate(routineDate)) {
      routineDate.setDate(routineDate.getDate() + 1);
    }

    plans.push({
      id: 'evening-routine',
      title: 'MOM says: prep tomorrow',
      body: 'Put one thing by the door before you rest.',
      date: routineDate,
    });
  }

  if (preferences.eveningReminderEnabled) {
    const eveningDate = new Date();
    eveningDate.setHours(19, 30, 0, 0);
    if (!isFutureDate(eveningDate)) {
      eveningDate.setDate(eveningDate.getDate() + 1);
    }

    plans.push({
      id: 'evening-reminder',
      title: 'Tiny evening reset',
      body: 'Check tomorrow and put one thing by the door.',
      date: eveningDate,
    });
  }

  return plans;
}

async function schedulePlan(plan: NotificationPlan) {
  await Notifications.scheduleNotificationAsync({
    identifier: plan.id,
    content: {
      title: plan.title,
      body: plan.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: plan.date,
    },
  });
}
