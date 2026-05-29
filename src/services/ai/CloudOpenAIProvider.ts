import type { AiProvider, GenerateMomCheckInsightInput } from './AiProvider';
import type { MomInsight } from '../../types';

export class CloudOpenAIProvider implements AiProvider {
  readonly id = 'cloud-openai';
  readonly label = 'Cloud OpenAI';

  async isAvailable() {
    return false;
  }

  async enhanceMomMessage(): Promise<string> {
    throw new Error('CloudOpenAIProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generateDailySummary(): Promise<string> {
    throw new Error('CloudOpenAIProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async rewriteWithTone(): Promise<string> {
    throw new Error('CloudOpenAIProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generatePreparationNote(): Promise<string> {
    throw new Error('CloudOpenAIProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generateRoutineMessage(): Promise<string> {
    throw new Error('CloudOpenAIProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generateMomCheckInsight(input: GenerateMomCheckInsightInput): Promise<MomInsight> {
    throw new Error(`CloudOpenAIProvider is a placeholder. Cloud AI is not integrated yet. Input was not sent: ${input.insight.id}`);
  }
}
