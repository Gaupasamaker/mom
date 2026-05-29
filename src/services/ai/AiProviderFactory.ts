import type { AiProvider } from './AiProvider';
import { MockAiProvider } from './MockAiProvider';
import { TemplateAiProvider } from './TemplateAiProvider';

export type AiProviderMode =
  | 'template'
  | 'mock'
  | 'android_gemini_nano'
  | 'cloud_gemini'
  | 'cloud_openai';

const templateProvider = new TemplateAiProvider();

export const AiProviderFactory = {
  create(mode: AiProviderMode = 'template'): AiProvider {
    if (mode === 'template') {
      return templateProvider;
    }

    if (mode === 'mock') {
      return new MockAiProvider();
    }

    return templateProvider;
  },
};
