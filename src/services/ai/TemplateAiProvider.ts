import { MomTemplateService } from '../MomTemplateService';
import type {
  AiProvider,
  EnhanceMomMessageInput,
  GenerateDailySummaryInput,
  GenerateMomCheckInsightInput,
  GeneratePreparationNoteInput,
  GenerateRoutineMessageInput,
  RewriteWithToneInput,
} from './AiProvider';

export class TemplateAiProvider implements AiProvider {
  readonly id = 'template';
  readonly label = 'Template rules';

  async isAvailable() {
    return true;
  }

  async enhanceMomMessage(input: EnhanceMomMessageInput) {
    return input.message;
  }

  async generateDailySummary(input: GenerateDailySummaryInput) {
    const { topMessage, ...summary } = input.summary;
    return MomTemplateService.buildDailySummaryMessage(input.tone, summary);
  }

  async rewriteWithTone(input: RewriteWithToneInput) {
    return input.text;
  }

  async generatePreparationNote(input: GeneratePreparationNoteInput) {
    return input.taskMessage ?? input.taskTitle;
  }

  async generateRoutineMessage(input: GenerateRoutineMessageInput) {
    return input.routine.message;
  }

  async generateMomCheckInsight(input: GenerateMomCheckInsightInput) {
    return input.insight;
  }
}
