import type { MomPersonality, MomSuggestion } from '../../types';
import { AiProviderRegistry } from '../ai';

export const AiSuggestionService = {
  async suggestNextActions(suggestions: MomSuggestion[]): Promise<MomSuggestion[]> {
    return suggestions;
  },
  async rewriteWithTone(text: string, tone: MomPersonality): Promise<string> {
    return AiProviderRegistry.getActiveProvider().rewriteWithTone({ text, tone });
  },
};
