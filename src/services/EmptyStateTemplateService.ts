import type { MomPersonality } from '../types';

export type EmptyStateKind =
  | 'calendar'
  | 'home-events'
  | 'shopping'
  | 'little-reminders'
  | 'reminders'
  | 'family'
  | 'birthdays';

type EmptyStateCopy = {
  title: string;
  message: string;
};

const copy: Record<EmptyStateKind, Record<MomPersonality, EmptyStateCopy>> = {
  calendar: {
    sweet: { title: 'No plans today', message: 'Enjoy the rare peace. I will keep watch when plans appear.' },
    funny: { title: 'No plans today', message: 'Suspiciously peaceful. Let us not scare it away.' },
    strict: { title: 'No plans today', message: 'Good. Keep it that way unless something truly matters.' },
    minimal: { title: 'No plans today', message: 'Clear calendar.' },
  },
  'home-events': {
    sweet: { title: 'No plans pinned yet', message: 'Add a calendar event and I will keep it in sight.' },
    funny: { title: 'No plans pinned yet', message: 'The fridge board is behaving. Strange, but lovely.' },
    strict: { title: 'No plans pinned yet', message: 'Add anything time-sensitive before it becomes a scramble.' },
    minimal: { title: 'No plans pinned yet', message: 'Add an event.' },
  },
  shopping: {
    sweet: { title: 'No shopping list', message: 'Start with groceries, school things, or birthday gifts.' },
    funny: { title: 'No shopping list', message: 'Brave. The milk will not remember itself, though.' },
    strict: { title: 'No shopping list', message: 'Create one before the essentials disappear.' },
    minimal: { title: 'No shopping list', message: 'Add items.' },
  },
  'little-reminders': {
    sweet: { title: 'No little notes', message: 'Add tiny reminders for plants, calls, and bedtime things.' },
    funny: { title: 'No little notes', message: 'Nothing pending. Suspiciously peaceful.' },
    strict: { title: 'No little notes', message: 'Add the small tasks before they become big ones.' },
    minimal: { title: 'No little notes', message: 'Add a note.' },
  },
  reminders: {
    sweet: { title: 'No reminders', message: 'Nothing pending. I love that for you.' },
    funny: { title: 'No reminders', message: 'Nothing pending. Suspiciously peaceful.' },
    strict: { title: 'No reminders', message: 'Add dated reminders for anything that cannot slip.' },
    minimal: { title: 'No reminders', message: 'No pending reminders.' },
  },
  family: {
    sweet: { title: 'No family notes yet', message: 'Add your people and I will help remember the important stuff.' },
    funny: { title: 'No family notes yet', message: 'Add your people. Birthdays have a way of sneaking up.' },
    strict: { title: 'No family notes yet', message: 'Add family details so important dates do not get missed.' },
    minimal: { title: 'No family notes yet', message: 'Add a person.' },
  },
  birthdays: {
    sweet: { title: 'No birthdays saved', message: 'Add birthdays before the cake panic begins.' },
    funny: { title: 'No birthdays saved', message: 'No cake alarms yet. That feels dangerous.' },
    strict: { title: 'No birthdays saved', message: 'Add birthdays now so gifts are not last-minute.' },
    minimal: { title: 'No birthdays saved', message: 'Add birthdays.' },
  },
};

export const EmptyStateTemplateService = {
  get(kind: EmptyStateKind, personality: MomPersonality = 'sweet'): EmptyStateCopy {
    return copy[kind][personality];
  },
};
