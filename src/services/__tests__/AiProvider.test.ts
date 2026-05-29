import { describe, expect, it } from 'vitest';

import { AiProviderFactory } from '../ai/AiProviderFactory';
import { AiService } from '../ai/AiService';
import { MockAiProvider } from '../ai/MockAiProvider';
import { TemplateAiProvider } from '../ai/TemplateAiProvider';
import type { DailySummary, MomInsight, Routine } from '../../types';

const insight: MomInsight = {
  id: 'prep-1',
  type: 'preparation',
  priority: 'medium',
  title: 'Take your umbrella',
  message: 'Rain is expected later today. Take your umbrella before leaving.',
  categoryLabel: 'Preparation',
};

const summary: DailySummary = {
  date: '2026-05-14',
  eventCountToday: 2,
  overdueReminderCount: 1,
  dueReminderCount: 1,
  upcomingBirthdayCount: 1,
  incompleteEssentialShoppingCount: 1,
  isBusyDay: false,
  topMessage: 'Good morning, sweetheart.',
  highlights: [],
};

const routine: Routine = {
  id: 'morning-2026-05-14',
  type: 'morning',
  title: 'Morning routine',
  message: "Today's prep.",
  tasks: [],
  generatedAt: '2026-05-14T08:00:00',
};

describe('AI provider abstraction', () => {
  it('keeps template behavior as the production default', async () => {
    const provider = new TemplateAiProvider();

    await expect(provider.enhanceMomMessage({ message: insight.message, tone: 'sweet' })).resolves.toBe(insight.message);
    await expect(provider.generateDailySummary({ summary, tone: 'minimal' })).resolves.toContain('2 events');
    await expect(provider.rewriteWithTone({ text: 'Take your umbrella.', tone: 'strict' })).resolves.toBe('Take your umbrella.');
    await expect(provider.generatePreparationNote({ taskTitle: 'Take your umbrella', taskMessage: 'Rain later.', tone: 'funny' })).resolves.toBe('Rain later.');
    await expect(provider.generateRoutineMessage({ routine, tone: 'minimal' })).resolves.toBe("Today's prep.");
    await expect(provider.generateMomCheckInsight({ insight, tone: 'sweet' })).resolves.toEqual(insight);
  });

  it('provides a mock provider for tests and dev flows', async () => {
    const provider = new MockAiProvider({
      enhanceMomMessage: 'mock enhanced',
      generateDailySummary: 'mock summary',
      rewriteWithTone: 'mock rewrite',
      generatePreparationNote: 'mock prep',
      generateRoutineMessage: 'mock routine',
      generateMomCheckInsight: { ...insight, message: 'mock insight' },
    });

    await expect(provider.enhanceMomMessage({ message: 'original', tone: 'sweet' })).resolves.toBe('mock enhanced');
    await expect(provider.generateDailySummary({ summary, tone: 'sweet' })).resolves.toBe('mock summary');
    await expect(provider.rewriteWithTone({ text: 'original', tone: 'sweet' })).resolves.toBe('mock rewrite');
    await expect(provider.generatePreparationNote({ taskTitle: 'Task', tone: 'sweet' })).resolves.toBe('mock prep');
    await expect(provider.generateRoutineMessage({ routine, tone: 'sweet' })).resolves.toBe('mock routine');
    await expect(provider.generateMomCheckInsight({ insight, tone: 'sweet' })).resolves.toMatchObject({ message: 'mock insight' });
  });

  it('selects TemplateAiProvider by default and safely falls back for unsupported modes', () => {
    expect(AiProviderFactory.create().id).toBe('template');
    expect(AiProviderFactory.create('template')).toBeInstanceOf(TemplateAiProvider);
    expect(AiProviderFactory.create('unsupported' as never).id).toBe('template');
    expect(AiProviderFactory.create('android_gemini_nano').id).toBe('template');
    expect(AiProviderFactory.create('cloud_gemini').id).toBe('template');
    expect(AiProviderFactory.create('cloud_openai').id).toBe('template');
  });

  it('exposes AiService as a template-first integration point', async () => {
    await expect(AiService.enhanceMomMessage({ message: 'Still templates.', tone: 'sweet' })).resolves.toBe('Still templates.');
    await expect(AiService.generateRoutineMessage({ routine, tone: 'minimal' })).resolves.toBe("Today's prep.");
  });
});
