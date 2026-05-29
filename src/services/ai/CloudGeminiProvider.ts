import type { AiProvider, GenerateMomCheckInsightInput } from './AiProvider';
import type { MomInsight } from '../../types';

export class CloudGeminiProvider implements AiProvider {
  readonly id = 'cloud-gemini';
  readonly label = 'Cloud Gemini';

  async isAvailable() {
    return false;
  }

  async enhanceMomMessage(): Promise<string> {
    throw new Error('CloudGeminiProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generateDailySummary(): Promise<string> {
    throw new Error('CloudGeminiProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async rewriteWithTone(): Promise<string> {
    throw new Error('CloudGeminiProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generatePreparationNote(): Promise<string> {
    throw new Error('CloudGeminiProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generateRoutineMessage(): Promise<string> {
    throw new Error('CloudGeminiProvider is a placeholder. Cloud AI is not integrated yet.');
  }

  async generateMomCheckInsight(input: GenerateMomCheckInsightInput): Promise<MomInsight> {
    throw new Error(`CloudGeminiProvider is a placeholder. Cloud AI is not integrated yet. Input was not sent: ${input.insight.id}`);
  }
}
