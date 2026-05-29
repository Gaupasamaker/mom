import type { MomInsight } from '../../types';

export const NotificationService = {
  async scheduleInsight(_insight: MomInsight) {
    return { scheduled: false, mode: 'mock' as const };
  },
};
