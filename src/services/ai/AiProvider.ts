import type { DailySummary, MomInsight, MomPersonality, Routine } from '../../types';

export type EnhanceMomMessageInput = {
  message: string;
  tone: MomPersonality;
  context?: string;
};

export type GenerateDailySummaryInput = {
  summary: DailySummary;
  tone: MomPersonality;
};

export type RewriteWithToneInput = {
  text: string;
  tone: MomPersonality;
};

export type GeneratePreparationNoteInput = {
  taskTitle: string;
  taskMessage?: string;
  tone: MomPersonality;
};

export type GenerateRoutineMessageInput = {
  routine: Pick<Routine, 'type' | 'message' | 'tasks'>;
  tone: MomPersonality;
};

export type GenerateMomCheckInsightInput = {
  insight: MomInsight;
  tone: MomPersonality;
};

export interface AiProvider {
  readonly id: string;
  readonly label: string;
  readonly isAvailable: () => Promise<boolean>;
  enhanceMomMessage(input: EnhanceMomMessageInput): Promise<string>;
  generateDailySummary(input: GenerateDailySummaryInput): Promise<string>;
  rewriteWithTone(input: RewriteWithToneInput): Promise<string>;
  generatePreparationNote(input: GeneratePreparationNoteInput): Promise<string>;
  generateRoutineMessage(input: GenerateRoutineMessageInput): Promise<string>;
  generateMomCheckInsight(input: GenerateMomCheckInsightInput): Promise<MomInsight>;
}
