import { insightCategoryLabel } from '../i18n';
import type { AppLanguage, DailySummary, MomInsight, MomInsightType, MomPersonality, Priority, RoutineType } from '../types';

type TemplateContext = {
  title: string;
  detail?: string;
  names?: string;
  daysUntil?: number;
  sourceId?: string;
};

const momNotes: Record<AppLanguage, Record<MomInsightType, Record<MomPersonality, string | undefined>>> = {
  en: {
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
  },
  es: {
    weather: {
      sweet: 'Mejor prevenir que acabar empapada.',
      funny: 'Los calcetines secos son un lujo pequeño.',
      strict: 'Déjalo junto a la puerta.',
      minimal: undefined,
    },
    birthday: {
      sweet: 'Un poco de planificación lo hace especial.',
      funny: 'La diplomacia de la tarta funciona.',
      strict: 'Elige la tarta hoy.',
      minimal: undefined,
    },
    'medical-prep': {
      sweet: 'Prepáralo esta noche y descansa tranquila.',
      funny: 'Tu yo de mañana lo agradecerá.',
      strict: 'Déjalo preparado antes de dormir.',
      minimal: undefined,
    },
    shopping: {
      sweet: 'Una compra rápida ahora salva la cena luego.',
      funny: 'Una nevera triste se puede evitar.',
      strict: 'Termina primero lo esencial.',
      minimal: undefined,
    },
    'busy-day': {
      sweet: 'Déjate un poquito de margen para respirar.',
      funny: 'Sin ir corriendo de un lado a otro, por favor.',
      strict: 'Añade tiempo de margen.',
      minimal: undefined,
    },
    routine: {
      sweet: 'Las cosas pequeñas también cuentan.',
      funny: 'Mini tarea, gran alivio.',
      strict: 'Hazlo hoy.',
      minimal: undefined,
    },
    preparation: {
      sweet: 'Un poco de preparación ayuda mucho.',
      funny: 'Tu yo del futuro ya está aplaudiendo.',
      strict: 'Hazlo antes de que sea urgente.',
      minimal: undefined,
    },
  },
};

export const MomTemplateService = {
  buildInsight(
    personality: MomPersonality,
    type: MomInsightType,
    priority: Priority,
    context: TemplateContext,
    language: AppLanguage = 'en',
  ): MomInsight {
    const id = `${type}-${context.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const message = messages[language][type](personality, context);

    return {
      id,
      type,
      priority,
      title: context.title,
      message,
      categoryLabel: insightCategoryLabel(language, type),
      momNote: momNotes[language][type][personality],
      sourceId: context.sourceId,
      daysUntil: context.daysUntil,
    };
  },
  buildDailySummaryMessage(personality: MomPersonality, summary: Omit<DailySummary, 'topMessage'>, language: AppLanguage = 'en'): string {
    const reminderCount = summary.overdueReminderCount + summary.dueReminderCount;
    if (language === 'es') {
      if (personality === 'funny') {
        return summary.isBusyDay
          ? 'Hoy viene con planes. Todavía no es caos, pero vamos a vigilarlo.'
          : `Hoy tienes ${summary.eventCountToday} plan${summary.eventCountToday === 1 ? '' : 'es'}. Manejable, con merienda.`;
      }
      if (personality === 'strict') {
        return `Tienes ${summary.eventCountToday} eventos y ${reminderCount} recordatorios pendientes hoy. No lo dejemos para luego.`;
      }
      if (personality === 'minimal') {
        return `${summary.eventCountToday} eventos. ${reminderCount} recordatorios. ${summary.upcomingBirthdayCount} cumple cerca.`;
      }

      return `Buenos días, cariño. Tienes ${summary.eventCountToday} cosa${summary.eventCountToday === 1 ? '' : 's'} hoy y ${summary.upcomingBirthdayCount} cumple${summary.upcomingBirthdayCount === 1 ? '' : 's'} cerca. Lo mantenemos bajo control.`;
    }

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
  buildRoutineMessage(personality: MomPersonality, type: RoutineType, isEmpty: boolean, language: AppLanguage = 'en'): string {
    if (language === 'es') {
      if (isEmpty) {
        if (type === 'morning') {
          if (personality === 'minimal') return 'Nada urgente.';
          if (personality === 'strict') return 'Nada urgente que preparar. Mantenlo así.';
          return 'Nada urgente que preparar. Sospechosamente tranquilo.';
        }

        if (personality === 'minimal') return 'Mañana ligero.';
        if (personality === 'strict') return 'Mañana parece ligero. Deja lo básico preparado.';
        return 'Mañana parece ligero. Disfruta de esta calma rara.';
      }

      if (type === 'morning') {
        if (personality === 'funny') return 'Hoy viene con planes. Evitemos el caos antes del desayuno.';
        if (personality === 'strict') return 'Tienes cosas que hacer. Vamos a organizarnos.';
        if (personality === 'minimal') return 'Preparación de hoy.';
        return 'Buenos días, cariño. Vamos a quitar de en medio las cosas importantes.';
      }

      if (personality === 'funny') return 'Tu yo del futuro merece un poco de preparación. Tu yo actual puede con ello.';
      if (personality === 'strict') return 'Prepara esta noche. No lo dejes todo para mañana.';
      if (personality === 'minimal') return 'Preparación de mañana.';
      return 'Antes de descansar, vamos a hacer que mañana sea un poco más fácil.';
    }

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

const messages: Record<AppLanguage, Record<MomInsightType, (personality: MomPersonality, context: TemplateContext) => string>> = {
  en: {
    weather: (personality, context) => context.detail ?? 'Rain is expected later. Take your umbrella before leaving.',
    birthday: (personality, context) =>
      `${context.detail ?? 'Someone special'} is in ${context.daysUntil} days. You still have time to plan something nice.`,
    'medical-prep': (personality, context) =>
      `${context.detail ?? 'Your appointment is tomorrow.'} Prepare your health card tonight.`,
    shopping: (personality, context) => `Your grocery list still needs ${context.names}.`,
    'busy-day': (personality, context) =>
      `${context.detail ?? 'Today is packed'}. Put a little breathing room between things.`,
    routine: (personality, context) => context.detail ?? 'One small routine is waiting for you.',
    preparation: (personality, context) => context.detail ?? 'One small preparation task is ready.',
  },
  es: {
    weather: (personality, context) => context.detail ?? 'Se espera lluvia más tarde. Coge el paraguas antes de salir.',
    birthday: (personality, context) =>
      `${context.detail ?? 'Alguien especial'} es en ${context.daysUntil} días. Aún estás a tiempo de preparar algo bonito.`,
    'medical-prep': (personality, context) =>
      `${context.detail ?? 'Tu cita es mañana.'} Prepara la tarjeta sanitaria esta noche.`,
    shopping: (personality, context) => `En la lista de compra aún falta: ${context.names}.`,
    'busy-day': (personality, context) =>
      `${context.detail ?? 'Hoy viene cargado'}. Deja un poquito de margen entre planes.`,
    routine: (personality, context) => context.detail ?? 'Hay una pequeña rutina esperándote.',
    preparation: (personality, context) => context.detail ?? 'Hay una pequeña tarea de preparación lista.',
  },
};
