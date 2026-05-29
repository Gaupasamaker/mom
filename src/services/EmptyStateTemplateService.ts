import type { AppLanguage, MomPersonality } from '../types';

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

const copy: Record<AppLanguage, Record<EmptyStateKind, Record<MomPersonality, EmptyStateCopy>>> = {
  en: {
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
  },
  es: {
    calendar: {
      sweet: { title: 'Sin planes hoy', message: 'Disfruta de esta paz rara. Yo vigilo cuando aparezcan planes.' },
      funny: { title: 'Sin planes hoy', message: 'Sospechosamente tranquilo. No lo asustemos.' },
      strict: { title: 'Sin planes hoy', message: 'Bien. Que siga así salvo que algo importe de verdad.' },
      minimal: { title: 'Sin planes hoy', message: 'Calendario libre.' },
    },
    'home-events': {
      sweet: { title: 'Aún no hay planes fijados', message: 'Añade un evento y lo mantendré a la vista.' },
      funny: { title: 'Aún no hay planes fijados', message: 'El tablero se está portando. Raro, pero bonito.' },
      strict: { title: 'Aún no hay planes fijados', message: 'Añade lo que tenga hora antes de que sea una carrera.' },
      minimal: { title: 'Aún no hay planes fijados', message: 'Añade un evento.' },
    },
    shopping: {
      sweet: { title: 'Sin lista de compra', message: 'Empieza por comida, cosas del cole o regalos de cumple.' },
      funny: { title: 'Sin lista de compra', message: 'Valiente. Aunque la leche no se recuerda sola.' },
      strict: { title: 'Sin lista de compra', message: 'Crea una antes de que desaparezcan los esenciales.' },
      minimal: { title: 'Sin lista de compra', message: 'Añade artículos.' },
    },
    'little-reminders': {
      sweet: { title: 'Sin notitas', message: 'Añade recordatorios pequeños para plantas, llamadas y cosas de la noche.' },
      funny: { title: 'Sin notitas', message: 'Nada pendiente. Sospechosamente tranquilo.' },
      strict: { title: 'Sin notitas', message: 'Añade las tareas pequeñas antes de que crezcan.' },
      minimal: { title: 'Sin notitas', message: 'Añade una nota.' },
    },
    reminders: {
      sweet: { title: 'Sin recordatorios', message: 'Nada pendiente. Me encanta esto para ti.' },
      funny: { title: 'Sin recordatorios', message: 'Nada pendiente. Sospechosamente tranquilo.' },
      strict: { title: 'Sin recordatorios', message: 'Añade recordatorios con fecha para lo que no puede escaparse.' },
      minimal: { title: 'Sin recordatorios', message: 'Sin recordatorios pendientes.' },
    },
    family: {
      sweet: { title: 'Sin notas familiares aún', message: 'Añade a tu gente y te ayudo a recordar lo importante.' },
      funny: { title: 'Sin notas familiares aún', message: 'Añade a tu gente. Los cumples aparecen sin avisar.' },
      strict: { title: 'Sin notas familiares aún', message: 'Añade datos familiares para no perder fechas importantes.' },
      minimal: { title: 'Sin notas familiares aún', message: 'Añade una persona.' },
    },
    birthdays: {
      sweet: { title: 'Sin cumpleaños guardados', message: 'Añade cumpleaños antes de que llegue el pánico de la tarta.' },
      funny: { title: 'Sin cumpleaños guardados', message: 'Sin alarmas de tarta aún. Eso suena peligroso.' },
      strict: { title: 'Sin cumpleaños guardados', message: 'Añade cumpleaños ahora para que los regalos no sean de última hora.' },
      minimal: { title: 'Sin cumpleaños guardados', message: 'Añade cumpleaños.' },
    },
  },
};

export const EmptyStateTemplateService = {
  get(kind: EmptyStateKind, personality: MomPersonality = 'sweet', language: AppLanguage = 'en'): EmptyStateCopy {
    return copy[language][kind][personality];
  },
};
