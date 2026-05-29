import { momCheckInput } from '../data/mockData';
import type { MomCheckInput, MomCheckResult } from '../types';
import { MomRulesEngine } from './MomRulesEngine';

export const MomCheckService = {
  run(input: MomCheckInput = momCheckInput): MomCheckResult {
    return MomRulesEngine.evaluate(input);
  },
};
