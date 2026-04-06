import { DECISION_PATHS, ROADMAP_STEPS } from './data';
import { resolvePathCodeFromDecisionTree } from './decisionTree';
import { DecisionPath, DecisionPathCode, RoadmapStep, StepProgress, StepStatus, UserProfile } from './types';

export interface StepAvailability {
  unlocked: boolean;
  reason: 'month' | 'prerequisite' | null;
  missingPrerequisiteId?: string;
}

const sortRoadmap = (steps: RoadmapStep[]): RoadmapStep[] => {
  return [...steps].sort((a, b) => a.sequenceMonth - b.sequenceMonth || b.priority - a.priority);
};

export const resolveDecisionPathCode = (profile: UserProfile): DecisionPathCode => {
  return resolvePathCodeFromDecisionTree(profile);
};

export const resolveDecisionPath = (profile: UserProfile): DecisionPath => {
  const code = resolveDecisionPathCode(profile);
  const matched = DECISION_PATHS.find((path) => path.code === code);
  if (matched) {
    return matched;
  }

  return {
    code: 'A',
    stage: 'no_credit',
    titleKey: 'path.A.title',
    descriptionKey: 'path.A.desc'
  };
};

export const buildRoadmap = (profile: UserProfile): RoadmapStep[] => {
  const pathCode = resolveDecisionPathCode(profile);
  return sortRoadmap(ROADMAP_STEPS.filter((step) => step.pathCode === pathCode));
};

export const seedStepProgress = (steps: RoadmapStep[]): StepProgress[] => {
  return steps.map((step) => ({
    stepId: step.id,
    status: 'todo'
  }));
};

export const reconcileStepProgress = (
  current: StepProgress[],
  steps: RoadmapStep[]
): StepProgress[] => {
  const map = new Map(current.map((entry) => [entry.stepId, entry]));

  return steps.map((step) => {
    const existing = map.get(step.id);
    if (existing) {
      return existing;
    }

    return { stepId: step.id, status: 'todo' };
  });
};

const findMissingPrerequisiteId = (
  step: RoadmapStep,
  progressMap: Map<string, StepStatus>
): string | undefined => {
  return step.prerequisiteIds.find((id) => progressMap.get(id) !== 'done');
};

const isLockedByMonth = (
  step: RoadmapStep,
  orderedSteps: RoadmapStep[],
  progressMap: Map<string, StepStatus>
): boolean => {
  return orderedSteps.some(
    (candidate) => candidate.sequenceMonth < step.sequenceMonth && progressMap.get(candidate.id) !== 'done'
  );
};

export const getStepAvailability = (
  steps: RoadmapStep[],
  progress: StepProgress[],
  stepId: string
): StepAvailability => {
  const orderedSteps = sortRoadmap(steps);
  const step = orderedSteps.find((item) => item.id === stepId);
  if (!step) {
    return {
      unlocked: false,
      reason: 'month'
    };
  }

  const progressMap = stepStatusMap(progress);
  if (stepCompleted(progressMap, step.id)) {
    return {
      unlocked: true,
      reason: null
    };
  }

  const missingPrerequisiteId = findMissingPrerequisiteId(step, progressMap);
  if (missingPrerequisiteId) {
    return {
      unlocked: false,
      reason: 'prerequisite',
      missingPrerequisiteId
    };
  }

  if (isLockedByMonth(step, orderedSteps, progressMap)) {
    return {
      unlocked: false,
      reason: 'month'
    };
  }

  return {
    unlocked: true,
    reason: null
  };
};

export const buildStepAvailabilityMap = (
  steps: RoadmapStep[],
  progress: StepProgress[]
): Map<string, StepAvailability> => {
  const availabilityMap = new Map<string, StepAvailability>();
  steps.forEach((step) => {
    availabilityMap.set(step.id, getStepAvailability(steps, progress, step.id));
  });
  return availabilityMap;
};

export const updateStepStatus = (
  current: StepProgress[],
  steps: RoadmapStep[],
  stepId: string,
  status: StepStatus
): StepProgress[] => {
  if (status === 'in_progress' || status === 'done') {
    const availability = getStepAvailability(steps, current, stepId);
    if (!availability.unlocked) {
      return current;
    }
  }

  const now = new Date().toISOString();

  return current.map((entry) => {
    if (entry.stepId !== stepId) {
      return entry;
    }

    if (status === 'in_progress') {
      return {
        ...entry,
        status,
        startedAt: entry.startedAt ?? now
      };
    }

    if (status === 'done') {
      return {
        ...entry,
        status,
        startedAt: entry.startedAt ?? now,
        completedAt: now
      };
    }

    return {
      ...entry,
      status
    };
  });
};

export const stepStatusMap = (progress: StepProgress[]): Map<string, StepStatus> => {
  return new Map(progress.map((entry) => [entry.stepId, entry.status]));
};

export const stepCompleted = (progressMap: Map<string, StepStatus>, stepId: string): boolean => {
  return progressMap.get(stepId) === 'done';
};
