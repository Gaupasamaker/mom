import type { AiProvider, GenerateMomCheckInsightInput } from './AiProvider';
import type { MomInsight } from '../../types';

// Future Android integration will likely require a native Android/Kotlin bridge,
// Expo prebuild or Expo Dev Client, AICore / ML Kit GenAI availability checks,
// runtime fallback when local AI is unavailable, and Android-only gating.
export class AndroidGeminiNanoProvider implements AiProvider {
  readonly id = 'android-gemini-nano';
  readonly label = 'Android Gemini Nano';

  async isAvailable() {
    return false;
  }

  async enhanceMomMessage(): Promise<string> {
    throw new Error('AndroidGeminiNanoProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generateDailySummary(): Promise<string> {
    throw new Error('AndroidGeminiNanoProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async rewriteWithTone(): Promise<string> {
    throw new Error('AndroidGeminiNanoProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generatePreparationNote(): Promise<string> {
    throw new Error('AndroidGeminiNanoProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generateRoutineMessage(): Promise<string> {
    throw new Error('AndroidGeminiNanoProvider is a placeholder. Native local AI is not integrated yet.');
  }

  async generateMomCheckInsight(input: GenerateMomCheckInsightInput): Promise<MomInsight> {
    throw new Error(`AndroidGeminiNanoProvider is a placeholder. Native local AI is not integrated yet. Input was not sent: ${input.insight.id}`);
  }
}
