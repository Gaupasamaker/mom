import type { DailySummary, MomCheckResult, MomPersonality } from '../../types';
import { AiProviderRegistry } from '../ai';

export const AiDailySummaryService = {
  async enhanceSummary(result: MomCheckResult): Promise<MomCheckResult> {
    return result;
  },
  async generateDailySummary(summary: DailySummary, tone: MomPersonality): Promise<string> {
    return AiProviderRegistry.getActiveProvider().generateDailySummary({ summary, tone });
  },
};
