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
    const language = input.preferences?.language ?? 'en';

    if (input.weatherForecast?.rainExpectedLaterToday) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'high', {
            title: language === 'es' ? 'Revisa el paraguas' : 'Umbrella check',
            detail: language === 'es' ? 'Se espera lluvia más tarde. Coge el paraguas antes de salir.' : 'Rain is expected later today. Take your umbrella before leaving.',
            sourceId: `${input.weatherForecast.cityName}-rain`,
          }, language),
          'important',
        ),
      );
    }
    if (input.weatherForecast?.highWindExpectedToday) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'medium', {
            title: language === 'es' ? 'Día con viento' : 'Windy day',
            detail: language === 'es' ? 'Puede hacer viento hoy. Ten cuidado si vas en bici o llevas paraguas.' : "It may be windy today. Be careful if you're biking or carrying an umbrella.",
            sourceId: `${input.weatherForecast.cityName}-wind`,
          }, language),
          'important',
        ),
      );
    }
    if (input.weatherForecast?.hotDayExpected) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'medium', {
            title: language === 'es' ? 'Día caluroso' : 'Warm day ahead',
            detail: language === 'es' ? 'Puede hacer calor hoy. Lleva agua si vas a salir.' : "It may get hot today. Take water if you're going out.",
            sourceId: `${input.weatherForecast.cityName}-heat`,
          }, language),
          'important',
        ),
      );
    }
    if (input.weatherForecast?.coldDayExpected) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'weather', 'low', {
            title: language === 'es' ? 'Tiempo fresquito' : 'Chilly weather',
            detail: language === 'es' ? 'Puede hacer frío hoy. Llévate una chaqueta, por si acaso.' : 'It may be cold today. Take a jacket, just in case.',
            sourceId: `${input.weatherForecast.cityName}-cold`,
          }, language),
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
            title: language === 'es' ? 'Evento a la vista' : 'Event coming up',
            detail: language === 'es' ? `${soonEvent.title} empieza pronto` : `${soonEvent.title} starts soon`,
            sourceId: soonEvent.id,
          }, language),
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
            title: language === 'es' ? `Vencido: ${overdueReminder.title}` : `Overdue: ${overdueReminder.title}`,
            detail: language === 'es'
              ? `${overdueReminder.title} está vencido. Hazlo hoy para que deje de perseguirte.`
              : `${overdueReminder.title} is overdue. Handle it today so it stops following you around.`,
            sourceId: overdueReminder.id,
          }, language),
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
            title: language === 'es' ? 'Cita médica mañana' : 'Doctor appointment tomorrow',
            detail: language === 'es' ? `${tomorrowMedical.title} es mañana.` : `${tomorrowMedical.title} is tomorrow.`,
            sourceId: tomorrowMedical.id,
          }, language),
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
            detail: language === 'es'
              ? `${tomorrowMorningEvent.title} es mañana por la mañana. Deja preparado esta noche lo que necesites.`
              : `${tomorrowMorningEvent.title} is tomorrow morning. Set out anything you need tonight`,
            sourceId: tomorrowMorningEvent.id,
          }, language),
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
            title: language === 'es' ? `Cumpleaños de ${nextBirthday.birthday.name}` : `${nextBirthday.birthday.name}'s birthday`,
            detail: language === 'es' ? `Cumpleaños de ${nextBirthday.birthday.name}` : `${nextBirthday.birthday.name}'s birthday`,
            daysUntil: nextBirthday.daysUntil,
            sourceId: nextBirthday.birthday.id,
          }, language),
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
            detail: language === 'es' ? `${highPriorityDueToday.title} vence hoy` : `${highPriorityDueToday.title} is due today`,
            sourceId: highPriorityDueToday.id,
          }, language),
          'urgent',
        ),
      );
    }

    const essentialUnchecked = input.shoppingList.items.filter((item) => isEssentialShoppingItem(item) && !item.checked);
    if (essentialUnchecked.length > 0) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'shopping', 'medium', {
            title: language === 'es' ? 'Esenciales de compra' : 'Grocery essentials',
            names: essentialUnchecked.map((item) => item.label).join(', '),
            sourceId: input.shoppingList.id,
          }, language),
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
            detail: language === 'es' ? `${nonEssentialUnchecked.label} sigue en la lista` : `${nonEssentialUnchecked.label} is still on the list`,
            sourceId: nonEssentialUnchecked.id,
          }, language),
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
            detail: language === 'es' ? `${reminderDueTomorrow.title} vence mañana` : `${reminderDueTomorrow.title} is due tomorrow`,
            sourceId: reminderDueTomorrow.id,
          }, language),
          'important',
        ),
      );
    }

    const todayEvents = sortByTime(input.calendarEvents.filter((event) => sameDay(event.startsAt, today)));
    if (todayEvents.length > 3) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'busy-day', 'medium', {
            title: language === 'es' ? 'Ritmo para un día lleno' : 'Busy day pacing',
            detail: language === 'es' ? `Tienes ${todayEvents.length} cosas en el calendario hoy` : `You have ${todayEvents.length} things on the calendar today`,
          }, language),
          'important',
        ),
      );
    }

    const incompleteEssentials = input.littleReminders?.filter((reminder) => !reminder.completed) ?? [];
    if (incompleteEssentials.length > 0) {
      insights.push(
        withMomPriority(
          MomTemplateService.buildInsight(personality, 'routine', 'low', {
            title: incompleteEssentials.length === 1 ? incompleteEssentials[0].title : language === 'es' ? 'Esenciales diarios' : 'Daily essentials',
            detail: language === 'es'
              ? `${incompleteEssentials.length} pequeña nota de casa sigue${incompleteEssentials.length === 1 ? '' : 'n'} pendiente${incompleteEssentials.length === 1 ? '' : 's'}`
              : `${incompleteEssentials.length} little home note${incompleteEssentials.length === 1 ? ' is' : 's are'} still open`,
            sourceId: incompleteEssentials[0]?.id,
          }, language),
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
            }, language),
            momPriority,
          ),
        );
      });
    }

    const groups = grouped(insights);

    return {
      generatedAt: `${today}T08:00:00`,
      summary: language === 'es'
        ? `${insights.length} cositas que MOM ha notado por ti hoy.`
        : `${insights.length} little things MOM noticed for you today.`,
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
