import type {
  CalendarEvent,
  MomCheckInput,
  PreparationTask,
  PreparationTaskCategory,
  PreparationTaskPriority,
  UserPreferences,
} from '../types';

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

const defaultRoutinePreferences: Pick<
  UserPreferences,
  | 'includeWeatherInRoutines'
  | 'includeBirthdaysInRoutines'
  | 'includeShoppingInRoutines'
  | 'includeCalendarPrepInRoutines'
> = {
  includeWeatherInRoutines: true,
  includeBirthdaysInRoutines: true,
  includeShoppingInRoutines: true,
  includeCalendarPrepInRoutines: true,
};

const task = (
  input: Omit<PreparationTask, 'completed' | 'createdAt'>,
  createdAt: string,
): PreparationTask => ({
  ...input,
  completed: false,
  createdAt,
});

const categoryForEvent = (event: CalendarEvent): PreparationTaskCategory => {
  if (event.category === 'medical' || event.category === 'health') return 'health';
  if (event.category === 'school') return 'school';
  if (event.category === 'work') return 'work';
  if (event.category === 'family') return 'family';
  if (event.category === 'personal') return 'personal';
  return 'other';
};

const priorityWeight: Record<PreparationTaskPriority, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
  later: 3,
};

export const PreparationService = {
  generate(input: MomCheckInput): PreparationTask[] {
    const preferences = { ...defaultRoutinePreferences, ...(input.preferences ?? {}) };
    const createdAt = `${input.today}T08:00:00`;
    const tasks: PreparationTask[] = [];
    const todayEvents = sortByTime(input.calendarEvents.filter((event) => sameDay(event.startsAt, input.today)));
    const tomorrowEvents = sortByTime(input.calendarEvents.filter((event) => daysBetween(input.today, event.startsAt) === 1));

    if (preferences.includeWeatherInRoutines && input.weatherForecast) {
      if (input.weatherForecast.rainExpectedToday || input.weatherForecast.rainExpectedLaterToday) {
        tasks.push(task({
          id: `prep-weather-rain-${input.weatherForecast.cityName}`,
          sourceType: 'weather',
          sourceId: `${input.weatherForecast.cityName}-rain`,
          title: 'Take your umbrella',
          message: 'Rain is expected today. Put the umbrella by the door before you leave.',
          category: 'weather',
          priority: 'important',
          dueDate: input.today,
        }, createdAt));
      }
      if (input.weatherForecast.hotDayExpected) {
        tasks.push(task({
          id: `prep-weather-heat-${input.weatherForecast.cityName}`,
          sourceType: 'weather',
          sourceId: `${input.weatherForecast.cityName}-heat`,
          title: 'Take water',
          message: "It may get hot today. Take water if you're going out.",
          category: 'weather',
          priority: 'normal',
          dueDate: input.today,
        }, createdAt));
      }
      if (input.weatherForecast.coldDayExpected) {
        tasks.push(task({
          id: `prep-weather-cold-${input.weatherForecast.cityName}`,
          sourceType: 'weather',
          sourceId: `${input.weatherForecast.cityName}-cold`,
          title: 'Take a jacket',
          message: 'It may be cold today. Take a jacket, just in case.',
          category: 'weather',
          priority: 'normal',
          dueDate: input.today,
        }, createdAt));
      }
    }

    if (preferences.includeCalendarPrepInRoutines) {
      [...todayEvents, ...tomorrowEvents].filter((event) => isHealthCategory(event.category)).forEach((event) => {
        tasks.push(task({
          id: `prep-health-${event.id}`,
          sourceType: 'event',
          sourceId: event.id,
          title: 'Prepare health documents',
          message: `${event.title}: prepare your health card and any documents.`,
          category: 'health',
          priority: daysBetween(input.today, event.startsAt) <= 1 ? 'important' : 'normal',
          dueDate: event.startsAt.slice(0, 10),
        }, createdAt));
      });

      const firstTodayEvent = todayEvents[0];
      if (firstTodayEvent && new Date(firstTodayEvent.startsAt).getHours() < 9) {
        tasks.push(task({
          id: `prep-early-${firstTodayEvent.id}`,
          sourceType: 'event',
          sourceId: firstTodayEvent.id,
          title: 'Prepare for the early start',
          message: `${firstTodayEvent.title} is before 9:00 AM. Set out what you need tonight so the morning is easier.`,
          category: categoryForEvent(firstTodayEvent),
          priority: 'important',
          dueDate: input.today,
        }, createdAt));
      }

      if (todayEvents.length > 3) {
        tasks.push(task({
          id: 'prep-busy-day',
          sourceType: 'routine',
          title: 'Keep the day simple',
          message: "You have a full calendar today. Don't add too much.",
          category: 'home',
          priority: 'normal',
          dueDate: input.today,
        }, createdAt));
      }
    }

    if (preferences.includeBirthdaysInRoutines) {
      input.birthdays
        .map((birthday) => ({ birthday, daysUntil: daysBetween(input.today, birthday.date) }))
        .filter(({ daysUntil }) => daysUntil >= 0 && daysUntil <= 3)
        .forEach(({ birthday, daysUntil }) => {
          const details = [
            birthday.giftIdea ? `gift idea: ${birthday.giftIdea}` : undefined,
            birthday.favoriteCakeOrTreat ? `favorite treat: ${birthday.favoriteCakeOrTreat}` : undefined,
          ].filter(Boolean);
          tasks.push(task({
            id: `prep-birthday-${birthday.id}`,
            sourceType: 'birthday',
            sourceId: birthday.id,
            title: `Plan ${birthday.name} birthday`,
            message: `${birthday.name}'s birthday is in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. ${details.length ? details.join('; ') : 'Plan gift, card, or cake.'}`,
            category: 'family',
            priority: daysUntil <= 1 ? 'urgent' : 'important',
            dueDate: birthday.date,
          }, createdAt));
        });
    }

    if (preferences.includeShoppingInRoutines) {
      const essentials = input.shoppingList.items.filter((item) => isEssentialShoppingItem(item) && !item.checked);
      if (essentials.length > 0) {
        tasks.push(task({
          id: `prep-shopping-${input.shoppingList.id}`,
          sourceType: 'shopping',
          sourceId: input.shoppingList.id,
          title: 'Pick up essentials',
          message: `Pick up essentials: ${essentials.map((item) => item.label).join(', ')}.`,
          category: 'shopping',
          priority: 'important',
          dueDate: input.today,
        }, createdAt));
      }
    }

    input.reminders?.filter((reminder) => !reminder.completed && reminder.dueAt).forEach((reminder) => {
      const daysUntil = daysBetween(input.today, reminder.dueAt!);
      if (daysUntil < 0) {
        tasks.push(task({
          id: `prep-overdue-${reminder.id}`,
          sourceType: 'reminder',
          sourceId: reminder.id,
          title: 'Handle overdue reminder',
          message: `${reminder.title} is overdue. Handle it today so it stops following you around.`,
          category: 'home',
          priority: 'urgent',
          dueDate: reminder.dueAt,
        }, createdAt));
      } else if (daysUntil <= 1) {
        tasks.push(task({
          id: `prep-reminder-${reminder.id}`,
          sourceType: 'reminder',
          sourceId: reminder.id,
          title: reminder.title,
          message: daysUntil === 0 ? `${reminder.title} is due today.` : `${reminder.title} is due tomorrow.`,
          category: 'home',
          priority: reminder.priority === 'high' ? 'urgent' : 'important',
          dueDate: reminder.dueAt,
        }, createdAt));
      }
    });

    return tasks.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
  },
};
