import { EDUCATION_MODULES } from './data';
import { EducationModule, EducationProgress } from './types';

export const getEducationModules = (): EducationModule[] => {
  return EDUCATION_MODULES;
};

export const seedEducationProgress = (modules: EducationModule[]): EducationProgress[] => {
  return modules.map((module) => ({
    moduleId: module.id,
    completed: false
  }));
};

export const reconcileEducationProgress = (
  current: EducationProgress[],
  modules: EducationModule[]
): EducationProgress[] => {
  const map = new Map(current.map((item) => [item.moduleId, item]));
  return modules.map((module) => {
    const existing = map.get(module.id);
    if (existing) {
      return existing;
    }

    return {
      moduleId: module.id,
      completed: false
    };
  });
};

export const setModuleComplete = (
  current: EducationProgress[],
  moduleId: string,
  completed: boolean,
  modules: EducationModule[]
): EducationProgress[] => {
  const targetIndex = modules.findIndex((module) => module.id === moduleId);
  if (targetIndex < 0) {
    return current;
  }

  const previousModuleId = targetIndex > 0 ? modules[targetIndex - 1]?.id : null;
  const previousCompleted = previousModuleId
    ? current.find((entry) => entry.moduleId === previousModuleId)?.completed ?? false
    : true;
  const isLocked = completed && !previousCompleted;

  if (isLocked) {
    return current;
  }

  if (!completed) {
    const moduleIdsToReset = new Set(modules.slice(targetIndex).map((module) => module.id));
    return current.map((entry) => {
      if (!moduleIdsToReset.has(entry.moduleId)) {
        return entry;
      }

      return {
        moduleId: entry.moduleId,
        completed: false
      };
    });
  }

  const now = new Date().toISOString();

  return current.map((entry) => {
    if (entry.moduleId !== moduleId) {
      return entry;
    }

    if (!completed) {
      return { moduleId, completed: false };
    }

    return {
      moduleId,
      completed,
      completedAt: now
    };
  });
};

export const isModuleLockedByProgress = (
  moduleId: string,
  progress: EducationProgress[],
  modules: EducationModule[]
): boolean => {
  const moduleIndex = modules.findIndex((module) => module.id === moduleId);
  if (moduleIndex <= 0) {
    return false;
  }

  const previousModuleId = modules[moduleIndex - 1]?.id;
  if (!previousModuleId) {
    return false;
  }

  const previousCompleted = progress.find((entry) => entry.moduleId === previousModuleId)?.completed ?? false;
  return !previousCompleted;
};
