import { MomTemplateService } from './MomTemplateService';
import type { DailyHighlight, DailySummary, MomCheckInput } from '../types';

const dayInMs = 24 * 60 * 60 * 1000;

const sameDay = (a: string, b: string) => a.slice(0, 10) === b.slice(0, 10);

const daysBetween = (from: string, to: string) => {
  const start = new Date(`${from.slice(0, 10)}T00:00:00`);
  const end = new Date(`${to.slice(0, 10)}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / dayInMs);
};

const isHealthCategory = (category: string) => category === 'health' || category === 'medical';
const isEssentialShoppingItem = (item: { essential?: boolean; isEssential?: boolean }) => item.essential === true || item.isEssential === true;

export const DailySummaryService = {
  create(input: MomCheckInput): DailySummary {
    const today = input.today;
    const language = input.preferences?.language ?? 'en';
    const eventsToday = input.calendarEvents.filter((event) => sameDay(event.startsAt, today));
    const eventsTomorrow = input.calendarEvents.filter((event) => daysBetween(today, event.startsAt) === 1);
    const activeReminders = input.reminders?.filter((reminder) => !reminder.completed) ?? [];
    const overdueReminders = activeReminders.filter(
      (reminder) => reminder.dueAt && daysBetween(today, reminder.dueAt) < 0,
    );
    const dueReminders = activeReminders.filter((reminder) => reminder.dueAt && sameDay(reminder.dueAt, today));
    const upcomingBirthdays = input.birthdays.filter((birthday) => {
      const daysUntil = daysBetween(today, birthday.date);
      return daysUntil >= 0 && daysUntil <= 7;
    });
    const incompleteEssentialShopping = input.shoppingList.items.filter((item) => isEssentialShoppingItem(item) && !item.checked);
    const incompleteLittleReminders = input.littleReminders?.filter((reminder) => !reminder.completed) ?? [];
    const healthEvents = [...eventsToday, ...eventsTomorrow].filter((event) => isHealthCategory(event.category));
    const familyEvents = eventsToday.filter((event) => event.category === 'family');
    const isBusyDay = eventsToday.length > 3;

    const highlights: DailyHighlight[] = [
      ...overdueReminders.map((reminder) => ({
        type: 'reminder' as const,
        priority: 'urgent' as const,
        title: reminder.title,
        message: language === 'es' ? 'Este recordatorio está vencido.' : 'This reminder is overdue.',
        sourceId: reminder.id,
      })),
      ...dueReminders.map((reminder) => ({
        type: 'reminder' as const,
        priority: reminder.priority === 'high' ? ('urgent' as const) : ('important' as const),
        title: reminder.title,
        message: language === 'es' ? 'Vence hoy.' : 'This is due today.',
        sourceId: reminder.id,
      })),
      ...healthEvents.map((event) => ({
        type: 'health' as const,
        priority: 'important' as const,
        title: event.title,
        message: sameDay(event.startsAt, today)
          ? language === 'es' ? 'Evento de salud hoy.' : 'Health-related event today.'
          : language === 'es' ? 'Evento de salud mañana.' : 'Health-related event tomorrow.',
        sourceId: event.id,
      })),
      ...upcomingBirthdays.map((birthday) => ({
        type: 'birthday' as const,
        priority: daysBetween(today, birthday.date) <= 1 ? ('urgent' as const) : ('important' as const),
        title: language === 'es' ? `Cumpleaños de ${birthday.name}` : `${birthday.name}'s birthday`,
        message: birthday.favoriteCakeOrTreat
          ? language === 'es' ? `Recuerda ${birthday.favoriteCakeOrTreat}.` : `Remember ${birthday.favoriteCakeOrTreat}.`
          : language === 'es' ? 'Aún tienes tiempo de preparar algo bonito.' : 'You still have time to plan something kind.',
        sourceId: birthday.id,
      })),
      ...incompleteEssentialShopping.map((item) => ({
        type: 'shopping' as const,
        priority: 'important' as const,
        title: item.label,
        message: language === 'es' ? 'Artículo esencial de compra aún pendiente.' : 'Essential shopping item still unchecked.',
        sourceId: item.id,
      })),
      ...familyEvents.map((event) => ({
        type: 'family' as const,
        priority: 'normal' as const,
        title: event.title,
        message: language === 'es' ? 'Plan familiar en el tablero de hoy.' : 'Family plan on the board today.',
        sourceId: event.id,
      })),
      ...incompleteLittleReminders.slice(0, 2).map((reminder) => ({
        type: 'suggestion' as const,
        priority: 'later' as const,
        title: reminder.title,
        message: language === 'es' ? 'Una pequeña nota de casa sigue pendiente.' : 'A small home note is still open.',
        sourceId: reminder.id,
      })),
    ];

    if (isBusyDay) {
      highlights.push({
        type: 'suggestion',
        priority: 'important',
        title: language === 'es' ? 'Ritmo para un día lleno' : 'Busy day pacing',
        message: language === 'es' ? 'Deja un poco de margen entre planes.' : 'Leave a little buffer between plans.',
      });
    }

    const summaryWithoutMessage = {
      date: today,
      eventCountToday: eventsToday.length,
      overdueReminderCount: overdueReminders.length,
      dueReminderCount: dueReminders.length,
      upcomingBirthdayCount: upcomingBirthdays.length,
      incompleteEssentialShoppingCount: incompleteEssentialShopping.length,
      isBusyDay,
      highlights,
    };

    return {
      ...summaryWithoutMessage,
      topMessage: MomTemplateService.buildDailySummaryMessage(input.userProfile.personality, summaryWithoutMessage, language),
    };
  },
};
