import { describe, expect, it } from 'vitest';

import { MomTemplateService } from '../MomTemplateService';

describe('MomTemplateService routine copy', () => {
  it('builds tone-based morning and evening routine messages', () => {
    expect(MomTemplateService.buildRoutineMessage('sweet', 'morning', false)).toContain('Good morning');
    expect(MomTemplateService.buildRoutineMessage('funny', 'evening', false)).toContain('Future you');
    expect(MomTemplateService.buildRoutineMessage('strict', 'evening', false)).toContain('Prepare tonight');
    expect(MomTemplateService.buildRoutineMessage('minimal', 'morning', false)).toBe("Today's prep.");
  });

  it('builds warm empty routine messages', () => {
    expect(MomTemplateService.buildRoutineMessage('funny', 'morning', true)).toContain('Suspiciously peaceful');
    expect(MomTemplateService.buildRoutineMessage('sweet', 'evening', true)).toContain('rare calm');
  });
});
