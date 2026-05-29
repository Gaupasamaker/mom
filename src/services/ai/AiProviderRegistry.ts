import type { AiProvider } from './AiProvider';
import { TemplateAiProvider } from './TemplateAiProvider';

const defaultProvider = new TemplateAiProvider();

let activeProvider: AiProvider = defaultProvider;

export const AiProviderRegistry = {
  getDefaultProvider(): AiProvider {
    return defaultProvider;
  },

  getActiveProvider(): AiProvider {
    return activeProvider;
  },

  setActiveProvider(provider: AiProvider) {
    activeProvider = provider;
  },

  reset() {
    activeProvider = defaultProvider;
  },
};
