import { DailySummaryService } from './DailySummaryService';
import { MomTemplateService } from './MomTemplateService';
import { PreparationService } from './PreparationService';
import type { MomCheckInput, Routine, RoutineType } from '../types';

const tomorrowDate = (today: string) => {
  const [year, month, day] = today.split('-').map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const RoutineService = {
  generate(input: MomCheckInput, type: RoutineType): Routine {
    const allTasks = PreparationService.generate(input);
    DailySummaryService.create(input);
    const tomorrow = tomorrowDate(input.today);
    const tasks =
      type === 'morning'
        ? allTasks.filter((task) => !task.dueDate || task.dueDate.slice(0, 10) <= input.today).slice(0, 5)
        : allTasks
            .filter((task) => task.dueDate?.slice(0, 10) === tomorrow || task.sourceType === 'birthday' || task.sourceType === 'reminder')
            .slice(0, 5);
    const isEmpty = tasks.length === 0;

    return {
      id: `${type}-${input.today}`,
      type,
      title: type === 'morning' ? 'Morning routine' : 'Evening routine',
      message: MomTemplateService.buildRoutineMessage(input.userProfile.personality, type, isEmpty),
      tasks,
      generatedAt: `${input.today}T08:00:00`,
    };
  },
};
