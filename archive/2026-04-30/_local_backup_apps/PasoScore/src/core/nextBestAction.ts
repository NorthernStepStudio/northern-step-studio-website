import { t } from './i18n';
import {
  LocaleCode,
  NextBestAction,
  RoadmapStep,
  StepProgress,
  UserProfile
} from './types';
import { buildStepAvailabilityMap, stepStatusMap } from './roadmap';

export const getNextBestAction = (
  _profile: UserProfile,
  locale: LocaleCode,
  roadmap: RoadmapStep[],
  progress: StepProgress[]
): NextBestAction | null => {
  const progressMap = stepStatusMap(progress);
  const availabilityMap = buildStepAvailabilityMap(roadmap, progress);

  const available = roadmap
    .filter((step) => progressMap.get(step.id) !== 'done')
    .filter((step) => availabilityMap.get(step.id)?.unlocked)
    .sort((a, b) => a.sequenceMonth - b.sequenceMonth || b.priority - a.priority);

  const top = available[0];
  if (top) {
    return {
      stepId: top.id,
      reason: t(locale, 'next.reason.sequence'),
      confidence: 'high'
    };
  }

  const blockedByPrereq = roadmap
    .filter((step) => progressMap.get(step.id) !== 'done')
    .find((step) => availabilityMap.get(step.id)?.reason === 'prerequisite');

  if (blockedByPrereq) {
    return {
      stepId: blockedByPrereq.id,
      reason: t(locale, 'next.reason.prereq'),
      confidence: 'high'
    };
  }

  const blockedByMonth = roadmap
    .filter((step) => progressMap.get(step.id) !== 'done')
    .find((step) => availabilityMap.get(step.id)?.reason === 'month');

  if (blockedByMonth) {
    return {
      stepId: blockedByMonth.id,
      reason: t(locale, 'next.reason.month'),
      confidence: 'high'
    };
  }

  return null;
};
