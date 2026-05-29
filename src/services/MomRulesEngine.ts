import { MomTemplateService } from './MomTemplateService';
import { PreparationService } from './PreparationService';
import type { CalendarEvent, MomCheckInput, MomCheckPriority, MomCheckResult, MomInsight } from '../types';

const dayInMs = 24 * 60 * 60 * 1000;

const sameDay = (a: string, b: string) => a.slice(0, 10) === b.slice(0, 10);

const daysBetween = (from: string, to: string) => {
  const start = new Date(`${from.slice(0, 10)}T00:00:00`);
  const end = new Date(`${to.slice(0, 10)}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / dayInMs);
};

const sortByTime = (events: CalendarEvent[]) =>
  [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

const isEssentialShoppingItem = (item: { essential?: boolean; isEssential?: boolean }) => item.essential === true || item.isEssential === true;
const isHealthCategory = (category: string) => category === 'health' || category === 'medical';

const withMomPriority = (insight: MomInsight, momPriority: MomCheckPriority): MomInsight => ({
  ...insight,
  momPriority,
  priority: momPriority === 'urgent' ? 'high' : momPriority === 'important' ? 'medium' : 'low',
});

const grouped = (insights: MomInsight[]): Record<MomCheckPriority, MomInsight[]> => ({
  urgent: insights.filter((insight) => insight.momPriority === 'urgent'),
  important: insights.filter((insight) => insight.momPriority === 'important'),
  later: insights.filter((insight) => insight.momPriority === 'later'),
});

export const MomRulesEngine = {
  evaluate(input: MomCheckInput): MomCheckResult {
    const { today, userProfile } = input;
    const insights: MomInsight[] = [];
    const personality = userProfile.personality;

    if (input.weatherForecast?.rainExpectedLaterToday) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'high', {
            title: 'Umbrella check',
            detail: 'Rain is expected later today. Take your umbrella before leaving.',
            sourceId: `${input.weatherForecast.cityName}-rain`,
          }),
          'important',
        ),
      );
    }
    if (input.weatherForecast?.highWindExpectedToday) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'medium', {
            title: 'Windy day',
            detail: "It may be windy today. Be careful if you're biking or carrying an umbrella.",
            sourceId: `${input.weatherForecast.cityName}-wind`,
          }),
          'important',
        ),
      );
    }
    if (input.weatherForecast?.hotDayExpected) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'medium', {
            title: 'Warm day ahead',
            detail: "It may get hot today. Take water if you're going out.",
            sourceId: `${input.weatherForecast.cityName}-heat`,
          }),
          'important',
        ),
      );
    }
    if (input.weatherForecast?.coldDayExpected) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'low', {
            title: 'Chilly weather',
            detail: 'It may be cold today. Take a jacket, just in case.',
            sourceId: `${input.weatherForecast.cityName}-cold`,
          }),
          'later',
        ),
      );
    }

    const currentTime = new Date(`${today}T08:00:00`);
    const soonEvent = sortByTime(input.calendarEvents).find((event) => {
      const startsAt = new Date(event.startsAt);
      const hoursUntil = (startsAt.getTime() - currentTime.getTime()) / (60 * 60 * 1000);
      return sameDay(event.startsAt, today) && hoursUntil >= 0 && hoursUntil <= 2;
    });

    if (soonEvent) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'busy-day', 'high', {
            title: 'Event coming up',
            detail: `${soonEvent.title} starts soon`,
            sourceId: soonEvent.id,
          }),
          'urgent',
        ),
      );
    }

    const overdueReminder = input.reminders?.find((reminder) => {
      if (!reminder.dueAt || reminder.completed) {
        return false;
      }

      return new Date(reminder.dueAt).getTime() < new Date(`${today}T23:59:59`).getTime() && !sameDay(reminder.dueAt, today);
    });

    if (overdueReminder) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'routine', 'high', {
            title: `Overdue: ${overdueReminder.title}`,
            detail: `${overdueReminder.title} is overdue. Handle it today so it stops following you around.`,
            sourceId: overdueReminder.id,
          }),
          'urgent',
        ),
      );
    }

    const tomorrowMedical = input.calendarEvents.find(
      (event) => isHealthCategory(event.category) && daysBetween(today, event.startsAt) === 1,
    );
    if (tomorrowMedical) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'medical-prep', 'high', {
            title: 'Doctor appointment tomorrow',
            detail: `${tomorrowMedical.title} is tomorrow.`,
            sourceId: tomorrowMedical.id,
          }),
          'urgent',
        ),
      );
    }

    const tomorrowMorningEvent = input.calendarEvents.find((event) => {
      const startsAt = new Date(event.startsAt);
      return daysBetween(today, event.startsAt) === 1 && startsAt.getHours() < 12 && !isHealthCategory(event.category);
    });

    if (tomorrowMorningEvent) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'busy-day', 'medium', {
            title: tomorrowMorningEvent.title,
            detail: `${tomorrowMorningEvent.title} is tomorrow morning. Set out anything you need tonight`,
            sourceId: tomorrowMorningEvent.id,
          }),
          'important',
        ),
      );
    }

    const nextBirthday = input.birthdays
      .map((birthday) => ({ birthday, daysUntil: daysBetween(today, birthday.date) }))
      .filter(({ daysUntil }) => daysUntil >= 0 && daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil)[0];

    if (nextBirthday) {
      const birthdayPriority: MomCheckPriority = nextBirthday.daysUntil <= 1 ? 'urgent' : 'important';
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'birthday', birthdayPriority === 'urgent' ? 'high' : 'medium', {
            title: `${nextBirthday.birthday.name}'s birthday`,
            detail: `${nextBirthday.birthday.name}'s birthday`,
            daysUntil: nextBirthday.daysUntil,
            sourceId: nextBirthday.birthday.id,
          }),
          birthdayPriority,
        ),
      );
    }

    const highPriorityDueToday = input.reminders?.find(
      (reminder) => !reminder.completed && reminder.priority === 'high' && reminder.dueAt && sameDay(reminder.dueAt, today),
    );

    if (highPriorityDueToday) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'routine', 'high', {
            title: highPriorityDueToday.title,
            detail: `${highPriorityDueToday.title} is due today`,
            sourceId: highPriorityDueToday.id,
          }),
          'urgent',
        ),
      );
    }

    const essentialUnchecked = input.shoppingList.items.filter((item) => isEssentialShoppingItem(item) && !item.checked);
    if (essentialUnchecked.length > 0) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'shopping', 'medium', {
            title: 'Grocery essentials',
            names: essentialUnchecked.map((item) => item.label).join(', '),
            sourceId: input.shoppingList.id,
          }),
          'important',
        ),
      );
    }

    const nonEssentialUnchecked = input.shoppingList.items.find((item) => !isEssentialShoppingItem(item) && !item.checked);
    if (nonEssentialUnchecked) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'shopping', 'low', {
            title: nonEssentialUnchecked.label,
            detail: `${nonEssentialUnchecked.label} is still on the list`,
            sourceId: nonEssentialUnchecked.id,
          }),
          'later',
        ),
      );
    }

    const reminderDueTomorrow = input.reminders?.find(
      (reminder) => !reminder.completed && reminder.dueAt && daysBetween(today, reminder.dueAt) === 1,
    );

    if (reminderDueTomorrow) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'routine', 'medium', {
            title: reminderDueTomorrow.title,
            detail: `${reminderDueTomorrow.title} is due tomorrow`,
            sourceId: reminderDueTomorrow.id,
          }),
          'important',
        ),
      );
    }

    const todayEvents = sortByTime(input.calendarEvents.filter((event) => sameDay(event.startsAt, today)));
    if (todayEvents.length > 3) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'busy-day', 'medium', {
            title: 'Busy day pacing',
            detail: `You have ${todayEvents.length} things on the calendar today`,
          }),
          'important',
        ),
      );
    }

    const incompleteEssentials = input.littleReminders?.filter((reminder) => !reminder.completed) ?? [];
    if (incompleteEssentials.length > 0) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'routine', 'low', {
            title: incompleteEssentials.length === 1 ? incompleteEssentials[0].title : 'Daily essentials',
            detail: `${incompleteEssentials.length} little home note${incompleteEssentials.length === 1 ? ' is' : 's are'} still open`,
            sourceId: incompleteEssentials[0]?.id,
          }),
          'later',
        ),
      );
    }

    if (input.preferences?.morningRoutineEnabled || input.preferences?.eveningRoutineEnabled) {
      PreparationService.generate(input).slice(0, 6).forEach((prepTask) => {
        const momPriority: MomCheckPriority = prepTask.priority === 'urgent' ? 'urgent' : prepTask.priority === 'later' ? 'later' : 'important';
        insights.push(
          withMomPriority(
            MomTemplateService.buildInsight(personality, 'preparation', momPriority === 'urgent' ? 'high' : momPriority === 'important' ? 'medium' : 'low', {
              title: prepTask.title,
              detail: prepTask.message,
              sourceId: prepTask.sourceId ?? prepTask.id,
            }),
            momPriority,
          ),
        );
      });
    }

    const groups = grouped(insights);

    return {
      generatedAt: `${today}T08:00:00`,
      summary: `${insights.length} little things MOM noticed for you today.`,
      insights,
      groups,
      suggestions: insights.map((insight) => ({
        id: `${insight.id}-suggestion`,
        title: insight.title,
        message: insight.message,
        priority: insight.priority,
      })),
    };
  },
};
