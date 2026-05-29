import type {
  AiProvider,
  EnhanceMomMessageInput,
  GenerateDailySummaryInput,
  GenerateMomCheckInsightInput,
  GeneratePreparationNoteInput,
  GenerateRoutineMessageInput,
  RewriteWithToneInput,
} from './AiProvider';
import type { MomInsight } from '../../types';

type MockResponses = Partial<{
  enhanceMomMessage: string;
  generateDailySummary: string;
  rewriteWithTone: string;
  generatePreparationNote: string;
  generateRoutineMessage: string;
  generateMomCheckInsight: MomInsight;
}>;

export class MockAiProvider implements AiProvider {
  readonly id = 'mock';
  readonly label = 'Mock AI provider';

  constructor(private readonly responses: MockResponses = {}) {}

  async isAvailable() {
    return true;
  }

  async enhanceMomMessage(input: EnhanceMomMessageInput) {
    return this.responses.enhanceMomMessage ?? input.message;
  }

  async generateDailySummary(input: GenerateDailySummaryInput) {
    return this.responses.generateDailySummary ?? input.summary.topMessage;
  }

  async rewriteWithTone(input: RewriteWithToneInput) {
    return this.responses.rewriteWithTone ?? input.text;
  }

  async generatePreparationNote(input: GeneratePreparationNoteInput) {
    return this.responses.generatePreparationNote ?? input.taskMessage ?? input.taskTitle;
  }

  async generateRoutineMessage(input: GenerateRoutineMessageInput) {
    return this.responses.generateRoutineMessage ?? input.routine.message;
  }

  async generateMomCheckInsight(input: GenerateMomCheckInsightInput) {
    return this.responses.generateMomCheckInsight ?? input.insight;
  }
}
