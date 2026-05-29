import type { AiProvider, GenerateMomCheckInsightInput } from './AiProvider';
import type { MomInsight } from '../../types';

export class IOSFoundationModelsProvider implements AiProvider {
  readonly id = 'ios-foundation-models';
  readonly label = 'iOS Foundation Models';

  async isAvailable() {
    return false;
  }

  async enhanceMomMessage(): Promise<string> {
    throw new Error('IOSFoundationModelsProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generateDailySummary(): Promise<string> {
    throw new Error('IOSFoundationModelsProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async rewriteWithTone(): Promise<string> {
    throw new Error('IOSFoundationModelsProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generatePreparationNote(): Promise<string> {
    throw new Error('IOSFoundationModelsProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generateRoutineMessage(): Promise<string> {
    throw new Error('IOSFoundationModelsProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generateMomCheckInsight(input: GenerateMomCheckInsightInput): Promise<MomInsight> {
    throw new Error(`IOSFoundationModelsProvider is a placeholder. Native local AI is not integrated yet. Input was not sent: ${input.insight.id}`);
  }
}
