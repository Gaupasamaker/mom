import type { MomInsight } from '../../types';
import { AiProviderRegistry } from '../ai';

export const AiMessageEnhancer = {
  async enhanceInsight(insight: MomInsight): Promise<MomInsight> {
    const message = await AiProviderRegistry.getActiveProvider().enhanceMomMessage({
      message: insight.message,
      tone: 'sweet',
      context: insight.categoryLabel,
    });

    return { ...insight, message };
  },
};
