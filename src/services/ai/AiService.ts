import type {
  EnhanceMomMessageInput,
  GenerateDailySummaryInput,
  GenerateMomCheckInsightInput,
  GeneratePreparationNoteInput,
  GenerateRoutineMessageInput,
  RewriteWithToneInput,
} from './AiProvider';
import { AiProviderFactory, type AiProviderMode } from './AiProviderFactory';

const productionMode: AiProviderMode = 'template';

export const AiService = {
  providerMode: productionMode,

  getProvider() {
    return AiProviderFactory.create(this.providerMode);
  },

  enhanceMomMessage(input: EnhanceMomMessageInput) {
    return this.getProvider().enhanceMomMessage(input);
  },

  generateDailySummary(input: GenerateDailySummaryInput) {
    return this.getProvider().generateDailySummary(input);
  },

  rewriteWithTone(input: RewriteWithToneInput) {
    return this.getProvider().rewriteWithTone(input);
  },

  generatePreparationNote(input: GeneratePreparationNoteInput) {
    return this.getProvider().generatePreparationNote(input);
  },

  generateRoutineMessage(input: GenerateRoutineMessageInput) {
    return this.getProvider().generateRoutineMessage(input);
  },

  generateMomCheckInsight(input: GenerateMomCheckInsightInput) {
    return this.getProvider().generateMomCheckInsight(input);
  },
};
